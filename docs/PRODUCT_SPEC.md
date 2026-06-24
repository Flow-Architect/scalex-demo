# ScaleX ClientOps Autopilot Product Spec

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

## Product Standard

ScaleX proves a real client-operations loop: intake a repeatable client operation, route the work
through Hermes, create finance proof through Stripe test mode, approve only policy-safe spend,
coordinate agent work, record evidence, and produce a protected-profit report.

Product mode is real-integration-first. Test doubles are for automated tests, CI, offline
development, or explicitly labeled diagnostics. Product-mode integration failures must become
visible error states.

## Problem Statement

B2B teams struggle to turn signed client work into coordinated execution because onboarding,
billing, vendor spend, approvals, task routing, and reporting are fragmented. ScaleX gives them a
governed AI operations layer that can run those functions safely.

## Implemented Today

- Local FastAPI backend and Vite React product shell.
- Local prototype auth gate.
- SQLite-backed local/sample customer and operation management with Northstar Dental Group defaults.
- Product navigation for Dashboard, Studio, Onboarding, Customers, Runs, Audit, Integrations, and Settings.
- Connected Function Studio page for the autonomous run, with approved setup spend and blocked risk branches.
- Right selected-node inspector for Run Summary, Client Operation Intake, Hermes, Stripe, Payment
  Status, Guardrail Review, Spend, Work Units, SQLite Audit, and Profit Outcome proof.
- Selected workflow runs where customer, job, invoice amount, spend cap, margin floor, and vendor
  lists drive Stripe amount, policy math, ledger totals, and final report.
- Persisted run history with historical proof inspection by run ID.
- Real isolated Hermes Agent planning through a ScaleX `scalex-operator` skill.
- Orchestration audit trail for proposed and executed ScaleX tool sequence.
- SQLite evidence ledger for jobs, events, Stripe records, ledger entries, policy checks, agent outputs, and reports.
- Local policy engine that blocks unsafe spend before it reaches the ledger.
- Real Stripe test-mode customer and finalized invoice records through orchestration for Goal 7,
  with `invoice_status` and `paid` displayed honestly.
- Stripe test-double payment records for tests and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs for reliability.

## Current Template

Implemented today:

- Template: Client Implementation Launch
- Sample account: Northstar Dental Group
- Synthetic data boundary: multi-location client account for B2B implementation operations only;
  no patient data, no PHI, no healthcare compliance claim, and no HIPAA support claim.
- Story: a multi-location client purchased an implementation package. ScaleX launches the
  client operation, confirms revenue, creates finance proof, checks business rules, blocks risky
  spend, coordinates work units, records evidence, and reports protected profit and launch status.
- Numbers: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, 86.5% protected margin, and a 50% margin floor.
- Harbor Fleet Services is historical only and is no longer the current implemented sample.

Future templates, not implemented:

- Invoice-to-Cash
- Vendor Spend Approval
- Client Onboarding
- Research-to-Report
- Ops Handoff
- Renewal Recommendation

## Target Integrations

- Hermes = planning and routing the client operation.
- Stripe = finance proof / invoice / payment state.
- ScaleX = execution and policy authority.
- Local policy now = spend, margin, vendor, and payment-before-spend enforcement.
- NeMo Guardrails planned = governed autonomy layer after Goal 8.
- SQLite = evidence ledger.
- Profit Outcome = protected profit and blocked risk result.

## Boundaries

Live-money payments, real client data, production Hermes, production Prometheus,
homelab/OpenClaw, Recall memory, production auth, hosted secret exposure, and production SaaS
features are out of scope. Local/sample workflow management demonstrates the product path;
production multi-client onboarding is future work. Future live-money payments require Verified
Live Mode. Real NeMo Guardrails is not wired yet.
