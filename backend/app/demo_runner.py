"""One-click local demo runner for the ScaleX lifecycle.

The runner composes existing local services only. It resets and rebuilds
the sandbox ledger without calling Stripe, GPT, Hermes, NemoClaw, or any
external production system.
"""

from __future__ import annotations

from contextlib import closing
from typing import Any

from . import repository
from .db import database_path, get_connection, reset_database
from .services.agent_service import create_demo_agent_outputs
from .services.ledger_service import ledger_totals, usd_to_cents
from .services.payment_service import mark_job_paid
from .services.policy_service import apply_spend_request
from .services.seed_service import load_seed_config, seed_demo_database
from .services.state_service import build_demo_state
from .services.stripe_service import create_mock_stripe_lifecycle


FINAL_RECOMMENDATION = "Renew campaign for another 30 days"
REPORT_ID = "rep_harbor_final_profit_report"
JOB_COMPLETE_EVENT_ID = "evt_harbor_job_complete"


def run_demo() -> dict[str, Any]:
    reset_database()

    with closing(get_connection()) as connection:
        seed_config = load_seed_config()
        job = seed_demo_database(connection, seed_config)

        _record_margin_plan(connection, job)
        _record_payment_gate_note(connection, job)
        create_mock_stripe_lifecycle(connection, job)
        mark_job_paid(connection, job)
        _run_policy_spend_sequence(connection, job)
        create_demo_agent_outputs(connection, job)
        _create_final_report(connection, job)
        repository.update_job_status(connection, job["id"], "complete")
        repository.create_event(
            connection,
            job_id=job["id"],
            type="job_complete",
            title="Harbor Fleet Services campaign package completed",
            detail=(
                "Completed the compressed local demo lifecycle from intake through final profit report. "
                "All payment and Stripe records are local sandbox/mock records."
            ),
            status="complete",
            event_id=JOB_COMPLETE_EVENT_ID,
        )
        connection.commit()
        state = build_demo_state(connection)

    state["database"]["path"] = str(database_path())
    state["database"]["exists"] = database_path().exists()
    return {"status": "completed", "state": state}


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


def _run_policy_spend_sequence(connection, job: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        apply_spend_request(
            connection,
            job=job,
            vendor="Local Ads API",
            requested_amount_cents=usd_to_cents(89),
        ),
        apply_spend_request(
            connection,
            job=job,
            vendor="Design Asset Pack",
            requested_amount_cents=usd_to_cents(98),
        ),
        apply_spend_request(
            connection,
            job=job,
            vendor="Premium Automation Suite",
            requested_amount_cents=usd_to_cents(750),
        ),
    ]


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
