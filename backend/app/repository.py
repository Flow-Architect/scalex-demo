from __future__ import annotations

from datetime import datetime, timezone

UTC = timezone.utc
import sqlite3
from uuid import uuid4

from .services.ledger_service import usd_to_cents


DEMO_JOB_ID = "job_harbor_brake_campaign"


def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def row_to_dict(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    return dict(row)


def rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict]:
    return [dict(row) for row in rows]


def create_job(connection: sqlite3.Connection, seed: dict, job_id: str = DEMO_JOB_ID) -> dict:
    now = utc_now()
    invoice_amount_cents = usd_to_cents(seed["invoiceAmountUsd"])
    spend_cap_cents = usd_to_cents(seed["spendCapUsd"])
    connection.execute(
        """
        INSERT INTO jobs (
          id, client_name, business_type, job_name, job_goal,
          invoice_amount_cents, spend_cap_cents, margin_floor_percent,
          status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          client_name = excluded.client_name,
          business_type = excluded.business_type,
          job_name = excluded.job_name,
          job_goal = excluded.job_goal,
          invoice_amount_cents = excluded.invoice_amount_cents,
          spend_cap_cents = excluded.spend_cap_cents,
          margin_floor_percent = excluded.margin_floor_percent,
          status = excluded.status,
          updated_at = excluded.updated_at
        """,
        (
            job_id,
            seed["clientName"],
            seed["businessType"],
            seed["jobName"],
            seed["jobGoal"],
            invoice_amount_cents,
            spend_cap_cents,
            seed["marginFloorPercent"],
            "seeded",
            now,
            now,
        ),
    )
    return get_job(connection, job_id)


def get_job(connection: sqlite3.Connection, job_id: str) -> dict:
    row = connection.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    job = row_to_dict(row)
    if job is None:
        raise LookupError(f"Job not found: {job_id}")
    return job


def get_demo_job(connection: sqlite3.Connection) -> dict | None:
    row = connection.execute("SELECT * FROM jobs ORDER BY created_at, id LIMIT 1").fetchone()
    return row_to_dict(row)


def list_jobs(connection: sqlite3.Connection) -> list[dict]:
    rows = connection.execute("SELECT * FROM jobs ORDER BY created_at, id").fetchall()
    return rows_to_dicts(rows)


def create_event(
    connection: sqlite3.Connection,
    *,
    job_id: str,
    type: str,
    title: str,
    detail: str,
    status: str,
    event_id: str | None = None,
) -> dict:
    event_id = event_id or f"evt_{uuid4().hex}"
    created_at = utc_now()
    connection.execute(
        """
        INSERT INTO events (id, job_id, type, title, detail, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type = excluded.type,
          title = excluded.title,
          detail = excluded.detail,
          status = excluded.status,
          created_at = excluded.created_at
        """,
        (event_id, job_id, type, title, detail, status, created_at),
    )
    return get_event(connection, event_id)


def get_event(connection: sqlite3.Connection, event_id: str) -> dict:
    row = connection.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    event = row_to_dict(row)
    if event is None:
        raise LookupError(f"Event not found: {event_id}")
    return event


def list_events(connection: sqlite3.Connection, job_id: str | None = None) -> list[dict]:
    if job_id is None:
        rows = connection.execute("SELECT * FROM events ORDER BY created_at, rowid").fetchall()
    else:
        rows = connection.execute(
            "SELECT * FROM events WHERE job_id = ? ORDER BY created_at, rowid",
            (job_id,),
        ).fetchall()
    return rows_to_dicts(rows)


def create_ledger_entry(
    connection: sqlite3.Connection,
    *,
    job_id: str,
    entry_type: str,
    label: str,
    amount_cents: int,
    source: str,
    entry_id: str | None = None,
) -> dict:
    entry_id = entry_id or f"led_{uuid4().hex}"
    created_at = utc_now()
    connection.execute(
        """
        INSERT INTO ledger_entries (id, job_id, entry_type, label, amount_cents, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (entry_id, job_id, entry_type, label, amount_cents, source, created_at),
    )
    return get_ledger_entry(connection, entry_id)


def get_ledger_entry(connection: sqlite3.Connection, entry_id: str) -> dict:
    row = connection.execute("SELECT * FROM ledger_entries WHERE id = ?", (entry_id,)).fetchone()
    entry = row_to_dict(row)
    if entry is None:
        raise LookupError(f"Ledger entry not found: {entry_id}")
    return entry


def list_ledger_entries(connection: sqlite3.Connection, job_id: str | None = None) -> list[dict]:
    if job_id is None:
        rows = connection.execute("SELECT * FROM ledger_entries ORDER BY created_at, rowid").fetchall()
    else:
        rows = connection.execute(
            "SELECT * FROM ledger_entries WHERE job_id = ? ORDER BY created_at, rowid",
            (job_id,),
        ).fetchall()
    return rows_to_dicts(rows)


def create_policy_check(
    connection: sqlite3.Connection,
    *,
    job_id: str,
    request_type: str,
    vendor: str,
    requested_amount_cents: int,
    approved: bool,
    reason: str,
    margin_after_spend_percent: float,
    required_action: str,
    check_id: str | None = None,
) -> dict:
    check_id = check_id or f"pol_{uuid4().hex}"
    created_at = utc_now()
    connection.execute(
        """
        INSERT INTO policy_checks (
          id, job_id, request_type, vendor, requested_amount_cents,
          approved, reason, margin_after_spend_percent, required_action, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            check_id,
            job_id,
            request_type,
            vendor,
            requested_amount_cents,
            1 if approved else 0,
            reason,
            margin_after_spend_percent,
            required_action,
            created_at,
        ),
    )
    return get_policy_check(connection, check_id)


def get_policy_check(connection: sqlite3.Connection, check_id: str) -> dict:
    row = connection.execute("SELECT * FROM policy_checks WHERE id = ?", (check_id,)).fetchone()
    check = row_to_dict(row)
    if check is None:
        raise LookupError(f"Policy check not found: {check_id}")
    return check


def list_policy_checks(connection: sqlite3.Connection, job_id: str | None = None) -> list[dict]:
    if job_id is None:
        rows = connection.execute("SELECT * FROM policy_checks ORDER BY created_at, rowid").fetchall()
    else:
        rows = connection.execute(
            "SELECT * FROM policy_checks WHERE job_id = ? ORDER BY created_at, rowid",
            (job_id,),
        ).fetchall()
    return rows_to_dicts(rows)


def create_stripe_event(
    connection: sqlite3.Connection,
    *,
    job_id: str,
    stripe_object_type: str,
    stripe_object_id: str,
    status: str,
    amount_cents: int,
    mode: str,
    event_id: str | None = None,
) -> dict:
    event_id = event_id or f"str_{uuid4().hex}"
    created_at = utc_now()
    connection.execute(
        """
        INSERT INTO stripe_events (
          id, job_id, stripe_object_type, stripe_object_id, status, amount_cents, mode, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (event_id, job_id, stripe_object_type, stripe_object_id, status, amount_cents, mode, created_at),
    )
    return get_stripe_event(connection, event_id)


def get_stripe_event(connection: sqlite3.Connection, event_id: str) -> dict:
    row = connection.execute("SELECT * FROM stripe_events WHERE id = ?", (event_id,)).fetchone()
    event = row_to_dict(row)
    if event is None:
        raise LookupError(f"Stripe event not found: {event_id}")
    return event


def list_stripe_events(connection: sqlite3.Connection, job_id: str | None = None) -> list[dict]:
    if job_id is None:
        rows = connection.execute("SELECT * FROM stripe_events ORDER BY created_at, rowid").fetchall()
    else:
        rows = connection.execute(
            "SELECT * FROM stripe_events WHERE job_id = ? ORDER BY created_at, rowid",
            (job_id,),
        ).fetchall()
    return rows_to_dicts(rows)


def create_agent_output(
    connection: sqlite3.Connection,
    *,
    job_id: str,
    agent_name: str,
    status: str,
    summary: str,
    output_markdown: str,
    output_id: str | None = None,
) -> dict:
    output_id = output_id or f"agt_{uuid4().hex}"
    created_at = utc_now()
    connection.execute(
        """
        INSERT INTO agent_outputs (
          id, job_id, agent_name, status, summary, output_markdown, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (output_id, job_id, agent_name, status, summary, output_markdown, created_at),
    )
    return get_agent_output(connection, output_id)


def get_agent_output(connection: sqlite3.Connection, output_id: str) -> dict:
    row = connection.execute("SELECT * FROM agent_outputs WHERE id = ?", (output_id,)).fetchone()
    output = row_to_dict(row)
    if output is None:
        raise LookupError(f"Agent output not found: {output_id}")
    return output


def list_agent_outputs(connection: sqlite3.Connection, job_id: str | None = None) -> list[dict]:
    if job_id is None:
        rows = connection.execute("SELECT * FROM agent_outputs ORDER BY created_at, rowid").fetchall()
    else:
        rows = connection.execute(
            "SELECT * FROM agent_outputs WHERE job_id = ? ORDER BY created_at, rowid",
            (job_id,),
        ).fetchall()
    return rows_to_dicts(rows)


def create_report(
    connection: sqlite3.Connection,
    *,
    job_id: str,
    revenue_cents: int,
    approved_spend_cents: int,
    blocked_spend_cents: int,
    gross_profit_cents: int,
    margin_percent: float,
    policy_violations: int,
    recommendation: str,
    report_markdown: str,
    report_id: str | None = None,
) -> dict:
    report_id = report_id or f"rep_{uuid4().hex}"
    created_at = utc_now()
    connection.execute(
        """
        INSERT INTO reports (
          id, job_id, revenue_cents, approved_spend_cents, blocked_spend_cents, gross_profit_cents,
          margin_percent, policy_violations, recommendation, report_markdown, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            report_id,
            job_id,
            revenue_cents,
            approved_spend_cents,
            blocked_spend_cents,
            gross_profit_cents,
            margin_percent,
            policy_violations,
            recommendation,
            report_markdown,
            created_at,
        ),
    )
    return get_report(connection, report_id)


def get_report(connection: sqlite3.Connection, report_id: str) -> dict:
    row = connection.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    report = row_to_dict(row)
    if report is None:
        raise LookupError(f"Report not found: {report_id}")
    return report


def list_reports(connection: sqlite3.Connection, job_id: str | None = None) -> list[dict]:
    if job_id is None:
        rows = connection.execute("SELECT * FROM reports ORDER BY created_at, rowid").fetchall()
    else:
        rows = connection.execute(
            "SELECT * FROM reports WHERE job_id = ? ORDER BY created_at, rowid",
            (job_id,),
        ).fetchall()
    return rows_to_dicts(rows)


def get_latest_report(connection: sqlite3.Connection, job_id: str | None = None) -> dict | None:
    if job_id is None:
        row = connection.execute("SELECT * FROM reports ORDER BY created_at DESC, id DESC LIMIT 1").fetchone()
    else:
        row = connection.execute(
            "SELECT * FROM reports WHERE job_id = ? ORDER BY created_at DESC, id DESC LIMIT 1",
            (job_id,),
        ).fetchone()
    return row_to_dict(row)


def update_job_status(connection: sqlite3.Connection, job_id: str, status: str) -> dict:
    connection.execute(
        """
        UPDATE jobs
        SET status = ?, updated_at = ?
        WHERE id = ?
        """,
        (status, utc_now(), job_id),
    )
    return get_job(connection, job_id)
