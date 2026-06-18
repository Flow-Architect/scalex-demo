"""Local sandbox payment marker for the ScaleX demo."""

import sqlite3
from typing import Any

from .. import repository


SANDBOX_REVENUE_ENTRY_ID = "led_harbor_sandbox_revenue"
SANDBOX_PAYMENT_EVENT_ID = "evt_harbor_payment_confirmed"


def mark_job_paid(connection: sqlite3.Connection, job: dict[str, Any]) -> dict[str, Any]:
    try:
        ledger_entry = repository.get_ledger_entry(connection, SANDBOX_REVENUE_ENTRY_ID)
        created = False
    except LookupError:
        ledger_entry = repository.create_ledger_entry(
            connection,
            job_id=job["id"],
            entry_type="revenue",
            label="Harbor Auto Care sandbox payment",
            amount_cents=int(job["invoice_amount_cents"]),
            source="local_sandbox_payment_marker",
            entry_id=SANDBOX_REVENUE_ENTRY_ID,
        )
        created = True

    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="payment_confirmed",
        title="Local sandbox payment confirmed",
        detail=(
            "Recorded local sandbox revenue for the seeded $1,200 Harbor Auto Care invoice. "
            "No Stripe call or real payment activity was performed."
        ),
        status="paid",
        event_id=SANDBOX_PAYMENT_EVENT_ID,
    )
    connection.commit()

    return {
        "created": created,
        "ledger_entry": ledger_entry,
        "event": event,
    }
