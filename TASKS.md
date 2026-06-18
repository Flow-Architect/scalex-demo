# TASKS — ScaleX

## Current priority

Run Codex /goal 2 — Backend + SQLite Ledger.

## Next Codex goal

Build the FastAPI backend and SQLite job ledger for ScaleX.

## Required outputs for next milestone

- DB initialization from data/schema.sql.
- SQLite database file at data/scalex.db, ignored by git.
- FastAPI endpoints:
  - GET /api/health
  - POST /api/demo/reset
  - GET /api/demo/state
- Demo reset that seeds Harbor Auto Care data.
- Models/schemas for jobs, events, ledger entries, policy checks, Stripe events, agent outputs, and reports.
- Unit tests for DB initialization and demo reset/state.
- scripts/dev.sh verified to start the backend.

## Do not work on yet

- Live Stripe.
- Real customer data.
- Public deployment.
- Real Prometheus/Hermes connection.
- Homelab/OpenClaw connection.
- Real NemoClaw integration unless local scaffold is already stable.
- Complex auth.
- Multi-client dashboard.
