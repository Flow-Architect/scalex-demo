# TASKS - ScaleX

## Current priority

Goal 7.9C - Workflow Canvas + Selected-Node Inspector.

## Next recommended goal

Run Codex `/goal` 7.9C to make the Workflow page the product center with:

- connected workflow canvas
- right selected-node inspector
- separate Approved Spend and Blocked Spend branches
- node-level proof for Hermes, Stripe test invoice, payment status, policy, spend, agents, SQLite audit, and Profit Report

Goal 7.9B completed the app shell/design foundation. Do not implement Goal 8 during 7.9C.

## Why this is next

Goal 6 is complete: product mode uses the real ScaleX-isolated Hermes Agent with the
`scalex-operator` skill and `skills` toolset.

Goal 7 is complete: product mode creates and finalizes real Stripe test-mode invoices
when a local `sk_test_...` key is configured. Stripe remains `livemode=false`, and the UI
must not claim the invoice is paid unless Stripe reports `paid=true`.

Goal 7.7 is complete: ScaleX has local prototype auth, local/sample onboarding, product
navigation, a moving workflow map, run history, audit, and integrations views.

Goal 7.8 is complete in this working tree: ScaleX can create/select/delete saved local
workflows, load the Harbor sample, run the selected workflow, inspect clickable workflow
graph nodes, view persisted run history, load historical run proof by run ID, and review
Audit, Integrations, and Settings without terminal output.

Goal 7.9A is complete as a read-only UX blueprint. Goal 7.9B is complete for app shell
extraction, navigation cleanup, shared selectors, and distinct Integrations and Settings
views. The remaining gap before Goal 8 is the main Workflow experience: it still uses the
current grid-based workflow map and stacked proof panels. Goal 7.9C should make the app
feel like a workflow automation/control-room product: canvas first and selected-node
inspector second.

## Goal 7.9 sequence

### Goal 7.9A - UX Blueprint / Product IA Audit

- Complete.
- No code.
- Inspect current UI and define the exact target layout.
- Identify duplicate proof panels, clutter, weak hierarchy, and unclear recording flow.
- Lock the target product model:
  - left navigation
  - top command bar
  - central workflow canvas
  - right selected-node inspector
  - separate Customers, Runs, Audit, Integrations, and Settings views
- Output exact implementation prompts for Goals 7.9B, 7.9C, 7.9D, and 7.9E.

### Goal 7.9B - Design System + App Shell Foundation

- Complete.
- Clean the visual foundation before moving nodes around.
- Establish a consistent dark command-center theme.
- Create reusable layout primitives only if useful.
- Ensure sidebar, top bar, cards, inspector, and node styles are consistent.
- Reduce `App.tsx` complexity only if safe.
- Preserve functionality.
- Completed output:
  - shell extracted into `frontend/src/layout/*`
  - reusable status style helpers in `frontend/src/components/ui/*`
  - shared selectors in `frontend/src/lib/demoSelectors.ts`
  - distinct Integrations and Settings views

### Goal 7.9C - Workflow Canvas + Selected-Node Inspector

- Next.
- Make the Workflow page the product center.
- Replace stacked proof panels with a connected workflow canvas.
- Use nodes for Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status,
  Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report.
- Clicking nodes changes the right inspector.
- The inspector shows real proof for the selected node.
- Approved and blocked branches are visually obvious.
- Preserve real Hermes, Stripe test-mode, SQLite, and local policy proof.

### Goal 7.9D - Customers / Runs / Audit / Integrations Cleanup

- Customers: create/select/delete local workflow, prominent Harbor sample, obvious selected workflow.
- Runs: prior runs list, selected run details, run proof summary.
- Audit: timeline, orchestration calls, ledger, Stripe events, policy checks.
- Integrations: Hermes status, Stripe test-mode status, SQLite ledger, local policy, and NemoClaw Goal 8 next.
- Settings: prototype auth, local API/database status, active workflow/run records, and safety boundaries.
- No placeholder-only tabs.

### Goal 7.9E - Recording Readiness / Browser-Only Demo QA

- Support the browser-only recording path:
  1. Login.
  2. Select or create workflow.
  3. Start run.
  4. Watch graph nodes progress.
  5. Click Hermes node.
  6. Click Stripe node.
  7. Click blocked spend node.
  8. Click Profit Report node.
  9. Open Runs.
  10. Open Audit.
  11. Open Integrations.
  12. Logout.
- Ensure no terminal output is needed in the video.
- Ensure every visible claim is real, test-mode, or honestly labeled future work.
- Update demo script and submission docs.

## Required outputs for Goal 7.9C

- Connected workflow canvas with the exact Goal 7.9 node set.
- Right selected-node inspector.
- Approved Spend and Blocked Spend shown as separate branches.
- Current proof panels collapsed or moved only where the inspector safely replaces them.
- Existing behavior preserved for auth, onboarding, workflow selection, selected-workflow runs, run history, Audit, Integrations, and Settings.
- Updates to STATUS.md, TASKS.md, and CHANGELOG.md at closeout.
- `git diff --check`.
- Tracked-file secret scan.
- `git status --short`.

## Goal 8 remains next after Goal 7.9

Goal 8 remains NemoClaw / policy safety integration and presentation.

After Goal 7.9, Goal 8 should:

- Keep Hermes planning/proposal authority separate from payment and policy execution.
- Keep Stripe Goal 7 behavior intact.
- Investigate whether a safe NemoClaw-compatible or NemoClaw-style adapter can be wired
  without touching production, homelab/OpenClaw, or real client systems.
- If a real safe adapter is available, route spend checks through it and persist audit records.
- If a real safe adapter is not available, keep the local policy engine but label it clearly.
- Preserve deterministic local policy support for automated tests.
- Preserve final Harbor economics: $1,200 revenue, $187 approved spend, $750 blocked spend,
  $1,013 gross profit, about 84.4% margin, and 0 policy violations.

## Required product facts to preserve

- ScaleX is a functional product prototype whose demo should be browser product usage.
- The demo video should be product usage in the browser.
- Hosted judge demo mode must be safe and must not expose secrets.
- Local full-proof mode can use ignored `.env` values for real isolated Hermes and Stripe test mode.
- Product mode is real-integration-first.
- Product-mode integration failures show visible errors instead of silently falling back.
- Mock/fallback/test-double paths are for tests, CI, offline development, or explicitly labeled diagnostics only.
- Harbor Fleet Services remains the sample workflow, not the whole product.
- Auth remains local prototype auth unless a future explicit production auth milestone is defined.
- Workflow/customer management remains local/sample workflow management and not full multi-tenant SaaS.
- Invoice remains $1,200 for Harbor.
- Approved spend remains $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend remains $750 Premium Automation Suite.
- Margin floor remains 50%.
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for spend policy, payment actions, ledger writes, and reports.
- SQLite remains the audit ledger.
- Local policy is active now.
- NemoClaw is not real yet.
- Stripe live-money execution is not implemented until a future Verified Live Mode milestone.

## Follow-up hardening milestone

Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Verified Live Mode must require explicit config, live-key/test-key separation, operator
confirmation phrase, maximum live charge cap, customer allowlist, pre-charge review,
policy approval, and SQLite audit records. Hermes may propose a live-money step, but
ScaleX code must enforce every safeguard and execute any allowed action.

## Do not work on yet

- Goal 8 implementation before Goal 7.9 is complete.
- Live-money Stripe execution.
- Real client data.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Complex auth.
- Multi-client dashboard.
- Production packaging.
