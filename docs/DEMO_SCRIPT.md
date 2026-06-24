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

1. Open ScaleX ClientOps Autopilot.
2. Log in through the local prototype auth gate.
3. Land on Dashboard and confirm Northstar Dental Group / Client Implementation Launch is selected.
4. Open Onboarding or Customers and load/select the Northstar sample if needed.
5. Confirm the selected operation: account, implementation goal, package revenue, spend cap, margin
   floor, approved setup vendors, blocked risk vendor, and no patient data / no PHI boundary.
6. Open Studio and click `Start Run`.
7. Watch the connected proof nodes progress through Client Operation Intake, Hermes Brain, Stripe
   Test Invoice, Payment Status, Guardrail Review, Approved Setup Spend, Blocked Risk, Work Units,
   SQLite Audit, and Profit Outcome.
8. Click Hermes Brain and show `used_real_hermes=true` when configured, `openai-codex / gpt-5.5`,
   `scalex-operator / skills`, planning output, and proposed tool sequence.
9. Click Stripe Test Invoice and show `used_real_stripe=true` when configured,
   `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL,
   `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
10. Click Payment Status and confirm it does not claim Stripe-paid revenue unless `paid=true`.
11. Click Guardrail Review and show local policy active now, with NeMo Guardrails planned/not wired.
12. Click Approved Setup Spend and show Secure Workspace Pack, Data Migration Sandbox, and Launch
   Asset Kit totaling $1,150.
13. Click Blocked Risk and show why the $3,200 Unapproved Data Broker Enrichment request was
   blocked and that no spend ledger row was created for it.
14. Click Profit Outcome and show $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
   risk, $7,350 protected gross profit, and 86.5% protected margin.
15. Open Runs and show the selected-run summary, execution feed, and profit outcome proof.
16. Open Audit and show the organized SQLite timeline, orchestration calls, ledger rows, Stripe
   records, and policy checks.
17. Open Integrations and show Hermes status, Stripe test mode/open-unpaid honesty, SQLite ledger,
   local policy engine, and NeMo Guardrails as planned/not wired yet.
18. Open Settings and show prototype auth, local API/database status, selected operation/run records,
   sample-only/no-PHI boundary, and no-live-money safety boundary.
19. Log out from the visible top-bar or sidebar control.

No terminal output should be needed in the video. Hosted judge demo mode must not expose secrets.
Local full-proof mode can use ignored `.env` values for real isolated Hermes and real Stripe
test-mode invoice proof.
