import os
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    app_env: str
    database_path: str
    stripe_live_mode: bool
    stripe_mock_mode: bool
    policy_engine: str


def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        database_path=os.getenv("DATABASE_PATH", "./data/scalex.db"),
        stripe_live_mode=os.getenv("STRIPE_LIVE_MODE", "false").lower() == "true",
        stripe_mock_mode=os.getenv("STRIPE_MOCK_MODE", "true").lower() == "true",
        policy_engine=os.getenv("POLICY_ENGINE", "local"),
    )


def resolve_repo_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path
    return REPO_ROOT / path
