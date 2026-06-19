"""Hermes-backed planning service for the ScaleX demo loop."""

from __future__ import annotations

import json
from typing import Any

from ..config import Settings, get_settings
from .hermes_adapter import run_hermes_oneshot, sanitize_text
from .ledger_service import usd_to_cents
from .seed_service import load_seed_config


PROMPT_VERSION = "scalex_hermes_operating_plan_v1"
REQUIRED_PLAN_KEYS = {
    "operating_plan",
    "agent_task_list",
    "campaign_strategy",
    "executive_summary",
    "proposed_tool_sequence",
}


def generate_operating_plan(
    job: dict[str, Any],
    seed_config: dict[str, Any] | None = None,
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    seed_config = seed_config or load_seed_config()
    prompt = build_planning_prompt(job, seed_config)

    if settings.hermes_test_mode:
        plan = deterministic_test_plan(job, seed_config)
        return _planning_payload(
            settings=settings,
            status="completed",
            source="deterministic_test",
            prompt_text=prompt,
            result_json=plan,
            summary=plan["executive_summary"],
            error=None,
            hermes_metadata={
                "mode": settings.hermes_mode,
                "used_real_hermes": False,
                "provider": settings.hermes_provider,
                "model": settings.hermes_model,
                "error": None,
                "failure_reason": None,
                "duration_ms": 0,
                "command_safety_summary": (
                    "HERMES_TEST_MODE=true; deterministic planning output was used for tests."
                ),
                "skill_name": settings.hermes_skill_name,
                "toolsets_used": _toolsets(settings),
                "retry_count": 0,
            },
        )

    first_result = run_hermes_oneshot(prompt, settings)
    if not first_result.ok:
        return _planning_payload(
            settings=settings,
            status="failed",
            source="real_hermes",
            prompt_text=prompt,
            result_json=None,
            summary=None,
            error=first_result.failure_reason or "Hermes failed before returning a plan.",
            hermes_metadata={**first_result.metadata(), "retry_count": 0},
        )

    parsed_plan, parse_error = parse_planning_json(first_result.stdout)
    if parsed_plan is not None:
        return _planning_payload(
            settings=settings,
            status="completed",
            source="real_hermes",
            prompt_text=prompt,
            result_json=parsed_plan,
            summary=str(parsed_plan["executive_summary"]),
            error=None,
            hermes_metadata={**first_result.metadata(), "retry_count": 0},
        )

    repair_prompt = build_repair_prompt(first_result.stdout, parse_error or "Invalid JSON.")
    repair_result = run_hermes_oneshot(repair_prompt, settings)
    total_duration_ms = first_result.duration_ms + repair_result.duration_ms
    if not repair_result.ok:
        metadata = {**repair_result.metadata(), "retry_count": 1, "duration_ms": total_duration_ms}
        return _planning_payload(
            settings=settings,
            status="failed",
            source="real_hermes",
            prompt_text=prompt,
            result_json=None,
            summary=None,
            error=repair_result.failure_reason or "Hermes JSON repair retry failed.",
            hermes_metadata=metadata,
        )

    repaired_plan, repair_parse_error = parse_planning_json(repair_result.stdout)
    metadata = {**repair_result.metadata(), "retry_count": 1, "duration_ms": total_duration_ms}
    if repaired_plan is not None:
        metadata["command_safety_summary"] = (
            f"{metadata['command_safety_summary']} JSON repair retry was used."
        )
        return _planning_payload(
            settings=settings,
            status="completed",
            source="real_hermes",
            prompt_text=prompt,
            result_json=repaired_plan,
            summary=str(repaired_plan["executive_summary"]),
            error=None,
            hermes_metadata=metadata,
        )

    error = (
        "Hermes returned invalid planning JSON after one repair retry: "
        f"{repair_parse_error or parse_error or 'unknown parse error'}"
    )
    return _planning_payload(
        settings=settings,
        status="failed",
        source="real_hermes",
        prompt_text=prompt,
        result_json=None,
        summary=None,
        error=error,
        hermes_metadata=metadata,
    )


def build_planning_prompt(job: dict[str, Any], seed_config: dict[str, Any]) -> str:
    approved_spend = [
        {
            "vendor": item["vendor"],
            "amount_cents": usd_to_cents(item["amountUsd"]),
            "purpose": item["purpose"],
        }
        for item in seed_config["approvedSpendRequests"]
    ]
    blocked_spend = [
        {
            "vendor": item["vendor"],
            "amount_cents": usd_to_cents(item["amountUsd"]),
            "purpose": item["purpose"],
        }
        for item in seed_config["blockedSpendRequests"]
    ]

    prompt_payload = {
        "product": "ScaleX",
        "prototype_boundary": "local sandbox product prototype",
        "job": {
            "id": job["id"],
            "client_name": job["client_name"],
            "business_type": job["business_type"],
            "job_name": job["job_name"],
            "job_goal": job["job_goal"],
            "invoice_amount_cents": job["invoice_amount_cents"],
            "spend_cap_cents": job["spend_cap_cents"],
            "margin_floor_percent": job["margin_floor_percent"],
        },
        "known_spend_requests": {
            "approved_candidates": approved_spend,
            "blocked_candidate": blocked_spend,
        },
        "execution_boundary": [
            "Hermes may plan and coordinate the workflow only.",
            "Hermes must not approve spend.",
            "Hermes must not enforce policy.",
            "Hermes must not control Stripe, payment actions, secrets, or live money.",
            "ScaleX code remains the authority for policy, ledger, payment records, and agent execution.",
        ],
        "required_json_keys": sorted(REQUIRED_PLAN_KEYS),
        "allowed_scaleX_tool_sequence": expected_tool_sequence(),
    }

    return (
        "You are the ScaleX-isolated Hermes planning brain for a sandbox product run.\n"
        "Use the preloaded scalex-operator skill instructions for the planning boundary.\n"
        "Return strict JSON only. Do not wrap it in markdown. Do not include commentary.\n"
        "The JSON object must contain exactly these top-level keys: operating_plan, "
        "agent_task_list, campaign_strategy, executive_summary, proposed_tool_sequence.\n"
        "operating_plan should describe the safe service workflow phases.\n"
        "agent_task_list should assign Finance, Marketing, Research, and Ops tasks.\n"
        "campaign_strategy should describe the customer-facing campaign approach.\n"
        "executive_summary should be one concise paragraph.\n"
        "proposed_tool_sequence should be an ordered list of the allowed ScaleX tool names.\n"
        "Do not approve or reject spend; mention that policy decisions are made by ScaleX code.\n"
        "Input:\n"
        f"{json.dumps(prompt_payload, sort_keys=True)}"
    )


def build_repair_prompt(raw_output: str, parse_error: str) -> str:
    return (
        "Repair this ScaleX Hermes planning response into strict JSON only.\n"
        "Return one JSON object with exactly these top-level keys: operating_plan, "
        "agent_task_list, campaign_strategy, executive_summary, proposed_tool_sequence.\n"
        "Do not add markdown or commentary. Do not approve spend or control payment actions.\n"
        f"Parse error: {sanitize_text(parse_error)}\n"
        "Raw response:\n"
        f"{sanitize_text(raw_output)}"
    )


def parse_planning_json(raw_output: str) -> tuple[dict[str, Any] | None, str | None]:
    try:
        parsed = json.loads(_strip_code_fence(raw_output.strip()))
    except json.JSONDecodeError as exc:
        return None, f"JSON decode error at line {exc.lineno} column {exc.colno}: {exc.msg}"

    if not isinstance(parsed, dict):
        return None, "Planning output must be a JSON object."

    missing_keys = REQUIRED_PLAN_KEYS - set(parsed)
    extra_keys = set(parsed) - REQUIRED_PLAN_KEYS
    if missing_keys:
        return None, f"Planning output missing keys: {', '.join(sorted(missing_keys))}"
    if extra_keys:
        return None, f"Planning output has unsupported keys: {', '.join(sorted(extra_keys))}"
    if not isinstance(parsed["agent_task_list"], list):
        return None, "agent_task_list must be a list."
    if not isinstance(parsed["proposed_tool_sequence"], list):
        return None, "proposed_tool_sequence must be a list."
    if not str(parsed["executive_summary"]).strip():
        return None, "executive_summary must not be empty."

    return parsed, None


def deterministic_test_plan(job: dict[str, Any], seed_config: dict[str, Any] | None = None) -> dict[str, Any]:
    seed_config = seed_config or load_seed_config()
    return {
        "operating_plan": {
            "objective": (
                "Run the Harbor Fleet Services brake inspection campaign from intake "
                "through profit report while preserving the 50% margin floor."
            ),
            "phases": [
                "Confirm the $1,200 job and create sandbox payment records.",
                "Record revenue before any vendor spend is evaluated.",
                "Submit vendor spend requests to ScaleX policy code.",
                "Coordinate Finance, Marketing, Research, and Ops deliverables.",
                "Generate the final profit report from SQLite ledger totals.",
            ],
            "policy_boundary": "ScaleX policy code approves or blocks spend; Hermes only plans.",
        },
        "agent_task_list": [
            {
                "agent": "Finance",
                "task": "Reconcile revenue, approved spend, blocked spend, and gross profit.",
            },
            {
                "agent": "Marketing",
                "task": "Prepare campaign copy for the fleet brake inspection offer.",
            },
            {
                "agent": "Research",
                "task": "Summarize regional fleet maintenance positioning and buyer concerns.",
            },
            {
                "agent": "Ops",
                "task": "Prepare handoff notes for inspection scheduling and follow-up.",
            },
        ],
        "campaign_strategy": {
            "client": job["client_name"],
            "job": job["job_name"],
            "invoice_amount_cents": job["invoice_amount_cents"],
            "spend_cap_cents": job["spend_cap_cents"],
            "approved_spend_candidates": seed_config["approvedSpendRequests"],
            "blocked_spend_candidates": seed_config["blockedSpendRequests"],
        },
        "executive_summary": (
            "Plan the Harbor Fleet Services campaign as a revenue-backed service workflow: "
            "confirm sandbox payment, let ScaleX policy code govern spend, coordinate the "
            "four local agents, and report the final $1,013 gross profit target."
        ),
        "proposed_tool_sequence": expected_tool_sequence(),
    }


def expected_tool_sequence() -> list[str]:
    return [
        "job.create",
        "planning.generate_operating_plan",
        "stripe.create_customer",
        "stripe.create_invoice",
        "stripe.create_payment_link",
        "stripe.confirm_payment",
        "ledger.record_revenue",
        "policy.check_spend",
        "ledger.record_spend",
        "policy.check_spend",
        "ledger.record_spend",
        "policy.check_spend",
        "agent.run_finance",
        "agent.run_marketing",
        "agent.run_research",
        "agent.run_ops",
        "report.generate",
    ]


def _strip_code_fence(raw_output: str) -> str:
    if not raw_output.startswith("```"):
        return raw_output
    lines = raw_output.splitlines()
    if len(lines) >= 3 and lines[-1].strip() == "```":
        return "\n".join(lines[1:-1])
    return raw_output


def _planning_payload(
    *,
    settings: Settings,
    status: str,
    source: str,
    prompt_text: str,
    result_json: dict[str, Any] | None,
    summary: str | None,
    error: str | None,
    hermes_metadata: dict[str, Any],
) -> dict[str, Any]:
    return {
        "mode": settings.hermes_mode,
        "provider": settings.hermes_provider,
        "model": settings.hermes_model,
        "source": source,
        "status": status,
        "prompt_version": PROMPT_VERSION,
        "prompt_text": prompt_text,
        "result_json": result_json,
        "summary": summary,
        "error": sanitize_text(error) if error else None,
        "hermes_metadata": hermes_metadata,
    }


def _toolsets(settings: Settings) -> list[str]:
    return [
        item.strip()
        for item in settings.hermes_toolsets.split(",")
        if item.strip()
    ]
