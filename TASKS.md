# TASKS — ScaleX

## Current priority

Run Codex /goal 5 — Frontend Demo Dashboard.

## Next Codex goal

Create a usable local frontend dashboard for the completed backend one-click demo runner.

## Required outputs for next milestone

- Wire the Vite React TypeScript frontend to the existing backend API.
- Add a primary "Run Demo" control that calls POST /api/demo/run.
- Load and refresh state from GET /api/demo/state.
- Display the Harbor Auto Care job summary.
- Display metric cards for:
  - $1,200 revenue
  - $187 approved spend
  - $750 blocked unsafe spend
  - $1,013 gross profit
  - 84.4% margin
- Display timeline events from state.timeline_events or state.events.
- Display mock Stripe/test-style records clearly as local/mock/test records.
- Display policy checks for Local Ads API, Design Asset Pack, and Premium Automation Suite.
- Display deterministic Finance, Marketing, Research, and Ops outputs.
- Display the final profit report and renewal recommendation.
- Keep copy truthful: local policy engine, local sandbox payment marker, mock/test-style Stripe records, deterministic agent outputs.
- Add frontend build/test verification only as far as the current scaffold supports it.
- Keep backend API compatibility intact.

## Do not work on yet

- Live Stripe.
- Real customer data.
- Public deployment.
- Real Prometheus/Hermes connection.
- Homelab/OpenClaw connection.
- Real NemoClaw integration.
- Complex auth.
- Multi-client dashboard.
- GPT-5.5 planning integration.
- Real Hermes integration.
- Real Stripe SDK/test-mode integration.
