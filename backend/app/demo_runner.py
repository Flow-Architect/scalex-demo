"""One-click local demo runner for the ScaleX lifecycle.

The runner composes the ScaleX product loop. Product mode calls the
ScaleX-isolated Hermes CLI for planning, then ScaleX code executes the
payment-shaped, policy, ledger, agent, and report steps locally.
"""

from __future__ import annotations

from contextlib import closing
from dataclasses import replace
import time
from typing import Any

from . import repository
from .config import Settings, get_settings
from .db import database_path, get_connection, initialize_database
from .services.agent_service import create_demo_agent_output, record_demo_agent_work_complete
from .services.economics_service import enterprise_report_totals
from .services.guardrails_service import (
    GuardrailIntegrationError,
    evaluate_and_record_guardrail_stage,
)
from .services.hermes_adapter import sanitize_text
from .services.ledger_service import ledger_totals, usd_to_cents
from .services.payment_service import mark_job_paid
from .services.planning_service import generate_operating_plan
from .services.policy_service import (
    apply_spend_request,
    policy_config_for_seed,
    record_approved_spend_ledger_entry,
)
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


FINAL_RECOMMENDATION = "Proceed with implementation launch while preserving setup spend guardrails"
def run_demo() -> dict[str, Any]:
    initialize_database()
    settings = get_settings()
    execution_settings = _settings_for_execution(settings)

    with closing(get_connection()) as connection:
        sequence = 0

        job_started_at = time.monotonic()
        seed_config, workflow = _active_workflow_seed(connection)
        job = seed_demo_database(
            connection,
            seed_config,
            job_id=repository.new_run_job_id(),
            workflow_id=workflow["id"],
            deterministic_event_ids=False,
        )
        try:
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="input",
                payload={"job": job, "seed_config": seed_config},
                settings=execution_settings,
            )
        except GuardrailIntegrationError as exc:
            return _guardrail_failed_response(connection, job, exc)
        _record_run_started(connection, job, settings)
        repository.upsert_onboarding_config(connection, seed_config)
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
        planning_result = generate_operating_plan(job, seed_config, settings=execution_settings)
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
        try:
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="planning",
                payload={"planning_result": planning_result},
                settings=execution_settings,
            )
        except GuardrailIntegrationError as exc:
            return _guardrail_failed_response(connection, job, exc)

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
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="execution",
                payload=_execution_guardrail_payload(
                    connection,
                    job,
                    phase="pre_finance_action",
                    action_requests=_stripe_action_requests(job, execution_settings),
                    stripe_summary={
                        "stripe_mode": (
                            "test_double"
                            if execution_settings.stripe_test_double_mode
                            else "stripe_test"
                        ),
                        "livemode": execution_settings.stripe_live_mode,
                    },
                ),
                settings=execution_settings,
            )
            sequence, payment_status = _run_stripe_sequence(
                connection,
                job,
                sequence,
                planning_run_id,
                execution_settings,
            )
            ledger_metadata = payment_ledger_metadata(payment_status, job)
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="execution",
                payload=_execution_guardrail_payload(
                    connection,
                    job,
                    phase="pre_revenue_ledger_action",
                    action_requests=[
                        {
                            "tool_name": "ledger.record_revenue",
                            "job_id": job["id"],
                            "amount_cents": int(job["invoice_amount_cents"]),
                            "ledger_source": ledger_metadata["ledger_source"],
                            "ledger_label": ledger_metadata["ledger_label"],
                            "stripe_paid_claimed": ledger_metadata["ledger_source"]
                            == "stripe_test_invoice_paid",
                        }
                    ],
                    stripe_summary=_stripe_summary_for_guardrail(payment_status),
                ),
                settings=execution_settings,
            )
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
        except GuardrailIntegrationError as exc:
            return _guardrail_failed_response(connection, job, exc)

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
                **ledger_metadata,
            ),
        )
        try:
            sequence = _run_policy_spend_sequence(
                connection,
                job,
                sequence,
                planning_run_id,
                seed_config,
                execution_settings,
            )
        except GuardrailIntegrationError as exc:
            return _guardrail_failed_response(connection, job, exc)
        try:
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="execution",
                payload={
                    "phase": "post_execution_consistency",
                    "policy_checks": repository.list_policy_checks(connection, job["id"]),
                    "ledger_entries": repository.list_ledger_entries(connection, job["id"]),
                    "stripe_summary": _stripe_summary_for_guardrail(payment_status),
                },
                settings=execution_settings,
            )
        except GuardrailIntegrationError as exc:
            return _guardrail_failed_response(connection, job, exc)

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
        try:
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="output",
                payload={
                    "report": _report,
                    "totals": _enterprise_report_totals(
                        job,
                        ledger_totals(
                            job,
                            repository.list_ledger_entries(connection, job["id"]),
                            repository.list_policy_checks(connection, job["id"]),
                        ),
                    ),
                    "stripe_summary": _stripe_summary_for_guardrail(payment_status),
                },
                settings=execution_settings,
            )
        except GuardrailIntegrationError as exc:
            return _guardrail_failed_response(connection, job, exc)
        repository.update_job_status(connection, job["id"], "complete")
        repository.create_event(
            connection,
            job_id=job["id"],
            type="job_complete",
            title=f"{job['client_name']} client operation run completed",
            detail=(
                "Completed the compressed local ClientOps lifecycle from intake through final profit outcome. "
                "Stripe/payment records are labeled with their actual execution mode."
            ),
            status="complete",
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
    settings: Settings,
) -> tuple[int, dict[str, Any]]:
    sequence, customer = _execute_tool(
        connection,
        job=job,
        sequence=sequence,
        planning_run_id=planning_run_id,
        tool_name="stripe.create_customer",
        tool_input_json={"job_id": job["id"], "client_name": job["client_name"]},
        operation=lambda: create_stripe_customer(connection, job, settings=settings),
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
        operation=lambda: create_stripe_invoice(connection, job, customer, settings=settings),
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
        operation=lambda: prepare_stripe_payment_url(
            connection,
            job,
            invoice_result,
            settings=settings,
        ),
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
        operation=lambda: confirm_stripe_payment_status(connection, job, invoice, settings=settings),
    )
    record_stripe_lifecycle_note(connection, job, payment_status, settings=settings)
    return sequence, payment_status


def _settings_for_execution(settings: Settings) -> Settings:
    if settings.scalex_execution_mode == "demo":
        return replace(
            settings,
            hermes_test_mode=True,
            hermes_require_real=False,
            stripe_test_double_mode=True,
        )
    return settings


def _guardrail_failed_response(
    connection,
    job: dict[str, Any],
    exc: GuardrailIntegrationError,
) -> dict[str, Any]:
    result = exc.result
    repository.update_job_status(connection, job["id"], "guardrail_error")
    fail_closed = bool(result.get("fail_closed"))
    title = "Guardrail adapter failed closed" if fail_closed else "Guardrail blocked unsafe run content"
    repository.create_event(
        connection,
        job_id=job["id"],
        type="guardrail_fail_closed" if fail_closed else "guardrail_blocked",
        title=title,
        detail=sanitize_text(str(exc)),
        status="failed",
    )
    connection.commit()
    state = build_demo_state(connection)
    state["database"]["path"] = str(database_path())
    state["database"]["exists"] = database_path().exists()
    return {
        "status": "guardrail_failed",
        "state": state,
        "decision": {
            "guardrail_mode": result.get("mode"),
            "stage": result.get("stage"),
            "decision": result.get("decision") or result.get("status"),
            "fail_closed": fail_closed,
            "used_real_nemo": bool(result.get("used_real_nemo")),
            "error": result.get("error") or result.get("summary"),
        },
    }


def _record_run_started(connection, job: dict[str, Any], settings: Settings) -> dict[str, Any]:
    demo_mode = settings.scalex_execution_mode == "demo"
    detail = (
        "Run started in Demo proof mode with deterministic local planning, "
        "Stripe test-double sandbox finance proof, and local policy enforcement."
        if demo_mode
        else (
            "Run started in Full Proof Mode with the configured isolated Hermes "
            "and Stripe test-mode paths. Missing credentials will stop the run with "
            "a visible integration error."
        )
    )
    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="run_started",
        title=f"{job['client_name']} client operation run started",
        detail=detail,
        status="started",
    )
    connection.commit()
    return event


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
            f"${job['spend_cap_cents'] / 100:,.0f} setup spend cap, "
            f"${projected_profit_cents / 100:,.0f} projected profit, and "
            f"{projected_margin_percent}% projected margin against a "
            f"{job['margin_floor_percent']}% floor."
        ),
        status="planned",
    )
    connection.commit()


def _record_payment_gate_note(connection, job: dict[str, Any]) -> None:
    repository.create_event(
        connection,
        job_id=job["id"],
        type="policy_gate",
        title="Setup spend locked until local payment confirmation",
        detail=(
            "The local policy engine requires payment confirmation before setup spend. "
            "The one-click path records this as a timeline note instead of creating a pre-payment block, "
            "so prerequisite blocks do not inflate final blocked spend."
        ),
        status="guarded",
    )
    connection.commit()


def _execution_guardrail_payload(
    connection,
    job: dict[str, Any],
    *,
    phase: str,
    action_requests: list[dict[str, Any]] | None = None,
    stripe_summary: dict[str, Any] | None = None,
    policy_check: dict[str, Any] | None = None,
) -> dict[str, Any]:
    payload = {
        "phase": phase,
        "action_requests": action_requests or [],
        "policy_checks": repository.list_policy_checks(connection, job["id"]),
        "ledger_entries": repository.list_ledger_entries(connection, job["id"]),
        "stripe_summary": stripe_summary or {},
    }
    if policy_check is not None:
        payload["policy_check"] = policy_check
    return payload


def _stripe_action_requests(job: dict[str, Any], settings: Settings) -> list[dict[str, Any]]:
    stripe_mode = "test_double" if settings.stripe_test_double_mode else "stripe_test"
    return [
        {
            "tool_name": "stripe.create_customer",
            "job_id": job["id"],
            "client_name": job["client_name"],
            "mode": stripe_mode,
            "livemode": settings.stripe_live_mode,
        },
        {
            "tool_name": "stripe.create_invoice",
            "job_id": job["id"],
            "amount_cents": int(job["invoice_amount_cents"]),
            "mode": stripe_mode,
            "livemode": settings.stripe_live_mode,
        },
        {
            "tool_name": "stripe.prepare_payment_url",
            "job_id": job["id"],
            "mode": stripe_mode,
            "livemode": settings.stripe_live_mode,
        },
        {
            "tool_name": "stripe.confirm_payment_status",
            "job_id": job["id"],
            "mode": stripe_mode,
            "livemode": settings.stripe_live_mode,
        },
    ]


def _record_stripe_error(connection, job: dict[str, Any], exc: StripeIntegrationError) -> dict[str, Any]:
    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="stripe_integration_error",
        title="Stripe test-mode integration failed",
        detail=sanitize_text(str(exc)),
        status="failed",
    )
    connection.commit()
    return event


def _run_policy_spend_sequence(
    connection,
    job: dict[str, Any],
    sequence: int,
    planning_run_id: str,
    seed_config: dict[str, Any],
    settings: Settings,
) -> int:
    policy_config = _policy_config_for_seed(seed_config)
    spend_requests = [
        (item["vendor"], usd_to_cents(item["amountUsd"]))
        for item in seed_config.get("approvedSpendRequests", [])
    ]
    spend_requests.extend(
        (item["vendor"], usd_to_cents(item["amountUsd"]))
        for item in seed_config.get("blockedSpendRequests", [])
    )
    for vendor, amount_cents in spend_requests:
        evaluate_and_record_guardrail_stage(
            connection,
            job=job,
            stage="execution",
            payload=_execution_guardrail_payload(
                connection,
                job,
                phase="pre_spend_policy_action",
                action_requests=[
                    {
                        "tool_name": "policy.check_spend",
                        "job_id": job["id"],
                        "vendor": vendor,
                        "requested_amount_cents": amount_cents,
                    }
                ],
            ),
            settings=settings,
        )
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
                policy_config=policy_config,
                create_ledger_entry=False,
            ),
        )
        policy_check = result["policy_check"]
        if bool(policy_check.get("approved")):
            evaluate_and_record_guardrail_stage(
                connection,
                job=job,
                stage="execution",
                payload=_execution_guardrail_payload(
                    connection,
                    job,
                    phase="pre_spend_ledger_action",
                    action_requests=[
                        {
                            "tool_name": "ledger.record_spend",
                            "job_id": job["id"],
                            "policy_check_id": policy_check["id"],
                            "policy_check": policy_check,
                            "vendor": vendor,
                            "amount_cents": amount_cents,
                        }
                    ],
                    policy_check=policy_check,
                ),
                settings=settings,
            )
            sequence, _ledger_entry = _execute_tool(
                connection,
                job=job,
                sequence=sequence,
                planning_run_id=planning_run_id,
                tool_name="ledger.record_spend",
                tool_input_json={
                    "job_id": job["id"],
                    "policy_check_id": policy_check["id"],
                    "vendor": vendor,
                    "amount_cents": amount_cents,
                },
                operation=lambda vendor=vendor, amount_cents=amount_cents: {
                    "ledger_entry": record_approved_spend_ledger_entry(
                        connection,
                        job=job,
                        vendor=vendor,
                        requested_amount_cents=amount_cents,
                    )
                },
            )
    return sequence


def _stripe_summary_for_guardrail(payment_status: dict[str, Any]) -> dict[str, Any]:
    paid_value = payment_status.get("paid")
    return {
        "stripe_mode": payment_status.get("provider_mode") or payment_status.get("mode"),
        "livemode": bool(payment_status.get("livemode")),
        "invoice_status": payment_status.get("invoice_status"),
        "paid": None if paid_value is None else bool(paid_value),
    }


def _create_final_report(connection, job: dict[str, Any]) -> dict[str, Any]:
    ledger_entries = repository.list_ledger_entries(connection, job["id"])
    policy_checks = repository.list_policy_checks(connection, job["id"])
    totals = ledger_totals(job, ledger_entries, policy_checks)
    report_totals = _enterprise_report_totals(job, totals)

    report = repository.create_report(
        connection,
        job_id=job["id"],
        revenue_cents=int(report_totals["revenue_cents"]),
        approved_spend_cents=int(report_totals["approved_spend_cents"]),
        blocked_spend_cents=int(report_totals["blocked_spend_cents"]),
        gross_profit_cents=int(report_totals["gross_profit_cents"]),
        margin_percent=float(report_totals["actual_margin_percent"]),
        policy_violations=0,
        recommendation=FINAL_RECOMMENDATION,
        report_markdown=_final_report_markdown(job, report_totals),
    )
    repository.create_event(
        connection,
        job_id=job["id"],
        type="profit_report",
        title="Final profit report created",
        detail=(
            f"${report_totals['revenue_cents'] / 100:,.0f} revenue, "
            f"${report_totals['approved_spend_cents'] / 100:,.0f} approved delivery costs, "
            f"${report_totals['blocked_spend_cents'] / 100:,.0f} blocked risk, "
            f"${report_totals['gross_profit_cents'] / 100:,.0f} protected profit, and "
            f"{report_totals['actual_margin_percent']}% final margin."
        ),
        status="complete",
    )
    connection.commit()
    return report


def _final_report_markdown(job: dict[str, Any], totals: dict[str, Any]) -> str:
    return f"""# {job['client_name']} Profit Outcome

Implementation package revenue: ${totals['revenue_cents'] / 100:,.0f}

Approved delivery cost basis: ${totals['approved_spend_cents'] / 100:,.0f}

Setup/tool spend: ${totals['setup_tool_spend_cents'] / 100:,.0f}

Labor cost: ${totals['labor_cost_cents'] / 100:,.0f}

Blocked risk: ${totals['blocked_spend_cents'] / 100:,.0f}

Margin if risky spend approved: {totals['margin_if_blocked_approved_percent']}%

Protected profit: ${totals['gross_profit_cents'] / 100:,.0f}

Protected margin: {totals['actual_margin_percent']}%

Policy violations: 0

Recommendation: {FINAL_RECOMMENDATION}."""


def _enterprise_report_totals(job: dict[str, Any], ledger_based_totals: dict[str, Any]) -> dict[str, Any]:
    revenue_cents = int(ledger_based_totals["revenue_cents"])
    setup_tool_spend_cents = int(ledger_based_totals["approved_spend_cents"])
    blocked_spend_cents = int(ledger_based_totals["blocked_spend_cents"])
    return enterprise_report_totals(
        revenue_cents=revenue_cents,
        setup_tool_spend_cents=setup_tool_spend_cents,
        blocked_spend_cents=blocked_spend_cents,
        margin_floor_percent=float(job["margin_floor_percent"]),
    )


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
        )

    return repository.create_event(
        connection,
        job_id=job["id"],
        type="hermes_integration_error",
        title="Hermes planning failed",
        detail=planning_result["error"] or "Hermes failed before returning a usable plan.",
        status="failed",
    )


def _duration_ms(started_at: float) -> int:
    return round((time.monotonic() - started_at) * 1000)


def _active_workflow_seed(connection) -> tuple[dict[str, Any], dict[str, Any]]:
    default_seed = load_seed_config()
    workflow = repository.get_active_workflow(connection)
    if workflow is None:
        workflow = repository.create_workflow(
            connection,
            default_seed,
            workflow_id=repository.NORTHSTAR_WORKFLOW_ID,
            activate=True,
        )
        repository.upsert_onboarding_config(connection, default_seed)
        connection.commit()
    seed_config = repository.workflow_seed_config(workflow)
    return seed_config, workflow


def _policy_config_for_seed(seed_config: dict[str, Any]) -> dict[str, Any]:
    return policy_config_for_seed(seed_config)
