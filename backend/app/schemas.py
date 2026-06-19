"""API schemas for the ScaleX backend."""

from typing import Any

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    mode: str
    database_path: str
    database_exists: bool


class DemoActionResponse(BaseModel):
    status: str
    state: dict[str, Any]
    decision: dict[str, Any] | None = None


class SpendCheckRequest(BaseModel):
    vendor: str
    amount_cents: int | None = None
    requested_amount_cents: int | None = None
    amount_usd: float | None = None
    amount: float | None = None
    human_approved: bool = False


class DemoStateResponse(BaseModel):
    mode: str
    database: dict[str, Any]
    job: dict[str, Any] | None
    jobs: list[dict[str, Any]]
    ledger: dict[str, Any]
    policy: dict[str, Any]
    events: list[dict[str, Any]]
    timeline_events: list[dict[str, Any]]
    policy_checks: list[dict[str, Any]]
    stripe_events: list[dict[str, Any]]
    agent_outputs: list[dict[str, Any]]
    reports: list[dict[str, Any]]
    report: dict[str, Any] | None
    report_placeholder: dict[str, Any]
