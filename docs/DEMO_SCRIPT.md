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

Goal 7.12 should make the `Start Run` portion of this path visibly execute before final
recording. The expected product motion is: run started, Hermes planning, Stripe finance proof,
guardrail review, approved setup spend, blocked risk, work execution, evidence ledger, profit
outcome, and then run completed or a clearly actionable failure.

1. Open ScaleX ClientOps Autopilot.
2. Log in through the local prototype auth gate.
3. Land on Dashboard and confirm Northstar Dental Group / Client Implementation Launch is selected.
4. If the sample is not selected, use `Configure Northstar sample`, then load and save/select the
   Northstar sample from Onboarding.
5. Confirm the selected operation: account, implementation goal, package revenue, spend cap, margin
   floor, approved setup vendors, blocked risk vendor, and no patient data / no PHI boundary.
6. Open Function Studio and click `Start Run`.
7. Watch the Function Map progress through Client Intake, Hermes Plan, Finance Proof, Revenue Gate,
   Guardrail Review, Approved Resources, Blocked Risk, Launch Work, Evidence Ledger, and Profit Outcome.
8. Click Hermes Plan and show `used_real_hermes=true` when configured, `openai-codex / gpt-5.5`,
   `scalex-operator / skills`, planning output, proposed tool sequence, or clearly labeled local
   planning proof in test/diagnostic mode.
9. Click Finance Proof and show `used_real_stripe=true` when configured,
   `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL,
   `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
10. Click Revenue Gate and confirm it does not claim Stripe-paid revenue unless `paid=true`.
11. Click Guardrail Review and show local policy active now, with NeMo Guardrails planned/not wired.
12. Click Approved Resources and show Secure Workspace Pack, Data Migration Sandbox, and Launch
   Asset Kit totaling $1,150.
13. Click Blocked Risk and show why the $3,200 Unapproved Data Broker Enrichment request was
   blocked and that no spend ledger row was created for it.
14. Click Profit Outcome and show $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
   risk, $7,350 protected gross profit, and 86.5% protected margin.
15. Open Runs and show the selected-run summary, execution feed, and profit outcome proof.
16. Open Evidence Ledger and show the organized SQLite timeline, orchestration calls, ledger rows, Stripe
   records, and policy checks.
17. Open Integrations and show Hermes status, Stripe test mode/open-unpaid honesty, SQLite ledger,
   local policy engine, and NeMo Guardrails as planned/not wired yet.
18. Open Settings and show prototype auth, local API/database status, selected operation/run records,
   sample-only/no-PHI boundary, and no-live-money safety boundary.
19. Log out from the visible top-bar, sidebar, or fixed logout control.

No terminal output should be needed in the video. Hosted judge demo mode must not expose secrets.
Local full-proof mode can use ignored `.env` values for real isolated Hermes and real Stripe
test-mode invoice proof.

## Goal 7.12 Demo Acceptance

Before moving to Goal 8A, the demo should show:

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
local policy active now; NeMo Guardrails planned/not wired; no live-money support; no production
auth claim.
