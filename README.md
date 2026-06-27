# ScaleX ClientOps Autopilot

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

ScaleX helps B2B teams turn repeatable client operations into autonomous, revenue-backed,
policy-governed runs with finance proof, guardrail enforcement, and audit evidence.

## Problem

B2B companies win clients, but onboarding and delivery still happen through fragmented handoffs
across operations, finance, tools, approvals, vendors, and reporting. AI can suggest next steps,
but enterprises cannot safely let an agent execute client operations unless money, spend, policy,
and evidence are governed.

ScaleX solves that by letting Hermes plan and route the operation, Stripe provide finance proof,
ScaleX enforce business rules, local policy check spend and margin today, the NeMo Guardrails
adapter provide optional runtime-verified guardrail proof, optional NemoHermes API routing run
Hermes through the local NemoClaw/OpenShell sandbox when selected, and SQLite record evidence.

## Current Implemented Sample

The current code implements the Client Implementation Launch template with the synthetic
Northstar Dental Group account.

- Client/account: Northstar Dental Group
- Template: Client Implementation Launch
- Industry label: Multi-location healthcare services group
- Implementation package revenue: $8,500
- Setup spend cap: $1,150
- Margin floor: 50%
- Approved setup spend: $350 Secure Workspace Pack, $500 Data Migration Sandbox, and $300 Launch Asset Kit
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Target report: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, and 86.5% protected margin
- Data boundary: synthetic account only, no patient data, no PHI, no healthcare compliance claim,
  and no HIPAA support claim

Harbor Fleet Services is no longer the current implemented sample. It remains historical only in
older changelog entries.

## Template Model

Implemented today:

- Template: Client Implementation Launch
- Sample account: Northstar Dental Group
- Story: a multi-location client purchased an implementation package, and ScaleX launches the
  client operation from revenue proof through guarded execution and protected profit reporting.

Future templates are planned, not implemented yet: Invoice-to-Cash, Vendor Spend Approval, Client
Onboarding, Research-to-Report, Ops Handoff, and Renewal Recommendation.

## Goal 8F Command Center Direction

Goal 8F deepens ScaleX from a linear demo flow into a profit-aware command center for service
businesses. The intended first screen should make runtime routing, client onboarding, employee
onboarding, document intake, labor costing, economic controls, policy guardrails, agent work,
judge proof, audit evidence, and final profit reporting visible as coordinated operating panels.

The command-center sections are Mission Control, Runtime / Connection Hub, Client Onboarding
Center, Employee Onboarding Center, Document Intake Review, Workforce / Labor Cost Panel, Economic
Control Panel, Policy / Guardrail Console, Agent Workbench, Judge Proof / Audit Ledger, and Final
Profit Report.

Client and employee onboarding should support manual entry plus demo-safe PDF, Excel/spreadsheet,
and Word/document intake. Extracted values require review and editing before save, saved records
remain editable, manual entry remains available after extraction failure, and unsupported-file
states are shown clearly. Intake uses deterministic fixtures or basic local parsing only; no
external extraction services, credentials, real uploaded files, or raw file contents are committed
or logged.

Labor costing is job costing only, not payroll. Fully loaded hourly rate is base hourly rate times
`1 + labor burden percentage`; labor cost is fully loaded rate times assigned hours; job profit is
revenue minus approved vendor spend minus labor cost; final margin is job profit divided by
revenue. Labor cost should feed Mission Control, Workforce, Economic Control, Final Profit Report,
and margin warnings.

Safety boundaries: fake/demo clients and employees only; no SSNs, tax IDs, bank information,
addresses, birth dates, real HR records, sensitive payroll records, production payroll, HR
compliance, tax processing, live money, secrets, raw credential headers, or `.env` values.

## Architecture

```text
Client operation intake
-> Hermes/GPT-5.5 plans and routes the operation
-> ScaleX Connection Hub declares allowed systems, modes, guardrails, and evidence duties
-> Stripe provides finance proof through test invoice/payment state
-> ScaleX executes and enforces business rules
-> local policy active now checks spend, margin, vendors, and payment-before-spend
-> NeMo Guardrails adapter available when runtime verified
-> optional NVIDIA NemoClaw / OpenShell / nemohermes API runtime when selected and verified
-> SQLite records evidence
-> Profit Outcome reports protected profit and blocked risk
```

## Safety Boundary

ScaleX is not production software. Product mode is real-integration-first, but every integration
must run in the appropriate environment.

- Goal 7 uses real Stripe test mode with `sk_test_...` keys and no live-money movement.
- Live-money payments are a future capability only through Verified Live Mode.
- No real client data.
- No production Hermes, Prometheus, OpenClaw, Recall, or xScaleOS connections.
- Stripe test doubles are for automated tests, CI, local offline development, or explicitly labeled diagnostics.
- Product-mode integration failures must surface visible errors.
- Policy enforcement currently runs through a local policy engine.
- Guardrail mode defaults to `local_policy`; optional `nemo_guardrails` mode can verify the
  Python `nemoguardrails` runtime through `SCALEX_NEMO_PYTHON` and fails closed if selected but
  unavailable.
- Optional NVIDIA NemoClaw / OpenShell / `nemohermes` routing is available through
  `HERMES_RUNTIME=nemoclaw` after the local API is already validated.
- Telegram approval is planned and not implemented yet.
- Hermes planning uses the ScaleX-isolated laptop install, not production Hermes.
- Stripe test invoices are labeled honestly as open/unpaid unless Stripe reports `paid=true`.

## Current Prototype State

Implemented today:

- FastAPI backend.
- SQLite evidence ledger at `data/scalex.db`.
- Real ScaleX-isolated Hermes Agent planning through the `scalex-operator` skill.
- Hermes invocation constrained to the `skills` toolset for planning.
- SQLite planning run and orchestration call audit records.
- Local policy engine enforcing payment-before-spend, vendor, spend-cap, and margin-floor rules.
- Real Stripe test-mode invoice flow through the orchestration layer.
- Stripe test-double records for automated tests, CI, offline development, and diagnostics.
- Deterministic Finance, Marketing, Research, and Ops outputs.
- Vite React product shell with local prototype auth, Dashboard, Function Studio, Onboarding,
  Client Operations, Runs, Evidence Ledger, Connection Hub, and Settings.
- Connected Function Studio page with proof nodes, selected-node inspector, persisted run history, and
  historical run inspection.
- Command Center dashboard sections for Mission Control, Runtime / Connection Hub, Client
  Onboarding Center, Employee Onboarding Center, Document Intake Review, Workforce / Labor Cost
  Panel, Economic Control Panel, Policy / Guardrail Console, Agent Workbench, Judge Proof / Audit
  Ledger, and Final Profit Report.
- Demo-safe client and employee intake review with local browser-only manual/edit/save controls
  and upload-triggered deterministic extraction fixtures. Uploaded files are not stored.
- Fake/demo labor costing for job profitability after approved vendor spend and employee labor.
- Judge Demo Mode as the default safe local execution path without secrets.
- Full Proof Mode for safely configured real isolated Hermes plus real Stripe test mode.
- Optional NeMo Guardrails adapter proof through `nemoguardrails` runtime verification.
- Optional NemoHermes API runtime for sandboxed Hermes planning; it is not active by default and
  fails closed if selected but unavailable.

## Connection Hub And MCP Plan

ScaleX Connection Hub is an implemented internal product layer, not a separate product. It shows
which systems the ClientOps Autopilot is allowed to use, which mode each connector is in, what
guardrails apply, which actions are blocked, what configuration is missing, and what evidence was
recorded.

Active connector concepts documented today:

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

MCP is documented as a future access pattern only. ScaleX does not currently expose an MCP server,
and external agents cannot yet call ScaleX through MCP. MCP is paused until the Telegram approval
boundary, command-center product-depth pass, and guardrail/tool-boundary review are safe. A
future ScaleX MCP server may expose safe local read-only tools/resources/prompts first, without
exposing secrets, bypassing policy or approval, or enabling live-money actions.

## Local Browser Demo

Judge Demo Mode is the default checkout path. It works without real secrets, Stripe keys, Hermes
auth, NeMo, real client data, patient data, or PHI.

Clone the repo, enter it, then install local dependencies:

```bash
git clone <repo-url>
cd scalex-demo
./scripts/setup.sh
```

Start the backend and frontend together:

```bash
./scripts/dev.sh
```

The dev script loads `.env` automatically if the file exists, without printing values. A `.env`
file is optional for Judge Demo Mode. Use the frontend URL printed by the script; the default is:

```text
http://127.0.0.1:5174
```

For the judge-safe path, open Dashboard, then Function Studio, then click `Start Run`. The run
progresses through Hermes planning proof, Stripe sandbox finance proof, local policy decisions,
approved setup spend, blocked risk, work execution, evidence ledger, and profit outcome.

Optional local overrides can be placed in ignored `.env`:

```bash
cp .env.example .env
```

When `SCALEX_AUTH_ENABLED=true`, configure local-only demo credentials in `.env` before opening
the UI:

```text
SCALEX_DEMO_USERNAME=
SCALEX_DEMO_PASSWORD=
SCALEX_SESSION_SECRET=
```

After login, use Dashboard or Onboarding to load/select the Northstar Dental Group sample or create
another synthetic/sample client operation, then open Function Studio and click `Start Run`.
The run uses the active operation values and appends a new run record instead of
overwriting prior history.

Goal 7.12 is complete: `Start Run` visibly executes from run start through Hermes planning,
Stripe finance proof, guardrail review, approved setup spend, blocked risk, work execution,
evidence ledger, and profit outcome.

Judge Demo Mode is the default safe local path. It works without real secrets, uses deterministic
local planning proof and Stripe test-double/sandbox finance proof, writes SQLite evidence records,
and labels output as demo/sandbox proof.

Full Proof Mode is available when ignored local `.env` values safely configure real isolated
Hermes and Stripe test mode:

```text
SCALEX_EXECUTION_MODE=full_proof
```

Full Proof Mode should show `used_real_hermes=true` when real isolated Hermes ran,
`used_real_stripe=true` when real Stripe test mode ran, `stripe_mode=stripe_test`,
`livemode=false`, a Stripe invoice ID, a hosted invoice URL when Stripe provides it, and no paid
claim unless Stripe reports `paid=true`.

Hermes plans the finance step but does not create or send invoices directly. ScaleX backend
executes approved finance actions, Stripe returns test-mode proof objects, and ScaleX stores that
proof in the Evidence Ledger. Demo mode creates sandbox finance proof and does not call Stripe.
Full Proof Mode must use Stripe test mode only and must not send invoice email to a real client.
No mode should claim a real client was emailed unless an explicit send step exists and is verified.

In product mode, Stripe requires a local `.env` `sk_test_...` key and returns a visible Stripe
integration error if test mode is not configured. Automated tests and CI use
`STRIPE_TEST_DOUBLE_MODE=true`.

Normal laptop runs use the ScaleX-isolated Hermes install:

```text
HERMES_HOME=/home/ascabrya/.scalex-hermes/home
HERMES_CLI_PATH=/home/ascabrya/.scalex-hermes/hermes-agent/venv/bin/hermes
HERMES_SKILL_NAME=scalex-operator
HERMES_TOOLSETS=skills
```

Useful local endpoints:

```text
GET  http://127.0.0.1:8787/api/health
GET  http://127.0.0.1:8787/api/demo/state
POST http://127.0.0.1:8787/api/demo/run
POST http://127.0.0.1:8787/api/demo/reset
POST http://127.0.0.1:8787/api/demo/onboarding
POST http://127.0.0.1:8787/api/demo/workflows
POST http://127.0.0.1:8787/api/demo/workflows/{workflow_id}/select
POST http://127.0.0.1:8787/api/demo/workflows/{workflow_id}/delete
GET  http://127.0.0.1:8787/api/demo/state?run_id={run_id}
POST http://127.0.0.1:8787/api/auth/login
GET  http://127.0.0.1:8787/api/auth/me
POST http://127.0.0.1:8787/api/auth/logout
```

To run only the backend:

```bash
SCALEX_BACKEND_ONLY=true ./scripts/dev.sh
```

Run checks with:

```bash
./scripts/test.sh
```

The test script runs backend pytest and the frontend production build.

Reset the demo state with:

```bash
./scripts/reset-demo.sh
```

These commands must not use live Stripe mode or production service credentials.

## Checkout Notes

- Judge Demo Mode is safe by default and does not require secrets.
- Full Proof Mode is optional and local-only.
- Live-money Stripe execution is not implemented.
- Northstar Dental Group is synthetic; no real client data, patient data, or PHI is used.
- Connection Hub UI is implemented as the ClientOps operating boundary; MCP remains planned only
  and no MCP server exists today.
- Real NeMo is optional through `nemo_guardrails` mode only when runtime verification passes; the
  default Judge Demo Mode remains `local_policy` and does not require NeMo.
- No `LICENSE` file is present yet. Select a license such as MIT or Apache-2.0 before public
  open-source submission.

## What Is Real, Test, And Future

- Real now: isolated Hermes planning through `scalex-operator`, real Stripe test-mode invoice
  creation/finalization, SQLite evidence ledger, local policy enforcement, optional NeMo
  Guardrails adapter runtime probing through `SCALEX_NEMO_PYTHON`, local prototype auth,
  SQLite-backed local/sample workflows, selected-workflow runs, persisted run history, and browser
  product flow.
- Judge Demo Mode: deterministic Hermes planning and Stripe test-double/sandbox proof for hosted
  judge-safe demos, automated tests, CI, offline development, or explicitly labeled diagnostics.
- Implemented now for Goals 8B/8C: guardrail adapter modes `local_policy`, `nemo_guardrails`, and
  `nemo_compatible`; `guardrail_evaluations` evidence; input/planning/execution/output rails;
  API/UI proof fields; and setup/check scripts for an external NeMo venv.
- Implemented now for Goal 7.13B: Connection Hub UI for allowed systems, connector modes,
  guardrails, evidence duties, blocked policy actions, missing config, Full Proof capability, and
  planned-only connector boundaries.
- Verified locally in Goal 7.14B: Full Proof Mode completed with real isolated Hermes, real
  Stripe test-mode invoice proof, NeMo Guardrails runtime verification through
  `nemoguardrails`, local policy active, `livemode=false`, and unpaid Stripe state preserved.
- Optional now: NemoHermes API runtime behind `HERMES_RUNTIME=nemoclaw`; it is not active by
  default and fails closed when selected but unavailable.
- Not implemented today: Telegram approval, MCP server, live money, real client email, real client
  data, and PHI handling.
- Planned next after Goal 8F: Telegram Human Approval Gate, then MCP only after the boundaries are
  safe.
- Future: Goal 9 final submission prep and Verified Live Mode remain later work.
