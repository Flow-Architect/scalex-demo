# TASKS - ScaleX ClientOps Autopilot

## Current Priority

Goal 8F - Telegram Human Approval Gate.

Goal 8E is complete. ScaleX now has an optional backend runtime adapter for the already validated
local NemoHermes OpenAI-compatible API. It is selected with `HERMES_RUNTIME=nemoclaw`, records
non-secret runtime evidence, and fails closed if selected but unavailable.

Goal 7.13B is complete. The repo now has a product-facing Connection Hub view for allowed systems,
connector modes, guardrails, evidence duties, missing config, blocked policy actions, and planned
boundaries while preserving Judge Demo Mode and Full Proof compatibility.

## Goal 8E Gate Result

Goal 8E - Wire ScaleX to the live NemoHermes API Runtime is complete.

Completed:

- Added optional `HERMES_RUNTIME=nemoclaw` config support with safe `.env.example` placeholders.
- Added the NemoHermes OpenAI-compatible `chat/completions` adapter for model `hermes-agent`.
- Preserved default deterministic Judge Demo Mode and the existing isolated Hermes path.
- Added fail-closed behavior for HTTP errors, malformed responses, timeouts, and unreachable API
  failures.
- Added non-secret runtime evidence for runtime, endpoint host/path, model, sandbox, provider,
  upstream model, status, duration, and error class.
- Updated API/UI state and Connection Hub display for NemoClaw / OpenShell Sandbox, Hermes Agent,
  NVIDIA provider route, local API, and runtime status.
- Recorded that the local runtime was validated externally before this goal and that the Nous
  OAuth path was intentionally not used because the NVIDIA provider route is active and the session
  key minting path is retired for this local setup.

Safety:

- No NemoClaw, Docker, provider credential, production Hermes, production data, `.env`, SQLite
  `.db`, backup, live-money, Telegram, MCP, or secret setup was modified.
- Real `used_real_hermes=true` is set only when the selected runtime call succeeds.
- MCP remains paused until the approval gate and product story are ready.

## Goal 7.15A Gate Result

Goal 7.15A - Product Depth, Demo-Winning UI Plan, Telegram Approval Gate Plan, and NemoClaw
Correction is complete as docs-only work.

Completed:

- Corrected docs to distinguish the implemented NeMo Guardrails adapter through Python
  `nemoguardrails` from actual NVIDIA NemoClaw / OpenShell / `nemohermes`.
- Recorded that ScaleX has local policy implemented, Stripe test-mode Full Proof validated,
  isolated local Hermes Full Proof validated, and `nemoguardrails` installed/runtime verified.
- Recorded that actual NemoClaw, OpenShell sandbox, and `nemohermes` are not installed and not
  wired into ScaleX.
- Recorded the local prerequisite probe: `nemoclaw` missing, `nemohermes` missing, `openshell`
  missing, Docker missing/not usable, `node` v22.22.2 present, `npm` 10.9.7 present, `zstd`
  present, `strings` present, and repo baseline clean at `c70ba17`.
- Added a future actual NemoClaw/NemoHermes plan before MCP implementation.
- Added the future Product Depth + Demo-Winning UI Pass.
- Added the future Telegram Human Approval Gate plan.
- Paused MCP until after NemoClaw preflight, approval-gate planning/implementation or explicit
  deferral, product-story review, and guardrail/tool-boundary review.

Safety:

- No code was implemented.
- No frontend UI or backend behavior was changed.
- No NemoClaw, Docker, NeMo, Hermes, Stripe, Full Proof, or MCP runtime was run.
- No `.env`, SQLite `.db`, `data/backups`, secrets, extra goal logs, staging, commit, or generated
  artifacts were added.

## Goal 7.11A Gate Result

Goal 7.11A - ClientOps Autopilot Product Pivot Docs is complete as a docs-only positioning update.

- ScaleX is now documented as **ScaleX ClientOps Autopilot**, an **Enterprise Function Accelerator**
  for revenue-backed client operations.
- The docs now state the enterprise problem: B2B teams struggle to turn signed client work into
  coordinated execution because onboarding, billing, vendor spend, approvals, task routing, and
  reporting are fragmented.
- The stack mapping is explicit:
  - Hermes plans and routes the client operation.
  - Stripe provides finance proof.
  - ScaleX executes and enforces business rules.
  - local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
  - NeMo Guardrails adapter proof is implemented later through Goal 8B/8C; actual NemoClaw is not
    wired yet.
  - SQLite records evidence.
  - Profit Outcome reports protected profit.
- Harbor Fleet Services is now historical only.
- Northstar Dental Group / Client Implementation Launch is implemented by Goal 7.11B.
- No backend logic, frontend code, sample data in code, `.env`, database file, Stripe API call,
  Hermes model call, NeMo wiring, live-money support, commit, or dependency install was performed.

## Goal 7.11B Gate Result

Goal 7.11B - Replace Harbor Sample with Northstar Client Implementation Launch is complete as
the sample implementation pass.

- Harbor Fleet Services is no longer the current implemented sample.
- Northstar Dental Group / Client Implementation Launch is implemented in sample defaults, local
  policy/sample data, UI copy, tests, Hermes skill text, and current demo docs.
- Northstar is a synthetic B2B implementation operations account only: no patient data, no PHI,
  no healthcare compliance claim, and no HIPAA support claim.
- Implemented economics:
  - $8,500 implementation package revenue
  - $350 Secure Workspace Pack
  - $500 Data Migration Sandbox
  - $300 Launch Asset Kit
  - $1,150 total approved setup spend
  - $3,200 Unapproved Data Broker Enrichment blocked risk
  - $7,350 protected gross profit
  - 86.5% protected margin
  - 50% margin floor
- Local policy remains active now for payment-before-spend, vendor, spend cap, and margin floor.
- NeMo Guardrails adapter proof is implemented later through Goal 8B/8C; actual NemoClaw remains
  planned and not wired yet.
- Goal 8 was not implemented at this earlier checkpoint.
- Live-money support was not added.

## Next Recommended Goal

Run Codex `/goal` 8F - Telegram Human Approval Gate.

Goal 8F should add Telegram as a human approval channel for risky but allowable actions. It should
not become a chatbot-first feature and must not bypass local policy, NeMo Guardrails checks,
NemoClaw/NemoHermes runtime boundaries, or evidence recording.

Preserve the current truth:

- The implemented NeMo Guardrails adapter uses Python `nemoguardrails` through
  `SCALEX_NEMO_PYTHON`.
- Goal 7.14B Full Proof validation passed with real isolated Hermes, real Stripe test-mode proof,
  NeMo Guardrails runtime verification, local policy active, and synthetic Northstar data only.
- Optional NemoHermes API routing is wired behind `HERMES_RUNTIME=nemoclaw`; it is not active by
  default and fails closed if unavailable.
- Judge Demo Mode must remain safe without NemoClaw.
- Full Proof local mode must remain available through the existing validated path.
- NemoHermes mode must fail closed if selected but unavailable.

Goal 8F required output:

- Pending approval request model and evidence records.
- Telegram send/approve/deny flow with allowlisted chat IDs, no secrets, no PHI, expiry, and
  fail-closed deny/expired behavior.
- Policy re-check before execution after approval.
- Connection Hub status for planned/missing config/active/fail closed approval channel.
- Keep MCP paused.

Recommended sequence:

1. Goal 8F - Telegram Human Approval Gate.
2. Goal 7.15B - Product Depth + Demo-Winning UI Pass.
3. Goal 7.13C - MCP Server Prototype only after NemoClaw, guardrail, and approval boundaries are
   safe.
4. Goal 9 - final repo/video/submission polish.
5. Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Goal 7.14B Full Proof local validation is complete. Rerun it only before final recording or after
changes that touch Hermes, Stripe, NeMo Guardrails, NemoClaw, policy, guardrail, ledger, or
run-proof behavior.

## Goal 7.13B Gate Result

Goal 7.13B - Connection Hub UI is complete.

Completed:

- Replaced the visible Integrations nav label with Connection Hub while preserving the existing
  route key.
- Added a product-facing Connection Hub view for the ClientOps operating boundary, not a generic
  connector marketplace.
- Added Active Today cards for Hermes Planning, Stripe Finance Proof, Guardrails, SQLite Evidence
  Ledger, and Prototype Auth.
- Added Full Proof Capable cards for isolated Hermes, Stripe test-mode finance, and optional
  NeMo Guardrails adapter proof.
- Added Planned cards for Slack/Email approvals, CRM context, Docs/Notion workspace, Calendar
  kickoff scheduling, and MCP server boundary, each clearly marked planned only.
- Surfaced status chips for active, demo mode, full proof capable, runtime verified, missing
  config, fail closed, blocked by policy, and planned states.
- Added evidence panels for latest run proof, rail stages, policy-blocked actions, blocked
  spend/no-ledger-row proof, table counts, blocked risk, protected profit, and protected margin.
- Reused existing state fields only; no new connector backend, API route, MCP server, Stripe call,
  Hermes call, or NeMo call was added.

Verified:

- `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
  loaded.
- A direct `npm run build` in `frontend/` passed during implementation.
- `git diff --check` passed.
- Strict added-lines secret scan returned no matches.
- Unsafe/generated path scan returned no matches.
- `git status --short` was reviewed.

Suggested commit message:
Add Connection Hub UI

## Goal 8C Gate Result

Goal 8C - Guardrail Execution Rails in Run Lifecycle is complete.

Completed:

- Strengthened input rail validation for selected operation economics, synthetic/local boundary,
  vendor safety, unsafe real data/email/live-money intent, and PHI/patient-data handling.
- Strengthened planning rail validation for deterministic or Hermes plan JSON, expected tool
  sequence, policy bypass, live-money intent, real client email, unsafe data, and unauthorized
  connector/MCP intent.
- Added execution rail pre-action guardrail evaluations before Stripe/test-double finance proof,
  revenue ledger marking, each spend policy check, each approved spend ledger row, and final
  blocked-spend consistency review.
- Split run spend execution so blocked spend records policy/evidence but never creates a spend
  ledger row, while approved spend writes the ledger row only after execution rail preflight.
- Strengthened output rail validation for paid-state honesty, final report math, protected
  profit/margin consistency, and unsafe output terms.
- Updated API/UI proof to show rail stage, decision, source/mode, adapter status,
  `used_real_nemo`, `fail_closed`, and blocked-spend ledger-row proof.

Verified:

- Focused backend guardrail/runner tests passed with 34 tests.
- `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
  loaded.
- Full Proof was not rerun.

Suggested commit message:
Add guardrail execution rails

## Goal 7.14B Gate Result

Goal 7.14B - Full Proof Local Validation With Configured Real Tools passed from a local-only
configured environment.

Verified:

- `./scripts/test.sh` passed with 55 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available.
- Full Proof Start Run completed with synthetic Northstar data only.
- `used_real_hermes=true`.
- `used_real_stripe=true`, `stripe_mode=stripe_test`, and `livemode=false`.
- Stripe invoice ID was present and hosted invoice URL was present.
- `paid=false` remained unpaid and was not represented as Stripe-paid.
- No real client email was used.
- `used_real_nemo=true`, `adapter_status=runtime_verified`, and `fail_closed=false`.
- Local policy remained active as the deterministic business-rule gate.
- SQLite proof counts: `planning_runs=1`, `stripe_events=4`, `policy_checks=4`,
  `guardrail_evaluations=4`, `orchestration_calls=19`, `events=14`, `reports=1`, and
  `ledger_entries=4`.
- Economics remained $1,150 approved setup spend, $3,200 blocked Unapproved Data Broker
  Enrichment risk, $7,350 protected gross profit, and 86.5% protected margin.
- Blocked spend created policy/evidence records and did not create a spend ledger row.
- Safety boundaries preserved: synthetic Northstar data only, no live money, no live Stripe key,
  no real client email, no patient data, no PHI, and temporary `/tmp` validation database removed.

## Goal 8B Gate Result

Goal 8B - Real-NeMo-Ready Guardrail Adapter + Schema/API is complete.

Completed:

- Added guardrail modes:
  - `local_policy` default, no secrets, no NeMo dependency.
  - `nemo_guardrails` optional real NeMo target via `SCALEX_NEMO_PYTHON`.
  - `nemo_compatible` labeled temporary fallback, not real NeMo.
- Added subprocess-only real NeMo availability probing; the main backend process does not import
  `nemoguardrails`.
- Added `guardrails/scalex` credential-free NeMo config for `RailsConfig.from_path` checks.
- Added `guardrail_evaluations` persistence and repository helpers.
- Added API state fields for guardrail mode, adapter status, `used_real_nemo`, `fail_closed`,
  local policy active, evaluation stages, and evaluation records.
- Added frontend proof fields in Dashboard, Function Studio, Evidence Ledger, Integrations,
  Settings, workflow audit counts, and policy/guardrail inspector.
- Added `requirements-nemo.txt`, `scripts/setup-nemo.sh`, and `scripts/check-nemo.sh`.
- Preserved Judge Demo Mode and Start Run behavior without NeMo or secrets.

Verified:

- `./scripts/test.sh` passed with 55 backend tests and a successful Vite production build.
- `scripts/check-nemo.sh` passed against the external local venv and loaded `guardrails/scalex`.
- Backend focused tests cover default local policy, selected-but-unavailable NeMo fail-closed,
  successful NeMo availability probing, fallback labeling, persisted guardrail evaluations, and
  unchanged Judge Demo Start Run behavior.

Suggested commit message:
Add real-NeMo-ready guardrail adapter

## Open Source Checkout Cleanup Result

Completed as a small judge-readiness cleanup, not a new roadmap goal:

- `.env.example` defaults to Judge Demo Mode, disables auth by default, keeps credentials blank,
  and keeps Full Proof Mode optional/local-only.
- `scripts/dev.sh` loads `.env` quietly when present and still works without `.env`.
- `scripts/setup.sh` tells reviewers that Judge Demo Mode runs without secrets.
- README explains clone/setup/run/test flow, Judge Demo Mode, optional Full Proof Mode, no live
  money, no real client data/PHI, Connection Hub/MCP planned only, and real NeMo targeted/not
  wired.
- START_HERE includes `./scripts/setup.sh`, `./scripts/dev.sh`, the default frontend URL, and
  `./scripts/test.sh`.
- Demo/submission docs clarify that Full Proof Mode Stripe test invoice creation/finalization is
  proof only and must not be presented as sending invoice email to a real client.
- LICENSE is still missing; choose MIT or Apache-2.0 before public open-source submission if the
  owner approves.
- No Goal 8 implementation, NeMo install/wiring, MCP server, Connection Hub UI, Stripe API call,
  Hermes model call, live-money support, real client data, `.env` real values, SQLite `.db`,
  data backups, extra goal logs, commit, or LICENSE file was added.

## Goal 7.13A Gate Result

Goal 7.13A - Connection Hub / MCP Architecture Docs with ClientOps Concept Lock, Full Proof
Real-Tool Demo Plan, and Real NeMo Requirement is complete as a docs-only planning update.

Completed:

- Defined ScaleX Connection Hub as an internal ClientOps product layer that declares allowed
  systems, connector modes, guardrails, missing config, blocked actions, and evidence duties.
- Locked the product concept around ScaleX ClientOps Autopilot, not a generic MCP platform,
  connector marketplace, integration dashboard, developer tool, Zapier/n8n clone, or agent
  playground.
- Documented MCP as a future access pattern only. ScaleX does not currently expose an MCP server,
  external agents cannot yet call ScaleX through MCP, and no NeMo wiring is claimed.
- Added a Full Proof Mode real-tool demo plan for real isolated Hermes planning plus real Stripe
  test-mode invoice creation/finalization with synthetic Northstar data only.
- Clarified invoice lifecycle: Hermes plans the finance step, ScaleX backend executes approved
  finance actions, Stripe returns test-mode proof, and ScaleX stores proof in the Evidence Ledger.
- Strengthened Goal 8 positioning: real NVIDIA NeMo Guardrails is the target governed autonomy
  layer, and a NeMo-compatible/local fallback is allowed only if Goal 8A proves real NeMo cannot
  be safely wired before submission.
- Preserved Judge Demo Mode as safe without secrets and clearly labeled deterministic/sandbox proof.
- Preserved Full Proof Mode as real isolated Hermes plus real Stripe test mode only when safe
  ignored local credentials are configured.
- Preserved Northstar economics: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, 86.5% protected margin, and 50% margin floor.
- Preserved truth boundaries: Northstar is synthetic, no patient data, no PHI, no HIPAA claim,
  local policy active now, real NeMo Guardrails planned/not wired, no live-money support, and no
  production auth claim.
- Did not implement code, create an MCP server, add frontend UI, change backend behavior, run
  Stripe API calls, run Hermes model calls, run Full Proof Mode live tests, implement Goal 8,
  install/wire NeMo, edit `.env`, touch `data/*.db`, touch `data/backups`, create extra goal logs,
  commit, or add secrets.

## Goal 7.12 Gate Result

Goal 7.12 - Make Start Run a Real Product Execution is complete.

Completed:

- `Start Run` visibly changes to `Running...` and plays through the Function Studio execution path.
- Judge Demo Mode is the default safe local mode and works without real secrets.
- Demo mode records deterministic Hermes planning proof, Stripe test-double/sandbox finance proof,
  local policy decisions, ledger entries, agent outputs, and final profit outcome in SQLite.
- Full Proof Mode remains available through `SCALEX_EXECUTION_MODE=full_proof` for configured real
  isolated Hermes and real Stripe test mode, with visible integration errors when misconfigured.
- Runs, Evidence Ledger, Integrations, Dashboard, and Function Studio all reflect the latest run.
- Evidence Drawer proof covers Hermes Plan, Stripe Finance Proof, Guardrail Review, Blocked Risk,
  Evidence Ledger, and Profit Outcome.
- Stripe `paid=false` is still not shown as paid, and demo/test-double output is not claimed as
  real Stripe or real Hermes.
- Northstar remains synthetic with no patient data, no PHI, no HIPAA claim, local policy active
  now, NeMo Guardrails planned/not wired, no live-money support, and no production auth claim.

## Goal 7.11D Gate Result

Goal 7.11D - Demo Polish / Visual Consistency Pass is complete as the final pre-Goal-8 UI
consistency pass.

- Unified the shell, Dashboard, login, logout, Function Studio, and secondary pages around the
  lighter ClientOps operation-file visual language.
- Kept Dashboard business-first with the Northstar operation brief, outcome rail, operating stack,
  template shelf, and small proof route footer.
- Polished Function Studio without replacing the working map: added the operation fact strip,
  clearer `Function Studio` / `Function Map` / `Evidence Drawer` language, readable step rows,
  and business-readable proof labels.
- Polished Onboarding, Client Operations, Runs, Evidence Ledger, Integrations, and Settings enough
  for a smooth demo path without adding fake functionality.
- Preserved login/logout, Northstar selection, onboarding save/select, Start Run, selected step
  Evidence Drawer behavior, Runs, Evidence Ledger, Integrations, and Settings.
- Preserved truthfulness: Northstar is synthetic, no patient data, no PHI, no HIPAA claim, local
  policy active now, NeMo planned/not wired, Stripe is not paid unless `paid=true`, no live-money
  support, and no production auth claim.
- Did not implement Goal 8, wire real NeMo, run Stripe API calls, run Hermes model calls, edit
  `.env`, touch `data/*.db`, touch `data/backups`, create extra goal logs, commit, or change
  Northstar economics.
- Verified with `./scripts/test.sh`, `npm run build` in `frontend/`, `git diff --check`, strict
  tracked-file secret scan, staged-artifact checks, and auth-enabled browser QA including Start Run
  on backend `8787` / frontend `5174`.

## Goal 7.11C Gate Result

Goal 7.11C - ClientOps Function Studio Visual Pass is complete after the follow-up pass replaced
the old card-dashboard shell with a ClientOps product workspace.

- Replaced the old Dashboard card-grid console with a business landing page for one revenue-backed
  Northstar Dental Group / Client Implementation Launch operation.
- Added the hero operation brief with `Open Function Studio` and `Review Evidence Ledger` CTAs.
- Added the business outcome strip: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
  risk, $7,350 protected gross profit, and 86.5% protected margin.
- Added the ClientOps operating stack: Hermes plans the operation, Stripe provides finance proof,
  Guardrails review spend/risk, SQLite records evidence, and Profit Outcome reports the result.
- Added the function templates section with Implemented: Client Implementation Launch and Planned:
  Invoice-to-Cash, Vendor Spend Approval, Client Onboarding, Research-to-Report, Ops Handoff,
  and Renewal Recommendation.
- Moved payment state, policy state, SQLite state, raw invoice IDs, database paths, and detailed
  counts lower or into Evidence Ledger / Integrations.
- Added shared workspace primitives for operation pages, operation hero, outcome rail, operation
  timeline, template shelf, proof routes, empty workspace states, and plain tables.
- Reworked Function Studio into a business-readable workspace with operation brief, Function Map,
  Evidence Drawer, and activity timeline.
- Reworked Onboarding into Configure Client Implementation Launch, Client Operations into Client
  Operation Files, Runs into Execution History, Evidence Ledger into grouped evidence,
  Integrations into Operating Stack, and Settings into Boundaries & Runtime.
- Preserved Stripe honesty: invoice is not paid unless `paid=true`.
- Preserved local policy active now / real NeMo Guardrails planned and not wired.
- Did not add fake live-money support, real customer workflow claims, real NeMo claims, live Stripe
  calls, real Hermes model calls, `.env` edits, or `data/*.db` changes.
- Verified with `./scripts/test.sh`, `npm run build` in `frontend/`, `git diff --check`, strict
  tracked-file secret scan, staged-artifact checks, and auth-enabled browser QA including Start Run
  on backend `8793` / frontend `5180`.

## Goal 8 Sequence

Goal 8 is the governed autonomy and sandbox boundary. Goal 8A, Goal 8B, and Goal 8C are complete
for the NeMo Guardrails adapter path. Goal 7.15A corrected the roadmap: actual NVIDIA NemoClaw /
OpenShell / `nemohermes` is a separate target and must be handled before MCP.

### Goal 8A - NeMo Guardrails Preflight / Architecture Audit

- Complete.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect the current local policy engine and SQLite audit schema.
- Determine the safest practical path to wire the NeMo Guardrails adapter into this repo.
- If the adapter is blocked before submission, document the blocker, temporary fallback, and
  remaining work.
- Produced the exact Goal 8B implementation prompt.
- Preserved product-mode truthfulness: local policy is active now and the NeMo Guardrails adapter
  is optional only after runtime verification.

### Goal 8B - Guardrail Adapter + Schema/API

- Complete. Adapter boundary, modes, persistence, API state, UI proof, and setup/check scripts are
  implemented.

### Goal 8C - Guardrail Execution Rails in Run Lifecycle

- Complete. Added pre-action guardrail checks around input, Hermes/deterministic plan sequence,
  Stripe finance requests, revenue and spend ledger actions, blocked-spend consistency, and final
  report honesty.
- Persisted NeMo-style input, planning, execution, and output rail decisions as `allow`, `warn`,
  `block`, or `fail_closed`.
- Preserved Judge Demo Mode and Full Proof compatibility.

### Goal 8D - Actual NemoClaw / NemoHermes Preflight

- Complete as external/local runtime validation context for Goal 8E.
- Inspect actual NemoClaw / OpenShell / `nemohermes` prerequisites.
- Preserve the recorded probe unless revalidated: `nemoclaw`, `nemohermes`, `openshell`, and
  Docker missing/not usable; `node` v22.22.2, `npm` 10.9.7, `zstd`, and `strings` present.
- Treat Docker carefully because Docker group access has root-level impact on Linux.
- Account for Fedora laptop risk against the Ubuntu 24.04 primary validated path in NemoClaw docs.
- Do not install or run NemoClaw unless a later goal explicitly authorizes it.
- Produce a safe Goal 8E wiring prompt if practical.
- Do not touch production Hermes, Prometheus, xScaleOS, Recall, homelab OpenClaw, real client
  systems, live money, `.env`, secrets, or data files.

### Goal 8E - Wire ScaleX to NemoClaw Hermes Runtime If Safe

- Complete: ScaleX now routes to the already validated local NemoHermes API when
  `HERMES_RUNTIME=nemoclaw` is selected.
- Keep Judge Demo Mode safe without NemoClaw.
- Keep the existing Full Proof local path working.
- Implemented `HERMES_MODE=nemohermes_api` or `HERMES_RUNTIME=nemoclaw`,
  `HERMES_API_BASE_URL=http://127.0.0.1:8642/v1`, and
  `NEMOCLAW_SANDBOX_NAME=scalex-hermes`.
- Fail closed if NemoClaw is selected but unavailable.
- Do not claim NemoHermes was used unless the selected local API call succeeded.

### Goal 8F - Telegram Human Approval Gate

- Implement Telegram as a human approval channel for risky actions, not as a chatbot-first feature.
- Create pending approval requests, send authorized Telegram approval messages, verify approve/deny
  decisions, resume or block actions, and record evidence.
- Require allowlisted chat IDs, no secrets, no PHI/patient data, signed one-time approval token or
  approval ID, expiry, deny/expired fail-closed behavior, policy re-check before execution, and
  evidence for every approval/denial.
- Block outright instead of approval-routing for PHI/patient data, live-money attempts, disallowed
  real client data, direct secret exposure, and policy bypass attempts.

### Goal 7.15B - Product Depth + Demo-Winning UI Pass

- Make the UI feel like a repeatable enterprise ClientOps product, not one hardcoded Northstar
  workflow.
- Improve local demo auth, Command Center hero, Operation Catalog, Policy / Risk Library, run-story
  timeline, Evidence Ledger drill-down, guardrail proof, Stripe proof honesty, Connection Hub
  polish, and the 90-second recording path.

## Required Product Facts To Preserve

- ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.
- Connection Hub is an internal ScaleX product layer for allowed systems, modes, guardrails, and
  evidence duties; it is not the product itself.
- MCP is a future access pattern only; ScaleX does not currently expose an MCP server.
- ScaleX must not be positioned as a generic MCP platform, connector marketplace, integration
  dashboard, Zapier/n8n clone, developer tool first, or AI agent playground.
- The demo video should be product usage in the browser.
- Hosted judge demo mode must be safe and must not expose secrets.
- Local full-proof mode can use ignored `.env` values for real isolated Hermes and Stripe test mode.
- Product mode is real-integration-first.
- Product-mode integration failures show visible errors instead of silently falling back.
- Mock/fallback/test-double paths are for tests, CI, offline development, or explicitly labeled diagnostics only.
- Northstar Dental Group / Client Implementation Launch is the current implemented sample.
- Harbor Fleet Services is historical only, not the current demo sample.
- Auth remains local prototype auth unless a future explicit production auth milestone is defined.
- Workflow/customer management remains local/sample workflow management and not full multi-tenant SaaS.
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for guardrails, spend policy, payment actions, ledger writes, and reports.
- SQLite remains the evidence ledger.
- Local policy is active now.
- Guardrail mode defaults to `local_policy`; Judge Demo Mode does not require NeMo.
- Real NVIDIA NeMo Guardrails is available only through optional `nemo_guardrails` mode when
  `SCALEX_NEMO_PYTHON` runtime verification passes.
- Optional NVIDIA NemoClaw / OpenShell / `nemohermes` routing is wired behind
  `HERMES_RUNTIME=nemoclaw`, but it is not active by default.
- `nemo_compatible` is a labeled fallback only and must not claim real NeMo.
- Telegram approval is planned and not implemented yet.
- Stripe live-money execution is not implemented until a future Verified Live Mode milestone.

## Preserved Later Milestones

Goal 7.13C - MCP Server Prototype after the NemoClaw runtime boundary, guardrail boundary,
Telegram approval boundary, and product story are clear. Start with read-only/resource-style tools
where possible; no live-money tools, no real client data, no PHI, no secret exposure, and no
policy/guardrail/approval bypass.

Goal 9 - Final polish and submission assets.

Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Verified Live Mode must require explicit config, live-key/test-key separation, operator
confirmation phrase, maximum live charge cap, customer allowlist, pre-charge review,
policy approval, and SQLite audit records. Hermes may propose a live-money step, but
ScaleX code must enforce every safeguard and execute any allowed action.

## Do Not Work On Yet

- Goal 7.13C MCP Server Prototype before NemoClaw preflight, the approval-gate boundary, product
  story, and guardrail/tool boundary pass review.
- Additional NemoClaw installation/onboarding work; the current adapter must not modify NemoClaw
  itself.
- Live-money Stripe execution.
- Real client data.
- PHI or patient data.
- Real client email.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Complex auth.
- Multi-client SaaS dashboard.
- Production packaging.
