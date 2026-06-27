import json
from pathlib import Path
from urllib.error import HTTPError, URLError

from app.config import Settings
from app.services.hermes_adapter import run_hermes_oneshot


class FakeCompleted:
    def __init__(self, stdout: str = "", stderr: str = "", returncode: int = 0):
        self.stdout = stdout
        self.stderr = stderr
        self.returncode = returncode


class FakeHTTPResponse:
    def __init__(self, payload: dict, status: int = 200):
        self.status = status
        self._body = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def read(self) -> bytes:
        return self._body


def test_real_hermes_command_uses_isolated_home_cli_skill_and_oneshot(tmp_path, monkeypatch) -> None:
    hermes_cli = tmp_path / "hermes"
    hermes_cli.write_text("#!/usr/bin/env bash\n", encoding="utf-8")
    hermes_home = tmp_path / "home"
    hermes_home.mkdir()
    skill_source = tmp_path / "skill-source"
    skill_source.mkdir()
    (skill_source / "SKILL.md").write_text(
        "---\nname: scalex-operator\ndescription: test skill\n---\n# ScaleX\n",
        encoding="utf-8",
    )
    calls = []

    def fake_run(command, cwd, env, capture_output, text, timeout, check):
        calls.append(
            {
                "command": command,
                "cwd": cwd,
                "env": env,
                "timeout": timeout,
            }
        )
        if command == [str(hermes_cli), "--help"]:
            return FakeCompleted(
                stdout=(
                    "usage: hermes [-z PROMPT] [-m MODEL] [--provider PROVIDER] "
                    "[-t TOOLSETS] [--skills SKILLS] [--ignore-rules]"
                )
            )
        return FakeCompleted(stdout="SCALEX_HERMES_READY")

    monkeypatch.setenv("HERMES_TEST_MODE", "false")
    monkeypatch.setattr("app.services.hermes_adapter.subprocess.run", fake_run)

    settings = Settings(
        app_env="test",
        scalex_execution_mode="full_proof",
        database_path=str(tmp_path / "scalex.db"),
        stripe_live_mode=False,
        policy_engine="local",
        hermes_mode="isolated_cli",
        hermes_cli_path=str(hermes_cli),
        hermes_home=str(hermes_home),
        hermes_model="gpt-5.5",
        hermes_provider="openai-codex",
        hermes_timeout_seconds=60,
        hermes_require_real=True,
        hermes_test_mode=False,
        hermes_max_output_chars=12000,
        hermes_skill_name="scalex-operator",
        hermes_skill_source_path=str(skill_source),
        hermes_toolsets="skills",
    )

    result = run_hermes_oneshot("Reply with exactly: SCALEX_HERMES_READY", settings)

    assert result.ok is True
    assert result.used_real_hermes is True
    assert result.provider == "openai-codex"
    assert result.model == "gpt-5.5"
    assert result.skill_name == "scalex-operator"
    assert result.toolsets_used == ["skills"]
    assert (hermes_home / "skills" / "scalex-operator" / "SKILL.md").exists()

    actual = calls[-1]
    command = actual["command"]
    assert command[0] == str(hermes_cli)
    assert "--ignore-rules" in command
    assert "--toolsets" in command
    assert "skills" in command
    assert "--skills" in command
    assert "scalex-operator" in command
    assert "--provider" in command
    assert "openai-codex" in command
    assert "-m" in command
    assert "gpt-5.5" in command
    assert "-z" in command
    assert command[-1] == "Reply with exactly: SCALEX_HERMES_READY"
    assert actual["env"]["HERMES_HOME"] == str(hermes_home)


def test_hermes_test_mode_does_not_invoke_subprocess(tmp_path, monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        raise AssertionError("subprocess.run should not be called in HERMES_TEST_MODE")

    monkeypatch.setattr("app.services.hermes_adapter.subprocess.run", fake_run)
    settings = Settings(
        app_env="test",
        scalex_execution_mode="demo",
        database_path=str(tmp_path / "scalex.db"),
        stripe_live_mode=False,
        policy_engine="local",
        hermes_mode="isolated_cli",
        hermes_cli_path="/missing/hermes",
        hermes_home=str(tmp_path / "home"),
        hermes_model="gpt-5.5",
        hermes_provider="openai-codex",
        hermes_timeout_seconds=60,
        hermes_require_real=True,
        hermes_test_mode=True,
        hermes_max_output_chars=12000,
        hermes_skill_name="scalex-operator",
        hermes_skill_source_path="./hermes/skills/scalex-operator",
        hermes_toolsets="skills",
    )

    result = run_hermes_oneshot(json.dumps({"ok": True}), settings)

    assert result.ok is True
    assert result.used_real_hermes is False


def test_real_hermes_stdout_api_failure_marks_result_failed(tmp_path, monkeypatch) -> None:
    hermes_cli = tmp_path / "hermes"
    hermes_cli.write_text("#!/usr/bin/env bash\n", encoding="utf-8")
    hermes_home = tmp_path / "home"
    hermes_home.mkdir()
    skill_source = tmp_path / "skill-source"
    skill_source.mkdir()
    (skill_source / "SKILL.md").write_text(
        "---\nname: scalex-operator\ndescription: test skill\n---\n# ScaleX\n",
        encoding="utf-8",
    )

    def fake_run(command, **kwargs):
        if command == [str(hermes_cli), "--help"]:
            return FakeCompleted(
                stdout=(
                    "usage: hermes [-z PROMPT] [-m MODEL] [--provider PROVIDER] "
                    "[-t TOOLSETS] [--skills SKILLS] [--ignore-rules]"
                )
            )
        return FakeCompleted(
            stdout="API call failed after 3 retries: HTTP 429: The usage limit has been reached\n",
            returncode=0,
        )

    monkeypatch.setenv("HERMES_TEST_MODE", "false")
    monkeypatch.setattr("app.services.hermes_adapter.subprocess.run", fake_run)

    settings = Settings(
        app_env="test",
        scalex_execution_mode="full_proof",
        database_path=str(tmp_path / "scalex.db"),
        stripe_live_mode=False,
        policy_engine="local",
        hermes_mode="isolated_cli",
        hermes_cli_path=str(hermes_cli),
        hermes_home=str(hermes_home),
        hermes_model="gpt-5.5",
        hermes_provider="openai-codex",
        hermes_timeout_seconds=60,
        hermes_require_real=True,
        hermes_test_mode=False,
        hermes_max_output_chars=12000,
        hermes_skill_name="scalex-operator",
        hermes_skill_source_path=str(skill_source),
        hermes_toolsets="skills",
    )

    result = run_hermes_oneshot("Return JSON.", settings)

    assert result.ok is False
    assert result.used_real_hermes is True
    assert "usage limit" in result.failure_reason


def test_nemohermes_api_success_uses_openai_compatible_chat_completion(
    tmp_path, monkeypatch
) -> None:
    calls = []

    def fake_urlopen(request, timeout):
        calls.append(
            {
                "url": request.full_url,
                "authorization": request.get_header("Authorization"),
                "content_type": request.get_header("Content-type"),
                "data": request.data,
                "timeout": timeout,
            }
        )
        return FakeHTTPResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {"executive_summary": "ScaleX NemoHermes NVIDIA updated ready"}
                            )
                        }
                    }
                ]
            }
        )

    monkeypatch.setattr("app.services.hermes_adapter.urlopen", fake_urlopen)
    settings = _nemohermes_settings(tmp_path)
    prompt = "Return a ScaleX operating plan as JSON."

    result = run_hermes_oneshot(prompt, settings)

    assert result.ok is True
    assert result.used_real_hermes is True
    assert result.runtime == "nemoclaw"
    assert result.mode == "nemohermes_api"
    assert result.provider == "nvidia-prod"
    assert result.model == "hermes-agent"
    assert result.runtime_status == "available"
    assert result.api_base_url == "127.0.0.1:8642/v1"
    assert result.api_endpoint == "127.0.0.1:8642/v1/chat/completions"
    assert result.sandbox_name == "scalex-hermes"
    assert result.upstream_model == "nvidia/nemotron-3-ultra-550b-a55b"
    assert "ScaleX NemoHermes NVIDIA updated ready" in result.stdout

    assert calls == [
        {
            "url": "http://127.0.0.1:8642/v1/chat/completions",
            "authorization": "Bearer local",
            "content_type": "application/json",
            "data": calls[0]["data"],
            "timeout": 60,
        }
    ]
    request_payload = json.loads(calls[0]["data"].decode("utf-8"))
    assert request_payload["model"] == "hermes-agent"
    assert request_payload["messages"] == [{"role": "user", "content": prompt}]
    assert request_payload["temperature"] == 0
    assert request_payload["stream"] is False
    _assert_no_header_leakage(result)


def test_nemohermes_api_http_error_fails_closed(tmp_path, monkeypatch) -> None:
    def fake_urlopen(request, timeout):
        raise HTTPError(request.full_url, 503, "Service Unavailable", hdrs=None, fp=None)

    monkeypatch.setattr("app.services.hermes_adapter.urlopen", fake_urlopen)

    result = run_hermes_oneshot("Return JSON.", _nemohermes_settings(tmp_path))

    assert result.ok is False
    assert result.used_real_hermes is False
    assert result.runtime_status == "fail_closed"
    assert result.error_class == "http_error"
    assert result.failure_reason == "NemoHermes API HTTP error: HTTP 503"
    assert result.returncode == 503
    _assert_no_header_leakage(result)


def test_nemohermes_api_malformed_response_fails_closed(tmp_path, monkeypatch) -> None:
    def fake_urlopen(request, timeout):
        return FakeHTTPResponse({"choices": [{"message": {"content": ""}}]})

    monkeypatch.setattr("app.services.hermes_adapter.urlopen", fake_urlopen)

    result = run_hermes_oneshot("Return JSON.", _nemohermes_settings(tmp_path))

    assert result.ok is False
    assert result.used_real_hermes is False
    assert result.runtime_status == "fail_closed"
    assert result.error_class == "malformed_response"
    assert result.failure_reason == "NemoHermes API message content was empty."
    _assert_no_header_leakage(result)


def test_nemohermes_api_timeout_fails_closed(tmp_path, monkeypatch) -> None:
    def fake_urlopen(request, timeout):
        raise TimeoutError("timed out")

    monkeypatch.setattr("app.services.hermes_adapter.urlopen", fake_urlopen)

    result = run_hermes_oneshot("Return JSON.", _nemohermes_settings(tmp_path))

    assert result.ok is False
    assert result.used_real_hermes is False
    assert result.runtime_status == "fail_closed"
    assert result.error_class == "TimeoutError"
    assert result.failure_reason == "NemoHermes API timed out after 60 seconds."
    _assert_no_header_leakage(result)


def test_nemohermes_api_unreachable_fails_closed(tmp_path, monkeypatch) -> None:
    def fake_urlopen(request, timeout):
        raise URLError("connection refused")

    monkeypatch.setattr("app.services.hermes_adapter.urlopen", fake_urlopen)

    result = run_hermes_oneshot("Return JSON.", _nemohermes_settings(tmp_path))

    assert result.ok is False
    assert result.used_real_hermes is False
    assert result.runtime_status == "fail_closed"
    assert result.error_class == "URLError"
    assert "NemoHermes API unavailable" in result.failure_reason
    _assert_no_header_leakage(result)


def _nemohermes_settings(tmp_path: Path) -> Settings:
    return Settings(
        app_env="test",
        scalex_execution_mode="full_proof",
        database_path=str(tmp_path / "scalex.db"),
        stripe_live_mode=False,
        policy_engine="local",
        hermes_mode="isolated_cli",
        hermes_cli_path="/missing/hermes",
        hermes_home=str(tmp_path / "home"),
        hermes_model="hermes-agent",
        hermes_provider="openai-codex",
        hermes_timeout_seconds=60,
        hermes_require_real=True,
        hermes_test_mode=False,
        hermes_max_output_chars=12000,
        hermes_skill_name="scalex-operator",
        hermes_skill_source_path="./hermes/skills/scalex-operator",
        hermes_toolsets="skills",
        hermes_runtime="nemoclaw",
        hermes_api_base_url="http://127.0.0.1:8642/v1",
        hermes_api_key="local",
        nemoclaw_sandbox_name="scalex-hermes",
        nemoclaw_provider="nvidia-prod",
        nemoclaw_model="nvidia/nemotron-3-ultra-550b-a55b",
    )


def _assert_no_header_leakage(result) -> None:
    evidence_text = json.dumps(result.metadata(), sort_keys=True)
    assert "Authorization" not in evidence_text
    assert "Bearer" not in evidence_text
