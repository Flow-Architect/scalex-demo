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


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthStatusResponse(BaseModel):
    auth_enabled: bool
    authenticated: bool
    username: str | None = None
    prototype_auth: str


class OnboardingRequest(BaseModel):
    client_name: str
    business_type: str
    job_name: str
    job_goal: str
    invoice_amount_usd: float
    spend_cap_usd: float
    margin_floor_percent: float
    approved_vendors: list[str] = []
    blocked_vendors: list[str] = []


class DemoStateResponse(BaseModel):
    mode: str
    execution: dict[str, Any]
    database: dict[str, Any]
    workflow: dict[str, Any] | None
    workflows: list[dict[str, Any]]
    selected_run_id: str | None
    job: dict[str, Any] | None
    jobs: list[dict[str, Any]]
    runs: list[dict[str, Any]]
    onboarding: dict[str, Any] | None
    ledger: dict[str, Any]
    policy: dict[str, Any]
    guardrails: dict[str, Any]
    guardrail_evaluations: list[dict[str, Any]]
    events: list[dict[str, Any]]
    timeline_events: list[dict[str, Any]]
    planning_runs: list[dict[str, Any]]
    planning_run: dict[str, Any] | None
    orchestration_calls: list[dict[str, Any]]
    hermes: dict[str, Any]
    stripe: dict[str, Any]
    policy_checks: list[dict[str, Any]]
    stripe_events: list[dict[str, Any]]
    agent_outputs: list[dict[str, Any]]
    reports: list[dict[str, Any]]
    report: dict[str, Any] | None
    report_placeholder: dict[str, Any]
