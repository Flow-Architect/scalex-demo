import json
import sqlite3
from pathlib import Path
from typing import Any

from ..db import seed_path
from ..repository import DEMO_JOB_ID, create_event, create_job


def load_seed_config(path: str | Path | None = None) -> dict[str, Any]:
    resolved_path = Path(path) if path is not None else seed_path()
    return json.loads(resolved_path.read_text(encoding="utf-8"))


def seed_demo_database(connection: sqlite3.Connection, seed: dict[str, Any] | None = None) -> dict:
    seed_config = seed or load_seed_config()
    job = create_job(connection, seed_config, job_id=DEMO_JOB_ID)
    create_event(
        connection,
        job_id=job["id"],
        type="job_intake",
        title=f"{seed_config['clientName']} job seeded",
        detail=(
            f"{seed_config['jobName']} loaded with ${seed_config['invoiceAmountUsd']} "
            f"invoice, ${seed_config['spendCapUsd']} spend cap, and "
            f"{seed_config['marginFloorPercent']}% margin floor."
        ),
        status="seeded",
        event_id="evt_harbor_job_seeded",
    )
    connection.commit()
    return job
