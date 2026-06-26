# ScaleX ClientOps Autopilot Product Spec

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

## Product Standard

ScaleX proves a real client-operations loop: intake a repeatable client operation, route the work
through Hermes, create finance proof through Stripe test mode, approve only policy-safe spend,
coordinate agent work, record evidence, and produce a protected-profit report.

Product mode is real-integration-first. Test doubles are for automated tests, CI, offline
development, or explicitly labeled diagnostics. Product-mode integration failures must become
visible error states.

Connection Hub and MCP planning must preserve ScaleX ClientOps Autopilot as the product. ScaleX
is not a generic MCP platform, generic connector marketplace, integration dashboard, Zapier/n8n
clone, developer tool first, or AI agent playground.

## Problem Statement

B2B teams struggle to turn signed client work into coordinated execution because onboarding,
billing, vendor spend, approvals, task routing, and reporting are fragmented. ScaleX gives them a
governed AI operations layer that can run those functions safely.

## Implemented Today

- Local FastAPI backend and Vite React product shell.
- Local prototype auth gate.
- SQLite-backed local/sample client operation management with Northstar Dental Group defaults.
- Product navigation for Dashboard, Function Studio, Onboarding, Client Operations, Runs,
  Evidence Ledger, Integrations, and Settings.
- Connected Function Studio page for the autonomous run, with approved setup spend and blocked risk branches.
- Right selected-node inspector for Run Summary, Client Intake, Hermes Plan, Finance Proof,
  Revenue Gate, Guardrail Review, Approved Resources, Blocked Risk, Evidence Ledger, and Profit
  Outcome proof.
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
- Judge Demo Mode as the default safe local execution path without real secrets.
- Full Proof Mode for safely configured real isolated Hermes plus real Stripe test mode.

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

## Execution Experience

Goal 7.12 made `Start Run` visibly execute the Northstar Client Implementation Launch from start
to finish:

- Run started.
- Hermes planning step.
- Stripe finance proof step.
- Guardrail review step.
- Approved setup spend step.
- Blocked risk step.
- Work execution step.
- Evidence ledger step.
- Profit outcome step.
- Run completed, or clearly failed with an actionable reason.

Product behavior:

- `Start Run` shows a visible running/loading state.
- Function Studio shows step progression.
- Function Map highlights pending, running, complete, and blocked states.
- Evidence Drawer updates with meaningful proof.
- Runs gets a new execution.
- Evidence Ledger gets timeline, orchestration, ledger, Stripe, and policy proof.
- Dashboard reflects latest run status.
- Counts change from zero when a run completes.
- Failure states are visible and actionable.

Execution modes:

- Judge Demo Mode works without secrets, uses deterministic local proof/test-double paths, creates
  local SQLite records, populates Runs and Evidence Ledger, labels output as demo/sandbox proof,
  and does not claim real Stripe or real Hermes unless real adapters were used.
- Full Proof Mode uses real isolated Hermes and real Stripe test mode when local ignored `.env`
  values are safely configured, keeps Stripe `livemode=false`, shows hosted invoice URLs only when
  available, never labels `paid=false` as paid, and shows visible integration errors if configured
  incorrectly.

Goal 7.12 must preserve the current truthfulness boundaries: Northstar is synthetic, no patient
data, no PHI, no HIPAA claim, local policy active now, NeMo Guardrails planned/not wired, no
live-money support, no production auth claim, and demo mode must not pretend to be real
integration mode.

## Connection Hub Product Layer

ScaleX Connection Hub is planned as an internal product layer that shows what systems the
ClientOps Autopilot is allowed to use. It is not the product itself.

Connection Hub should answer:

- Which systems can the agent use?
- Which systems are active today?
- Which systems are in Judge Demo Mode?
- Which systems are in Full Proof Mode?
- Which systems are planned?
- Which connector is missing configuration?
- Which actions are blocked by policy?
- Which actions are unavailable or failed closed?
- What evidence was recorded?

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

Connector statuses:

- active
- demo mode
- full proof mode
- planned
- missing config
- blocked by policy
- unavailable
- failed closed

The Connection Hub should strengthen the ClientOps story by making execution authority visible
inside a client operation. It should not read as a connector marketplace or generic integration
dashboard.

## Full Proof Mode Product Plan

Full Proof Mode is the final local real-tool demo target when safe ignored `.env` credentials are
configured.

Target Full Proof Mode:

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

- Hermes proof shows `used_real_hermes=true` when real isolated Hermes ran and identifies the
  planning source as real/isolated Hermes.
- Stripe proof shows `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`, invoice
  ID, hosted invoice URL when provided, and no paid claim unless `paid=true`.
- Policy proof shows local policy active, $1,150 approved setup spend, $3,200 Unapproved Data
  Broker Enrichment blocked risk, 50% margin floor, and 86.5% protected margin.
- Evidence proof shows timeline, orchestration/tool call records, Stripe finance proof, policy
  checks, ledger entries, and final profit outcome.

Invoice lifecycle:

- Hermes plans the finance step.
- Hermes does not create or send invoices directly.
- ScaleX backend executes approved finance actions.
- In Full Proof Mode, ScaleX uses Stripe test mode to create/finalize the invoice.
- Stripe returns invoice proof objects and hosted invoice URL when available.
- ScaleX stores invoice proof in the Evidence Ledger.
- Demo mode creates sandbox finance proof and does not call Stripe.
- No mode should claim a real client was emailed unless an explicit send step exists and is
  verified.

## Future MCP Boundary

MCP is not the main product story. It is a future access pattern that could let external agents
call ScaleX safely through approved tools, resources, and prompts.

ScaleX does not currently have an MCP server, external agents cannot yet call ScaleX through MCP,
and NeMo Guardrails is not wired yet.

Future MCP tools may include `scalex_list_operations`, `scalex_get_operation`,
`scalex_start_run`, `scalex_get_run`, `scalex_get_evidence`, `scalex_get_connector_status`, and
`scalex_get_profit_outcome`.

Future MCP resources may include `scalex://operations/current`, `scalex://runs/{run_id}`,
`scalex://evidence/{run_id}`, `scalex://policy/current`, and `scalex://connectors/status`.

Future MCP prompts may include `client_implementation_launch`, `invoice_to_cash`,
`vendor_spend_review`, and `client_onboarding`.

MCP tools must not expose secrets, bypass local policy or future NeMo guardrails, touch live
money, use real client data, or skip evidence records. Action tools should fail closed when
configuration or policy is invalid.

## Target Integrations

- Hermes = planning and routing the client operation.
- Connection Hub = allowed systems, connector modes, guardrails, missing config, blocked actions,
  and evidence duties.
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
