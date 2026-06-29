"""Deterministic agent output service for the local ScaleX demo."""

import sqlite3
from typing import Any

from .. import repository
from ..seed.demo_outputs import DEMO_AGENT_OUTPUTS
from .economics_service import enterprise_report_totals
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
            "Finance, Marketing, Research, and Ops implementation outputs were created from local "
            f"deterministic content for {job['client_name']}."
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
    enterprise_totals = enterprise_report_totals(
        revenue_cents=int(totals["revenue_cents"]),
        setup_tool_spend_cents=int(totals["approved_spend_cents"]),
        blocked_spend_cents=int(totals["blocked_spend_cents"]),
        margin_floor_percent=float(job["margin_floor_percent"]),
    )
    revenue = _currency(enterprise_totals["revenue_cents"])
    setup_spend = _currency(enterprise_totals["setup_tool_spend_cents"])
    approved_costs = _currency(enterprise_totals["approved_spend_cents"])
    blocked_spend = _currency(enterprise_totals["blocked_spend_cents"])
    gross_profit = _currency(enterprise_totals["gross_profit_cents"])
    margin = f"{enterprise_totals['actual_margin_percent']}%"
    blocked_margin = f"{enterprise_totals['margin_if_blocked_approved_percent']}%"
    spend_cap = _currency(job["spend_cap_cents"])
    margin_floor = f"{job['margin_floor_percent']}%"
    client_name = str(job["client_name"])
    job_name = str(job["job_name"])

    if output["agent_name"] == "Finance":
        return {
            "summary": f"Finance Agent confirmed the {client_name} implementation P&L and margin guardrails.",
            "output_markdown": f"""# Finance Agent

- Implementation package revenue: {revenue}.
- Approved delivery cost basis: {approved_costs}.
- Setup/tool spend: {setup_spend}.
- Blocked risk: {blocked_spend}.
- Margin if blocked risk were approved: {blocked_margin}.
- Protected profit: {gross_profit}.
- Protected margin: {margin}.

Spend control result: {job_name} stayed above the {margin_floor} margin floor after enterprise delivery costs and inside the {spend_cap} setup spend cap.""",
        }

    if output["agent_name"] == "Marketing":
        return {
            "summary": f"Marketing Agent prepared launch asset kit copy for {client_name}.",
            "output_markdown": f"""# Marketing Agent

Launch theme: Start the implementation with clear stakeholders, scope, and next steps.

Kickoff copy: {client_name} can start {job_name} with a governed setup path, finance proof, approved setup spend, and recorded evidence.

Stakeholder notes:
- Confirm implementation owner, finance contact, and operations handoff lead.
- Keep workspace setup, sandbox preparation, and launch assets tied to the approved scope.
- No patient data or PHI is used in this synthetic implementation sample.

Launch asset copy: Start {job_name} with {client_name} and receive a documented onboarding plan.

Follow-up message: Thanks for joining the launch. Reply with stakeholder availability and the implementation team will confirm the next checkpoint.""",
        }

    if output["agent_name"] == "Research":
        return {
            "summary": f"Research Agent summarized implementation risk boundaries for {client_name}.",
            "output_markdown": f"""# Research Agent

Implementation risk notes: keep the work scoped to onboarding operations, workspace setup, sandbox testing, launch assets, and stakeholder handoff.

Vendor recommendation: use only approved setup vendors and block enrichment or data-broker requests until reviewed through explicit business rules.

Data boundary: this is a synthetic multi-location client account. Do not use patient data, do not include PHI, and do not claim healthcare compliance or HIPAA support.""",
        }

    return {
        "summary": f"Ops Agent finalized the implementation launch checklist for {client_name}.",
        "output_markdown": f"""# Ops Agent

Implementation checklist:
- Confirm revenue recorded in the local sandbox ledger.
- Verify approved setup spend totals {setup_spend}.
- Verify total approved delivery costs remain {approved_costs}.
- Verify blocked risk totals {blocked_spend}.
- Confirm workspace setup, data migration sandbox, launch asset kit, and stakeholder handoff evidence.
- Attach final protected-profit report.

Launch recommendation: proceed with implementation launch while preserving the {spend_cap} setup spend cap and {margin_floor} margin floor.""",
    }


def _currency(cents: int | float) -> str:
    return f"${int(cents) / 100:,.0f}"


def _job_scoped_output_id(base_id: str, job_id: str) -> str:
    safe_job_id = "".join(char if char.isalnum() else "_" for char in job_id.lower())
    return f"{base_id}_{safe_job_id}"
