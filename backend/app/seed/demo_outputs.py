"""Deterministic demo outputs for the local ScaleX lifecycle."""

DEMO_AGENTS = ("Finance", "Marketing", "Research", "Ops")

DEMO_AGENT_OUTPUTS = [
    {
        "id": "agt_finance_northstar_client_implementation",
        "agent_name": "Finance",
        "summary": "Finance Agent confirmed the implementation P&L and preserved the 50% margin floor.",
        "output_markdown": """# Finance Agent

- Implementation package revenue booked: $8,500.
- Approved delivery cost basis: $3,935.
- Setup/tool spend: $1,150 across Secure Workspace Pack, Data Migration Sandbox, and Launch Asset Kit.
- Blocked risk: $3,200 Unapproved Data Broker Enrichment request.
- Margin if blocked risk were approved: 16.1%.
- Protected profit: $4,565.
- Protected margin: 53.7%.

Spend control result: the client implementation launch stayed above the 50% margin floor after enterprise delivery costs and inside the $1,150 setup spend cap.""",
    },
    {
        "id": "agt_marketing_northstar_client_implementation",
        "agent_name": "Marketing",
        "summary": "Marketing Agent prepared the launch asset kit package.",
        "output_markdown": """# Marketing Agent

Launch theme: Start the implementation with clear stakeholders, scope, and next steps.

Kickoff copy: Northstar Dental Group can start Client Implementation Launch with a governed setup path, finance proof, approved setup spend, and recorded evidence.

Stakeholder notes:
- Confirm implementation owner, finance contact, and operations handoff lead.
- Keep workspace setup, sandbox preparation, and launch assets tied to the approved scope.
- No patient data or PHI is used in this synthetic implementation sample.

Launch asset copy: Start Client Implementation Launch with Northstar Dental Group and receive a documented onboarding plan.

Follow-up message: Thanks for joining the launch. Reply with stakeholder availability and the implementation team will confirm the next checkpoint.""",
    },
    {
        "id": "agt_research_northstar_client_implementation",
        "agent_name": "Research",
        "summary": "Research Agent produced implementation-risk and vendor-boundary notes.",
        "output_markdown": """# Research Agent

Implementation risk notes: keep the work scoped to onboarding operations, workspace setup, sandbox testing, launch assets, and stakeholder handoff.

Vendor recommendation: use only approved setup vendors and block enrichment or data-broker requests until reviewed through explicit business rules.

Data boundary: this is a synthetic multi-location client account. Do not use patient data, do not include PHI, and do not claim healthcare compliance or HIPAA support.""",
    },
    {
        "id": "agt_ops_northstar_client_implementation",
        "agent_name": "Ops",
        "summary": "Ops Agent finalized the implementation launch checklist and recommendation.",
        "output_markdown": """# Ops Agent

Delivery checklist:
- Confirm payment recorded in the local sandbox ledger.
- Verify approved setup spend totals $1,150.
- Verify total approved delivery costs remain $3,935.
- Verify Unapproved Data Broker Enrichment remained blocked.
- Package workspace setup, non-PHI sandbox, launch asset, and stakeholder handoff evidence.
- Attach final protected-profit report.

Launch recommendation: proceed with implementation launch while preserving the $1,150 setup spend cap and 50% margin floor.""",
    },
]
