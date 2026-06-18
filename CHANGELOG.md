# CHANGELOG - ScaleX

This file records completed changes in chronological order.

Use:
- STATUS.md for current verified state.
- TASKS.md for the next active handoff.
- DECISIONS.md for locked decisions.
- CHANGELOG.md for completed work history.

---

## 2026-06-18 - Goal 0: Roadmap and handoff docs

Commit:
d0ed7d4 Initialize ScaleX roadmap and Codex handoff docs

Completed:
- Created initial ScaleX repo memory files.
- Added ROADMAP.md.
- Added AGENTS.md.
- Added START_HERE.md.
- Added STATUS.md.
- Added TASKS.md.
- Added DECISIONS.md.
- Added CHANGELOG.md.
- Added .gitignore.
- Added .env.example.
- Locked ScaleX as a sandbox hackathon demo.
- Locked no-live-money and no-production-data constraints.
- Prepared repo for Codex goal-based development.

Verified:
- Git repo initialized.
- Branch renamed to main.
- First clean commit created.

---

## 2026-06-18 - Goal 1: Sandbox scaffold

Commit:
b12efd5 Initialize ScaleX sandbox scaffold

Completed:
- Added README.md.
- Added backend FastAPI scaffold.
- Added frontend Vite React TypeScript scaffold.
- Added data/schema.sql.
- Added fake Harbor Auto Care seed data.
- Added policies/scalex-policy.json.
- Added agent role placeholders.
- Added docs placeholders.
- Added helper scripts.
- Updated STATUS.md and TASKS.md.

Verified:
- Shell scripts passed bash syntax check.
- data/seed.json parsed successfully.
- policies/scalex-policy.json parsed successfully.
- git diff check passed.
- No live-key patterns were found.
- SQLite installed on Fedora.
- data/schema.sql loaded into SQLite memory.
- Working tree clean after commit.

Not fully verified:
- Full tests were not run yet.
- Backend runtime was not fully verified yet.
- Frontend runtime was not verified yet.

Deferred:
- Backend persistence moved to Goal 2.
- Frontend dashboard moved to a later goal.
- Stripe, GPT-5.5, Hermes, and NemoClaw remained deferred.

---

## 2026-06-18 - Admin: Goal closeout documentation rule

Commit:
8ff4680 Clarify ScaleX goal closeout docs

Completed:
- Clarified that STATUS.md is the current-state tracker.
- Clarified that TASKS.md is the next-action handoff.
- Clarified that CHANGELOG.md is the chronological history.
- Clarified that DECISIONS.md changes only for locked decisions.
- Decided not to add GOAL_LOG.md unless needed later.

Verified:
- Working tree clean after commit.

---

## 2026-06-18 - Goal 2: Backend and SQLite Ledger

Commit:
7bbb130 Add SQLite backend foundation

Completed:
- Implemented SQLite initialization and reset.
- Implemented seed loading from data/seed.json.
- Implemented FastAPI health and demo state endpoints.
- Added repository helpers for core demo tables.
- Added service helpers for seed loading and state assembly.
- Added ledger and profit helper functions.
- Replaced placeholder backend tests with functional tests.
- Updated backend setup, test, dev, and reset scripts.
- Updated STATUS.md and TASKS.md.

Endpoints added or verified:
- GET /health
- GET /api/health
- POST /api/demo/reset
- POST /api/demo/seed
- GET /api/demo/state

Verified:
- ./scripts/setup.sh passed.
- ./scripts/test.sh passed with 9 tests.
- ./scripts/dev.sh started FastAPI on 127.0.0.1:8787.
- GET /health returned OK.
- POST /api/demo/reset created a fresh SQLite database.
- POST /api/demo/seed loaded Harbor Auto Care.
- GET /api/demo/state returned seeded demo state.
- data/scalex.db was created locally and ignored by Git.
- No live-key patterns were found.
- Working tree clean after commit.

Not yet built:
- Demo runner lifecycle.
- Full local policy engine behavior.
- Approved and blocked spend flow.
- Deterministic agent outputs.
- Mock Stripe lifecycle.
- Final profit report.
- Usable frontend dashboard.

Deferred:
- Real Stripe test mode waits until local mock flow is stable.
- GPT-5.5 Auth planning waits until deterministic outputs work.
- Real Hermes and NemoClaw integrations remain optional.
- Live money remains out of scope.

Next:
- Goal 3 - Margin and Policy Engine.
