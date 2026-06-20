# STATUS - ScaleX

Last updated: 2026-06-20

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Latest committed baseline before this goal: `76bb8e5 Wire isolated Hermes skill orchestration`.
- Last completed uncommitted implementation goal: Goal 7 - real Stripe test-mode invoice/payment flow through orchestration.
- ScaleX is a live working product-style prototype for profit-aware agent operations in service workflows.
- Product mode is real-integration-first:
  - real isolated Hermes Agent for planning/orchestration proposals
  - real Stripe test-mode API calls for Goal 7 payment/invoice records
  - SQLite as the audit ledger
  - local policy engine until Goal 8 wires a real NemoClaw/NemoClaw-style safety adapter if safely available
- Mock/fallback/test-double paths are for automated tests, CI, offline development, or explicitly labeled diagnostics only.
- Product-mode real integration failures surface visible error states instead of silently falling back.

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

## Not yet verified

- Fresh-clone setup on a clean machine.
- Manual recorded browser walkthrough.
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
