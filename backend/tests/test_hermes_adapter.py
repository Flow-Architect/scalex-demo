import json
from pathlib import Path

from app.config import Settings
from app.services.hermes_adapter import run_hermes_oneshot


class FakeCompleted:
    def __init__(self, stdout: str = "", stderr: str = "", returncode: int = 0):
        self.stdout = stdout
        self.stderr = stderr
        self.returncode = returncode


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
