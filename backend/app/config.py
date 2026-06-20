import os
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    app_env: str
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


def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        database_path=os.getenv("DATABASE_PATH", "./data/scalex.db"),
        stripe_live_mode=_bool_env("STRIPE_LIVE_MODE", False),
        policy_engine=os.getenv("POLICY_ENGINE", "local"),
        hermes_mode=os.getenv("HERMES_MODE", "isolated_cli"),
        hermes_cli_path=os.getenv(
            "HERMES_CLI_PATH",
            os.getenv("HERMES_BIN", "/home/ascabrya/.scalex-hermes/hermes-agent/venv/bin/hermes"),
        ),
        hermes_home=os.getenv("HERMES_HOME", "/home/ascabrya/.scalex-hermes/home"),
        hermes_model=os.getenv("HERMES_MODEL", "gpt-5.5"),
        hermes_provider=os.getenv("HERMES_PROVIDER", "openai-codex"),
        hermes_timeout_seconds=_int_env("HERMES_TIMEOUT_SECONDS", 60),
        hermes_require_real=_bool_env("HERMES_REQUIRE_REAL", True),
        hermes_test_mode=_bool_env("HERMES_TEST_MODE", False),
        hermes_max_output_chars=_int_env("HERMES_MAX_OUTPUT_CHARS", 12000),
        hermes_skill_name=os.getenv("HERMES_SKILL_NAME", "scalex-operator"),
        hermes_skill_source_path=os.getenv(
            "HERMES_SKILL_SOURCE_PATH",
            "./hermes/skills/scalex-operator",
        ),
        hermes_toolsets=os.getenv("HERMES_TOOLSETS", "skills"),
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
    )


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
