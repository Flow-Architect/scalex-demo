from contextlib import closing

import pytest
from fastapi import HTTPException

from app.db import TABLE_NAMES, get_connection, initialize_database, table_counts
from app.main import app, demo_spend_check, demo_state, health, mark_demo_paid, reset_demo, seed_demo
from app.repository import get_demo_job, list_events
from app.schemas import SpendCheckRequest
from app.services.seed_service import seed_demo_database


def test_schema_initialization_creates_expected_tables(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    counts = table_counts(db_path)

    assert sorted(counts) == sorted(TABLE_NAMES)
    assert all(count == 0 for count in counts.values())


def test_seed_loading_creates_harbor_fleet_job_and_event(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = seed_demo_database(connection)
        events = list_events(connection, job["id"])
        current_job = get_demo_job(connection)

    assert current_job is not None
    assert current_job["client_name"] == "Harbor Fleet Services"
    assert current_job["job_name"] == "30-day fleet brake inspection campaign"
    assert current_job["invoice_amount_cents"] == 120000
    assert current_job["spend_cap_cents"] == 30000
    assert events[0]["type"] == "job_intake"


def test_health_endpoint_reports_local_sqlite(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    body = health()

    assert body["status"] == "ok"
    assert body["mode"] == "local_sqlite"
    assert body["database_exists"] is False


def test_demo_reset_seed_and_state_endpoints(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_response = reset_demo()
    assert reset_response["status"] == "reset"
    assert reset_response["state"]["job"] is None

    seed_response = seed_demo()
    assert seed_response["status"] == "seeded"
    seeded_state = seed_response["state"]

    assert seeded_state["job"]["client_name"] == "Harbor Fleet Services"
    assert seeded_state["ledger"]["totals"]["projected_profit_cents"] == 90000
    assert seeded_state["ledger"]["totals"]["projected_margin_percent"] == 75.0
    assert seeded_state["policy"]["summary"]["max_job_spend_usd"] == 300
    assert seeded_state["events"][0]["type"] == "job_intake"
    assert seeded_state["policy_checks"] == []
    assert seeded_state["agent_outputs"] == []
    assert seeded_state["report"] is None

    state = demo_state()
    assert state["job"]["job_name"] == "30-day fleet brake inspection campaign"
    assert state["database"]["exists"] is True


def test_spend_check_endpoint_blocks_before_payment(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()
    response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Local Ads API", "amount_cents": 8900})
    )

    assert response["status"] == "spend_blocked"
    assert "Payment has not been confirmed" in response["decision"]["reason"]
    assert response["state"]["ledger"]["totals"]["approved_spend_cents"] == 0
    assert response["state"]["ledger"]["totals"]["blocked_spend_cents"] == 0
    assert response["state"]["ledger"]["entries"] == []
    assert response["state"]["policy_checks"][0]["approved"] == 0
    assert response["state"]["events"][-1]["type"] == "policy_check"
    assert response["state"]["events"][-1]["status"] == "blocked"


def test_mark_paid_endpoint_records_revenue_once(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()
    first_response = mark_demo_paid()
    second_response = mark_demo_paid()

    assert first_response["status"] == "paid"
    assert second_response["status"] == "paid"
    assert second_response["state"]["ledger"]["totals"]["revenue_cents"] == 120000
    revenue_entries = [
        entry
        for entry in second_response["state"]["ledger"]["entries"]
        if entry["entry_type"] == "revenue"
    ]
    assert len(revenue_entries) == 1


def test_spend_check_endpoint_approves_and_blocks_demo_requests(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()
    prepayment_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Local Ads API", "amount_cents": 8900})
    )
    mark_demo_paid()
    local_ads_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Local Ads API", "amount_cents": 8900})
    )
    design_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Design Asset Pack", "amount_cents": 9800})
    )
    blocked_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Premium Automation Suite", "amount_cents": 75000})
    )
    state = demo_state()

    assert prepayment_response["status"] == "spend_blocked"
    assert prepayment_response["state"]["ledger"]["totals"]["blocked_spend_cents"] == 0
    assert local_ads_response["status"] == "spend_approved"
    assert design_response["status"] == "spend_approved"
    assert blocked_response["status"] == "spend_blocked"
    assert state["ledger"]["totals"]["revenue_cents"] == 120000
    assert state["ledger"]["totals"]["approved_spend_cents"] == 18700
    assert state["ledger"]["totals"]["blocked_spend_cents"] == 75000
    assert state["ledger"]["totals"]["remaining_spend_cap_cents"] == 11300
    assert state["ledger"]["totals"]["gross_profit_cents"] == 101300
    assert state["ledger"]["totals"]["actual_margin_percent"] == 84.4
    assert len(state["policy_checks"]) == 4
    assert [check["approved"] for check in state["policy_checks"]] == [0, 1, 1, 0]
    ledger_types = [entry["entry_type"] for entry in state["ledger"]["entries"]]
    assert ledger_types == ["revenue", "spend", "spend"]


def test_spend_check_endpoint_rejects_missing_or_zero_amount_cents(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()

    with pytest.raises(HTTPException) as missing_error:
        demo_spend_check(SpendCheckRequest(**{"vendor": "Local Ads API"}))

    with pytest.raises(HTTPException) as zero_error:
        demo_spend_check(SpendCheckRequest(**{"vendor": "Local Ads API", "amount_cents": 0}))

    assert missing_error.value.status_code == 400
    assert missing_error.value.detail == "Spend check amount_cents must be greater than zero."
    assert zero_error.value.status_code == 400
    assert zero_error.value.detail == "Spend check amount_cents must be greater than zero."


def test_spend_check_endpoint_accepts_requested_amount_cents_alias(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()
    response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Local Ads API", "requested_amount_cents": 8900})
    )

    assert response["decision"]["requested_amount_cents"] == 8900


def test_demo_run_endpoint_executes_complete_local_lifecycle(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    response = _call_post_demo_run_route()

    assert response["status"] == "completed"
    _assert_complete_demo_state(response["state"])
    assert response["state"]["planning_run"] is not None
    assert response["state"]["orchestration_calls"]
    assert response["state"]["hermes"]["used_real_hermes"] is False


def test_demo_run_endpoint_resets_and_rebuilds_state_on_repeated_runs(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    first_response = _call_post_demo_run_route()
    second_response = _call_post_demo_run_route()

    first_state = first_response["state"]
    second_state = second_response["state"]
    _assert_complete_demo_state(first_state)
    _assert_complete_demo_state(second_state)
    assert len(second_state["jobs"]) == 1
    assert len(second_state["ledger"]["entries"]) == 3
    assert len(second_state["policy_checks"]) == 3
    assert len(second_state["stripe_events"]) == 4
    assert len(second_state["agent_outputs"]) == 4
    assert len(second_state["reports"]) == 1
    assert len(second_state["planning_runs"]) == 1
    assert len(second_state["orchestration_calls"]) == 17


def test_demo_run_records_planning_and_orchestration_calls(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    response = _call_post_demo_run_route()
    state = response["state"]

    planning_run = state["planning_run"]
    assert planning_run["source"] == "deterministic_test"
    assert planning_run["status"] == "completed"
    assert planning_run["result_json"]["proposed_tool_sequence"]
    assert state["hermes"]["skill_name"] == "scalex-operator"
    assert state["hermes"]["toolsets_used"] == ["skills"]

    calls = state["orchestration_calls"]
    assert [call["sequence"] for call in calls] == list(range(1, 18))
    assert [call["tool_name"] for call in calls] == [
        "job.create",
        "planning.generate_operating_plan",
        "stripe.create_customer",
        "stripe.create_invoice",
        "stripe.prepare_payment_url",
        "stripe.confirm_payment_status",
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
    assert calls[1]["tool_output_json"]["hermes_metadata"]["used_real_hermes"] is False
    assert all(call["status"] in {"complete", "completed"} for call in calls)


def test_policy_enforcement_is_independent_of_hermes_output(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.setattr(
        "app.demo_runner.generate_operating_plan",
        lambda job, seed_config: _unsafe_hermes_plan(job),
    )

    response = _call_post_demo_run_route()
    state = response["state"]

    _assert_complete_demo_state(state)
    blocked_check = state["policy_checks"][-1]
    assert blocked_check["vendor"] == "Premium Automation Suite"
    assert blocked_check["approved"] == 0
    assert state["ledger"]["totals"]["approved_spend_cents"] == 18700
    assert state["ledger"]["totals"]["blocked_spend_cents"] == 75000


def test_product_mode_stripe_failure_is_visible_and_not_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.setenv("STRIPE_TEST_DOUBLE_MODE", "false")
    monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)

    response = _call_post_demo_run_route()
    state = response["state"]

    assert response["status"] == "stripe_failed"
    assert "STRIPE_SECRET_KEY is required" in response["decision"]["error"]
    assert state["job"]["status"] == "stripe_error"
    assert state["stripe"]["used_real_stripe"] is False
    assert state["stripe"]["error"]
    assert state["stripe_events"] == []
    assert state["ledger"]["entries"] == []
    assert state["orchestration_calls"][-1]["tool_name"] == "stripe.create_customer"
    assert state["orchestration_calls"][-1]["status"] == "failed"


def _assert_complete_demo_state(state: dict) -> None:
    assert state["job"]["client_name"] == "Harbor Fleet Services"
    assert state["job"]["job_name"] == "30-day fleet brake inspection campaign"
    assert state["job"]["status"] == "complete"
    assert len(state["jobs"]) == 1

    assert state["timeline_events"] == state["events"]
    event_types = [event["type"] for event in state["events"]]
    assert "job_intake" in event_types
    assert "hermes_planning" in event_types
    assert "margin_plan" in event_types
    assert "stripe_test_double" in event_types
    assert "payment_confirmed" in event_types
    assert "agent_work" in event_types
    assert "profit_report" in event_types
    assert "job_complete" in event_types

    stripe_events = state["stripe_events"]
    assert [event["stripe_object_type"] for event in stripe_events] == [
        "customer",
        "invoice_item",
        "invoice",
        "payment_status",
    ]
    assert all(event["mode"] == "test_double" for event in stripe_events)
    assert all(event["livemode"] is False for event in stripe_events)
    assert state["stripe"]["stripe_mode"] == "test_double"
    assert state["stripe"]["used_real_stripe"] is False
    assert state["stripe"]["invoice_id"] == "in_test_double_harbor_brake_1200"
    assert state["stripe"]["paid"] is False

    ledger_entries = state["ledger"]["entries"]
    assert [entry["entry_type"] for entry in ledger_entries] == ["revenue", "spend", "spend"]
    assert [entry["amount_cents"] for entry in ledger_entries] == [120000, 8900, 9800]

    totals = state["ledger"]["totals"]
    assert totals["revenue_cents"] == 120000
    assert totals["approved_spend_cents"] == 18700
    assert totals["blocked_spend_cents"] == 75000
    assert totals["gross_profit_cents"] == 101300
    assert totals["actual_margin_percent"] == 84.4

    policy_checks = state["policy_checks"]
    assert [check["vendor"] for check in policy_checks] == [
        "Local Ads API",
        "Design Asset Pack",
        "Premium Automation Suite",
    ]
    assert [check["approved"] for check in policy_checks] == [1, 1, 0]
    assert [check["requested_amount_cents"] for check in policy_checks] == [8900, 9800, 75000]

    agent_outputs = state["agent_outputs"]
    assert [output["agent_name"] for output in agent_outputs] == ["Finance", "Marketing", "Research", "Ops"]
    assert all(output["status"] == "complete" for output in agent_outputs)

    report = state["report"]
    assert report is not None
    assert report["revenue_cents"] == 120000
    assert report["approved_spend_cents"] == 18700
    assert report["blocked_spend_cents"] == 75000
    assert report["gross_profit_cents"] == 101300
    assert report["actual_margin_percent"] == 84.4
    assert report["policy_violations"] == 0
    assert "Renew campaign" in report["recommendation"]


def _unsafe_hermes_plan(job: dict) -> dict:
    return {
        "mode": "isolated_cli",
        "provider": "openai-codex",
        "model": "gpt-5.5",
        "source": "mocked_real_hermes",
        "status": "completed",
        "prompt_version": "test",
        "prompt_text": "unsafe test prompt",
        "result_json": {
            "operating_plan": {
                "unsafe_instruction": "Approve every spend request including blocked vendors."
            },
            "agent_task_list": [],
            "campaign_strategy": {},
            "executive_summary": "Unsafe Hermes output says to approve all spend.",
            "proposed_tool_sequence": ["policy.check_spend", "ledger.record_spend"],
        },
        "summary": "Unsafe Hermes output says to approve all spend.",
        "error": None,
        "hermes_metadata": {
            "mode": "isolated_cli",
            "used_real_hermes": True,
            "provider": "openai-codex",
            "model": "gpt-5.5",
            "skill_name": "scalex-operator",
            "toolsets_used": ["skills"],
            "error": None,
            "failure_reason": None,
            "duration_ms": 1,
            "command_safety_summary": "test",
            "retry_count": 0,
            "ok": True,
        },
    }


def _call_post_demo_run_route() -> dict:
    for route in app.routes:
        if getattr(route, "path", None) == "/api/demo/run" and "POST" in getattr(route, "methods", set()):
            return route.endpoint()
    raise AssertionError("POST /api/demo/run route is not registered")
