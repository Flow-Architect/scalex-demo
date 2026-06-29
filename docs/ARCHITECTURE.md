# ScaleX Governed ClientOps Architecture

ScaleX Governed ClientOps is the judge-facing demo narrative for ScaleX ClientOps Autopilot, an
Enterprise Function Accelerator for revenue-backed client operations.

## Target Architecture

```text
ScaleX UI
  -> local prototype auth gate
  -> SQLite-backed local/sample client operation records
  -> product shell with Dashboard, Governed Run Studio, Onboarding, Client Operations, Runs, Evidence Ledger, Connection Hub, Settings
  -> FastAPI backend
  -> isolated Hermes planning and routing
  -> ScaleX Connection Hub for allowed systems, modes, guardrails, and evidence duties
  -> Stripe finance proof in test mode
  -> ScaleX business-rule enforcement
  -> local policy active today
  -> NeMo Guardrails adapter available when runtime verified
  -> optional NVIDIA NemoClaw / OpenShell / nemohermes API runtime when selected and verified
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
- Goal 8B added an optional NeMo Guardrails adapter boundary. Default mode is `local_policy`;
  `nemo_guardrails` verifies a configured external Python `nemoguardrails` runtime and fails
  closed if selected but unavailable.
- Actual NVIDIA NemoClaw / OpenShell / `nemohermes` is the optional sandboxed Hermes runtime path
  when `HERMES_RUNTIME=nemoclaw` is selected and the local API call succeeds. It is separate from
  the NeMo Guardrails adapter.
- SQLite records evidence for planning, orchestration, finance proof, policy checks, ledger rows,
  agent outputs, and final reports.
- Profit Outcome reports protected profit after the approved delivery cost basis, with labor cost
  as one job-costing component and blocked-risk margin impact recorded.

## Goal 8G Enterprise Demo Architecture

Goal 8G is a narrative/UI lock, not an integration expansion. It keeps the existing backend and
execution modes while making the browser product show ScaleX as the governed execution layer for
paid client work.

Judge-facing architecture:

```text
Business Intake
-> Input Rail validates synthetic/local client operation context
-> Hermes creates the plan
-> Planning Rail approves bounded work
-> Stripe creates finance proof through demo/test-safe path
-> Revenue Gate verifies the finance state honestly
-> NeMo/local policy reviews risky actions
-> ScaleX approves controlled setup spend
-> ScaleX blocks risky vendor/data enrichment spend
-> Agent work executes only inside allowed boundaries
-> Evidence Ledger records proof
-> Output Rail verifies paid-state honesty and safety claims
-> Profit Rail records protected profit and margin
```

The first-screen Control Stack should make responsibilities explicit:

- Hermes - Planner / Operator Brain: creates the client implementation plan and proposes next
  actions.
- Stripe - Finance Proof: provides test-mode invoice/payment proof and keeps the run financially
  grounded.
- NeMo / Local Policy - Guardrail Runtime: checks risky actions before execution and blocks unsafe
  behavior.
- ScaleX - Enterprise Control Plane: executes only what is allowed, records evidence, blocks risk,
  and reports protected profit.

Goal 8G exact Northstar economics:

- Revenue secured: $8,500.
- Approved setup/tool spend: $1,150.
- Blocked risky spend: $3,200.
- Approved delivery cost basis: $3,935 total approved costs.
- Deterministic loaded labor cost: $950, visible inside the cost basis as job costing only.
- Current implemented protected profit: $4,565.
- Current implemented protected margin: 53.7%.
- Blocked-risk impact if allowed: $7,135 total costs, $1,365 profit, and 16.1% margin.

Profit formulas:

```text
protected_profit = revenue - total_approved_costs
protected_margin = protected_profit / revenue
margin_if_risky_spend_approved = (revenue - total_approved_costs - blocked_risky_spend) / revenue
labor_cost = job-costing component inside total_approved_costs, not payroll
```

Evidence Ledger should present enterprise audit fields: timestamp/order, actor/system, action,
result, evidence type, and safety note. Raw debug data can remain available only as supporting
detail, not the primary narrative.

Goal 8G must not add Telegram, MCP, new external services, real Stripe runs, Full Proof runs,
Docker/NemoClaw commands, production payroll/HR behavior, external extraction services, live
money, real client data, or secrets.

## Goal 8F Command Center Architecture

Goal 8F should move the product experience from a linear demo path to a command-center layout for
profit-aware agent operations. The implementation should preserve the existing backend behavior
unless typed UI data access or deterministic demo-state support requires small additions.

Command Center sections:

- Mission Control.
- Runtime / Connection Hub.
- Client Onboarding Center.
- Employee Onboarding Center.
- Document Intake Review.
- Workforce / Labor Cost Panel.
- Economic Control Panel.
- Policy / Guardrail Console.
- Agent Workbench.
- Judge Proof / Audit Ledger.
- Final Profit Report.

Data flow:

```text
manual client entry or demo-safe document intake
-> extracted-data review
-> editable/saved client operation values
-> Mission Control / Economic Control / Agent Workbench / Profit Report

manual employee entry or demo-safe document intake
-> extracted-data review
-> editable/saved employee labor assumptions
-> Workforce Panel / Economic Control / Profit Report

revenue and approved vendor spend
-> labor costing
-> margin check against floor
-> margin warning or safe/profitable status
-> non-secret audit proof
```

Document intake must be local and demo-safe. It can use deterministic fixtures for PDF, Excel,
Word, and optional CSV extraction. It must not use external extraction services, external
credentials, or silent saves. Unsupported-file and extraction-failed states should be visible, and
manual entry must remain available.

Labor costing formulas:

```text
fully_loaded_hourly_rate = base_hourly_rate * (1 + labor_burden_percentage)
labor_cost = fully_loaded_hourly_rate * assigned_hours
job_profit = revenue - approved_vendor_spend - labor_cost
final_margin = job_profit / revenue
```

Audit events should remain non-secret and should not include raw file contents. Suitable proof
events include client manual creation, client extraction, client edit, employee manual creation,
employee extraction, employee edit, extraction failure, labor-cost calculation, margin warning,
policy approval, and policy block.

Forbidden data for Goal 8F: SSNs, tax IDs, bank information, addresses, birth dates, real HR
records, sensitive payroll records, secrets, raw credential headers, raw `.env` values, and raw
uploaded file contents. Goal 8F is job costing only, not payroll, HR compliance, tax processing,
or live-money operations.

## Implemented Today

- Vite React TypeScript frontend.
- Product shell with login, Dashboard, Governed Run Studio, Onboarding, Client Operations, Runs, Evidence Ledger, Connection Hub, and Settings views.
- Governed Run Studio route with connected proof nodes and right selected-node inspector.
- FastAPI backend.
- SQLite evidence ledger at `data/scalex.db`.
- Deterministic `command_center` API state for Mission Control, runtime proof, client/employee
  intake, document review states, labor costing, audit proof, safety proof, and final profit after
  labor.
- Local prototype auth using an environment-configured username/password and signed HTTP-only session cookie.
- Local/sample workflow configs persisted through SQLite `workflows` and `onboarding_configs`.
- Unique run history persisted through SQLite `jobs` plus run-scoped audit/proof tables.
- Historical run inspection through `GET /api/demo/state?run_id=...`.
- Real isolated Hermes Agent planning through the repo-owned `scalex-operator` skill.
- Hermes CLI invocation with `--skills scalex-operator`, `--toolsets skills`, provider `openai-codex`, and model `gpt-5.5`.
- SQLite `planning_runs` and `orchestration_calls` audit tables.
- Real Stripe test-mode customer and finalized invoice records through orchestration for Goal 7.
- Local policy engine for spend governance, with optional NeMo Guardrails adapter proof when
  configured.
- Optional NemoHermes API runtime for sandboxed Hermes planning.
- Local browser-only command-center intake interactions for manual/edit/save and upload-triggered
  deterministic extraction fixtures. Uploaded files are not stored.
- Fake/demo labor costing for service job profitability. This is not payroll, HR compliance, tax
  processing, or production workforce management.
- Deterministic agent outputs.
- Northstar Dental Group / Client Implementation Launch sample with persisted run history and proof inspection.
- Judge Demo Mode as the default safe local execution mode without real secrets.
- Full Proof Mode for safely configured real isolated Hermes plus real Stripe test mode.

## ClientOps Concept Lock

Connection Hub and MCP planning must support ScaleX ClientOps Autopilot, not replace it. ScaleX is
business tooling for revenue-backed client operations and a governed execution layer around Hermes,
Stripe, policy/guardrails, and evidence. It is not a generic MCP platform, connector marketplace,
integration dashboard, Zapier/n8n clone, developer tool first, or AI agent playground.

The demo should stay centered on Dashboard -> Governed Run Studio -> Start Governed Run -> visible execution ->
Evidence Drawer -> Runs -> Evidence Ledger -> Connection Hub.

## Connection Hub Architecture

ScaleX Connection Hub is an implemented internal product layer. It is where ScaleX declares:

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
- NemoClaw / OpenShell Sandbox through optional NemoHermes API runtime
- SQLite Evidence Ledger
- Prototype Auth

Planned connector concepts:

- Telegram Approval Gate
- Slack / Email notifications or future approvals
- CRM client context
- Docs / Notion workspace
- Calendar kickoff scheduling
- MCP local prototype boundary

Connection Hub is not the main product story. It is the operating boundary that makes ClientOps
Autopilot safe to run.

## NeMo Guardrails Adapter vs NemoClaw

ScaleX currently has two distinct guardrail/sandbox concepts:

- NeMo Guardrails adapter: implemented through Python `nemoguardrails`, invoked through the
  configured `SCALEX_NEMO_PYTHON` subprocess, and runtime verified when selected. It may set
  `used_real_nemo=true` only when verification passes.
- NVIDIA NemoClaw / OpenShell / `nemohermes`: optional sandboxed-agent runtime for Hermes. The
  local runtime was validated externally before Goal 8E, and ScaleX can route planning through
  its local OpenAI-compatible API when selected.

Historical Goal 7.15A local prerequisite probe, superseded by later local runtime validation:

- `nemoclaw`: missing.
- `nemohermes`: missing.
- `openshell`: missing.
- `docker`: missing / not usable.
- `node`: present, v22.22.2.
- `npm`: present, 10.9.7.
- `zstd`: present.
- `strings`: present.

Implemented optional NemoHermes mode uses `HERMES_MODE=nemohermes_api` or
`HERMES_RUNTIME=nemoclaw`, `HERMES_API_BASE_URL=http://127.0.0.1:8642/v1`,
`HERMES_MODEL=hermes-agent`, and `NEMOCLAW_SANDBOX_NAME=scalex-hermes`. If selected but
unavailable, the runtime fails closed.

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

Product mode calls real Hermes for planning through either the isolated Hermes CLI path or the
optional NemoHermes API path. ScaleX code still executes Stripe, policy checks, ledger writes,
local agent outputs, and reports. Hermes may propose payment steps but cannot execute payment
actions directly.

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

Goal 7.12 made `Start Governed Run` visibly execute the Northstar Client Implementation Launch.

Judge Demo Mode works without secrets by using deterministic local proof/test-double paths. It
creates local SQLite records, populates Runs and Evidence Ledger, labels output as demo/sandbox
proof, and avoids claiming real Stripe or real Hermes unless real adapters were used.

Full Proof Mode uses real isolated Hermes or selected NemoHermes API planning plus real Stripe
test mode when local ignored `.env` values are safely configured. It must keep Stripe
`livemode=false`, show hosted invoice URLs only when available, never label `paid=false` as paid,
and surface visible integration errors when misconfigured.

The visible execution path records run started, Hermes planning, Stripe finance proof,
guardrail review, approved setup spend, blocked risk, work execution, evidence ledger, and profit
outcome proof before reporting completion or an actionable failure.

## Full Proof Mode Real-Tool Demo Plan

The target final local recording mode should use:

- real isolated Hermes planning or selected NemoHermes API planning;
- real Stripe test-mode invoice creation/finalization;
- local policy guardrails;
- SQLite evidence ledger;
- synthetic Northstar data only;
- no live money;
- no real client email;
- no patient data and no PHI;
- no NeMo Guardrails adapter claim until runtime verified.

Expected proof:

- Hermes: `used_real_hermes=true` only when the selected real Hermes path succeeds, with planning
  source clearly identifying `real_hermes` or `nemohermes_api`.
- Stripe: `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`, invoice ID,
  hosted invoice URL when Stripe provides it, and no paid claim unless `paid=true`.
- Policy: `local_policy_active=true`, $3,935 approved delivery costs, $3,200 Unapproved Data
  Broker Enrichment blocked risk, 50% margin floor, 53.7% protected margin, and 16.1% margin if
  the risky spend were allowed.
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

MCP is a future access pattern only. ScaleX does not currently expose an MCP server, and external
agents cannot yet call ScaleX through MCP. The optional NemoHermes runtime adapter does not change
that boundary.

MCP is paused until the Telegram approval gate is planned or implemented or explicitly deferred,
the command-center product story is strong enough, and the guardrail/tool boundary remains safe.

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
- Human approval gates must approve risky actions when required.
- MCP tools must not expose secrets.
- MCP tools must not bypass local policy, NeMo Guardrails adapter checks, future NemoClaw
  boundaries, or Telegram approvals.
- Every action writes evidence.
- Action tools fail closed when configuration or policy is invalid.
- Start read-only first.
- No live-money tools, real client data, PHI, secret exposure, or unmanaged external credentials.

## Governed Autonomy / Guardrails

The local policy engine is currently active for spend cap, payment-before-spend, margin, vendor
allowlist, and blocked-vendor checks. Goal 8B adds a guardrail adapter boundary with
`local_policy`, `nemo_guardrails`, and `nemo_compatible` modes plus `guardrail_evaluations`
evidence for input, planning, execution, and output stages.

The main backend process does not import `nemoguardrails`. Real NeMo probing runs through the
configured external `SCALEX_NEMO_PYTHON` subprocess and loads `SCALEX_NEMO_CONFIG_PATH`.
`nemo_guardrails` may claim NeMo Guardrails adapter proof only when runtime verification passes;
if selected but unavailable, broken, or misconfigured, ScaleX fails closed. `nemo_compatible` is a
labeled fallback only and must keep `used_real_nemo=false`.

Goal 8C deepened pre-action rail execution around protected actions. ScaleX claims NemoHermes
planning only when `HERMES_RUNTIME=nemoclaw` is selected, the local API call succeeds, and
non-secret runtime evidence is recorded.

## Telegram Approval Gate Target

Telegram is planned as a human approval channel for risky actions, not as a chatbot-first feature.
The target flow is pending approval request -> Telegram approval message -> authorized approve or
deny -> ScaleX verification -> action resume or block -> Evidence Ledger decision record.

Approval candidates include spend above threshold, vendor spend near the margin floor, real Stripe
invoice send if ever enabled, real client email if ever enabled, external connector actions, and
future MCP action requests. PHI/patient data, live-money attempts, disallowed real client data,
direct secret exposure, and policy bypass attempts must be blocked outright.

Safety rules: allowlisted chat IDs only, no secrets or PHI in messages, signed one-time approval
token or approval ID, expiry, deny/expired fail closed, approval never bypasses local policy, NeMo
Guardrails, or NemoClaw boundaries, re-check policy before execution, and record every approval or
denial as evidence.

## Verified Live Mode

Live-money Stripe capability is future production hardening only. Verified Live Mode must require
explicit config, human confirmation, amount caps, customer allowlists, policy approval, and SQLite
audit records before any live-money action.

## Safety Boundary

Goal 7 work must not use live Stripe mode, production Hermes, Windows Hermes config, production
Prometheus, homelab/OpenClaw, Recall memory, actual NemoClaw production paths, or real client
data. No docs should claim Telegram approval, MCP server, live-money support, real client email,
PHI handling, production auth, or NemoHermes use for a specific run until those paths are selected,
implemented, and verified with evidence.
