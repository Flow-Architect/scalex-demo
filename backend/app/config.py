import os
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    app_env: str
    scalex_execution_mode: str
    database_path: str
    stripe_live_mode: bool
    policy_engine: str
    hermes_mode: str
    hermes_cli_path: str
    hermes_home: str
    hermes_model: str
    hermes_provider: str
    hermes_timeout_seconds: int
    hermes_require_real: bool
    hermes_test_mode: bool
    hermes_max_output_chars: int
    hermes_skill_name: str
    hermes_skill_source_path: str
    hermes_toolsets: str
    hermes_runtime: str = "isolated_cli"
    hermes_api_base_url: str = "http://127.0.0.1:8642/v1"
    hermes_api_key: str = "local"
    nemoclaw_sandbox_name: str = "scalex-hermes"
    nemoclaw_provider: str = "nvidia-prod"
    nemoclaw_model: str = "nvidia/nemotron-3-ultra-550b-a55b"
    guardrail_mode: str = "local_policy"
    nemo_python_path: str = ""
    nemo_config_path: str = "./guardrails/scalex"
    guardrails_fail_closed: bool = True
    guardrails_record_evaluations: bool = True
    guardrails_probe_timeout_seconds: int = 15
    stripe_mode: str = "test"
    stripe_secret_key: str = ""
    stripe_test_mode: bool = True
    stripe_test_double_mode: bool = False
    stripe_currency: str = "usd"
    stripe_idempotency_prefix: str = "scalex-demo"
    stripe_success_url: str = ""
    stripe_cancel_url: str = ""
    stripe_webhook_secret: str = ""
    stripe_live_money_enabled: bool = False
    stripe_live_require_verified: bool = True
    scalex_live_max_amount_cents: int = 0
    scalex_live_allowed_customer_emails: str = ""
    scalex_live_confirmation_phrase: str = "LIVE_MONEY_APPROVED"
    scalex_auth_enabled: bool = False
    scalex_demo_username: str = "admin"
    scalex_demo_password: str = "change-me"
    scalex_session_secret: str = "change-me"


def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        scalex_execution_mode=normalized_execution_mode(
            os.getenv("SCALEX_EXECUTION_MODE", "demo")
        ),
        database_path=os.getenv("DATABASE_PATH", "./data/scalex.db"),
        stripe_live_mode=_bool_env("STRIPE_LIVE_MODE", False),
        policy_engine=os.getenv("POLICY_ENGINE", "local"),
        guardrail_mode=normalized_guardrail_mode(
            os.getenv("SCALEX_GUARDRAIL_MODE", os.getenv("GUARDRAIL_ENGINE", "local_policy"))
        ),
        nemo_python_path=os.getenv(
            "SCALEX_NEMO_PYTHON",
            os.getenv("NEMO_GUARDRAILS_PYTHON", ""),
        ),
        nemo_config_path=os.getenv(
            "SCALEX_NEMO_CONFIG_PATH",
            os.getenv("NEMO_GUARDRAILS_CONFIG_PATH", "./guardrails/scalex"),
        ),
        guardrails_fail_closed=_bool_env("GUARDRAILS_FAIL_CLOSED", True),
        guardrails_record_evaluations=_bool_env("GUARDRAILS_RECORD_EVALUATIONS", True),
        guardrails_probe_timeout_seconds=_int_env("GUARDRAILS_PROBE_TIMEOUT_SECONDS", 15),
        hermes_mode=os.getenv("HERMES_MODE", "isolated_cli"),
        hermes_cli_path=os.getenv(
            "HERMES_CLI_PATH",
            os.getenv("HERMES_BIN", "hermes"),
        ),
        hermes_home=os.getenv("HERMES_HOME", ""),
        hermes_model=os.getenv("HERMES_MODEL", ""),
        hermes_provider=os.getenv("HERMES_PROVIDER", ""),
        hermes_timeout_seconds=_int_env("HERMES_TIMEOUT_SECONDS", 60),
        hermes_require_real=_bool_env("HERMES_REQUIRE_REAL", False),
        hermes_test_mode=_bool_env("HERMES_TEST_MODE", True),
        hermes_max_output_chars=_int_env("HERMES_MAX_OUTPUT_CHARS", 12000),
        hermes_skill_name=os.getenv("HERMES_SKILL_NAME", "scalex-operator"),
        hermes_skill_source_path=os.getenv(
            "HERMES_SKILL_SOURCE_PATH",
            "./hermes/skills/scalex-operator",
        ),
        hermes_toolsets=os.getenv("HERMES_TOOLSETS", "skills"),
        hermes_runtime=normalized_hermes_runtime(
            os.getenv("HERMES_RUNTIME", os.getenv("HERMES_MODE", "isolated_cli"))
        ),
        hermes_api_base_url=os.getenv("HERMES_API_BASE_URL", "http://127.0.0.1:8642/v1"),
        hermes_api_key=os.getenv("HERMES_API_KEY", "local"),
        nemoclaw_sandbox_name=os.getenv("NEMOCLAW_SANDBOX_NAME", "scalex-hermes"),
        nemoclaw_provider=os.getenv("NEMOCLAW_PROVIDER", "nvidia-prod"),
        nemoclaw_model=os.getenv("NEMOCLAW_MODEL", "nvidia/nemotron-3-ultra-550b-a55b"),
        stripe_mode=os.getenv("STRIPE_MODE", "test"),
        stripe_secret_key=os.getenv("STRIPE_SECRET_KEY", ""),
        stripe_test_mode=_bool_env("STRIPE_TEST_MODE", True),
        stripe_test_double_mode=_bool_env("STRIPE_TEST_DOUBLE_MODE", False),
        stripe_currency=os.getenv("STRIPE_CURRENCY", "usd").strip().lower() or "usd",
        stripe_idempotency_prefix=os.getenv("STRIPE_IDEMPOTENCY_PREFIX", "scalex-demo"),
        stripe_success_url=os.getenv("STRIPE_SUCCESS_URL", ""),
        stripe_cancel_url=os.getenv("STRIPE_CANCEL_URL", ""),
        stripe_webhook_secret=os.getenv("STRIPE_WEBHOOK_SECRET", ""),
        stripe_live_money_enabled=_bool_env("STRIPE_LIVE_MONEY_ENABLED", False),
        stripe_live_require_verified=_bool_env("STRIPE_LIVE_REQUIRE_VERIFIED", True),
        scalex_live_max_amount_cents=_int_env("SCALEX_LIVE_MAX_AMOUNT_CENTS", 0),
        scalex_live_allowed_customer_emails=os.getenv("SCALEX_LIVE_ALLOWED_CUSTOMER_EMAILS", ""),
        scalex_live_confirmation_phrase=os.getenv(
            "SCALEX_LIVE_CONFIRMATION_PHRASE",
            "LIVE_MONEY_APPROVED",
        ),
        scalex_auth_enabled=_bool_env("SCALEX_AUTH_ENABLED", False),
        scalex_demo_username=os.getenv("SCALEX_DEMO_USERNAME", "admin"),
        scalex_demo_password=os.getenv("SCALEX_DEMO_PASSWORD", "change-me"),
        scalex_session_secret=os.getenv("SCALEX_SESSION_SECRET", "change-me"),
    )


def normalized_execution_mode(value: str | None) -> str:
    normalized = (value or "demo").strip().lower().replace("-", "_")
    aliases = {
        "judge": "demo",
        "judge_demo": "demo",
        "sandbox": "demo",
        "sandbox_demo": "demo",
        "demo_proof": "demo",
        "full": "full_proof",
        "proof": "full_proof",
        "product": "full_proof",
        "product_mode": "full_proof",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in {"demo", "full_proof"}:
        raise ValueError(
            "SCALEX_EXECUTION_MODE must be demo or full_proof for Goal 7."
        )
    return normalized


def normalized_guardrail_mode(value: str | None) -> str:
    normalized = (value or "local_policy").strip().lower().replace("-", "_")
    aliases = {
        "local": "local_policy",
        "policy": "local_policy",
        "local_policy_engine": "local_policy",
        "nemo": "nemo_guardrails",
        "nemo_guardrail": "nemo_guardrails",
        "nemo_guardrails_runtime": "nemo_guardrails",
        "compatible": "nemo_compatible",
        "nemo_fallback": "nemo_compatible",
        "fallback": "nemo_compatible",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in {"local_policy", "nemo_guardrails", "nemo_compatible"}:
        raise ValueError(
            "SCALEX_GUARDRAIL_MODE must be local_policy, nemo_guardrails, or nemo_compatible."
        )
    return normalized


def normalized_hermes_runtime(value: str | None) -> str:
    normalized = (value or "isolated_cli").strip().lower().replace("-", "_")
    aliases = {
        "cli": "isolated_cli",
        "isolated": "isolated_cli",
        "hermes_cli": "isolated_cli",
        "nemo": "nemoclaw",
        "nemo_claw": "nemoclaw",
        "nemohermes": "nemoclaw",
        "nemohermes_api": "nemoclaw",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in {"isolated_cli", "nemoclaw"}:
        raise ValueError("HERMES_RUNTIME must be isolated_cli or nemoclaw.")
    return normalized


def resolve_repo_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path
    return REPO_ROOT / path


def _bool_env(name: str, default: bool) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        return int(raw_value)
    except ValueError:
        return default
