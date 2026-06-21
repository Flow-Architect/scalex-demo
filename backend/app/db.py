from pathlib import Path
import sqlite3

from .config import REPO_ROOT, get_settings, resolve_repo_path


TABLE_NAMES = (
    "jobs",
    "onboarding_configs",
    "events",
    "planning_runs",
    "orchestration_calls",
    "ledger_entries",
    "policy_checks",
    "stripe_events",
    "agent_outputs",
    "reports",
)


def database_path(path: str | Path | None = None) -> Path:
    configured_path = path if path is not None else get_settings().database_path
    return resolve_repo_path(configured_path)


def schema_path() -> Path:
    return REPO_ROOT / "data" / "schema.sql"


def seed_path() -> Path:
    return REPO_ROOT / "data" / "seed.json"


def policy_path() -> Path:
    return REPO_ROOT / "policies" / "scalex-policy.json"


def get_connection(path: str | Path | None = None) -> sqlite3.Connection:
    db_path = database_path(path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    return connection


def initialize_database(path: str | Path | None = None) -> Path:
    db_path = database_path(path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with get_connection(db_path) as connection:
        connection.executescript(schema_path().read_text(encoding="utf-8"))
    return db_path


def reset_database(path: str | Path | None = None) -> Path:
    db_path = database_path(path)
    if not _is_safe_database_path(db_path):
        raise ValueError(f"Refusing to reset unsafe database path: {db_path}")
    if db_path.exists():
        db_path.unlink()
    return initialize_database(db_path)


def table_counts(path: str | Path | None = None) -> dict[str, int]:
    initialize_database(path)
    with get_connection(path) as connection:
        return {
            table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in TABLE_NAMES
        }


def _is_safe_database_path(path: Path) -> bool:
    allowed_roots = (REPO_ROOT, Path("/tmp"))
    resolved = path.resolve()
    for root in allowed_roots:
        try:
            resolved.relative_to(root.resolve())
            return True
        except ValueError:
            continue
    return False
