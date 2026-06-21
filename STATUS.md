# STATUS - ScaleX

Last updated: 2026-06-21

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Latest committed baseline before this goal: `12e7705 Polish ScaleX command center and align docs`.
- Last completed implementation goal: Goal 7.7 - product shell, local auth gate, onboarding flow, and live workflow visualization before Goal 8.
- Last completed documentation/audit goal in this working tree: final Goal 7.7 functional verification and product-doc alignment.
- ScaleX is a live working product-style prototype for profit-aware agent operations in service workflows.
- Product mode is real-integration-first:
  - real isolated Hermes Agent for planning/orchestration proposals
  - real Stripe test-mode API calls for Goal 7 payment/invoice records
  - SQLite as the audit ledger
  - local policy engine until Goal 8 wires a real NemoClaw/NemoClaw-style safety adapter if safely available
- Mock/fallback/test-double paths are for automated tests, CI, offline development, or explicitly labeled diagnostics only.
- Product-mode real integration failures surface visible error states instead of silently falling back.
- The frontend now opens as a product shell with local prototype auth, local/sample onboarding, navigation, workflow visualization, run history, audit, and integrations views.

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

## Not yet verified

- Fresh-clone setup on a clean machine.
- Manual recorded browser walkthrough.
- Normal-browser post-login walkthrough after the final docs pass; headless Chrome rerender is blocked locally by crashpad sandbox permissions.
- Screenshot/video capture quality for final submission.

## Not yet built

- NemoClaw or external policy safety adapter.
- Verified Live Mode live-money execution.
- Demo recording and final submission assets.

## Deferred / revisit

- Local policy engine remains the spend authority until Goal 8.
- Stripe webhooks are deferred.
- Checkout Session and Payment Link flows are deferred; Goal 7 uses invoice-first Stripe test mode.
- Live-money payments are deferred to Verified Live Mode and are not implemented in Goal 7.
- Production Hermes, Windows Hermes config, Prometheus production data, homelab/OpenClaw, Recall memory, public deployment, production data, and real customer workflows remain out of scope.
- npm install previously reported one low-severity advisory in the frontend dependency tree; dependency audit remediation remains deferred unless it affects demo safety or build reliability.

## Current priority

Goal 8 - NemoClaw / policy safety integration and presentation.
