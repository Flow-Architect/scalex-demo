# ScaleX Architecture

Target architecture:

```text
ScaleX UI
  -> local prototype auth gate
  -> SQLite-backed local/sample workflow management
  -> product shell with left navigation, top command bar, workflow canvas, and selected-node inspector
  -> FastAPI backend
  -> isolated Hermes brain/orchestration
  -> real Stripe test mode / policy layer / agents
  -> SQLite ledger and audit records
  -> profit report
```

## Implemented Today

- Vite React TypeScript frontend.
- Product shell with login, Workflow, Customers, Runs, Audit, Integrations, and Settings views.
- Workflow route with connected canvas and right selected-node inspector.
- FastAPI backend.
- SQLite audit ledger at `data/scalex.db`.
- Local prototype auth using an environment-configured username/password and signed HTTP-only session cookie.
- Local/sample workflow configs persisted through SQLite `workflows` and `onboarding_configs`.
- Unique run history persisted through SQLite `jobs` plus run-scoped audit/proof tables.
- Historical run inspection through `GET /api/demo/state?run_id=...`.
- Real isolated Hermes Agent planning through the repo-owned `scalex-operator` skill.
- Hermes CLI invocation with `--skills scalex-operator`, `--toolsets skills`, provider `openai-codex`, and model `gpt-5.5`.
- SQLite `planning_runs` and `orchestration_calls` audit tables.
- Real Stripe test-mode customer and finalized invoice records through orchestration for Goal 7.
- Local policy engine for spend governance until Goal 8 wires a real safety adapter if safely available.
- Deterministic agent outputs.
- Harbor Fleet Services sample workflow with Goal 7.9C connected Workflow canvas, selected-node inspector, compact proof access, staged execution progress, and persisted run history.

## Goal 7.9 Product UX Model

Goal 7.9 is the product UX redesign before Goal 8. Goal 7.9A completed the UX blueprint,
Goal 7.9B completed the app shell foundation, and Goal 7.9C reshaped the main Workflow
page into a product control-room experience:

```text
Left navigation
Top command bar
Central workflow canvas
Right selected-node inspector
Customers view
Runs view
Audit view
Integrations view
Settings view
```

The main Workflow view centers on the workflow canvas. Nodes represent
Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Gate, Approved
Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report. Clicking a node
populates the right inspector with the real proof for that node. Goal 7.9D remains for
Customers, Runs, Audit, Integrations, and Settings cleanup while preserving implemented
backend proof and avoiding placeholder-only tabs.

## Auth and Onboarding

Goal 7.8 keeps local prototype auth and adds SQLite-backed local/sample workflow management.
Auth is not production enterprise identity. Workflow management is not full SaaS
multi-tenancy. The product walkthrough uses these surfaces to behave like a real operator
console while keeping data synthetic/sample-only and live-money actions out of scope.

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

Tests and CI may use Stripe test doubles. Product mode must surface a visible Stripe
integration error instead of silently using test doubles.

## Policy Integration

The local policy engine is currently active for spend cap, payment-before-spend, margin,
vendor allowlist, and blocked-vendor checks. Goal 8 follows Goal 7.9 for NemoClaw or NemoClaw-style
safety integration if it can be wired safely. ScaleX does not yet claim real NemoClaw.

## Verified Live Mode

Live-money Stripe capability is future production hardening only. Verified Live Mode must
require explicit config, human confirmation, amount caps, customer allowlists, policy approval,
and SQLite audit records before any live-money action.

## Safety Boundary

Goal 7 must not use live Stripe mode, production Hermes, Windows Hermes config, production
Prometheus, homelab/OpenClaw, Recall memory, or real client data.
