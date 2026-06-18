# TASKS — ScaleX

## Current priority

Run Codex /goal 4 — One-Click Demo Runner.

## Next Codex goal

Create a one-click compressed demo runner that executes the local ScaleX lifecycle from seeded job through final profit report.

## Required outputs for next milestone

- Implement backend/app/demo_runner.py around the existing reset, seed, mark-paid, policy, ledger, and state services.
- Add POST /api/demo/run.
- Demo runner should create a complete local timeline for:
  - job intake
  - margin plan
  - local sandbox payment confirmation
  - approved $89 Local Ads API spend using amount_cents: 8900
  - approved $98 Design Asset Pack spend using amount_cents: 9800
  - blocked $750 Premium Automation Suite spend using amount_cents: 75000
  - deterministic Finance, Marketing, Research, and Ops outputs
  - final profit report
- Final report should show $1,200 revenue, $187 approved spend, $1,013 gross profit, about 84.4% margin, and $750 blocked unsafe spend.
- Demo runner totals must keep prerequisite/payment-gate blocks out of blocked_spend_cents.
- Final blocked_spend_cents must be 75000 even if the timeline includes a pre-payment Local Ads API block.
- Tests should verify POST /api/demo/run returns full state with events, ledger entries, policy checks, agent outputs, and report.
- Keep payment local/sandbox-only and do not add real Stripe calls.
- Use the documented POST /api/demo/spend-check amount_cents contract when wiring runner/API calls.

## Do not work on yet

- Live Stripe.
- Real customer data.
- Public deployment.
- Real Prometheus/Hermes connection.
- Homelab/OpenClaw connection.
- Real NemoClaw integration unless local scaffold is already stable.
- Complex auth.
- Multi-client dashboard.
- Frontend dashboard polish.
- GPT-5.5 planning integration.
- Real Hermes integration.
- Real Stripe SDK/test-mode integration.
