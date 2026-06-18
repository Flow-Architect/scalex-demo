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
    reports = repository.list_reports(connection, job_id)
    seed_config = load_seed_config()

    return {
        "mode": "local_sqlite",
        "database": {
            "initialized": True,
        },
        "job": job,
        "jobs": jobs,
        "ledger": {
            "entries": ledger_entries,
            "totals": ledger_totals(job, ledger_entries, policy_checks),
        },
        "policy": {
            "config": load_policy_config(),
            "summary": policy_summary(),
        },
        "events": repository.list_events(connection, job_id),
        "policy_checks": policy_checks,
        "stripe_events": repository.list_stripe_events(connection, job_id),
        "agent_outputs": repository.list_agent_outputs(connection, job_id),
        "reports": reports,
        "report": repository.get_latest_report(connection, job_id),
        "report_placeholder": {
            "status": "pending",
            "expected_revenue_cents": usd_to_cents(seed_config["invoiceAmountUsd"]),
            "expected_approved_spend_cents": usd_to_cents(187),
            "expected_gross_profit_cents": usd_to_cents(1013),
            "expected_margin_percent": 84.4,
            "recommendation": "Renew campaign for another 30 days",
        },
    }
