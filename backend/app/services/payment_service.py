"""Payment/revenue markers for the ScaleX demo."""

import sqlite3
from typing import Any

from .. import repository


def mark_job_paid(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    *,
    ledger_source: str = "local_sandbox_payment_marker",
    ledger_label: str | None = None,
    event_title: str | None = None,
    event_detail: str | None = None,
    event_status: str = "paid",
) -> dict[str, Any]:
    revenue_entry_id = _job_scoped_id("led", job["id"], "revenue")
    payment_event_id = _job_scoped_id("evt", job["id"], "payment_confirmed")
    ledger_label = ledger_label or f"{job['client_name']} local payment confirmation"
    event_title = event_title or "Local sandbox payment confirmed"
    try:
        ledger_entry = repository.get_ledger_entry(connection, revenue_entry_id)
        created = False
    except LookupError:
        ledger_entry = repository.create_ledger_entry(
            connection,
            job_id=job["id"],
            entry_type="revenue",
            label=ledger_label,
            amount_cents=int(job["invoice_amount_cents"]),
            source=ledger_source,
            entry_id=revenue_entry_id,
        )
        created = True

    event = repository.create_event(
        connection,
        job_id=job["id"],
        type="payment_confirmed",
        title=event_title,
        detail=event_detail
        or (
            f"Recorded local sandbox revenue for the {job['client_name']} invoice. "
            "No Stripe call or real payment activity was performed."
        ),
        status=event_status,
        event_id=payment_event_id,
    )
    connection.commit()

    return {
        "created": created,
        "ledger_entry": ledger_entry,
        "event": event,
    }


def _job_scoped_id(prefix: str, job_id: str, suffix: str) -> str:
    safe_job_id = "".join(char if char.isalnum() else "_" for char in job_id.lower())
    return f"{prefix}_{safe_job_id}_{suffix}"
