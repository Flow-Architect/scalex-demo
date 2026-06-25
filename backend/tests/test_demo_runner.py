from contextlib import closing
from types import SimpleNamespace

import pytest
from fastapi import HTTPException, Response

from app.db import TABLE_NAMES, get_connection, initialize_database, table_counts
from app.main import (
    app,
    demo_spend_check,
    demo_state,
    health,
    mark_demo_paid,
    onboard_demo_customer,
    reset_demo,
    seed_demo,
    select_demo_workflow,
)
from app.repository import get_demo_job, list_events
from app.schemas import OnboardingRequest, SpendCheckRequest
from app.services.auth_service import auth_status, logout, require_local_session, sign_session_token
from app.services.seed_service import seed_demo_database


def test_schema_initialization_creates_expected_tables(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    counts = table_counts(db_path)

    assert sorted(counts) == sorted(TABLE_NAMES)
    assert all(count == 0 for count in counts.values())


def test_seed_loading_creates_northstar_implementation_job_and_event(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = seed_demo_database(connection)
        events = list_events(connection, job["id"])
        current_job = get_demo_job(connection)

    assert current_job is not None
    assert current_job["client_name"] == "Northstar Dental Group"
    assert current_job["job_name"] == "Client Implementation Launch"
    assert current_job["invoice_amount_cents"] == 850000
    assert current_job["spend_cap_cents"] == 115000
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

    assert seeded_state["job"]["client_name"] == "Northstar Dental Group"
    assert seeded_state["ledger"]["totals"]["projected_profit_cents"] == 735000
    assert seeded_state["ledger"]["totals"]["projected_margin_percent"] == 86.5
    assert seeded_state["policy"]["summary"]["max_job_spend_usd"] == 1150
    assert seeded_state["events"][0]["type"] == "job_intake"
    assert seeded_state["policy_checks"] == []
    assert seeded_state["agent_outputs"] == []
    assert seeded_state["report"] is None

    state = demo_state()
    assert state["job"]["job_name"] == "Client Implementation Launch"
    assert state["database"]["exists"] is True


def test_auth_disabled_does_not_require_credentials_for_tests(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.setenv("SCALEX_AUTH_ENABLED", "false")

    request = SimpleNamespace(cookies={})
    status = auth_status(request)
    require_local_session(request)
    state_response = demo_state()

    assert status["auth_enabled"] is False
    assert status["authenticated"] is True
    assert state_response["database"]["initialized"] is True


def test_auth_enabled_requires_login_for_demo_endpoints(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.setenv("SCALEX_AUTH_ENABLED", "true")
    monkeypatch.setenv("SCALEX_DEMO_USERNAME", "operator")
    monkeypatch.setenv("SCALEX_DEMO_PASSWORD", "local-password")
    monkeypatch.setenv("SCALEX_SESSION_SECRET", "test-session-secret")

    missing_cookie_request = SimpleNamespace(cookies={})
    token = sign_session_token(username="operator")
    valid_cookie_request = SimpleNamespace(cookies={"scalex_session": token})

    with pytest.raises(HTTPException) as exc:
        require_local_session(missing_cookie_request)

    require_local_session(valid_cookie_request)
    status = auth_status(valid_cookie_request)

    assert exc.value.status_code == 401
    assert status["auth_enabled"] is True
    assert status["authenticated"] is True
    assert status["username"] == "operator"


def test_logout_clears_enabled_session_and_preserves_disabled_auth(monkeypatch) -> None:
    monkeypatch.setenv("SCALEX_AUTH_ENABLED", "true")
    monkeypatch.setenv("SCALEX_SESSION_SECRET", "test-session-secret")

    enabled_response = Response()
    enabled_status = logout(enabled_response)
    enabled_cookie = enabled_response.headers.get("set-cookie", "")

    assert enabled_status["auth_enabled"] is True
    assert enabled_status["authenticated"] is False
    assert "scalex_session=" in enabled_cookie
    assert "Max-Age=0" in enabled_cookie
    assert "Path=/" in enabled_cookie

    monkeypatch.setenv("SCALEX_AUTH_ENABLED", "false")

    disabled_response = Response()
    disabled_status = logout(disabled_response)

    assert disabled_status == {
        "auth_enabled": False,
        "authenticated": True,
        "username": "local-prototype",
        "prototype_auth": "disabled",
    }


def test_onboarding_endpoint_saves_and_selects_local_workflow(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    response = onboard_demo_customer(
        OnboardingRequest(
            client_name="Sample Implementation Co",
            business_type="B2B implementation services team",
            job_name="Client onboarding sprint",
            job_goal="Prepare a local sample client onboarding sprint.",
            invoice_amount_usd=1600,
            spend_cap_usd=350,
            margin_floor_percent=55,
            approved_vendors=["Secure Workspace Pack", "Data Migration Sandbox", "Launch Asset Kit"],
            blocked_vendors=["Unknown SaaS Vendor"],
        )
    )

    assert response["status"] == "onboarded"
    assert response["state"]["job"] is None
    assert response["state"]["workflow"]["client_name"] == "Sample Implementation Co"
    assert response["state"]["workflow"]["invoice_amount_cents"] == 160000
    assert response["state"]["workflow"]["spend_cap_cents"] == 35000
    assert response["state"]["workflow"]["margin_floor_percent"] == 55
    assert response["state"]["workflows"][0]["is_active"] is True
    assert response["state"]["onboarding"]["config_json"]["approvedVendors"] == [
        "Secure Workspace Pack",
        "Data Migration Sandbox",
        "Launch Asset Kit",
    ]


def test_selected_workflow_drives_run_and_custom_invoice_amount(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    onboard_demo_customer(
        OnboardingRequest(
            client_name="Sample Implementation Co",
            business_type="B2B implementation services team",
            job_name="Client onboarding sprint",
            job_goal="Prepare a local sample client onboarding sprint.",
            invoice_amount_usd=10000,
            spend_cap_usd=1500,
            margin_floor_percent=50,
            approved_vendors=["Secure Workspace Pack", "Data Migration Sandbox", "Launch Asset Kit"],
            blocked_vendors=["Unknown SaaS Vendor"],
        )
    )
    response = _call_post_demo_run_route()
    state = response["state"]

    assert response["status"] == "completed"
    assert state["workflow"]["client_name"] == "Sample Implementation Co"
    assert state["job"]["client_name"] == "Sample Implementation Co"
    assert state["job"]["invoice_amount_cents"] == 1000000
    assert state["stripe_events"][1]["amount_cents"] == 1000000
    assert state["stripe_events"][-1]["amount_cents"] == 1000000
    assert state["ledger"]["totals"]["revenue_cents"] == 1000000
    assert state["ledger"]["totals"]["approved_spend_cents"] == 115000
    assert state["ledger"]["totals"]["gross_profit_cents"] == 885000
    assert state["ledger"]["totals"]["actual_margin_percent"] == 88.5
    assert state["report"]["gross_profit_cents"] == 885000
    assert state["report"]["actual_margin_percent"] == 88.5


def test_saved_workflow_can_be_selected_for_next_run(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    northstar = onboard_demo_customer(
        OnboardingRequest(
            client_name="Northstar Dental Group",
            business_type="Multi-location healthcare services group",
            job_name="Client Implementation Launch",
            job_goal="Launch a synthetic B2B client implementation operation with no patient data and no PHI.",
            invoice_amount_usd=8500,
            spend_cap_usd=1150,
            margin_floor_percent=50,
            approved_vendors=["Secure Workspace Pack", "Data Migration Sandbox", "Launch Asset Kit"],
            blocked_vendors=["Unapproved Data Broker Enrichment"],
        )
    )
    onboard_demo_customer(
        OnboardingRequest(
            client_name="Sample Implementation Co",
            business_type="B2B implementation services team",
            job_name="Client onboarding sprint",
            job_goal="Prepare a local sample client onboarding sprint.",
            invoice_amount_usd=2000,
            spend_cap_usd=400,
            margin_floor_percent=55,
            approved_vendors=["Secure Workspace Pack", "Data Migration Sandbox", "Launch Asset Kit"],
            blocked_vendors=["Unknown SaaS Vendor"],
        )
    )
    northstar_id = next(
        workflow["id"]
        for workflow in northstar["state"]["workflows"]
        if workflow["client_name"] == "Northstar Dental Group"
    )

    selected = select_demo_workflow(northstar_id)
    response = _call_post_demo_run_route()

    assert selected["status"] == "workflow_selected"
    assert response["state"]["job"]["client_name"] == "Northstar Dental Group"
    assert response["state"]["job"]["invoice_amount_cents"] == 850000


def test_spend_check_endpoint_blocks_before_payment(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()
    response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Secure Workspace Pack", "amount_cents": 35000})
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
    assert second_response["state"]["ledger"]["totals"]["revenue_cents"] == 850000
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
        SpendCheckRequest(**{"vendor": "Secure Workspace Pack", "amount_cents": 35000})
    )
    mark_demo_paid()
    workspace_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Secure Workspace Pack", "amount_cents": 35000})
    )
    sandbox_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Data Migration Sandbox", "amount_cents": 50000})
    )
    launch_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Launch Asset Kit", "amount_cents": 30000})
    )
    blocked_response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Unapproved Data Broker Enrichment", "amount_cents": 320000})
    )
    state = demo_state()

    assert prepayment_response["status"] == "spend_blocked"
    assert prepayment_response["state"]["ledger"]["totals"]["blocked_spend_cents"] == 0
    assert workspace_response["status"] == "spend_approved"
    assert sandbox_response["status"] == "spend_approved"
    assert launch_response["status"] == "spend_approved"
    assert blocked_response["status"] == "spend_blocked"
    assert state["ledger"]["totals"]["revenue_cents"] == 850000
    assert state["ledger"]["totals"]["approved_spend_cents"] == 115000
    assert state["ledger"]["totals"]["blocked_spend_cents"] == 320000
    assert state["ledger"]["totals"]["remaining_spend_cap_cents"] == 0
    assert state["ledger"]["totals"]["gross_profit_cents"] == 735000
    assert state["ledger"]["totals"]["actual_margin_percent"] == 86.5
    assert len(state["policy_checks"]) == 5
    assert [check["approved"] for check in state["policy_checks"]] == [0, 1, 1, 1, 0]
    ledger_types = [entry["entry_type"] for entry in state["ledger"]["entries"]]
    assert ledger_types == ["revenue", "spend", "spend", "spend"]


def test_spend_check_endpoint_rejects_missing_or_zero_amount_cents(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()

    with pytest.raises(HTTPException) as missing_error:
        demo_spend_check(SpendCheckRequest(**{"vendor": "Secure Workspace Pack"}))

    with pytest.raises(HTTPException) as zero_error:
        demo_spend_check(SpendCheckRequest(**{"vendor": "Secure Workspace Pack", "amount_cents": 0}))

    assert missing_error.value.status_code == 400
    assert missing_error.value.detail == "Spend check amount_cents must be greater than zero."
    assert zero_error.value.status_code == 400
    assert zero_error.value.detail == "Spend check amount_cents must be greater than zero."


def test_spend_check_endpoint_accepts_requested_amount_cents_alias(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    reset_demo()
    seed_demo()
    response = demo_spend_check(
        SpendCheckRequest(**{"vendor": "Secure Workspace Pack", "requested_amount_cents": 35000})
    )

    assert response["decision"]["requested_amount_cents"] == 35000


def test_demo_run_endpoint_executes_complete_local_lifecycle(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    response = _call_post_demo_run_route()

    assert response["status"] == "completed"
    _assert_complete_demo_state(response["state"])
    assert response["state"]["planning_run"] is not None
    assert response["state"]["orchestration_calls"]
    assert response["state"]["hermes"]["used_real_hermes"] is False


def test_demo_run_endpoint_persists_history_on_repeated_runs(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    first_response = _call_post_demo_run_route()
    second_response = _call_post_demo_run_route()

    first_state = first_response["state"]
    second_state = second_response["state"]
    _assert_complete_demo_state(first_state)
    _assert_complete_demo_state(second_state)
    assert len(second_state["jobs"]) == 2
    assert len({job["id"] for job in second_state["jobs"]}) == 2
    assert second_state["selected_run_id"] == second_state["job"]["id"]
    assert len(second_state["ledger"]["entries"]) == 4
    assert len(second_state["policy_checks"]) == 4
    assert len(second_state["stripe_events"]) == 4
    assert len(second_state["agent_outputs"]) == 4
    assert len(second_state["reports"]) == 1
    assert len(second_state["planning_runs"]) == 1
    assert len(second_state["orchestration_calls"]) == 19


def test_state_endpoint_can_inspect_previous_run(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    first_response = _call_post_demo_run_route()
    second_response = _call_post_demo_run_route()
    first_run_id = first_response["state"]["job"]["id"]

    inspected = demo_state(run_id=first_run_id)

    assert second_response["state"]["job"]["id"] != first_run_id
    assert inspected["selected_run_id"] == first_run_id
    assert inspected["job"]["id"] == first_run_id
    assert len(inspected["jobs"]) == 2
    assert inspected["report"]["gross_profit_cents"] == 735000


def test_protected_http_endpoints_require_auth_when_enabled(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.setenv("SCALEX_AUTH_ENABLED", "true")
    monkeypatch.setenv("SCALEX_DEMO_USERNAME", "operator")
    monkeypatch.setenv("SCALEX_DEMO_PASSWORD", "local-password")
    monkeypatch.setenv("SCALEX_SESSION_SECRET", "test-session-secret")

    missing_cookie_request = SimpleNamespace(cookies={})
    valid_cookie_request = SimpleNamespace(
        cookies={"scalex_session": sign_session_token(username="operator")}
    )
    protected_routes = {
        ("POST", "/api/demo/reset"),
        ("POST", "/api/demo/seed"),
        ("POST", "/api/demo/onboarding"),
        ("POST", "/api/demo/workflows"),
        ("POST", "/api/demo/workflows/{workflow_id}/select"),
        ("POST", "/api/demo/workflows/{workflow_id}/delete"),
        ("POST", "/api/demo/run"),
        ("POST", "/api/demo/mark-paid"),
        ("POST", "/api/demo/spend-check"),
        ("GET", "/api/demo/state"),
    }

    with pytest.raises(HTTPException) as exc:
        require_local_session(missing_cookie_request)

    require_local_session(valid_cookie_request)
    assert exc.value.status_code == 401

    for method, path in protected_routes:
        route = _api_route(path, method)
        dependency_calls = {dependency.call for dependency in route.dependant.dependencies}
        assert require_local_session in dependency_calls


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
    assert [call["sequence"] for call in calls] == list(range(1, 20))
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
    assert blocked_check["vendor"] == "Unapproved Data Broker Enrichment"
    assert blocked_check["approved"] == 0
    assert state["ledger"]["totals"]["approved_spend_cents"] == 115000
    assert state["ledger"]["totals"]["blocked_spend_cents"] == 320000


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
    assert state["job"]["client_name"] == "Northstar Dental Group"
    assert state["job"]["job_name"] == "Client Implementation Launch"
    assert state["job"]["status"] == "complete"
    assert state["job"]["id"] in {job["id"] for job in state["jobs"]}

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
    assert state["stripe"]["invoice_id"] == "in_test_double_northstar_launch_8500"
    assert state["stripe"]["paid"] is False

    ledger_entries = state["ledger"]["entries"]
    assert [entry["entry_type"] for entry in ledger_entries] == ["revenue", "spend", "spend", "spend"]
    assert [entry["amount_cents"] for entry in ledger_entries] == [850000, 35000, 50000, 30000]

    totals = state["ledger"]["totals"]
    assert totals["revenue_cents"] == 850000
    assert totals["approved_spend_cents"] == 115000
    assert totals["blocked_spend_cents"] == 320000
    assert totals["gross_profit_cents"] == 735000
    assert totals["actual_margin_percent"] == 86.5

    policy_checks = state["policy_checks"]
    assert [check["vendor"] for check in policy_checks] == [
        "Secure Workspace Pack",
        "Data Migration Sandbox",
        "Launch Asset Kit",
        "Unapproved Data Broker Enrichment",
    ]
    assert [check["approved"] for check in policy_checks] == [1, 1, 1, 0]
    assert [check["requested_amount_cents"] for check in policy_checks] == [35000, 50000, 30000, 320000]

    agent_outputs = state["agent_outputs"]
    assert [output["agent_name"] for output in agent_outputs] == ["Finance", "Marketing", "Research", "Ops"]
    assert all(output["status"] == "complete" for output in agent_outputs)

    report = state["report"]
    assert report is not None
    assert report["revenue_cents"] == 850000
    assert report["approved_spend_cents"] == 115000
    assert report["blocked_spend_cents"] == 320000
    assert report["gross_profit_cents"] == 735000
    assert report["actual_margin_percent"] == 86.5
    assert report["policy_violations"] == 0
    assert "Proceed with implementation launch" in report["recommendation"]


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


def _api_route(path: str, method: str):
    for route in app.routes:
        if getattr(route, "path", None) == path and method in getattr(route, "methods", set()):
            return route
    raise AssertionError(f"{method} {path} route is not registered")
