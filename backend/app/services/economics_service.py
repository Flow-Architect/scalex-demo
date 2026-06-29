"""Deterministic enterprise cost-basis helpers for the ScaleX demo."""

from typing import Any


def demo_employee_records() -> list[dict[str, Any]]:
    records = [
        {
            "employee_name": "Maria Lopez",
            "role_title": "ClientOps Lead",
            "fully_loaded_hourly_rate_cents": 7000,
            "assigned_hours": 6.0,
            "skill_category": "Client operations",
            "labor_cost_cents": 42000,
            "active": True,
            "notes": "Demo employee only; loaded job-costing rate, not payroll.",
            "source": "manual_entry",
        },
        {
            "employee_name": "James Carter",
            "role_title": "Implementation Specialist",
            "fully_loaded_hourly_rate_cents": 5500,
            "assigned_hours": 6.0,
            "skill_category": "Implementation delivery",
            "labor_cost_cents": 33000,
            "active": True,
            "notes": "Demo employee only; loaded job-costing rate, not payroll.",
            "source": "file_extraction_fixture",
        },
        {
            "employee_name": "Avery Smith",
            "role_title": "QA / Handoff Support",
            "fully_loaded_hourly_rate_cents": 5000,
            "assigned_hours": 4.0,
            "skill_category": "Quality and handoff",
            "labor_cost_cents": 20000,
            "active": True,
            "notes": "Demo employee only; job-costing assumption.",
            "source": "file_extraction_fixture",
        },
    ]
    return [
        {
            **record,
            "base_hourly_rate_cents": record["fully_loaded_hourly_rate_cents"],
            "labor_burden_percent": 0.0,
            "status": "active" if record["active"] else "inactive",
        }
        for record in records
    ]


def demo_enterprise_cost_basis(
    *,
    revenue_cents: int,
    setup_tool_spend_cents: int,
    blocked_spend_cents: int,
    margin_floor_percent: float,
) -> dict[str, Any]:
    labor_cost_cents = sum(record["labor_cost_cents"] for record in demo_employee_records())
    line_items = [
        {
            "id": "setup_tool_spend",
            "label": "Setup/tool spend",
            "amount_cents": setup_tool_spend_cents,
            "category": "vendor_setup",
            "evidence_type": "policy_approved_setup_spend",
        },
        {
            "id": "labor_cost",
            "label": "Labor cost",
            "amount_cents": labor_cost_cents,
            "category": "job_costing",
            "evidence_type": "loaded_labor_cost",
        },
        {
            "id": "campaign_media_cost",
            "label": "Campaign/media cost",
            "amount_cents": 60000,
            "category": "delivery",
            "evidence_type": "delivery_cost_assumption",
        },
        {
            "id": "materials_delivery_cost",
            "label": "Materials/delivery cost",
            "amount_cents": 37500,
            "category": "delivery",
            "evidence_type": "delivery_cost_assumption",
        },
        {
            "id": "platform_processing_fees",
            "label": "Platform/processing fees",
            "amount_cents": 28500,
            "category": "platform",
            "evidence_type": "fee_cost_assumption",
        },
        {
            "id": "qa_compliance_overhead",
            "label": "QA/compliance overhead",
            "amount_cents": 35000,
            "category": "governance",
            "evidence_type": "qa_cost_assumption",
        },
        {
            "id": "contingency_reserve",
            "label": "Contingency reserve",
            "amount_cents": 22500,
            "category": "reserve",
            "evidence_type": "reserve_cost_assumption",
        },
    ]
    total_approved_costs_cents = sum(item["amount_cents"] for item in line_items)
    protected_profit_cents = revenue_cents - total_approved_costs_cents
    protected_margin_percent = _percent(protected_profit_cents, revenue_cents)
    total_costs_if_blocked_approved_cents = total_approved_costs_cents + blocked_spend_cents
    profit_if_blocked_approved_cents = revenue_cents - total_costs_if_blocked_approved_cents
    margin_if_blocked_approved_percent = _percent(profit_if_blocked_approved_cents, revenue_cents)

    return {
        "line_items": line_items,
        "setup_tool_spend_cents": setup_tool_spend_cents,
        "labor_cost_cents": labor_cost_cents,
        "total_approved_costs_cents": total_approved_costs_cents,
        "protected_profit_cents": protected_profit_cents,
        "protected_margin_percent": protected_margin_percent,
        "margin_floor_percent": margin_floor_percent,
        "blocked_spend_cents": blocked_spend_cents,
        "total_costs_if_blocked_approved_cents": total_costs_if_blocked_approved_cents,
        "profit_if_blocked_approved_cents": profit_if_blocked_approved_cents,
        "margin_if_blocked_approved_percent": margin_if_blocked_approved_percent,
        "blocked_decision": (
            "blocked_margin_floor_vendor_policy"
            if margin_if_blocked_approved_percent < margin_floor_percent
            else "blocked_vendor_policy"
        ),
        "formula": "Protected profit = Revenue - Total Approved Costs",
        "blocked_formula": "Margin if risky spend approved = (Revenue - Total Approved Costs - Blocked Risky Spend) / Revenue",
    }


def enterprise_report_totals(
    *,
    revenue_cents: int,
    setup_tool_spend_cents: int,
    blocked_spend_cents: int,
    margin_floor_percent: float,
) -> dict[str, int | float]:
    cost_basis = demo_enterprise_cost_basis(
        revenue_cents=revenue_cents,
        setup_tool_spend_cents=setup_tool_spend_cents,
        blocked_spend_cents=blocked_spend_cents,
        margin_floor_percent=margin_floor_percent,
    )
    return {
        "revenue_cents": revenue_cents,
        "approved_spend_cents": cost_basis["total_approved_costs_cents"],
        "blocked_spend_cents": blocked_spend_cents,
        "gross_profit_cents": cost_basis["protected_profit_cents"],
        "actual_margin_percent": cost_basis["protected_margin_percent"],
        "total_approved_costs_cents": cost_basis["total_approved_costs_cents"],
        "protected_profit_cents": cost_basis["protected_profit_cents"],
        "protected_margin_percent": cost_basis["protected_margin_percent"],
        "setup_tool_spend_cents": setup_tool_spend_cents,
        "labor_cost_cents": cost_basis["labor_cost_cents"],
        "margin_floor_percent": margin_floor_percent,
        "total_costs_if_blocked_approved_cents": cost_basis["total_costs_if_blocked_approved_cents"],
        "profit_if_blocked_approved_cents": cost_basis["profit_if_blocked_approved_cents"],
        "margin_if_blocked_approved_percent": cost_basis["margin_if_blocked_approved_percent"],
    }


def _percent(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100, 1)
