# ScaleX Governed ClientOps Demo Script

## Implemented Story

Enterprises want AI agents to help run client operations, but they cannot let raw agents touch
money, vendors, client workflows, approvals, or internal systems without proof and policy. ScaleX
is the governed execution layer that turns paid client work into finance-backed,
policy-checked, guardrailed, auditable AI execution.

Core demo line:

> ScaleX helps enterprise teams safely turn paid client work into governed AI-executed operations.
> Hermes plans the work, Stripe proves the financial state, NeMo checks actions before execution,
> and ScaleX records the evidence, blocks unsafe spend, and reports protected profit.

Implemented template:

- Client Implementation Launch
- Northstar Dental Group
- Synthetic multi-location client account
- No patient data, no PHI, no healthcare compliance claim, and no HIPAA support claim
- $8,500 implementation package revenue
- $3,935 approved delivery cost basis
- $1,150 approved setup/tool spend inside that cost basis
- $950 loaded labor cost inside that cost basis
- $3,200 blocked risk
- $4,565 protected profit in the current API-backed control-room profit outcome
- 53.7% protected margin in the current API-backed control-room profit outcome
- 16.1% margin if the risky vendor spend were approved, blocked below the 50.0% margin floor

## Recording Path

Use this three-minute script for the recording. The current Goal 8O control-room shell keeps the
app API-backed, demo-safe, and focused on the Northstar operation, current ScaleX logo treatment,
mode clarity, proof artifacts, governed rails, and the blocked-risk moment.

0:00-0:10
Enterprises want AI agents, but cannot let raw agents touch money, vendors, client workflows, or
internal systems without proof and policy.

0:10-0:25
This is ScaleX: a governed execution layer for revenue-backed client operations.

0:25-0:45
Show the fixed dashboard metric strip for Northstar Dental Group / Client Implementation Launch:
revenue secured $8,500, approved costs $3,935, risk contained $3,200, protected profit $4,565,
and protected margin 53.7%. Mention that the Cost Basis panel includes $950 loaded labor plus
campaign/media, materials, fees, QA/compliance overhead, and contingency reserve.

0:45-1:10
Show the right-side proof tabs: Hermes Plan, Stripe Proof, and NeMo / Local Guardrails. Emphasize
that Judge Demo Mode is deterministic/local, Stripe Sandbox Prototype uses real test-mode objects
only when configured safely, `livemode=false` remains visible, and NeMo is claimed only when
runtime evidence proves it; otherwise local policy is shown. NemoClaw/NemoHermes routing is
optional and shown only as selected/verified runtime proof.

1:10-1:45
Click `Start Governed Run` and show the governed rails animate: input rail, Hermes plan, planning
rail, Stripe finance rail, revenue gate, policy rail, approved spend, blocked spend, execution
rail, and profit rail. Pause on the blocked $3,200 risky vendor action as the blocked-risk metric,
rail badge, and evidence drawer make the stop decision obvious. Call out that approving the risky
vendor spend would drop margin to 16.1%, below the 50.0% floor.

1:45-2:15
Open Evidence Ledger: enterprise audit rows and proof artifacts show actor/system, action,
evidence type, safety note, result badge, no live-money mode, no secrets stored, and paid-state
honesty.

2:15-2:45
Open Connection Hub and Settings/Boundaries: Hermes, Stripe, NeMo Guardrails/local policy,
NemoClaw/NemoHermes optional routing, SQLite evidence, runtime mode, active operation,
guardrails, money movement, and records remain truthfully labeled.

2:45-3:00
Close: ScaleX gives enterprises a safe way to let AI execute paid client operations without losing
control of money, margin, compliance, or audit.

Supporting modules to mention only if time allows: Business Intake, Document Intake Review, and
Workforce Costing. They show ScaleX knows client context, labor cost, spend risk, and margin
before allowing actions.

No terminal output should be needed in the video. Hosted judge demo mode must not expose secrets.
Local full-proof mode can use ignored `.env` values for real isolated Hermes and real Stripe
test-mode invoice proof.

## Demo Acceptance

The demo should show:

- The app feels like an operating dashboard/control room, not only a linear wizard.
- The first screen clearly states: governed execution for revenue-backed client operations.
- The first screen shows: Hermes plans -> Stripe proves -> NeMo checks -> ScaleX records.
- Northstar Dental Group / Client Implementation Launch is preloaded with revenue, approved
  spend, blocked risk, labor cost, protected profit, and protected margin visible.
- `Start Governed Run` and `Review Evidence Ledger` are visible from the first screen.
- The enterprise pain and ScaleX control answer are visible in concise product language.
- Mission Control exposes client/job economics, runtime mode, labor cost, margin, and safe status.
- Client and employee onboarding support manual entry, upload intake, extracted-data review,
  edit-before-save, save/confirm, and edit-after-save.
- Document intake shows unsupported-file and extraction-failed states without silently saving data.
- Workforce / Labor Cost Panel shows fake/demo employees, loaded hourly rates, assigned hours,
  total labor cost, and margin after labor.
- Economic Control Panel uses `Margin = (Revenue - Approved Vendor Spend - Labor Cost) / Revenue`.
- Policy / Guardrail Console shows approved and blocked policy checks as first-class proof.
- Agent Workbench shows Orchestrator, Finance, Marketing, Research, and Ops workers when data is
  available.
- Judge Proof / Audit Ledger shows safety proof without secrets, raw file contents, or sensitive
  personal data.
- `Start Governed Run` has an obvious running/loading state.
- Governed Run Studio shows rail progression.
- Function Map highlights pending, running, complete, and blocked states.
- Evidence Drawer updates with meaningful proof for Hermes, Finance Proof, Guardrail Review,
  Blocked Risk, Evidence Ledger, and Profit Outcome.
- Runs receives a new execution.
- Evidence Ledger receives timeline, orchestration, ledger, Stripe, and policy proof.
- Dashboard reflects latest run status.
- Counts change from zero when the run completes.
- Failure states are visible and actionable.

## Execution Modes

Judge Demo Mode:

- Works without secrets.
- Uses deterministic local proof/test-double paths.
- Creates local SQLite records.
- Populates Runs and Evidence Ledger.
- Labels output as demo/sandbox proof.
- Does not claim real Stripe or real Hermes unless real adapters were used.

Full Proof Mode:

- Uses real isolated Hermes and real Stripe test mode when ignored local `.env` values are
  configured safely.
- Preserves existing real proof behavior.
- Keeps Stripe `livemode=false`.
- Shows hosted invoice URL only when available.
- Does not show `paid=false` as paid.
- Shows visible errors if configured incorrectly.

Stripe Sandbox Prototype:

- Uses real Stripe test-mode objects only when a safe local test key is configured and product
  settings allow test mode.
- Keeps `livemode=false`, invoice status, paid state, and hosted invoice URL honest.
- Falls back to clearly labeled Judge Demo Mode/test-double proof for the default recording path.
- Never enables live-money behavior.

Verified Live Mode:

- Future-only and locked.
- No live-money execution is implemented for the submission demo.

Truthfulness boundaries remain: Northstar is synthetic; no patient data; no PHI; no HIPAA claim;
local policy active now; NeMo Guardrails adapter proof is optional through `nemo_guardrails` only
when runtime verification passes; NemoHermes API routing is optional through
`HERMES_RUNTIME=nemoclaw` only when the selected local runtime call succeeds; Telegram approval is
planned and not implemented; document intake is demo-safe and requires review; labor costing is
not payroll processing; no live-money support; no production auth claim.

## Full Proof Mode Real-Tool Demo Plan

The target final local recording mode is Full Proof Mode when safe ignored local credentials are
configured:

- real isolated Hermes planning or selected NemoHermes API planning;
- real Stripe test-mode invoice creation/finalization;
- local policy guardrails;
- SQLite evidence ledger;
- synthetic Northstar data only;
- no live money;
- no real client email;
- no patient data and no PHI;
- NeMo Guardrails adapter claim only when `nemo_guardrails` runtime verification has passed;
- NemoHermes claim only when `HERMES_RUNTIME=nemoclaw` was selected and the local API call
  succeeded.

What to say:

> Judge Demo Mode works safely without secrets. Full Proof Mode shows real isolated Hermes
> planning and real Stripe test-mode invoice creation. Both modes enforce local policy, block
> risky spend, record evidence, and report protected profit. The configured Full Proof validation
> also verified the NeMo Guardrails adapter runtime while local policy remained the deterministic
> business-rule gate. Optional NemoHermes API routing is available when selected and verified.

Hermes proof should show `used_real_hermes=true` only when the selected real Hermes path ran
successfully. Stripe proof should show `used_real_stripe=true`, `stripe_mode=stripe_test`,
`livemode=false`, invoice ID, hosted invoice URL when Stripe provides it, and no paid claim unless
Stripe reports `paid=true`.

Goal 7.14B Full Proof local validation passed with synthetic Northstar data only:
`used_real_hermes=true`, `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`,
Stripe invoice ID present, hosted invoice URL present, `paid=false` preserved as unpaid, no real
client email, `used_real_nemo=true`, `adapter_status=runtime_verified`, `fail_closed=false`, and
local policy active. This verified the NeMo Guardrails adapter through `nemoguardrails`, not actual
NemoClaw. SQLite evidence recorded one planning run, four Stripe events, four policy checks, four
guardrail evaluations, 19 orchestration calls, 14 events, one report, and four ledger entries. The
blocked Unapproved Data Broker Enrichment spend created policy/evidence records but no spend
ledger row.

## Invoice Lifecycle Clarity

- Hermes plans the finance step.
- Hermes does not create or send invoices directly.
- ScaleX backend executes approved finance actions.
- In Full Proof Mode, ScaleX uses Stripe test mode to create/finalize the invoice.
- Stripe returns invoice proof objects and hosted invoice URL when available.
- ScaleX stores invoice proof in the Evidence Ledger.
- Demo mode creates sandbox finance proof and does not call Stripe.
- Full Proof Mode invoice creation/finalization is proof only and must not be presented as sending
  an invoice email to a real client.
- No mode should claim a real client was emailed unless an explicit send step exists and is
  verified.

## Connection Hub / MCP Framing

Connection Hub is the ScaleX layer that declares allowed systems, connector modes, guardrails,
blocked actions, missing configuration, planned-only boundaries, and recorded evidence. It
supports the ClientOps Autopilot story and should not become the demo centerpiece.

MCP is a future access pattern only. Do not say ScaleX has an MCP server or external agent MCP
access. MCP is paused until approval-gate planning/implementation or explicit deferral,
command-center product-story review, and guardrail/tool-boundary review. Do not say the NeMo Guardrails
adapter is active unless `nemo_guardrails` runtime verification passes. `nemo_compatible` must be
described as a fallback and not real NeMo. Do not say actual NemoClaw is active.

## Goal 8G Product Path

Goal 8G should make the browser path feel like a repeatable enterprise product:

1. Command Center with Northstar Dental Group, Client Implementation Launch, $8,500 revenue,
   $3,935 approved delivery cost basis, $3,200 blocked risk, $950 loaded labor cost inside Cost
   Basis, $4,565 protected profit, 53.7% protected margin, and `Start Governed Run`.
2. Start Governed Run.
3. Governed Run Studio / run timeline showing input rail, Hermes plan, planning rail, Stripe
   finance proof, revenue gate, NeMo/local policy check, approved setup spend, blocked risky
   vendor/data enrichment spend, Evidence Ledger, output rail, and Profit Outcome.
4. Evidence Ledger drill-down showing guardrail truth, Stripe honesty, blocked risk, no blocked
   spend ledger row, and profit outcome.
5. Connection Hub showing ClientOps operating boundary: active today, Full Proof verified/capable,
   evidence recorded, planned only, missing config, and fail closed.
6. Profit Outcome close.

Telegram should appear only as planned/deferred. Its future role is a human approval gate for
risky actions, not a chatbot-first surface.

## Goal 8H Cinematic Recording Path

Goal 8H is complete as a visual storytelling redesign, not a new integration. The final recording
should open on the premium governed-execution control room, not a form or configuration console.

0:00-0:10 - Show the hero:
Enterprise teams want AI agents, but cannot let raw agents touch money, vendors, client
workflows, or systems without proof, policy, money control, and audit.

0:10-0:25 - Show ScaleX:
Governed execution for revenue-backed client operations. Hermes plans, Stripe proves, NeMo checks,
ScaleX records evidence, blocks unsafe execution, and protects profit.

0:25-0:45 - Show Northstar metrics:
Northstar Dental Group / Client Implementation Launch, $8,500 revenue secured, $1,150 approved
setup/tool spend inside $3,935 approved costs, $3,200 blocked risk, $950 loaded labor cost inside
Cost Basis, $4,565 protected profit, and 53.7% protected margin.

0:45-1:10 - Show the Control Stack:
Hermes creates the plan, Stripe proves finance state, NeMo/local policy checks risk, and ScaleX
executes only what is allowed while recording proof.

1:10-1:45 - Click Start Governed Run:
The governed run stage should show Input Rail passed, Hermes Plan created, Planning Rail
approved, Stripe Finance Proof verified, Revenue Gate passed, NeMo/local policy checked,
Controlled Spend approved, Risky Vendor Action blocked, Evidence Ledger recorded, Output Honesty
Rail verified, and Profit Outcome protected.

1:45-2:15 - Show Evidence Ledger:
What happened, what was approved, what was blocked, what proof exists, safety notes, no
live-money mode, no secrets stored, and final protected profit.

2:15-2:45 - Show Profit Report:
Revenue, approved setup spend, labor cost, blocked risky spend, protected profit, protected
margin, and margin floor.

2:45-3:00 - Close:
ScaleX gives enterprises a safe way to let AI execute paid client operations without losing
control of money, margin, compliance boundaries, or audit.
