from contextlib import closing
from copy import deepcopy

from app.db import get_connection, initialize_database
from app.repository import (
    create_job,
    create_policy_check,
    list_events,
    list_ledger_entries,
    list_policy_checks,
)
from app.services.ledger_service import approved_spend_total, blocked_spend_total, usd_to_cents
from app.services.payment_service import mark_job_paid
from app.services.policy_service import apply_spend_request, load_policy_config, policy_summary
from app.services.seed_service import load_seed_config


def test_policy_config_summary_uses_local_rules() -> None:
    summary = policy_summary(load_policy_config())

    assert summary["engine"] == "local policy engine"
    assert summary["stripe_live_mode"] is False
    assert summary["max_job_spend_usd"] == 1150
    assert summary["margin_floor_percent"] == 50
    assert "Secure Workspace Pack" in summary["approved_vendors"]
    assert "Unapproved Data Broker Enrichment" in summary["blocked_vendors"]


def test_policy_check_persistence(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        create_policy_check(
            connection,
            job_id=job["id"],
            request_type="vendor_spend",
            vendor="Unapproved Data Broker Enrichment",
            requested_amount_cents=usd_to_cents(3200),
            approved=False,
            reason="Vendor blocked and spend exceeds cap.",
            margin_after_spend_percent=62.4,
            required_action="blocked",
        )
        connection.commit()
        checks = list_policy_checks(connection, job["id"])

    assert len(checks) == 1
    assert checks[0]["vendor"] == "Unapproved Data Broker Enrichment"
    assert checks[0]["approved"] == 0
    assert checks[0]["requested_amount_cents"] == 320000


def test_spend_is_blocked_before_payment_when_required(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        result = apply_spend_request(
            connection,
            job=job,
            vendor="Secure Workspace Pack",
            requested_amount_cents=usd_to_cents(350),
        )
        events = list_events(connection, job["id"])
        ledger_entries = list_ledger_entries(connection, job["id"])
        checks = list_policy_checks(connection, job["id"])

    assert result["decision"]["approved"] is False
    assert "Payment has not been confirmed" in result["decision"]["reason"]
    assert result["decision"]["required_action"] == "mark_payment_confirmed"
    assert result["ledger_entry"] is None
    assert events[-1]["type"] == "policy_check"
    assert events[-1]["status"] == "blocked"
    assert approved_spend_total(ledger_entries) == 0
    assert blocked_spend_total(checks) == 0
    assert len(checks) == 1


def test_approved_vendor_under_cap_is_approved_after_payment(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        mark_job_paid(connection, job)
        result = apply_spend_request(
            connection,
            job=job,
            vendor="Secure Workspace Pack",
            requested_amount_cents=usd_to_cents(350),
        )
        ledger_entries = list_ledger_entries(connection, job["id"])
        checks = list_policy_checks(connection, job["id"])

    assert result["decision"]["approved"] is True
    assert result["ledger_entry"] is not None
    assert approved_spend_total(ledger_entries) == 35000
    assert len(checks) == 1
    assert checks[0]["approved"] == 1


def test_blocked_vendor_is_blocked_and_does_not_create_spend_entry(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        mark_job_paid(connection, job)
        result = apply_spend_request(
            connection,
            job=job,
            vendor="Unapproved Data Broker Enrichment",
            requested_amount_cents=usd_to_cents(3200),
            human_approved=True,
        )
        ledger_entries = list_ledger_entries(connection, job["id"])
        checks = list_policy_checks(connection, job["id"])

    assert result["decision"]["approved"] is False
    assert "blocked by local policy" in result["decision"]["reason"]
    assert result["ledger_entry"] is None
    assert approved_spend_total(ledger_entries) == 0
    assert blocked_spend_total(checks) == 320000


def test_spend_over_cap_is_blocked(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        mark_job_paid(connection, job)
        result = apply_spend_request(
            connection,
            job=job,
            vendor="Secure Workspace Pack",
            requested_amount_cents=usd_to_cents(1250),
            human_approved=True,
        )
        ledger_entries = list_ledger_entries(connection, job["id"])
        checks = list_policy_checks(connection, job["id"])

    assert result["decision"]["approved"] is False
    assert "spend cap" in result["decision"]["reason"]
    assert approved_spend_total(ledger_entries) == 0
    assert blocked_spend_total(checks) == 125000


def test_human_approval_threshold_block_counts_as_blocked_spend(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        mark_job_paid(connection, job)
        result = apply_spend_request(
            connection,
            job=job,
            vendor="Secure Workspace Pack",
            requested_amount_cents=usd_to_cents(1050),
        )
        ledger_entries = list_ledger_entries(connection, job["id"])
        checks = list_policy_checks(connection, job["id"])

    assert result["decision"]["approved"] is False
    assert "human approval threshold" in result["decision"]["reason"]
    assert approved_spend_total(ledger_entries) == 0
    assert blocked_spend_total(checks) == 105000


def test_margin_floor_violation_is_blocked(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)
    seed = deepcopy(load_seed_config())
    seed["spendCapUsd"] = 5000
    policy_config = deepcopy(load_policy_config())
    policy_config["rules"]["max_job_spend_usd"] = 5000
    policy_config["rules"]["require_human_approval_above_usd"] = 5000

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, seed)
        mark_job_paid(connection, job)
        result = apply_spend_request(
            connection,
            job=job,
            vendor="Secure Workspace Pack",
            requested_amount_cents=usd_to_cents(4300),
            policy_config=policy_config,
        )
        ledger_entries = list_ledger_entries(connection, job["id"])
        checks = list_policy_checks(connection, job["id"])

    assert result["decision"]["approved"] is False
    assert result["decision"]["margin_after_spend_percent"] == 49.4
    assert "below the 50% floor" in result["decision"]["reason"]
    assert approved_spend_total(ledger_entries) == 0
    assert blocked_spend_total(checks) == 430000


def test_policy_checks_persist_for_approved_and_blocked_decisions(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        mark_job_paid(connection, job)
        apply_spend_request(
            connection,
            job=job,
            vendor="Secure Workspace Pack",
            requested_amount_cents=usd_to_cents(350),
        )
        apply_spend_request(
            connection,
            job=job,
            vendor="Unapproved Data Broker Enrichment",
            requested_amount_cents=usd_to_cents(3200),
            human_approved=True,
        )
        checks = list_policy_checks(connection, job["id"])
        ledger_entries = list_ledger_entries(connection, job["id"])

    assert [check["approved"] for check in checks] == [1, 0]
    assert [check["vendor"] for check in checks] == [
        "Secure Workspace Pack",
        "Unapproved Data Broker Enrichment",
    ]
    assert approved_spend_total(ledger_entries) == 35000
    assert blocked_spend_total(checks) == 320000
