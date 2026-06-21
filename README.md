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
- Vite React dashboard.
- Goal 7.6 command-center first viewport with the live workflow claim, Profit Protected outcome, Live Stack Proof, and staged execution replay.
- One-click Harbor Fleet Services sample run with the locked final report numbers.

Next target:

- Add NemoClaw or a NemoClaw-style policy safety adapter if it can be done safely.
- Add future Verified Live Mode before any live-money Stripe capability.

The dashboard calls the local backend to run the complete compressed lifecycle and display job intake, Hermes planning, orchestration/tool calls, payment state, policy decisions, agent work, ledger entries, and the final profit report.

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

Click `Run Demo Job` to call `POST /api/demo/run` and rebuild the sample workflow.
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
