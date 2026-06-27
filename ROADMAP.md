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

## ClientOps Concept Lock

Connection Hub and MCP planning must not pivot ScaleX into a generic connector platform.

ScaleX remains **ScaleX ClientOps Autopilot**: business tooling for revenue-backed client
operations and a governed execution layer around Hermes, Stripe, policy/guardrails, and evidence.
The judge should remember that ScaleX helps businesses safely run client operations with agents,
not that ScaleX is an MCP connector dashboard, Zapier/n8n clone, developer tool, integration
marketplace, or AI agent playground.

The durable product story is:

- a client buys an implementation package;
- ScaleX launches the client operation;
- Hermes plans the work;
- Stripe provides finance proof;
- ScaleX validates actions through local policy now, the implemented NeMo Guardrails adapter when
  explicitly runtime verified, and future NemoClaw/OpenShell sandboxing after safe wiring;
- SQLite records evidence;
- ScaleX reports protected profit and execution outcome.

## Stack Mapping

```text
Client operation intake
-> Hermes/GPT-5.5 plans and routes the operation
-> ScaleX Connection Hub declares allowed systems, modes, guardrails, and evidence duties
-> Stripe provides finance proof through test invoice/payment state
-> ScaleX executes the run and enforces business rules
-> local policy active now checks spend, margin, vendors, and payment-before-spend
-> NeMo Guardrails adapter available through nemoguardrails runtime verification
-> actual NVIDIA NemoClaw / OpenShell / nemohermes targeted next for sandboxed Hermes runtime
-> SQLite records evidence
-> Profit Outcome reports protected profit and blocked risk
```

ScaleX code is the execution and policy authority. Hermes may plan and propose steps, but
ScaleX enforces keys, modes, caps, allowlists, confirmations, guardrails, ledger writes, and
reports.

## NeMo Guardrails Adapter vs Actual NemoClaw

Goal 7.15A corrected the roadmap language:

- NeMo Guardrails adapter: implemented through the Python `nemoguardrails` package and runtime
  verified through the Goal 8B adapter path when `SCALEX_NEMO_PYTHON` is configured. This is a
  useful guardrail layer and is not the same as NemoClaw.
- Actual NVIDIA NemoClaw: target integration for sandboxed AI agents in OpenShell, with Hermes
  support through `nemohermes`. It is not installed in this environment and is not wired into
  ScaleX yet.

Current verified local state to preserve:

- local policy engine: implemented.
- Stripe test-mode Full Proof: validated.
- isolated local Hermes Full Proof: validated.
- NeMo Guardrails Python package / `nemoguardrails`: installed and runtime verified.
- actual NVIDIA NemoClaw / OpenShell sandbox / `nemohermes`: not installed and not wired.

Local prerequisite probe result:

- `nemoclaw`: missing.
- `nemohermes`: missing.
- `openshell`: missing.
- `docker`: missing / not usable.
- `node`: present, v22.22.2.
- `npm`: present, 10.9.7.
- `zstd`: present.
- `strings`: present.
- Repo clean at `c70ba17` before Goal 7.15A docs edits.

Do not claim NemoClaw is active until it is installed, onboarded, connected, and verified. If a
future NemoClaw runtime mode is selected but unavailable, ScaleX must fail closed.

## ScaleX Connection Hub

The ScaleX Connection Hub is the product layer where ScaleX declares which systems Hermes and
future agents are allowed to use, what mode each connector is in, what guardrails apply, and what
evidence must be recorded. Goal 7.13B implemented the first product-facing view.

The Connection Hub is not the product. It supports ClientOps Autopilot by making execution
authority visible for a revenue-backed client operation.

It should answer:

- Which systems can the agent use?
- Which systems are active today, in Judge Demo Mode, in Full Proof Mode, planned, missing config,
  blocked by policy, unavailable, or failed closed?
- Which actions are allowed, not allowed, or blocked by policy?
- What evidence was recorded for each approved or blocked action?
- What configuration is missing before Full Proof Mode can safely run?

Active connector concepts:

- Hermes Planning
- Stripe Finance Proof
- Local Policy / NeMo Guardrails adapter
- SQLite Evidence Ledger
- Prototype Auth

Planned connector concepts:

- NemoClaw / OpenShell Sandbox target
- Telegram Approval Gate
- Slack / Email notifications or future approvals
- CRM client context
- Docs / Notion workspace
- Calendar kickoff scheduling
- MCP local prototype boundary

Connector statuses to preserve:

- active
- demo mode
- full proof mode
- planned
- missing config
- blocked by policy
- unavailable
- failed closed

## Future MCP-Shaped Boundary

MCP is a future access pattern, not the main product story. ScaleX does not currently expose an
MCP server, external agents cannot yet call ScaleX through MCP, and this roadmap does not claim
NemoClaw is wired.

MCP implementation is paused until:

- NemoClaw preflight is complete.
- Telegram approval gate is planned/implemented or explicitly deferred.
- The UI/product story is strong enough for the demo.
- The guardrail/tool boundary remains safe.

After the tool boundary is clear, ScaleX may expose a safe local MCP server so Hermes or other
agents can request approved ScaleX actions through tools, resources, and prompts without directly
touching Stripe, policy, secrets, or the evidence ledger.

Product framing:

- Hermes plans and proposes work.
- ScaleX owns execution authority.
- Connection Hub exposes approved business capabilities.
- Stripe provides finance proof.
- Local policy is active now.
- Real NVIDIA NeMo Guardrails adapter is optional through `nemo_guardrails` mode after runtime
  verification; Judge Demo Mode defaults to `local_policy`.
- Actual NemoClaw / OpenShell / `nemohermes` remains planned until installed, connected, and
  verified.
- SQLite Evidence Ledger records every action.
- A future MCP server may let agents call ScaleX through safe tools/resources/prompts.

Future MCP tools, resources, and prompts are planned only:

- Tools: `scalex_list_operations`, `scalex_get_operation`, `scalex_start_run`,
  `scalex_get_run`, `scalex_get_evidence`, `scalex_get_connector_status`,
  `scalex_get_profit_outcome`
- Resources: `scalex://operations/current`, `scalex://runs/{run_id}`,
  `scalex://evidence/{run_id}`, `scalex://policy/current`, `scalex://connectors/status`
- Prompts: `client_implementation_launch`, `invoice_to_cash`, `vendor_spend_review`,
  `client_onboarding`

Security and governance rules for any future MCP work:

- Hermes and external agents may propose or request actions.
- ScaleX must validate actions before execution.
- Guardrails decide allow/block/warn.
- MCP tools must not expose secrets.
- MCP tools must not bypass local policy, NeMo Guardrails adapter checks, future NemoClaw
  boundaries, or human approval gates.
- Every action must write evidence.
- Action tools should fail closed when configuration or policy is invalid.
- Stripe live-money remains out of scope until Verified Live Mode exists.
- Full Proof Mode can use Stripe test mode only.
- Judge Demo Mode must remain safe without secrets.
- MCP must remain local-only and read-only first; action tools are allowed only if they route
  through guardrails and approval gates.

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
- The NeMo Guardrails adapter must not be claimed active unless `nemo_guardrails` runtime
  verification passes.
- Do not claim real NemoClaw integration until actual NemoClaw/OpenShell/`nemohermes` is
  installed, onboarded, connected, and verified.

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
- Dashboard, Onboarding, Customers, Studio, Runs, Audit/Evidence Ledger, Connection Hub, and Settings
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
- Goal 7.11C - ClientOps Function Studio Visual Pass
- Goal 7.11D - Demo Polish / Visual Consistency Pass
- Goal 7.12 - Make Start Run a Real Product Execution
- Goal 7.13A - Connection Hub / MCP Architecture Docs with ClientOps Concept Lock, Full Proof Real-Tool Demo Plan, and Real NeMo Requirement
- Open Source Checkout Cleanup
- Goal 8A - NeMo Guardrails Preflight / Architecture Audit
- Goal 8B - Real-NeMo-Ready Guardrail Adapter + Schema/API
- Goal 7.14B - Full Proof Local Validation With Configured Real Tools
- Goal 8C - Guardrail Execution Rails in Run Lifecycle
- Goal 7.13B - Connection Hub UI
- Goal 7.15A - Product Depth, Demo-Winning UI Plan, Telegram Approval Gate Plan, and NemoClaw
  Correction

Suggested next sequence:

1. Goal 8D - Actual NemoClaw / NemoHermes Preflight.
2. Goal 8E - Wire ScaleX to NemoClaw Hermes Runtime if safe.
3. Goal 8F - Telegram Human Approval Gate.
4. Goal 7.15B - Product Depth + Demo-Winning UI Pass.
5. Goal 7.13C - MCP Server Prototype only after NemoClaw, guardrail, and approval boundaries are
   safe.
6. Goal 9 - Final polish and submission assets.
7. Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Goal 7.14B Full Proof local validation passed in a local-only configured environment. It verified
real isolated Hermes, real Stripe test-mode invoice proof, NeMo Guardrails adapter runtime
verification through `nemoguardrails`, local policy as the business-rule gate, unpaid Stripe
honesty, and synthetic Northstar data only. It did not verify actual NemoClaw/OpenShell/
`nemohermes`. Rerun Full Proof validation only before final recording or after relevant
integration changes.

Goal 9 and Goal 7B remain intact. Goal 7.13A was a docs-only architecture and handoff
update. It does not implement an MCP server, frontend UI, backend behavior, Stripe live-money
support, production Hermes, production data, or real client workflows.

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
- Do not claim actual NemoClaw is wired.
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

## Goal 7.12 - Make Start Run a Real Product Execution

Objective:

Make `Start Run` feel like a real working product execution for the Northstar Dental Group /
Client Implementation Launch demo before Goal 8A begins. This is a functionality and demo-proof
pass, not another visual redesign.

Required behavior:

- `Start Run` shows a visible running/loading state.
- Function Studio shows step progression from run start through completion or failure.
- Function Map highlights pending, running, complete, and blocked states in a readable way.
- Evidence Drawer updates with meaningful proof at each major step.
- Runs gets a new execution record.
- Evidence Ledger gets timeline, orchestration, ledger, Stripe, and policy proof.
- Dashboard reflects latest run status.
- Counts change from zero when a run completes.
- Failure states are visible and actionable.

Required execution sequence:

1. Run started.
2. Hermes planning step.
3. Stripe finance proof step.
4. Guardrail review step.
5. Approved setup spend step.
6. Blocked risk step.
7. Work execution step.
8. Evidence ledger step.
9. Profit outcome step.
10. Run completed, or clearly failed with an actionable reason.

Execution modes to preserve:

- Judge Demo Mode works without secrets, uses deterministic local proof/test-double paths, creates
  local SQLite records, populates Runs and Evidence Ledger, labels output as demo/sandbox proof,
  and does not claim real Stripe or real Hermes unless real adapters were used.
- Full Proof Mode uses real isolated Hermes and real Stripe test mode when local ignored `.env`
  values are safely configured. It preserves `livemode=false`, shows hosted invoice URLs only when
  available, never labels `paid=false` as paid, and surfaces visible errors when misconfigured.

Truthfulness boundaries:

- Northstar is synthetic.
- No patient data, no PHI, no HIPAA claim.
- Local policy is active now.
- Real NeMo is optional through `nemo_guardrails` mode only when runtime verification passes.
- No live-money support.
- No production auth claim.
- Demo mode must not pretend to be real integration mode.
- Full Proof Mode must show visible errors if configured incorrectly.

Constraints:

- Do not implement Goal 8.
- Do not install or wire actual NemoClaw in this Goal 7 work.
- Do not run live Stripe or Hermes model calls during planning.
- Do not change Northstar economics.
- Do not add live-money support.

## Goal 7.13 - Connection Hub / MCP Tool Boundary

Goal 7.13 documents and implements a Connection Hub layer and MCP-shaped access boundary without
changing the core product. Connection Hub must strengthen the ClientOps Autopilot story; it must
not turn ScaleX into a generic integration dashboard.

### Goal 7.13A - Connection Hub / MCP Architecture Docs

Objective:

Document Connection Hub, the future MCP-shaped tool boundary, a safe Full Proof Mode real-tool
demo plan, and the NeMo Guardrails target while preserving ClientOps Autopilot as the main product
story.

Required outputs:

- Define Connection Hub as the internal ScaleX layer that declares allowed systems, connector
  modes, guardrails, missing config, blocked actions, and evidence duties.
- Define MCP as a future access pattern only, not an implemented ScaleX capability.
- Preserve the Northstar Client Implementation Launch demo path: Dashboard -> Function Studio ->
  Start Run -> visible execution -> Evidence Drawer -> Runs -> Evidence Ledger -> Connection Hub.
- Add a Full Proof Mode local validation plan using real isolated Hermes and real Stripe test mode
  with synthetic Northstar data only.
- Clarify invoice lifecycle: Hermes plans the finance step, ScaleX backend executes approved
  finance actions, Stripe returns test-mode proof objects, and ScaleX stores proof in evidence.
- Keep Judge Demo Mode safe without secrets and explicitly labeled as demo/sandbox proof.
- Document the NeMo Guardrails adapter as the Goal 8 target, not an optional nice-to-have.
- Allow a NeMo-compatible adapter only if Goal 8A proves the NeMo Guardrails adapter cannot be
  safely wired before submission, with the blocker and remaining work documented.

Constraints:

- Docs/tracking/architecture only.
- Do not implement code, create an MCP server, add UI, change backend behavior, run Stripe API
  calls, run Hermes model calls, run a Full Proof Mode live test, implement Goal 8, install/wire
  NeMo, add live-money support, edit `.env`, touch SQLite `.db` files, or commit.

### Goal 7.13B - Connection Hub UI

Objective:

Complete: added a product view showing active/planned connectors and execution modes after Goal
8C.

The UI should show:

- Hermes Planning
- Stripe Finance Proof
- Local Policy
- SQLite Evidence Ledger
- Prototype Auth
- Guardrail adapter mode/status
- Demo Mode vs Full Proof Mode
- missing config
- blocked by policy
- evidence recorded

The view must feel like an operating-boundary view for ClientOps Autopilot, not a generic
connector marketplace or integration dashboard.

### Goal 7.13C - MCP Server Prototype

Objective:

Expose a safe local ScaleX MCP server only after the NemoClaw, guardrail, approval, and product
story boundaries are clear.

Rules:

- Remain local-only.
- Start read-only first.
- Start with read-only/resource-style tools where possible.
- Action tools must remain guarded, approved when required, and audited.
- No live-money tools.
- No real client data.
- No PHI.
- No secret exposure.
- No unmanaged external credentials.
- MCP tools must not bypass local policy, the NeMo Guardrails adapter, future NemoClaw runtime
  boundaries, or Telegram approval gates.

## Goal 7.15 - Product Depth and Boundary Alignment

### Goal 7.15A - Product Depth, Demo-Winning UI Plan, Telegram Approval Gate Plan, and NemoClaw Correction

- Complete as docs/tracking/roadmap only.
- Corrected NeMo Guardrails adapter vs actual NemoClaw.
- Added actual NemoClaw/NemoHermes preflight and wiring plan.
- Added Telegram Human Approval Gate plan.
- Added Product Depth + Demo-Winning UI plan.
- Paused MCP until after NemoClaw/guardrail/approval boundaries are safe.
- Did not implement code, run integrations, install dependencies, create MCP, or commit.

### Goal 7.15B - Product Depth + Demo-Winning UI Pass

Objective:

Make ScaleX feel like a repeatable enterprise product for governed ClientOps execution, not one
hardcoded Northstar workflow. The current backend proof is strong; the UI must make the product
depth visible in a clean 90-second judge path.

Required improvements:

1. Demo-friendly auth / login first impression: local demo access should feel intentional; if
   auth is enabled with local demo credentials, label it as prototype local auth and do not claim
   production auth. Avoid scary missing-config warnings during normal Judge Demo Mode.
2. Command Center hero: first screen shows Northstar Dental Group, Client Implementation Launch,
   revenue secured $8,500, approved setup spend $1,150, blocked risk $3,200, protected profit
   $7,350, protected margin 86.5%, and a clear `Start Governed Run` CTA.
3. Operation Catalog: show multiple ClientOps functions while only one needs to run now: Client
   Implementation Launch active demo; Invoice-to-Cash Follow-Up, Vendor Spend Review, Client
   Onboarding Checklist, and Renewal Risk Review planned.
4. Policy / Risk Library: show controls for payment before spend, 50% margin floor, vendor
   allowlist/blocklist, blocked data broker enrichment, no PHI/patient data, no live money, no
   real client email, human approval over $1,000, NeMo Guardrails runtime verification, and
   NemoClaw sandbox target once wired.
5. Run story timeline: make Start Run feel alive across input rail, Hermes plan, planning rail,
   Stripe finance proof, execution rail, policy block, Telegram approval if required, Evidence
   Ledger, output rail, and Profit Outcome.
6. Evidence drill-down: show input rail passed, Hermes plan recorded, Stripe test invoice created
   when real test mode is used, NeMo Guardrails runtime verified when applicable, approved setup
   spend, policy-blocked data broker enrichment, no ledger spend row for blocked action, paid=false
   honesty, and Profit Outcome recorded.
7. Guardrail proof: surface `local_policy` default, NeMo Guardrails optional/runtime verified when
   state says so, NemoClaw target not active yet, `used_real_nemo`, `fail_closed`, rail decisions,
   and blocked-spend no-ledger-row proof.
8. Stripe proof honesty: distinguish test-double in Judge Demo Mode from real Stripe test mode
   only when `used_real_stripe=true`; show invoice ID/hosted invoice URL only when available;
   preserve `paid=false`; no live money.
9. Connection Hub polish: present the ClientOps operating boundary with Active Today, Full Proof
   Verified / Capable, Evidence Recorded, Planned Only, Missing Config, and Fail Closed sections
   for Hermes Planning, Stripe Finance Proof, NeMo Guardrails / local policy, NemoClaw / OpenShell
   Sandbox target, SQLite Evidence Ledger, Prototype Auth, Telegram Approval Gate planned,
   Slack/Email, CRM, Docs/Notion, Calendar planned, and MCP planned only.
10. Demo recording path: support Command Center -> Start Governed Run -> Function Studio / Run
    timeline -> Evidence Ledger -> Connection Hub -> Profit Outcome, with optional Telegram
    approval moment once implemented.

## Full Proof Mode Real-Tool Demo Plan

Full Proof Mode is the target final local recording mode when safe ignored `.env` credentials are
configured. It must use synthetic Northstar data only and must not run live money, real client
email, patient data, PHI, or NeMo Guardrails adapter claims before runtime verification.

Target final recording mode:

- real isolated Hermes planning;
- real Stripe test-mode invoice creation/finalization;
- local policy guardrails;
- SQLite evidence ledger;
- Northstar Dental Group / Client Implementation Launch synthetic data only;
- no live-money support;
- no real client email delivery;
- no patient data and no PHI.

Hermes proof should show:

- `used_real_hermes=true` when real isolated Hermes ran;
- planning source clearly identifies real/isolated Hermes;
- Hermes plans the operation but does not directly execute money movement.

Stripe proof should show:

- `used_real_stripe=true` when real Stripe test mode ran;
- `stripe_mode=stripe_test`;
- `livemode=false`;
- invoice ID exists;
- hosted invoice URL exists when Stripe provides it;
- `paid=false` is not shown as paid;
- no live key, no live charge, and no real client email delivery.

Policy proof should show:

- `local_policy_active=true`;
- approved setup spend of $1,150;
- blocked risk: Unapproved Data Broker Enrichment - $3,200;
- margin floor of 50%;
- protected margin of 86.5%.

Evidence proof should show:

- SQLite timeline records;
- orchestration/tool call records;
- Stripe finance proof;
- policy checks;
- ledger entries;
- final profit outcome.

Invoice lifecycle clarity:

- Hermes does not create or send invoices directly.
- Hermes plans the finance step.
- ScaleX backend executes approved finance actions.
- In Full Proof Mode, ScaleX uses Stripe test mode to create/finalize the invoice.
- Stripe returns invoice proof objects and hosted invoice URL when available.
- ScaleX stores invoice proof in the Evidence Ledger.
- Demo mode creates sandbox finance proof and does not call Stripe.
- Full Proof Mode creates real Stripe test-mode invoice objects.
- No mode should claim a real client was emailed unless an explicit send step exists and is
  verified.
- If Stripe test-mode invoice send is ever used, it must be clearly labeled as test-mode behavior
  and no real client email should be used.

Final demo language:

> Judge Demo Mode works safely without secrets. Full Proof Mode shows real isolated Hermes
> planning and real Stripe test-mode invoice creation. Both modes enforce local policy, block
> risky spend, record evidence, and report protected profit. The NeMo Guardrails adapter is
> runtime-verified when configured; actual NemoClaw remains the next sandbox target.

## Goal 8 - Governed Autonomy Layer With NeMo Guardrails and NemoClaw

Goal 8A, Goal 8B, Goal 8C, Goal 7.13B, and Goal 7.15A are complete. Goal 8A-8C implemented and
verified the NeMo Guardrails adapter path. Goal 7.15A corrected the next target: actual NVIDIA
NemoClaw / OpenShell / `nemohermes` is separate from the Python `nemoguardrails` package and is
not installed or wired yet.

Stack identity for Goal 8:

- Hermes plans and routes the client operation.
- Stripe provides finance proof in test mode.
- ScaleX executes and enforces business rules.
- Local policy is active now.
- Real NVIDIA NeMo Guardrails adapter is available through optional `nemo_guardrails` mode after
  runtime verification.
- Actual NVIDIA NemoClaw / OpenShell / `nemohermes` is the next sandboxed Hermes runtime target.
- SQLite records guardrail proof and audit evidence.
- Profit Outcome reports the business result.

Real guardrail proof matters. The implemented adapter path must remain truthful, and actual
NemoClaw must not be claimed until installed, onboarded, connected, and verified.

Preferred Goal 8 path:

1. Default `local_policy` mode for Judge Demo Mode and tests.
2. Optional `nemo_guardrails` mode through `SCALEX_NEMO_PYTHON` runtime verification.
3. Temporary `nemo_compatible` fallback only when clearly labeled as not real NeMo.
4. Actual NemoClaw / OpenShell / `nemohermes` preflight before any MCP implementation.

Do not claim the NeMo Guardrails adapter is active unless runtime verification passes. Do not
claim NemoClaw is active until actual NemoClaw is installed and verified. Local policy remains
active for deterministic business-rule enforcement.

### Goal 8A - NeMo Guardrails Preflight / Architecture Audit

- Complete.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect current local policy engine and SQLite audit schema.
- Determine the safest practical path to wire the NeMo Guardrails adapter into this repo.
- If the adapter cannot be safely wired before submission, document the blocker, temporary
  fallback, and remaining work.
- Produce the exact Goal 8B implementation prompt.
- Do not implement code.
- Do not install anything.
- Do not run Stripe API calls.
- Do not run Hermes model calls.

### Goal 8B - Guardrail Adapter + Schema/API

- Complete. Added adapter modes, persistence, API/UI proof, fail-closed selected-real-NeMo
  behavior, and setup/check scripts.

### Goal 8C - Guardrail Execution Rails in Run Lifecycle

- Complete. Added input, planning, execution, and output rail checks around selected operation
  intake, Hermes/deterministic plan JSON, Stripe/test-double finance requests, revenue and spend
  ledger actions, blocked-spend consistency, and final report paid-state honesty.
- Guardrail decisions are persisted as `allow`, `warn`, `block`, or `fail_closed`.
- Blocked spend still records policy/evidence and does not create a spend ledger row.
- Judge Demo Mode remains deterministic and Full Proof compatibility remains intact.

### Goal 8D - Actual NemoClaw / NemoHermes Preflight

- Inspect actual NemoClaw / OpenShell / `nemohermes` prerequisites.
- Treat Docker carefully. Docker is required and Docker group access has root-level impact on
  Linux.
- Note that Ubuntu 24.04 is the primary validated Linux path in NemoClaw docs; this laptop is
  Fedora, so preflight must be conservative.
- Do not touch production Hermes, Prometheus, xScaleOS, Recall, homelab OpenClaw, real client
  data, live money, `.env`, committed secrets, or data files.
- Produce the Goal 8E implementation prompt only if safe.

### Goal 8E - Wire ScaleX to NemoClaw Hermes Runtime If Safe

- Install and onboard actual NVIDIA NemoClaw with Hermes selected only if Goal 8D proves the path
  is safe.
- Use `nemohermes` sandbox for Hermes runtime when safe.
- Keep existing Judge Demo Mode safe without NemoClaw.
- Keep existing Full Proof local path working.
- Add a ScaleX mode such as `HERMES_MODE=nemohermes_api` or `HERMES_RUNTIME=nemoclaw`, with
  `HERMES_API_BASE_URL=http://127.0.0.1:8642/v1` and
  `NEMOCLAW_SANDBOX_NAME=scalex-hermes`.
- Connection Hub should eventually show NemoClaw / OpenShell Sandbox, status missing config /
  runtime verified / fail closed, Agent Hermes, Sandbox `scalex-hermes`, API local
  OpenAI-compatible endpoint, and network policy managed by NemoClaw.
- Fail closed if NemoClaw is selected but unavailable.

### Goal 8F - Telegram Human Approval Gate

Purpose:

Telegram is not a chatbot-first feature. It is a human approval channel for risky actions.

Flow:

- ScaleX detects an action needs approval.
- ScaleX creates a pending approval request.
- ScaleX sends a Telegram approval card/message.
- An authorized user approves or denies.
- ScaleX verifies the decision.
- ScaleX resumes or blocks the action.
- Evidence Ledger records the decision.

Approval candidates:

- spend above approval threshold.
- vendor spend near margin floor.
- real Stripe invoice send if ever enabled.
- real client email if ever enabled.
- external connector action.
- future MCP action requested by an external agent.

Block outright, not approval-route:

- PHI/patient data.
- live-money attempt.
- real client data where not allowed.
- direct secret exposure.
- policy bypass attempt.

Safety rules:

- allowlisted chat IDs only.
- no secrets in Telegram messages.
- no PHI or patient data in messages.
- signed one-time approval token or approval ID.
- expiry.
- deny/expired means fail closed.
- approval does not bypass NeMo/local policy/NemoClaw boundary.
- re-check policy before execution.
- every approval/denial writes evidence.

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
- Docs preserve local policy active now, optional NeMo Guardrails adapter only after runtime
  verification, and actual NemoClaw planned/not wired.

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
- Docs preserve local policy active now / optional NeMo Guardrails adapter only after runtime
  verification.
- Docs distinguish NeMo Guardrails adapter from actual NemoClaw.
- Docs keep Telegram approval planned unless implemented.
- Docs keep MCP paused until after NemoClaw/approval/guardrail boundary review.
- Goal 7.13B Connection Hub UI is complete.
- Goal 9 remains intact.
- Goal 7B remains intact.
- Goal 8B adapter implementation and Goal 8C execution rails are done.
- Goal 7.14B Full Proof local validation passed with real isolated Hermes, Stripe test mode,
  NeMo Guardrails runtime verification through `nemoguardrails`, local policy active, and unpaid
  Stripe honesty preserved.
- Actual NemoClaw / OpenShell / `nemohermes` is not installed or wired.
- No secrets are added.
- No `.env` or SQLite `.db` files are touched.
