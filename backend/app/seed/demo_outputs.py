"""Deterministic demo outputs for the local ScaleX lifecycle."""

DEMO_AGENTS = ("Finance", "Marketing", "Research", "Ops")

DEMO_AGENT_OUTPUTS = [
    {
        "id": "agt_finance_harbor_fleet_brake_inspection",
        "agent_name": "Finance",
        "summary": "Finance Agent confirmed the job P&L and preserved the 50% margin floor.",
        "output_markdown": """# Finance Agent

- Revenue booked: $1,200.
- Approved spend: $187 across Local Ads API and Design Asset Pack.
- Blocked unsafe spend: $750 Premium Automation Suite request.
- Gross profit: $1,013.
- Final margin: 84.4%.

Spend control result: the fleet brake inspection campaign stayed well above the 50% margin floor and below the $300 spend cap.""",
    },
    {
        "id": "agt_marketing_harbor_fleet_brake_inspection",
        "agent_name": "Marketing",
        "summary": "Marketing Agent prepared the fleet brake inspection campaign package.",
        "output_markdown": """# Marketing Agent

Campaign theme: Keep Every Route Stopping Safely.

Offer copy: Book a fleet brake inspection this month and get a clear maintenance plan before small brake issues interrupt routes.

Social posts:
- Fleet managers: Harbor Fleet Services can inspect brake systems across your vehicles this week.
- Operations teams: keep routes moving with scheduled brake checks before small issues become downtime.
- Brake maintenance should be clear, fairly priced, and documented for the whole fleet.

Landing page copy: Schedule a fleet brake inspection with Harbor Fleet Services and get straightforward recommendations from a regional maintenance team.

Follow-up message: Thanks for checking in with Harbor Fleet Services. Reply with your vehicle count and preferred inspection window and we will help schedule the fleet brake inspection.""",
    },
    {
        "id": "agt_research_harbor_fleet_brake_inspection",
        "agent_name": "Research",
        "summary": "Research Agent produced regional fleet positioning and competitor-aware recommendations.",
        "output_markdown": """# Research Agent

Positioning: emphasize uptime, route safety, transparent maintenance planning, and brake risk before peak service windows.

Competitor-aware recommendation: avoid discount-only messaging. Lead with clear diagnostics, predictable scheduling, and confidence in the maintenance plan.

Audience note: target operations teams who respond to safety, scheduling ease, and honest pricing rather than luxury-service language.""",
    },
    {
        "id": "agt_ops_harbor_fleet_brake_inspection",
        "agent_name": "Ops",
        "summary": "Ops Agent finalized the delivery checklist and renewal recommendation.",
        "output_markdown": """# Ops Agent

Delivery checklist:
- Confirm payment recorded in the local sandbox ledger.
- Verify approved vendor spend totals $187.
- Verify Premium Automation Suite remained blocked.
- Package campaign copy, fleet operations notes, landing copy, and follow-up copy.
- Attach final profitability report.

Renewal recommendation: renew campaign for another 30 days while preserving the $300 spend cap and 50% margin floor.""",
    },
]
