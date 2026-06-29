import sqlite3
from typing import Any
import json
from urllib.parse import urlparse

from .. import repository
from ..config import Settings, get_settings, normalized_execution_mode
from .economics_service import demo_employee_records, demo_enterprise_cost_basis
from .guardrails_service import guardrail_summary
from .ledger_service import ledger_totals, usd_to_cents
from .policy_service import policy_config_for_seed, policy_summary
from .seed_service import load_seed_config


def build_demo_state(connection: sqlite3.Connection, run_id: str | None = None) -> dict[str, Any]:
    settings = get_settings()
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
    guardrail_evaluations = [
        _decode_guardrail_evaluation(evaluation)
        for evaluation in (
            repository.list_guardrail_evaluations(connection, job_id) if job_id else []
        )
    ]
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
    hermes_metadata = _latest_hermes_metadata(settings, latest_planning_run, orchestration_calls)
    stripe_events = [
        _decode_stripe_event(event)
        for event in (repository.list_stripe_events(connection, job_id) if job_id else [])
    ]
    stripe_summary = _stripe_summary(stripe_events, events)
    placeholder_revenue_cents = usd_to_cents(seed_config["invoiceAmountUsd"])
    placeholder_setup_spend_cents = _approved_spend_cents(seed_config)
    placeholder_blocked_spend_cents = _blocked_spend_cents(seed_config)
    placeholder_cost_basis = demo_enterprise_cost_basis(
        revenue_cents=placeholder_revenue_cents,
        setup_tool_spend_cents=placeholder_setup_spend_cents,
        blocked_spend_cents=placeholder_blocked_spend_cents,
        margin_floor_percent=float(seed_config["marginFloorPercent"]),
    )

    return {
        "mode": "local_sqlite",
        "execution": _execution_summary(
            settings,
            latest_planning_run,
            hermes_metadata,
            stripe_summary,
            guardrail_evaluations,
        ),
        "command_center": _command_center_summary(
            settings=settings,
            seed_config=seed_config,
            job=job,
            totals=totals,
            ledger_entries=ledger_entries,
            policy_checks=policy_checks,
            events=events,
            agent_outputs=repository.list_agent_outputs(connection, job_id) if job_id else [],
            reports=reports,
            hermes_metadata=hermes_metadata,
            stripe_summary=stripe_summary,
        ),
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
        "guardrails": guardrail_summary(settings=settings, evaluations=guardrail_evaluations),
        "guardrail_evaluations": guardrail_evaluations,
        "events": events,
        "timeline_events": events,
        "planning_runs": planning_runs,
        "planning_run": latest_planning_run,
        "orchestration_calls": orchestration_calls,
        "hermes": hermes_metadata,
        "stripe": stripe_summary,
        "policy_checks": policy_checks,
        "stripe_events": stripe_events,
        "agent_outputs": repository.list_agent_outputs(connection, job_id) if job_id else [],
        "reports": reports,
        "report": latest_report,
        "report_placeholder": {
            "status": "pending",
            "expected_revenue_cents": placeholder_revenue_cents,
            "expected_approved_spend_cents": placeholder_cost_basis["total_approved_costs_cents"],
            "expected_setup_tool_spend_cents": placeholder_setup_spend_cents,
            "expected_gross_profit_cents": placeholder_cost_basis["protected_profit_cents"],
            "expected_margin_percent": placeholder_cost_basis["protected_margin_percent"],
            "expected_total_approved_costs_cents": placeholder_cost_basis["total_approved_costs_cents"],
            "expected_blocked_spend_cents": placeholder_blocked_spend_cents,
            "recommendation": "Proceed with implementation launch while preserving enterprise cost-basis guardrails.",
        },
    }


def _execution_summary(
    settings: Settings,
    planning_run: dict[str, Any] | None,
    hermes_metadata: dict[str, Any],
    stripe_summary: dict[str, Any],
    guardrail_evaluations: list[dict[str, Any]],
) -> dict[str, Any]:
    mode = normalized_execution_mode(settings.scalex_execution_mode)
    demo_mode = mode == "demo"
    used_real_hermes = bool(hermes_metadata.get("used_real_hermes"))
    used_real_stripe = bool(stripe_summary.get("used_real_stripe"))
    planning_source = planning_run.get("source") if planning_run else None
    stripe_mode = stripe_summary.get("stripe_mode")
    guardrails = guardrail_summary(settings=settings, evaluations=guardrail_evaluations)
    hermes_runtime = str(hermes_metadata.get("runtime") or settings.hermes_runtime)
    hermes_runtime_status = str(
        hermes_metadata.get("runtime_status")
        or ("available" if used_real_hermes else "fail_closed" if hermes_metadata.get("error") else "pending")
    )
    nemohermes_selected = hermes_runtime == "nemoclaw"

    return {
        "mode": mode,
        "label": "Demo proof mode" if demo_mode else "Full Proof Mode",
        "requested_full_proof": not demo_mode,
        "planning_label": (
            "NemoHermes API"
            if used_real_hermes and nemohermes_selected
            else "Real isolated Hermes"
            if used_real_hermes
            else "NemoHermes fail-closed"
            if nemohermes_selected and hermes_runtime_status == "fail_closed"
            else "NemoHermes selected; proof pending"
            if nemohermes_selected and planning_source
            else "Deterministic Hermes plan"
            if planning_source
            else "Planning proof pending"
        ),
        "finance_label": (
            "Real Stripe test mode"
            if used_real_stripe
            else "Stripe test-double/sandbox proof"
            if stripe_mode == "test_double"
            else "Sandbox finance proof pending"
        ),
        "policy_label": "Local policy active",
        "guardrail_mode": guardrails["mode"],
        "guardrail_adapter_status": guardrails["adapter_status"],
        "guardrail_label": _guardrail_execution_label(guardrails),
        "used_real_nemo": guardrails["used_real_nemo"],
        "guardrails_fail_closed": guardrails["fail_closed"],
        "guardrail_evaluation_stages": guardrails["evaluation_stages"],
        "used_real_hermes": used_real_hermes,
        "used_real_stripe": used_real_stripe,
        "hermes_runtime": hermes_runtime,
        "hermes_runtime_status": hermes_runtime_status,
        "hermes_api_base_url": hermes_metadata.get("api_base_url"),
        "hermes_api_endpoint": hermes_metadata.get("api_endpoint"),
        "hermes_sandbox_name": hermes_metadata.get("sandbox_name"),
        "hermes_upstream_provider": hermes_metadata.get("upstream_provider"),
        "hermes_upstream_model": hermes_metadata.get("upstream_model"),
        "hermes_error_class": hermes_metadata.get("error_class"),
        "planning_source": planning_source,
        "stripe_mode": stripe_mode,
        "truthfulness_note": (
            "Demo proof mode uses deterministic local planning and Stripe test-double sandbox "
            "finance proof. It does not claim real Hermes, real Stripe, or real NeMo usage."
            if demo_mode
            else (
                "Full Proof Mode uses the configured real planning adapter, real Stripe test-mode "
                "finance proof, and selected guardrails. NemoHermes/OpenShell is used only when "
                "HERMES_RUNTIME=nemoclaw succeeds; missing runtime, credentials, or selected "
                "guardrail failures remain visible integration errors."
            )
        ),
    }


def _guardrail_execution_label(guardrails: dict[str, Any]) -> str:
    if guardrails["fail_closed"]:
        return "Guardrails failed closed"
    if guardrails["used_real_nemo"]:
        return "Real NeMo runtime verified"
    if guardrails["mode"] == "nemo_compatible":
        return "NeMo-compatible fallback (not real NeMo)"
    if guardrails["mode"] == "nemo_guardrails":
        return "NeMo selected; runtime probe pending"
    return "Local policy active"


def _command_center_summary(
    *,
    settings: Settings,
    seed_config: dict[str, Any],
    job: dict[str, Any] | None,
    totals: dict[str, Any],
    ledger_entries: list[dict[str, Any]],
    policy_checks: list[dict[str, Any]],
    events: list[dict[str, Any]],
    agent_outputs: list[dict[str, Any]],
    reports: list[dict[str, Any]],
    hermes_metadata: dict[str, Any],
    stripe_summary: dict[str, Any],
) -> dict[str, Any]:
    revenue_cents = int(totals.get("revenue_cents") or 0) or usd_to_cents(seed_config["invoiceAmountUsd"])
    approved_vendor_spend_cents = int(totals.get("approved_spend_cents") or 0) or _approved_spend_cents(seed_config)
    blocked_spend_cents = int(totals.get("blocked_spend_cents") or 0) or _blocked_spend_cents(seed_config)
    margin_floor_percent = float(seed_config["marginFloorPercent"])
    employees = demo_employee_records()
    total_labor_cost_cents = sum(employee["labor_cost_cents"] for employee in employees)
    cost_basis = demo_enterprise_cost_basis(
        revenue_cents=revenue_cents,
        setup_tool_spend_cents=approved_vendor_spend_cents,
        blocked_spend_cents=blocked_spend_cents,
        margin_floor_percent=margin_floor_percent,
    )
    total_approved_costs_cents = int(cost_basis["total_approved_costs_cents"])
    protected_profit_cents = int(cost_basis["protected_profit_cents"])
    protected_margin_percent = float(cost_basis["protected_margin_percent"])
    margin_warning = protected_margin_percent < margin_floor_percent
    job_name = job["job_name"] if job else seed_config["jobName"]
    client_name = job["client_name"] if job else seed_config["clientName"]
    business_type = job["business_type"] if job else seed_config["businessType"]
    job_goal = job["job_goal"] if job else seed_config["jobGoal"]
    runtime_status = str(hermes_metadata.get("runtime_status") or "pending")
    runtime_mode = (
        "NemoHermes runtime"
        if hermes_metadata.get("runtime") == "nemoclaw"
        else "Deterministic judge demo"
        if settings.hermes_test_mode or settings.scalex_execution_mode == "demo"
        else "Isolated Hermes runtime"
    )

    audit_events = _command_center_audit_events(
        events=events,
        policy_checks=policy_checks,
        ledger_entries=ledger_entries,
        agent_outputs=agent_outputs,
        labor_cost_cents=total_labor_cost_cents,
        cost_basis=cost_basis,
        margin_warning=margin_warning,
        reports=reports,
    )

    return {
        "mission_control": {
            "active_client": client_name,
            "business_type": business_type,
            "active_job": job_name,
            "job_goal": job_goal,
            "invoice_amount_cents": revenue_cents,
            "spend_cap_cents": usd_to_cents(seed_config["spendCapUsd"]),
            "margin_floor_percent": margin_floor_percent,
            "approved_vendor_spend_cents": approved_vendor_spend_cents,
            "total_approved_costs_cents": total_approved_costs_cents,
            "blocked_spend_cents": blocked_spend_cents,
            "labor_cost_cents": total_labor_cost_cents,
            "projected_profit_cents": protected_profit_cents,
            "protected_profit_cents": protected_profit_cents,
            "final_margin_after_labor_percent": protected_margin_percent,
            "protected_margin_percent": protected_margin_percent,
            "margin_if_blocked_approved_percent": cost_basis["margin_if_blocked_approved_percent"],
            "profit_if_blocked_approved_cents": cost_basis["profit_if_blocked_approved_cents"],
            "runtime_mode": runtime_mode,
            "overall_status": "needs_review" if margin_warning else "safe_profitable",
        },
        "runtime_route": {
            "route": [
                "ScaleX",
                "Hermes Adapter",
                "NemoHermes API" if hermes_metadata.get("runtime") == "nemoclaw" else "Isolated Hermes / deterministic adapter",
                hermes_metadata.get("api_endpoint") or "local planning boundary",
                hermes_metadata.get("model") or "model recorded when available",
            ],
            "runtime": hermes_metadata.get("runtime") or settings.hermes_runtime,
            "endpoint": hermes_metadata.get("api_endpoint"),
            "sandbox": hermes_metadata.get("sandbox_name"),
            "model": hermes_metadata.get("model"),
            "provider": hermes_metadata.get("provider"),
            "upstream_model": hermes_metadata.get("upstream_model"),
            "status": runtime_status,
            "duration_ms": int(hermes_metadata.get("duration_ms") or 0),
            "error_class": hermes_metadata.get("error_class"),
            "used_real_hermes": bool(hermes_metadata.get("used_real_hermes")),
        },
        "client_onboarding": {
            "saved_record": {
                "client_name": client_name,
                "business_type": business_type,
                "primary_contact": "Demo operations lead",
                "contact_email": None,
                "contact_phone": None,
                "job_name": job_name,
                "job_goal": job_goal,
                "invoice_amount_cents": revenue_cents,
                "spend_cap_cents": usd_to_cents(seed_config["spendCapUsd"]),
                "margin_floor_percent": margin_floor_percent,
                "service_notes": "Synthetic B2B implementation operation. No patient data, PHI, addresses, or real client records.",
                "source": "manual_entry",
                "status": "saved_editable",
            },
            "extracted_review": {
                "source": "file_extraction_fixture",
                "file_name": "demo-client-intake.pdf",
                "file_type": "pdf",
                "status": "review_required",
                "confidence": "demo_fixture",
                "missing_fields": ["contact_email", "contact_phone"],
                "low_confidence_fields": ["primary_contact"],
                "editable_before_save": True,
                "silent_save": False,
            },
        },
        "employee_onboarding": {
            "saved_records": employees,
            "extracted_review": {
                "source": "file_extraction_fixture",
                "file_name": "demo-workforce-roster.xlsx",
                "file_type": "xlsx",
                "status": "review_required",
                "confidence": "demo_fixture",
                "missing_fields": [],
                "low_confidence_fields": ["assigned_hours"],
                "editable_before_save": True,
                "silent_save": False,
            },
        },
        "document_intake": {
            "accepted_file_types": ["pdf", "xlsx", "xls", "docx", "doc", "csv"],
            "storage_policy": "uploaded files are not permanently stored in the repo or database",
            "external_services": False,
            "manual_entry_available": True,
            "states": [
                {
                    "scope": "client",
                    "file_type": "pdf",
                    "status": "review_required",
                    "message": "Demo client intake extracted; review and edit before save.",
                },
                {
                    "scope": "employee",
                    "file_type": "xlsx",
                    "status": "review_required",
                    "message": "Demo workforce roster extracted; review assigned hours before save.",
                },
                {
                    "scope": "unsupported",
                    "file_type": "png",
                    "status": "unsupported_file",
                    "message": "PDF, Excel/spreadsheet, Word/document, and optional CSV files are accepted.",
                },
                {
                    "scope": "fallback",
                    "file_type": "doc",
                    "status": "extraction_failed",
                    "message": "Extraction failed; manual entry remains available.",
                },
            ],
        },
        "labor_costing": {
            "formula": "Loaded labor cost is one component of the approved delivery cost basis; it is job costing only, not payroll.",
            "employees": employees,
            "total_labor_cost_cents": total_labor_cost_cents,
            "gross_profit_after_labor_cents": protected_profit_cents,
            "final_margin_after_labor_percent": protected_margin_percent,
            "margin_floor_percent": margin_floor_percent,
            "margin_warning": margin_warning,
            "status": "needs_review" if margin_warning else "safe_profitable",
        },
        "cost_basis": {
            **cost_basis,
            "summary": "Protected profit is calculated after approved delivery costs, not just labor.",
        },
        "final_profit_report": {
            "client_name": client_name,
            "job_name": job_name,
            "revenue_cents": revenue_cents,
            "approved_vendor_spend_cents": approved_vendor_spend_cents,
            "total_approved_costs_cents": total_approved_costs_cents,
            "blocked_spend_cents": blocked_spend_cents,
            "labor_cost_cents": total_labor_cost_cents,
            "gross_profit_after_labor_cents": protected_profit_cents,
            "protected_profit_cents": protected_profit_cents,
            "final_margin_after_labor_percent": protected_margin_percent,
            "protected_margin_percent": protected_margin_percent,
            "margin_floor_percent": margin_floor_percent,
            "total_costs_if_blocked_approved_cents": cost_basis["total_costs_if_blocked_approved_cents"],
            "profit_if_blocked_approved_cents": cost_basis["profit_if_blocked_approved_cents"],
            "margin_if_blocked_approved_percent": cost_basis["margin_if_blocked_approved_percent"],
            "policy_violations": len([check for check in policy_checks if not bool(check.get("approved"))]),
            "decision": "Needs review" if margin_warning else "Safe / Profitable",
            "recommendation": (
                "Review scope or staffing before approving more spend."
                if margin_warning
                else "Proceed with implementation launch while preserving enterprise cost-basis and vendor-spend guardrails."
            ),
        },
        "audit_events": audit_events,
        "safety_proof": [
            "fake/demo clients only",
            "fake/demo employees only",
            "no SSNs, tax IDs, bank information, addresses, birth dates, or payroll records",
            "no external extraction services or credentials",
            "file bodies are not logged",
            "deterministic Judge Demo Mode preserved",
            "optional NemoHermes runtime remains fail-closed",
            f"stripe_livemode={str(stripe_summary.get('livemode')).lower()}",
        ],
    }

def _command_center_audit_events(
    *,
    events: list[dict[str, Any]],
    policy_checks: list[dict[str, Any]],
    ledger_entries: list[dict[str, Any]],
    agent_outputs: list[dict[str, Any]],
    labor_cost_cents: int,
    cost_basis: dict[str, Any],
    margin_warning: bool,
    reports: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    proof_events = [
        {
            "type": "client_manual_created",
            "title": "Client record prepared",
            "status": "recorded",
            "detail": "Synthetic client operation values are editable before run.",
        },
        {
            "type": "client_extracted_from_file",
            "title": "Client document intake reviewed",
            "status": "review_required",
            "detail": "Demo extraction fixture requires operator review before save.",
        },
        {
            "type": "employee_manual_created",
            "title": "Employee labor assumption added",
            "status": "recorded",
            "detail": "Demo employee record created for job costing only.",
        },
        {
            "type": "employee_extracted_from_file",
            "title": "Workforce document intake reviewed",
            "status": "review_required",
            "detail": "Demo workforce extraction fixture requires operator review before save.",
        },
        {
            "type": "extraction_failed",
            "title": "Document extraction fallback available",
            "status": "visible",
            "detail": "Manual entry remains available after unsupported or failed extraction.",
        },
        {
            "type": "labor_cost_calculated",
            "title": "Labor cost calculated",
            "status": "complete",
            "detail": f"Demo labor cost is ${labor_cost_cents / 100:,.2f}.",
        },
        {
            "type": "cost_basis_calculated",
            "title": "Approved delivery cost basis calculated",
            "status": "complete",
            "detail": f"Total approved costs are ${cost_basis['total_approved_costs_cents'] / 100:,.2f}.",
        },
        {
            "type": "campaign_media_cost_recorded",
            "title": "Campaign/media cost recorded",
            "status": "recorded",
            "detail": "Campaign/media cost is $600.00.",
        },
        {
            "type": "materials_delivery_cost_recorded",
            "title": "Materials/delivery cost recorded",
            "status": "recorded",
            "detail": "Materials/delivery cost is $375.00.",
        },
        {
            "type": "blocked_margin_impact_calculated",
            "title": "Blocked risk margin impact calculated",
            "status": "blocked",
            "detail": f"Risky spend would reduce margin to {cost_basis['margin_if_blocked_approved_percent']}%.",
        },
    ]
    if margin_warning:
        proof_events.append(
            {
                "type": "margin_warning_produced",
                "title": "Margin warning produced",
                "status": "needs_review",
                "detail": "Labor cost pushed projected margin below the configured floor.",
            }
        )

    proof_events.extend(
        {
            "type": "policy_check_approved" if bool(check.get("approved")) else "policy_check_blocked",
            "title": f"Policy check {'approved' if bool(check.get('approved')) else 'blocked'}",
            "status": "approved" if bool(check.get("approved")) else "blocked",
            "detail": f"{check.get('vendor')} / {check.get('required_action')}",
        }
        for check in policy_checks
    )
    proof_events.extend(
        {
            "type": "ledger_entry_recorded",
            "title": "Ledger row recorded",
            "status": "recorded",
            "detail": f"{entry.get('entry_type')} / {entry.get('label')}",
        }
        for entry in ledger_entries
    )
    proof_events.extend(
        {
            "type": "agent_output_recorded",
            "title": f"{output.get('agent_name')} output recorded",
            "status": output.get("status") or "recorded",
            "detail": output.get("summary") or "Agent output summary recorded.",
        }
        for output in agent_outputs
    )
    if reports:
        proof_events.append(
            {
                "type": "final_report_recorded",
                "title": "Final profit report recorded",
                "status": "complete",
                "detail": "Final report includes vendor spend, labor cost, margin, and recommendation.",
            }
        )
    if not events:
        return proof_events
    return proof_events


def _percent(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100, 1)


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


def _blocked_spend_cents(seed_config: dict[str, Any]) -> int:
    return sum(
        usd_to_cents(item.get("amountUsd", 0))
        for item in seed_config.get("blockedSpendRequests", [])
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
        "guardrail_evaluations",
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


def _decode_guardrail_evaluation(evaluation: dict[str, Any]) -> dict[str, Any]:
    decoded = dict(evaluation)
    decoded["used_real_nemo"] = bool(decoded.get("used_real_nemo"))
    decoded["fail_closed"] = bool(decoded.get("fail_closed"))
    decoded["details_json"] = _decode_json(decoded.get("details_json"))
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
    settings: Settings,
    planning_run: dict[str, Any] | None,
    orchestration_calls: list[dict[str, Any]],
) -> dict[str, Any]:
    hermes_runtime = settings.hermes_runtime
    nemohermes_selected = hermes_runtime == "nemoclaw"
    hermes_mode = (
        "nemohermes_api"
        if nemohermes_selected and settings.hermes_mode == "isolated_cli"
        else settings.hermes_mode
    )
    default = {
        "runtime": hermes_runtime,
        "mode": hermes_mode,
        "used_real_hermes": False,
        "provider": settings.nemoclaw_provider if nemohermes_selected else settings.hermes_provider,
        "model": settings.hermes_model,
        "skill_name": None if nemohermes_selected else settings.hermes_skill_name,
        "toolsets_used": [] if nemohermes_selected else _toolsets(settings),
        "error": None,
        "failure_reason": None,
        "duration_ms": 0,
        "runtime_status": "pending",
        "api_base_url": (
            _safe_endpoint_label(settings.hermes_api_base_url) if nemohermes_selected else None
        ),
        "api_endpoint": (
            _safe_endpoint_label(f"{settings.hermes_api_base_url.rstrip('/')}/chat/completions")
            if nemohermes_selected
            else None
        ),
        "sandbox_name": settings.nemoclaw_sandbox_name if nemohermes_selected else None,
        "upstream_provider": settings.nemoclaw_provider if nemohermes_selected else None,
        "upstream_model": settings.nemoclaw_model if nemohermes_selected else None,
        "error_class": None,
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
            return _merge_non_empty(default, metadata)

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


def _merge_non_empty(default: dict[str, Any], values: dict[str, Any]) -> dict[str, Any]:
    merged = dict(default)
    for key, value in values.items():
        if value is not None or key not in merged:
            merged[key] = value
    return merged


def _safe_endpoint_label(value: str | None) -> str | None:
    if not value:
        return None
    parsed = urlparse(str(value))
    if not parsed.netloc:
        return None
    return f"{parsed.netloc}{parsed.path}".rstrip("/")


def _toolsets(settings: Settings) -> list[str]:
    return [
        item.strip()
        for item in settings.hermes_toolsets.split(",")
        if item.strip()
    ]


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
