# STATUS - ScaleX ClientOps Autopilot

Last updated: 2026-06-24

## Verified Current State

- Project folder exists at `/home/ascabrya/dev/scalex-demo`.
- Latest committed baseline before Goal 7.11C follow-up: `882567f Replace Harbor with Northstar ClientOps launch`.
- Last completed goal: Goal 7.11C-followup - Replace Card Dashboard With ClientOps Product Workspace.
- Last completed implementation/QA goal: Goal 7.11C-followup - Replace Card Dashboard With ClientOps Product Workspace.
- Current priority: Goal 8A - NeMo Guardrails Preflight / Architecture Audit.
- Goal 7.11B replaced the legacy Harbor sample with Northstar Dental Group / Client Implementation Launch.
- Goal 7.11C-followup replaced the remaining generated dashboard/card shell with a ClientOps
  operation-file workspace across Dashboard, Function Studio, Onboarding, Customers, Runs,
  Audit, Integrations, and Settings.
- Goal 8A - NeMo Guardrails Preflight / Architecture Audit remains intact and planned after the 7.11B/7.11C positioning pass.
- Goal 9 remains final polish and submission assets.
- Goal 7B remains future Verified Live Mode hardening.

## Product Positioning

ScaleX is now documented as **ScaleX ClientOps Autopilot**, an **Enterprise Function Accelerator**
for revenue-backed client operations.

One-line pitch:

> ScaleX helps B2B teams turn repeatable client operations into autonomous, revenue-backed,
> policy-governed runs with finance proof, guardrail enforcement, and audit evidence.

Enterprise problem:

B2B teams struggle to turn signed client work into coordinated execution because onboarding,
billing, vendor spend, approvals, task routing, and reporting are fragmented. ScaleX gives them
a governed AI operations layer that can run those functions safely.

## Stack Truth

- Hermes plans and routes the client operation.
- Stripe provides finance proof through test invoice/payment state.
- ScaleX executes and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- NeMo Guardrails is planned after Goal 8 and is not wired yet.
- SQLite records evidence.
- Profit Outcome reports protected profit and blocked risk.

## Implemented Today

The code now implements the Client Implementation Launch template with the synthetic Northstar
Dental Group account.

- Client/account: Northstar Dental Group
- Template: Client Implementation Launch
- Industry label: Multi-location healthcare services group
- Implementation package revenue: $8,500
- Setup spend cap: $1,150
- Margin floor: 50%
- Approved setup spend: $350 Secure Workspace Pack, $500 Data Migration Sandbox, and $300 Launch Asset Kit
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Final profit outcome: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, and 86.5% protected margin
- Synthetic account only; no patient data, no PHI, no healthcare compliance claim, and no HIPAA
  support claim

Harbor Fleet Services is no longer the current implemented sample. It remains historical only in
older changelog entries.

Functional product surfaces remain:

- local FastAPI backend
- Vite React TypeScript frontend
- SQLite evidence ledger
- local prototype auth
- Dashboard, Onboarding, Customers, Studio, Runs, Audit, Integrations, and Settings
- connected Function Studio page with proof nodes and selected-node inspector
- isolated Hermes planning in product mode
- real Stripe test-mode invoice path when configured with `sk_test_...`
- deterministic test-double paths for tests/CI/diagnostics only
- local policy engine for current guardrail enforcement

## Verified For Goal 7.11C-followup

- Replaced the card-grid Dashboard architecture with a top-to-bottom ClientOps operation file for
  the Northstar Dental Group / Client Implementation Launch function.
- Added shared workspace primitives for operation pages, operation hero, outcome rail, operation
  timeline, template shelf, proof routes, empty workspace states, and plain tables.
- Replaced repeated bordered panel/card patterns with larger sections, table/list layouts,
  operation rows, timelines, drawers, and supporting workspace routes.
- Kept Dashboard business-first: hero operation brief, outcome rail, operating stack timeline,
  template shelf, and small supporting routes only.
- Removed Payment, Policy, SQLite, raw invoice IDs, database paths, and detailed counts from the
  first Dashboard screen; they now live in Audit, Integrations, Settings, or the Studio Evidence Drawer.
- Reworked Function Studio into a business workspace with operation brief, readable Function Map,
  Evidence Drawer, and client activity timeline.
- Reworked Onboarding into a Configure Client Implementation Launch operation setup document.
- Reworked Customers into Client Operation Files and Runs into Execution History with a clear
  no-execution empty state.
- Reworked Audit into Evidence Ledger, Integrations into Operating Stack, and Settings into
  Boundaries & Runtime.
- Preserved Northstar economics and truthfulness: synthetic account only, no patient data, no PHI,
  no HIPAA claim, local policy active now, NeMo planned/not wired, Stripe not paid unless `paid=true`,
  no live-money support, and no production auth claim.
- Did not touch `.env`, `data/*.db`, live Stripe, real Hermes production config, live-money paths,
  or Goal 8 implementation.

## Verified For Goal 7.11C Initial Pass

- Replaced the Dashboard card-grid console with a business landing page for one revenue-backed
  Northstar client operation.
- Added a hero operation brief for Northstar Dental Group / Client Implementation Launch with
  primary `Open Function Studio` and secondary `Review Evidence Ledger` CTAs.
- Added the business outcome strip: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
  risk, $7,350 protected gross profit, and 86.5% protected margin.
- Added the ClientOps operating stack: Hermes plans the operation, Stripe provides finance proof,
  guardrails review spend/risk, SQLite records evidence, and Profit Outcome reports the result.
- Added the function templates section with implemented Client Implementation Launch and planned
  Invoice-to-Cash, Vendor Spend Approval, Client Onboarding, Research-to-Report, Ops Handoff,
  and Renewal Recommendation templates.
- Moved payment, policy, SQLite, raw IDs, database paths, and detailed counts out of the first
  business screen and into supporting evidence routes.
- Preserved Stripe honesty: the Dashboard shows `paid=false` unless Stripe returns `paid=true`.
- Preserved guardrail truthfulness: no real NeMo Guardrails claim was added.
- Did not touch `.env`, `data/*.db`, live Stripe, real Hermes production config, or live-money paths.

## Template Model

Goal 7.11B implemented the previously selected template:

- Template: Client Implementation Launch
- Sample account: Northstar Dental Group
- Revenue: $8,500 implementation package
- Approved setup spend:
  - $350 Secure Workspace Pack
  - $500 Data Migration Sandbox
  - $300 Launch Asset Kit
  - $1,150 total approved setup spend
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Protected gross profit: $7,350
- Protected margin: 86.5%
- Margin floor: 50%

Future templates remain planned only: Invoice-to-Cash, Vendor Spend Approval, Client Onboarding,
Research-to-Report, Ops Handoff, and Renewal Recommendation.

## Verified For Goal 7.11B

- Replaced Harbor sample defaults, policy/sample data, UI copy, tests, Hermes skill text, and
  docs with Northstar Dental Group / Client Implementation Launch.
- Preserved guardrail truthfulness: local policy is active now; real NeMo Guardrails is planned
  and not wired yet.
- Preserved Stripe truthfulness: invoices must not be called paid unless Stripe returns `paid=true`.
- Preserved Goal 8A, Goal 9, and Goal 7B.
- Did not install dependencies.
- Did not run live Stripe API calls.
- Did not run real Hermes model calls.
- Did not implement Goal 8.
- Did not wire NeMo.
- Did not add live-money support.
- Did not edit `.env` with real values.
- Did not touch `data/*.db`.
- Did not create `CODEX_GOALS.md` or `GOAL_LOG.md`.
- Did not commit.

## Verification Commands

- For Goal 7.11C-followup, `./scripts/test.sh` passed: 48 backend tests and Vite production build.
- For Goal 7.11C-followup, `npm run build` in `frontend/` passed before the full test script and
  after final visual fixes.
- Auth-enabled browser QA used `/tmp/scalex-goal711c-followup.db`,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=operator`,
  `SCALEX_DEMO_PASSWORD=local-password`, `SCALEX_SESSION_SECRET=local-test-session`,
  `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, and `STRIPE_TEST_DOUBLE_MODE=true`.
- Browser QA ran on backend port `8793` and frontend port `5180`.
- Browser QA confirmed login, Dashboard operation file, Start Run in the test-double QA environment,
  Function Studio with Guardrail Review selected in the Evidence Drawer, post-run Studio/Runs
  evidence, Onboarding, Customers, Runs, Audit, Integrations, Settings, and logout.
- Final QA screenshots were written to `/tmp/scalex-goal711c-followup-final`.
- The stale-copy sweep found no current UI matches for `proof routes`, `debug console`, `raw invoice
  identifiers`, `Payment state`, `Policy state`, `SQLite state`, `Selected node`, `nodes active`,
  `Operator console`, or `proof panel`.
- Previous Goal 7.11B full-suite verification passed: 48 backend tests and Vite production build.
- Previous Goal 7.11B safe browser QA passed with `/tmp/scalex-goal711b-browser.db`, local prototype auth,
  `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, and `STRIPE_TEST_DOUBLE_MODE=true`.
- Browser QA confirmed login, Dashboard, Northstar sample load, Studio run, $8,500 revenue,
  $1,150 approved setup spend, $3,200 blocked risk, $7,350 protected gross profit, 86.5%
  margin, Hermes/Stripe/Guardrail/Blocked Risk/Profit Outcome inspectors, Runs, Audit,
  Integrations, Settings, and logout.
- `git diff --check` passed.
- Tracked-file secret scan passed; broad placeholder hits were reviewed, and the strict tracked-file
  key-material scan returned no matches.
- No `.env`, `data/*.db`, `frontend/dist`, `data/backups`, `CODEX_GOALS.md`, or `GOAL_LOG.md`
  file was staged.
- `git status --short` was reviewed.

## Incomplete Items

- Goal 8A read-only NeMo Guardrails preflight has not run yet.
- Real NVIDIA NeMo Guardrails is not wired yet.
- Verified Live Mode live-money execution is not implemented.
- Final demo recording and final submission assets are not complete.

## Deferred / Revisit

- Stripe webhooks remain deferred.
- Checkout Session and Payment Link flows remain deferred; current Goal 7 path is invoice-first Stripe test mode.
- Live-money payments remain deferred to Verified Live Mode.
- Production auth, multi-tenant SaaS features, public deployment, real customer workflows, production Hermes,
  Windows Hermes config, Prometheus production data, homelab OpenClaw, and Recall memory remain out of scope.

## Current Priority

Goal 8A - NeMo Guardrails Preflight / Architecture Audit.
