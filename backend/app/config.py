from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    database_path: str = os.getenv("DATABASE_PATH", "./data/scalex.db")
    stripe_live_mode: bool = os.getenv("STRIPE_LIVE_MODE", "false").lower() == "true"
    stripe_mock_mode: bool = os.getenv("STRIPE_MOCK_MODE", "true").lower() == "true"
    policy_engine: str = os.getenv("POLICY_ENGINE", "local")


def get_settings() -> Settings:
    return Settings()
