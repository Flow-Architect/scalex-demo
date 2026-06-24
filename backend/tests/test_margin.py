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
    invoice_amount_cents = usd_to_cents(8500)
    spend_cap_cents = usd_to_cents(1150)

    assert projected_profit(invoice_amount_cents, spend_cap_cents) == 735000
    assert projected_margin(invoice_amount_cents, spend_cap_cents) == 86.5


def test_actual_profit_and_margin() -> None:
    revenue_cents = usd_to_cents(8500)
    approved_spend_cents = usd_to_cents(1150)

    assert actual_profit(revenue_cents, approved_spend_cents) == 735000
    assert actual_margin(revenue_cents, approved_spend_cents) == 86.5


def test_margin_after_requested_spend_and_remaining_cap() -> None:
    revenue_cents = usd_to_cents(8500)
    approved_spend_cents = usd_to_cents(350)
    requested_amount_cents = usd_to_cents(500)

    assert margin_after_requested_spend(revenue_cents, approved_spend_cents, requested_amount_cents) == 90.0
    assert remaining_spend_cap(usd_to_cents(1150), approved_spend_cents) == 80000


def test_ledger_totals_include_approved_and_blocked_spend() -> None:
    job = {
        "invoice_amount_cents": usd_to_cents(8500),
        "spend_cap_cents": usd_to_cents(1150),
    }
    ledger_entries = [
        {"entry_type": "revenue", "amount_cents": usd_to_cents(8500)},
        {"entry_type": "spend", "amount_cents": usd_to_cents(350)},
        {"entry_type": "spend", "amount_cents": usd_to_cents(500)},
        {"entry_type": "spend", "amount_cents": usd_to_cents(300)},
    ]
    policy_checks = [
        {"approved": 0, "requested_amount_cents": usd_to_cents(3200)},
    ]

    totals = ledger_totals(job, ledger_entries, policy_checks)

    assert approved_spend_total(ledger_entries) == 115000
    assert blocked_spend_total(policy_checks) == 320000
    assert totals["revenue_cents"] == 850000
    assert totals["approved_spend_cents"] == 115000
    assert totals["blocked_spend_cents"] == 320000
    assert totals["remaining_spend_cap_cents"] == 0
    assert totals["payment_revenue_exists"] is True
    assert totals["gross_profit_cents"] == 735000
    assert totals["actual_margin_percent"] == 86.5
    assert totals["projected_profit_cents"] == 735000
    assert totals["projected_margin_percent"] == 86.5


def test_blocked_spend_total_excludes_prerequisite_payment_blocks() -> None:
    policy_checks = [
        {
            "approved": 0,
            "requested_amount_cents": usd_to_cents(350),
            "required_action": "mark_payment_confirmed",
        },
        {
            "approved": 0,
            "requested_amount_cents": usd_to_cents(3200),
            "required_action": "choose_approved_vendor; request_human_approval; reduce_spend_to_cap",
        },
    ]

    assert blocked_spend_total(policy_checks) == 320000


def test_payment_revenue_exists_requires_revenue_entry() -> None:
    assert payment_revenue_exists([]) is False
    assert payment_revenue_exists([{"entry_type": "spend", "amount_cents": usd_to_cents(350)}]) is False
    assert payment_revenue_exists([{"entry_type": "revenue", "amount_cents": usd_to_cents(8500)}]) is True
