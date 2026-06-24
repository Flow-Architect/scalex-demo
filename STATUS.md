# STATUS - ScaleX

Last updated: 2026-06-24

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Latest committed baseline before this goal: `2f77fff Plan Goal 8 governed autonomy guardrails`.
- Last completed implementation/QA goal in this working tree: Goal 7.10 - Product Functionality Readiness / Browser Demo Gate.
- Last completed documentation/audit goal in this working tree: Goal 7.9A - UX Blueprint / Product IA Audit.
- Current planned goal: Goal 8 - Governed Autonomy Layer with NVIDIA NeMo Guardrails.
- Current next task: Goal 8A - NeMo Guardrails Preflight / Architecture Audit.
- ScaleX is now a functional browser-usable product prototype for turning repeatable enterprise functions into autonomous, governed workflows.
- The main Workflow page now centers on a connected enterprise workflow canvas with a right selected-node inspector before Goal 8.
- The Workflow canvas now behaves like a workflow workspace rather than a static diagram:
  - fixed command-center background
  - repositionable workflow nodes
  - live connector redraw as nodes move
  - selected-node inspection without leaving the page
- Product mode is real-integration-first:
  - real isolated Hermes Agent for planning/orchestration proposals
  - real Stripe test-mode API calls for Goal 7 payment/invoice records
  - SQLite as the audit ledger
  - local policy engine until Goal 8 safely wires NVIDIA NeMo Guardrails or a NeMo-compatible adapter
- Mock/fallback/test-double paths are for automated tests, CI, offline development, or explicitly labeled diagnostics only.
- Product-mode real integration failures surface visible error states instead of silently falling back.
- The frontend now opens as a product shell with local prototype auth, a Dashboard landing view, separate Onboarding and Customers sections, selected-workflow run controls, connected Workflow canvas, right selected-node inspector, run history, audit, distinct Integrations and Settings views, and a shared shell-level command bar.
- Goal 7.9E is now complete:
  - Dashboard is back as the landing surface after login and after workflow selection/save.
  - Onboarding is now its own routed section instead of being embedded inside Customers.
  - Customers is a darker product-style workflow manager with clearer active workflow proof and Harbor sample ergonomics.
  - Runs is a persistent run-history view with a selected-run summary, execution feed, and report proof.
  - Audit is organized around timeline, execution feed, ledger, Stripe evidence, and policy evidence.
  - Integrations and Settings now match the command-center product styling and keep Hermes, Stripe, SQLite, local policy, and safety-boundary facts visible.
  - Logout is now visible both in the sidebar footer and the top command bar.
  - Local-only CORS now accepts localhost and `127.0.0.1` on alternate ports so auth-enabled QA instances can be verified without editing origin lists.
  - Headless browser QA verified login, Dashboard, Onboarding, Harbor sample save, Customers, Workflow, Start Run, Hermes inspector, Stripe inspector, Blocked Spend inspector, Profit Report inspector, Runs, Audit, Integrations, Settings, and logout on a temp-port auth-enabled instance.
- Goal 7.10 is complete as the product functionality/browser demo gate before Goal 8A.
- Goal 8A is next as a read-only preflight before any governed-autonomy implementation.
- Current guardrail reality:
  - local policy is active now
  - real NVIDIA NeMo Guardrails is not wired yet
  - no real NeMo/NemoClaw claim should be made yet
  - Goal 8 target is governed autonomy with NeMo-style input, planning/dialog, execution, and output rails

## Verified on 2026-06-24 for Goal 7.10

- Goal 7.10 was a functionality QA and product-readiness pass, not a redesign and not a Goal 8 implementation.
- Small UI copy fixes aligned the Workflow, Policy inspector, Dashboard, Integrations, and Settings views with the current Goal 8 wording:
  - local policy active now
  - NeMo Guardrails planned/not wired yet
  - no real NeMo/NemoClaw claim
- Auth verification passed:
  - login screen appeared
  - wrong login returned 401 and showed the browser error state
  - correct login returned 200 and loaded Dashboard
  - logout returned to the login screen
  - protected `/api/demo/state` returned 401 after logout
- Workflow/customer verification passed:
  - Harbor Fleet Services can be selected
  - a synthetic Summit Pool Services workflow can be created
  - selected workflow state persists through API state
  - a synthetic workflow run used its selected $1,800 invoice seed
  - workflow selection and deletion endpoints returned 200
- Run execution verification passed in safe QA mode:
  - temp database: `/tmp/scalex-goal710-browser.db`
  - backend/frontend: `127.0.0.1:8790` / `127.0.0.1:5177`
  - `SCALEX_AUTH_ENABLED=true`
  - `HERMES_TEST_MODE=true`
  - `HERMES_REQUIRE_REAL=false`
  - `STRIPE_TEST_DOUBLE_MODE=true`
  - no Stripe API calls or Hermes model calls were made
- Browser-only flow passed in headless Chrome DevTools Protocol in about 3 seconds:
  - login
  - Dashboard
  - Onboarding
  - Customers
  - Workflow
  - Start Run
  - connected canvas with 10 nodes
  - Hermes inspector
  - Stripe inspector
  - Blocked Spend inspector
  - Profit Report inspector
  - Runs
  - Audit
  - Integrations
  - Settings
  - logout
- Real proof surfaces remained accessible in the product shell:
  - Hermes proof surface
  - Stripe proof surface
  - Stripe open/unpaid honesty
  - local policy proof
  - SQLite audit proof
  - Profit Report proof
- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- `git status --short` showed only intended frontend copy and docs edits.
- It is safe to proceed to Goal 8A.

## Verified on 2026-06-23 for Goal 8 planning docs

- Goal 8 was reframed as the Governed Autonomy Layer with NVIDIA NeMo Guardrails.
- Goal 8 was split into Goal 8A through Goal 8E before implementation.
- Goal 8A - NeMo Guardrails Preflight / Architecture Audit is now the next recommended task.
- ROADMAP.md, TASKS.md, STATUS.md, CHANGELOG.md, README.md, START_HERE.md, AGENTS.md,
  DECISIONS.md, docs/ARCHITECTURE.md, docs/PRODUCT_SPEC.md, docs/DEMO_SCRIPT.md,
  docs/SUBMISSION_WRITEUP.md, and .env.example comments/placeholders were aligned.
- Local policy is documented as active now; real NeMo Guardrails is documented as planned/not wired.
- Goal 9 remains final polish/submission prep.
- Goal 7B remains future Verified Live Mode hardening.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- No code implementation, install, `.env` edit, SQLite `.db` edit, Stripe API call, or Hermes model call was made.

## Goal 6 state

- Goal 6 is complete.
- Product-mode Hermes uses the ScaleX-isolated Hermes install with:
  - provider: `openai-codex`
  - model: `gpt-5.5`
  - skill: `scalex-operator`
  - toolsets: `skills`
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for Stripe actions, policy checks, ledger writes, agent outputs, and reports.

## Goal 7 state

- Goal 7 is complete for real Stripe test-mode invoice creation/finalization.
- Product mode now proves real isolated Hermes plus real Stripe test-mode invoice flow.
- Added Stripe SDK dependency in `backend/requirements.txt`.
- Installed the updated backend requirements into the repo-local venv for verification; `import stripe` succeeds with Stripe SDK `15.2.1`.
- Added Stripe config for:
  - `STRIPE_MODE=test`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_TEST_MODE=true`
  - `STRIPE_LIVE_MODE=false`
  - `STRIPE_TEST_DOUBLE_MODE=false`
  - `STRIPE_CURRENCY=usd`
  - `STRIPE_IDEMPOTENCY_PREFIX=scalex-demo`
  - deferred `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, and `STRIPE_WEBHOOK_SECRET`
- Added future Verified Live Mode placeholders only:
  - `STRIPE_LIVE_MONEY_ENABLED=false`
  - `STRIPE_LIVE_REQUIRE_VERIFIED=true`
  - `SCALEX_LIVE_MAX_AMOUNT_CENTS=0`
  - `SCALEX_LIVE_ALLOWED_CUSTOMER_EMAILS=`
  - `SCALEX_LIVE_CONFIRMATION_PHRASE=LIVE_MONEY_APPROVED`
- Expanded `stripe_events` to store real Stripe test object details:
  - `provider_mode`
  - `livemode`
  - `raw_object_json`
  - `currency`
  - `customer_id`
  - `invoice_id`
  - `payment_link_id`
  - `payment_link_url`
  - `hosted_invoice_url`
  - `checkout_session_id`
  - `payment_intent_id`
  - `idempotency_key`
  - `diagnostic_reason`
  - `invoice_status`
  - `paid`
- Product-mode Stripe path now:
  - rejects missing `STRIPE_SECRET_KEY`
  - rejects live mode
  - rejects future live-money mode
  - rejects live Stripe keys
  - rejects non-`sk_test_` keys for Goal 7
  - creates a Stripe test customer
  - creates a Stripe test invoice item
  - creates and finalizes a Stripe test invoice
  - stores hosted invoice URL, invoice status, paid state, idempotency keys, and sanitized raw objects
  - asserts returned Stripe objects have `livemode=false`
- Stripe test-double mode remains available only when `STRIPE_TEST_DOUBLE_MODE=true`.
- Demo orchestration records Stripe steps as:
  - `stripe.create_customer`
  - `stripe.create_invoice`
  - `stripe.prepare_payment_url`
  - `stripe.confirm_payment_status`
- If Stripe product mode is not configured or Stripe fails, `POST /api/demo/run` returns `status=stripe_failed`, sets the job to `stripe_error`, records the failed orchestration call, and exposes the sanitized error in API state.
- Payment status is honest:
  - Stripe-paid invoices can record Stripe-paid revenue.
  - Open/unpaid finalized invoices are shown as unpaid.
  - The compressed run may continue economics only as an explicitly labeled local test confirmation, not as a Stripe-paid invoice.
- API state now includes a `stripe` summary with mode, `used_real_stripe`, `livemode`, customer ID, invoice ID, hosted invoice URL, invoice status, paid state, and visible error/diagnostic reason.
- Frontend Stripe panel now shows real Stripe test mode vs test-double mode, object IDs, hosted invoice URL, `livemode=false`, invoice status, paid state, and error state.

## Goal 7.5 state

- Goal 7.5 is complete for frontend product-demo presentation polish.
- Replaced the narrow centered card layout with a full-width ScaleX Command Center control room.
- First viewport now emphasizes:
  - Live AI Business Operator positioning
  - active client and run status
  - Hermes, Stripe, SQLite ledger, and policy badges
  - $1,200 invoice to $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and 84.4% margin
  - live run pipeline from intake to profit report
- Added a visual pipeline with actual state-backed stages for:
  - Intake
  - Hermes Plan
  - Stripe Test Invoice
  - Payment Status
  - Policy Gate
  - Spend Approval
  - Agent Outputs
  - Profit Report
- Added staged frontend playback while `POST /api/demo/run` is in flight. The animation is presentation only; proof sections are populated from API state after the request returns.
- Upgraded Hermes presentation to show:
  - `used_real_hermes`
  - provider/model
  - skill/toolsets
  - operating plan summary and phases
  - agent task list
  - proposed tool sequence
  - orchestration calls as a live execution feed
- Upgraded Stripe presentation to show:
  - `used_real_stripe`
  - `stripe_mode`
  - `livemode`
  - customer ID
  - invoice ID
  - hosted invoice URL
  - invoice status
  - paid state
  - visible Stripe integration error state
- The UI labels open/unpaid Stripe invoices honestly as "Stripe test invoice finalized and open - not marked paid."
- Added guardrail decisions showing Local Policy active, spend cap, payment-before-spend, margin floor, approved vendors, blocked vendors, and per-vendor spend decisions.
- Added Judge Proof section for Hermes Agent, Stripe, SQLite, Policy engine, and future NemoClaw Goal 8.
- No backend business logic was changed.

## Goal 7.6 state

- Goal 7.6 is complete for judge-ready command-center first viewport polish.
- Reworked the first viewport so the top of the app now states: "ScaleX ran a live AI business workflow."
- Added a larger Profit Protected hero section showing:
  - $1,200 Stripe test invoice outcome
  - $187 approved spend
  - $750 blocked unsafe spend
  - $1,013 protected gross profit
  - 84.4% protected margin
- Added a first-screen Live Stack Proof strip for:
  - Real Hermes when `used_real_hermes=true`
  - real Stripe test mode when `used_real_stripe=true`
  - Stripe `livemode=false`, `invoice_status=open`, and `paid=false`
  - SQLite audit ledger row count
  - active local Policy Guardrails
  - NemoClaw as Goal 8 next, not claimed as wired yet
- Replaced the small in-flight playback strip with staged execution replay cards for:
  - Intake received
  - Hermes planned
  - Stripe invoice created
  - Policy checked spend
  - Unsafe spend blocked
  - Agents produced work
  - Profit report generated
- Replay animation remains frontend-only presentation while `POST /api/demo/run` is in flight, then settles onto API-backed state after the response.
- Added a visible run-completed moment after successful demo completion.
- Preserved existing lower proof sections for Hermes proof, Stripe proof, hosted invoice URL, invoice status, paid state, policy decisions, orchestration feed, agent outputs, SQLite ledger, and profit report.
- No backend business logic was changed.

## Goal 7.7 state

- Goal 7.7 is complete for product-shell UX before Goal 8.
- Added local prototype auth:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
  - HMAC-signed HTTP-only local session cookie
  - `/api/demo/*` endpoints protected when `SCALEX_AUTH_ENABLED=true`
  - tests keep auth disabled or test-configured and do not require real credentials
- `.env.example` now includes placeholders only:
  - `SCALEX_AUTH_ENABLED=true`
  - `SCALEX_DEMO_USERNAME=`
  - `SCALEX_DEMO_PASSWORD=`
  - `SCALEX_SESSION_SECRET=`
- The login gate is local prototype auth, not production enterprise auth.
- Added local/sample workflow onboarding:
  - customer/business name
  - business type
  - job/campaign name
  - job goal
  - invoice amount
  - spend cap
  - margin floor
  - optional approved vendors
  - optional blocked vendors
- Onboarding can load the Harbor Fleet Services sample or prepare a synthetic local sample workflow.
- Onboarding state is persisted in SQLite through `onboarding_configs` and the active job row; it is not full multi-tenant SaaS.
- `POST /api/demo/onboarding` seeds the active local job without running Stripe or Hermes.
- `POST /api/demo/run` preserves the active onboarded seed config across the reset that starts a compressed run.
- Added a product app shell with left navigation:
  - Dashboard / Workflow
  - Customers
  - Runs
  - Audit
  - Settings / Integrations
- Added a moving Autonomous Workflow Map for:
  - Customer Intake
  - Hermes Brain
  - Stripe Test Invoice
  - Payment Status
  - Policy Guardrail
  - Spend Decision
  - Agent Work
  - SQLite Audit Ledger
  - Profit Report
- The workflow map animates while `POST /api/demo/run` is in flight and settles on API-backed state after completion.
- Approved spend is shown as a proceed branch; blocked unsafe spend is shown as a blocked branch.
- Existing proof remains visible:
  - `used_real_hermes`
  - provider/model
  - `scalex-operator` skill and `skills` toolset
  - `used_real_stripe`
  - `stripe_mode`
  - `livemode=false`
  - customer ID
  - invoice ID
  - hosted invoice URL
  - `invoice_status=open`
  - `paid=false`
  - SQLite audit rows
  - local policy decisions
  - final economics
- NemoClaw remains labeled as Goal 8 next and not claimed as real.
- No live-money Stripe support was added.

## Goal 7.8 state

- Goal 7.8 is complete in this working tree for making ScaleX usable from the browser as a product workflow.
- Customer/workflow management is now functional:
  - users can create local synthetic/sample workflows from Customers
  - users can load the Harbor Fleet Services sample
  - users can select saved workflows
  - users can delete saved local workflows
  - workflows persist in SQLite in the `workflows` table
  - active workflow state remains visible after browser refresh through `GET /api/demo/state`
- The active workflow drives runs:
  - `POST /api/demo/run` uses the selected workflow config
  - custom customer name, job name, invoice amount, spend cap, margin floor, approved vendors, and blocked vendors flow into the run seed config
  - Stripe test/test-double invoice amount is created from the selected workflow invoice amount
  - local policy and profit math use the selected workflow economics
  - Harbor Fleet Services still produces the locked sample economics: $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and 84.4% margin
- Run history is now persistent:
  - each run creates a unique `jobs` row
  - run-scoped events, planning runs, orchestration calls, Stripe events, ledger entries, policy checks, agent outputs, and reports persist without overwriting previous runs
  - `GET /api/demo/state?run_id=...` returns proof details for a selected historical run
  - Runs tab lists persisted runs and can load prior run details
- Workflow graph nodes are clickable:
  - Hermes node opens provider/model/skill/plan/orchestration proof
  - Stripe and Payment nodes open customer ID, invoice ID, hosted invoice URL, `livemode`, invoice status, paid state, and diagnostic proof
  - Policy and Spend nodes show rules, reasons, approved spend branch, and blocked unsafe spend branch
  - Agent node shows deterministic deliverables
  - SQLite Audit node shows ledger proof
  - Report node shows final profit report and economics
- Product tabs are functional enough for recording:
  - Workflow: graph, run controls, active workflow, proof panels
  - Customers: create/select/delete workflows and load Harbor sample
  - Runs: persisted run list and selected run summary/proof
  - Audit: ledger, timeline, orchestration feed, Stripe proof, policy decisions
  - Settings / Integrations: auth, Hermes, Stripe mode, SQLite path/counts, local policy engine, and NeMo Guardrails planned/not wired yet
- Integration honesty is preserved:
  - real Hermes proof remains `used_real_hermes=true` when configured
  - real Stripe test-mode proof remains `used_real_stripe=true`, `stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` when configured
  - Stripe test-double remains for tests/CI/explicit diagnostics only
  - the UI does not claim Stripe invoices are paid unless Stripe reports `paid=true`
  - real NeMo Guardrails/NemoClaw is still not wired yet
  - no live-money support was added

## Goal 7.9 state

- Goal 7.9 is the Workflow Canvas Product UX Redesign before Goal 8.
- Goal 7.9 is named: Workflow Canvas Product UX Redesign.
- Goal 7.9A is complete as a read-only UX blueprint and Product IA audit.
- Goal 7.9B is complete for app shell extraction, navigation cleanup, shared selector helpers, and a distinct Settings view.
- Goal 7.9C is complete for the main Workflow page redesign: connected workflow canvas, selected-node inspector, compact node proof, and duplicate Workflow proof-panel cleanup.
- Goal 7.9D is complete for Customers, Runs, Audit, Integrations, and Settings cleanup.
- Goal 7.9E is complete for recording readiness, browser-only QA, Dashboard/Onboarding alignment, and logout visibility.
- Goal 7.9A audited the current UI, duplicate proof panels, clutter, weak hierarchy, and recording-flow gaps.
- Goal 7.9A output implementation prompts for:
  - Goal 7.9B - Design System + App Shell Foundation
  - Goal 7.9C - Workflow Canvas + Selected-Node Inspector
  - Goal 7.9D - Customers / Runs / Audit / Integrations Cleanup
  - Goal 7.9E - Recording Readiness / Browser-Only Demo QA
- Goal 7.9B cleaned the dark command-center visual foundation before moving nodes around.
- Goal 7.9C made the Workflow page the product center with a connected canvas and right inspector.
- Goal 7.9D made Customers, Runs, Audit, Integrations, and Settings real product views with no placeholder-only tabs.
- Goal 7.9E verified a browser-only recording path: login, select/create workflow, start run, watch graph progress, inspect Hermes, Stripe, blocked spend, and Profit Report nodes, open Runs, Audit, Integrations, Settings, and logout.
- Goal 7.9 must preserve all current proof boundaries:
  - real isolated Hermes is wired
  - real Stripe test mode is wired
  - SQLite is the audit ledger
  - local policy is active now
  - real NeMo Guardrails/NemoClaw is not wired yet
  - Verified Live Mode is future live-money hardening
  - auth is local prototype auth
  - Stripe invoices are not paid unless Stripe returns `paid=true`

## Goal 7.9B state

- Goal 7.9B is complete in this working tree for the design system and app shell foundation.
- `App.tsx` remains the top-level owner for session state, API loading, active view state, primary handlers, and high-level routing.
- App shell responsibilities moved out of `App.tsx`:
  - `frontend/src/layout/AppShell.tsx`
  - `frontend/src/layout/Sidebar.tsx`
  - `frontend/src/layout/TopCommandBar.tsx`
  - `frontend/src/layout/navigation.ts`
- Shared UI/style helpers were added:
  - `frontend/src/components/ui/StatusBadge.tsx`
  - `frontend/src/components/ui/statusStyles.ts`
- Shared state selectors/helpers moved to `frontend/src/lib/demoSelectors.ts`, including money snapshot, audit row count, run status labels, Stripe/Hermes status helpers, latest-record helpers, plan/task helpers, and optional formatting helpers.
- Navigation now has distinct entries for Workflow, Customers, Runs, Audit, Integrations, and Settings.
- Integrations now focuses on Hermes, Stripe test mode, SQLite, product records, local policy, and Goal 8 guardrails planned/not wired yet.
- Settings now separately shows prototype auth, local API/database state, active workflow/run records, SQLite path, no-live-money boundary, and guardrails planned/not-wired boundary.
- The current Workflow page content, workflow map, proof panels, run controls, and clickable node drawer were intentionally preserved for Goal 7.9C.
- Real Hermes proof fields, real Stripe test-mode proof fields, Stripe open/unpaid honesty, SQLite audit proof, local policy proof, local prototype auth, onboarding, Customers, Runs, and Audit behavior were preserved.

## Final Goal 7.7 verification pass

- `./scripts/test.sh` passed with 42 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- No `.env` file is staged.
- Auth was rechecked with `SCALEX_AUTH_ENABLED=true`:
  - unauthenticated protected demo endpoints returned 401
  - wrong login returned 401
  - configured local login returned 200
  - `/api/auth/me` and protected demo state stayed authenticated while the signed local session cookie was valid
  - logout returned 200 and protected demo state returned 401 afterward
- Demo credential values are read from environment variables by backend auth/config code.
- No demo password value is hardcoded in frontend source.
- No password storage table or column exists in `data/schema.sql`; passwords are not stored in SQLite.
- Protected local prototype endpoints include demo state, run, reset, seed, onboarding, mark-paid, spend-check, and state-changing job endpoints.
- Onboarding was rechecked with both:
  - Harbor Fleet Services sample workflow
  - a synthetic local Sample HVAC Co workflow
- The synthetic onboarding flow persisted into SQLite, and the next protected run used that selected synthetic customer/job, invoice amount, spend cap, and margin floor.
- Harbor Fleet Services was restored afterward and completed with the locked sample economics.
- Product shell source was audited for real tabs/views: Dashboard / Workflow, Customers, Runs, Audit, and Settings / Integrations.
- The Autonomous Workflow Map source was audited for connected requested nodes, approved/proceed branch, blocked branch, real-state settled statuses, Stripe open/unpaid honesty, Hermes-as-planner copy, and policy-as-enforcement copy.
- Final isolated headless Chrome rerender was blocked by a local crashpad sandbox error before page load; normal browser recording still needs a human browser check before final submission capture.
- The final API-backed Harbor run preserved:
  - `used_real_hermes=true`
  - `provider=openai-codex`
  - `model=gpt-5.5`
  - `skill=scalex-operator`
  - `used_real_stripe=true`
  - `stripe_mode=stripe_test`
  - `livemode=false`
  - real Stripe customer ID with `cus_` prefix
  - real Stripe invoice ID with `in_` prefix
  - hosted invoice URL present
  - `invoice_status=open`
  - `paid=false`
  - $1,200 revenue
  - $187 approved spend
  - $750 blocked unsafe spend
  - $1,013 gross profit
  - 84.4% margin

## Post-Goal 7.6 documentation audit state

- Documentation alignment after Goal 7.6 is complete in the working tree.
- Audited:
  - `AGENTS.md`
  - `ROADMAP.md`
  - `DECISIONS.md`
  - `STATUS.md`
  - `TASKS.md`
  - `CHANGELOG.md`
  - `START_HERE.md`
  - `README.md`
  - `docs/*.md`
  - `hermes/skills/scalex-operator/SKILL.md`
  - `agents/*.md`
  - `.env.example` comments
  - `frontend/src/App.tsx` copy/proof language for claim validation only
- Updated README, ROADMAP, docs, and `.env.example` comments so current docs agree that:
  - Goal 6, Goal 7, Goal 7.5, and Goal 7.6 are complete
  - Goal 8 is next
  - Goal 9 remains final submission prep
  - Goal 7B remains future Verified Live Mode hardening
  - Hermes is real isolated Hermes with the `scalex-operator` skill in product mode
  - Stripe is real test-mode invoice creation/finalization, honestly open/unpaid when `invoice_status=open` and `paid=false`
  - SQLite is the real audit ledger
  - local policy guardrails are currently active
  - NemoClaw is not claimed as real yet
- Historical changelog entries from earlier goals were left as history when they describe the state of that older goal.
- `DECISIONS.md` was reviewed and did not need a locked-decision change.
- No backend logic, data files, secrets, Stripe calls, Hermes model calls, or frontend layout/code changes were made for the audit.

## Locked economics

The locked sample workflow remains unchanged:

- revenue_cents: 120000
- approved_spend_cents: 18700
- blocked_spend_cents: 75000
- gross_profit_cents: 101300
- actual_margin_percent: 84.4
- policy_violations: 0

## Verified on 2026-06-19

- `./scripts/test.sh` passed with 39 backend tests and a successful Vite production build.
- Product-mode Stripe misconfiguration probe passed with:
  - `STRIPE_TEST_DOUBLE_MODE=false`
  - `STRIPE_LIVE_MODE=false`
  - no `STRIPE_SECRET_KEY` in the process environment
  - response `status=stripe_failed`
  - job status `stripe_error`
  - `used_real_stripe=false`
  - zero `stripe_events`
  - failed orchestration call `stripe.create_customer`
  - visible error: `STRIPE_SECRET_KEY is required for product-mode Stripe test integration.`
- No local `.env` file was present, and the shell environment did not expose `STRIPE_SECRET_KEY`.
- Stripe SDK import verification passed with installed version `15.2.1`.

## Verified on 2026-06-20

- Real full product-path verification passed with real isolated Hermes and real Stripe test mode.
- Hermes proof:
  - `used_real_hermes=True`
  - `provider=openai-codex`
  - `model=gpt-5.5`
  - `skill=scalex-operator`
- Stripe proof:
  - `used_real_stripe=True`
  - `stripe_mode=stripe_test`
  - `livemode=False`
  - real Stripe customer ID returned with `cus_` prefix
  - real Stripe invoice ID returned with `in_` prefix
  - `hosted_invoice_url_present=True`
  - `hosted_invoice_url_host=invoice.stripe.com`
  - `invoice_status=open`
  - `paid=False`
- Payment status remained honest:
  - the Stripe test invoice is open and unpaid
  - revenue/profit display remains the compressed-run business result
  - ScaleX must not claim a Stripe-paid invoice unless Stripe reports `paid=True`
- Final economics stayed unchanged:
  - `gross_profit_cents=101300`
  - `actual_margin_percent=84.4`

## Verified on 2026-06-21

- `npm run build` passed for the frontend after the command-center UI change.
- `./scripts/test.sh` passed with 39 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Tracked-file secret scan for live Stripe keys, long webhook secrets, and inline OpenAI API keys returned no matches.
- `./scripts/dev.sh` started FastAPI at `http://127.0.0.1:8787` and Vite at `http://127.0.0.1:5174` after local socket approval.
- Running the dev server with the ignored repo-local `.env` loaded exercised the real product path after one transient Hermes JSON-format failure on the first attempt.
- Real full product-path verification after Goal 7.5 UI changes passed with:
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
  - `gross_profit_cents=101300`
  - `actual_margin_percent=84.4`
- Headless Chrome loaded `http://127.0.0.1:5174` after the full run and rendered the new command-center UI.
- Browser-rendered UI showed:
  - ScaleX Command Center / Live AI Business Operator hero
  - live run pipeline
  - real Hermes proof from API state: `used_real_hermes=true`, `openai-codex`, `gpt-5.5`, `scalex-operator`
  - real Stripe test proof: `stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, `paid=false`
  - honest open/unpaid label for the Stripe invoice
  - local policy guardrails
  - blocked `Premium Automation Suite` spend
  - final economics: $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, 84.4% margin, and 0 policy violations
  - Judge Proof stack section
- A separate product-mode run without `STRIPE_SECRET_KEY` also rendered a visible Stripe integration error state, preserving the no-silent-fallback behavior.

## Verified on 2026-06-21 for Goal 7.6

- `npm run build` passed for the frontend after the Goal 7.6 UI changes.
- `./scripts/test.sh` passed with 39 backend tests and a successful Vite production build.
- `git diff --check` passed.
- Tracked-file secret scan for live Stripe keys, long webhook secrets, and inline OpenAI project keys returned no matches.
- No `.env` file was staged, and no `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- `./scripts/dev.sh` started FastAPI at `http://127.0.0.1:8787` and Vite at `http://127.0.0.1:5174`.
- A product-mode run without loading the ignored local `.env` showed the visible Stripe integration error state for missing `STRIPE_SECRET_KEY`.
- Running the dev server with the ignored local `.env` loaded completed the real product path with:
  - `status=completed`
  - `used_real_hermes=true`
  - `provider=openai-codex`
  - `model=gpt-5.5`
  - `skill=scalex-operator`
  - `used_real_stripe=true`
  - `stripe_mode=stripe_test`
  - `livemode=false`
  - real Stripe customer ID returned with `cus_` prefix
  - real Stripe invoice ID returned with `in_` prefix
  - hosted invoice URL on `invoice.stripe.com`
  - `invoice_status=open`
  - `paid=false`
  - `gross_profit_cents=101300`
  - `actual_margin_percent=84.4`
- Headless Chrome loaded `http://127.0.0.1:5174` after the full run and rendered the upgraded first viewport, Profit Protected hero, Live Stack Proof strip, run-completed replay cards, real Hermes proof, real Stripe test proof, open/unpaid Stripe honesty, blocked unsafe spend, final economics, and NemoClaw Goal 8 next label.
- Chrome screenshot capture was not completed because screenshot mode hit a local crashpad sandbox error, but the headless DOM render succeeded.

## Verified on 2026-06-21 for post-Goal 7.6 docs audit

- `git diff --check` passed.
- Tracked-file secret scan for live Stripe keys, long Stripe test keys, and Stripe webhook secrets returned no matches.
- `git status --short` showed intended working-tree edits only.
- No network calls, Stripe API calls, Hermes model calls, backend logic changes, or database writes were performed for this audit.

## Verified on 2026-06-21 for Goal 7.7

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

## Verified on 2026-06-21 for Goal 7.8

- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- Tests now cover selected-workflow-driven runs, custom workflow invoice amount propagation, run history persistence, historical run inspection, protected HTTP endpoints with auth enabled, and unchanged Harbor sample economics.
- Backend compile check passed with `backend/.venv/bin/python -m compileall backend/app`.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- No `.env` file is staged.
- Custom Sample HVAC Co workflow verification in tests produced:
  - `client_name=Sample HVAC Co`
  - `invoice_amount_cents=200000`
  - Stripe test-double invoice/payment events at `amount_cents=200000`
  - `revenue_cents=200000`
  - `approved_spend_cents=18700`
  - `gross_profit_cents=181300`
  - `actual_margin_percent=90.6`
- Repeated Harbor runs now persist as two unique `jobs` rows while each selected run still exposes its own ledger, policy, Stripe, Hermes, agent, and report details.
- `GET /api/demo/state?run_id=...` was verified in tests for historical run inspection.
- `./scripts/dev.sh` started successfully:
  - backend: `http://127.0.0.1:8787`
  - frontend: `http://127.0.0.1:5174`
- Local browser-facing API verification with prototype auth confirmed:
  - unauthenticated demo state returned 401
  - login returned 200
  - custom Summit Pool Services workflow save returned 200 and persisted as active workflow
  - selected workflow run completed with a unique run record
  - selected custom invoice amount drove the job and Stripe invoice amount at `invoice_amount_cents=180000`
  - historical run inspection by `run_id` returned 200
  - the frontend loaded at `http://127.0.0.1:5174`
  - logout returned 200
  - protected demo state returned 401 after logout
- Product-mode Summit Pool Services run completed with real Hermes and real Stripe test mode:
  - `used_real_hermes=true`
  - `provider=openai-codex`
  - `model=gpt-5.5`
  - `used_real_stripe=true`
  - `stripe_mode=stripe_test`
  - `livemode=false`
  - real Stripe invoice ID prefix `in_`
  - `invoice_status=open`
  - `paid=false`
  - custom economics: $1,800 revenue, $187 approved spend, $1,613 gross profit, and 89.6% margin
- Product-mode Harbor Fleet Services run completed with real Hermes and real Stripe test mode:
  - `used_real_stripe=true`
  - `stripe_mode=stripe_test`
  - `livemode=false`
  - `invoice_status=open`
  - `paid=false`
  - blocked `Premium Automation Suite` at $750
  - Harbor economics unchanged at $1,200 revenue, $187 approved spend, $750 blocked spend, $1,013 gross profit, and 84.4% margin

## Verified on 2026-06-22 for Goal 7.9 planning docs

- Goal 7.9A through Goal 7.9E were added to roadmap/tracking docs as planned UX work.
- Goal 7.9A is the next active task.
- Goal 8 remains after Goal 7.9 and is now planned as the Governed Autonomy Layer with NVIDIA NeMo Guardrails.
- Goal 9 remains final polish and submission prep.
- Goal 7B remains future Verified Live Mode hardening.
- `git diff --check` passed.
- Value-shaped tracked-file secret scan returned no matches.
- No `CODEX_GOALS.md` or `GOAL_LOG.md` file exists.
- `git status --short` showed documentation-only edits.
- No code, `.env`, SQLite `.db`, Stripe API, or Hermes model changes were made.

## Verified on 2026-06-23 for Goal 7.9B

- `npm run build` passed for the frontend after the shell extraction and Settings split.
- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- Sanitized dev-server verification used temp SQLite DBs under `/tmp`, `HERMES_TEST_MODE=true`, `STRIPE_TEST_DOUBLE_MODE=true`, and an unset `STRIPE_SECRET_KEY`.
- Headless Chrome rendered the app shell and a Chrome DevTools Protocol nav check confirmed Workflow, Customers, Runs, Audit, Integrations, and Settings all reached their expected view content.
- The selected Harbor workflow run completed in sanitized test-double mode with $1,200 revenue, $187 approved spend, $750 blocked spend, $1,013 gross profit, 84.4% margin, 1 persisted run, and 45 audit rows.
- `SCALEX_AUTH_ENABLED=true` with explicit test-only credentials verified unauthenticated protected state returned 401, login returned authenticated, `/api/auth/me` and protected state returned 200, logout returned 200, and protected state returned 401 afterward.
- `git diff --check` passed.
- The tracked-file secret scan returned no matches.
- No `.env`, SQLite `.db`, `CODEX_GOALS.md`, or `GOAL_LOG.md` file is staged or present as a new tracked artifact.
- App shell extraction preserved the current Workflow page and did not implement the connected Goal 7.9C canvas yet.
- Integrations and Settings now have distinct navigation targets and real state-backed content.
- No Stripe API calls or Hermes model calls were intentionally run for this goal.

## Verified on 2026-06-23 for Goal 7.9C

- Goal 7.9C replaced the Workflow page's old hero, replay row, proof columns, agent wall, judge proof, ledger table, and full timeline stack with a connected enterprise workflow canvas and right selected-node inspector.
- New Workflow feature files were added under `frontend/src/features/workflow/`:
  - `WorkflowPage.tsx`
  - `workflowModel.ts`
  - `WorkflowCanvas.tsx`
  - `WorkflowNode.tsx`
  - `NodeInspector.tsx`
  - focused inspector components for Run Summary, Customer Intake, Hermes, Stripe, Payment Status, Policy, Spend, Agent Work, SQLite Audit, and Profit Report
- The canvas now shows Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report as compact connected nodes.
- Approved Spend and Blocked Spend are separate visible policy branches, with approved connectors in green and blocked connectors in red.
- Node status logic is derived from current API state:
  - workflow/job presence for Customer Intake
  - Hermes metadata and planning run status/error for Hermes Brain
  - Stripe summary, invoice ID, invoice status, paid state, livemode, and error for Stripe/Payment nodes
  - policy summary and policy check counts for Policy Gate
  - approved/blocked policy checks and ledger rows for spend nodes
  - agent output count for Agent Work
  - SQLite state and record counts for SQLite Audit
  - report presence and report economics for Profit Report
- While a run is in progress, frontend progress highlights the active node, then the canvas settles back to API-backed state after the response returns.
- The inspector defaults to Run Summary and switches on node click.
- Inspector proof remains accessible for Hermes, Stripe test invoice, payment status, local policy, approved/blocked spend, agent outputs, SQLite counts, and final profit report.
- Stripe open/unpaid honesty is preserved: the Payment inspector does not claim Stripe-paid revenue unless `paid=true`, and labels local compressed-run confirmation separately.
- NeMo Guardrails remains labeled as planned/not wired yet; the active policy engine is still local.
- `App.tsx` now delegates the Workflow route to `WorkflowPage` and passes active workflow, run status, selected node state, progress state, errors/notices, loading state, and run/reset/refresh/customer navigation handlers.
- Customers, Runs, Audit, Integrations, and Settings remain reachable and are intentionally left for Goal 7.9D cleanup.
- `npm run build` passed for the frontend after the Workflow feature extraction.
- `./scripts/test.sh` passed with 48 backend tests and a successful Vite production build.
- Sanitized dev-server verification used `/tmp/scalex-goal79c-manual.db`, `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, `STRIPE_TEST_DOUBLE_MODE=true`, and an unset `STRIPE_SECRET_KEY`.
- Headless Chrome desktop verification completed the browser flow: login, Customers, Harbor sample selection, Workflow, Start Run, connected canvas verification, Hermes inspector, Stripe inspector, Blocked Spend inspector, Profit Report inspector, Customers/Runs/Audit/Integrations/Settings navigation, and logout.
- Manual browser verification confirmed the inspector sits to the right of the canvas at a 1600px desktop viewport and that the canvas exposes all ten required nodes plus approved/blocked branch labels.
- Manual browser verification used diagnostic test-double modes, so it did not call Stripe APIs or Hermes models.
- No backend business logic was changed.
- No Stripe API calls or Hermes model calls were intentionally run for this goal.

## Not yet verified

- Fresh-clone setup on a clean machine.
- Manual recorded browser walkthrough.
- Screenshot/video capture quality for final submission.

## Not yet built

- Goal 8A read-only NeMo Guardrails preflight / architecture audit.
- NVIDIA NeMo Guardrails or NeMo-compatible guardrail adapter.
- Verified Live Mode live-money execution.
- Demo recording and final submission assets.

## Deferred / revisit

- Local policy engine remains the spend authority until Goal 8 safely wires a verified NeMo Guardrails or NeMo-compatible adapter.
- Stripe webhooks are deferred.
- Checkout Session and Payment Link flows are deferred; Goal 7 uses invoice-first Stripe test mode.
- Live-money payments are deferred to Verified Live Mode and are not implemented in Goal 7.
- Production Hermes, Windows Hermes config, Prometheus production data, homelab/OpenClaw, Recall memory, public deployment, production data, and real customer workflows remain out of scope.
- npm install previously reported one low-severity advisory in the frontend dependency tree; dependency audit remediation remains deferred unless it affects demo safety or build reliability.

## Current priority

Goal 8A - NeMo Guardrails Preflight / Architecture Audit.
