from pathlib import Path
import sqlite3

from .config import get_settings


def get_connection() -> sqlite3.Connection:
    settings = get_settings()
    return sqlite3.connect(settings.database_path)


def schema_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "schema.sql"
