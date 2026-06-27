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
governed execution layer for revenue-backed client operations, so agents can touch operations,
finance proof, approvals, and evidence only inside safe boundaries.

## Goal 8F Scope - Command Center, Intake, And Labor Costing

Goal 8F deepens ScaleX from a mostly linear run demo into a profit-aware agent command center for
service businesses. The product surface should expose runtime routing, client onboarding,
employee onboarding, document intake, labor costing, economic controls, policy guardrails, agent
work, judge proof, audit evidence, and final profit reporting as first-class operating panels.

This goal adds:

- client onboarding with manual entry and demo-safe document intake;
- employee onboarding with manual entry and demo-safe document intake;
- document-intake review before any extracted values are saved;
- labor costing so service profitability includes employee labor after approved vendor spend;
- richer command-center sections around runtime routing, economics, policy, agents, and evidence.

This goal preserves deterministic Judge Demo Mode, the isolated Hermes path, optional NemoHermes
runtime routing, fail-closed behavior, existing Stripe test-mode boundaries, local policy
guardrails, and SQLite evidence. It does not add live-money behavior, production payroll, HR
compliance processing, tax processing, real client data, real employee records, or external
document extraction services.

## Command Center Sections

Goal 8F should organize the primary UI as an operating dashboard/control room with these sections:

- Mission Control: active client, active job/campaign, invoice amount, spend cap, margin floor,
  approved vendor spend, labor cost, projected/final profit, final margin, selected runtime mode,
  and overall safe/protected status.
- Runtime / Connection Hub: route and non-secret runtime proof, including deterministic Judge
  Demo Mode, isolated Hermes, or selected NemoHermes API routing.
- Client Onboarding Center: manual client entry, file intake, extracted-data review, edit before
  save, and edit after save.
- Employee Onboarding Center: manual employee entry, file intake, extracted-data review, edit
  before save, and edit after save.
- Document Intake Review: upload status, extracted values, missing fields, low-confidence values,
  unsupported-file or extraction-failed states, and explicit save/confirm actions.
- Workforce / Labor Cost Panel: onboarded employees, role/title, rates, burden, assigned hours,
  labor cost by employee, total labor cost, and margin after labor.
- Economic Control Panel: revenue, approved vendor spend, blocked spend, labor cost, gross profit
  after vendor spend and labor, projected/final margin, and margin floor.
- Policy / Guardrail Console: approved and blocked policy checks, margin impact, required action,
  and proof that blocked spend does not update the ledger.
- Agent Workbench: Orchestrator, Finance Agent, Marketing Agent, Research Agent, and Ops Agent
  work as separate visible workers when current demo data includes them.
- Judge Proof / Audit Ledger: chronological proof across job creation, onboarding, extraction,
  runtime selection, finance proof, policy checks, labor costing, agent outputs, and final report.
- Final Profit Report: client/job summary, revenue, approved vendor spend, blocked spend, labor
  breakdown, gross profit after labor, final margin, margin floor, blocked actions, and
  recommendation.

## Client Onboarding Requirements

Client onboarding must support manual entry and demo-safe upload intake for PDF, Excel/spreadsheet
files such as `.xlsx` or `.xls`, Word/document files such as `.docx` or `.doc`, and CSV if easy in
the existing stack. CSV may not replace Excel support. Extracted values must be reviewed and
editable before save, and saved client records must remain editable after save.

Client fields:

- client name;
- business type;
- primary contact;
- contact email and phone when already present in demo data;
- job/campaign name;
- job/campaign goal;
- invoice amount;
- spend cap or budget;
- margin floor or target;
- service notes.

## Employee Onboarding Requirements

Employee onboarding must support manual entry and demo-safe upload intake for PDF,
Excel/spreadsheet, Word/document, and optional CSV files. Extracted values must be reviewed and
editable before save, and saved employee records must remain editable after save.

Employee fields:

- employee name;
- role/title;
- base hourly rate;
- labor burden/overhead percentage;
- fully loaded hourly rate;
- estimated availability or assigned hours when provided;
- skill/category when useful;
- active/inactive status;
- notes.

## Document Intake Behavior

Upload intake is demo-safe and not production OCR. Preferred behavior is deterministic demo
extraction fixtures if real parsing would slow the build, with basic local parsing only when easy
in the current stack.

Rules:

- no external extraction services;
- no external credentials;
- no silent saving of extracted data;
- manual entry remains available after extraction failure;
- unsupported-file and extraction-failed states are shown clearly;
- uploaded files are not permanently stored unless a safe demo storage pattern already exists;
- no real uploaded files are committed.

## Labor Costing Model

Labor costing rules:

- fully loaded hourly rate = base hourly rate * (1 + labor burden percentage);
- labor cost = fully loaded hourly rate * assigned hours;
- job profit = revenue - approved vendor spend - labor cost;
- final margin = job profit / revenue.

Labor cost must feed Mission Control, Workforce / Labor Cost Panel, Economic Control Panel, Final
Profit Report, and margin warnings when labor pushes the job below the configured margin floor.
The UI should clearly state that this is demo-safe job costing, not payroll processing.

## Goal 8F Safety Boundaries

Goal 8F uses fake/demo clients and fake/demo employees only. It must not collect, display, store,
or imply support for SSNs, tax IDs, bank information, addresses, birth dates, real HR records, or
sensitive payroll records. It is not production payroll, HR compliance processing, tax processing,
or live-money operation.

No secrets are stored. Deterministic Judge Demo Mode, the isolated Hermes path, optional
NemoHermes runtime routing, and fail-closed behavior are preserved. The app must not log raw file
contents, secrets, sensitive personal data, tokens, raw credential headers, or `.env` values.

## Goal 8F Audit Expectations

Non-secret audit/proof events may include:

- client manually created;
- client extracted from file;
- client edited;
- employee manually created;
- employee extracted from file;
- employee edited;
- extraction failed;
- labor cost calculated;
- margin warning produced;
- policy check approved;
- policy check blocked.

## Implemented Today

- Local FastAPI backend and Vite React product shell.
- Local prototype auth gate.
- SQLite-backed local/sample client operation management with Northstar Dental Group defaults.
- Product navigation for Dashboard, Function Studio, Onboarding, Client Operations, Runs,
  Evidence Ledger, Connection Hub, and Settings.
- Connected Function Studio page for the autonomous run, with approved setup spend and blocked risk branches.
- Right selected-node inspector for Run Summary, Client Intake, Hermes Plan, Finance Proof,
  Revenue Gate, Guardrail Review, Approved Resources, Blocked Risk, Evidence Ledger, and Profit
  Outcome proof.
- Command Center sections for Mission Control, Runtime / Connection Hub, Client Onboarding Center,
  Employee Onboarding Center, Document Intake Review, Workforce / Labor Cost Panel, Economic
  Control Panel, Policy / Guardrail Console, Agent Workbench, Judge Proof / Audit Ledger, and Final
  Profit Report.
- Demo-safe client and employee intake review with local browser-only manual/edit/save controls
  and upload-triggered deterministic extraction fixtures.
- Labor costing that includes fake/demo employee fully loaded rates, assigned hours, labor cost,
  profit after approved vendor spend and labor, final margin, and margin warning state.
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
- Optional NeMo Guardrails adapter proof through `nemoguardrails` runtime verification.
- Optional NVIDIA NemoClaw / OpenShell / `nemohermes` routing through
  `HERMES_RUNTIME=nemoclaw` when the local API is already validated.
- Telegram approval and MCP are planned only.

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
- Full Proof Mode uses real isolated Hermes or selected NemoHermes API planning plus real Stripe
  test mode when local ignored `.env` values are safely configured, keeps Stripe `livemode=false`,
  shows hosted invoice URLs only when available, never labels `paid=false` as paid, and shows
  visible integration errors if configured incorrectly.

Truthfulness boundaries: Northstar is synthetic, no patient data, no PHI, no HIPAA claim, local
policy active now, default guardrail mode is `local_policy`, optional NeMo Guardrails adapter proof
requires `nemo_guardrails` runtime verification, optional NemoHermes requires selected-runtime API
verification, Telegram approval is not implemented, no live-money support, no production auth
claim, and demo mode must not pretend to be real integration mode.

## Connection Hub Product Layer

ScaleX Connection Hub is an implemented internal product layer that shows what systems the
ClientOps Autopilot is allowed to use. It is not the product itself.

Connection Hub answers:

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

## Product Depth + Demo-Winning UI Plan

The current UI/product surface may feel too simple even though backend proof is strong. Goal 8F
absorbs the product-depth plan and should make ScaleX feel like a repeatable enterprise command
center, not a one-off Northstar workflow.

Required future improvements:

1. Demo-friendly auth / login first impression: local demo access should look intentional; if
   auth is enabled locally with demo credentials, show prototype local auth clearly and do not
   claim production auth. Avoid scary missing-config warnings in normal Judge Demo Mode.
2. Command Center hero: immediately show Northstar Dental Group, Client Implementation Launch,
   revenue secured $8,500, approved setup spend $1,150, blocked risk $3,200, protected profit
   $7,350, protected margin 86.5%, and `Start Governed Run`.
3. Operation Catalog: show ScaleX is repeatable across Client Implementation Launch active demo,
   Invoice-to-Cash Follow-Up planned, Vendor Spend Review planned, Client Onboarding Checklist
   planned, and Renewal Risk Review planned.
4. Policy / Risk Library: show payment before spend, margin floor 50%, vendor allowlist/blocklist,
   blocked data broker enrichment, no PHI/patient data, no live money, no real client email, human
   approval over $1,000, NeMo Guardrails runtime verification, and NemoClaw sandbox target once
   wired.
5. Run story timeline: input rail, Hermes plan, planning rail, Stripe finance proof, execution
   rail, policy block, Telegram approval if required, Evidence Ledger, output rail, and Profit
   Outcome.
6. Evidence drill-down: input rail passed, Hermes plan recorded, Stripe test invoice created when
   real test mode is used, NeMo Guardrails runtime verified when applicable, approved setup spend,
   policy-blocked data broker enrichment, no ledger spend row for blocked action, `paid=false`
   honesty, and Profit Outcome recorded.
7. Guardrail proof: `local_policy` default, NeMo Guardrails optional/runtime verified when state
   says so, NemoClaw target not active yet, `used_real_nemo`, `fail_closed`, rail decisions, and
   blocked-spend no-ledger-row proof.
8. Stripe proof honesty: test-double in Judge Demo Mode, real Stripe test mode only when
   `used_real_stripe=true`, invoice ID/hosted invoice URL only when available, `paid=false`
   remains unpaid, and no live money.
9. Connection Hub polish: Active Today, Full Proof Verified / Capable, Evidence Recorded, Planned
   Only, Missing Config, and Fail Closed sections for Hermes Planning, Stripe Finance Proof, NeMo
   Guardrails / local policy, NemoClaw / OpenShell Sandbox target, SQLite Evidence Ledger,
   Prototype Auth, Telegram Approval Gate planned, Slack/Email, CRM, Docs/Notion, Calendar
   planned, and MCP planned only.
10. Demo recording path: Command Center -> Start Governed Run -> Function Studio / Run timeline ->
    Evidence Ledger -> Connection Hub -> Profit Outcome, with optional Telegram approval moment
    once implemented.

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
- no NeMo Guardrails adapter claim unless runtime verified;
- no NemoClaw claim until actual NemoClaw is installed, onboarded, connected, and verified.

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

ScaleX does not currently have an MCP server, and external agents cannot yet call ScaleX through
MCP.

MCP is paused until the Telegram approval gate is planned or implemented or explicitly deferred,
the command-center product story is strong enough, and the guardrail/tool boundary remains safe.

Future MCP tools may include `scalex_list_operations`, `scalex_get_operation`,
`scalex_start_run`, `scalex_get_run`, `scalex_get_evidence`, `scalex_get_connector_status`, and
`scalex_get_profit_outcome`.

Future MCP resources may include `scalex://operations/current`, `scalex://runs/{run_id}`,
`scalex://evidence/{run_id}`, `scalex://policy/current`, and `scalex://connectors/status`.

Future MCP prompts may include `client_implementation_launch`, `invoice_to_cash`,
`vendor_spend_review`, and `client_onboarding`.

MCP tools must not expose secrets, bypass local policy, bypass NeMo Guardrails adapter checks,
bypass future NemoClaw boundaries, bypass Telegram approval gates, touch live money, use real
client data, use PHI, or skip evidence records. Start read-only first. Action tools should fail
closed when configuration or policy is invalid.

## Telegram Approval Gate Plan

Telegram is planned as a human approval channel for risky actions, not as a chatbot-first feature.
ScaleX should detect approval-required actions, create a pending request, send an approval message,
verify an authorized approve/deny decision, resume or block the action, and record evidence.

Approval candidates include spend above threshold, vendor spend near margin floor, real Stripe
invoice send if ever enabled, real client email if ever enabled, external connector actions, and
future MCP action requests.

Actions that must be blocked outright instead of approval-routed: PHI/patient data, live-money
attempts, disallowed real client data, direct secret exposure, and policy bypass attempts.

Safety rules: allowlisted chat IDs only, no secrets in messages, no PHI/patient data in messages,
signed one-time approval token or approval ID, expiry, deny/expired fail closed, approval never
bypasses NeMo/local policy/NemoClaw boundaries, re-check policy before execution, and write
evidence for every approval or denial.

## Target Systems

- Hermes = planning and routing the client operation.
- Connection Hub = allowed systems, connector modes, guardrails, missing config, blocked actions,
  and evidence duties.
- Stripe = finance proof / invoice / payment state.
- ScaleX = execution and policy authority.
- Local policy now = spend, margin, vendor, and payment-before-spend enforcement.
- NeMo Guardrails adapter = optional `nemo_guardrails` mode after runtime verification.
- Actual NVIDIA NemoClaw / OpenShell / `nemohermes` = optional sandboxed Hermes runtime through
  the local NemoHermes API when selected and verified.
- Telegram = planned human approval channel.
- SQLite = evidence ledger.
- Profit Outcome = protected profit and blocked risk result.

## Boundaries

Live-money payments, real client data, production Hermes, production Prometheus,
homelab/OpenClaw, Recall memory, production auth, hosted secret exposure, and production SaaS
features are out of scope. Local/sample workflow management demonstrates the product path;
production multi-client onboarding is future work. Future live-money payments require Verified
Live Mode. Real NVIDIA NeMo Guardrails adapter use is optional through `nemo_guardrails` mode only
when the configured runtime verifies successfully. `nemo_compatible` is a labeled fallback and
must not claim real NeMo. Actual NemoClaw and Telegram approval must not be claimed until
implemented and verified.
