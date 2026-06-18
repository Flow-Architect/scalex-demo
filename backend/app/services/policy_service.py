"""Local policy configuration and spend approval helpers for ScaleX."""

import json
from pathlib import Path
import sqlite3
from typing import Any

from ..db import policy_path
from .. import repository
from .ledger_service import (
    approved_spend_total,
    margin_after_requested_spend,
    payment_revenue_exists,
    remaining_spend_cap,
    revenue_total,
    usd_to_cents,
)


def policy_engine_name() -> str:
    return "local policy engine"


def load_policy_config(path: str | Path | None = None) -> dict[str, Any]:
    resolved_path = Path(path) if path is not None else policy_path()
    return json.loads(resolved_path.read_text(encoding="utf-8"))


def policy_summary(policy_config: dict[str, Any] | None = None) -> dict[str, Any]:
    config = policy_config or load_policy_config()
    rules = config["rules"]
    return {
        "name": config["name"],
        "engine": policy_engine_name(),
        "stripe_live_mode": rules["stripe_live_mode"],
        "max_job_spend_usd": rules["max_job_spend_usd"],
        "margin_floor_percent": rules["margin_floor_percent"],
        "require_invoice_before_spend": rules["require_invoice_before_spend"],
        "require_payment_before_spend": rules["require_payment_before_spend"],
        "require_human_approval_above_usd": rules["require_human_approval_above_usd"],
        "approved_vendors": rules["approved_vendors"],
        "blocked_vendors": rules["blocked_vendors"],
    }


def evaluate_spend_request(
    *,
    job: dict[str, Any],
    ledger_entries: list[dict[str, Any]],
    vendor: str,
    requested_amount_cents: int,
    human_approved: bool = False,
    policy_config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    config = policy_config or load_policy_config()
    rules = config["rules"]
    approved_spend_cents = approved_spend_total(ledger_entries)
    revenue_cents = revenue_total(ledger_entries)
    margin_after_spend_percent = margin_after_requested_spend(
        revenue_cents,
        approved_spend_cents,
        requested_amount_cents,
    )
    spend_cap_cents = min(
        int(job["spend_cap_cents"]),
        usd_to_cents(rules["max_job_spend_usd"]),
    )
    total_spend_after_request_cents = approved_spend_cents + requested_amount_cents
    remaining_cap_cents = remaining_spend_cap(spend_cap_cents, approved_spend_cents)

    failures: list[str] = []
    actions: list[str] = []

    if rules["stripe_live_mode"]:
        failures.append("Stripe live mode is not allowed for the local demo.")
        actions.append("use_sandbox_mode")

    if rules["require_invoice_before_spend"] and not job:
        failures.append("A seeded job invoice is required before spend.")
        actions.append("seed_job")

    if rules["require_payment_before_spend"] and not payment_revenue_exists(ledger_entries):
        failures.append("Payment has not been confirmed in the local sandbox ledger.")
        actions.append("mark_payment_confirmed")

    if vendor in rules["blocked_vendors"]:
        failures.append(f"{vendor} is blocked by local policy.")
        actions.append("choose_approved_vendor")

    if vendor not in rules["approved_vendors"]:
        failures.append(f"{vendor} is not on the approved vendor list.")
        actions.append("choose_approved_vendor")

    approval_threshold_cents = usd_to_cents(rules["require_human_approval_above_usd"])
    if requested_amount_cents > approval_threshold_cents and not human_approved:
        failures.append(
            f"Request exceeds the ${rules['require_human_approval_above_usd']} human approval threshold."
        )
        actions.append("request_human_approval")

    if total_spend_after_request_cents > spend_cap_cents:
        failures.append(
            f"Total approved spend would exceed the ${spend_cap_cents / 100:.0f} spend cap."
        )
        actions.append("reduce_spend_to_cap")

    if revenue_cents > 0 and margin_after_spend_percent < float(rules["margin_floor_percent"]):
        failures.append(
            f"Margin after spend would be {margin_after_spend_percent}% below the "
            f"{rules['margin_floor_percent']}% floor."
        )
        actions.append("reduce_spend_to_preserve_margin")

    approved = not failures
    reason = (
        "Vendor allowed; payment confirmed; spend cap and margin floor remain protected."
        if approved
        else " ".join(failures)
    )
    required_action = "none" if approved else "; ".join(dict.fromkeys(actions))

    return {
        "engine": policy_engine_name(),
        "request_type": "vendor_spend",
        "vendor": vendor,
        "requested_amount_cents": requested_amount_cents,
        "approved": approved,
        "reason": reason,
        "margin_after_spend_percent": margin_after_spend_percent,
        "required_action": required_action,
        "approved_spend_before_cents": approved_spend_cents,
        "approved_spend_after_cents": total_spend_after_request_cents if approved else approved_spend_cents,
        "remaining_spend_cap_before_cents": remaining_cap_cents,
        "remaining_spend_cap_after_cents": (
            remaining_spend_cap(spend_cap_cents, total_spend_after_request_cents)
            if approved
            else remaining_cap_cents
        ),
    }


def apply_spend_request(
    connection: sqlite3.Connection,
    *,
    job: dict[str, Any],
    vendor: str,
    requested_amount_cents: int,
    human_approved: bool = False,
    policy_config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    ledger_entries = repository.list_ledger_entries(connection, job["id"])
    decision = evaluate_spend_request(
        job=job,
        ledger_entries=ledger_entries,
        vendor=vendor,
        requested_amount_cents=requested_amount_cents,
        human_approved=human_approved,
        policy_config=policy_config,
    )
    policy_check = repository.create_policy_check(
        connection,
        job_id=job["id"],
        request_type=decision["request_type"],
        vendor=vendor,
        requested_amount_cents=requested_amount_cents,
        approved=decision["approved"],
        reason=decision["reason"],
        margin_after_spend_percent=decision["margin_after_spend_percent"],
        required_action=decision["required_action"],
    )

    ledger_entry = None
    if decision["approved"]:
        ledger_entry = repository.create_ledger_entry(
            connection,
            job_id=job["id"],
            entry_type="spend",
            label=vendor,
            amount_cents=requested_amount_cents,
            source=policy_engine_name(),
        )

    status = "approved" if decision["approved"] else "blocked"
    repository.create_event(
        connection,
        job_id=job["id"],
        type="policy_check",
        title=f"Spend {status}: {vendor}",
        detail=decision["reason"],
        status=status,
    )
    connection.commit()

    return {
        "decision": decision,
        "policy_check": policy_check,
        "ledger_entry": ledger_entry,
    }
