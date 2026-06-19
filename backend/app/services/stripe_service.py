"""Local mock/test-style Stripe event service.

This module does not import the Stripe SDK or call Stripe. It only writes
auditable local demo events that look like the intended test-mode lifecycle.
"""

import sqlite3
from typing import Any

from .. import repository


def stripe_mode() -> str:
    return "local_mock_test"


def create_mock_stripe_customer(connection: sqlite3.Connection, job: dict[str, Any]) -> dict:
    return _create_mock_stripe_event(connection, job, _mock_step(job, "customer"))


def create_mock_stripe_invoice(connection: sqlite3.Connection, job: dict[str, Any]) -> dict:
    return _create_mock_stripe_event(connection, job, _mock_step(job, "invoice"))


def create_mock_stripe_payment_link(connection: sqlite3.Connection, job: dict[str, Any]) -> dict:
    return _create_mock_stripe_event(connection, job, _mock_step(job, "payment_link"))


def confirm_mock_stripe_payment(connection: sqlite3.Connection, job: dict[str, Any]) -> dict:
    return _create_mock_stripe_event(connection, job, _mock_step(job, "payment"))


def record_mock_stripe_lifecycle_note(connection: sqlite3.Connection, job: dict[str, Any]) -> dict:
    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="stripe_mock",
        title="Local mock Stripe lifecycle prepared",
        detail=(
            "Created local mock/test-style customer, invoice, payment link, and payment confirmation records. "
            "No Stripe SDK call or live payment activity was performed."
        ),
        status="mocked",
        event_id="evt_harbor_mock_stripe_lifecycle",
    )
    connection.commit()
    return event


def create_mock_stripe_lifecycle(connection: sqlite3.Connection, job: dict[str, Any]) -> list[dict]:
    created_events = [
        create_mock_stripe_customer(connection, job),
        create_mock_stripe_invoice(connection, job),
        create_mock_stripe_payment_link(connection, job),
        confirm_mock_stripe_payment(connection, job),
    ]
    record_mock_stripe_lifecycle_note(connection, job)
    return created_events


def _mock_step(job: dict[str, Any], stripe_object_type: str) -> dict[str, Any]:
    amount_cents = int(job["invoice_amount_cents"])
    events = {
        "customer": {
            "event_id": "str_harbor_mock_customer",
            "stripe_object_type": "customer",
            "stripe_object_id": "cus_mock_harbor_fleet_services",
            "status": "mock_customer_created",
            "amount_cents": 0,
        },
        "invoice": {
            "event_id": "str_harbor_mock_invoice",
            "stripe_object_type": "invoice",
            "stripe_object_id": "in_mock_harbor_brake_1200",
            "status": "mock_invoice_created",
            "amount_cents": amount_cents,
        },
        "payment_link": {
            "event_id": "str_harbor_mock_payment_link",
            "stripe_object_type": "payment_link",
            "stripe_object_id": "plink_mock_harbor_brake_campaign",
            "status": "local_payment_prepared",
            "amount_cents": amount_cents,
        },
        "payment": {
            "event_id": "str_harbor_mock_payment_confirmed",
            "stripe_object_type": "payment",
            "stripe_object_id": "pay_mock_harbor_confirmed",
            "status": "local_sandbox_payment_confirmed",
            "amount_cents": amount_cents,
        },
    }
    return events[stripe_object_type]


def _create_mock_stripe_event(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    event: dict[str, Any],
) -> dict:
    created_event = repository.create_stripe_event(
        connection,
        job_id=job["id"],
        stripe_object_type=event["stripe_object_type"],
        stripe_object_id=event["stripe_object_id"],
        status=event["status"],
        amount_cents=event["amount_cents"],
        mode=stripe_mode(),
        event_id=event["event_id"],
    )
    connection.commit()
    return created_event
