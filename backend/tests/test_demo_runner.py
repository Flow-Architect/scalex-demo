from contextlib import closing

from app.db import TABLE_NAMES, get_connection, initialize_database, table_counts
from app.main import demo_state, health, reset_demo, seed_demo
from app.repository import get_demo_job, list_events
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
