# ScaleX Product Spec

ScaleX is a working product-style prototype for profit-aware agent operations in service workflows.

## Product Standard

ScaleX proves a real business operating loop: intake a paid service workflow, plan the work, confirm payment, approve only margin-safe spend, coordinate agent work, and produce an audit-backed profit report.

The Harbor Fleet Services fleet brake inspection campaign is the sample run, not the whole product. It uses synthetic data with a $1,200 invoice, $300 spend cap, 50% margin floor, $187 approved spend, one blocked $750 spend request, and a final report showing $1,013 gross profit and about 84.4% margin.

## Implemented Today

- Local FastAPI backend and Vite React dashboard.
- Real isolated Hermes Agent planning through a ScaleX `scalex-operator` skill.
- Orchestration audit trail for the proposed and executed ScaleX tool sequence.
- SQLite audit ledger for jobs, events, Stripe-shaped records, ledger entries, policy checks, agent outputs, and reports.
- Local policy engine that blocks unsafe spend before it reaches the ledger.
- Local fallback payment records for the sample Stripe-style customer, invoice, payment link, and payment confirmation.
- Deterministic Finance, Marketing, Research, and Ops outputs for reliability.

## Target Integrations

- Stripe test-mode invoice/payment objects through the orchestration layer.
- NemoClaw or a policy safety layer for spend governance, with the current local policy engine as fallback.

## Boundaries

Live payments, real client data, production Hermes, production Prometheus, homelab/OpenClaw, Recall memory, and production SaaS features are out of scope for the hackathon submission.
