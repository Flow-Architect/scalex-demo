# ScaleX ClientOps Autopilot

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

ScaleX helps B2B teams turn repeatable client operations into autonomous, revenue-backed,
policy-governed runs with finance proof, guardrail enforcement, and audit evidence.

## Problem

B2B companies win clients, but onboarding and delivery still happen through fragmented handoffs
across operations, finance, tools, approvals, vendors, and reporting. AI can suggest next steps,
but enterprises cannot safely let an agent execute client operations unless money, spend, policy,
and evidence are governed.

ScaleX solves that by letting Hermes plan and route the operation, Stripe provide finance proof,
ScaleX enforce business rules, local policy check spend and margin today, NeMo Guardrails remain
the planned governed autonomy layer, and SQLite record evidence.

## Current Implemented Sample

The current code implements the Client Implementation Launch template with the synthetic
Northstar Dental Group account.

- Client/account: Northstar Dental Group
- Template: Client Implementation Launch
- Industry label: Multi-location healthcare services group
- Implementation package revenue: $8,500
- Setup spend cap: $1,150
- Margin floor: 50%
- Approved setup spend: $350 Secure Workspace Pack, $500 Data Migration Sandbox, and $300 Launch Asset Kit
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Target report: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, and 86.5% protected margin
- Data boundary: synthetic account only, no patient data, no PHI, no healthcare compliance claim,
  and no HIPAA support claim

Harbor Fleet Services is no longer the current implemented sample. It remains historical only in
older changelog entries.

## Template Model

Implemented today:

- Template: Client Implementation Launch
- Sample account: Northstar Dental Group
- Story: a multi-location client purchased an implementation package, and ScaleX launches the
  client operation from revenue proof through guarded execution and protected profit reporting.

Future templates are planned, not implemented yet: Invoice-to-Cash, Vendor Spend Approval, Client
Onboarding, Research-to-Report, Ops Handoff, and Renewal Recommendation.

## Architecture

```text
Client operation intake
-> Hermes/GPT-5.5 plans and routes the operation
-> Stripe provides finance proof through test invoice/payment state
-> ScaleX executes and enforces business rules
-> local policy active now checks spend, margin, vendors, and payment-before-spend
-> NeMo Guardrails planned after Goal 8
-> SQLite records evidence
-> Profit Outcome reports protected profit and blocked risk
```

## Safety Boundary

ScaleX is not production software. Product mode is real-integration-first, but every integration
must run in the appropriate environment.

- Goal 7 uses real Stripe test mode with `sk_test_...` keys and no live-money movement.
- Live-money payments are a future capability only through Verified Live Mode.
- No real client data.
- No production Hermes, Prometheus, OpenClaw, Recall, or xScaleOS connections.
- Stripe test doubles are for automated tests, CI, local offline development, or explicitly labeled diagnostics.
- Product-mode integration failures must surface visible errors.
- Policy enforcement currently runs through a local policy engine.
- Real NeMo Guardrails is planned and not wired yet.
- Hermes planning uses the ScaleX-isolated laptop install, not production Hermes.
- Stripe test invoices are labeled honestly as open/unpaid unless Stripe reports `paid=true`.

## Current Prototype State

Implemented today:

- FastAPI backend.
- SQLite evidence ledger at `data/scalex.db`.
- Real ScaleX-isolated Hermes Agent planning through the `scalex-operator` skill.
- Hermes invocation constrained to the `skills` toolset for planning.
- SQLite planning run and orchestration call audit records.
- Local policy engine enforcing payment-before-spend, vendor, spend-cap, and margin-floor rules.
- Real Stripe test-mode invoice flow through the orchestration layer.
- Stripe test-double records for automated tests, CI, offline development, and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs.
- Vite React product shell with local prototype auth, Dashboard, Onboarding, Customers, Studio,
  Runs, Audit, Integrations, and Settings.
- Connected Function Studio page with proof nodes, selected-node inspector, persisted run history, and
  historical run inspection.

## Local Browser Demo

Install local dependencies:

```bash
cp .env.example .env
./scripts/setup.sh
```

Start the backend and frontend together:

```bash
./scripts/dev.sh
```

Open:

```text
http://127.0.0.1:5174
```

When `SCALEX_AUTH_ENABLED=true`, configure local-only demo credentials in ignored `.env` before
opening the UI:

```text
SCALEX_DEMO_USERNAME=
SCALEX_DEMO_PASSWORD=
SCALEX_SESSION_SECRET=
```

After login, open Onboarding or Customers, load the Northstar Dental Group sample or create
another synthetic/sample client operation, select it, then open Studio and click `Start Run`.
The run uses the active operation values and appends a new run record instead of
overwriting prior history.

In product mode, Stripe requires a local `.env` `sk_test_...` key and returns a visible Stripe
integration error if test mode is not configured. Automated tests and CI use
`STRIPE_TEST_DOUBLE_MODE=true`.

Normal laptop runs use the ScaleX-isolated Hermes install:

```text
HERMES_HOME=/home/ascabrya/.scalex-hermes/home
HERMES_CLI_PATH=/home/ascabrya/.scalex-hermes/hermes-agent/venv/bin/hermes
HERMES_SKILL_NAME=scalex-operator
HERMES_TOOLSETS=skills
```

Useful local endpoints:

```text
GET  http://127.0.0.1:8787/api/health
GET  http://127.0.0.1:8787/api/demo/state
POST http://127.0.0.1:8787/api/demo/run
POST http://127.0.0.1:8787/api/demo/reset
POST http://127.0.0.1:8787/api/demo/onboarding
POST http://127.0.0.1:8787/api/demo/workflows
POST http://127.0.0.1:8787/api/demo/workflows/{workflow_id}/select
POST http://127.0.0.1:8787/api/demo/workflows/{workflow_id}/delete
GET  http://127.0.0.1:8787/api/demo/state?run_id={run_id}
POST http://127.0.0.1:8787/api/auth/login
GET  http://127.0.0.1:8787/api/auth/me
POST http://127.0.0.1:8787/api/auth/logout
```

To run only the backend:

```bash
SCALEX_BACKEND_ONLY=true ./scripts/dev.sh
```

Run checks with:

```bash
./scripts/test.sh
```

The test script runs backend pytest and the frontend production build.

Reset the demo state with:

```bash
./scripts/reset-demo.sh
```

These commands must not use live Stripe mode or production service credentials.

## What Is Real, Test, And Future

- Real now: isolated Hermes planning through `scalex-operator`, real Stripe test-mode invoice
  creation/finalization, SQLite evidence ledger, local policy enforcement, local prototype auth,
  SQLite-backed local/sample workflows, selected-workflow runs, persisted run history, and browser
  product flow.
- Test/diagnostic only: deterministic Hermes planning and Stripe test doubles in automated tests,
  CI, offline development, or explicitly labeled diagnostics.
- Planned next: Goal 7.11C aligns the ClientOps Function Studio visual story, then Goal 8A audits
  NeMo Guardrails availability.
- Future: Goal 8 governed autonomy with NVIDIA NeMo Guardrails or a NeMo-compatible adapter, Goal
  9 final submission prep, and Verified Live Mode before any live-money Stripe actions.
