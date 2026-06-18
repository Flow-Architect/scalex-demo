"""Domain models for the ScaleX backend."""

from dataclasses import dataclass


@dataclass(frozen=True)
class DemoJob:
    id: str
    client_name: str
    job_name: str
    invoice_amount_cents: int
    spend_cap_cents: int
    margin_floor_percent: float


@dataclass(frozen=True)
class DemoEvent:
    id: str
    job_id: str
    type: str
    title: str
    detail: str
    status: str
    created_at: str


@dataclass(frozen=True)
class LedgerEntry:
    id: str
    job_id: str
    entry_type: str
    label: str
    amount_cents: int
    source: str
    created_at: str


@dataclass(frozen=True)
class PolicyCheck:
    id: str
    job_id: str
    request_type: str
    vendor: str
    requested_amount_cents: int
    approved: bool
    reason: str
    margin_after_spend_percent: float
    required_action: str
    created_at: str


@dataclass(frozen=True)
class StripeEvent:
    id: str
    job_id: str
    stripe_object_type: str
    stripe_object_id: str
    status: str
    amount_cents: int
    mode: str
    created_at: str


@dataclass(frozen=True)
class AgentOutput:
    id: str
    job_id: str
    agent_name: str
    status: str
    summary: str
    output_markdown: str
    created_at: str


@dataclass(frozen=True)
class ProfitReport:
    id: str
    job_id: str
    revenue_cents: int
    approved_spend_cents: int
    gross_profit_cents: int
    margin_percent: float
    policy_violations: int
    recommendation: str
    report_markdown: str
    created_at: str
