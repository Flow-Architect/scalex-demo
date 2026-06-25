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

1. Login.
2. Dashboard: explain Northstar Dental Group / Client Implementation Launch as a synthetic B2B
   implementation operation with no patient data and no PHI. If the sample is not selected, load
   and save/select the Northstar sample from Onboarding.
3. Open Function Studio.
4. Click `Start Run`.
5. Watch run progression through Run Started, Hermes Plan, Stripe Finance Proof, Revenue Gate,
   Guardrail Review, Approved Resources, Blocked Risk, Work Execution, Evidence Ledger, and Profit
   Outcome. In Judge Demo Mode, call out Demo proof mode, deterministic local planning,
   Stripe test-double/sandbox proof, and local policy active.
6. Click Hermes Plan and show the generated plan summary, proposed tool sequence, and either
   `used_real_hermes=true` for Full Proof Mode or deterministic local plan proof for Demo proof mode.
7. Click Stripe Finance Proof and show either real Stripe test-mode proof with `livemode=false`
   and `paid=false` unless Stripe reports paid, or Stripe test-double/sandbox proof in Demo proof mode.
8. Click Guardrail Review and show local policy active now, with NeMo Guardrails planned/not wired.
9. Click Blocked Risk and show why the $3,200 Unapproved Data Broker Enrichment request was
   blocked and that no spend ledger row was created for it.
10. Click Profit Outcome and show $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
    risk, $7,350 protected gross profit, and 86.5% protected margin.
11. Open Runs and show the new execution, selected-run summary, execution feed, and profit outcome proof.
12. Open Evidence Ledger and show grouped timeline, Hermes/orchestration, Stripe finance proof,
    guardrail/local policy decisions, ledger entries, and profit outcome.
13. Open Integrations and show Demo proof mode or Full Proof Mode labels, Stripe honesty,
    local policy active, SQLite ledger, prototype auth, and NeMo Guardrails planned/not wired.
14. Logout.

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
