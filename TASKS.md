# TASKS - ScaleX

## Current Priority

Goal 8A - NeMo Guardrails Preflight / Architecture Audit.

## Goal 7.10 Gate Result

Goal 7.10 - Product Functionality Readiness / Browser Demo Gate is complete.

- The app is usable as a browser product flow before Goal 8 implementation.
- Auth, workflow/customer management, selected-workflow runs, connected canvas, node inspector,
  secondary views, and logout were verified on a temp auth-enabled QA instance.
- The browser-only recording path completed in under 3 minutes.
- Small UI copy fixes now say local policy is active and NeMo Guardrails is planned/not wired yet.
- No Goal 8 implementation, NeMo install, live-money support, `.env` edit, Stripe API call, or Hermes model call was made.

## Next Recommended Goal

Run Codex `/goal` 8A as a read-only preflight before any Goal 8 implementation:

- inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available
- inspect the current local policy engine and SQLite audit schema
- decide whether real NVIDIA NeMo Guardrails is safely available for this repo
- preserve product-mode integration truthfulness: local policy is active now; real NeMo is not wired yet
- produce the exact implementation prompt for Goal 8B

Goal 7.9 is complete. Goal 8 is now planned as a governed-autonomy milestone, not a single broad
NemoClaw/policy task.

## Goal 8 Sequence

### Goal 8 - Governed Autonomy Layer with NVIDIA NeMo Guardrails

ScaleX turns repeatable enterprise functions into autonomous, governed workflows. Goal 8 should make
that stack identity explicit:

- Hermes plans and routes autonomous work.
- Stripe executes finance/invoice/payment primitives in test mode now.
- NVIDIA NeMo Guardrails, or a NeMo-compatible local adapter, validates autonomous workflow actions.
- SQLite records guardrail proof and audit evidence.
- Policy/profit rules enforce safe business outcomes.

Do not claim real NeMo Guardrails unless it is installed, wired, tested, and documented. Until then,
use "local policy active" or "NeMo-compatible guardrail adapter planned."

### Goal 8A - NeMo Guardrails Preflight / Architecture Audit

- Read-only.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect the current local policy engine.
- Decide whether real NeMo Guardrails is safely available.
- Produce the exact Goal 8B implementation prompt.

### Goal 8B - Guardrail Adapter + Schema/API

- Add a guardrail adapter boundary with modes:
  - `local_policy`
  - `nemo_guardrails`
  - `nemo_compatible`
- Add guardrail evaluation persistence if needed.
- Add API state for guardrail mode/status/proof.
- Keep local policy deterministic for tests.

### Goal 8C - Guardrail Execution Rails in Run Lifecycle

- Add pre-action guardrail checks around onboarding/workflow input, Hermes plan/tool sequence,
  Stripe finance action request, spend approval/block, and agent deliverables/final report.
- Map checks to NeMo-style rails:
  - input rail
  - planning/dialog rail
  - execution rail
  - output rail
- Fail closed on guardrail errors in product mode.

### Goal 8D - Guardrail Proof UI in Workflow Canvas

- Add or enhance Workflow nodes and inspector proof for NeMo Guardrail Gate, local policy
  fallback/test support, fail-closed status, blocked action proof, and rule evidence.
- Do not claim real NeMo unless verified.

### Goal 8E - Enterprise Function Template Positioning + Recording Proof

- Make the product story show ScaleX as an enterprise function framework.
- Keep Service Campaign Launch as implemented.
- Present future templates honestly:
  - Invoice-to-Cash
  - Vendor Spend Approval
  - Client Onboarding
  - Research-to-Report
  - Ops Handoff
  - Renewal Recommendation
- Update demo/submission docs and browser recording path.

## Why This Is Next

Goal 6 is complete: product mode uses the real ScaleX-isolated Hermes Agent with the
`scalex-operator` skill and `skills` toolset.

Goal 7 is complete: product mode creates and finalizes real Stripe test-mode invoices
when a local `sk_test_...` key is configured. Stripe remains `livemode=false`, and the UI
must not claim the invoice is paid unless Stripe reports `paid=true`.

Goal 7.7 is complete: ScaleX has local prototype auth, local/sample onboarding, product
navigation, a moving workflow map, run history, audit, and integrations views.

Goal 7.8 is complete: ScaleX can create/select/delete saved local workflows, load the Harbor
sample, run the selected workflow, inspect clickable workflow graph nodes, view persisted run
history, load historical run proof by run ID, and review Audit, Integrations, and Settings without
terminal output.

Goal 7.9A through Goal 7.9E are complete: ScaleX now has a browser-usable product shell with
Dashboard, Onboarding, Customers, Workflow, Runs, Audit, Integrations, Settings, a connected
Workflow canvas, selected-node inspector, repositionable nodes on a fixed canvas background,
secondary-view cleanup, and browser-only QA through logout.

Goal 8A is next because the real guardrail target must be audited before any adapter, schema,
run-lifecycle, or UI work is implemented.

## Required Product Facts To Preserve

- ScaleX turns repeatable enterprise functions into autonomous, governed workflows.
- The demo video should be product usage in the browser.
- Hosted judge demo mode must be safe and must not expose secrets.
- Local full-proof mode can use ignored `.env` values for real isolated Hermes and Stripe test mode.
- Product mode is real-integration-first.
- Product-mode integration failures show visible errors instead of silently falling back.
- Mock/fallback/test-double paths are for tests, CI, offline development, or explicitly labeled diagnostics only.
- Harbor Fleet Services remains the first enterprise-function template, not the whole product.
- Auth remains local prototype auth unless a future explicit production auth milestone is defined.
- Workflow/customer management remains local/sample workflow management and not full multi-tenant SaaS.
- Invoice remains $1,200 for Harbor.
- Approved spend remains $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend remains $750 Premium Automation Suite.
- Margin floor remains 50%.
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for guardrails, spend policy, payment actions, ledger writes, and reports.
- SQLite remains the audit ledger.
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
