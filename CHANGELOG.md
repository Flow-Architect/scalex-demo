# CHANGELOG — ScaleX

## 2026-06-18

- Completed /goal 2 — Backend + SQLite Ledger.
- Implemented FastAPI backend endpoints for GET /health, GET /api/health, POST /api/demo/reset, POST /api/demo/seed, and GET /api/demo/state.
- Implemented SQLite initialization from data/schema.sql and reset support for data/scalex.db.
- Added repository helpers for jobs, events, ledger entries, policy checks, Stripe events, agent outputs, and reports.
- Added seed loading from data/seed.json for the fake Harbor Auto Care demo job.
- Added local policy config loading and summary helpers from policies/scalex-policy.json.
- Added ledger math helpers for projected profit, projected margin, actual profit, actual margin, approved spend total, blocked spend total, and aggregate ledger totals.
- Replaced placeholder backend tests with coverage for schema initialization, seed loading, margin calculations, ledger totals, policy persistence, health behavior, and demo state behavior.
- Updated scripts/setup.sh to install backend dependencies, scripts/test.sh to run backend tests, scripts/dev.sh to start the backend by default, and scripts/reset-demo.sh to call the reset endpoint.
- Verification performed:
  - ./scripts/setup.sh passed after allowing package download for backend dependencies.
  - ./scripts/test.sh passed with 9 tests.
  - ./scripts/dev.sh started the backend on localhost:8787 after allowing local socket binding.
  - curl verified GET /health, POST /api/demo/reset, POST /api/demo/seed, and GET /api/demo/state.
  - data/scalex.db was created locally and remains ignored by git.
  - grep found no sk_live strings.
- Suggested commit message: Add SQLite backend foundation
- Created the ScaleX repo scaffold for the sandbox hackathon demo.
- Added README.md with product pitch, safety boundary, and local setup placeholders.
- Added backend FastAPI skeleton, service placeholders, seed package, requirements.txt, and placeholder tests.
- Added frontend Vite React TypeScript skeleton with Tailwind config and component placeholders.
- Added SQLite schema, fake Harbor Auto Care seed data, and local policy JSON.
- Added agent role placeholders, docs placeholders, screenshot directory placeholder, and local helper scripts.
- Updated STATUS.md and TASKS.md for the next backend ledger goal.
- Created initial ScaleX repo memory files.
- Locked product direction as a sandbox hackathon demo.
- Locked no-live-money and no-production-data constraints.
- Prepared repo for Codex /goal-based development.

## 2026-06-18 — Goal closeout rule

- Clarified that STATUS.md is the current-state tracker.
- Clarified that TASKS.md is the next-action handoff.
- Clarified that CHANGELOG.md is the chronological history.
- Decided not to add a separate GOAL_LOG.md unless needed later.
