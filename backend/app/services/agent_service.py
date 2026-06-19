"""Deterministic agent output service for the local ScaleX demo."""

import sqlite3
from typing import Any

from .. import repository
from ..seed.demo_outputs import DEMO_AGENT_OUTPUTS


def list_demo_agents() -> list[str]:
    return [output["agent_name"] for output in DEMO_AGENT_OUTPUTS]


def create_demo_agent_output(connection: sqlite3.Connection, job: dict[str, Any], agent_name: str) -> dict:
    for output in DEMO_AGENT_OUTPUTS:
        if output["agent_name"] == agent_name:
            created_output = repository.create_agent_output(
                connection,
                job_id=job["id"],
                agent_name=output["agent_name"],
                status="complete",
                summary=output["summary"],
                output_markdown=output["output_markdown"],
                output_id=output["id"],
            )
            connection.commit()
            return created_output
    raise LookupError(f"Demo agent output not found: {agent_name}")


def record_demo_agent_work_complete(connection: sqlite3.Connection, job: dict[str, Any]) -> dict:
    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="agent_work",
        title="Deterministic agent work completed",
        detail="Finance, Marketing, Research, and Ops outputs were created from local seeded demo content.",
        status="complete",
        event_id="evt_harbor_agent_work_complete",
    )
    connection.commit()
    return event


def create_demo_agent_outputs(connection: sqlite3.Connection, job: dict[str, Any]) -> list[dict]:
    outputs = [
        create_demo_agent_output(connection, job, output["agent_name"])
        for output in DEMO_AGENT_OUTPUTS
    ]
    record_demo_agent_work_complete(connection, job)
    return outputs
