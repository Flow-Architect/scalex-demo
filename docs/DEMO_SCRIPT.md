# ScaleX ClientOps Autopilot Demo Script

## Implemented Story

A B2B company has sold an implementation package to a new client. ScaleX launches the client
operation, confirms revenue, creates finance proof, checks business rules, blocks risky spend,
coordinates work units, records evidence, and reports protected profit.

Implemented template:

- Client Implementation Launch
- Northstar Dental Group
- Synthetic multi-location client account
- No patient data, no PHI, no healthcare compliance claim, and no HIPAA support claim
- $8,500 implementation package revenue
- $1,150 approved setup spend
- $3,200 blocked risk
- $7,350 protected gross profit
- 86.5% protected margin

## Recording Path

Goal 8F should make the browser path feel like a command center for profit-aware agent operations,
not only a scripted wizard. Keep one-click run, but surround it with proof panels for runtime
routing, onboarding, document intake, labor costing, policy, agents, evidence, and final profit.

1. Login.
2. Open the command-center view and show Mission Control: active client, active job/campaign,
   invoice amount, spend cap, margin floor, runtime mode, approved vendor spend, labor cost,
   projected/final profit, final margin, and protected/safe status.
3. Show Runtime / Connection Hub. In Judge Demo Mode, call out deterministic local proof. If
   NemoHermes is selected, show the non-secret route: ScaleX -> Hermes Adapter -> NemoHermes API
   -> local OpenAI-compatible endpoint -> model/provider, plus status, duration, and error class
   when present.
4. Show Client Onboarding Center with manual entry and file intake tabs/buttons. Upload/extraction
   is demo-safe; extracted values are reviewed and edited before save.
5. Show Employee Onboarding Center with manual entry and file intake tabs/buttons. Employee labor
   assumptions are fake/demo only and reviewed before save.
6. Show Workforce / Labor Cost Panel and explain fully loaded hourly rate, assigned hours, labor
   cost by employee, total labor cost, and margin after labor. State that this is job costing, not
   payroll processing.
7. Click `Start Run` from the command center or Function Studio.
8. Watch run progression through Run Started, Hermes Plan, Stripe Finance Proof, Revenue Gate,
   Guardrail Review, Approved Resources, Blocked Risk, Work Execution, Evidence Ledger, and Profit
   Outcome. In Judge Demo Mode, call out Demo proof mode, deterministic local planning,
   Stripe test-double/sandbox proof, and local policy active.
9. Click Hermes Plan and show the generated plan summary, proposed tool sequence, and either
   `used_real_hermes=true` for Full Proof Mode or deterministic local plan proof for Demo proof mode.
10. Click Stripe Finance Proof and show either real Stripe test-mode proof with `livemode=false`
   and `paid=false` unless Stripe reports paid, or Stripe test-double/sandbox proof in Demo proof mode.
11. Click Guardrail Review and show guardrail mode/status, `used_real_nemo`, `fail_closed`, input /
   planning / execution / output evaluations, and local policy active now.
12. Click Blocked Risk and show why the blocked request was
   blocked and that no spend ledger row was created for it.
13. Show Economic Control Panel and Final Profit Report with revenue, approved vendor spend,
    blocked spend, labor-cost breakdown, gross profit after labor, final margin after labor,
    margin floor, policy violations or blocked actions, and recommendation.
14. Open Judge Proof / Audit Ledger and show chronological job creation, onboarding, document
    extraction/review, runtime selection, Stripe/test payment, policy checks, ledger entries,
    labor-cost calculations, agent outputs, and final report.
15. Logout.

No terminal output should be needed in the video. Hosted judge demo mode must not expose secrets.
Local full-proof mode can use ignored `.env` values for real isolated Hermes and real Stripe
test-mode invoice proof.

## Demo Acceptance

The demo should show:

- The app feels like an operating dashboard/control room, not only a linear wizard.
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
- `Start Run` has an obvious running/loading state.
- Function Studio shows step progression.
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

## Future 90-Second Product Path

Goal 8F should make the browser path feel like a repeatable enterprise product:

1. Command Center with Northstar Dental Group, Client Implementation Launch, $8,500 revenue,
   $1,150 approved setup spend, $3,200 blocked risk, $7,350 protected profit, 86.5% protected
   margin, and `Start Governed Run`.
2. Start Governed Run.
3. Function Studio / Run timeline showing input rail, Hermes plan, planning rail, Stripe finance
   proof, execution rail, policy block, Telegram approval if implemented, Evidence Ledger, output
   rail, and Profit Outcome.
4. Evidence Ledger drill-down showing guardrail truth, Stripe honesty, blocked risk, no blocked
   spend ledger row, and profit outcome.
5. Connection Hub showing ClientOps operating boundary: active today, Full Proof verified/capable,
   evidence recorded, planned only, missing config, and fail closed.
6. Profit Outcome close.

Telegram should appear only as planned until Goal 8F implements it. Its role is a human approval
gate for risky actions, not a chatbot-first surface.
