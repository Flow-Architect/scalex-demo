# STATUS - ScaleX ClientOps Autopilot

Last updated: 2026-06-26

## Verified Current State

- Project folder exists at `/home/ascabrya/dev/scalex-demo`.
- Latest committed baseline before Goal 7.13B: `35c9acb Add guardrail execution rails`.
- Last completed goal: Goal 7.13B - Connection Hub UI.
- Last completed implementation/QA goal: Goal 7.13B - Connection Hub UI.
- Last completed documentation/tracking update: Goal 7.13B closeout docs.
- Last completed checkout cleanup: Open Source Checkout Cleanup for judge readiness.
- Current priority: Goal 8D - Guardrail Proof UI in Workflow Canvas if a final demo pass exposes
  a proof gap; otherwise Goal 7.13C - MCP Server Prototype only after the boundary remains strong.
- Goal 7.11B replaced the legacy Harbor sample with Northstar Dental Group / Client Implementation Launch.
- Goal 7.11C-followup replaced the remaining generated dashboard/card shell with a ClientOps
  operation-file workspace across Dashboard, Function Studio, Onboarding, Client Operations,
  Runs, Evidence Ledger, Integrations, and Settings.
- Goal 7.11D unified the visual language across the light operation-file workspace, polished
  Function Studio into a more business-readable demo path, normalized primary proof labels, and
  verified the browser flow from login through logout.
- Goal 7.12 made Start Run visibly execute the Northstar client operation end to end.
- Goal 7.13A documented Connection Hub, the future MCP-shaped boundary, the Full Proof Mode
  real-tool demo plan, and the real NeMo target without changing code.
- Open Source Checkout Cleanup made Judge Demo Mode the safe `.env.example` default, taught
  `scripts/dev.sh` to load `.env` quietly when present, added checkout run/test commands to
  START_HERE, and clarified README/demo/submission checkout language.
- Goal 8A preflight is complete. Real NeMo is installed locally outside the repo at
  `/home/ascabrya/.venvs/scalex-nemo/bin/python` and imports `nemoguardrails`, `LLMRails`, and
  `RailsConfig`; observed version is 0.21.0.
- Goal 8B added the guardrail adapter boundary, optional real-NeMo runtime probing, SQLite
  guardrail evaluation persistence, API/UI proof fields, and setup/check scripts.
- Goal 8C strengthened guardrail execution rails around input, planning, protected finance
  requests, spend policy/ledger actions, and output honesty. Guardrail decisions are now recorded
  as `allow`, `warn`, `block`, or `fail_closed`, and blocked unsafe content stops before protected
  actions continue.
- Goal 7.13B replaced the old Integrations surface with a product-facing Connection Hub view for
  allowed systems, connector modes, guardrails, missing config, blocked policy actions, planned
  connectors, and evidence duties.
- Goal 7.14B passed Full Proof local validation in a configured local-only environment with real
  isolated Hermes, real Stripe test-mode invoice proof, real NeMo runtime verification, local
  policy active, and synthetic Northstar data only.
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
- Connection Hub is now implemented as the ScaleX product layer that declares allowed systems,
  modes, guardrails, missing config, blocked actions, planned boundaries, and evidence duties.
- Stripe provides finance proof through test invoice/payment state.
- ScaleX executes and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- Guardrail mode defaults to `local_policy`; Judge Demo Mode remains deterministic, secret-free,
  and independent of NeMo.
- Optional `nemo_guardrails` mode probes a configured external Python runtime through
  `SCALEX_NEMO_PYTHON` and fails closed if selected but unavailable, broken, or misconfigured.
- Optional `nemo_compatible` mode is a labeled fallback only and does not set `used_real_nemo=true`.
- SQLite records evidence.
- Profit Outcome reports protected profit and blocked risk.
- MCP is documented as a future access pattern only. ScaleX does not currently expose an MCP
  server, external agents cannot yet call ScaleX through MCP, and no MCP implementation exists.

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
- Dashboard, Function Studio, Onboarding, Client Operations, Runs, Evidence Ledger,
  Connection Hub, and Settings
- connected Function Studio page with proof nodes and selected-node inspector
- Judge Demo Mode as the default local execution mode: deterministic Hermes plan,
  Stripe test-double/sandbox finance proof, local policy active, and SQLite evidence records
- Full Proof Mode through `SCALEX_EXECUTION_MODE=full_proof` for configured real isolated Hermes
  and real Stripe test mode, with visible integration errors when misconfigured
- isolated Hermes planning in product mode
- real Stripe test-mode invoice path when configured with `sk_test_...`
- deterministic test-double paths for tests/CI/diagnostics only
- local policy engine for current guardrail enforcement
- guardrail adapter modes: `local_policy`, `nemo_guardrails`, and `nemo_compatible`
- `guardrail_evaluations` SQLite records for input, planning, execution, and output rail proof,
  including pre-action execution gates before Stripe finance proof, revenue ledger marking, spend
  policy checks, approved spend ledger rows, and post-execution blocked-spend consistency
- API/UI proof fields for guardrail mode, adapter status, decision, `used_real_nemo`,
  `fail_closed`, evaluation stages, local policy active status, and blocked-spend ledger-row proof

## Verified For Goal 7.13B

- Added a reachable Connection Hub view through the existing product shell navigation.
- The view shows Hermes Planning, Stripe Finance Proof, Guardrails, SQLite Evidence Ledger,
  Prototype Auth, and planned Slack/Email approvals, CRM context, Docs/Notion, Calendar, and MCP
  boundary cards.
- The view distinguishes Judge Demo Mode, Full Proof capability, runtime verification,
  missing configuration, fail-closed, blocked-by-policy, and planned-only states.
- Stripe proof stays honest: live money is unsupported, invoice/hosted URL presence is shown only
  when available, and `paid=false` is not represented as paid.
- Guardrail proof shows mode, adapter status, `used_real_nemo`, `fail_closed`, and the input,
  planning, execution, and output rail stages from existing state fields.
- Evidence proof shows latest selected-run summary, planning/Stripe/policy/guardrail/orchestration
  counts, blocked-spend/no-ledger-row evidence, blocked policy actions, blocked risk, protected
  profit, and protected margin.
- Planned connectors are explicitly planned only; no MCP server, real client email, CRM, Notion,
  calendar, production auth, or generic connector marketplace claim was added.
- No backend API fields or connector backends were added. The UI reuses existing `state_service`
  fields from Goal 8B/8C.
- Verification completed:
  - `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
  - `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
    loaded.
  - A direct `npm run build` in `frontend/` passed during implementation.
  - `git diff --check` passed.
  - Strict added-lines secret scan returned no matches.
  - Unsafe/generated path scan returned no matches for `.env`, SQLite `.db`, data backups,
    `frontend/dist`, `node_modules`, venvs, logs, `CODEX_GOALS.md`, or `GOAL_LOG.md`.
  - `git status --short` was reviewed.
- Goal 7.13B did not run Full Proof validation, make Stripe API calls, call production Hermes,
  edit `.env`, touch `data/*.db` or `data/backups`, add secrets, create an MCP server, or commit.

## Verified For Goal 8C

- Input rail validates selected operation economics, synthetic/local sample boundary, vendor
  safety, no real client data, no real client email, no live-money intent, and no PHI/patient-data
  handling before planning continues.
- Planning rail validates deterministic or Hermes plan JSON, the expected 19-tool sequence, and
  unsafe plan text before any finance/spend action.
- Execution rail now records pre-action guardrail evaluations before Stripe/test-double finance
  proof, before revenue ledger marking, before each spend policy check, before each approved spend
  ledger row, and after execution consistency review.
- Spend execution was split so policy checks/events are recorded first and approved spend ledger
  rows are written only after a guardrail preflight. Blocked spend still creates policy/evidence
  records and no spend ledger row.
- Output rail validates final report economics, protected profit/margin math, paid-state honesty,
  no real client email, no PHI/patient data, and no live-money or Stripe-paid claim when
  `paid=false`.
- `nemo_guardrails` remains optional and fails closed when selected but unavailable before Stripe
  or ledger actions. `nemo_compatible` remains fallback-only and never sets `used_real_nemo=true`.
- Judge Demo Mode remains deterministic and secret-free with the expected 19 orchestration calls
  and unchanged Northstar economics.
- Full Proof compatibility fields remain intact. Goal 8C did not rerun Full Proof or make real
  Stripe API calls.
- UI/API proof now exposes rail/stage, decision, source/mode, adapter status, `used_real_nemo`,
  `fail_closed`, and blocked-spend ledger-row evidence.
- Verification completed:
  - `backend/.venv/bin/python -m pytest backend/tests/test_guardrails_service.py backend/tests/test_demo_runner.py` passed with 34 tests.
  - `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
  - `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
    loaded.

## Verified For Goal 8B

- Added guardrail config with default `SCALEX_GUARDRAIL_MODE=local_policy`.
- Added optional real NeMo runtime settings:
  - `SCALEX_NEMO_PYTHON`
  - `SCALEX_NEMO_CONFIG_PATH=./guardrails/scalex`
  - `GUARDRAILS_FAIL_CLOSED=true`
  - `GUARDRAILS_RECORD_EVALUATIONS=true`
- Added `backend/app/services/guardrails_service.py` with a subprocess-only NeMo probe. The main
  Python 3.14 backend does not import `nemoguardrails`.
- Added a credential-free `guardrails/scalex` config that `RailsConfig.from_path` can load.
- Added `guardrail_evaluations` to `data/schema.sql`, repository helpers, state service output,
  and table counts.
- Added guardrail evaluations to the run lifecycle for input, planning, execution, and output
  stages without changing the 19-step orchestration call sequence.
- Preserved local policy as the active deterministic business-rule gate for payment-before-spend,
  vendor allow/block lists, the $1,150 setup spend cap, 50% margin floor, human approval threshold,
  and blocked Unapproved Data Broker Enrichment behavior.
- Added frontend proof in Dashboard, Function Studio, Evidence Ledger, Integrations, Settings,
  workflow audit counts, and the policy/guardrail inspector.
- Added `requirements-nemo.txt`, `scripts/setup-nemo.sh`, and `scripts/check-nemo.sh`.
- `scripts/check-nemo.sh` passed against `/home/ascabrya/.venvs/scalex-nemo/bin/python`, reported
  NeMo 0.21.0, imported `LLMRails` and `RailsConfig`, and loaded `guardrails/scalex`.
- A `/tmp` smoke run with `SCALEX_GUARDRAIL_MODE=nemo_guardrails` and
  `SCALEX_NEMO_PYTHON=/home/ascabrya/.venvs/scalex-nemo/bin/python` completed with
  `adapter_status=runtime_verified`, `used_real_nemo=true`, `fail_closed=false`, four guardrail
  evaluations, and Stripe still in `test_double` mode.
- Judge Demo Mode still works without secrets and with `used_real_nemo=false`.
- No live Stripe keys, live money, Hermes production calls, production data, `.env` edits,
  SQLite `.db` files, data backups, secrets, or local venv files were added.

## Verified For Goal 7.14B Full Proof Local Validation

Goal 7.14B passed from a local-only configured environment. No repo files were edited during the
validation run, and the temporary `/tmp/scalex-fullproof-validation.db` database was removed after
inspection.

- Baseline commit: `c0d2964 Add real-NeMo-ready guardrail adapter`.
- `./scripts/test.sh` passed with 55 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available.
- Full Proof Start Run completed with synthetic Northstar data only.
- Real isolated Hermes ran: `used_real_hermes=true`.
- Real Stripe test-mode invoice proof ran: `used_real_stripe=true`, `stripe_mode=stripe_test`,
  `livemode=false`, Stripe invoice ID present, hosted invoice URL present, and `paid=false`
  remained unpaid and was not represented as Stripe-paid.
- No real client email was used.
- Real NeMo runtime verification ran: `used_real_nemo=true`, `adapter_status=runtime_verified`,
  and `fail_closed=false`.
- Local policy remained active as the deterministic business-rule gate.
- SQLite proof counts: `planning_runs=1`, `stripe_events=4`, `policy_checks=4`,
  `guardrail_evaluations=4`, `orchestration_calls=19`, `events=14`, `reports=1`, and
  `ledger_entries=4`.
- Economics verified: $1,150 approved setup spend, $3,200 blocked Unapproved Data Broker
  Enrichment risk, $7,350 protected gross profit, and 86.5% protected margin.
- Blocked spend created policy/evidence records and did not create a spend ledger row.
- Safety boundaries preserved: no live money, no live Stripe key, no real client email, no
  patient data, no PHI, no production Hermes, and no committed database changes.

## Verified For Open Source Checkout Cleanup

- `.env.example` now defaults to `SCALEX_EXECUTION_MODE=demo`, `SCALEX_AUTH_ENABLED=false`,
  deterministic Hermes planning, and Stripe test-double/sandbox finance proof.
- `.env.example` keeps real credentials blank, avoids live Stripe key examples, and marks Full
  Proof Mode values as optional local-only configuration.
- `scripts/dev.sh` loads `.env` if present without printing values and without failing when `.env`
  is missing.
- `scripts/setup.sh` no longer implies `.env` is required for the judge-safe demo.
- README now presents the judge checkout path: install, run, use the printed frontend URL, click
  Start Run in Judge Demo Mode, run tests, and optionally configure Full Proof Mode locally.
- START_HERE now includes setup, run, frontend URL, and test commands.
- Demo and submission docs clarify that Full Proof Mode uses Stripe test-mode invoice
  creation/finalization for proof only and must not be presented as sending invoice email to a
  real client.
- A LICENSE file is still not present. Recommended license choices before public open-source
  submission are MIT or Apache-2.0, subject to owner approval.
- Goal 8 was not implemented; NeMo was not installed or wired; no MCP server or Connection Hub UI
  was created; no Stripe API calls or Hermes model calls were run; no live-money support, real
  client data, `.env` real values, SQLite `.db`, data backups, extra goal logs, or commits were
  added.

## Verified For Goal 7.13A

- Added the ScaleX Connection Hub concept as a planned internal product layer for ClientOps
  Autopilot. It declares which systems Hermes and future agents are allowed to use, what mode each
  connector is in, what guardrails apply, what configuration is missing, which actions are blocked,
  and what evidence is recorded.
- Preserved the concept lock: ScaleX is business tooling for revenue-backed client operations, not
  a generic MCP platform, generic connector marketplace, integration dashboard, Zapier/n8n clone,
  developer tool first, or AI agent playground.
- Documented active connector concepts: Hermes Planning, Stripe Finance Proof, Local Policy,
  SQLite Evidence Ledger, and Prototype Auth.
- Documented planned connector concepts: NeMo Guardrails, Slack / Email approvals, CRM client
  context, Docs / Notion workspace, and Calendar kickoff scheduling.
- Documented connector statuses: active, demo mode, full proof mode, planned, missing config,
  blocked by policy, unavailable, and failed closed.
- Documented MCP as a future access pattern that may expose safe ScaleX tools, resources, and
  prompts only after the guardrail/tool boundary is clear. ScaleX does not currently expose an MCP
  server and external agents cannot yet call ScaleX through MCP.
- Added the Full Proof Mode real-tool demo plan: real isolated Hermes planning, real Stripe
  test-mode invoice creation/finalization, local policy guardrails, SQLite evidence, synthetic
  Northstar data only, no live money, no real client email, no patient data, no PHI, and no real
  NeMo claim until wired and verified.
- Strengthened Goal 8 positioning: real NVIDIA NeMo Guardrails is the target governed autonomy
  layer, not an optional nice-to-have. Goal 8A must determine the safest practical wiring path.
- Documented the fallback rule: a NeMo-compatible/local adapter is allowed only if Goal 8A proves
  real NeMo cannot be safely wired before submission, with the blocker, temporary adapter, and
  remaining real-NeMo work clearly documented and no UI claim that real NeMo is active.
- Clarified invoice lifecycle: Hermes plans the finance step; ScaleX backend executes approved
  finance actions; Stripe returns test-mode invoice proof and hosted invoice URL when available;
  ScaleX stores proof in the Evidence Ledger; Demo mode creates sandbox finance proof and does not
  call Stripe.
- Preserved Judge Demo Mode and Full Proof Mode truthfulness, including `used_real_hermes`,
  `used_real_stripe`, `stripe_mode=stripe_test`, `livemode=false`, and no paid claim unless
  Stripe reports `paid=true`.
- Goal 8A, Goal 8B-8E, Goal 9, and Goal 7B / Verified Live Mode remain intact.
- No code implementation, MCP server, frontend UI, backend behavior change, Stripe API call,
  Hermes model call, Full Proof Mode live test, Goal 8 implementation, NeMo install/wiring,
  live-money support, `.env` edit, `data/*.db` touch, `data/backups` touch, extra goal log, commit,
  or secret addition was performed.

## Verified For Goal 7.12

- Root cause found: Start Run relied on one blocking `POST /api/demo/run` and only replaced state
  after completion; the button label stayed `Start Run`, so fast deterministic runs collapsed into
  static cards and slower integration runs offered little visible product motion.
- Added explicit execution modes:
  - `SCALEX_EXECUTION_MODE=demo` is the default Judge Demo Mode and works without real secrets.
  - `SCALEX_EXECUTION_MODE=full_proof` preserves real isolated Hermes and real Stripe test-mode
    behavior when safely configured, and keeps visible errors when credentials are missing.
- Added an execution summary to API state with Demo proof mode, deterministic Hermes plan,
  Stripe test-double/sandbox proof, local policy active, and real-adapter flags.
- Added a `run_started` event and kept Runs, timeline events, planning runs, orchestration calls,
  Stripe proof records, policy checks, ledger entries, agent outputs, and profit reports populated
  in SQLite after a successful run.
- Updated Function Studio so `Start Run` changes to `Running...`, the Function Map plays through
  Run Started, Hermes Plan, Stripe Finance Proof, Revenue Gate, Guardrail Review, Approved
  Resources, Blocked Risk, Work Execution, Evidence Ledger, and Profit Outcome, and the Evidence
  Drawer auto-selects the active step.
- Updated evidence proof for Hermes, Stripe, Guardrail Review, Blocked Risk, Profit Outcome, and
  Evidence Ledger; Runs and Evidence Ledger now expose the completed execution and grouped proof.
- Preserved Northstar economics: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, and 86.5% protected margin.
- Preserved truthfulness: demo mode does not claim real Hermes or real Stripe; Stripe `paid=false`
  is not shown as paid; local policy active now; real NeMo Guardrails planned/not wired; no
  live-money support; no production auth claim; no patient data and no PHI.

## Verified For Goal 7.11D

- Unified the app around the lighter operation-file visual system so the shell, Dashboard,
  Function Studio, and secondary pages no longer feel like separate products.
- Kept Dashboard business-first with the Northstar operation brief, outcome rail, operating stack,
  template shelf, technical proof route footer, and clear `Open Function Studio` path.
- Strengthened Function Studio with a top operation fact strip, clearer business labels, readable
  Function Map rows, proof-oriented Evidence Drawer copy, and normalized primary proof badges such
  as `test planning proof` and `setup needed` instead of raw snake_case.
- Polished navigation labels to Dashboard, Function Studio, Onboarding, Client Operations, Runs,
  Evidence Ledger, Integrations, and Settings while preserving existing routes and state.
- Lightly polished Onboarding, Client Operations, Runs, Evidence Ledger, Integrations, Settings,
  login, and logout so the demo path is consistent without adding fake functionality.
- Preserved Northstar economics and truthfulness: synthetic account only, no patient data, no PHI,
  no HIPAA claim, local policy active now, NeMo planned/not wired, Stripe not paid unless
  `paid=true`, no live-money support, and no production auth claim.
- Did not implement Goal 8, install or wire NeMo, run Stripe API calls, run Hermes model calls,
  edit `.env`, touch `data/*.db`, touch `data/backups`, create extra goal logs, commit, or change
  Northstar economics.

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
  first Dashboard screen; they now live in Evidence Ledger, Integrations, Settings, or the
  Function Studio Evidence Drawer.
- Reworked Function Studio into a business workspace with operation brief, readable Function Map,
  Evidence Drawer, and client activity timeline.
- Reworked Onboarding into a Configure Client Implementation Launch operation setup document.
- Reworked Client Operations into Client Operation Files and Runs into Execution History with a clear
  no-execution empty state.
- Reworked Audit/Evidence Ledger into Evidence Ledger, Integrations into Operating Stack, and Settings into
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

- For Open Source Checkout Cleanup, `./scripts/test.sh` passed: 49 backend tests and Vite
  production build.
- For Open Source Checkout Cleanup, `git diff --check` passed.
- For Open Source Checkout Cleanup, strict added-lines secret scan returned no matches.
- For Open Source Checkout Cleanup, no `.env`, SQLite `.db`, `data/backups`, `frontend/dist`,
  `CODEX_GOALS.md`, or `GOAL_LOG.md` file is in the git diff or staged.
- For Open Source Checkout Cleanup, `CODEX_GOALS.md` and `GOAL_LOG.md` do not exist.
- For Open Source Checkout Cleanup, `git status --short` was reviewed.
- For Goal 7.13A, `git diff --check` passed.
- For Goal 7.13A, strict added-lines secret scan returned no matches.
- For Goal 7.13A, no `.env`, SQLite `.db`, `data/backups`, `frontend/dist`, `CODEX_GOALS.md`, or
  `GOAL_LOG.md` file is in the git diff.
- For Goal 7.13A, `CODEX_GOALS.md` and `GOAL_LOG.md` do not exist.
- For Goal 7.13A, `git status --short` was reviewed.
- For Goal 7.12, `./scripts/test.sh` passed: 49 backend tests and Vite production build.
- For Goal 7.12, final auth-enabled browser QA passed on backend `8787` and frontend `5174`,
  using `/tmp/scalex-goal712-qa3.db`, `SCALEX_EXECUTION_MODE=demo`, `STRIPE_SECRET_KEY` unset,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=<local-demo-username>`,
  `SCALEX_DEMO_PASSWORD=<local-demo-password>`, and `SCALEX_SESSION_SECRET=<local-session-secret>`.
- Browser QA confirmed login, zero pre-run counts, Northstar selection, Function Studio,
  `Running...` state, run completion, Hermes/Stripe/Guardrail/Blocked Risk/Profit proof,
  Runs, Evidence Ledger, Integrations, logout, and no browser console issues.
- Final QA state recorded 1 run, 14 timeline events, 1 planning run, 19 orchestration calls,
  4 Stripe test-double proof records, 4 policy checks, 4 ledger entries, 4 agent outputs, and
  1 profit report.
- For Goal 7.12, `git diff --check` passed.
- For Goal 7.12, strict added-lines secret scan returned no matches.
- For Goal 7.12, no `.env`, SQLite `.db`, `data/backups`, `frontend/dist`, `CODEX_GOALS.md`, or
  `GOAL_LOG.md` file was staged.
- For Goal 7.12 planning docs update, `git diff --check` passed.
- For Goal 7.12 planning docs update, strict added-lines secret scan returned no matches.
- For Goal 7.12 planning docs update, `git status --short` was reviewed.
- For Goal 7.11D, `./scripts/test.sh` passed: 48 backend tests and Vite production build.
- For Goal 7.11D, `npm run build` in `frontend/` passed after final proof-label polish.
- Auth-enabled browser QA used `/tmp/scalex-goal711d-qa.db`,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=<local-demo-username>`,
  `SCALEX_DEMO_PASSWORD=<local-demo-password>`, `SCALEX_SESSION_SECRET=<local-session-secret>`,
  `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, and `STRIPE_TEST_DOUBLE_MODE=true`.
- Browser QA ran on backend port `8787` and frontend port `5174`.
- Browser QA confirmed login, Dashboard, Northstar operation selection, Function Studio, Start Run,
  Hermes/Finance/Guardrail/Blocked Risk/Profit Outcome Evidence Drawer selections, Onboarding,
  Client Operations, Runs, Evidence Ledger, Integrations, Settings, and logout.
- Final QA screenshots were written to `/tmp/scalex-goal711d-final`.
- For Goal 7.11C-followup, `./scripts/test.sh` passed: 48 backend tests and Vite production build.
- For Goal 7.11C-followup, `npm run build` in `frontend/` passed before the full test script and
  after final visual fixes.
- Auth-enabled browser QA used `/tmp/scalex-goal711c-followup.db`,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=<local-demo-username>`,
  `SCALEX_DEMO_PASSWORD=<local-demo-password>`, `SCALEX_SESSION_SECRET=<local-session-secret>`,
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

- Goal 8D Guardrail Proof UI in Workflow Canvas has not run yet.
- Goal 7.14B Full Proof local validation has passed; rerun it only before final recording or after
  relevant integration changes.
- Goal 7.13C MCP Server Prototype has not been implemented yet.
- Real NeMo is not active by default; it is available only through optional `nemo_guardrails` mode
  after runtime verification.
- Verified Live Mode live-money execution is not implemented.
- License has not been selected; no `LICENSE` file exists yet.
- Final demo recording and final submission assets are not complete.

## Deferred / Revisit

- Stripe webhooks remain deferred.
- Checkout Session and Payment Link flows remain deferred; current Goal 7 path is invoice-first Stripe test mode.
- Live-money payments remain deferred to Verified Live Mode.
- Production auth, multi-tenant SaaS features, public deployment, real customer workflows, production Hermes,
  Windows Hermes config, Prometheus production data, homelab OpenClaw, and Recall memory remain out of scope.

## Current Priority

Goal 8D - Guardrail Proof UI in Workflow Canvas if the final demo pass exposes a remaining proof
gap; otherwise Goal 7.13C - MCP Server Prototype only after the Connection Hub and guardrail
boundary are confirmed strong enough.

Goal 7.14B Full Proof validation has passed. Rerun it only before final recording or after changes
that touch Hermes, Stripe, NeMo, policy, guardrail, ledger, or run-proof behavior.
