# STATUS — ScaleX

Last updated: 2026-06-19

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Last completed goal: /goal 4 — One-Click Demo Runner.
- Repo memory files exist:
  - AGENTS.md
  - START_HERE.md
  - ROADMAP.md
  - DECISIONS.md
  - STATUS.md
  - TASKS.md
  - CHANGELOG.md
- README.md exists and describes ScaleX as a local sandbox hackathon demo.
- .gitignore exists and ignores local env files, SQLite database files, logs, venvs, node_modules, frontend build output, and recordings.
- .env.example exists with sandbox defaults, including STRIPE_LIVE_MODE=false and STRIPE_MOCK_MODE=true.
- data/schema.sql exists with the local SQLite ledger tables, including reports.blocked_spend_cents.
- data/seed.json exists with fake Harbor Auto Care demo data.
- policies/scalex-policy.json exists with local demo policy rules.
- agents/ contains Finance, Marketing, Research, and Ops role placeholders.
- docs/ contains scaffold documentation placeholders.
- scripts/setup.sh, scripts/dev.sh, scripts/test.sh, and scripts/reset-demo.sh exist and are executable.
- FastAPI backend exposes:
  - GET /health
  - GET /api/health
  - POST /api/demo/reset
  - POST /api/demo/seed
  - POST /api/demo/run
  - POST /api/demo/mark-paid
  - POST /api/demo/spend-check
  - GET /api/demo/state
- SQLite initialization is implemented from data/schema.sql.
- POST /api/demo/reset creates a fresh local SQLite database at data/scalex.db.
- POST /api/demo/seed loads the fake Harbor Auto Care job from data/seed.json.
- POST /api/demo/mark-paid records a local sandbox revenue ledger entry for the seeded $1,200 job invoice and creates a payment-confirmed event without calling Stripe.
- POST /api/demo/spend-check persists a policy_check for every spend request.
- Approved spend requests create spend ledger entries.
- Blocked spend requests do not create spend ledger entries.
- Pre-payment prerequisite blocks still create policy_check records and events, but they do not create spend ledger entries or count toward blocked_spend_cents.
- POST /api/demo/run resets and rebuilds the complete compressed local demo lifecycle:
  - seeds the Harbor Auto Care job
  - records job intake, margin plan, payment gate, mock Stripe, payment, policy, agent work, profit report, and job complete timeline events
  - creates local mock/test-style Stripe records for customer, invoice, payment link, and payment confirmation
  - marks local sandbox payment confirmed
  - approves $89 Local Ads API spend
  - approves $98 Design Asset Pack spend
  - blocks $750 Premium Automation Suite spend
  - creates deterministic Finance, Marketing, Research, and Ops outputs
  - creates the final profit report
  - marks the job complete
- GET /api/demo/state returns job, jobs, events, timeline_events, mock Stripe events, ledger entries, ledger totals, policy checks, agent outputs, reports, and the latest final report.
- Verified Goal 4 final one-click state:
  - one Harbor Auto Care job exists
  - job status is complete
  - ledger entries are revenue, spend, spend
  - revenue_cents is 120000
  - approved_spend_cents is 18700
  - blocked_spend_cents is 75000
  - gross_profit_cents is 101300
  - actual_margin_percent is 84.4
  - policy checks are approved Local Ads API, approved Design Asset Pack, and blocked Premium Automation Suite
  - mock Stripe event object types are customer, invoice, payment_link, and payment
  - agent outputs are Finance, Marketing, Research, and Ops
  - final report shows revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, policy_violations 0, and recommendation "Renew campaign for another 30 days"
- Backend tests cover schema initialization, seed loading, margin calculations, ledger totals, policy persistence, policy decisions, payment marking, health behavior, demo state behavior, POST /api/demo/run lifecycle behavior, and repeated one-click runs.
- scripts/setup.sh installs backend Python dependencies into backend/.venv.
- scripts/test.sh runs backend pytest.
- Verified on 2026-06-19:
  - ./scripts/test.sh passed with 26 tests.
  - ./scripts/dev.sh started the backend on http://127.0.0.1:8787 with approval for local socket binding.
  - POST /api/demo/run returned HTTP 200 and status completed.
  - GET /api/demo/state returned the completed lifecycle state and expected final totals.
  - data/scalex.db is ignored by git.

## Not yet built

- Usable frontend dashboard.
- Frontend tests.
- GPT-5.5 planning service.
- Hermes-style orchestration adapter behavior beyond placeholder naming.
- Demo recording.

## Not yet verified

- Fresh-clone setup on a clean machine.
- Frontend dependency installation or frontend build.
- End-to-end browser UI flow.

## Deferred / revisit

- scripts/dev.sh starts backend only by default; frontend startup is deferred until the dashboard goal.
- scripts/setup.sh installs backend dependencies only; frontend dependency installation is deferred until the dashboard goal.
- Real Stripe test-mode support remains deferred; Goal 4 uses local mock/test-style Stripe records only.
- Real Hermes, NemoClaw, GPT planning, public deployment, live money, production data, and real customer workflows remain out of scope for current MVP work.

## Current priority

Run Codex /goal 5 — Frontend Demo Dashboard.
