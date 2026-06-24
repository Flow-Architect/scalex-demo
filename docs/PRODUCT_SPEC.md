# ScaleX Product Spec

ScaleX is a live working product-style prototype for turning repeatable enterprise functions into autonomous, governed workflows.

## Product Standard

ScaleX proves a real enterprise-function operating loop: intake a repeatable workflow, route the
work through Hermes, execute finance primitives through the appropriate Stripe test-mode path,
approve only margin-safe spend, coordinate agent work, and produce an audit-backed profit report.

Product mode is real-integration-first. Test doubles are for automated tests, CI, offline
development, or explicitly labeled diagnostics. Product-mode integration failures must become
visible error states.

The Harbor Fleet Services fleet brake inspection campaign is the sample run, not the whole product. It uses synthetic data with a $1,200 invoice, $300 spend cap, 50% margin floor, $187 approved spend, one blocked $750 spend request, and a final report showing $1,013 gross profit and about 84.4% margin.

## Implemented Today

- Local FastAPI backend and Vite React product shell.
- Local prototype auth gate for the operator console.
- SQLite-backed local/sample customer and workflow management with Harbor Fleet Services defaults.
- Product navigation for Dashboard, Workflow, Onboarding, Customers, Runs, Audit, Integrations, and Settings.
- Connected Workflow canvas for the autonomous run, with approved/proceed and blocked spend branches.
- Right selected-node inspector for Run Summary, Customer Intake, Hermes, Stripe, Payment Status, Policy, Spend, Agent Work, SQLite Audit, and Profit Report proof.
- Selected workflow runs where customer, job, invoice amount, spend cap, margin floor, and vendor lists drive Stripe amount, policy math, ledger totals, and final report.
- Persisted run history with historical proof inspection by run ID.
- Real isolated Hermes Agent planning through a ScaleX `scalex-operator` skill.
- Orchestration audit trail for the proposed and executed ScaleX tool sequence.
- SQLite audit ledger for jobs, events, Stripe records, ledger entries, policy checks, agent outputs, and reports.
- Local policy engine that blocks unsafe spend before it reaches the ledger.
- Real Stripe test-mode customer and finalized invoice records through orchestration for Goal 7, with `invoice_status` and `paid` displayed honestly.
- Stripe test-double payment records for tests and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs for reliability.
- Goal 7.9 complete product UX with connected canvas, selected-node inspector, compact proof access, aligned secondary views, browser QA, Stripe open/unpaid honesty, and local-policy/NeMo-not-wired honesty.

The intended recording flow is product usage rather than a passive proof-panel tour: open ScaleX,
log in, create or select a local sample workflow, review workflow and money rules, start the
selected workflow run, watch the connected canvas move, click Hermes/Stripe/Policy/Report proof nodes,
review blocked spend, inspect Audit, and return to Runs history.

## Goal 7.9 UX State

Goal 7.9 is complete as the Workflow Canvas Product UX Redesign before Goal 8. Goal 7.9A
completed the UX blueprint, Goal 7.9B completed the app shell foundation, Goal 7.9C replaced
the main Workflow page with the target canvas and inspector, Goal 7.9D aligned the secondary
views, and Goal 7.9E verified the browser-only recording path. The product model is:

- left navigation
- top command bar
- central workflow canvas
- right selected-node inspector
- Dashboard and Onboarding views
- separate Customers, Runs, Audit, Integrations, and Settings views

The Workflow page now serves as the product center for a business operations workflow
automation tool. The canvas shows Customer Intake, Hermes Brain, Stripe Test Invoice,
Payment Status, Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and
Profit Report. The inspector shows real proof for the selected node without requiring
terminal output or hidden context.

## Target Integrations

- Goal 8 - Governed Autonomy Layer with NVIDIA NeMo Guardrails:
  - Goal 8A read-only preflight / architecture audit.
  - Goal 8B guardrail adapter plus schema/API.
  - Goal 8C guardrail execution rails in the run lifecycle.
  - Goal 8D guardrail proof UI in the Workflow canvas.
  - Goal 8E enterprise-function template positioning and recording proof.
- NVIDIA NeMo Guardrails or a NeMo-compatible adapter is planned, not wired. Local policy remains active and deterministic for tests until a real adapter is verified.
- Future Verified Live Mode for live-money Stripe capability.

## Boundaries

Live-money payments, real client data, production Hermes, production Prometheus,
homelab/OpenClaw, Recall memory, production auth, hosted secret exposure, and production
SaaS features are out of scope. Local/sample workflow management demonstrates the product path;
production multi-client onboarding is future work. Future live-money payments require
Verified Live Mode.
