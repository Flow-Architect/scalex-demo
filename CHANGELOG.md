# CHANGELOG - ScaleX

This changelog is a concise public release history.

## 2026-06-30 - Public docs organization and safe notes archival

- Rewrote the public architecture, product spec, demo script, and submission writeup as polished
  user-facing docs.
- Archived verbose build-history versions under `docs/internal/archive/`.
- Shortened `docs/internal/AGENTS.md` and archived the fuller operator note.
- Cleaned current-state tracking docs so they describe verified state instead of local build
  process history.
- Updated the frontend favicon reference to use the tracked `sx_logo.png` brand asset.

## 2026-06-30 - Clean checkout functionality audit

Completed:

- Verified required tracked frontend, backend, data/config, scripts, docs, and brand assets are
  present.
- Verified unsafe runtime artifacts are not tracked.
- Verified script executable modes are preserved in git.
- Verified frontend asset references resolve from tracked `frontend/public` files and have
  fallbacks where used.
- Created `/tmp/scalex-clean-smoke` from the tracked repository and validated clean install,
  build, tests, and runtime smoke.
- Confirmed backend startup/reset/run recreates ignored `data/scalex.db` from tracked schema/seed.
- Updated README and Operator Guide to document `data/scalex.db` as runtime/ignored and recreated
  locally from tracked `data/schema.sql` and `data/seed.json`.

Validation:

- Clean checkout backend install passed after network approval for PyPI.
- Clean checkout frontend `npm install` passed after network/execution approval for package
  postinstall binaries.
- Clean checkout `npm run build` passed.
- Clean checkout `./scripts/test.sh` passed with 68 backend tests and frontend build.
- Clean checkout `./scripts/check-nemo.sh` passed.
- Clean checkout `git diff --check` passed.
- Runtime smoke passed for backend health, demo state, reset, governed run, and rendered frontend
  dashboard. Port `5174` was occupied locally, so frontend runtime smoke used alternate port
  `5177`.
- Release scans found no tracked unsafe artifacts, no stale current economics, and no real-looking
  secrets.

## 2026-06-30 - MIT license and final public cleanup

Completed:

- Added root `LICENSE` with MIT License text for 2026 Bryan Ascasibar.
- Removed the obsolete license blocker document.
- Updated README, START_HERE, STATUS, TASKS, ROADMAP, DECISIONS, and open-source audit docs so
  license status is MIT rather than pending.
- Verified the public repo structure after internal docs and decisions moved under `docs/`.
- Confirmed optional NeMo dependencies remain in `requirements-nemo-optional.txt` and are not
  required for normal quickstart.
- Preserved UI, backend mechanics, demo economics, animation timing, feature scope, and Judge
  Demo Mode behavior.

Validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and frontend build.
- `./scripts/check-nemo.sh` passed.
- `git diff --check` passed.
- License-pending reference scan passed with no stale blocker references.
- Public root structure check passed for the tracked repository.
- Tracked generated/runtime path scan passed.
- Secret/private path scan found only safe placeholders, test fixtures, redaction code, and
  safety-boundary wording.
- Stale economics scan found no deprecated protected-profit, margin, or labor values.
- Full working-tree unsafe/generated scan found ignored local operator artifacts only; they were
  not staged.

## 2026-06-30 - Public repo structure and operator guide

Completed:

- Moved internal operator notes from root `AGENTS.md` to `docs/internal/AGENTS.md`.
- Added `docs/internal/README.md` to clarify internal notes are optional and public-safe.
- Moved root `DECISIONS.md` to `docs/DECISIONS.md`.
- Added `docs/OPERATOR_GUIDE.md` with local demo startup, execution modes, auth behavior, reset,
  recording, troubleshooting, optional NeMo verification, and safety reminders.
- Renamed the optional NeMo requirements file to `requirements-nemo-optional.txt` and updated the
  setup helper plus public docs.
- Aligned safe local defaults to backend port `8790`, frontend port `5174`, and
  `VITE_API_BASE_URL=http://127.0.0.1:8790`.
- Added ignore rules for editor swap files.
- Preserved UI, backend mechanics, demo economics, animation timing, feature scope, and Judge
  Demo Mode behavior.

Validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and frontend build.
- `./scripts/check-nemo.sh` passed.
- `git diff --check` passed.
- Tracked generated/runtime path scan passed.
- Stale economics, renamed requirements, private path, and real-token pattern scans passed.
- Full working-tree generated/runtime scan found ignored local operator artifacts only; they were
  not staged.

## 2026-06-30 - Open-source GitHub release cleanup

Completed:

- Rewrote the README for a polished public GitHub project page.
- Hardened `.gitignore` for Python, frontend, env, runtime database, media, logs, archive, OS,
  and editor artifacts.
- Cleaned `.env.example` so it contains placeholders only and no private local paths.
- Removed private local path defaults from backend configuration.
- Added attribution, security, contribution, conduct, and release-safety docs.
- Polished `CONTRIBUTING.md`, `SECURITY.md`, `STATUS.md`, `TASKS.md`, `ROADMAP.md`,
  `START_HERE.md`, and release-facing docs.
- Preserved product behavior, UI layout, animation timing, economics, demo state, and backend
  mechanics except for public-safe default path cleanup.

Validation:

- Repository inspection completed.
- Working-tree secret scan completed with no real secrets found.
- Git history scan completed with no real-looking committed secrets found.
- Tracked-file generated/runtime path scan passed.
- Full working-tree generated/runtime path scan found ignored local operator files (`.env` and
  `data/scalex.db`); they were not modified, staged, or committed.
- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed.
- `git diff --check` passed.

## 2026-06-29 - Nemotron 3 Ultra Hermes attribution

- Added truthful Nemotron 3 Ultra-capable attribution to Hermes planning surfaces.
- Preserved Judge Demo Mode truthfulness: deterministic planning proof unless runtime evidence
  verifies the selected model.
- Updated Dashboard, Hermes rail/detail, Connection Hub, Evidence Ledger, Settings, and docs.

## 2026-06-29 - Outcome and evidence gating

- Gated protected profit, margin, blocked risk, and evidence rows until the visible governed run
  completes.
- Preserved completed run behavior and reset-to-pending behavior.

## 2026-06-28 to 2026-06-29 - Final control-room polish

- Rebuilt the UI into a dark enterprise control-room shell with sidebar navigation, governed run
  stage, evidence ledger, connection hub, settings, and supporting intake/costing panels.
- Improved blocked-risk visibility, economic control, proof artifacts, logo treatment, system
  cards, pre-run truthfulness, and animation readability.

## 2026-06-27 to 2026-06-28 - Enterprise demo narrative

- Added command-center depth: business intake, document review, workforce costing, cost basis,
  guardrails, evidence, and final profit report.
- Locked the narrative around governed execution for revenue-backed client operations.
- Completed the cinematic demo UI pass without adding new integrations.

## Earlier Milestones

- Added FastAPI backend, SQLite schema, policy engine, deterministic demo runner, Vite React
  frontend, Stripe sandbox/test finance proof, Hermes planning adapter boundary, optional NeMo
  Guardrails adapter probing, and synthetic Northstar demo data.
