# STATUS — ScaleX

Last updated: 2026-06-18

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Last completed goal: /goal 3 cleanup — blocked spend accounting for pre-payment prerequisite blocks.
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
- Backend scaffold exists under backend/ with FastAPI package placeholders, service placeholders, seed package, requirements.txt, and placeholder tests.
- Frontend scaffold exists under frontend/ with Vite React TypeScript files, Tailwind config, API/types placeholders, and component placeholders.
- data/schema.sql exists with the planned SQLite ledger tables.
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
  - POST /api/demo/mark-paid
  - POST /api/demo/spend-check
  - GET /api/demo/state
- SQLite initialization is implemented from data/schema.sql.
- POST /api/demo/reset creates a fresh local SQLite database at data/scalex.db.
- POST /api/demo/seed loads the fake Harbor Auto Care job from data/seed.json.
- GET /api/demo/state returns seeded job data, ledger totals, local policy config summary, events, persisted policy checks, empty agent/report collections, and report placeholders.
- Repository helpers exist for jobs, events, ledger entries, policy checks, Stripe events, agent outputs, and reports.
- Core ledger helpers exist for projected profit, projected margin, actual profit, actual margin, margin after requested spend, approved spend total, blocked spend total, remaining spend cap, and payment/revenue existence.
- Local policy service reads policies/scalex-policy.json and evaluates spend requests against sandbox mode, payment-before-spend, approved vendors, blocked vendors, human approval threshold, spend cap, and margin floor.
- POST /api/demo/mark-paid records a local sandbox revenue ledger entry for the seeded $1,200 job invoice and creates a payment-confirmed event without calling Stripe.
- POST /api/demo/mark-paid is idempotent for the revenue ledger entry.
- POST /api/demo/spend-check persists a policy_check for every spend request.
- POST /api/demo/spend-check accepts amount_cents as the primary documented request amount field and requested_amount_cents as a backwards-compatible alias.
- POST /api/demo/spend-check returns a clear 400 validation error when amount_cents is missing or zero.
- Approved spend requests create spend ledger entries.
- Blocked spend requests do not create spend ledger entries.
- Pre-payment prerequisite blocks still create policy_check records and events, but they do not create spend ledger entries or count toward blocked_spend_cents.
- Verified Goal 3 local policy behavior:
  - Spend is blocked before payment is marked when payment-before-spend is required.
  - Pre-payment Local Ads API spend blocks persist a policy_check and event while leaving blocked_spend_cents at 0.
  - $89 Local Ads API is approved after payment is marked.
  - $98 Design Asset Pack is approved after payment is marked.
  - $750 Premium Automation Suite is blocked.
  - Spend over cap is blocked.
  - Human approval threshold violations are blocked and counted as blocked spend after payment is marked.
  - Margin-floor violations are blocked.
  - Final Goal 3 ledger state after the full manual flow shows $1,200 revenue, $187 approved spend, $750 blocked spend, $1,013 gross profit, and 84.4% actual margin.
  - Blocked spend total excludes prerequisite/payment-gate blocks and includes the $750 Premium Automation Suite request.
- Backend tests cover schema initialization, seed loading, margin calculations, ledger totals, policy persistence, policy decisions, payment marking, health behavior, and demo state behavior.
- scripts/setup.sh installs backend Python dependencies into backend/.venv.
- scripts/test.sh runs backend pytest.
- Verified on 2026-06-18:
  - ./scripts/setup.sh passed.
  - ./scripts/test.sh passed with 24 tests after the blocked spend accounting cleanup.
  - ./scripts/dev.sh started the backend on localhost:8787 with approval for local socket binding.
  - curl checks passed for GET /health, POST /api/demo/reset, POST /api/demo/seed, POST /api/demo/spend-check before payment, POST /api/demo/mark-paid, POST /api/demo/spend-check after payment, and GET /api/demo/state.
  - Manual curl checks with {"vendor":"Local Ads API","amount_cents":8900} passed: blocked before mark-paid due to payment requirement, persisted a policy_check and event, created no ledger entry, left blocked_spend_cents at 0, and approved after mark-paid.
  - Manual curl checks with {"vendor":"Design Asset Pack","amount_cents":9800} approved after mark-paid.
  - Manual curl checks with {"vendor":"Premium Automation Suite","amount_cents":75000} blocked after mark-paid.
  - Final manual curl state showed revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, ledger entries revenue/spend/spend, and policy checks blocked/approved/approved/blocked.
  - data/scalex.db is ignored by git.

## Not yet built

- Demo runner lifecycle.
- Deterministic agent outputs.
- Stripe mock/test event service logic.
- GPT-5.5 planning service.
- Hermes-style orchestration adapter behavior.
- Usable frontend dashboard.
- Frontend tests.
- Demo recording.

## Not yet verified

- Fresh-clone setup on a clean machine.
- Frontend dependency installation or frontend build.
- End-to-end browser UI flow.

## Deferred / revisit

- scripts/dev.sh starts backend only by default for Goal 2; frontend startup is deferred until the dashboard goal.
- scripts/setup.sh installs backend dependencies only for Goal 2; frontend dependency installation is deferred until the dashboard goal.
- POST /api/demo/mark-paid is a local sandbox payment marker only; full Stripe mock/test lifecycle remains deferred.
- Real Stripe test-mode support remains deferred until after the mock/local demo is stable.
- Real Hermes, NemoClaw, GPT planning, and public deployment remain out of scope for current MVP work.

## Current priority

Run Codex /goal 4 — One-Click Demo Runner.
