from app.services.ledger_service import (
    actual_margin,
    actual_profit,
    approved_spend_total,
    blocked_spend_total,
    ledger_totals,
    margin_after_requested_spend,
    payment_revenue_exists,
    projected_margin,
    projected_profit,
    remaining_spend_cap,
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


def test_margin_after_requested_spend_and_remaining_cap() -> None:
    revenue_cents = usd_to_cents(1200)
    approved_spend_cents = usd_to_cents(89)
    requested_amount_cents = usd_to_cents(98)

    assert margin_after_requested_spend(revenue_cents, approved_spend_cents, requested_amount_cents) == 84.4
    assert remaining_spend_cap(usd_to_cents(300), approved_spend_cents) == 21100


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
    assert totals["remaining_spend_cap_cents"] == 11300
    assert totals["payment_revenue_exists"] is True
    assert totals["gross_profit_cents"] == 101300
    assert totals["actual_margin_percent"] == 84.4
    assert totals["projected_profit_cents"] == 90000
    assert totals["projected_margin_percent"] == 75.0


def test_blocked_spend_total_excludes_prerequisite_payment_blocks() -> None:
    policy_checks = [
        {
            "approved": 0,
            "requested_amount_cents": usd_to_cents(89),
            "required_action": "mark_payment_confirmed",
        },
        {
            "approved": 0,
            "requested_amount_cents": usd_to_cents(750),
            "required_action": "choose_approved_vendor; request_human_approval; reduce_spend_to_cap",
        },
    ]

    assert blocked_spend_total(policy_checks) == 75000


def test_payment_revenue_exists_requires_revenue_entry() -> None:
    assert payment_revenue_exists([]) is False
    assert payment_revenue_exists([{"entry_type": "spend", "amount_cents": usd_to_cents(89)}]) is False
    assert payment_revenue_exists([{"entry_type": "revenue", "amount_cents": usd_to_cents(1200)}]) is True
