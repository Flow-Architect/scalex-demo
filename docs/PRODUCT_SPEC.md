# ScaleX Product Spec

ScaleX is a live working product-style prototype for profit-aware agent operations in service workflows.

## Product Standard

ScaleX proves a real business operating loop: intake a revenue-backed service workflow, plan the work,
confirm payment through the appropriate real integration mode, approve only margin-safe spend,
coordinate agent work, and produce an audit-backed profit report.

Product mode is real-integration-first. Test doubles are for automated tests, CI, offline
development, or explicitly labeled diagnostics. Product-mode integration failures must become
visible error states.

The Harbor Fleet Services fleet brake inspection campaign is the sample run, not the whole product. It uses synthetic data with a $1,200 invoice, $300 spend cap, 50% margin floor, $187 approved spend, one blocked $750 spend request, and a final report showing $1,013 gross profit and about 84.4% margin.

## Implemented Today

- Local FastAPI backend and Vite React product shell.
- Local prototype auth gate for the operator console.
- SQLite-backed local/sample customer and workflow management with Harbor Fleet Services defaults.
- Product navigation for Workflow, Customers, Runs, Audit, and Settings / Integrations.
- Clickable workflow graph for the autonomous run, with approved/proceed and blocked spend branches.
- Selected workflow runs where customer, job, invoice amount, spend cap, margin floor, and vendor lists drive Stripe amount, policy math, ledger totals, and final report.
- Persisted run history with historical proof inspection by run ID.
- Real isolated Hermes Agent planning through a ScaleX `scalex-operator` skill.
- Orchestration audit trail for the proposed and executed ScaleX tool sequence.
- SQLite audit ledger for jobs, events, Stripe records, ledger entries, policy checks, agent outputs, and reports.
- Local policy engine that blocks unsafe spend before it reaches the ledger.
- Real Stripe test-mode customer and finalized invoice records through orchestration for Goal 7, with `invoice_status` and `paid` displayed honestly.
- Stripe test-double payment records for tests and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs for reliability.
- Goal 7.8 functional product workflow with first-viewport live workflow claim, Profit Protected outcome panel, Live Stack Proof, clickable workflow map, staged execution replay, Customers workflow manager, Runs history, Audit proof, and Settings / Integrations.

The intended recording flow is product usage, not a static card walkthrough: open ScaleX,
log in, create or select a local sample workflow, review workflow and money rules, start the
selected workflow run, watch the graph move, click Hermes/Stripe/Policy/Report proof nodes,
review blocked spend, inspect Audit, and return to Runs history.

## Target Integrations

- NemoClaw or a NemoClaw-style policy safety adapter for spend governance, with the current local policy engine as deterministic test/diagnostic support.
- Future Verified Live Mode for live-money Stripe capability.

## Boundaries

Live-money payments, real client data, production Hermes, production Prometheus,
homelab/OpenClaw, Recall memory, production auth, hosted secret exposure, and production
SaaS features are out of scope. Local/sample workflow management demonstrates the product path;
production multi-client onboarding is future work. Future live-money payments require
Verified Live Mode.
