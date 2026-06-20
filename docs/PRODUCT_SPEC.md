# ScaleX Product Spec

ScaleX is a live working product-style prototype for profit-aware agent operations in service workflows.

## Product Standard

ScaleX proves a real business operating loop: intake a paid service workflow, plan the work,
confirm payment through the appropriate real integration mode, approve only margin-safe spend,
coordinate agent work, and produce an audit-backed profit report.

Product mode is real-integration-first. Test doubles are for automated tests, CI, offline
development, or explicitly labeled diagnostics. Product-mode integration failures must become
visible error states.

The Harbor Fleet Services fleet brake inspection campaign is the sample run, not the whole product. It uses synthetic data with a $1,200 invoice, $300 spend cap, 50% margin floor, $187 approved spend, one blocked $750 spend request, and a final report showing $1,013 gross profit and about 84.4% margin.

## Implemented Today

- Local FastAPI backend and Vite React dashboard.
- Real isolated Hermes Agent planning through a ScaleX `scalex-operator` skill.
- Orchestration audit trail for the proposed and executed ScaleX tool sequence.
- SQLite audit ledger for jobs, events, Stripe records, ledger entries, policy checks, agent outputs, and reports.
- Local policy engine that blocks unsafe spend before it reaches the ledger.
- Real Stripe test-mode customer and invoice records through orchestration for Goal 7.
- Stripe test-double payment records for tests and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs for reliability.

## Target Integrations

- NemoClaw or a NemoClaw-style policy safety adapter for spend governance, with the current local policy engine as deterministic test/diagnostic support.
- Future Verified Live Mode for live-money Stripe capability.

## Boundaries

Goal 7 live-money payments, real client data, production Hermes, production Prometheus,
homelab/OpenClaw, Recall memory, and production SaaS features are out of scope. Future
live-money payments require Verified Live Mode.
