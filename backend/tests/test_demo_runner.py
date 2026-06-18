from contextlib import closing

import pytest
from fastapi import HTTPException

from app.db import TABLE_NAMES, get_connection, initialize_database, table_counts
from app.main import demo_spend_check, demo_state, health, mark_demo_paid, reset_demo, seed_demo
from app.repository import get_demo_job, list_events
from app.schemas import SpendCheckRequest
from app.services.seed_service import seed_demo_database


def test_schema_initialization_creates_expected_tables(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    counts = table_counts(db_path)

    assert sorted(counts) == sorted(TABLE_NAMES)
    assert all(count == 0 for count in counts.values())


def test_seed_loading_creates_harbor_job_and_event(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = seed_demo_database(connection)
        events = list_events(connection, job["id"])
        current_job = get_demo_job(connection)

    assert current_job is not None
    assert current_job["client_name"] == "Harbor Auto Care"
    assert current_job["job_name"] == "30-day brake service campaign"
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

    assert seeded_state["job"]["client_name"] == "Harbor Auto Care"
    assert seeded_state["ledger"]["totals"]["projected_profit_cents"] == 90000
    assert seeded_state["ledger"]["totals"]["projected_margin_percent"] == 75.0
    assert seeded_state["policy"]["summary"]["max_job_spend_usd"] == 300
    assert seeded_state["events"][0]["type"] == "job_intake"
    assert seeded_state["policy_checks"] == []
    assert seeded_state["agent_outputs"] == []
    assert seeded_state["report"] is None

    state = demo_state()
    assert state["job"]["job_name"] == "30-day brake service campaign"
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
