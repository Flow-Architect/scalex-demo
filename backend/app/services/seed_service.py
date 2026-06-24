import json
import sqlite3
from pathlib import Path
from typing import Any

from ..db import seed_path
from ..repository import DEMO_JOB_ID, create_event, create_job


def load_seed_config(path: str | Path | None = None) -> dict[str, Any]:
    resolved_path = Path(path) if path is not None else seed_path()
    return json.loads(resolved_path.read_text(encoding="utf-8"))


def seed_demo_database(
    connection: sqlite3.Connection,
    seed: dict[str, Any] | None = None,
    *,
    job_id: str = DEMO_JOB_ID,
    workflow_id: str | None = None,
    deterministic_event_ids: bool = True,
) -> dict:
    seed_config = seed or load_seed_config()
    job = create_job(connection, seed_config, job_id=job_id, workflow_id=workflow_id)
    create_event(
        connection,
        job_id=job["id"],
        type="job_intake",
        title=f"{seed_config['clientName']} implementation launch seeded",
        detail=(
            f"{seed_config['jobName']} loaded with ${seed_config['invoiceAmountUsd']} "
            f"implementation package revenue, ${seed_config['spendCapUsd']} setup spend cap, and "
            f"{seed_config['marginFloorPercent']}% margin floor."
        ),
        status="seeded",
        event_id="evt_northstar_implementation_seeded" if deterministic_event_ids else None,
    )
    connection.commit()
    return job
