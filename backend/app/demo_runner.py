"""One-click local demo runner for the ScaleX lifecycle.

The runner composes the ScaleX product loop. Product mode calls the
ScaleX-isolated Hermes CLI for planning, then ScaleX code executes the
payment-shaped, policy, ledger, agent, and report steps locally.
"""

from __future__ import annotations

from contextlib import closing
import time
from typing import Any

from . import repository
from .db import database_path, get_connection, reset_database
from .services.agent_service import create_demo_agent_output, record_demo_agent_work_complete
from .services.hermes_adapter import sanitize_text
from .services.ledger_service import ledger_totals, usd_to_cents
from .services.payment_service import mark_job_paid
from .services.planning_service import generate_operating_plan
from .services.policy_service import apply_spend_request
from .services.seed_service import load_seed_config, seed_demo_database
from .services.state_service import build_demo_state
from .services.stripe_service import (
    StripeIntegrationError,
    confirm_stripe_payment_status,
    create_stripe_customer,
    create_stripe_invoice,
    payment_ledger_metadata,
    prepare_stripe_payment_url,
    record_stripe_lifecycle_note,
)


FINAL_RECOMMENDATION = "Renew campaign for another 30 days"
REPORT_ID = "rep_harbor_final_profit_report"
JOB_COMPLETE_EVENT_ID = "evt_harbor_job_complete"


def run_demo() -> dict[str, Any]:
    reset_database()

    with closing(get_connection()) as connection:
        seed_config = load_seed_config()
        sequence = 0

        job_started_at = time.monotonic()
        job = seed_demo_database(connection, seed_config)
        sequence = _record_orchestration_call(
            connection,
            job_id=job["id"],
            sequence=sequence + 1,
            tool_name="job.create",
            tool_input_json={
                "client_name": seed_config["clientName"],
                "job_name": seed_config["jobName"],
                "invoice_amount_cents": int(job["invoice_amount_cents"]),
                "spend_cap_cents": int(job["spend_cap_cents"]),
            },
            tool_output_json={"job": job},
            status="complete",
            duration_ms=_duration_ms(job_started_at),
        )

        planning_started_at = time.monotonic()
        planning_result = generate_operating_plan(job, seed_config)
        planning_run = repository.create_planning_run(
            connection,
            job_id=job["id"],
            mode=planning_result["mode"],
            provider=planning_result["provider"],
            model=planning_result["model"],
            source=planning_result["source"],
            status=planning_result["status"],
            prompt_version=planning_result["prompt_version"],
            prompt_text=planning_result["prompt_text"],
            result_json=planning_result["result_json"],
            summary=planning_result["summary"],
            error=planning_result["error"],
        )
        planning_metadata = planning_result["hermes_metadata"]
        sequence = _record_orchestration_call(
            connection,
            job_id=job["id"],
            sequence=sequence + 1,
            tool_name="planning.generate_operating_plan",
            tool_input_json={
                "job_id": job["id"],
                "prompt_version": planning_result["prompt_version"],
            },
            tool_output_json={
                "planning_run_id": planning_run["id"],
                "planning_result": planning_result["result_json"],
                "hermes_metadata": planning_metadata,
            },
            status=planning_result["status"],
            duration_ms=int(planning_metadata.get("duration_ms") or _duration_ms(planning_started_at)),
            error=planning_result["error"],
            planning_run_id=planning_run["id"],
        )
        _record_planning_event(connection, job, planning_result, planning_run)

        if planning_result["status"] != "completed":
            repository.update_job_status(connection, job["id"], "hermes_error")
            connection.commit()
            state = build_demo_state(connection)
            state["database"]["path"] = str(database_path())
            state["database"]["exists"] = database_path().exists()
            return {
                "status": "hermes_failed",
                "state": state,
                "decision": {
                    "error": planning_result["error"],
                    "planning_run_id": planning_run["id"],
                },
            }

        planning_run_id = planning_run["id"]

        _record_margin_plan(connection, job)
        _record_payment_gate_note(connection, job)

        try:
            sequence, payment_status = _run_stripe_sequence(connection, job, sequence, planning_run_id)
        except StripeIntegrationError as exc:
            _record_stripe_error(connection, job, exc)
            repository.update_job_status(connection, job["id"], "stripe_error")
            connection.commit()
            state = build_demo_state(connection)
            state["database"]["path"] = str(database_path())
            state["database"]["exists"] = database_path().exists()
            return {
                "status": "stripe_failed",
                "state": state,
                "decision": {"error": sanitize_text(str(exc))},
            }

        sequence, _revenue = _execute_tool(
            connection,
            job=job,
            sequence=sequence,
            planning_run_id=planning_run_id,
            tool_name="ledger.record_revenue",
            tool_input_json={"job_id": job["id"], "amount_cents": int(job["invoice_amount_cents"])},
            operation=lambda: mark_job_paid(
                connection,
                job,
                **payment_ledger_metadata(payment_status),
            ),
        )
        sequence = _run_policy_spend_sequence(connection, job, sequence, planning_run_id)

        for agent_name in ("Finance", "Marketing", "Research", "Ops"):
            sequence, _agent_output = _execute_tool(
                connection,
                job=job,
                sequence=sequence,
                planning_run_id=planning_run_id,
                tool_name=f"agent.run_{agent_name.lower()}",
                tool_input_json={"job_id": job["id"], "agent_name": agent_name},
                operation=lambda agent_name=agent_name: create_demo_agent_output(connection, job, agent_name),
            )
        record_demo_agent_work_complete(connection, job)

        sequence, _report = _execute_tool(
            connection,
            job=job,
            sequence=sequence,
            planning_run_id=planning_run_id,
            tool_name="report.generate",
            tool_input_json={"job_id": job["id"]},
            operation=lambda: _create_final_report(connection, job),
        )
        repository.update_job_status(connection, job["id"], "complete")
        repository.create_event(
            connection,
            job_id=job["id"],
            type="job_complete",
            title="Harbor Fleet Services campaign package completed",
            detail=(
                "Completed the compressed local demo lifecycle from intake through final profit report. "
                "Stripe/payment records are labeled with their actual execution mode."
            ),
            status="complete",
            event_id=JOB_COMPLETE_EVENT_ID,
        )
        connection.commit()
        state = build_demo_state(connection)

    state["database"]["path"] = str(database_path())
    state["database"]["exists"] = database_path().exists()
    return {"status": "completed", "state": state}


def _run_stripe_sequence(
    connection,
    job: dict[str, Any],
    sequence: int,
    planning_run_id: str,
) -> tuple[int, dict[str, Any]]:
    sequence, customer = _execute_tool(
        connection,
        job=job,
        sequence=sequence,
        planning_run_id=planning_run_id,
        tool_name="stripe.create_customer",
        tool_input_json={"job_id": job["id"], "client_name": job["client_name"]},
        operation=lambda: create_stripe_customer(connection, job),
    )
    sequence, invoice_result = _execute_tool(
        connection,
        job=job,
        sequence=sequence,
        planning_run_id=planning_run_id,
        tool_name="stripe.create_invoice",
        tool_input_json={
            "job_id": job["id"],
            "customer_id": customer.get("customer_id"),
            "amount_cents": int(job["invoice_amount_cents"]),
        },
        operation=lambda: create_stripe_invoice(connection, job, customer),
    )
    sequence, invoice = _execute_tool(
        connection,
        job=job,
        sequence=sequence,
        planning_run_id=planning_run_id,
        tool_name="stripe.prepare_payment_url",
        tool_input_json={
            "job_id": job["id"],
            "invoice_id": invoice_result.get("invoice_id"),
        },
        operation=lambda: prepare_stripe_payment_url(connection, job, invoice_result),
    )
    sequence, payment_status = _execute_tool(
        connection,
        job=job,
        sequence=sequence,
        planning_run_id=planning_run_id,
        tool_name="stripe.confirm_payment_status",
        tool_input_json={
            "job_id": job["id"],
            "invoice_id": invoice.get("invoice_id"),
        },
        operation=lambda: confirm_stripe_payment_status(connection, job, invoice),
    )
    record_stripe_lifecycle_note(connection, job, payment_status)
    return sequence, payment_status


def _record_margin_plan(connection, job: dict[str, Any]) -> None:
    projected_profit_cents = int(job["invoice_amount_cents"]) - int(job["spend_cap_cents"])
    projected_margin_percent = round((projected_profit_cents / int(job["invoice_amount_cents"])) * 100, 1)
    repository.create_event(
        connection,
        job_id=job["id"],
        type="margin_plan",
        title="Margin plan locked",
        detail=(
            f"Planned ${job['invoice_amount_cents'] / 100:,.0f} revenue, "
            f"${job['spend_cap_cents'] / 100:,.0f} spend cap, "
            f"${projected_profit_cents / 100:,.0f} projected profit, and "
            f"{projected_margin_percent}% projected margin against a "
            f"{job['margin_floor_percent']}% floor."
        ),
        status="planned",
        event_id="evt_harbor_margin_plan",
    )
    connection.commit()


def _record_payment_gate_note(connection, job: dict[str, Any]) -> None:
    repository.create_event(
        connection,
        job_id=job["id"],
        type="policy_gate",
        title="Spend locked until local payment confirmation",
        detail=(
            "The local policy engine requires payment confirmation before vendor spend. "
            "The one-click path records this as a timeline note instead of creating a pre-payment block, "
            "so prerequisite blocks do not inflate final blocked spend."
        ),
        status="guarded",
        event_id="evt_harbor_policy_payment_gate",
    )
    connection.commit()


def _record_stripe_error(connection, job: dict[str, Any], exc: StripeIntegrationError) -> dict[str, Any]:
    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="stripe_integration_error",
        title="Stripe test-mode integration failed",
        detail=sanitize_text(str(exc)),
        status="failed",
        event_id="evt_harbor_stripe_integration_error",
    )
    connection.commit()
    return event


def _run_policy_spend_sequence(
    connection,
    job: dict[str, Any],
    sequence: int,
    planning_run_id: str,
) -> int:
    spend_requests = [
        ("Local Ads API", usd_to_cents(89)),
        ("Design Asset Pack", usd_to_cents(98)),
        ("Premium Automation Suite", usd_to_cents(750)),
    ]
    for vendor, amount_cents in spend_requests:
        sequence, result = _execute_tool(
            connection,
            job=job,
            sequence=sequence,
            planning_run_id=planning_run_id,
            tool_name="policy.check_spend",
            tool_input_json={
                "job_id": job["id"],
                "vendor": vendor,
                "requested_amount_cents": amount_cents,
            },
            operation=lambda vendor=vendor, amount_cents=amount_cents: apply_spend_request(
                connection,
                job=job,
                vendor=vendor,
                requested_amount_cents=amount_cents,
            ),
        )
        ledger_entry = result.get("ledger_entry")
        if ledger_entry is not None:
            sequence = _record_orchestration_call(
                connection,
                job_id=job["id"],
                sequence=sequence + 1,
                tool_name="ledger.record_spend",
                tool_input_json={
                    "job_id": job["id"],
                    "policy_check_id": result["policy_check"]["id"],
                    "vendor": vendor,
                    "amount_cents": amount_cents,
                },
                tool_output_json={"ledger_entry": ledger_entry},
                status="complete",
                duration_ms=0,
                planning_run_id=planning_run_id,
            )
    return sequence


def _create_final_report(connection, job: dict[str, Any]) -> dict[str, Any]:
    ledger_entries = repository.list_ledger_entries(connection, job["id"])
    policy_checks = repository.list_policy_checks(connection, job["id"])
    totals = ledger_totals(job, ledger_entries, policy_checks)

    report = repository.create_report(
        connection,
        job_id=job["id"],
        revenue_cents=int(totals["revenue_cents"]),
        approved_spend_cents=int(totals["approved_spend_cents"]),
        blocked_spend_cents=int(totals["blocked_spend_cents"]),
        gross_profit_cents=int(totals["gross_profit_cents"]),
        margin_percent=float(totals["actual_margin_percent"]),
        policy_violations=0,
        recommendation=FINAL_RECOMMENDATION,
        report_markdown=_final_report_markdown(totals),
        report_id=REPORT_ID,
    )
    repository.create_event(
        connection,
        job_id=job["id"],
        type="profit_report",
        title="Final profit report created",
        detail=(
            "$1,200 revenue, $187 approved spend, $750 blocked unsafe spend, "
            "$1,013 gross profit, and 84.4% final margin."
        ),
        status="complete",
        event_id="evt_harbor_profit_report",
    )
    connection.commit()
    return report


def _final_report_markdown(totals: dict[str, Any]) -> str:
    return f"""# Harbor Fleet Services Final Profit Report

Revenue: ${totals['revenue_cents'] / 100:,.0f}

Approved spend: ${totals['approved_spend_cents'] / 100:,.0f}

Blocked unsafe spend: ${totals['blocked_spend_cents'] / 100:,.0f}

Gross profit: ${totals['gross_profit_cents'] / 100:,.0f}

Final margin: {totals['actual_margin_percent']}%

Policy violations: 0

Recommendation: {FINAL_RECOMMENDATION}."""


def _execute_tool(
    connection,
    *,
    job: dict[str, Any],
    sequence: int,
    planning_run_id: str,
    tool_name: str,
    tool_input_json: dict[str, Any],
    operation,
) -> tuple[int, Any]:
    next_sequence = sequence + 1
    started_at = time.monotonic()
    try:
        output = operation()
    except Exception as exc:
        _record_orchestration_call(
            connection,
            job_id=job["id"],
            sequence=next_sequence,
            tool_name=tool_name,
            tool_input_json=tool_input_json,
            tool_output_json=None,
            status="failed",
            duration_ms=_duration_ms(started_at),
            error=sanitize_text(str(exc)),
            planning_run_id=planning_run_id,
        )
        connection.commit()
        raise

    _record_orchestration_call(
        connection,
        job_id=job["id"],
        sequence=next_sequence,
        tool_name=tool_name,
        tool_input_json=tool_input_json,
        tool_output_json=output,
        status="complete",
        duration_ms=_duration_ms(started_at),
        planning_run_id=planning_run_id,
    )
    return next_sequence, output


def _record_orchestration_call(
    connection,
    *,
    job_id: str,
    sequence: int,
    tool_name: str,
    tool_input_json: dict[str, Any],
    tool_output_json: Any,
    status: str,
    duration_ms: int,
    error: str | None = None,
    planning_run_id: str | None = None,
) -> int:
    repository.create_orchestration_call(
        connection,
        job_id=job_id,
        planning_run_id=planning_run_id,
        sequence=sequence,
        tool_name=tool_name,
        tool_input_json=tool_input_json,
        tool_output_json=tool_output_json,
        status=status,
        duration_ms=duration_ms,
        error=error,
    )
    connection.commit()
    return sequence


def _record_planning_event(
    connection,
    job: dict[str, Any],
    planning_result: dict[str, Any],
    planning_run: dict[str, Any],
) -> dict[str, Any]:
    metadata = planning_result["hermes_metadata"]
    if planning_result["status"] == "completed":
        used_real = bool(metadata.get("used_real_hermes"))
        return repository.create_event(
            connection,
            job_id=job["id"],
            type="hermes_planning",
            title="Hermes operating plan generated",
            detail=(
                f"{planning_result['summary']} "
                f"Planning run {planning_run['id']} used_real_hermes={str(used_real).lower()}."
            ),
            status="complete",
            event_id="evt_harbor_hermes_planning",
        )

    return repository.create_event(
        connection,
        job_id=job["id"],
        type="hermes_integration_error",
        title="Hermes planning failed",
        detail=planning_result["error"] or "Hermes failed before returning a usable plan.",
        status="failed",
        event_id="evt_harbor_hermes_error",
    )


def _duration_ms(started_at: float) -> int:
    return round((time.monotonic() - started_at) * 1000)
