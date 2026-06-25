# ScaleX ClientOps Autopilot Architecture

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

## Target Architecture

```text
ScaleX UI
  -> local prototype auth gate
  -> SQLite-backed local/sample client operation records
  -> product shell with Dashboard, Function Studio, Onboarding, Client Operations, Runs, Evidence Ledger, Integrations, Settings
  -> FastAPI backend
  -> isolated Hermes planning and routing
  -> Stripe finance proof in test mode
  -> ScaleX business-rule enforcement
  -> local policy active today
  -> NeMo Guardrails planned after Goal 8
  -> SQLite evidence ledger
  -> agent work
  -> Profit Outcome
```

## Stack Responsibilities

- Hermes plans and routes the client operation.
- Stripe provides finance proof through test invoice/payment state.
- ScaleX executes the operation and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- NeMo Guardrails is planned as the governed autonomy layer after Goal 8 preflight.
- SQLite records evidence for planning, orchestration, finance proof, policy checks, ledger rows,
  agent outputs, and final reports.
- Profit Outcome reports protected profit and blocked risk.

## Implemented Today

- Vite React TypeScript frontend.
- Product shell with login, Dashboard, Function Studio, Onboarding, Client Operations, Runs, Evidence Ledger, Integrations, and Settings views.
- Function Studio route with connected proof nodes and right selected-node inspector.
- FastAPI backend.
- SQLite evidence ledger at `data/scalex.db`.
- Local prototype auth using an environment-configured username/password and signed HTTP-only session cookie.
- Local/sample workflow configs persisted through SQLite `workflows` and `onboarding_configs`.
- Unique run history persisted through SQLite `jobs` plus run-scoped audit/proof tables.
- Historical run inspection through `GET /api/demo/state?run_id=...`.
- Real isolated Hermes Agent planning through the repo-owned `scalex-operator` skill.
- Hermes CLI invocation with `--skills scalex-operator`, `--toolsets skills`, provider `openai-codex`, and model `gpt-5.5`.
- SQLite `planning_runs` and `orchestration_calls` audit tables.
- Real Stripe test-mode customer and finalized invoice records through orchestration for Goal 7.
- Local policy engine for spend governance until Goal 8 safely wires NVIDIA NeMo Guardrails or a NeMo-compatible adapter.
- Deterministic agent outputs.
- Northstar Dental Group / Client Implementation Launch sample with persisted run history and proof inspection.

## Current Template Boundary

Northstar Dental Group / Client Implementation Launch is the implemented sample. It is a
synthetic B2B implementation operations account only: no patient data, no PHI, no healthcare
compliance claim, and no HIPAA support claim. Harbor Fleet Services is historical only and is no
longer the current runtime sample.

## Hermes Integration

Goal 6 wired the backend to the ScaleX-isolated Hermes install:

```text
code: /home/ascabrya/.scalex-hermes/hermes-agent
home/config/auth: /home/ascabrya/.scalex-hermes/home
skill source: hermes/skills/scalex-operator/SKILL.md
```

Product mode calls real Hermes for planning. ScaleX code still executes Stripe, policy checks,
ledger writes, local agent outputs, and reports. Hermes may propose payment steps but cannot
execute payment actions directly.

## Stripe Integration

Goal 7 is complete and makes real Stripe test mode the product payment path:

```text
customer -> invoice item -> invoice -> finalized hosted invoice URL -> honest payment status
```

The verified Stripe test invoice is honestly labeled open/unpaid when Stripe returns
`invoice_status=open` and `paid=false`; ScaleX must not claim Stripe-paid revenue unless
Stripe reports `paid=true`.

Tests and CI may use Stripe test doubles. Product mode must surface a visible Stripe integration
error instead of silently using test doubles.

## Governed Autonomy / Guardrails

The local policy engine is currently active for spend cap, payment-before-spend, margin, vendor
allowlist, and blocked-vendor checks. Goal 8A is the read-only preflight to decide whether real
NeMo Guardrails or a NeMo-compatible adapter is safely available. Later Goal 8 work should add a
guardrail adapter boundary, NeMo-style input/planning/execution/output rails, and guardrail proof.

ScaleX does not yet claim real NeMo Guardrails or real NemoClaw.

## Verified Live Mode

Live-money Stripe capability is future production hardening only. Verified Live Mode must require
explicit config, human confirmation, amount caps, customer allowlists, policy approval, and SQLite
audit records before any live-money action.

## Safety Boundary

Goal 7 work must not use live Stripe mode, production Hermes, Windows Hermes config, production
Prometheus, homelab/OpenClaw, Recall memory, or real client data.
