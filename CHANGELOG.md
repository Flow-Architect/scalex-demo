# CHANGELOG - ScaleX

This file records completed changes in chronological order.

Use:
- STATUS.md for current verified state.
- TASKS.md for the next active handoff.
- DECISIONS.md for locked decisions.
- CHANGELOG.md for completed work history.

---

## 2026-06-23 - Goal 7.9C: Workflow canvas and selected-node inspector

Completed:
- Replaced the old stacked Workflow page with a connected enterprise workflow canvas and right selected-node inspector.
- Added Workflow feature files under `frontend/src/features/workflow/`:
  - `WorkflowPage.tsx`
  - `workflowModel.ts`
  - `WorkflowCanvas.tsx`
  - `WorkflowNode.tsx`
  - `NodeInspector.tsx`
  - inspector components for Run Summary, Customer Intake, Hermes, Stripe, Payment Status, Policy, Spend, Agent Work, SQLite Audit, and Profit Report
- Changed `frontend/src/App.tsx` so the Workflow route delegates to `WorkflowPage` and passes active workflow state, selected inspector node, run progress, run status, notices/errors, loading state, and run/reset/refresh/customer navigation handlers.
- Built the canvas node set:
  - Customer Intake
  - Hermes Brain
  - Stripe Test Invoice
  - Payment Status
  - Policy Gate
  - Approved Spend
  - Blocked Spend
  - Agent Work
  - SQLite Audit
  - Profit Report
- Added SVG connectors with visible green approved branch, red blocked branch, yellow open/pending state, purple Hermes/future accent, and blue Stripe proof accent.
- Added API-state-backed node status logic for workflow/job presence, Hermes metadata and planning runs, Stripe invoice/payment state, policy checks, spend checks, agent outputs, SQLite counts, and report presence.
- Kept frontend run progress as presentation-only while `POST /api/demo/run` is in flight, then settled statuses from API state.
- Added a right inspector that defaults to Run Summary and switches on node click.
- Refined the Workflow canvas interaction layer so the background stays fixed while workflow nodes can be repositioned directly on the canvas.
- Added node dragging with live connector redraw and click-vs-drag handling so layout adjustments do not accidentally change the selected inspector node.
- Preserved proof access for real Hermes, real Stripe test mode, Stripe hosted invoice URL, Stripe `livemode=false`, `invoice_status=open`, `paid=false`, local policy, approved/blocked spend, SQLite counts, agent outputs, and final profit report.
- Preserved Stripe open/unpaid honesty and labels local compressed-run confirmation separately from Stripe-paid revenue.
- Preserved NemoClaw truthfulness: Goal 8 next/not real yet, with local policy active now.
- Removed/collapsed duplicate Workflow page sections now covered by the canvas/inspector:
  - giant replay row
  - duplicate Stripe proof panel
  - duplicate Hermes proof panel
  - full audit feed
  - full ledger table
  - long agent output wall
  - full report markdown outside the Report inspector
  - Judge Proof block on the main Workflow surface
- Left Customers, Runs, Audit, Integrations, and Settings reachable for Goal 7.9D cleanup.
- Did not change backend business logic.
- Did not implement Goal 8, live-money payments, or real NemoClaw integration.

Verified:
- `npm run build` passed for the frontend.
- `npm run build` passed again after the canvas interaction refinement.
- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- Sanitized dev-server verification used `/tmp/scalex-goal79c-manual.db`, `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, `STRIPE_TEST_DOUBLE_MODE=true`, and an unset `STRIPE_SECRET_KEY`.
- Headless Chrome desktop verification completed login, Harbor sample selection, Workflow run, connected canvas checks, Hermes inspector, Stripe inspector, Blocked Spend inspector, Profit Report inspector, Customers/Runs/Audit/Integrations/Settings navigation, and logout.
- Manual browser verification confirmed the inspector sits to the right of the canvas at a 1600px desktop viewport and that all ten required nodes and approved/blocked branch labels render.
- Manual browser verification used diagnostic test-double modes, so no Stripe APIs or Hermes models were called.
- `git diff --check` passed.
- The tracked-file secret scan returned no matches.
- No `.env`, SQLite `.db`, `CODEX_GOALS.md`, or `GOAL_LOG.md` file is staged or present as a new tracked artifact.
- No Stripe API calls or Hermes model calls were intentionally run for this goal.

Suggested commit message:
Finalize Goal 7.9C workflow canvas interactions

Next:
- Goal 7.9D - Customers / Runs / Audit / Integrations cleanup.

---

## 2026-06-23 - Goal 7.9B: Design system and app shell foundation

Completed:
- Extracted the product shell out of `frontend/src/App.tsx` into layout components:
  - `frontend/src/layout/AppShell.tsx`
  - `frontend/src/layout/Sidebar.tsx`
  - `frontend/src/layout/TopCommandBar.tsx`
  - `frontend/src/layout/navigation.ts`
- Added shared UI/status styling helpers:
  - `frontend/src/components/ui/StatusBadge.tsx`
  - `frontend/src/components/ui/statusStyles.ts`
- Moved shared state-derived helpers into `frontend/src/lib/demoSelectors.ts`, including money snapshot, audit row count, run status labels, Stripe/Hermes status helpers, latest-record helpers, plan/task helpers, and optional formatting helpers.
- Reduced `frontend/src/App.tsx` from 3,964 lines to 3,645 lines while keeping it responsible for top-level app state, session loading, API loading, active view state, primary handlers, and high-level routing.
- Normalized the shell around a persistent dark command bar and dark sidebar.
- Split the combined Settings / Integrations route into distinct Integrations and Settings navigation targets.
- Kept Integrations focused on Hermes, Stripe test mode, SQLite, product records, local policy, and NemoClaw Goal 8 next/not real yet.
- Added a real Settings view for prototype auth, local API/database state, active workflow/run records, SQLite path, no-live-money boundary, and NemoClaw not-real-yet boundary.
- Preserved the current Workflow page, workflow map, proof panels, run controls, and clickable node drawer for Goal 7.9C.
- Preserved local prototype auth, onboarding, workflow create/select/delete, selected-workflow runs, persisted run history, Audit proof, real Hermes proof fields, real Stripe test-mode proof fields, Stripe open/unpaid honesty, local policy proof, and NemoClaw honesty.
- Did not implement Goal 7.9C, Goal 8, live-money payments, or real NemoClaw integration.

Verified:
- `npm run build` passed for the frontend.
- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- Sanitized dev-server verification used temp SQLite DBs under `/tmp`, `HERMES_TEST_MODE=true`, `STRIPE_TEST_DOUBLE_MODE=true`, and an unset `STRIPE_SECRET_KEY`.
- Headless Chrome rendered the app shell and a Chrome DevTools Protocol nav check confirmed Workflow, Customers, Runs, Audit, Integrations, and Settings all reached their expected view content.
- The selected Harbor workflow run completed in sanitized test-double mode with $1,200 revenue, $187 approved spend, $750 blocked spend, $1,013 gross profit, 84.4% margin, 1 persisted run, and 45 audit rows.
- `SCALEX_AUTH_ENABLED=true` with explicit test-only credentials verified unauthenticated protected state returned 401, login returned authenticated, `/api/auth/me` and protected state returned 200, logout returned 200, and protected state returned 401 afterward.
- `git diff --check` passed.
- The tracked-file secret scan returned no matches.
- No `.env`, SQLite `.db`, `CODEX_GOALS.md`, or `GOAL_LOG.md` file is staged or present as a new tracked artifact.
- No Stripe API calls or Hermes model calls were intentionally run for this goal.

Suggested commit message:
Extract ScaleX app shell foundation

Next:
- Goal 7.9C - Workflow Canvas + Selected-Node Inspector.

---

## 2026-06-22 - Planned Goal 7.9: Workflow Canvas Product UX Redesign roadmap alignment

Planned:
- Added Goal 7.9 as a UX/product consolidation milestone before Goal 8.
- Broke Goal 7.9 into:
  - Goal 7.9A - UX Blueprint / Product IA Audit
  - Goal 7.9B - Design System + App Shell Foundation
  - Goal 7.9C - Workflow Canvas + Selected-Node Inspector
  - Goal 7.9D - Customers / Runs / Audit / Integrations Cleanup
  - Goal 7.9E - Recording Readiness / Browser-Only Demo QA
- Set Goal 7.9A as the next active handoff.
- Preserved Goal 8 as NemoClaw / policy safety integration and presentation after Goal 7.9.
- Preserved Goal 9 as final polish and submission prep.
- Preserved Goal 7B as future Verified Live Mode hardening.
- Clarified that the current UI is functional but not final, and that the target product model is a workflow canvas plus selected-node inspector.

Not completed:
- No Goal 7.9 implementation work has been done yet.
- No frontend or backend code was changed for this planning update.

Verified:
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- `git status --short` showed documentation-only edits.
- No code, `.env`, SQLite `.db`, Stripe API, or Hermes model changes were made.

Suggested commit message:
Plan Goal 7.9 workflow canvas UX redesign

Next:
- Goal 7.9A - UX Blueprint / Product IA Audit.

---

## 2026-06-21 - Goal 7.8: Functional product workflow, saved workflows, and run history

Completed:
- Added persisted SQLite workflow configs for local/sample customers and service workflows.
- Added active workflow selection so the browser can create/select/delete saved workflows and load Harbor Fleet Services as the sample.
- Changed `POST /api/demo/run` to use the selected workflow instead of resetting to a single Harbor-only state.
- Changed runs to append unique `jobs` records and run-scoped events, planning runs, orchestration calls, Stripe events, ledger entries, policy checks, agent outputs, and reports.
- Added historical run inspection through `GET /api/demo/state?run_id=...`.
- Hardened Hermes adapter error detection so CLI stdout API failures such as HTTP 429 usage limits are surfaced as Hermes integration errors instead of JSON parse failures.
- Made custom workflow economics drive invoice amount, spend cap, margin floor, policy configuration, Stripe/test-double amount, ledger totals, agent output context, and final report math.
- Preserved Harbor Fleet Services locked proof: $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and 84.4% margin.
- Reworked Customers into a functional workflow manager with Harbor sample load, create, select, and delete actions.
- Reworked Runs into persisted run history with click-to-inspect behavior.
- Expanded Audit with ledger, timeline, orchestration feed, Stripe proof, and policy decisions.
- Made workflow graph nodes clickable and added a proof drawer for Hermes, Stripe, payment status, policy, spend branches, agents, SQLite ledger, and final report.
- Kept local prototype auth, real Hermes proof, real Stripe test-mode proof, SQLite audit records, local policy guardrails, and Stripe open/unpaid honesty intact.
- Kept NemoClaw as Goal 8 next/not real yet and did not add live-money Stripe support.

Verified:
- `backend/.venv/bin/python -m compileall backend/app` passed.
- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- Tests cover selected workflow driving runs, custom invoice amount propagation, persistent run history, historical run inspection, protected HTTP endpoints with auth enabled, and unchanged Harbor economics.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- No `.env` file is staged.
- `./scripts/dev.sh` started the backend at `http://127.0.0.1:8787` and frontend at `http://127.0.0.1:5174`.
- Local browser-facing API verification confirmed auth protection before login, local login, custom workflow save, selected-workflow run completion, historical run inspection, frontend load, logout, and protected state after logout.
- Product-mode Summit Pool Services verification completed with real Hermes (`used_real_hermes=true`, `openai-codex`, `gpt-5.5`), real Stripe test mode (`used_real_stripe=true`, `stripe_test`, `livemode=false`, real `in_` invoice ID prefix, `invoice_status=open`, `paid=false`), custom $1,800 invoice amount, $187 approved spend, $1,613 gross profit, and 89.6% margin.
- Product-mode Harbor Fleet Services verification completed with real Hermes and real Stripe test mode, kept Stripe open/unpaid honesty, blocked $750 Premium Automation Suite spend, and preserved the locked economics: $1,200 revenue, $187 approved spend, $750 blocked spend, $1,013 gross profit, and 84.4% margin.

Suggested commit message:
Make ScaleX workflows and run history browser-usable

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation.

---

## 2026-06-21 - Final Goal 7.7 verification and product-doc alignment

Completed:
- Rechecked the implemented Goal 7.7 product shell before commit.
- Audited and aligned AGENTS, ROADMAP, DECISIONS, STATUS, TASKS, CHANGELOG, START_HERE, README, architecture, product spec, demo script, submission writeup, `.env.example`, Hermes skill docs, and agent notes for product-stage language.
- Framed ScaleX as a working product prototype whose recording flow is browser product usage: login, onboard/select Harbor, review rules, start the autonomous run, watch the workflow map, inspect Hermes and Stripe proof, show the blocked spend branch, and review profit/audit output.
- Preserved the hosted judge demo vs local full-proof run distinction: hosted mode must not expose secrets, while local full-proof mode can use ignored `.env` values for real isolated Hermes and Stripe test mode.
- Kept local prototype auth and local/sample onboarding boundaries clear; did not claim production auth or full multi-tenant SaaS.
- Kept NemoClaw as Goal 8 next and did not claim a real NemoClaw integration.
- Did not add live-money Stripe support, real client data, secrets, or commits.
- Cleaned stale historical wording from the first scaffold entry so it refers to synthetic sample seed data.

Verified:
- `./scripts/test.sh` passed with 42 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- No `.env` file is staged.
- With `SCALEX_AUTH_ENABLED=true`, unauthenticated protected demo endpoints returned 401, wrong login returned 401, configured local login returned 200, authenticated state survived normal API navigation, logout returned 200, and protected state returned 401 after logout.
- Demo credentials are environment-backed in backend auth/config code, not exposed as hardcoded frontend values.
- `data/schema.sql` has no password storage table or column.
- Harbor Fleet Services onboarding works.
- Synthetic local onboarding persisted into SQLite and drove the next run with the selected customer/job/economic inputs.
- Harbor Fleet Services was restored and the protected full run preserved real Hermes proof, real Stripe test proof, open/unpaid Stripe honesty, policy proof, SQLite audit rows, and locked sample economics.
- Product shell source contains real Dashboard / Workflow, Customers, Runs, Audit, and Settings / Integrations views rather than placeholder-only tabs.
- Workflow map source contains the requested nodes, real-state settled statuses, approved and blocked branches, Stripe open/unpaid copy, Hermes planner/orchestrator copy, and policy enforcement copy.
- Final isolated headless Chrome rerender was blocked by a local crashpad sandbox error before page load; final recording should still be checked in a normal browser.

Suggested commit message:
Finalize Goal 7.7 product shell verification

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation.

---

## 2026-06-21 - Goal 7.7: Product shell, auth, onboarding, and workflow map

Completed:
- Added local prototype auth with `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, and an HMAC-signed HTTP-only local session cookie.
- Protected `/api/demo/*` endpoints when `SCALEX_AUTH_ENABLED=true`.
- Added `.env.example` placeholders for `SCALEX_AUTH_ENABLED`, `SCALEX_DEMO_USERNAME`, `SCALEX_DEMO_PASSWORD`, and `SCALEX_SESSION_SECRET`; no real credentials were added.
- Added local/sample workflow onboarding with Harbor Fleet Services defaults and synthetic local customer/job support.
- Added `POST /api/demo/onboarding` and SQLite `onboarding_configs` persistence so the active local seed config survives the demo runner reset.
- Added app shell navigation for Dashboard / Workflow, Customers, Runs, Audit, and Settings / Integrations.
- Added a moving Autonomous Workflow Map with Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Guardrail, Spend Decision, Agent Work, SQLite Audit Ledger, and Profit Report nodes.
- Added visible approved/proceed and blocked spend branches in the workflow map.
- Preserved real Hermes proof, real Stripe test proof, Stripe open/unpaid honesty, local policy proof, SQLite audit proof, and locked sample economics.
- Kept NemoClaw labeled as Goal 8 next and did not claim a real NemoClaw integration.
- Did not add live-money Stripe support, production auth, real client data, or full multi-tenant SaaS.
- Updated README, demo script, submission writeup, STATUS, and TASKS for the Goal 7.7 flow and boundaries.

Verified:
- `./scripts/test.sh` passed with 42 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Value-shaped secret scan for live Stripe keys, Stripe webhook secrets, and inline OpenAI project keys returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- No `.env` file is staged.
- `./scripts/dev.sh` started FastAPI at `http://127.0.0.1:8787` and Vite at `http://127.0.0.1:5174` with test-only auth overrides.
- Unauthenticated `GET /api/demo/state` returned 401 with "Login required for the local ScaleX console."
- `POST /api/auth/login` returned authenticated local-cookie status with test-only local credentials.
- `POST /api/demo/onboarding` returned 200 and persisted the Harbor Fleet Services local workflow in SQLite.
- Headless Chrome rendered the unauthenticated first screen as the Secure Operator Console login gate.
- Running the protected demo endpoint with the ignored local `.env` loaded completed the real product path with:
  - `status=completed`
  - `used_real_hermes=true`
  - `provider=openai-codex`
  - `model=gpt-5.5`
  - `skill=scalex-operator`
  - `toolsets_used=["skills"]`
  - `used_real_stripe=true`
  - `stripe_mode=stripe_test`
  - `livemode=false`
  - real Stripe customer ID returned with `cus_` prefix
  - real Stripe invoice ID returned with `in_` prefix
  - hosted invoice URL on `invoice.stripe.com`
  - `invoice_status=open`
  - `paid=false`
  - 17 orchestration calls
  - 45 audit rows
  - `gross_profit_cents=101300`
  - `actual_margin_percent=84.4`

Suggested commit message:
Add ScaleX product shell auth and onboarding

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation.

---

## 2026-06-21 - Documentation audit after Goal 7.6

Completed:
- Audited the ScaleX markdown/docs/notes set after Goal 7.6 before commit.
- Aligned README, ROADMAP, docs, and `.env.example` comments with the current working-tree proof:
  - Goal 6, Goal 7, Goal 7.5, and Goal 7.6 complete
  - Goal 8 next
  - Goal 9 final submission prep
  - Goal 7B future Verified Live Mode hardening
  - real isolated Hermes with `scalex-operator`
  - real Stripe test-mode invoice creation/finalization
  - `invoice_status=open` and `paid=false` labeled honestly
  - SQLite audit ledger
  - active local policy guardrails
  - NemoClaw not yet real
- Updated ROADMAP so Goal 7.6 is presentation polish pulled forward before Goal 8, not a new permanent branch.
- Updated the demo script and submission writeup to match the current first viewport, Profit Protected panel, Live Stack Proof, staged replay, and open/unpaid Stripe proof.
- Left historical changelog entries intact when they described earlier goal state rather than current product claims.
- Reviewed DECISIONS.md, AGENTS.md, START_HERE.md, Hermes skill docs, and agent notes without requiring locked-decision changes.
- Did not change backend logic, frontend layout/code, data files, secrets, Stripe behavior, or Hermes behavior.

Verified:
- `git diff --check` passed.
- Tracked-file secret scan for live Stripe keys, long Stripe test keys, and Stripe webhook secrets returned no matches.
- `git status --short` showed intended working-tree edits only.
- No network calls, Stripe API calls, Hermes model calls, or database writes were performed.

Suggested commit message:
Align ScaleX docs after Goal 7.6

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation.

---

## 2026-06-21 - Goal 7.6: Judge-ready command center first viewport

Completed:
- Reworked the first viewport around the direct hero statement: "ScaleX ran a live AI business workflow."
- Added a larger Profit Protected hero showing $1,200 invoice, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and 84.4% margin.
- Added a first-screen Live Stack Proof strip for Hermes, Stripe test mode, SQLite, local Policy Guardrails, and NemoClaw Goal 8 next.
- Upgraded replay from a small in-flight strip into staged execution cards for intake, Hermes planning, Stripe invoice creation, policy checks, unsafe spend blocking, agent outputs, and profit reporting.
- Added a short run-completed moment after `POST /api/demo/run` returns successfully.
- Kept the replay frontend-only and presentation-only while using API-backed state for completed proof.
- Preserved all existing proof sections: Hermes proof, Stripe proof, hosted invoice URL, `invoice_status=open`, `paid=false`, policy decisions, orchestration feed, agent outputs, SQLite ledger, and profit report.
- Kept NemoClaw honest as Goal 8 next and did not claim a real NemoClaw integration.
- Kept changes frontend-only; backend business logic and final economics were not changed.
- Updated STATUS.md and TASKS.md for Goal 7.6 closeout.

Verified:
- `npm run build` passed for the frontend.
- `./scripts/test.sh` passed with 39 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Tracked-file secret scan for live Stripe keys, long webhook secrets, and inline OpenAI project keys returned no matches.
- No `.env` file was staged, and no `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- `./scripts/dev.sh` started the local backend and frontend.
- Product-mode run without loading the ignored local `.env` showed the visible Stripe missing-key error state.
- Product-mode run with the ignored local `.env` loaded completed with `status=completed`, `used_real_hermes=true`, `provider=openai-codex`, `model=gpt-5.5`, `skill=scalex-operator`, `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`, hosted invoice URL on `invoice.stripe.com`, `invoice_status=open`, `paid=false`, `gross_profit_cents=101300`, and `actual_margin_percent=84.4`.
- Headless Chrome rendered `http://127.0.0.1:5174` after the full run and showed the upgraded hero, Profit Protected outcome, Live Stack Proof, completed replay, real Hermes proof, real Stripe test proof, open/unpaid Stripe honesty, blocked unsafe spend, final economics, and NemoClaw Goal 8 next label.
- Chrome screenshot capture was not completed because screenshot mode hit a local crashpad sandbox error; the DOM render succeeded.

Suggested commit message:
Polish ScaleX judge-ready command center

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation.

---

## 2026-06-21 - Goal 7.5: Product demo control room UI

Completed:
- Replaced the narrow centered frontend dashboard with a full-width ScaleX Command Center.
- Added top-level Live AI Business Operator positioning, active client, run status, and integration badges.
- Added a live run pipeline for Intake, Hermes Plan, Stripe Test Invoice, Payment Status, Policy Gate, Spend Approval, Agent Outputs, and Profit Report.
- Added frontend staged playback while `POST /api/demo/run` is in flight.
- Upgraded Hermes presentation with real-Hermes status, provider/model, skill/toolsets, operating plan phases, agent task list, proposed tool sequence, and a live orchestration execution feed.
- Upgraded Stripe presentation with real/test-double/error mode labels, `livemode`, customer ID, invoice ID, hosted invoice URL, invoice status, paid state, and the honest open/unpaid invoice label.
- Added money/profit proof showing invoice, approved spend, blocked unsafe spend, gross profit, final margin, approved spend under cap, and policy violations.
- Added visual policy guardrail decisions for spend cap, payment-before-spend, margin floor, vendor allow/block list, approved vendors, and blocked vendor spend.
- Added Judge Proof stack section for Hermes Agent, Stripe, SQLite, Policy engine, and future NemoClaw Goal 8.
- Kept changes frontend-only; backend business logic and final economics were not changed.
- Updated STATUS.md and TASKS.md for Goal 7.5 closeout.

Verified:
- `npm run build` passed for the frontend.
- `./scripts/test.sh` passed with 39 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Tracked-file secret scan for live Stripe keys, long webhook secrets, and inline OpenAI API keys returned no matches.
- `./scripts/dev.sh` started the local backend and frontend after local socket approval.
- Running the dev server with the ignored repo-local `.env` loaded completed the full real product path after one transient Hermes JSON-format failure on the first attempt.
- Full product-path verification returned `status=completed`, `used_real_hermes=true`, `provider=openai-codex`, `model=gpt-5.5`, `skill=scalex-operator`, `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`, hosted invoice URL on `invoice.stripe.com`, `invoice_status=open`, `paid=false`, `gross_profit_cents=101300`, and `actual_margin_percent=84.4`.
- Headless Chrome rendered `http://127.0.0.1:5174` after the full run and showed the new command-center UI, real Hermes proof, real Stripe test proof, hosted invoice link, open/unpaid invoice honesty, local policy guardrails, blocked `Premium Automation Suite` spend, final economics, and Judge Proof.
- A separate product-mode run without `STRIPE_SECRET_KEY` showed the visible Stripe integration error state instead of silently falling back.

Noted:
- Browser verification used local POSTs plus headless Chrome render checks; no GUI recording was captured in this session.

Suggested commit message:
Upgrade ScaleX control room demo UI

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation.

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
- Locked ScaleX as a sandbox-safe hackathon prototype.
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
- Added synthetic Harbor Auto Care sample seed data.
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
- Decided not to add a separate goal-tracking file unless needed later.

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

---

## 2026-06-19 - Documentation goal: product-prototype roadmap update

Completed:
- Reframed ScaleX from local-only sample framing to a working product-style prototype with test/sandbox integrations as the target.
- Updated ROADMAP.md so the remaining roadmap is:
  - Goal 6 - Isolated Hermes Brain + Orchestration
  - Goal 7 - Stripe Test Mode through the orchestration layer
  - Goal 8 - NemoClaw / policy safety integration and presentation
  - Goal 9 - Final polish and submission assets
- Removed the obsolete roadmap tree reference to the excluded goal-tracking doc.
- Locked DECISIONS.md around the product prototype standard, fallback purpose, test/sandbox integration target, isolated Hermes install, and no-live-money/no-real-client-data constraints.
- Updated README.md, docs/PRODUCT_SPEC.md, docs/ARCHITECTURE.md, docs/DEMO_SCRIPT.md, docs/SUBMISSION_WRITEUP.md, AGENTS.md, START_HERE.md, .env.example, STATUS.md, and TASKS.md to match the product-prototype direction.
- Recorded that the ScaleX-isolated Hermes install is verified on the Fedora laptop, while real ScaleX-to-Hermes integration is still the next coding goal.

Verified:
- Documentation-only change; no backend/frontend integration code was attempted.
- No secrets were added.
- No new tracking files were created.
- Wording scan found no remaining forbidden product-direction phrases in the source-of-truth docs.
- git diff --check passed with no output.
- Secret-pattern scan returned no matches for live Stripe keys, project API keys, or webhook secrets outside ignored/generated paths.
- git status showed only intended documentation and .env.example modifications.

Suggested commit message:
Update ScaleX product prototype roadmap

Next:
- Goal 6 - Wire ScaleX to the isolated Hermes brain/orchestration install.

---

## 2026-06-19 - Goal 6: Isolated Hermes Agent skill-backed orchestration

Completed:
- Added isolated Hermes config support for CLI path, home, provider, model, timeout, real/test mode, output cap, skill name, skill source path, and toolsets.
- Added repo-owned Hermes skill source at `hermes/skills/scalex-operator/SKILL.md`.
- Wired product-mode planning to the real ScaleX-isolated Hermes Agent CLI.
- Constrained the Hermes planning invocation to `--toolsets skills` and `--skills scalex-operator`.
- Preserved deterministic planning only for automated tests and `HERMES_TEST_MODE=true`.
- Added strict JSON planning with one repair retry.
- Added SQLite `planning_runs` and `orchestration_calls` tables.
- Added repository helpers for planning runs and orchestration calls.
- Routed `POST /api/demo/run` through the Hermes-backed orchestration path.
- Recorded ordered orchestration calls for job creation, Hermes planning, Stripe-shaped records, revenue ledger, policy checks, spend ledger records, agent outputs, and report generation.
- Kept ScaleX code as the authority for policy, payment-shaped records, ledger writes, and reports.
- Added API state fields for `planning_runs`, `planning_run`, `orchestration_calls`, and `hermes`.
- Added frontend Hermes Brain / Orchestration panel showing real-Hermes status, provider/model, skill/tool context, planning result, proposed sequence, ordered tool calls, and error state.
- Added backend tests for Hermes command construction, test-mode fallback, planning/orchestration persistence, demo-run completion, unchanged economics, and policy independence from Hermes output.
- Updated README, docs, STATUS.md, TASKS.md, DECISIONS.md, and CHANGELOG.md.

Verified:
- Inspected isolated Hermes `tools --help`, `skills --help`, `profile --help`, root `--help`, and `-z --help` behavior.
- Inspected `hermes tools list --platform cli`; ScaleX uses `--toolsets skills` to avoid broad default CLI toolsets for the planning call.
- Synced `scalex-operator` into `/home/ascabrya/.scalex-hermes/home/skills/scalex-operator`.
- Ran product path with `HERMES_TEST_MODE=false` and `HERMES_REQUIRE_REAL=true`.
- `POST /api/demo/run` completed through real Hermes and returned `used_real_hermes=true`, `provider=openai-codex`, `model=gpt-5.5`, `skill_name=scalex-operator`, and `toolsets_used=["skills"]`.
- Product response included one real-Hermes `planning_run` and 17 ordered `orchestration_calls`.
- Headless Chrome verified the dashboard at `http://127.0.0.1:5174` rendered real Hermes proof, skill/tool context, ordered call count, and unchanged final economics.
- `./scripts/test.sh` passed with 30 backend tests and a successful Vite production build.

Suggested commit message:
Wire isolated Hermes skill orchestration

Next:
- Goal 7 - Stripe Test Mode through the orchestration layer.

---

## 2026-06-19 - Goal 7: Real Stripe test-mode invoice flow

Completed:
- Corrected roadmap/docs so ScaleX product mode is real-integration-first.
- Documented that mock/fallback/test-double paths are for tests, CI, offline development, or explicit diagnostics only.
- Added the Verified Live Mode direction for future live-money capability.
- Added Stripe SDK dependency.
- Installed updated backend requirements into the repo-local venv for verification; Stripe SDK import reports version `15.2.1`.
- Added Stripe Goal 7 config, plus future Verified Live Mode placeholders without implementing live-money execution.
- Removed the legacy `STRIPE_MOCK_MODE` backend setting so `STRIPE_TEST_DOUBLE_MODE` is the only test-double switch.
- Expanded `stripe_events` for real Stripe test objects, including mode, `livemode`, raw sanitized object JSON, customer ID, invoice ID, hosted invoice URL, invoice status, paid state, and idempotency key.
- Implemented the invoice-first Stripe test-mode path:
  - create customer
  - create invoice item
  - create invoice
  - finalize invoice
  - record hosted invoice URL and honest payment status
- Kept Stripe test-double mode available only through `STRIPE_TEST_DOUBLE_MODE=true`.
- Routed Stripe work through orchestration calls:
  - `stripe.create_customer`
  - `stripe.create_invoice`
  - `stripe.prepare_payment_url`
  - `stripe.confirm_payment_status`
- Added visible `stripe_failed` handling for missing or failed product-mode Stripe configuration.
- Adjusted invoice finalization to use the installed Stripe SDK's public invoice instance method.
- Updated API state and frontend Stripe panel to show Stripe mode, `used_real_stripe`, `livemode`, customer ID, invoice ID, hosted invoice URL, invoice status, paid state, and error/diagnostic reason.
- Added backend tests for Stripe setting guards, live-key rejection, live-mode rejection, malformed-key rejection, `livemode=false` assertion, idempotency keys, sanitized Stripe errors, successful invoice flow, paid invoice status, product-mode no-test-double behavior, and unchanged economics.
- Updated README, ROADMAP, AGENTS, START_HERE, STATUS, TASKS, DECISIONS, docs, and `.env.example`.

Verified:
- `./scripts/test.sh` passed with 39 backend tests and a successful Vite production build.
- Product-mode Stripe misconfiguration probe returned `status=stripe_failed`, job status `stripe_error`, zero Stripe events, failed call `stripe.create_customer`, and visible missing-key error.
- `import stripe` succeeded in the repo-local backend venv with Stripe SDK `15.2.1`.
- Real full product-path verification passed with real isolated Hermes and real Stripe test mode.
- Hermes proof: `used_real_hermes=True`, `provider=openai-codex`, `model=gpt-5.5`, `skill=scalex-operator`.
- Stripe proof: `used_real_stripe=True`, `stripe_mode=stripe_test`, `livemode=False`, real `cus_` customer ID, real `in_` invoice ID, `hosted_invoice_url_present=True`, `hosted_invoice_url_host=invoice.stripe.com`, `invoice_status=open`, and `paid=False`.
- Payment status is honest: the Stripe test invoice is open and unpaid, revenue/profit remains the compressed-run business result, and ScaleX must not claim Stripe-paid invoice unless Stripe reports `paid=True`.
- Final economics stayed unchanged: `gross_profit_cents=101300` and `actual_margin_percent=84.4`.
- `git diff --check` passed with no output.
- Required live-key grep returned no matches.

Suggested commit message:
Add Stripe test-mode invoice flow

Next:
- Goal 8 - NemoClaw / policy safety integration and presentation, with Verified Live Mode kept as a later production-hardening milestone.
