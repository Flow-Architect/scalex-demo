"""Deterministic agent output service for the local ScaleX demo."""

import sqlite3
from typing import Any

from .. import repository
from ..seed.demo_outputs import DEMO_AGENT_OUTPUTS
from .ledger_service import ledger_totals


def list_demo_agents() -> list[str]:
    return [output["agent_name"] for output in DEMO_AGENT_OUTPUTS]


def create_demo_agent_output(connection: sqlite3.Connection, job: dict[str, Any], agent_name: str) -> dict:
    for output in DEMO_AGENT_OUTPUTS:
        if output["agent_name"] == agent_name:
            ledger_entries = repository.list_ledger_entries(connection, job["id"])
            policy_checks = repository.list_policy_checks(connection, job["id"])
            totals = ledger_totals(job, ledger_entries, policy_checks)
            rendered = _render_agent_output(job, output, totals)
            created_output = repository.create_agent_output(
                connection,
                job_id=job["id"],
                agent_name=output["agent_name"],
                status="complete",
                summary=rendered["summary"],
                output_markdown=rendered["output_markdown"],
                output_id=_job_scoped_output_id(output["id"], job["id"]),
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
        detail=(
            "Finance, Marketing, Research, and Ops outputs were created from local deterministic "
            f"content for {job['client_name']}."
        ),
        status="complete",
        event_id=_job_scoped_output_id("evt_agent_work_complete", job["id"]),
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


def _render_agent_output(job: dict[str, Any], output: dict[str, Any], totals: dict[str, Any]) -> dict[str, str]:
    revenue = _currency(totals["revenue_cents"])
    approved_spend = _currency(totals["approved_spend_cents"])
    blocked_spend = _currency(totals["blocked_spend_cents"])
    gross_profit = _currency(totals["gross_profit_cents"])
    margin = f"{totals['actual_margin_percent']}%"
    spend_cap = _currency(job["spend_cap_cents"])
    margin_floor = f"{job['margin_floor_percent']}%"
    client_name = str(job["client_name"])
    job_name = str(job["job_name"])

    if output["agent_name"] == "Finance":
        return {
            "summary": f"Finance Agent confirmed the {client_name} P&L and margin guardrails.",
            "output_markdown": f"""# Finance Agent

- Revenue booked: {revenue}.
- Approved spend: {approved_spend}.
- Blocked unsafe spend: {blocked_spend}.
- Gross profit: {gross_profit}.
- Final margin: {margin}.

Spend control result: {job_name} stayed above the {margin_floor} margin floor and inside the {spend_cap} spend cap.""",
        }

    if output["agent_name"] == "Marketing":
        return {
            "summary": f"Marketing Agent prepared campaign copy for {client_name}.",
            "output_markdown": f"""# Marketing Agent

Campaign theme: Make the service offer clear, timely, and easy to schedule.

Offer copy: Book {job_name} with {client_name} and get a clear plan before small service issues become larger operational problems.

Social posts:
- Operators can schedule {job_name} with a focused service team.
- Keep work moving with a campaign that explains value, timing, and next steps.
- Service outreach should be direct, useful, and tied to a measurable business outcome.

Landing page copy: Start {job_name} with {client_name} and receive a straightforward service plan.

Follow-up message: Thanks for checking in with {client_name}. Reply with your preferred timing and the team will help schedule the next step.""",
        }

    if output["agent_name"] == "Research":
        return {
            "summary": f"Research Agent summarized positioning for {client_name}.",
            "output_markdown": f"""# Research Agent

Positioning: emphasize uptime, scheduling confidence, transparent service planning, and measurable outcomes.

Competitor-aware recommendation: avoid discount-only messaging. Lead with operational clarity, responsiveness, and the protected economics of the workflow.

Audience note: target buyers who respond to concrete service outcomes, predictable scheduling, and clear pricing.""",
        }

    return {
        "summary": f"Ops Agent finalized the delivery checklist for {client_name}.",
        "output_markdown": f"""# Ops Agent

Delivery checklist:
- Confirm revenue recorded in the local sandbox ledger.
- Verify approved vendor spend totals {approved_spend}.
- Verify blocked unsafe spend totals {blocked_spend}.
- Package campaign copy, operations notes, landing copy, and follow-up copy.
- Attach final profitability report.

Renewal recommendation: renew the workflow while preserving the {spend_cap} spend cap and {margin_floor} margin floor.""",
    }


def _currency(cents: int | float) -> str:
    return f"${int(cents) / 100:,.0f}"


def _job_scoped_output_id(base_id: str, job_id: str) -> str:
    safe_job_id = "".join(char if char.isalnum() else "_" for char in job_id.lower())
    return f"{base_id}_{safe_job_id}"
