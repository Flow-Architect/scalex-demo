"""ScaleX-isolated Hermes CLI adapter."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import os
from pathlib import Path
import re
import shutil
import subprocess
import time

from ..config import REPO_ROOT, Settings, get_settings, resolve_repo_path


COMMAND_SAFETY_SUMMARY = (
    "Hermes is invoked with an argument list, not a shell; HERMES_HOME is set "
    "to the configured ScaleX-isolated home; the ScaleX operator skill is "
    "preloaded with --skills; tool access is constrained with --toolsets; "
    "--ignore-rules and -z/--oneshot are used; stdout and stderr are captured, "
    "sanitized, and truncated."
)


@dataclass(frozen=True)
class HermesResult:
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


def sanitize_text(value: object) -> str:
    text = "" if value is None else str(value)
    secret_patterns = [
        (r"sk_" r"live_[A-Za-z0-9_\-]+", "sk_" "live_REDACTED"),
        (r"sk_test_[A-Za-z0-9_\-]+", "sk_test_REDACTED"),
        (r"sk-proj-[A-Za-z0-9_\-]+", "sk-proj_REDACTED"),
        (r"whsec_[A-Za-z0-9_\-]+", "whsec_REDACTED"),
        (r"(OPENAI_API_KEY=)[^\s]+", r"\1REDACTED"),
        (r"(HERMES_API_KEY=)[^\s]+", r"\1REDACTED"),
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
    )
