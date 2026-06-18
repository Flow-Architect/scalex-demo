# STATUS — ScaleX

Last updated: 2026-06-18

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Last completed goal: /goal 2 — Backend + SQLite Ledger.
- Repo memory files exist:
  - AGENTS.md
  - START_HERE.md
  - ROADMAP.md
  - DECISIONS.md
  - STATUS.md
  - TASKS.md
  - CHANGELOG.md
- README.md exists and describes ScaleX as a local sandbox hackathon demo.
- .gitignore exists and ignores local env files, SQLite database files, logs, venvs, node_modules, frontend build output, and recordings.
- .env.example exists with sandbox defaults, including STRIPE_LIVE_MODE=false and STRIPE_MOCK_MODE=true.
- Backend scaffold exists under backend/ with FastAPI package placeholders, service placeholders, seed package, requirements.txt, and placeholder tests.
- Frontend scaffold exists under frontend/ with Vite React TypeScript files, Tailwind config, API/types placeholders, and component placeholders.
- data/schema.sql exists with the planned SQLite ledger tables.
- data/seed.json exists with fake Harbor Auto Care demo data.
- policies/scalex-policy.json exists with local demo policy rules.
- agents/ contains Finance, Marketing, Research, and Ops role placeholders.
- docs/ contains scaffold documentation placeholders.
- scripts/setup.sh, scripts/dev.sh, scripts/test.sh, and scripts/reset-demo.sh exist and are executable.
- FastAPI backend exposes:
  - GET /health
  - GET /api/health
  - POST /api/demo/reset
  - POST /api/demo/seed
  - GET /api/demo/state
- SQLite initialization is implemented from data/schema.sql.
- POST /api/demo/reset creates a fresh local SQLite database at data/scalex.db.
- POST /api/demo/seed loads the fake Harbor Auto Care job from data/seed.json.
- GET /api/demo/state returns seeded job data, ledger totals, local policy config summary, events, empty policy/agent/report collections, and report placeholders.
- Repository helpers exist for jobs, events, ledger entries, policy checks, Stripe events, agent outputs, and reports.
- Core ledger helpers exist for projected profit, projected margin, actual profit, actual margin, approved spend total, and blocked spend total.
- Backend tests cover schema initialization, seed loading, margin calculations, ledger totals, policy persistence, health behavior, and demo state behavior.
- scripts/setup.sh installs backend Python dependencies into backend/.venv.
- scripts/test.sh runs backend pytest.
- Verified on 2026-06-18:
  - ./scripts/setup.sh passed.
  - ./scripts/test.sh passed with 9 tests.
  - ./scripts/dev.sh started the backend on localhost:8787 with approval for local socket binding.
  - curl checks passed for GET /health, POST /api/demo/reset, POST /api/demo/seed, and GET /api/demo/state.
  - data/scalex.db is ignored by git.

## Not yet built

- Demo runner lifecycle.
- Policy engine logic.
- Deterministic agent outputs.
- Stripe mock/test event service logic.
- GPT-5.5 planning service.
- Hermes-style orchestration adapter behavior.
- Usable frontend dashboard.
- Frontend tests.
- Demo recording.

## Not yet verified

- Fresh-clone setup on a clean machine.
- Frontend dependency installation or frontend build.
- End-to-end browser UI flow.

## Deferred / revisit

- scripts/dev.sh starts backend only by default for Goal 2; frontend startup is deferred until the dashboard goal.
- scripts/setup.sh installs backend dependencies only for Goal 2; frontend dependency installation is deferred until the dashboard goal.
- Real Stripe test-mode support remains deferred until after the mock/local demo is stable.
- Real Hermes, NemoClaw, GPT planning, and public deployment remain out of scope for current MVP work.

## Current priority

Run Codex /goal 3 — Margin + Policy Engine.
