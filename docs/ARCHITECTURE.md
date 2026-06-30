# ScaleX Architecture

ScaleX is a governed execution layer for revenue-backed client operations. It wraps AI planning,
finance proof, policy enforcement, protected execution, evidence, and profit reporting into a
single controlled run.

## System Overview

```text
Business intake
-> Hermes planning boundary
-> Stripe sandbox/test finance proof
-> NemoClaw / NeMo / local policy guardrails
-> ScaleX controlled execution
-> SQLite evidence ledger
-> Profit outcome
```

The default public demo path is deterministic Judge Demo Mode. It does not require external
credentials and does not call live production systems.

## Responsibilities

- **Frontend**: Vite React control-room UI for dashboard metrics, governed rails, evidence ledger,
  connection hub, settings, intake, document review, and workforce/job costing.
- **Backend**: FastAPI app that exposes demo state, run/reset actions, onboarding/workflow
  endpoints, policy checks, planning boundaries, ledger records, and profit reports.
- **SQLite**: Local evidence ledger and runtime state. `data/schema.sql` and `data/seed.json` are
  tracked; runtime `data/scalex.db` is ignored and recreated locally.
- **Hermes planning boundary**: Proposes implementation plans and tool sequences. Judge Demo Mode
  uses deterministic planning proof unless configured runtime evidence proves otherwise.
- **Stripe finance boundary**: Provides sandbox/test finance state or an explicitly labeled test
  double. Live-money Stripe execution is not implemented.
- **Guardrails**: Local policy is active by default. Optional NeMo Guardrails and NemoHermes /
  NemoClaw paths are selected only through explicit local configuration and runtime proof.
- **Evidence ledger**: Records what was proposed, checked, approved, blocked, and reported.

## Execution Modes

### Judge Demo Mode

The default mode. It uses deterministic planning proof, local policy guardrails, Stripe
test-double/sandbox finance proof, synthetic records, and a local SQLite database. No secrets are
required.

### Stripe Sandbox Prototype

Optional test-mode finance configuration for operators who provide safe local Stripe test
credentials in ignored `.env`. It must not use live keys or live-money movement.

### Optional Runtime Proof

Operators can configure isolated Hermes, NemoHermes/NemoClaw, or NeMo Guardrails adapter probing
locally. ScaleX must label those paths according to runtime evidence. If proof is absent, the UI
and API remain truthful about deterministic/local behavior.

### Verified Live Mode

Future-only and locked. Live-money execution requires a separate verified design with approvals,
caps, allowlists, audit records, and tests.

## Data Flow

1. The operator opens the dashboard with the Northstar Dental Group operation preloaded.
2. The backend initializes local SQLite from tracked schema and seed data if needed.
3. Business intake and workforce assumptions define operation context and delivery cost basis.
4. Planning creates an implementation plan and proposed tool sequence.
5. Finance proof records sandbox/test invoice and payment-state evidence.
6. Policy guardrails approve safe setup spend and block risky vendor enrichment.
7. Agent outputs are recorded as demo evidence.
8. The final report calculates protected profit and protected margin.

## Evidence Model

ScaleX records evidence across:

- planning runs
- orchestration calls
- policy checks
- Stripe/test finance events
- ledger entries
- guardrail evaluations
- agent outputs
- final profit reports

The Evidence Ledger is intentionally business-readable first. Raw technical detail should remain
secondary to actor, action, result, evidence type, safety note, and timestamp/order.

## Current Demo Economics

- Revenue: `$8,500`
- Approved delivery cost basis: `$3,935`
- Risk contained after blocked vendor action: `$3,200`
- Protected profit: `$4,565`
- Protected margin: `53.7%`
- Margin floor: `50.0%`

## Safety Boundaries

- Synthetic B2B client operation only.
- No real customer data, patient data, PHI, SSNs, tax IDs, bank data, payroll records, or raw
  uploaded files.
- Labor costing is job costing only, not payroll, HR compliance, tax, or workforce management.
- No production Hermes claim without runtime evidence.
- No real NemoClaw or NeMo claim without runtime evidence.
- No live Stripe money movement.
- Telegram approval and MCP server access are not implemented.

## Not Implemented

- Verified Live Mode
- live-money Stripe execution
- production Hermes
- production customer workflows
- Telegram approval flow
- MCP server or external agent access
- production payroll/HR/tax/compliance behavior
- Docker/NemoClaw command execution from this app
