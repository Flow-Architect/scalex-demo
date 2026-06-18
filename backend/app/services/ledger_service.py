"""Profit and ledger helpers for the ScaleX demo."""

from decimal import Decimal, ROUND_HALF_UP
from typing import Any


def usd_to_cents(usd: int | float | str | Decimal) -> int:
    amount = Decimal(str(usd))
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def cents(usd: int | float | str | Decimal) -> int:
    return usd_to_cents(usd)


def projected_profit(invoice_amount_cents: int, spend_cap_cents: int) -> int:
    return invoice_amount_cents - spend_cap_cents


def projected_margin(invoice_amount_cents: int, spend_cap_cents: int) -> float:
    return margin_percent(projected_profit(invoice_amount_cents, spend_cap_cents), invoice_amount_cents)


def actual_profit(revenue_cents: int, approved_spend_cents: int) -> int:
    return revenue_cents - approved_spend_cents


def actual_margin(revenue_cents: int, approved_spend_cents: int) -> float:
    return margin_percent(actual_profit(revenue_cents, approved_spend_cents), revenue_cents)


def margin_after_requested_spend(
    revenue_cents: int,
    approved_spend_cents: int,
    requested_amount_cents: int,
) -> float:
    return actual_margin(revenue_cents, approved_spend_cents + requested_amount_cents)


def margin_percent(profit_cents: int, revenue_cents: int) -> float:
    if revenue_cents <= 0:
        return 0.0
    return round((profit_cents / revenue_cents) * 100, 1)


def revenue_total(ledger_entries: list[dict[str, Any]]) -> int:
    return sum(entry["amount_cents"] for entry in ledger_entries if entry["entry_type"] == "revenue")


def approved_spend_total(ledger_entries: list[dict[str, Any]]) -> int:
    return sum(entry["amount_cents"] for entry in ledger_entries if entry["entry_type"] == "spend")


def remaining_spend_cap(spend_cap_cents: int, approved_spend_cents: int) -> int:
    return max(spend_cap_cents - approved_spend_cents, 0)


def blocked_spend_total(policy_checks: list[dict[str, Any]]) -> int:
    return sum(
        check["requested_amount_cents"]
        for check in policy_checks
        if int(check["approved"]) == 0 and not _is_prerequisite_block(check)
    )


def _is_prerequisite_block(policy_check: dict[str, Any]) -> bool:
    required_actions = {
        action.strip()
        for action in str(policy_check.get("required_action", "")).split(";")
    }
    return bool({"mark_payment_confirmed", "seed_job"} & required_actions)


def payment_revenue_exists(ledger_entries: list[dict[str, Any]]) -> bool:
    return revenue_total(ledger_entries) > 0


def ledger_totals(
    job: dict[str, Any] | None,
    ledger_entries: list[dict[str, Any]],
    policy_checks: list[dict[str, Any]],
) -> dict[str, int | float]:
    revenue_cents = revenue_total(ledger_entries)
    approved_spend_cents = approved_spend_total(ledger_entries)
    blocked_spend_cents = blocked_spend_total(policy_checks)

    invoice_amount_cents = int(job["invoice_amount_cents"]) if job else 0
    spend_cap_cents = int(job["spend_cap_cents"]) if job else 0

    return {
        "revenue_cents": revenue_cents,
        "approved_spend_cents": approved_spend_cents,
        "blocked_spend_cents": blocked_spend_cents,
        "remaining_spend_cap_cents": remaining_spend_cap(spend_cap_cents, approved_spend_cents),
        "payment_revenue_exists": payment_revenue_exists(ledger_entries),
        "gross_profit_cents": actual_profit(revenue_cents, approved_spend_cents),
        "actual_margin_percent": actual_margin(revenue_cents, approved_spend_cents),
        "projected_profit_cents": projected_profit(invoice_amount_cents, spend_cap_cents),
        "projected_margin_percent": projected_margin(invoice_amount_cents, spend_cap_cents),
    }
