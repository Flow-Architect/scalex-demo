# CHANGELOG - ScaleX

This file records completed changes in chronological order.

Use:
- STATUS.md for current verified state.
- TASKS.md for the next active handoff.
- DECISIONS.md for locked decisions.
- CHANGELOG.md for completed work history.

---

## 2026-06-18 - Goal 0: Roadmap and handoff docs

Commit:
d0ed7d4 Initialize ScaleX roadmap and Codex handoff docs

Completed:
- Created initial ScaleX repo memory files.
- Added ROADMAP.md.
- Added AGENTS.md.
- Added START_HERE.md.
- Added STATUS.md.
- Added TASKS.md.
- Added DECISIONS.md.
- Added CHANGELOG.md.
- Added .gitignore.
- Added .env.example.
- Locked ScaleX as a sandbox hackathon demo.
- Locked no-live-money and no-production-data constraints.
- Prepared repo for Codex goal-based development.

Verified:
- Git repo initialized.
- Branch renamed to main.
- First clean commit created.

---

## 2026-06-18 - Goal 1: Sandbox scaffold

Commit:
b12efd5 Initialize ScaleX sandbox scaffold

Completed:
- Added README.md.
- Added backend FastAPI scaffold.
- Added frontend Vite React TypeScript scaffold.
- Added data/schema.sql.
- Added fake Harbor Auto Care seed data.
- Added policies/scalex-policy.json.
- Added agent role placeholders.
- Added docs placeholders.
- Added helper scripts.
- Updated STATUS.md and TASKS.md.

Verified:
- Shell scripts passed bash syntax check.
- data/seed.json parsed successfully.
- policies/scalex-policy.json parsed successfully.
- git diff check passed.
- No live-key patterns were found.
- SQLite installed on Fedora.
- data/schema.sql loaded into SQLite memory.
- Working tree clean after commit.

Not fully verified:
- Full tests were not run yet.
- Backend runtime was not fully verified yet.
- Frontend runtime was not verified yet.

Deferred:
- Backend persistence moved to Goal 2.
- Frontend dashboard moved to a later goal.
- Stripe, GPT-5.5, Hermes, and NemoClaw remained deferred.

---

## 2026-06-18 - Admin: Goal closeout documentation rule

Commit:
8ff4680 Clarify ScaleX goal closeout docs

Completed:
- Clarified that STATUS.md is the current-state tracker.
- Clarified that TASKS.md is the next-action handoff.
- Clarified that CHANGELOG.md is the chronological history.
- Clarified that DECISIONS.md changes only for locked decisions.
- Decided not to add GOAL_LOG.md unless needed later.

Verified:
- Working tree clean after commit.

---

## 2026-06-18 - Goal 2: Backend and SQLite Ledger

Commit:
7bbb130 Add SQLite backend foundation

Completed:
- Implemented SQLite initialization and reset.
- Implemented seed loading from data/seed.json.
- Implemented FastAPI health and demo state endpoints.
- Added repository helpers for core demo tables.
- Added service helpers for seed loading and state assembly.
- Added ledger and profit helper functions.
- Replaced placeholder backend tests with functional tests.
- Updated backend setup, test, dev, and reset scripts.
- Updated STATUS.md and TASKS.md.

Endpoints added or verified:
- GET /health
- GET /api/health
- POST /api/demo/reset
- POST /api/demo/seed
- GET /api/demo/state

Verified:
- ./scripts/setup.sh passed.
- ./scripts/test.sh passed with 9 tests.
- ./scripts/dev.sh started FastAPI on 127.0.0.1:8787.
- GET /health returned OK.
- POST /api/demo/reset created a fresh SQLite database.
- POST /api/demo/seed loaded Harbor Auto Care.
- GET /api/demo/state returned seeded demo state.
- data/scalex.db was created locally and ignored by Git.
- No live-key patterns were found.
- Working tree clean after commit.

Not yet built:
- Demo runner lifecycle.
- Full local policy engine behavior.
- Approved and blocked spend flow.
- Deterministic agent outputs.
- Mock Stripe lifecycle.
- Final profit report.
- Usable frontend dashboard.

Deferred:
- Real Stripe test mode waits until local mock flow is stable.
- GPT-5.5 Auth planning waits until deterministic outputs work.
- Real Hermes and NemoClaw integrations remain optional.
- Live money remains out of scope.

Next:
- Goal 3 - Margin and Policy Engine.

---

## 2026-06-18 - Goal 3: Margin and Policy Engine

Completed:
- Added local ledger helpers for margin after requested spend, remaining spend cap, and payment/revenue existence.
- Implemented local policy spend evaluation from policies/scalex-policy.json.
- Implemented policy-gated spend persistence:
  - approved spend creates policy_check, event, and spend ledger entry
  - blocked spend creates policy_check and event only
- Added POST /api/demo/mark-paid as a local sandbox payment marker.
- POST /api/demo/mark-paid records the seeded $1,200 invoice as local revenue without calling Stripe.
- POST /api/demo/mark-paid is idempotent for the revenue ledger entry.
- Added POST /api/demo/spend-check for local policy-gated vendor spend checks.
- Added tests for payment-before-spend, mark-paid idempotence, approved vendors, blocked vendors, spend cap, margin floor, ledger writes, policy check persistence, and totals.
- Updated STATUS.md and TASKS.md.

Endpoints added or verified:
- POST /api/demo/mark-paid
- POST /api/demo/spend-check

Verified:
- ./scripts/test.sh passed with 20 tests.
- ./scripts/dev.sh started FastAPI on 127.0.0.1:8787 with approval for local socket binding.
- GET /health returned OK.
- POST /api/demo/reset worked.
- POST /api/demo/seed loaded Harbor Auto Care.
- POST /api/demo/spend-check before mark-paid blocked spend due to payment requirement.
- POST /api/demo/mark-paid recorded one $1,200 local sandbox revenue ledger entry.
- Calling POST /api/demo/mark-paid twice did not duplicate revenue.
- POST /api/demo/spend-check approved $89 Local Ads API after payment was marked.
- POST /api/demo/spend-check approved $98 Design Asset Pack after payment was marked.
- POST /api/demo/spend-check blocked $750 Premium Automation Suite.
- GET /api/demo/state showed one revenue entry, two approved spend entries, three policy checks, $187 approved spend, $1,013 gross profit, 84.4% actual margin, and $750 blocked spend.
- data/scalex.db remained ignored by Git.

Not yet built:
- One-click demo runner.
- Deterministic agent outputs.
- Final profit report generation.
- Full Stripe mock/test lifecycle.
- Frontend dashboard.

Deferred:
- Real Stripe test mode remains deferred.
- GPT-5.5 Auth planning remains deferred.
- Real Hermes and NemoClaw integrations remain out of scope for current MVP work.

Suggested commit message:
Implement local policy-gated spend

Next:
- Goal 4 - One-Click Demo Runner.

---

## 2026-06-18 - Goal 3 follow-up: spend-check amount_cents API contract

Completed:
- Fixed POST /api/demo/spend-check to accept amount_cents as the primary request amount field.
- Added requested_amount_cents as a backwards-compatible cents alias.
- Kept amount_usd and amount as legacy compatibility fields while making amount_cents the documented contract.
- Changed spend-check routing so amount_cents is passed directly into policy evaluation and ledger writes without dollar conversion.
- Added clear 400 validation for missing or zero amount_cents.
- Updated endpoint tests to construct requests from the public amount_cents payload.
- Updated STATUS.md and TASKS.md.

Verified:
- ./scripts/test.sh passed with 22 tests.
- Manual curl using {"vendor":"Local Ads API","amount_cents":8900} was blocked before mark-paid due to payment requirement.
- POST /api/demo/mark-paid recorded one $1,200 local sandbox revenue ledger entry and remained idempotent.
- Manual curl using {"vendor":"Local Ads API","amount_cents":8900} approved after mark-paid.
- Manual curl using {"vendor":"Design Asset Pack","amount_cents":9800} approved after mark-paid.
- Manual curl using {"vendor":"Premium Automation Suite","amount_cents":75000} blocked after mark-paid.
- GET /api/demo/state showed revenue_cents 120000, approved_spend_cents 18700, gross_profit_cents 101300, actual_margin_percent 84.4, blocked_spend_cents 75000, ledger entries revenue/spend/spend, and policy checks approved/approved/blocked.
- Missing or zero amount_cents returned "Spend check amount_cents must be greater than zero."

Suggested commit message:
Fix spend-check amount_cents contract

Next:
- Goal 4 - One-Click Demo Runner.

---

## 2026-06-18 - Goal 3 cleanup: blocked spend accounting

Completed:
- Fixed blocked_spend_cents so prerequisite/payment-gate blocks do not inflate final blocked spend.
- Kept pre-payment Local Ads API blocks auditable with policy_check and event records.
- Kept blocked pre-payment spend out of ledger spend entries and out of blocked_spend_cents.
- Preserved counting for post-payment blocked vendor, cap, human approval threshold, and margin-floor blocks.
- Added regression coverage for the full manual sequence:
  - pre-payment $89 Local Ads API block
  - mark-paid
  - post-payment $89 Local Ads API approval
  - post-payment $98 Design Asset Pack approval
  - post-payment $750 Premium Automation Suite block

Verified:
- ./scripts/test.sh passed with 24 tests.
- Manual curl flow passed against http://127.0.0.1:8787:
  - GET /health returned HTTP 200.
  - POST /api/demo/reset returned HTTP 200.
  - POST /api/demo/seed returned HTTP 200.
  - Pre-payment POST /api/demo/spend-check for {"vendor":"Local Ads API","amount_cents":8900} returned spend_blocked, persisted one policy_check and event, created no ledger entries, and left blocked_spend_cents at 0.
  - POST /api/demo/mark-paid returned HTTP 200.
  - Post-payment POST /api/demo/spend-check for {"vendor":"Local Ads API","amount_cents":8900} returned spend_approved.
  - Post-payment POST /api/demo/spend-check for {"vendor":"Design Asset Pack","amount_cents":9800} returned spend_approved.
  - Post-payment POST /api/demo/spend-check for {"vendor":"Premium Automation Suite","amount_cents":75000} returned spend_blocked.
  - GET /api/demo/state showed revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, ledger entries revenue/spend/spend, and policy checks blocked/approved/approved/blocked.

Suggested commit message:
Fix blocked spend accounting for pre-payment blocks

Next:
- Goal 4 - One-Click Demo Runner.

---

## 2026-06-19 - Goal 4: One-Click Demo Runner

Completed:
- Implemented backend/app/demo_runner.py as the complete compressed local lifecycle runner.
- Added POST /api/demo/run.
- Added local mock/test-style Stripe event persistence for customer, invoice, payment link, and payment confirmation.
- Added deterministic Finance, Marketing, Research, and Ops agent outputs.
- Added final profit report creation with blocked_spend_cents persisted.
- Added job completion status update and job_complete timeline event.
- Added timeline_events to demo state as an explicit alias for events.
- Enriched report responses with actual_margin_percent.
- Added tests for POST /api/demo/run lifecycle behavior and repeated reset/rebuild behavior.
- Kept the one-click path free of pre-payment policy_check blocks so final blocked_spend_cents remains 75000.
- Updated STATUS.md and TASKS.md.

Endpoints added or verified:
- POST /api/demo/run
- GET /api/demo/state

Verified:
- ./scripts/test.sh passed with 26 tests.
- ./scripts/dev.sh started FastAPI on http://127.0.0.1:8787 with approval for local socket binding.
- POST /api/demo/run returned status completed.
- GET /api/demo/state showed one complete Harbor Auto Care job.
- GET /api/demo/state showed mock Stripe object types customer, invoice, payment_link, and payment.
- GET /api/demo/state showed ledger entries revenue, spend, spend.
- GET /api/demo/state showed policy checks approved Local Ads API, approved Design Asset Pack, and blocked Premium Automation Suite.
- GET /api/demo/state showed agent outputs Finance, Marketing, Research, and Ops.
- GET /api/demo/state showed final report values revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, policy_violations 0, and recommendation "Renew campaign for another 30 days".
- data/scalex.db remained ignored by Git.

Suggested commit message:
Add one-click demo runner

Next:
- Goal 5 - Frontend Demo Dashboard.

---

## 2026-06-19 - Goal 5: Frontend Demo Dashboard

Completed:
- Replaced the frontend scaffold with a working Vite React TypeScript dashboard.
- Added typed frontend API calls for:
  - GET /api/health
  - GET /api/demo/state
  - POST /api/demo/run
  - POST /api/demo/reset
- Added TypeScript models for the backend demo state, including jobs, events, ledger totals, policy checks, mock Stripe records, agent outputs, and reports.
- Added dashboard sections for:
  - product header and backend health
  - Run Demo Job, Reset Demo, and Refresh controls
  - Harbor Auto Care job summary
  - revenue, approved spend, blocked unsafe spend, gross profit, and margin cards
  - economic loop timeline
  - local mock/test-style Stripe records
  - local SQLite ledger entries
  - local policy guardrails and spend checks
  - deterministic Finance, Marketing, Research, and Ops outputs
  - final profit report and exact cents values
- Added frontend formatting helpers and Vite env typings.
- Added frontend/package-lock.json.
- Added localhost CORS support for Vite origins in the FastAPI app.
- Updated scripts/setup.sh to install frontend dependencies.
- Updated scripts/dev.sh to start backend and frontend together by default.
- Updated scripts/test.sh to run backend pytest and frontend npm build.
- Updated README.md with browser demo instructions.
- Updated STATUS.md and TASKS.md.

Verified:
- ./scripts/setup.sh installed backend requirements and frontend npm dependencies.
- ./scripts/test.sh passed with 26 backend tests and a successful frontend production build.
- ./scripts/dev.sh started backend on http://127.0.0.1:8787 and frontend on http://127.0.0.1:5174.
- GET /api/health returned HTTP 200.
- POST /api/demo/run returned HTTP 200 and the completed lifecycle state.
- Vite frontend returned HTTP 200.
- CORS preflight from Origin http://127.0.0.1:5174 to POST /api/demo/run returned HTTP 200 and allowed the frontend origin.
- Final demo state showed revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, and policy_violations 0.
- Dashboard state includes Finance, Marketing, Research, and Ops agent outputs.
- Dashboard state includes local_mock_test Stripe records for customer, invoice, payment_link, and payment.
- data/scalex.db, frontend/node_modules, frontend/dist, backend/.venv, and backend/.pytest_cache remain ignored by git.

Noted:
- npm install reported one low-severity advisory in the frontend dependency tree. Audit remediation is deferred unless it affects demo safety or build reliability.

Suggested commit message:
Build ScaleX demo dashboard

Next:
- Goal 8 - Hermes + Policy Presentation Polish, or Goal 9 - Final Polish + Submission Prep if the current UI is sufficient for recording.

---

## 2026-06-19 - Goal 5 follow-up: browser verification fix and service workflow positioning

Completed:
- Added FastAPI CORS allowlist entries for:
  - http://127.0.0.1:5173
  - http://localhost:5173
  - http://127.0.0.1:5174
  - http://localhost:5174
- Allowed GET, POST, and OPTIONS for local CORS preflight handling.
- Changed the frontend API default from http://localhost:8787 to http://127.0.0.1:8787.
- Changed the default frontend dev port to 5174 in scripts/dev.sh, frontend/vite.config.ts, and .env.example.
- Added Vite strict port behavior so port conflicts fail visibly instead of silently moving to another port.
- Updated README local demo instructions to http://127.0.0.1:5174.
- Updated public-facing positioning to service workflows/service teams while keeping Harbor Auto Care as the demo client.
- Updated DECISIONS.md to lock the target user as service teams running revenue-backed service workflows.
- Updated STATUS.md and TASKS.md with the verified current state and next handoff.

Verified:
- ./scripts/test.sh passed with 26 backend tests and a successful Vite production build.
- A stale Vite process from this repo was occupying port 5174; it was stopped before verification.
- ./scripts/dev.sh started backend at http://127.0.0.1:8787 and frontend at http://127.0.0.1:5174.
- GET /api/health returned HTTP 200.
- Vite frontend at http://127.0.0.1:5174 returned HTTP 200.
- Served frontend source shows API base default http://127.0.0.1:8787.
- Served frontend source shows the updated service workflows positioning.
- OPTIONS preflight from Origin http://127.0.0.1:5174 returned HTTP 200 for GET /api/health, GET /api/demo/state, POST /api/demo/run, and POST /api/demo/reset.
- OPTIONS preflight to POST /api/demo/run returned HTTP 200 for all required local frontend origins.
- POST /api/demo/run returned HTTP 200 and the completed lifecycle state.
- Final report showed revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, policy_violations 0, and recommendation "Renew campaign for another 30 days".
- Demo state includes Finance, Marketing, Research, and Ops outputs.
- Demo state includes local_mock_test Stripe records for customer, invoice, payment_link, and payment.

Noted:
- No GUI/headless browser binary was available in this shell. Browser-facing behavior was verified through the served Vite source, frontend HTTP 200 response, CORS preflights, and backend API state.

Suggested commit message:
Fix ScaleX browser demo verification

Next:
- Required final user-visible browser click-through at http://127.0.0.1:5174, then commit the Goal 5 dashboard plus browser verification fixes.

---

## 2026-06-19 - Goal 5 final cleanup: audit blockers and Harbor Fleet Services reframe

Completed:
- Removed trailing whitespace from ROADMAP.md so git diff --check can pass.
- Reframed the prior concrete demo client to Harbor Fleet Services.
- Reframed the business type to a regional fleet maintenance provider.
- Reframed the demo job to the 30-day fleet brake inspection campaign.
- Updated seed data, backend events/report text, deterministic agent outputs, backend tests, frontend dashboard copy, and active docs.
- Tightened STATUS.md and TASKS.md so manual browser verification at http://127.0.0.1:5174 is required before commit.
- Kept backend URL http://127.0.0.1:8787 and frontend URL http://127.0.0.1:5174.
- Kept local CORS allowlist entries for localhost/127.0.0.1 on ports 5173 and 5174.

Verified:
- ./scripts/test.sh passed with 26 backend tests and a successful Vite production build.
- git diff --check passed with no output.
- Live Stripe key grep check returned no matches outside excluded ignored/generated paths.
- ./scripts/dev.sh started backend at http://127.0.0.1:8787 and frontend at http://127.0.0.1:5174.
- Vite frontend at http://127.0.0.1:5174 returned HTTP 200.
- POST /api/demo/run returned HTTP 200 with client_name "Harbor Fleet Services", business_type "Regional fleet maintenance provider", and job_name "30-day fleet brake inspection campaign".
- Final report values stayed revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, and policy_violations 0.
- CORS preflight to POST /api/demo/run returned HTTP 200 for http://127.0.0.1:5173, http://localhost:5173, http://127.0.0.1:5174, and http://localhost:5174.

Noted:
- Shell checks and backend/API verification are not a substitute for the required user-visible browser click-through before commit.

Suggested commit message:
Finalize Goal 5 browser demo cleanup

Next:
- Perform the required final user-visible browser click-through at http://127.0.0.1:5174, then commit the Goal 5 cleanup.
