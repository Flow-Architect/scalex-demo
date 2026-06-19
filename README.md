# ScaleX

ScaleX is a working product-style prototype for profit-aware agent operations in service workflows.

Submission title: **ScaleX: Profit-Aware Agent Operations for Service Workflows**

ScaleX is a profit-aware agent operations framework for service workflows. It lets an operator confirm revenue, plan work, spend only inside policy, coordinate agent outputs, and produce an auditable profit report.

The product thesis is simple: a service team should be able to give an AI operator a paid job, a budget, and a margin floor, then see the operator invoice, control spend, coordinate work, and report profit without risking live money or production systems.

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

ScaleX is not production software. It must stay local and sandbox-safe.

- No live Stripe keys.
- No live payments.
- No real client data.
- No production Hermes, Prometheus, OpenClaw, Recall, or xScaleOS connections.
- Stripe is test/sandbox mode only, with local fallback records for reliability.
- Policy enforcement currently runs through a local policy engine.
- Hermes integration is next and must use the ScaleX-isolated laptop install, not production Hermes.

## Current Prototype State

Implemented today:

- FastAPI backend.
- SQLite audit ledger at `data/scalex.db`.
- Local policy engine enforcing payment-before-spend, vendor, spend-cap, and margin-floor rules.
- Local fallback Stripe-shaped records for customer, invoice, payment link, and payment confirmation.
- Deterministic Finance, Marketing, Research, and Ops outputs.
- Vite React dashboard.
- One-click Harbor Fleet Services sample run with the locked final report numbers.

Next target:

- Wire ScaleX to the isolated Hermes brain/orchestration install on this laptop.
- Use GPT-5.5 Auth through Hermes for planning/reasoning.
- Add Stripe test-mode payment/invoice objects through the orchestration layer.
- Add NemoClaw or a policy safety adapter if it can be done safely.

The dashboard calls the local backend to run the complete compressed lifecycle and display job intake, planning, payment state, policy decisions, agent work, ledger entries, and the final profit report.

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

Click `Run Demo Job` to call `POST /api/demo/run` and rebuild the local sample workflow.

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

These commands are local-only. They must not use live Stripe mode or production service credentials.

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
