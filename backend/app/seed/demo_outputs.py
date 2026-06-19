"""Deterministic demo outputs for the local ScaleX lifecycle."""

DEMO_AGENTS = ("Finance", "Marketing", "Research", "Ops")

DEMO_AGENT_OUTPUTS = [
    {
        "id": "agt_finance_harbor_brake_campaign",
        "agent_name": "Finance",
        "summary": "Finance Agent confirmed the job P&L and preserved the 50% margin floor.",
        "output_markdown": """# Finance Agent

- Revenue booked: $1,200.
- Approved spend: $187 across Local Ads API and Design Asset Pack.
- Blocked unsafe spend: $750 Premium Automation Suite request.
- Gross profit: $1,013.
- Final margin: 84.4%.

Spend control result: the campaign stayed well above the 50% margin floor and below the $300 spend cap.""",
    },
    {
        "id": "agt_marketing_harbor_brake_campaign",
        "agent_name": "Marketing",
        "summary": "Marketing Agent prepared the brake service campaign package.",
        "output_markdown": """# Marketing Agent

Campaign theme: Stop With Confidence.

Offer copy: Book a brake inspection this month and get a clear repair plan before small brake issues become expensive.

Social posts:
- Hear squealing or grinding? Harbor Auto Care can inspect your brakes this week.
- Local drivers: keep school runs, commutes, and weekend trips safer with a brake check.
- Brake service should be clear, fairly priced, and handled by a neighborhood shop.

Landing page copy: Schedule a brake inspection with Harbor Auto Care and get straightforward recommendations from a local repair team.

Follow-up message: Thanks for checking in with Harbor Auto Care. Reply with your preferred day and we will help schedule your brake inspection.""",
    },
    {
        "id": "agt_research_harbor_brake_campaign",
        "agent_name": "Research",
        "summary": "Research Agent produced local positioning and competitor-aware recommendations.",
        "output_markdown": """# Research Agent

Positioning: emphasize neighborhood trust, transparent estimates, and brake safety before longer summer drives.

Competitor-aware recommendation: avoid discount-only messaging. Lead with clear diagnostics, local convenience, and confidence in the repair plan.

Audience note: target owners who respond to safety, scheduling ease, and honest pricing rather than luxury-service language.""",
    },
    {
        "id": "agt_ops_harbor_brake_campaign",
        "agent_name": "Ops",
        "summary": "Ops Agent finalized the delivery checklist and renewal recommendation.",
        "output_markdown": """# Ops Agent

Delivery checklist:
- Confirm payment recorded in the local sandbox ledger.
- Verify approved vendor spend totals $187.
- Verify Premium Automation Suite remained blocked.
- Package campaign copy, social posts, landing copy, and follow-up copy.
- Attach final profitability report.

Renewal recommendation: renew campaign for another 30 days while preserving the $300 spend cap and 50% margin floor.""",
    },
]
