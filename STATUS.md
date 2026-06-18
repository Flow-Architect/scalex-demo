# STATUS — ScaleX

Last updated: 2026-06-18

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
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

## Not yet built

- SQLite database initialization and reset/state endpoints.
- Full backend app behavior beyond scaffold health endpoint.
- Demo runner lifecycle.
- Policy engine logic.
- Ledger service logic and margin math.
- Deterministic agent outputs.
- Stripe mock/test event service logic.
- GPT-5.5 planning service.
- Hermes-style orchestration adapter behavior.
- Usable frontend dashboard.
- Meaningful backend and frontend tests.
- Demo recording.

## Current priority

Run Codex /goal 2 — Backend + SQLite Ledger.
