# TASKS — ScaleX

## Current priority

Run Codex /goal 3 — Margin + Policy Engine.

## Next Codex goal

Implement ScaleX profit math and policy-gated spend logic.

## Required outputs for next milestone

- Local policy service that reads policies/scalex-policy.json.
- Spend approval logic for:
  - $89 Local Ads API approved.
  - $98 Design Asset Pack approved.
  - $750 Premium Automation Suite blocked.
- Ledger writes for approved spend only.
- Policy check persistence for approved and blocked requests.
- Blocked spend must not create a spend ledger entry.
- Tests for projected margin, actual margin, approved vendor under cap, blocked vendor, spend over cap, and blocked spend ledger behavior.
- API or service entrypoints that can apply demo spend checks after the seeded job exists.

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
