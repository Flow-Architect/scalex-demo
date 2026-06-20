"""Payment/revenue markers for the ScaleX demo."""

import sqlite3
from typing import Any

from .. import repository


SANDBOX_REVENUE_ENTRY_ID = "led_harbor_sandbox_revenue"
SANDBOX_PAYMENT_EVENT_ID = "evt_harbor_payment_confirmed"


def mark_job_paid(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    *,
    ledger_source: str = "local_sandbox_payment_marker",
    ledger_label: str = "Harbor Fleet Services sandbox payment",
    event_title: str = "Local sandbox payment confirmed",
    event_detail: str | None = None,
    event_status: str = "paid",
) -> dict[str, Any]:
    try:
        ledger_entry = repository.get_ledger_entry(connection, SANDBOX_REVENUE_ENTRY_ID)
        created = False
    except LookupError:
        ledger_entry = repository.create_ledger_entry(
            connection,
            job_id=job["id"],
            entry_type="revenue",
            label=ledger_label,
            amount_cents=int(job["invoice_amount_cents"]),
            source=ledger_source,
            entry_id=SANDBOX_REVENUE_ENTRY_ID,
        )
        created = True

    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="payment_confirmed",
        title=event_title,
        detail=event_detail
        or (
            "Recorded local sandbox revenue for the seeded $1,200 Harbor Fleet Services invoice. "
            "No Stripe call or real payment activity was performed."
        ),
        status=event_status,
        event_id=SANDBOX_PAYMENT_EVENT_ID,
    )
    connection.commit()

    return {
        "created": created,
        "ledger_entry": ledger_entry,
        "event": event,
    }
