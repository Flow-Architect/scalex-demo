# ScaleX Product Spec

ScaleX ClientOps Autopilot is an enterprise function accelerator for revenue-backed client
operations. It helps teams let AI participate in paid client work while keeping control of money,
margin, policy, approvals, and audit evidence.

## Product Standard

ScaleX is not a chatbot, generic workflow builder, connector marketplace, MCP platform, or
Zapier/n8n clone. It is a governed execution layer. The product must make the control story clear:
Hermes plans, Stripe proves finance state, NemoClaw / NeMo / local policy checks risk, ScaleX
blocks unsafe execution, and the Evidence Ledger records proof.

## Problem Statement

Enterprise teams want AI agents to help run repeatable client operations, but raw agents cannot
touch money, vendors, client workflows, approvals, or internal systems without guardrails. Normal
automation can trigger actions, but it is often not finance-aware, margin-aware, or audit-ready.

## Current Demo

The implemented sample is a synthetic Northstar Dental Group / Client Implementation Launch
operation:

- Revenue secured: `$8,500`
- Approved delivery cost basis: `$3,935`
- Blocked risky vendor spend: `$3,200`
- Protected profit: `$4,565`
- Protected margin: `53.7%`
- Margin floor: `50.0%`

The blocked action is an unapproved data-broker enrichment / premium vendor spend request. ScaleX
blocks it because it violates vendor policy, creates uncontrolled spend exposure, and would harm
the protected margin outcome.

## Command Center

The primary UI is a dark enterprise control-room dashboard:

- sidebar navigation
- active operation card
- metric strip
- governed run stage
- control stack
- blocked-risk spotlight
- economic control/profit outcome
- evidence ledger
- connection hub
- settings and safety boundaries

The first screen should communicate the product without needing narration: ScaleX governs paid
client operations with proof, policy, money control, and audit.

## Governed Run

The governed run is shown as execution rails rather than a generic task list:

- Input Rail
- Hermes Plan
- Planning Rail
- Stripe Finance Proof
- Revenue Gate
- NeMo / Local Policy
- Controlled Spend
- Risky Vendor Action
- Evidence Ledger
- Output Honesty Rail
- Profit Outcome

Each rail should communicate status, actor/system, proof/evidence, and whether ScaleX approved,
blocked, recorded, verified, or failed closed.

## Business Intake

Business intake creates the operation context. It supports manual entry and demo document-review
states. Uploaded real files are not required and should not be committed. Review-before-save is a
product behavior: ScaleX should not silently accept extracted client context without operator
review.

## Document Review

Document review demonstrates structured intake behavior without live extraction services. The demo
uses deterministic fixtures and manual fallback states. It must not claim production document
extraction, PHI handling, or real client record processing.

## Workforce Costing

Workforce costing reveals true delivery cost before ScaleX allows actions. Employee records are
demo job-costing assumptions only. The product must not imply payroll, HR compliance, tax
processing, workforce management, SSN handling, bank-data handling, or real employee systems.

## Economic Control

The money panel is central to the product. It should show:

- revenue secured
- approved setup/tool spend
- approved delivery cost basis
- labor cost inside cost basis
- blocked risky spend
- protected profit
- protected margin
- margin floor

Formula:

```text
Protected profit = Revenue - Approved Delivery Cost Basis
Protected margin = Protected profit / Revenue
```

## Evidence Ledger

The Evidence Ledger should feel like an enterprise audit trail. Events should show order/time,
actor/system, action, result, evidence type, and safety note. Primary views should avoid raw debug
payloads; technical details can remain secondary or expandable.

## Execution Modes

- **Judge Demo Mode**: default deterministic/local mode with no external credentials.
- **Stripe Sandbox Prototype**: optional test-mode configuration, no live money.
- **Optional runtime proof**: Hermes, NeMo Guardrails, NemoHermes/NemoClaw paths only when
  explicitly configured and verified.
- **Verified Live Mode**: future-only and locked.

## Safety Boundaries

- Synthetic clients and demo employees only.
- No real customer data, PHI, SSNs, tax IDs, bank data, payroll records, or raw uploaded files.
- No live Stripe money movement.
- No production Hermes claim without runtime evidence.
- No real NeMo/NemoClaw claim without runtime evidence.
- Telegram approval and MCP server access are planned/future only.
- Runtime databases, `.env`, recordings, logs, build output, virtual environments, and
  `node_modules` must not be committed.

## Future Directions

- Verified Live Mode with explicit approvals and audit controls.
- Human approval gates for high-risk client-impacting actions.
- Production-grade connector configuration and secrets handling.
- MCP access pattern after policy and approval boundaries are safe.
- Additional operation templates beyond Client Implementation Launch.
- Stronger runtime-backed planning and guardrail verification where configured.
