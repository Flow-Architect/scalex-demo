# CHANGELOG - ScaleX

This changelog is a concise public release history. Detailed local handoff notes were removed
before public GitHub cleanup.

## 2026-06-30 - Goal 9C: MIT license and final public cleanup

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
- Stale economics scan found no old `$7,088`, `83.4%`, or `$262` values. Harbor Fleet appears
  only in historical-not-current notes.
- Full working-tree unsafe/generated scan found ignored local operator artifacts only; they were
  not staged.

Suggested commit message:

Add MIT license for ScaleX release

## 2026-06-30 - Goal 9B: Public repo structure and operator guide

Completed:

- Moved internal Codex/operator notes from root `AGENTS.md` to `docs/internal/AGENTS.md`.
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

Suggested commit message:

Finalize ScaleX public repo structure

## 2026-06-30 - Goal 9A: Open-source GitHub release cleanup

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

Suggested commit message:

Prepare ScaleX open-source GitHub release

## 2026-06-29 - Goal 8Z: Nemotron 3 Ultra Hermes attribution

- Added truthful Nemotron 3 Ultra-capable attribution to Hermes planning surfaces.
- Preserved Judge Demo Mode truthfulness: deterministic planning proof unless runtime evidence
  verifies the selected model.
- Updated Dashboard, Hermes rail/detail, Connection Hub, Evidence Ledger, Settings, and docs.

## 2026-06-29 - Goal 8Y: Outcome and evidence gating

- Gated protected profit, margin, blocked risk, and evidence rows until the visible governed run
  completes.
- Preserved completed run behavior and reset-to-pending behavior.

## 2026-06-28 to 2026-06-29 - Goal 8I through 8X: Final control-room polish

- Rebuilt the UI into a dark enterprise control-room shell with sidebar navigation, governed run
  stage, evidence ledger, connection hub, settings, and supporting intake/costing panels.
- Improved blocked-risk visibility, economic control, proof artifacts, logo treatment, system
  cards, pre-run truthfulness, and animation readability.

## 2026-06-27 to 2026-06-28 - Goal 8F through 8H: Enterprise demo narrative

- Added command-center depth: business intake, document review, workforce costing, cost basis,
  guardrails, evidence, and final profit report.
- Locked the narrative around governed execution for revenue-backed client operations.
- Completed the cinematic demo UI pass without adding new integrations.

## Earlier Milestones

- Added FastAPI backend, SQLite schema, policy engine, deterministic demo runner, Vite React
  frontend, Stripe sandbox/test finance proof, Hermes planning adapter boundary, optional NeMo
  Guardrails adapter probing, and synthetic Northstar demo data.
