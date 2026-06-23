# ScaleX

ScaleX is a live working product-style prototype for profit-aware agent operations in service workflows.

Submission title: **ScaleX: Profit-Aware Agent Operations for Service Workflows**

ScaleX is a profit-aware agent operations framework for service workflows. It lets an operator confirm revenue, plan work, spend only inside policy, coordinate agent outputs, and produce an auditable profit report.

The product thesis is simple: a service team should be able to give an AI operator a revenue-backed service job, a budget, and a margin floor, then see the operator invoice, control spend, coordinate work, and report profit with real integrations in the appropriate environment.

## Sample Workflow

The locked sample run uses synthetic data only:

- Client: Harbor Fleet Services
- Business type: Regional fleet maintenance provider
- Job: 30-day fleet brake inspection campaign
- Invoice: $1,200
- Spend cap: $300
- Margin floor: 50%
- Approved spend: $89 Local Ads API and $98 Design Asset Pack
- Blocked spend: $750 Premium Automation Suite
- Target report: $1,200 revenue, $187 approved spend, $1,013 gross profit, about 84.4% margin

## Safety Boundary

ScaleX is not production software. Product mode is real-integration-first, but each
integration must run in the appropriate environment.

- Goal 7 uses real Stripe test mode with `sk_test_...` keys and no live-money movement.
- Live-money payments are a future capability only through Verified Live Mode.
- No real client data.
- No production Hermes, Prometheus, OpenClaw, Recall, or xScaleOS connections.
- Stripe test doubles are for automated tests, CI, local offline development, or explicitly labeled diagnostics.
- Product-mode integration failures must surface visible errors.
- Policy enforcement currently runs through a local policy engine until Goal 8 wires a real safety adapter if safely available.
- Hermes planning uses the ScaleX-isolated laptop install, not production Hermes.
- Stripe test invoices are labeled honestly as open/unpaid unless Stripe reports `paid=true`.

## Current Prototype State

Implemented today:

- FastAPI backend.
- SQLite audit ledger at `data/scalex.db`.
- Real ScaleX-isolated Hermes Agent planning through the `scalex-operator` skill.
- Hermes invocation is constrained to the `skills` toolset for the planning call.
- SQLite planning run and orchestration call audit records.
- Local policy engine enforcing payment-before-spend, vendor, spend-cap, and margin-floor rules.
- Real Stripe test-mode invoice flow through the orchestration layer.
- Stripe test-double records are available for automated tests, CI, offline development, and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs.
- Vite React product shell with a local prototype auth gate, functional Customers workflow management, selected-workflow run controls, connected Workflow canvas, right selected-node inspector, persisted run history, audit, integrations, and settings views.
- Goal 7.8 browser product workflow: create/select/delete saved local workflows, load Harbor Fleet Services as the sample, start a run for the active workflow, inspect proof nodes, and return later to run history.
- Goal 7.9C Workflow page redesign: connected enterprise workflow canvas, visible approved/blocked branches, selected-node inspector, and compact proof access without stacked Workflow proof panels.
- Harbor Fleet Services sample run with the locked final report numbers, plus custom synthetic/sample workflows whose invoice amount and economics drive the run.

Next targets:

- Goal 7.9D: clean up Customers, Runs, Audit, Integrations, and Settings so the secondary views match the new Workflow canvas product shell.
- Goal 7.9E: browser-only recording readiness and demo QA.
- Goal 8: add NemoClaw or a NemoClaw-style policy safety adapter if it can be done safely.
- Add future Verified Live Mode before any live-money Stripe capability.

The product shell calls the local backend to run the complete compressed lifecycle and display job intake, Hermes planning, orchestration/tool calls, payment state, policy decisions, agent work, ledger entries, and the final profit report. The walkthrough is intended to be recorded as browser-only product usage: log in, open Customers, use Harbor or create a synthetic workflow, start the selected workflow run, watch the connected Workflow canvas move, click proof nodes, review Audit, open Runs, and log out.

Goal 7.8 made ScaleX a functional product prototype with browser-usable workflow operations. Goal 7.9C now makes the main Workflow page feel like a control-room app with a connected canvas and selected-node inspector instead of stacked proof cards. Local workflow/customer management is real SQLite-backed prototype behavior, but it is not production enterprise auth or full multi-tenant SaaS. No live-money Stripe support was added.

## Demo Modes

### Hosted Judge Demo Mode

A hosted judge demo can show the browser product experience without exposing local
secrets. Hosted mode must use safe environment configuration, must not expose
`STRIPE_SECRET_KEY`, Hermes auth, or session secrets to the browser, and must keep
Stripe in test mode with `livemode=false`.

### Local Full-Proof Run Mode

Local full-proof mode is the strongest proof path. It can use an ignored local `.env`
with real isolated Hermes configuration and a Stripe `sk_test_...` key to create real
Stripe test invoices. `.env` must never be committed.

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

When `SCALEX_AUTH_ENABLED=true`, configure local-only demo credentials in ignored
`.env` before opening the UI:

```text
SCALEX_DEMO_USERNAME=
SCALEX_DEMO_PASSWORD=
SCALEX_SESSION_SECRET=
```

The login gate uses a signed local session cookie. Leave auth disabled in tests or
set test-only credentials; never commit real credentials.

After login, open Customers. Load the Harbor Fleet Services sample or create another
synthetic/sample workflow. Select the workflow, then open Workflow and click `Start Run`
to call `POST /api/demo/run`. The run uses the active workflow values and appends a
new run record instead of overwriting prior history.
In product mode, Stripe requires a local `.env` `sk_test_...` key and returns
a visible Stripe integration error if test mode is not configured. Automated tests
and CI use `STRIPE_TEST_DOUBLE_MODE=true`.

Normal laptop runs use the ScaleX-isolated Hermes install:

```text
HERMES_HOME=/home/ascabrya/.scalex-hermes/home
HERMES_CLI_PATH=/home/ascabrya/.scalex-hermes/hermes-agent/venv/bin/hermes
HERMES_SKILL_NAME=scalex-operator
HERMES_TOOLSETS=skills
```

The repo-owned Hermes skill source is `hermes/skills/scalex-operator/SKILL.md`. The backend syncs it into the isolated Hermes home before product-mode planning if needed. Automated tests set `HERMES_TEST_MODE=true` and do not require Hermes auth.

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

These commands must not use live Stripe mode or production service credentials for Goal 7.

## What Is Real, Test, and Future

- Real now: isolated Hermes planning through `scalex-operator`, real Stripe test-mode invoice creation/finalization, SQLite audit ledger, local policy enforcement, local prototype auth, SQLite-backed local/sample workflows, selected-workflow runs, persisted run history, connected Workflow canvas, selected-node inspector, clickable proof nodes, and the product shell workflow experience.
- Test/diagnostic only: deterministic Hermes planning and Stripe test doubles in automated tests, CI, offline development, or explicitly labeled diagnostics.
- Future: Goal 7.9D/E secondary-view cleanup and recording readiness, NemoClaw-compatible safety integration in Goal 8, and Verified Live Mode before any live-money Stripe actions.

## Core Product Loop

```text
Job Intake
-> Hermes/GPT-5.5 Planning
-> Stripe Test Invoice / Payment Flow
-> Policy/NemoClaw-Style Spend Approval
-> SQLite Ledger / Audit Records
-> Agent Work
-> Profit Report
```
