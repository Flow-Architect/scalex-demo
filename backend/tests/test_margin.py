from app.services.ledger_service import (
    actual_margin,
    actual_profit,
    approved_spend_total,
    blocked_spend_total,
    ledger_totals,
    projected_margin,
    projected_profit,
    usd_to_cents,
)


def test_projected_profit_and_margin() -> None:
    invoice_amount_cents = usd_to_cents(1200)
    spend_cap_cents = usd_to_cents(300)

    assert projected_profit(invoice_amount_cents, spend_cap_cents) == 90000
    assert projected_margin(invoice_amount_cents, spend_cap_cents) == 75.0


def test_actual_profit_and_margin() -> None:
    revenue_cents = usd_to_cents(1200)
    approved_spend_cents = usd_to_cents(187)

    assert actual_profit(revenue_cents, approved_spend_cents) == 101300
    assert actual_margin(revenue_cents, approved_spend_cents) == 84.4


def test_ledger_totals_include_approved_and_blocked_spend() -> None:
    job = {
        "invoice_amount_cents": usd_to_cents(1200),
        "spend_cap_cents": usd_to_cents(300),
    }
    ledger_entries = [
        {"entry_type": "revenue", "amount_cents": usd_to_cents(1200)},
        {"entry_type": "spend", "amount_cents": usd_to_cents(89)},
        {"entry_type": "spend", "amount_cents": usd_to_cents(98)},
    ]
    policy_checks = [
        {"approved": 0, "requested_amount_cents": usd_to_cents(750)},
    ]

    totals = ledger_totals(job, ledger_entries, policy_checks)

    assert approved_spend_total(ledger_entries) == 18700
    assert blocked_spend_total(policy_checks) == 75000
    assert totals["revenue_cents"] == 120000
    assert totals["approved_spend_cents"] == 18700
    assert totals["blocked_spend_cents"] == 75000
    assert totals["gross_profit_cents"] == 101300
    assert totals["actual_margin_percent"] == 84.4
    assert totals["projected_profit_cents"] == 90000
    assert totals["projected_margin_percent"] == 75.0
