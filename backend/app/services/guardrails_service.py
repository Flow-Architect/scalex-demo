"""Guardrail adapter boundary for ScaleX run evidence.

The backend deliberately does not import ``nemoguardrails`` in-process. Real
NeMo availability is verified through an optional configured Python executable
so Judge Demo Mode remains deterministic and dependency-free.
"""

from __future__ import annotations

from pathlib import Path
import json
import re
import sqlite3
import subprocess
from typing import Any

from .. import repository
from ..config import Settings, get_settings, resolve_repo_path
from .hermes_adapter import sanitize_text
from .planning_service import expected_tool_sequence


RAIL_DEFINITIONS: dict[str, dict[str, str]] = {
    "input": {
        "label": "Input rail",
        "purpose": (
            "Validate client operation request, synthetic-data boundary, amount sanity, "
            "vendor sanity, no PHI, no real-client-data, and no live-money intent."
        ),
    },
    "planning": {
        "label": "Planning rail",
        "purpose": "Validate Hermes plan JSON and proposed ScaleX tool sequence.",
    },
    "execution": {
        "label": "Execution rail",
        "purpose": (
            "Gate Stripe action requests, spend approval/block behavior, connector actions, "
            "and future MCP action requests."
        ),
    },
    "output": {
        "label": "Output rail",
        "purpose": (
            "Validate final report, evidence summary, Stripe paid-state honesty, and profit outcome."
        ),
    },
}

RAIL_STAGE_ORDER = ("input", "planning", "execution", "output")
STOP_DECISIONS = {"block", "fail_closed"}

_EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)

_UNSAFE_CONTEXT_PATTERNS: tuple[tuple[str, str], ...] = (
    ("live-money intent", r"\b(sk_live|live money|live charge|live payment|real charge|production payment|live stripe)\b"),
    ("real client data", r"\b(real client data|production client data|real customer data|production customer data)\b"),
    (
        "patient data or PHI handling",
        r"\b(include|use|upload|send|process|handle|extract|email|share|import|export|collect)\s+"
        r"(?:\w+\s+){0,5}(patient data|patient record|patient name|medical record|protected health information|phi)\b",
    ),
    ("patient identifier", r"\b(medical record number|patient ssn|patient social security|mrn)\b"),
    (
        "policy bypass intent",
        r"\b(bypass|override|ignore|skip|disable)\s+(?:\w+\s+){0,5}(policy|guardrail|spend cap|margin floor|approval)\b",
    ),
    ("policy bypass intent", r"\bapprove\s+(all|every)\s+spend\b"),
    (
        "unsafe vendor intent",
        r"\b(use|approve|pay|authorize|buy)\s+(?:\w+\s+){0,5}(blocked|unapproved|data broker|premium automation suite)\b",
    ),
    (
        "unauthorized connector intent",
        r"\b(gmail|sendgrid|real email|production email|external connector|mcp server|prometheus|recall|openclaw)\b",
    ),
)

_OUTPUT_HEALTH_TERMS = re.compile(
    r"\b(patient data|patient record|patient name|medical record|protected health information|phi|hipaa)\b",
    re.IGNORECASE,
)

_NEMO_PROBE_SCRIPT = r"""
from pathlib import Path
import json
import sys

try:
    import nemoguardrails
    from nemoguardrails import LLMRails, RailsConfig

    config_path = sys.argv[1] if len(sys.argv) > 1 else ""
    config_loaded = False
    if config_path:
        path = Path(config_path)
        if not path.exists():
            raise RuntimeError("SCALEX_NEMO_CONFIG_PATH does not exist: " + str(path))
        RailsConfig.from_path(str(path))
        config_loaded = True

    print(json.dumps({
        "ok": True,
        "version": getattr(nemoguardrails, "__version__", "unknown"),
        "imports": {
            "nemoguardrails": True,
            "LLMRails": LLMRails.__name__ == "LLMRails",
            "RailsConfig": RailsConfig.__name__ == "RailsConfig",
        },
        "config_path": config_path or None,
        "config_loaded": config_loaded,
    }, sort_keys=True))
except Exception as exc:
    print(json.dumps({
        "ok": False,
        "error": f"{type(exc).__name__}: {exc}",
    }, sort_keys=True))
    sys.exit(1)
"""


class GuardrailIntegrationError(RuntimeError):
    def __init__(self, result: dict[str, Any]):
        self.result = result
        super().__init__(result.get("error") or result.get("summary") or "Guardrail adapter failed closed.")


def evaluate_and_record_guardrail_stage(
    connection: sqlite3.Connection,
    *,
    job: dict[str, Any],
    stage: str,
    payload: dict[str, Any],
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    result = evaluate_guardrail_stage(stage=stage, payload=payload, settings=settings)
    if settings.guardrails_record_evaluations:
        evaluation = repository.create_guardrail_evaluation(
            connection,
            job_id=job["id"],
            stage=result["stage"],
            mode=result["mode"],
            adapter=result["adapter"],
            status=result["status"],
            used_real_nemo=result["used_real_nemo"],
            fail_closed=result["fail_closed"],
            label=result["label"],
            summary=result["summary"],
            details_json=result["details"],
            error=result["error"],
        )
        connection.commit()
        result["evaluation"] = evaluation

    if result["decision"] in STOP_DECISIONS:
        raise GuardrailIntegrationError(result)
    return result


def evaluate_guardrail_stage(
    *,
    stage: str,
    payload: dict[str, Any],
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if stage not in RAIL_DEFINITIONS:
        raise ValueError(f"Unsupported guardrail stage: {stage}")

    mode = settings.guardrail_mode
    if mode == "nemo_guardrails":
        return _evaluate_nemo_guardrails_stage(stage, payload, settings)
    if mode == "nemo_compatible":
        validation = _run_stage_validators(stage, payload, settings)
        decision = _decision_for_validation(validation)
        return _result(
            settings=settings,
            stage=stage,
            adapter="nemo_compatible",
            status=decision,
            used_real_nemo=False,
            fail_closed=False,
            label="NeMo-compatible fallback (not real NeMo)",
            summary=(
                "Temporary NeMo-compatible fallback evaluated the rail concepts. "
                "used_real_nemo=false; local policy remains the active spend gate."
            ),
            details={
                **validation,
                "fallback_only": True,
                "local_policy_active": True,
            },
            error="; ".join(validation["failures"]) if validation["failures"] else None,
        )

    validation = _run_stage_validators(stage, payload, settings)
    decision = _decision_for_validation(validation)
    return _result(
        settings=settings,
        stage=stage,
        adapter="local_policy",
        status=decision,
        used_real_nemo=False,
        fail_closed=False,
        label="Local policy guardrail evidence",
        summary=(
            "Local policy mode recorded deterministic guardrail evidence. "
            "Judge Demo Mode stays secret-free and does not require NeMo."
        ),
        details={
            **validation,
            "local_policy_active": True,
        },
        error="; ".join(validation["failures"]) if validation["failures"] else None,
    )


def check_nemo_availability(settings: Settings | None = None) -> dict[str, Any]:
    settings = settings or get_settings()
    python_path = settings.nemo_python_path.strip()
    if not python_path:
        return {
            "ok": False,
            "status": "not_configured",
            "used_real_nemo": False,
            "version": None,
            "python_path": "",
            "config_path": _resolved_nemo_config_path(settings),
            "config_loaded": False,
            "error": "SCALEX_NEMO_PYTHON is not configured.",
        }

    executable = Path(python_path).expanduser()
    if not executable.exists():
        return {
            "ok": False,
            "status": "unavailable",
            "used_real_nemo": False,
            "version": None,
            "python_path": str(executable),
            "config_path": _resolved_nemo_config_path(settings),
            "config_loaded": False,
            "error": f"SCALEX_NEMO_PYTHON does not exist: {executable}",
        }

    config_path = _resolved_nemo_config_path(settings)
    command = [str(executable), "-c", _NEMO_PROBE_SCRIPT]
    if config_path:
        command.append(config_path)

    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            check=False,
            text=True,
            timeout=settings.guardrails_probe_timeout_seconds,
        )
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "status": "timeout",
            "used_real_nemo": False,
            "version": None,
            "python_path": str(executable),
            "config_path": config_path,
            "config_loaded": False,
            "error": (
                "Timed out while probing real NeMo Guardrails through "
                f"SCALEX_NEMO_PYTHON after {settings.guardrails_probe_timeout_seconds}s."
            ),
        }
    except OSError as exc:
        return {
            "ok": False,
            "status": "unavailable",
            "used_real_nemo": False,
            "version": None,
            "python_path": str(executable),
            "config_path": config_path,
            "config_loaded": False,
            "error": sanitize_text(str(exc)),
        }

    parsed = _parse_probe_result(completed.stdout)
    if not parsed:
        parsed = {
            "ok": False,
            "error": sanitize_text((completed.stderr or completed.stdout).strip())
            or "NeMo probe did not return JSON.",
        }

    ok = completed.returncode == 0 and bool(parsed.get("ok"))
    return {
        "ok": ok,
        "status": "available" if ok else "unavailable",
        "used_real_nemo": ok,
        "version": parsed.get("version") if ok else None,
        "python_path": str(executable),
        "config_path": config_path,
        "config_loaded": bool(parsed.get("config_loaded")),
        "imports": parsed.get("imports") if ok else None,
        "error": None if ok else sanitize_text(str(parsed.get("error") or completed.stderr or "")),
    }


def guardrail_summary(
    *,
    settings: Settings | None = None,
    evaluations: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    evaluations = evaluations or []
    used_real_nemo = any(bool(item.get("used_real_nemo")) for item in evaluations)
    fail_closed = any(bool(item.get("fail_closed")) for item in evaluations)
    latest_error = next(
        (item.get("error") for item in reversed(evaluations) if item.get("error")),
        None,
    )
    stage_summaries = []
    for stage in RAIL_STAGE_ORDER:
        latest = next(
            (item for item in reversed(evaluations) if item.get("stage") == stage),
            None,
        )
        stage_summaries.append(
            {
                "stage": stage,
                "label": RAIL_DEFINITIONS[stage]["label"],
                "purpose": RAIL_DEFINITIONS[stage]["purpose"],
                "status": latest.get("status") if latest else "pending",
                "decision": latest.get("status") if latest else "pending",
                "mode": latest.get("mode") if latest else settings.guardrail_mode,
                "adapter": latest.get("adapter") if latest else _adapter_name(settings.guardrail_mode),
                "used_real_nemo": bool(latest.get("used_real_nemo")) if latest else False,
                "fail_closed": bool(latest.get("fail_closed")) if latest else False,
                "summary": latest.get("summary") if latest else "Evaluation pending.",
                "created_at": latest.get("created_at") if latest else None,
            }
        )

    adapter_status = _adapter_status(settings.guardrail_mode, evaluations, used_real_nemo, fail_closed)
    blocked = any(item.get("status") == "block" for item in evaluations)
    return {
        "mode": settings.guardrail_mode,
        "adapter": _adapter_name(settings.guardrail_mode),
        "adapter_status": adapter_status,
        "status": "fail_closed" if fail_closed else "blocked" if blocked else "active" if evaluations else "pending",
        "used_real_nemo": used_real_nemo,
        "fail_closed": fail_closed,
        "blocked": blocked,
        "local_policy_active": True,
        "record_evaluations": settings.guardrails_record_evaluations,
        "evaluation_stages": stage_summaries,
        "nemo_python_configured": bool(settings.nemo_python_path.strip()),
        "nemo_config_path": settings.nemo_config_path,
        "latest_error": latest_error,
        "truthfulness_note": _truthfulness_note(settings.guardrail_mode, used_real_nemo, fail_closed, blocked),
    }


def _evaluate_nemo_guardrails_stage(
    stage: str,
    payload: dict[str, Any],
    settings: Settings,
) -> dict[str, Any]:
    probe = check_nemo_availability(settings)
    if not probe["ok"]:
        return _result(
            settings=settings,
            stage=stage,
            adapter="nemo_guardrails",
            status="fail_closed",
            used_real_nemo=False,
            fail_closed=True,
            label="Real NeMo Guardrails unavailable - fail closed",
            summary=(
                "nemo_guardrails mode was selected, but real NeMo runtime verification failed. "
                "ScaleX failed closed before protected actions."
            ),
            details={
                "probe": _safe_probe_details(probe),
                "local_policy_active": True,
            },
            error=probe["error"],
        )

    validation = _run_stage_validators(stage, payload, settings)
    failed = bool(validation["failures"])
    fail_closed = failed and settings.guardrails_fail_closed
    decision = "fail_closed" if fail_closed else _decision_for_validation(validation)
    return _result(
        settings=settings,
        stage=stage,
        adapter="nemo_guardrails",
        status=decision,
        used_real_nemo=True,
        fail_closed=fail_closed,
        label="Real NeMo Guardrails runtime verified",
        summary=(
            "Real NeMo Guardrails imports and RailsConfig loaded through SCALEX_NEMO_PYTHON. "
            "ScaleX recorded the rail evaluation while local policy remains the deterministic spend gate."
        ),
        details={
            **validation,
            "probe": _safe_probe_details(probe),
            "local_policy_active": True,
        },
        error="; ".join(validation["failures"]) if failed else None,
    )


def _run_stage_validators(
    stage: str,
    payload: dict[str, Any],
    settings: Settings,
) -> dict[str, Any]:
    validators = {
        "input": _validate_input_stage,
        "planning": _validate_planning_stage,
        "execution": _validate_execution_stage,
        "output": _validate_output_stage,
    }
    failures, warnings, metrics = validators[stage](payload, settings)
    return {
        "rail": RAIL_DEFINITIONS[stage],
        "failures": failures,
        "warnings": warnings,
        "metrics": metrics,
    }


def _decision_for_validation(validation: dict[str, Any]) -> str:
    if validation["failures"]:
        return "block"
    if validation["warnings"]:
        return "warn"
    return "allow"


def _validate_input_stage(
    payload: dict[str, Any],
    _settings: Settings,
) -> tuple[list[str], list[str], dict[str, Any]]:
    job = payload.get("job") or {}
    seed_config = payload.get("seed_config") or {}
    failures: list[str] = []
    warnings: list[str] = []

    invoice_amount_cents = int(job.get("invoice_amount_cents") or 0)
    spend_cap_cents = int(job.get("spend_cap_cents") or 0)
    margin_floor = float(job.get("margin_floor_percent") or 0)
    if invoice_amount_cents <= 0:
        failures.append("Invoice amount must be greater than zero.")
    if spend_cap_cents <= 0:
        failures.append("Spend cap must be greater than zero.")
    if invoice_amount_cents > 0 and spend_cap_cents >= invoice_amount_cents:
        failures.append("Spend cap must remain below invoice revenue.")
    if margin_floor < 0 or margin_floor > 95:
        failures.append("Margin floor must be between 0 and 95.")
    if invoice_amount_cents > 0 and spend_cap_cents > 0:
        projected_margin = round(((invoice_amount_cents - spend_cap_cents) / invoice_amount_cents) * 100, 1)
        if projected_margin < margin_floor:
            failures.append("Configured spend cap would violate the margin floor.")
    else:
        projected_margin = 0.0

    approved_vendors = seed_config.get("approvedVendors") or []
    blocked_vendors = seed_config.get("blockedVendors") or []
    approved_spend_total_cents = sum(
        int(float(item.get("amountUsd") or 0) * 100)
        for item in seed_config.get("approvedSpendRequests", [])
    )
    if spend_cap_cents > 0 and approved_spend_total_cents > spend_cap_cents:
        failures.append("Approved setup spend requests exceed the configured spend cap.")
    if not approved_vendors:
        warnings.append("No approved vendors were configured for this operation.")
    if not blocked_vendors:
        warnings.append("No blocked vendors were configured for this operation.")
    unsafe_approved_vendors = [
        str(vendor)
        for vendor in approved_vendors
        if re.search(r"\b(data broker|premium automation suite|live money|sk_live)\b", str(vendor), re.IGNORECASE)
    ]
    if unsafe_approved_vendors:
        failures.append("Approved vendor list contains unsafe vendor intent: " + ", ".join(unsafe_approved_vendors))

    text = " ".join(
        str(value)
        for value in [
            job.get("client_name"),
            job.get("business_type"),
            job.get("job_name"),
            job.get("job_goal"),
        ]
        if value
    ).lower()
    seed_text = _flatten_text(seed_config).lower()
    matched_terms = _unsafe_boundary_matches(f"{text} {seed_text}")
    if matched_terms:
        failures.append("Input contains unsafe boundary terms: " + ", ".join(matched_terms))
    if "synthetic" not in text and "sample" not in text and "local" not in text:
        warnings.append("Operation does not explicitly state its synthetic/local sample boundary.")

    expected_job_fields = {
        "client_name": "clientName",
        "business_type": "businessType",
        "job_name": "jobName",
        "job_goal": "jobGoal",
    }
    mismatched_fields = [
        job_key
        for job_key, seed_key in expected_job_fields.items()
        if seed_config.get(seed_key) and str(job.get(job_key) or "") != str(seed_config.get(seed_key))
    ]
    if mismatched_fields:
        failures.append("Selected operation does not match seed config fields: " + ", ".join(mismatched_fields))

    return failures, warnings, {
        "invoice_amount_cents": invoice_amount_cents,
        "spend_cap_cents": spend_cap_cents,
        "margin_floor_percent": margin_floor,
        "projected_margin_at_spend_cap_percent": projected_margin,
        "approved_spend_request_total_cents": approved_spend_total_cents,
        "approved_vendor_count": len(approved_vendors),
        "blocked_vendor_count": len(blocked_vendors),
        "unsafe_boundary_matches": matched_terms,
        "unsafe_approved_vendors": unsafe_approved_vendors,
        "synthetic_boundary": "Northstar synthetic B2B sample; no patient data and no PHI claim.",
    }


def _validate_planning_stage(
    payload: dict[str, Any],
    _settings: Settings,
) -> tuple[list[str], list[str], dict[str, Any]]:
    planning_result = payload.get("planning_result") or {}
    result_json = planning_result.get("result_json")
    failures: list[str] = []
    warnings: list[str] = []
    expected_sequence = expected_tool_sequence()
    proposed_sequence = []

    if planning_result.get("status") != "completed":
        warnings.append(planning_result.get("error") or "Planning did not complete.")
    if planning_result.get("status") != "completed":
        result_json = None

    if result_json is None:
        return failures, warnings, {
            "expected_tool_sequence": expected_sequence,
            "proposed_tool_sequence": proposed_sequence,
            "planning_status": planning_result.get("status"),
            "planning_source": planning_result.get("source"),
            "unsafe_boundary_matches": [],
        }

    if not isinstance(result_json, dict):
        failures.append("Planning result JSON was not recorded as an object.")
    else:
        proposed = result_json.get("proposed_tool_sequence")
        if not isinstance(proposed, list):
            failures.append("Planning result did not include a proposed tool sequence list.")
        else:
            proposed_sequence = [str(item) for item in proposed]
            if proposed_sequence != expected_sequence:
                failures.append("Planning proposed tool sequence does not match the ScaleX allowed sequence.")

        unsafe_matches = _unsafe_boundary_matches(_flatten_text(result_json))
        if unsafe_matches:
            failures.append("Planning result contains unsafe boundary terms: " + ", ".join(unsafe_matches))

    return failures, warnings, {
        "expected_tool_sequence": expected_sequence,
        "proposed_tool_sequence": proposed_sequence,
        "planning_status": planning_result.get("status"),
        "planning_source": planning_result.get("source"),
        "unsafe_boundary_matches": unsafe_matches if isinstance(result_json, dict) else [],
    }


def _validate_execution_stage(
    payload: dict[str, Any],
    settings: Settings,
) -> tuple[list[str], list[str], dict[str, Any]]:
    failures: list[str] = []
    warnings: list[str] = []
    phase = str(payload.get("phase") or "execution")
    action_requests = payload.get("action_requests") or []
    policy_checks = payload.get("policy_checks") or []
    ledger_entries = payload.get("ledger_entries") or []
    stripe_summary = payload.get("stripe_summary") or {}
    allowed_tools = set(expected_tool_sequence())

    if settings.stripe_live_mode or settings.stripe_live_money_enabled:
        failures.append("Live-money Stripe execution is not allowed in this product path.")
    if stripe_summary.get("livemode") is True:
        failures.append("Stripe returned livemode=true, which is blocked.")
    if phase == "post_execution_consistency" and not policy_checks:
        warnings.append("No policy checks were recorded before execution rail evidence.")
    if not isinstance(action_requests, list):
        failures.append("Execution action_requests must be a list.")
        action_requests = []

    for request in action_requests:
        if not isinstance(request, dict):
            failures.append("Execution action request must be an object.")
            continue
        tool_name = str(request.get("tool_name") or "")
        if not tool_name:
            failures.append("Execution action request did not include a tool_name.")
            continue
        if tool_name not in allowed_tools:
            failures.append(f"Execution requested unauthorized tool: {tool_name}")
        if _is_unauthorized_connector_tool(tool_name):
            failures.append(f"Execution requested unauthorized connector/MCP action: {tool_name}")
        request_text_matches = _unsafe_boundary_matches(_flatten_text(request))
        if request_text_matches:
            failures.append(
                f"Execution request {tool_name} contains unsafe boundary terms: "
                + ", ".join(request_text_matches)
            )

        if tool_name.startswith("stripe."):
            if request.get("livemode") is True:
                failures.append(f"Stripe action {tool_name} requested livemode=true.")
            requested_mode = str(request.get("mode") or request.get("provider_mode") or "").lower()
            if requested_mode in {"live", "stripe_live", "live_money"}:
                failures.append(f"Stripe action {tool_name} requested live-money mode.")
            amount_cents = request.get("amount_cents")
            if amount_cents is not None and _safe_int(amount_cents) <= 0:
                failures.append(f"Stripe action {tool_name} requested a non-positive amount.")

        if tool_name == "policy.check_spend":
            amount_cents = _safe_int(request.get("requested_amount_cents"))
            if amount_cents <= 0:
                failures.append("Spend policy check requested a non-positive amount.")

        if tool_name == "ledger.record_spend":
            policy_check = request.get("policy_check") or payload.get("policy_check") or {}
            if not isinstance(policy_check, dict) or not bool(policy_check.get("approved")):
                failures.append("Ledger spend row requested without an approved policy check.")
            else:
                if request.get("vendor") != policy_check.get("vendor"):
                    failures.append("Ledger spend request vendor does not match the approved policy check.")
                if _safe_int(request.get("amount_cents")) != _safe_int(policy_check.get("requested_amount_cents")):
                    failures.append("Ledger spend request amount does not match the approved policy check.")

        if tool_name == "ledger.record_revenue":
            amount_cents = _safe_int(request.get("amount_cents"))
            if amount_cents <= 0:
                failures.append("Revenue ledger request amount must be greater than zero.")
            if request.get("stripe_paid_claimed") is True and stripe_summary.get("paid") is not True:
                failures.append("Revenue ledger request claimed Stripe paid=true while Stripe paid is false.")

    spend_ledger_labels = {
        entry.get("label")
        for entry in ledger_entries
        if entry.get("entry_type") == "spend"
    }
    blocked_vendors_with_spend_rows = [
        check.get("vendor")
        for check in policy_checks
        if not bool(check.get("approved")) and check.get("vendor") in spend_ledger_labels
    ]
    if blocked_vendors_with_spend_rows:
        failures.append(
            "Blocked vendor created spend ledger rows: "
            + ", ".join(str(vendor) for vendor in blocked_vendors_with_spend_rows)
        )

    return failures, warnings, {
        "phase": phase,
        "action_request_count": len(action_requests),
        "action_tools": [
            request.get("tool_name")
            for request in action_requests
            if isinstance(request, dict)
        ],
        "policy_check_count": len(policy_checks),
        "ledger_entry_count": len(ledger_entries),
        "stripe_mode": stripe_summary.get("stripe_mode"),
        "stripe_livemode": stripe_summary.get("livemode"),
        "blocked_vendors_with_spend_rows": blocked_vendors_with_spend_rows,
    }


def _validate_output_stage(
    payload: dict[str, Any],
    _settings: Settings,
) -> tuple[list[str], list[str], dict[str, Any]]:
    failures: list[str] = []
    warnings: list[str] = []
    report = payload.get("report")
    totals = payload.get("totals") or {}
    stripe_summary = payload.get("stripe_summary") or {}

    if not report:
        failures.append("Final report was not recorded.")
        return failures, warnings, {"report_recorded": False}

    comparisons = {
        "revenue_cents": "revenue_cents",
        "approved_spend_cents": "approved_spend_cents",
        "blocked_spend_cents": "blocked_spend_cents",
        "gross_profit_cents": "gross_profit_cents",
    }
    for report_key, total_key in comparisons.items():
        if int(report.get(report_key) or 0) != int(totals.get(total_key) or 0):
            failures.append(f"Report {report_key} does not match ledger totals.")
    if float(report.get("margin_percent") or 0) != float(totals.get("actual_margin_percent") or 0):
        failures.append("Report margin does not match ledger totals.")
    if int(report.get("gross_profit_cents") or 0) != (
        int(report.get("revenue_cents") or 0) - int(report.get("approved_spend_cents") or 0)
    ):
        failures.append("Report protected gross profit math is inconsistent.")

    report_text = _flatten_text(
        {
            "recommendation": report.get("recommendation"),
            "report_markdown": report.get("report_markdown"),
        }
    )
    unsafe_matches = _unsafe_boundary_matches(report_text)
    if _OUTPUT_HEALTH_TERMS.search(report_text):
        unsafe_matches.append("patient data or PHI output term")
    if unsafe_matches:
        failures.append("Output contains unsafe boundary terms: " + ", ".join(dict.fromkeys(unsafe_matches)))
    if stripe_summary.get("paid") is not True and _claims_stripe_paid(report_text):
        failures.append("Output claims Stripe payment even though Stripe paid=false.")
    if stripe_summary.get("paid") is not True:
        warnings.append("Stripe paid=true was not claimed; local revenue confirmation remains separately labeled.")

    return failures, warnings, {
        "report_recorded": True,
        "report_id": report.get("id"),
        "stripe_paid": stripe_summary.get("paid"),
        "revenue_cents": report.get("revenue_cents"),
        "approved_spend_cents": report.get("approved_spend_cents"),
        "blocked_spend_cents": report.get("blocked_spend_cents"),
        "gross_profit_cents": report.get("gross_profit_cents"),
        "margin_percent": report.get("margin_percent"),
        "unsafe_boundary_matches": unsafe_matches,
        "paid_state_honesty_checked": True,
    }


def _result(
    *,
    settings: Settings,
    stage: str,
    adapter: str,
    status: str,
    used_real_nemo: bool,
    fail_closed: bool,
    label: str,
    summary: str,
    details: dict[str, Any],
    error: str | None,
) -> dict[str, Any]:
    details = {
        **details,
        "decision": status,
        "mode": settings.guardrail_mode,
        "adapter": adapter,
        "used_real_nemo": used_real_nemo,
        "fail_closed": fail_closed,
    }
    return {
        "stage": stage,
        "mode": settings.guardrail_mode,
        "adapter": adapter,
        "status": status,
        "decision": status,
        "used_real_nemo": used_real_nemo,
        "fail_closed": fail_closed,
        "label": label,
        "summary": summary,
        "details": details,
        "error": sanitize_text(error) if error else None,
    }


def _resolved_nemo_config_path(settings: Settings) -> str:
    raw_path = settings.nemo_config_path.strip()
    if not raw_path:
        return ""
    return str(resolve_repo_path(raw_path))


def _parse_probe_result(stdout: str) -> dict[str, Any] | None:
    for line in reversed(stdout.splitlines()):
        cleaned = line.strip()
        if not cleaned.startswith("{"):
            continue
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


def _safe_probe_details(probe: dict[str, Any]) -> dict[str, Any]:
    return {
        "ok": probe.get("ok"),
        "status": probe.get("status"),
        "used_real_nemo": probe.get("used_real_nemo"),
        "version": probe.get("version"),
        "python_path_configured": bool(probe.get("python_path")),
        "config_path": probe.get("config_path"),
        "config_loaded": probe.get("config_loaded"),
        "imports": probe.get("imports"),
        "error": probe.get("error"),
    }


def _flatten_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return " ".join(_flatten_text(item) for item in value.values())
    if isinstance(value, (list, tuple, set)):
        return " ".join(_flatten_text(item) for item in value)
    return str(value)


def _unsafe_boundary_matches(text: str) -> list[str]:
    normalized = " ".join(text.split())
    matches = [
        label
        for label, pattern in _UNSAFE_CONTEXT_PATTERNS
        if re.search(pattern, normalized, re.IGNORECASE)
    ]
    if _EMAIL_RE.search(normalized):
        matches.append("real client email")
    return list(dict.fromkeys(matches))


def _claims_stripe_paid(text: str) -> bool:
    normalized = " ".join(text.lower().split())
    honest_negations = (
        "not marked paid",
        "not stripe-paid",
        "not a stripe-paid invoice",
        "not as a stripe-paid invoice",
        "paid=false",
    )
    if any(phrase in normalized for phrase in honest_negations):
        return False
    paid_claim_patterns = (
        r"\bstripe\s+(test\s+)?invoice\s+(is\s+)?paid\b",
        r"\bstripe-paid\s+invoice\b",
        r"\bpaid=true\b",
        r"\bpayment\s+(complete|completed|succeeded|successful)\b",
        r"\bcollected\s+by\s+stripe\b",
    )
    return any(re.search(pattern, normalized) for pattern in paid_claim_patterns)


def _is_unauthorized_connector_tool(tool_name: str) -> bool:
    lowered = tool_name.lower()
    return (
        lowered.startswith("connector.")
        or lowered.startswith("mcp.")
        or ".mcp." in lowered
        or lowered.startswith("email.")
        or lowered.startswith("gmail.")
        or lowered.startswith("prometheus.")
        or lowered.startswith("recall.")
        or lowered.startswith("openclaw.")
    )


def _safe_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _adapter_name(mode: str) -> str:
    if mode == "nemo_guardrails":
        return "nemo_guardrails"
    if mode == "nemo_compatible":
        return "nemo_compatible"
    return "local_policy"


def _adapter_status(
    mode: str,
    evaluations: list[dict[str, Any]],
    used_real_nemo: bool,
    fail_closed: bool,
) -> str:
    if fail_closed:
        return "failed_closed"
    if any(item.get("status") == "block" for item in evaluations):
        return "blocked_by_guardrail"
    if mode == "nemo_guardrails":
        if used_real_nemo:
            return "runtime_verified"
        return "selected_pending_runtime_probe" if not evaluations else "selected_unverified"
    if mode == "nemo_compatible":
        return "fallback_not_real_nemo"
    return "local_policy_active"


def _truthfulness_note(mode: str, used_real_nemo: bool, fail_closed: bool, blocked: bool) -> str:
    if fail_closed:
        return "Guardrails failed closed before protected actions could continue."
    if blocked:
        return "Guardrails blocked unsafe run content before protected actions could continue."
    if mode == "nemo_guardrails" and used_real_nemo:
        return (
            "Real NeMo runtime was verified through the configured Python path for this run. "
            "ScaleX local policy remains the deterministic business-rule gate."
        )
    if mode == "nemo_guardrails":
        return (
            "nemo_guardrails is selected, but real NeMo has not been verified in the current state yet."
        )
    if mode == "nemo_compatible":
        return (
            "NeMo-compatible fallback is selected. It is not real NeMo and used_real_nemo remains false."
        )
    return "Local policy is active now. Judge Demo Mode does not require NeMo or secrets."
