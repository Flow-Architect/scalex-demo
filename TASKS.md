# TASKS - ScaleX ClientOps Autopilot

## Current Priority

Goal 7.12 - Make Start Run a Real Product Execution.

Goal 7.11D is complete after the final demo polish / visual consistency pass. Goal 7.12 is the
next functionality/demo-proof pass before Goal 8A. Goal 8A remains intact and should run after
Goal 7.12 unless the plan changes.

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
  - NeMo Guardrails is planned after Goal 8 and is not wired yet.
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
- Real NeMo Guardrails remains planned and not wired yet.
- Goal 8 was not implemented.
- Live-money support was not added.

## Next Recommended Goal

Run Codex `/goal` 7.12:

- Make `Start Run` visibly execute the Northstar Dental Group / Client Implementation Launch from
  run started through Hermes planning, Stripe finance proof, guardrail review, approved setup
  spend, blocked risk, work execution, evidence ledger, and profit outcome.
- Add or verify visible running/loading state, step progression, Function Map state highlights,
  meaningful Evidence Drawer updates, Runs history creation, Evidence Ledger proof creation,
  Dashboard latest-run status, count changes, and actionable failure states.
- Support Judge Demo Mode without secrets using deterministic local proof/test-double paths that
  create local SQLite records and clearly label demo/sandbox proof.
- Preserve Full Proof Mode for safely configured real isolated Hermes and real Stripe test mode.
- Do not implement Goal 8, install or wire NeMo, change Northstar economics, add live-money
  support, or claim production auth. Real-adapter checks belong only in explicit Full Proof Mode
  verification with safe local configuration.

## Goal 7.12 Planned Gate

Goal 7.12 - Make Start Run a Real Product Execution is planned as the next implementation pass.
It is not implemented yet.

Required visible execution sequence:

- Run started.
- Hermes planning step.
- Stripe finance proof step.
- Guardrail review step.
- Approved setup spend step.
- Blocked risk step.
- Work execution step.
- Evidence ledger step.
- Profit outcome step.
- Run completed, or clearly failed with an actionable reason.

Required product outcomes:

- `Start Run` shows a visible running/loading state.
- Function Studio shows step progression.
- Function Map highlights pending, running, complete, and blocked states.
- Evidence Drawer updates with meaningful proof.
- Runs gets a new execution.
- Evidence Ledger gets timeline, orchestration, ledger, Stripe, and policy proof.
- Dashboard reflects latest run status.
- Counts change from zero when a run completes.
- Failure states are visible and actionable.

Execution modes to preserve:

- Judge Demo Mode works without secrets, uses deterministic local proof/test-double paths, creates
  local SQLite records, populates Runs and Evidence Ledger, labels output as demo/sandbox proof,
  and does not claim real Stripe or real Hermes unless real adapters were used.
- Full Proof Mode uses real isolated Hermes and real Stripe test mode when local ignored `.env`
  values are safely configured, keeps Stripe `livemode=false`, shows hosted invoice URLs only when
  available, never labels `paid=false` as paid, and shows visible integration errors if configured
  incorrectly.

Truthfulness boundaries:

- Northstar is synthetic.
- No patient data, no PHI, no HIPAA claim.
- Local policy is active now.
- NeMo Guardrails remains planned/not wired.
- No live-money support.
- No production auth claim.
- Demo mode must not pretend to be real integration mode.

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

Goal 8 remains planned as the governed autonomy layer after Goal 7.12. Do not start Goal 8A,
8B, 8C, 8D, or 8E before Goal 7.12 is complete. Do not start Goal 8B, 8C, 8D, or 8E before
Goal 8A is complete.

### Goal 8A - NeMo Guardrails Preflight / Architecture Audit

- Read-only.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect the current local policy engine and SQLite audit schema.
- Decide whether real NeMo Guardrails is safely available.
- Produce the exact Goal 8B implementation prompt.
- Preserve product-mode truthfulness: local policy is active now; real NeMo is not wired yet.

### Goal 8B - Guardrail Adapter + Schema/API

- Add a guardrail adapter boundary with modes:
  - `local_policy`
  - `nemo_guardrails`
  - `nemo_compatible`
- Add guardrail evaluation persistence if needed.
- Add API state for guardrail mode/status/proof.
- Keep local policy deterministic for tests.

### Goal 8C - Guardrail Execution Rails in Run Lifecycle

- Add pre-action guardrail checks around onboarding/input, Hermes plan/tool sequence, Stripe
  finance action request, spend approval/block, agent deliverables, and final report.
- Map checks to NeMo-style input, planning/dialog, execution, and output rails.
- Fail closed on guardrail errors in product mode.

### Goal 8D - Guardrail Proof UI in Workflow Canvas

- Add or enhance proof for NeMo Guardrail Gate, local policy support, fail-closed status, blocked
  action evidence, and rule evidence.
- Do not claim real NeMo unless verified.

### Goal 8E - Enterprise Function Template Positioning + Recording Proof

- Keep ScaleX positioned as ClientOps Autopilot / Enterprise Function Accelerator.
- Present implemented and future templates honestly.
- Update demo/submission docs and browser recording path after implementation changes.

## Required Product Facts To Preserve

- ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.
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
- Real NeMo Guardrails is not wired yet.
- Stripe live-money execution is not implemented until a future Verified Live Mode milestone.

## Preserved Later Milestones

Goal 9 - Final polish and submission assets.

Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Verified Live Mode must require explicit config, live-key/test-key separation, operator
confirmation phrase, maximum live charge cap, customer allowlist, pre-charge review,
policy approval, and SQLite audit records. Hermes may propose a live-money step, but
ScaleX code must enforce every safeguard and execute any allowed action.

## Do Not Work On Yet

- Goal 8A before Goal 7.12 is complete.
- Goal 8B, 8C, 8D, or 8E implementation before Goal 8A is complete.
- Live-money Stripe execution.
- Real client data.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Complex auth.
- Multi-client SaaS dashboard.
- Production packaging.
