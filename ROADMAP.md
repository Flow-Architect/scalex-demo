# ScaleX ClientOps Autopilot Roadmap

> **Project path:** `/home/ascabrya/dev/scalex-demo/`
> **Product:** **ScaleX ClientOps Autopilot**
> **Category:** **Enterprise Function Accelerator**
> **Pitch:** ScaleX helps B2B teams turn repeatable client operations into autonomous, revenue-backed, policy-governed runs with finance proof, guardrail enforcement, and audit evidence.

## Product Identity

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

B2B teams struggle to turn signed client work into coordinated execution because onboarding,
billing, vendor spend, approvals, task routing, and reporting are fragmented. AI can suggest
next steps, but enterprises cannot safely let an agent execute client operations unless money,
spend, policy, and evidence are governed. ScaleX gives them a governed AI operations layer that
can run those functions safely.

Core buyers:

- B2B agencies
- SaaS implementation teams
- client success teams
- managed service providers
- operations teams
- finance operations teams
- AI transformation teams

Core use case:

- Revenue-backed client operations.

## Stack Mapping

```text
Client operation intake
-> Hermes/GPT-5.5 plans and routes the operation
-> Stripe provides finance proof through test invoice/payment state
-> ScaleX executes the run and enforces business rules
-> local policy active now checks spend, margin, vendors, and payment-before-spend
-> NeMo Guardrails planned after Goal 8 for governed autonomy
-> SQLite records evidence
-> Profit Outcome reports protected profit and blocked risk
```

ScaleX code is the execution and policy authority. Hermes may plan and propose steps, but
ScaleX enforces keys, modes, caps, allowlists, confirmations, guardrails, ledger writes, and
reports.

## Safety Rules

- Do not use live Stripe keys for Goal 7 work.
- Do not create live-money payments.
- Future live-money Stripe work is allowed only through documented Verified Live Mode.
- Do not use real client data.
- Do not connect to production Hermes, Windows Hermes config, Prometheus production data,
  homelab OpenClaw, Recall memory, or real customer systems.
- Do not commit secrets, `.env`, SQLite `.db` files, recordings, logs, node_modules, venvs, or build artifacts.
- Product mode is real-integration-first in the appropriate environment.
- Test doubles are for automated tests, CI, offline development, or explicitly labeled diagnostics.
- Product-mode integration failures must surface visible errors instead of silently falling back.
- Stripe invoices must not be called paid unless Stripe reports `paid=true`.
- Local policy is active now.
- Real NeMo Guardrails is planned, not wired yet.
- Do not claim real NeMo Guardrails or NemoClaw integration until installed, wired, tested, and documented.

## Implemented Today

The current code implements Northstar Dental Group / Client Implementation Launch.

Implemented current sample:

- Client/account: Northstar Dental Group
- Business type: Multi-location healthcare services group
- Template: Client Implementation Launch
- Implementation package revenue: $8,500
- Setup spend cap: $1,150
- Margin floor: 50%
- Approved setup spend: $350 Secure Workspace Pack, $500 Data Migration Sandbox, and $300 Launch Asset Kit
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Profit outcome: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, and 86.5% protected margin
- Synthetic account only; no patient data, no PHI, no healthcare compliance claim, and no HIPAA
  support claim

Harbor Fleet Services is historical only and is no longer the current implemented sample.

Implemented product surfaces:

- FastAPI backend
- SQLite evidence ledger at `data/scalex.db`
- Vite React TypeScript product shell
- local prototype auth
- SQLite-backed local/sample workflow records
- Dashboard, Onboarding, Customers, Studio, Runs, Audit, Integrations, and Settings
- connected Function Studio page with proof nodes and selected-node inspector
- isolated Hermes planning in product mode
- real Stripe test-mode invoice path when configured with `sk_test_...`
- local policy enforcement for spend, margin, vendors, and payment-before-spend
- deterministic test-double planning and Stripe events for tests/CI/diagnostics only

## Template Model

Implemented template:

- Template: Client Implementation Launch
- Sample account: Northstar Dental Group
- Story: Northstar Dental Group is a multi-location client that purchased an implementation
  package. ScaleX launches the client operation, confirms revenue through Stripe test invoice
  proof, lets Hermes plan onboarding and delivery, checks spend and vendor actions through local
  policy now and NeMo Guardrails later, approves safe setup spend, blocks risky spend, coordinates
  work units, records evidence, and reports protected profit and launch status.

Implemented demo numbers:

- Implementation package revenue: $8,500
- Approved setup spend:
  - Secure Workspace Pack: $350
  - Data Migration Sandbox: $500
  - Launch Asset Kit: $300
  - Total approved spend: $1,150
- Blocked risky spend:
  - Unapproved Data Broker Enrichment: $3,200
- Protected gross profit after approved spend: $7,350
- Protected margin: 86.5%
- Margin floor: 50%

Future template candidates, not implemented yet:

- Invoice-to-Cash
- Vendor Spend Approval
- Client Onboarding
- Research-to-Report
- Ops Handoff
- Renewal Recommendation

## Current Roadmap Sequence

Completed baseline:

- Goal 7.10 - Product Functionality Readiness / Browser Demo Gate
- Goal 7.11A - ClientOps Autopilot Product Pivot Docs
- Goal 7.11B - Replace Harbor Sample with Northstar Client Implementation Launch

Suggested next sequence:

1. Goal 7.11C - ClientOps Function Studio Visual Pass.
2. Goal 8A - NeMo Guardrails Preflight / Architecture Audit.
3. Goal 8B - Guardrail Adapter + Schema/API.
4. Goal 8C - Guardrail Execution Rails in Run Lifecycle.
5. Goal 8D - Guardrail Proof UI in Workflow Canvas.
6. Goal 8E - Enterprise Function Template Positioning + Recording Proof.
7. Goal 9 - Final polish and submission assets.
8. Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Goal 8A, Goal 9, and Goal 7B remain intact. Goal 7.11C is the next sample-presentation step
before the read-only NeMo preflight.

## Goal 7.11B - Replace Harbor Sample with Northstar Client Implementation Launch

Objective:

Completed: replaced the implemented Harbor Fleet Services sample in code, UI copy,
policy/sample data, tests, Hermes skill text, and current docs with the Northstar Dental Group
Client Implementation Launch template.

Required outputs:

- Current default sample is Northstar Dental Group.
- Template name is Client Implementation Launch.
- Revenue is $8,500.
- Approved setup spend is $350 Secure Workspace Pack, $500 Data Migration Sandbox, and
  $300 Launch Asset Kit.
- Blocked risk is $3,200 Unapproved Data Broker Enrichment.
- Profit outcome shows $7,350 protected gross profit and 86.5% protected margin.
- Harbor references remain only as previous legacy sample history.

Constraints:

- Do not use real client data.
- Do not call live Stripe.
- Do not claim real NeMo is wired.
- Keep local policy active until Goal 8 verifies a guardrail adapter.
- Keep Stripe invoice paid-state honesty.

## Goal 7.11C - ClientOps Function Studio Visual Pass

Objective:

Align the UI presentation with ScaleX ClientOps Autopilot as an Enterprise Function Accelerator.

Required outputs:

- First screen communicates revenue-backed client operations.
- Northstar Client Implementation Launch appears as the product sample after Goal 7.11B.
- The Studio route is presented as a ClientOps Function Studio surface, not the product identity.
- Finance proof, business rules, guardrail enforcement, evidence ledger, protected profit, and
  blocked risk are visible without terminal output.
- Local policy now / NeMo Guardrails planned remains honest.

Constraints:

- No fake NeMo proof.
- No live-money support.
- No real customer workflow claims.

## Goal 8 - Governed Autonomy Layer With NVIDIA NeMo Guardrails

Goal 8 remains planned. It must start with read-only Goal 8A before any adapter or UI work.

Stack identity for Goal 8:

- Hermes plans and routes the client operation.
- Stripe provides finance proof in test mode.
- ScaleX executes and enforces business rules.
- Local policy is active now.
- NVIDIA NeMo Guardrails or a NeMo-compatible adapter is planned as the governed autonomy layer.
- SQLite records guardrail proof and audit evidence.
- Profit Outcome reports the business result.

Do not claim real NeMo Guardrails unless it is installed, wired, tested, and documented. Until
then, docs and UI must say local policy is active now and NeMo Guardrails is planned/not wired.

### Goal 8A - NeMo Guardrails Preflight / Architecture Audit

- Read-only.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect current local policy engine and SQLite audit schema.
- Decide whether real NeMo Guardrails is safely available.
- Produce the exact Goal 8B implementation prompt.
- Do not implement code.
- Do not install anything.
- Do not run Stripe API calls.
- Do not run Hermes model calls.

### Goal 8B - Guardrail Adapter + Schema/API

- Add a guardrail adapter boundary with modes:
  - `local_policy`
  - `nemo_guardrails`
  - `nemo_compatible`
- Add guardrail evaluation persistence if needed.
- Add API state for guardrail mode, status, and proof.
- Keep local policy deterministic for tests.

### Goal 8C - Guardrail Execution Rails in Run Lifecycle

- Add pre-action guardrail checks around intake, Hermes plan/tool sequence, Stripe finance action
  requests, spend approval/block, agent deliverables, and final report.
- Map checks to NeMo-style rails:
  - input rail
  - planning/dialog rail
  - execution rail
  - output rail
- Fail closed on guardrail errors in product mode.

### Goal 8D - Guardrail Proof UI in Workflow Canvas

- Add or enhance proof for NeMo Guardrail Gate, local policy support, fail-closed status, blocked
  action evidence, and rule evidence.
- Do not claim real NeMo unless verified.

### Goal 8E - Enterprise Function Template Positioning + Recording Proof

- Keep ScaleX positioned as ClientOps Autopilot / Enterprise Function Accelerator.
- Present implemented and future templates honestly.
- Update demo/submission docs and browser recording path after any implementation changes.

## Goal 9 - Final Polish + Submission Assets

Objective:

Polish ScaleX for recording and submission as a working product-style prototype.

Required outputs:

- README setup/run instructions.
- Demo script.
- Submission writeup.
- Architecture doc.
- Screenshot/recording guidance.
- Fresh-clone setup verification if time permits.

Acceptance criteria:

- `scripts/setup.sh` works.
- `scripts/dev.sh` starts backend and frontend.
- `scripts/test.sh` passes.
- The implemented sample run can be recorded in under 3 minutes.
- README clearly distinguishes Stripe test mode, future Verified Live Mode, and unsupported
  live-money execution.
- Docs preserve local policy active now / real NeMo not wired yet.

## Goal 7B - Verified Live Mode

Verified Live Mode is future production hardening, not part of the current demo path.

Required safeguards:

- explicit config enablement
- live-key/test-key separation
- operator confirmation phrase
- maximum live charge cap
- customer allowlist
- pre-charge review
- policy approval
- SQLite audit records
- no silent fallback

Hermes may propose a live-money step, but ScaleX code must enforce every safeguard and execute
any allowed action. Until Verified Live Mode exists and is documented, ScaleX must not execute
live-money payments.

## Definition Of Done For The Current Prototype

ScaleX is ready for the current Northstar sample state when:

- Docs consistently say ScaleX ClientOps Autopilot / Enterprise Function Accelerator.
- Docs clearly explain the enterprise problem.
- Docs clearly explain revenue-backed client operations.
- Docs and app select Northstar Dental Group / Client Implementation Launch as the implemented template.
- Docs preserve Harbor only as historical previous sample context.
- Docs preserve local policy active now / real NeMo not wired yet.
- Goal 8A remains intact.
- Goal 9 remains intact.
- Goal 7B remains intact.
- No Goal 8 implementation is done.
- No secrets are added.
- No `.env` or SQLite `.db` files are touched.
