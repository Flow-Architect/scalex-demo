"""ScaleX-isolated Hermes CLI adapter."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from ..config import REPO_ROOT, Settings, get_settings, resolve_repo_path


COMMAND_SAFETY_SUMMARY = (
    "Hermes is invoked with an argument list, not a shell; HERMES_HOME is set "
    "to the configured ScaleX-isolated home; the ScaleX operator skill is "
    "preloaded with --skills; tool access is constrained with --toolsets; "
    "--ignore-rules and -z/--oneshot are used; stdout and stderr are captured, "
    "sanitized, and truncated."
)

NEMOHERMES_SAFETY_SUMMARY = (
    "NemoHermes is invoked through a local OpenAI-compatible chat/completions API; "
    "only sanitized endpoint host/path, runtime, model, sandbox, provider, upstream model, "
    "status, duration, and error class are recorded. Credential headers and raw provider "
    "payloads are never recorded."
)


@dataclass(frozen=True)
class HermesResult:
    runtime: str
    mode: str
    used_real_hermes: bool
    provider: str
    model: str
    skill_name: str | None
    toolsets_used: list[str]
    stdout: str
    stderr: str
    returncode: int | None
    error: str | None
    failure_reason: str | None
    duration_ms: int
    command_safety_summary: str
    runtime_status: str = "pending"
    api_base_url: str | None = None
    api_endpoint: str | None = None
    sandbox_name: str | None = None
    upstream_provider: str | None = None
    upstream_model: str | None = None
    error_class: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None and self.returncode == 0

    def metadata(self) -> dict:
        payload = asdict(self)
        payload.pop("stdout", None)
        payload.pop("stderr", None)
        payload["ok"] = self.ok
        return payload


def run_hermes_oneshot(prompt: str, settings: Settings | None = None) -> HermesResult:
    settings = settings or get_settings()
    started_at = time.monotonic()

    if settings.hermes_test_mode:
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            stderr="",
            returncode=0,
            error=None,
            failure_reason=None,
            command_safety_summary=(
                "HERMES_TEST_MODE=true; the Hermes subprocess was intentionally not invoked."
            ),
        )

    if settings.hermes_runtime == "nemoclaw":
        return _run_nemohermes_chat_completion(prompt, settings, started_at)

    validation_error = _validate_product_settings(settings)
    if validation_error is not None:
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            stderr="",
            returncode=None,
            error=validation_error,
            failure_reason=validation_error,
        )

    env = _hermes_environment(settings)
    skill_error = _ensure_skill_available(settings)
    if skill_error is not None:
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            stderr="",
            returncode=None,
            error=skill_error,
            failure_reason=skill_error,
        )

    help_result = _load_cli_help(settings, env)
    if help_result.error is not None:
        return help_result

    command, command_error = _build_command(settings, prompt, help_result.stdout)
    if command_error is not None:
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            stderr="",
            returncode=None,
            error=command_error,
            failure_reason=command_error,
        )

    try:
        completed = subprocess.run(
            command,
            cwd=str(REPO_ROOT),
            env=env,
            capture_output=True,
            text=True,
            timeout=max(settings.hermes_timeout_seconds, 1),
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        failure = f"Hermes timed out after {settings.hermes_timeout_seconds} seconds."
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=True,
            stdout=_clean_output(exc.stdout, settings),
            stderr=_clean_output(exc.stderr, settings),
            returncode=None,
            error=failure,
            failure_reason=failure,
        )
    except OSError as exc:
        failure = f"Hermes CLI could not be executed: {sanitize_text(str(exc))}"
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            stderr="",
            returncode=None,
            error=failure,
            failure_reason=failure,
        )

    stdout = _clean_output(completed.stdout, settings)
    stderr = _clean_output(completed.stderr, settings)
    failure_reason = None
    if completed.returncode != 0:
        detail = stderr or stdout or "Hermes exited without diagnostic output."
        failure_reason = f"Hermes exited with code {completed.returncode}: {detail}"
    else:
        failure_reason = _stdout_failure(stdout)

    return _result(
        settings=settings,
        started_at=started_at,
        used_real_hermes=True,
        stdout=stdout,
        stderr=stderr,
        returncode=completed.returncode,
        error=failure_reason,
        failure_reason=failure_reason,
    )


def _run_nemohermes_chat_completion(
    prompt: str,
    settings: Settings,
    started_at: float,
) -> HermesResult:
    endpoint, endpoint_error = _nemohermes_endpoint(settings)
    if endpoint_error is not None:
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=endpoint_error,
            failure_reason=endpoint_error,
            runtime_status="fail_closed",
            error_class="configuration_error",
        )

    request_payload = {
        "model": settings.hermes_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
        "stream": False,
    }
    body = json.dumps(request_payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {settings.hermes_api_key or 'local'}",
        "Content-Type": "application/json",
    }
    request = Request(endpoint, data=body, headers=headers, method="POST")

    try:
        with urlopen(request, timeout=max(settings.hermes_timeout_seconds, 1)) as response:
            status_code = int(getattr(response, "status", 200) or 200)
            response_body = response.read()
    except HTTPError as exc:
        failure = f"NemoHermes API HTTP error: HTTP {exc.code}"
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=failure,
            failure_reason=failure,
            runtime_status="fail_closed",
            error_class="http_error",
            returncode=exc.code,
        )
    except (TimeoutError, socket.timeout) as exc:
        failure = f"NemoHermes API timed out after {settings.hermes_timeout_seconds} seconds."
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=failure,
            failure_reason=failure,
            runtime_status="fail_closed",
            error_class=type(exc).__name__,
        )
    except URLError as exc:
        reason = sanitize_text(getattr(exc, "reason", exc))
        failure = f"NemoHermes API unavailable: {reason}"
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=failure,
            failure_reason=failure,
            runtime_status="fail_closed",
            error_class=type(exc).__name__,
        )
    except OSError as exc:
        failure = f"NemoHermes API could not be reached: {sanitize_text(str(exc))}"
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=failure,
            failure_reason=failure,
            runtime_status="fail_closed",
            error_class=type(exc).__name__,
        )

    if status_code < 200 or status_code >= 300:
        failure = f"NemoHermes API HTTP error: HTTP {status_code}"
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=failure,
            failure_reason=failure,
            runtime_status="fail_closed",
            error_class="http_error",
            returncode=status_code,
        )

    content, parse_error = _extract_nemohermes_message_content(response_body)
    if parse_error is not None:
        return _nemohermes_result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            error=parse_error,
            failure_reason=parse_error,
            runtime_status="fail_closed",
            error_class="malformed_response",
            returncode=status_code,
        )

    return _nemohermes_result(
        settings=settings,
        started_at=started_at,
        used_real_hermes=True,
        stdout=_clean_output(content or "", settings),
        error=None,
        failure_reason=None,
        runtime_status="available",
        error_class=None,
        returncode=0,
    )


def _nemohermes_endpoint(settings: Settings) -> tuple[str, str | None]:
    base_url = settings.hermes_api_base_url.strip()
    if not base_url:
        return "", "HERMES_API_BASE_URL is required when HERMES_RUNTIME=nemoclaw."
    parsed = urlparse(base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return "", "HERMES_API_BASE_URL must be an http(s) URL."
    endpoint = urljoin(base_url.rstrip("/") + "/", "chat/completions")
    return endpoint, None


def _extract_nemohermes_message_content(response_body: bytes) -> tuple[str | None, str | None]:
    try:
        parsed = json.loads(response_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None, "NemoHermes API returned malformed JSON."
    if not isinstance(parsed, dict):
        return None, "NemoHermes API response must be a JSON object."
    choices = parsed.get("choices")
    if not isinstance(choices, list) or not choices:
        return None, "NemoHermes API response did not include choices."
    first_choice = choices[0]
    if not isinstance(first_choice, dict):
        return None, "NemoHermes API first choice was malformed."
    message = first_choice.get("message")
    if not isinstance(message, dict):
        return None, "NemoHermes API first choice did not include a message."
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        return None, "NemoHermes API message content was empty."
    return content, None


def sanitize_text(value: object) -> str:
    text = "" if value is None else str(value)
    secret_patterns = [
        (r"sk_" r"live_[A-Za-z0-9_\-]+", "sk_" "live_REDACTED"),
        (r"sk_test_[A-Za-z0-9_\-]+", "sk_test_REDACTED"),
        (r"sk-proj-[A-Za-z0-9_\-]+", "sk-proj_REDACTED"),
        (r"whsec_[A-Za-z0-9_\-]+", "whsec_REDACTED"),
        (r"nvapi-[A-Za-z0-9_\-]+", "nvapi_REDACTED"),
        (r"(OPENAI_API_KEY=)[^\s]+", r"\1REDACTED"),
        (r"(HERMES_API_KEY=)[^\s]+", r"\1REDACTED"),
        (r"(NVIDIA_API_KEY=)[^\s]+", r"\1REDACTED"),
        (r"(OPENROUTER_API_KEY=)[^\s]+", r"\1REDACTED"),
        (r"(COMPATIBLE_API_KEY=)[^\s]+", r"\1REDACTED"),
        (r"(Authorization:\s*Bearer\s+)[^\s]+", r"\1REDACTED"),
    ]
    sanitized = text
    for pattern, replacement in secret_patterns:
        sanitized = re.sub(pattern, replacement, sanitized)
    return sanitized


def _validate_product_settings(settings: Settings) -> str | None:
    if settings.hermes_mode != "isolated_cli":
        return "HERMES_MODE must be isolated_cli for product-mode ScaleX runs."
    if not settings.hermes_require_real:
        return "HERMES_REQUIRE_REAL must be true unless HERMES_TEST_MODE=true."
    if not settings.hermes_cli_path:
        return "HERMES_CLI_PATH is not configured."
    if not Path(settings.hermes_cli_path).exists():
        return f"Configured HERMES_CLI_PATH does not exist: {settings.hermes_cli_path}"
    if not settings.hermes_home:
        return "HERMES_HOME is not configured."
    if not Path(settings.hermes_home).exists():
        return f"Configured HERMES_HOME does not exist: {settings.hermes_home}"
    if not settings.hermes_skill_name:
        return "HERMES_SKILL_NAME is required for the ScaleX Hermes product path."
    return None


def _load_cli_help(settings: Settings, env: dict[str, str]) -> HermesResult:
    started_at = time.monotonic()
    try:
        completed = subprocess.run(
            [settings.hermes_cli_path, "--help"],
            cwd=str(REPO_ROOT),
            env=env,
            capture_output=True,
            text=True,
            timeout=min(max(settings.hermes_timeout_seconds, 1), 10),
            check=False,
        )
    except (subprocess.TimeoutExpired, OSError) as exc:
        failure = f"Hermes CLI help could not be inspected: {sanitize_text(str(exc))}"
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout="",
            stderr="",
            returncode=None,
            error=failure,
            failure_reason=failure,
        )

    stdout = _clean_output(completed.stdout, settings)
    stderr = _clean_output(completed.stderr, settings)
    if completed.returncode != 0:
        detail = stderr or stdout or "Hermes help returned no diagnostic output."
        failure = f"Hermes CLI help exited with code {completed.returncode}: {detail}"
        return _result(
            settings=settings,
            started_at=started_at,
            used_real_hermes=False,
            stdout=stdout,
            stderr=stderr,
            returncode=completed.returncode,
            error=failure,
            failure_reason=failure,
        )

    return _result(
        settings=settings,
        started_at=started_at,
        used_real_hermes=False,
        stdout=stdout,
        stderr=stderr,
        returncode=0,
        error=None,
        failure_reason=None,
    )


def _build_command(settings: Settings, prompt: str, help_text: str) -> tuple[list[str], str | None]:
    command = [settings.hermes_cli_path, "--ignore-rules"]

    toolsets = _toolsets(settings)
    if toolsets:
        if "--toolsets" not in help_text and "-t TOOLSETS" not in help_text:
            return [], "Configured HERMES_TOOLSETS, but this Hermes CLI does not support --toolsets."
        command.extend(["--toolsets", ",".join(toolsets)])

    if settings.hermes_skill_name:
        if "--skills" not in help_text:
            return [], "Configured HERMES_SKILL_NAME, but this Hermes CLI does not support --skills."
        command.extend(["--skills", settings.hermes_skill_name])

    if settings.hermes_provider:
        if "--provider" not in help_text:
            return [], "Configured HERMES_PROVIDER, but this Hermes CLI does not support --provider."
        command.extend(["--provider", settings.hermes_provider])

    if settings.hermes_model:
        if "-m MODEL" not in help_text and "--model" not in help_text:
            return [], "Configured HERMES_MODEL, but this Hermes CLI does not support -m/--model."
        command.extend(["-m", settings.hermes_model])

    if "-z PROMPT" not in help_text and "--oneshot" not in help_text:
        return [], "This Hermes CLI does not support -z/--oneshot."

    command.extend(["-z", prompt])
    return command, None


def _hermes_environment(settings: Settings) -> dict[str, str]:
    env = os.environ.copy()
    env["HERMES_HOME"] = settings.hermes_home
    return env


def _ensure_skill_available(settings: Settings) -> str | None:
    skill_name = settings.hermes_skill_name.strip()
    source_path = settings.hermes_skill_source_path.strip()
    destination = Path(settings.hermes_home) / "skills" / skill_name
    destination_skill = destination / "SKILL.md"

    if not source_path:
        if destination_skill.exists():
            return None
        return f"Hermes skill is not installed in isolated HERMES_HOME: {skill_name}"

    source = resolve_repo_path(source_path)
    source_skill = source / "SKILL.md"
    if not source_skill.exists():
        return f"Configured HERMES_SKILL_SOURCE_PATH does not contain SKILL.md: {source}"

    if destination_skill.exists() and destination_skill.read_text(encoding="utf-8") == source_skill.read_text(encoding="utf-8"):
        return None

    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.is_symlink():
            destination.unlink()
        elif destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(source, destination)
    except OSError as exc:
        return (
            "Could not sync ScaleX Hermes skill into isolated HERMES_HOME. "
            f"Source: {source}. Destination: {destination}. Error: {sanitize_text(str(exc))}"
        )
    return None


def _clean_output(value: object, settings: Settings) -> str:
    text = sanitize_text(value)
    max_chars = max(settings.hermes_max_output_chars, 1)
    if len(text) <= max_chars:
        return text
    return f"{text[:max_chars]}\n[truncated to {max_chars} chars]"


def _stdout_failure(stdout: str) -> str | None:
    lowered = stdout.strip().lower()
    if not lowered:
        return None
    if lowered.startswith("api call failed"):
        return f"Hermes API call failed: {sanitize_text(stdout.strip())}"
    if "http 429" in lowered or "usage limit has been reached" in lowered:
        return f"Hermes API call failed: {sanitize_text(stdout.strip())}"
    return None


def _toolsets(settings: Settings) -> list[str]:
    return [
        item.strip()
        for item in settings.hermes_toolsets.split(",")
        if item.strip()
    ]


def _result(
    *,
    settings: Settings,
    started_at: float,
    used_real_hermes: bool,
    stdout: str,
    stderr: str,
    returncode: int | None,
    error: str | None,
    failure_reason: str | None,
    command_safety_summary: str = COMMAND_SAFETY_SUMMARY,
) -> HermesResult:
    return HermesResult(
        runtime=settings.hermes_runtime,
        mode=settings.hermes_mode,
        used_real_hermes=used_real_hermes,
        provider=settings.hermes_provider,
        model=settings.hermes_model,
        skill_name=settings.hermes_skill_name or None,
        toolsets_used=_toolsets(settings),
        stdout=stdout,
        stderr=stderr,
        returncode=returncode,
        error=error,
        failure_reason=failure_reason,
        duration_ms=round((time.monotonic() - started_at) * 1000),
        command_safety_summary=command_safety_summary,
        runtime_status="available" if used_real_hermes and error is None else "unavailable" if error else "pending",
        api_base_url=None,
        api_endpoint=None,
        sandbox_name=None,
        upstream_provider=None,
        upstream_model=None,
        error_class="hermes_cli_error" if error else None,
    )


def _nemohermes_result(
    *,
    settings: Settings,
    started_at: float,
    used_real_hermes: bool,
    stdout: str,
    error: str | None,
    failure_reason: str | None,
    runtime_status: str,
    error_class: str | None,
    returncode: int | None = None,
) -> HermesResult:
    endpoint, _endpoint_error = _nemohermes_endpoint(settings)
    return HermesResult(
        runtime=settings.hermes_runtime,
        mode=settings.hermes_mode if settings.hermes_mode != "isolated_cli" else "nemohermes_api",
        used_real_hermes=used_real_hermes,
        provider=settings.nemoclaw_provider,
        model=settings.hermes_model,
        skill_name=None,
        toolsets_used=[],
        stdout=stdout,
        stderr="",
        returncode=returncode,
        error=sanitize_text(error) if error else None,
        failure_reason=sanitize_text(failure_reason) if failure_reason else None,
        duration_ms=round((time.monotonic() - started_at) * 1000),
        command_safety_summary=NEMOHERMES_SAFETY_SUMMARY,
        runtime_status=runtime_status,
        api_base_url=_safe_endpoint_label(settings.hermes_api_base_url),
        api_endpoint=_safe_endpoint_label(endpoint) if endpoint else None,
        sandbox_name=settings.nemoclaw_sandbox_name or None,
        upstream_provider=settings.nemoclaw_provider or None,
        upstream_model=settings.nemoclaw_model or None,
        error_class=error_class,
    )


def _safe_endpoint_label(value: str) -> str | None:
    if not value:
        return None
    parsed = urlparse(value)
    if not parsed.netloc:
        return None
    return f"{parsed.netloc}{parsed.path}".rstrip("/")
