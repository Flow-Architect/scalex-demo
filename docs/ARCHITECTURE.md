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
  -> ScaleX Connection Hub for allowed systems, modes, guardrails, and evidence duties
  -> Stripe finance proof in test mode
  -> ScaleX business-rule enforcement
  -> local policy active today
  -> real NVIDIA NeMo Guardrails targeted in Goal 8
  -> SQLite evidence ledger
  -> agent work
  -> Profit Outcome
```

## Stack Responsibilities

- Hermes plans and routes the client operation.
- Connection Hub declares which systems Hermes and future agents are allowed to use, what mode each
  connector is in, what guardrails apply, and what evidence must be recorded.
- Stripe provides finance proof through test invoice/payment state.
- ScaleX executes the operation and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- Goal 8B adds an optional real-NeMo-ready guardrail adapter boundary. Default mode is
  `local_policy`; `nemo_guardrails` verifies a configured external Python runtime and fails closed
  if selected but unavailable.
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
- Local policy engine for spend governance until Goal 8 safely wires real NVIDIA NeMo Guardrails
  or, only if blocked, a documented temporary NeMo-compatible adapter.
- Deterministic agent outputs.
- Northstar Dental Group / Client Implementation Launch sample with persisted run history and proof inspection.
- Judge Demo Mode as the default safe local execution mode without real secrets.
- Full Proof Mode for safely configured real isolated Hermes plus real Stripe test mode.

## ClientOps Concept Lock

Connection Hub and MCP planning must support ScaleX ClientOps Autopilot, not replace it. ScaleX is
business tooling for revenue-backed client operations and a governed execution layer around Hermes,
Stripe, policy/guardrails, and evidence. It is not a generic MCP platform, connector marketplace,
integration dashboard, Zapier/n8n clone, developer tool first, or AI agent playground.

The demo should stay centered on Dashboard -> Function Studio -> Start Run -> visible execution ->
Evidence Drawer -> Runs -> Evidence Ledger -> Integrations.

## Connection Hub Architecture

ScaleX Connection Hub is a planned internal product layer. It is where ScaleX declares:

- which systems Hermes and future agents are allowed to use;
- which connectors are active today, in Judge Demo Mode, in Full Proof Mode, planned, missing
  config, blocked by policy, unavailable, or failed closed;
- what guardrails apply before an action can run;
- what evidence must be recorded;
- what actions are not allowed.

Active connector concepts:

- Hermes Planning
- Stripe Finance Proof
- Local Policy
- SQLite Evidence Ledger
- Prototype Auth

Planned connector concepts:

- NeMo Guardrails
- Slack / Email approvals
- CRM client context
- Docs / Notion workspace
- Calendar kickoff scheduling

Connection Hub is not the main product story. It is the operating boundary that makes ClientOps
Autopilot safe to run.

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

## Execution Modes

Goal 7.12 made `Start Run` visibly execute the Northstar Client Implementation Launch.

Judge Demo Mode works without secrets by using deterministic local proof/test-double paths. It
creates local SQLite records, populates Runs and Evidence Ledger, labels output as demo/sandbox
proof, and avoids claiming real Stripe or real Hermes unless real adapters were used.

Full Proof Mode uses real isolated Hermes and real Stripe test mode when local ignored `.env`
values are safely configured. It must keep Stripe `livemode=false`, show hosted
invoice URLs only when available, never label `paid=false` as paid, and surface visible
integration errors when misconfigured.

The visible execution path records run started, Hermes planning, Stripe finance proof,
guardrail review, approved setup spend, blocked risk, work execution, evidence ledger, and profit
outcome proof before reporting completion or an actionable failure.

## Full Proof Mode Real-Tool Demo Plan

The target final local recording mode should use:

- real isolated Hermes planning;
- real Stripe test-mode invoice creation/finalization;
- local policy guardrails;
- SQLite evidence ledger;
- synthetic Northstar data only;
- no live money;
- no real client email;
- no patient data and no PHI;
- no real NeMo claim until wired and verified.

Expected proof:

- Hermes: `used_real_hermes=true` when real isolated Hermes ran, with planning source clearly
  identifying real/isolated Hermes.
- Stripe: `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`, invoice ID,
  hosted invoice URL when Stripe provides it, and no paid claim unless `paid=true`.
- Policy: `local_policy_active=true`, $1,150 approved setup spend, $3,200 Unapproved Data Broker
  Enrichment blocked risk, 50% margin floor, and 86.5% protected margin.
- Evidence: timeline, orchestration/tool calls, Stripe finance proof, policy checks, ledger
  entries, and final profit outcome records.

Invoice lifecycle:

- Hermes does not create or send invoices directly.
- Hermes plans the finance step.
- ScaleX backend executes approved finance actions.
- In Full Proof Mode, ScaleX uses Stripe test mode to create/finalize the invoice.
- Stripe returns invoice proof objects and hosted invoice URL when available.
- ScaleX stores invoice proof in the Evidence Ledger.
- Demo mode creates sandbox finance proof and does not call Stripe.
- No mode should claim a real client was emailed unless an explicit send step exists and is
  verified.

## Future MCP Boundary

MCP is a future access pattern only. ScaleX does not currently expose an MCP server, external
agents cannot yet call ScaleX through MCP, and this architecture does not claim NeMo is wired.

A future local ScaleX MCP server may expose safe tools, resources, and prompts so Hermes or other
agents can request approved ScaleX actions without directly touching Stripe, policy, secrets, or
evidence systems.

Possible future tools:

- `scalex_list_operations`
- `scalex_get_operation`
- `scalex_start_run`
- `scalex_get_run`
- `scalex_get_evidence`
- `scalex_get_connector_status`
- `scalex_get_profit_outcome`

Possible future resources:

- `scalex://operations/current`
- `scalex://runs/{run_id}`
- `scalex://evidence/{run_id}`
- `scalex://policy/current`
- `scalex://connectors/status`

Possible future prompts:

- `client_implementation_launch`
- `invoice_to_cash`
- `vendor_spend_review`
- `client_onboarding`

Future MCP governance:

- Hermes and external agents may propose or request actions.
- ScaleX validates actions before execution.
- Guardrails decide allow/block/warn.
- MCP tools must not expose secrets.
- MCP tools must not bypass local policy or future NeMo guardrails.
- Every action writes evidence.
- Action tools fail closed when configuration or policy is invalid.
- No live-money tools, real client data, or unmanaged external credentials.

## Governed Autonomy / Guardrails

The local policy engine is currently active for spend cap, payment-before-spend, margin, vendor
allowlist, and blocked-vendor checks. Goal 8B adds a guardrail adapter boundary with
`local_policy`, `nemo_guardrails`, and `nemo_compatible` modes plus `guardrail_evaluations`
evidence for input, planning, execution, and output stages.

The main backend process does not import `nemoguardrails`. Real NeMo probing runs through the
configured external `SCALEX_NEMO_PYTHON` subprocess and loads `SCALEX_NEMO_CONFIG_PATH`.
`nemo_guardrails` may claim real NeMo only when runtime verification passes; if selected but
unavailable, broken, or misconfigured, ScaleX fails closed. `nemo_compatible` is a labeled
fallback only and must keep `used_real_nemo=false`.

Goal 8C should deepen pre-action rail execution around protected actions. ScaleX does not claim
real NemoClaw.

## Verified Live Mode

Live-money Stripe capability is future production hardening only. Verified Live Mode must require
explicit config, human confirmation, amount caps, customer allowlists, policy approval, and SQLite
audit records before any live-money action.

## Safety Boundary

Goal 7 work must not use live Stripe mode, production Hermes, Windows Hermes config, production
Prometheus, homelab/OpenClaw, Recall memory, or real client data.
