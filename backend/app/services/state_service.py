import sqlite3
from typing import Any
import json

from .. import repository
from .ledger_service import ledger_totals, usd_to_cents
from .policy_service import policy_config_for_seed, policy_summary
from .seed_service import load_seed_config


def build_demo_state(connection: sqlite3.Connection, run_id: str | None = None) -> dict[str, Any]:
    workflows = repository.list_workflows(connection)
    active_workflow = repository.get_active_workflow(connection)
    jobs = repository.list_jobs(connection)
    job = _selected_job(connection, active_workflow, run_id)
    job_id = job["id"] if job else None
    workflow = _workflow_for_job(connection, job, active_workflow)
    seed_config = _seed_config_for_state(job, workflow)
    policy_config = policy_config_for_seed(seed_config)
    ledger_entries = repository.list_ledger_entries(connection, job_id) if job_id else []
    policy_checks = repository.list_policy_checks(connection, job_id) if job_id else []
    totals = ledger_totals(job, ledger_entries, policy_checks)
    reports = [
        _enrich_report(report, totals)
        for report in (repository.list_reports(connection, job_id) if job_id else [])
    ]
    latest_report = _enrich_report(
        repository.get_latest_report(connection, job_id) if job_id else None,
        totals,
    )
    onboarding_config = repository.get_onboarding_config(connection)
    events = repository.list_events(connection, job_id) if job_id else []
    planning_runs = [
        _decode_planning_run(run)
        for run in (repository.list_planning_runs(connection, job_id) if job_id else [])
    ]
    latest_planning_run = _decode_planning_run(
        repository.get_latest_planning_run(connection, job_id) if job_id else None
    )
    orchestration_calls = [
        _decode_orchestration_call(call)
        for call in (repository.list_orchestration_calls(connection, job_id) if job_id else [])
    ]
    hermes_metadata = _latest_hermes_metadata(latest_planning_run, orchestration_calls)
    stripe_events = [
        _decode_stripe_event(event)
        for event in (repository.list_stripe_events(connection, job_id) if job_id else [])
    ]

    return {
        "mode": "local_sqlite",
        "database": {
            "initialized": True,
            "table_counts": _table_counts(connection),
        },
        "workflow": active_workflow,
        "workflows": workflows,
        "selected_run_id": job_id,
        "job": job,
        "jobs": jobs,
        "runs": jobs,
        "onboarding": onboarding_config,
        "ledger": {
            "entries": ledger_entries,
            "totals": totals,
        },
        "policy": {
            "config": policy_config,
            "summary": policy_summary(policy_config),
        },
        "events": events,
        "timeline_events": events,
        "planning_runs": planning_runs,
        "planning_run": latest_planning_run,
        "orchestration_calls": orchestration_calls,
        "hermes": hermes_metadata,
        "stripe": _stripe_summary(stripe_events, events),
        "policy_checks": policy_checks,
        "stripe_events": stripe_events,
        "agent_outputs": repository.list_agent_outputs(connection, job_id) if job_id else [],
        "reports": reports,
        "report": latest_report,
        "report_placeholder": {
            "status": "pending",
            "expected_revenue_cents": usd_to_cents(seed_config["invoiceAmountUsd"]),
            "expected_approved_spend_cents": _approved_spend_cents(seed_config),
            "expected_gross_profit_cents": (
                usd_to_cents(seed_config["invoiceAmountUsd"]) - _approved_spend_cents(seed_config)
            ),
            "expected_margin_percent": _expected_margin_percent(seed_config),
            "recommendation": "Renew campaign for another 30 days",
        },
    }


def _selected_job(
    connection: sqlite3.Connection,
    active_workflow: dict[str, Any] | None,
    run_id: str | None,
) -> dict[str, Any] | None:
    if run_id:
        try:
            return repository.get_job(connection, run_id)
        except LookupError:
            return None
    if active_workflow is not None:
        job = repository.get_latest_job_for_workflow(connection, active_workflow["id"])
        if job is not None:
            return job
    return repository.get_demo_job(connection)


def _workflow_for_job(
    connection: sqlite3.Connection,
    job: dict[str, Any] | None,
    active_workflow: dict[str, Any] | None,
) -> dict[str, Any] | None:
    workflow_id = job.get("workflow_id") if job else None
    if workflow_id:
        try:
            return repository.get_workflow(connection, workflow_id)
        except LookupError:
            return active_workflow
    return active_workflow


def _seed_config_for_state(job: dict[str, Any] | None, workflow: dict[str, Any] | None) -> dict[str, Any]:
    default_seed = load_seed_config()
    if workflow is not None:
        return repository.workflow_seed_config(workflow)
    if job is None:
        return default_seed
    seed_config = dict(default_seed)
    seed_config.update(
        {
            "clientName": job["client_name"],
            "businessType": job["business_type"],
            "jobName": job["job_name"],
            "jobGoal": job["job_goal"],
            "invoiceAmountUsd": int(job["invoice_amount_cents"]) / 100,
            "spendCapUsd": int(job["spend_cap_cents"]) / 100,
            "marginFloorPercent": float(job["margin_floor_percent"]),
        }
    )
    return seed_config


def _approved_spend_cents(seed_config: dict[str, Any]) -> int:
    return sum(
        usd_to_cents(item.get("amountUsd", 0))
        for item in seed_config.get("approvedSpendRequests", [])
    )


def _expected_margin_percent(seed_config: dict[str, Any]) -> float:
    revenue_cents = usd_to_cents(seed_config["invoiceAmountUsd"])
    if revenue_cents <= 0:
        return 0.0
    gross_profit_cents = revenue_cents - _approved_spend_cents(seed_config)
    return round((gross_profit_cents / revenue_cents) * 100, 1)


def _table_counts(connection: sqlite3.Connection) -> dict[str, int]:
    tables = [
        "workflows",
        "jobs",
        "events",
        "planning_runs",
        "orchestration_calls",
        "ledger_entries",
        "policy_checks",
        "stripe_events",
        "agent_outputs",
        "reports",
    ]
    return {
        table: int(connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0])
        for table in tables
    }


def _enrich_report(report: dict[str, Any] | None, totals: dict[str, Any]) -> dict[str, Any] | None:
    if report is None:
        return None
    enriched = dict(report)
    enriched.setdefault("blocked_spend_cents", totals["blocked_spend_cents"])
    enriched["actual_margin_percent"] = enriched.get("margin_percent", totals["actual_margin_percent"])
    return enriched


def _decode_planning_run(planning_run: dict[str, Any] | None) -> dict[str, Any] | None:
    if planning_run is None:
        return None
    decoded = dict(planning_run)
    decoded["result_json"] = _decode_json(decoded.get("result_json"))
    return decoded


def _decode_orchestration_call(call: dict[str, Any]) -> dict[str, Any]:
    decoded = dict(call)
    decoded["tool_input_json"] = _decode_json(decoded.get("tool_input_json"))
    decoded["tool_output_json"] = _decode_json(decoded.get("tool_output_json"))
    return decoded


def _decode_stripe_event(event: dict[str, Any]) -> dict[str, Any]:
    decoded = dict(event)
    decoded["raw_object_json"] = _decode_json(decoded.get("raw_object_json"))
    if decoded.get("paid") is not None:
        decoded["paid"] = bool(decoded["paid"])
    decoded["livemode"] = bool(decoded.get("livemode"))
    return decoded


def _decode_json(value: Any) -> Any:
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


def _latest_hermes_metadata(
    planning_run: dict[str, Any] | None,
    orchestration_calls: list[dict[str, Any]],
) -> dict[str, Any]:
    default = {
        "mode": "isolated_cli",
        "used_real_hermes": False,
        "provider": None,
        "model": None,
        "skill_name": None,
        "toolsets_used": [],
        "error": None,
        "failure_reason": None,
        "duration_ms": 0,
        "command_safety_summary": "Hermes has not run for the current demo state.",
    }
    planning_call = next(
        (
            call
            for call in orchestration_calls
            if call["tool_name"] == "planning.generate_operating_plan"
        ),
        None,
    )
    if planning_call:
        output = planning_call.get("tool_output_json") or {}
        metadata = output.get("hermes_metadata") if isinstance(output, dict) else None
        if isinstance(metadata, dict):
            return metadata

    if planning_run is not None:
        fallback = dict(default)
        fallback.update(
            {
                "mode": planning_run.get("mode"),
                "provider": planning_run.get("provider"),
                "model": planning_run.get("model"),
                "error": planning_run.get("error"),
                "failure_reason": planning_run.get("error"),
            }
        )
        return fallback

    return default


def _stripe_summary(
    stripe_events: list[dict[str, Any]],
    events: list[dict[str, Any]],
) -> dict[str, Any]:
    error_event = next(
        (
            event
            for event in reversed(events)
            if event["type"] == "stripe_integration_error"
        ),
        None,
    )
    latest_invoice = _latest_event_with(stripe_events, "invoice_id")
    latest_customer = _latest_event_with(stripe_events, "customer_id")
    latest_payment = _latest_event_with(stripe_events, "paid")
    latest_diagnostic = _latest_event_with(stripe_events, "diagnostic_reason")
    provider_modes = [
        event.get("provider_mode") or event.get("mode")
        for event in stripe_events
        if event.get("provider_mode") or event.get("mode")
    ]
    stripe_mode = provider_modes[-1] if provider_modes else "not_configured"

    return {
        "stripe_mode": stripe_mode,
        "used_real_stripe": any(mode == "stripe_test" for mode in provider_modes),
        "livemode": any(bool(event.get("livemode")) for event in stripe_events) if stripe_events else None,
        "customer_id": latest_customer.get("customer_id") if latest_customer else None,
        "invoice_id": latest_invoice.get("invoice_id") if latest_invoice else None,
        "hosted_invoice_url": latest_invoice.get("hosted_invoice_url") if latest_invoice else None,
        "invoice_status": latest_invoice.get("invoice_status") if latest_invoice else None,
        "paid": latest_payment.get("paid") if latest_payment else None,
        "error": error_event["detail"] if error_event else None,
        "diagnostic_reason": (
            latest_diagnostic.get("diagnostic_reason") if latest_diagnostic else None
        ),
    }


def _latest_event_with(events: list[dict[str, Any]], field: str) -> dict[str, Any] | None:
    return next(
        (
            event
            for event in reversed(events)
            if event.get(field) not in (None, "")
        ),
        None,
    )
