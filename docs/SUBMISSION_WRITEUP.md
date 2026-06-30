# ScaleX Submission Writeup

## Product Name

ScaleX ClientOps Autopilot: Enterprise Function Accelerator for Revenue-Backed Client Operations

## One-Liner

ScaleX lets enterprise teams safely turn paid client work into governed AI-executed operations
with finance proof, policy checks, blocked-risk enforcement, evidence, and protected-profit
reporting.

## Problem

Enterprises want AI agents to help run client operations, but raw agents cannot be trusted with
money, vendors, client workflows, approvals, or internal systems without controls. A normal
automation chain can fire actions quickly, but it usually lacks business context, margin
awareness, policy proof, and audit evidence.

ScaleX focuses on the missing control layer: before an AI-planned operation can move forward,
ScaleX checks the client context, revenue state, vendor/spend rules, guardrails, and expected
profit outcome.

## What ScaleX Does

The demo uses a synthetic Northstar Dental Group / Client Implementation Launch operation. Revenue
is secured at `$8,500`. The approved delivery cost basis is `$3,935`, including setup/tool spend,
labor job costing, delivery costs, platform fees, QA overhead, and contingency reserve. A risky
vendor enrichment request for `$3,200` is blocked. The protected profit is `$4,565`, with a
protected margin of `53.7%` against a `50.0%` margin floor.

The governed run shows the enterprise control loop:

1. Business intake establishes the client operation context.
2. Hermes creates the implementation plan through a Nemotron 3 Ultra-capable planning route when
   runtime evidence is configured; Judge Demo Mode uses deterministic planning proof.
3. Stripe sandbox/test finance state grounds the operation in invoice/payment proof without live
   money.
4. NemoClaw / NeMo / local policy guardrails check risky actions before execution.
5. ScaleX approves safe setup spend, blocks unsafe vendor spend, records evidence, and reports the
   protected profit outcome.

## Why It Matters

ScaleX is not a chatbot, a connector marketplace, or a generic workflow runner. The product value
is that it governs execution. It can say no when an agent-proposed action would violate vendor
policy, spend limits, margin floors, or evidence requirements.

For enterprise operations teams, that means AI can assist with paid client work without losing
control over money, margin, compliance boundaries, or auditability.

## Demo Flow

The three-minute recording path starts on the ScaleX control-room dashboard:

- Show Northstar Dental Group / Client Implementation Launch.
- Show revenue, approved cost basis, blocked risk, protected profit, and protected margin.
- Show the control stack: Hermes plans, Stripe proves finance state, NemoClaw / NeMo / local
  policy checks risk, and ScaleX records evidence.
- Start the governed run.
- Watch the rails complete: input, planning, finance, policy, execution, evidence, output, and
  profit.
- Pause on the blocked risky vendor action.
- Open the Evidence Ledger to show the audit trail.
- Close on the Profit Outcome report.

## Safety Boundaries

The release is demo-safe and source-audit ready:

- Synthetic client data only.
- No patient data, PHI, SSNs, tax IDs, bank data, payroll records, or real customer workflows.
- Judge Demo Mode requires no external credentials.
- Stripe live-money execution is not implemented.
- Verified Live Mode is locked for future work.
- Telegram approval and MCP server access are planned only, not implemented.
- Real NeMo Guardrails, NemoClaw, Hermes, or Stripe usage is claimed only when runtime evidence
  proves that exact configured path.
