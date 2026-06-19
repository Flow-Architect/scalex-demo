import sqlite3
from typing import Any

from .. import repository
from .ledger_service import ledger_totals, usd_to_cents
from .policy_service import load_policy_config, policy_summary
from .seed_service import load_seed_config


def build_demo_state(connection: sqlite3.Connection) -> dict[str, Any]:
    jobs = repository.list_jobs(connection)
    job = repository.get_demo_job(connection)
    job_id = job["id"] if job else None
    ledger_entries = repository.list_ledger_entries(connection, job_id)
    policy_checks = repository.list_policy_checks(connection, job_id)
    totals = ledger_totals(job, ledger_entries, policy_checks)
    reports = [
        _enrich_report(report, totals)
        for report in repository.list_reports(connection, job_id)
    ]
    latest_report = _enrich_report(repository.get_latest_report(connection, job_id), totals)
    seed_config = load_seed_config()
    events = repository.list_events(connection, job_id)

    return {
        "mode": "local_sqlite",
        "database": {
            "initialized": True,
        },
        "job": job,
        "jobs": jobs,
        "ledger": {
            "entries": ledger_entries,
            "totals": totals,
        },
        "policy": {
            "config": load_policy_config(),
            "summary": policy_summary(),
        },
        "events": events,
        "timeline_events": events,
        "policy_checks": policy_checks,
        "stripe_events": repository.list_stripe_events(connection, job_id),
        "agent_outputs": repository.list_agent_outputs(connection, job_id),
        "reports": reports,
        "report": latest_report,
        "report_placeholder": {
            "status": "pending",
            "expected_revenue_cents": usd_to_cents(seed_config["invoiceAmountUsd"]),
            "expected_approved_spend_cents": usd_to_cents(187),
            "expected_gross_profit_cents": usd_to_cents(1013),
            "expected_margin_percent": 84.4,
            "recommendation": "Renew campaign for another 30 days",
        },
    }


def _enrich_report(report: dict[str, Any] | None, totals: dict[str, Any]) -> dict[str, Any] | None:
    if report is None:
        return None
    enriched = dict(report)
    enriched.setdefault("blocked_spend_cents", totals["blocked_spend_cents"])
    enriched["actual_margin_percent"] = enriched.get("margin_percent", totals["actual_margin_percent"])
    return enriched
