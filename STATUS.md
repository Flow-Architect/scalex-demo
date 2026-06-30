# STATUS - ScaleX

Last updated: 2026-06-30

## Current State

ScaleX is a hackathon prototype for governed execution of revenue-backed client operations. The
current demo is visually ready for review and uses a synthetic Northstar Dental Group / Client
Implementation Launch operation.

Current verified demo economics:

- Revenue secured: $8,500
- Prepared/approved cost basis after governed run: $3,935
- Risk contained after blocked vendor action: $3,200
- Protected profit after governed run: $4,565
- Protected margin: 53.7%
- Margin floor: 50.0%

## Product Story

ScaleX gives enterprise teams a governed control plane for letting AI participate in paid client
operations without losing control of money, margin, policy, or audit.

- Hermes plans the work through a Nemotron 3 Ultra-capable planning route.
- Stripe provides sandbox/test finance state.
- NemoClaw / NeMo / local policy checks risky actions.
- ScaleX blocks unsafe execution, records evidence, and reports protected profit.

Judge Demo Mode uses deterministic planning proof unless runtime evidence verifies the selected
model.

## Implemented Safety Boundaries

- Judge Demo Mode is the default and requires no external credentials.
- Stripe live-money execution is not implemented.
- Verified Live Mode is future-only and disabled.
- The demo uses fake/demo clients and employees only.
- Labor costing is job costing only, not payroll or HR compliance processing.
- No real client data, PHI, SSNs, tax IDs, bank data, production customer data, or uploaded real
  files are required.
- Real NemoClaw / NeMo / production Hermes usage is claimed only when runtime evidence proves it.
- Runtime SQLite databases, `.env` files, build output, caches, recordings, logs, virtual
  environments, and `node_modules` are ignored.

## Latest Completed Work

Goal 9D verified clean-checkout functionality after the public push:

- Confirmed required tracked frontend, backend, data/config, scripts, docs, brand assets, and
  optional NeMo requirements are present.
- Confirmed root `AGENTS.md`, root `DECISIONS.md`, and `requirements-nemo.txt` remain absent.
- Confirmed `docs/internal/AGENTS.md`, `docs/DECISIONS.md`, `docs/OPERATOR_GUIDE.md`, and
  `requirements-nemo-optional.txt` remain present.
- Confirmed scripts are executable in git.
- Confirmed referenced frontend logo/brand assets are tracked, resolve through Vite, and have UI
  fallbacks where used.
- Created `/tmp/scalex-clean-smoke` from the tracked repository, installed backend/frontend
  dependencies from scratch, built the frontend, ran tests, and performed backend/frontend runtime
  smoke checks.
- Confirmed the clean backend recreates ignored `data/scalex.db` from tracked schema/seed on
  startup/reset/run.
- Updated README and Operator Guide to state that `data/scalex.db` is runtime/ignored and
  recreated locally from tracked `data/schema.sql` and `data/seed.json`.

Validation performed for Goal 9D:

- Clean checkout backend install passed after network approval for PyPI.
- Clean checkout frontend `npm install` passed after network/execution approval for package
  postinstall binaries.
- Clean checkout `npm run build` passed.
- Clean checkout `./scripts/test.sh` passed with 68 backend tests and frontend build.
- Clean checkout `./scripts/check-nemo.sh` passed using the optional configured local NeMo venv.
- Clean checkout `git diff --check` passed.
- Runtime smoke passed: backend health, demo state, reset, governed run, and rendered frontend
  dashboard all worked.
- Port `5174` was already occupied in this environment, so Vite correctly failed with
  `--strictPort`; runtime frontend smoke used alternate port `5177`.
- Tracked unsafe/generated file scan passed with no matches.
- Full working-tree unsafe/generated scan found ignored local artifacts only.
- Secret/private path scan found only safe placeholders, test fixtures, redaction code, and
  safety-boundary wording.
- Stale economics scan found no deprecated protected-profit, margin, or labor values.

Previous completed work:

Goal 9C selected the MIT License and completed the final public-push cleanup:

- Added root `LICENSE` with MIT License text for 2026 Bryan Ascasibar.
- Removed the obsolete license blocker document.
- Updated public docs so license status is no longer pending.
- Verified the public root structure after the Goal 9B moves.
- Confirmed optional NeMo requirements remain documented as optional and are not part of normal
  quickstart.
- Preserved product UI, backend mechanics, demo economics, animation timing, feature scope, and
  deterministic Judge Demo Mode.

Validation performed for Goal 9C:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed for the optional NeMo Guardrails adapter probe.
- `git diff --check` passed.
- License-pending reference scan passed with no stale blocker references.
- Public root structure check passed for the tracked repository.
- Tracked generated/runtime path scan passed with no matches.
- Secret/private path scan found only safe placeholders, test fixtures, redaction code, and
  safety-boundary wording.
- Stale economics scan found no deprecated protected-profit, margin, or labor values.
- Full working-tree unsafe/generated scan found ignored local operator artifacts only:
  `.env` and `data/scalex.db`. They are not tracked or staged and were intentionally not modified.

Goal 9B finalized the public repository structure and operator guide:

- Moved internal Codex/operator rules from root `AGENTS.md` to `docs/internal/AGENTS.md`.
- Moved locked product decisions from root `DECISIONS.md` to `docs/DECISIONS.md`.
- Added `docs/internal/README.md` to explain that internal notes are optional and public-safe.
- Added `docs/OPERATOR_GUIDE.md` with local demo startup, execution modes, auth behavior, reset,
  recording guidance, troubleshooting, and safety reminders.
- Renamed the optional NeMo requirements file to `requirements-nemo-optional.txt` and documented it
  as optional for NeMo Guardrails adapter verification.
- Aligned local demo defaults to backend port `8790`, frontend port `5174`, and
  `VITE_API_BASE_URL=http://127.0.0.1:8790`.
- Added editor swap-file ignore patterns.
- Preserved product UI, backend mechanics, demo economics, animation timing, safety boundaries,
  and deterministic Judge Demo Mode.

Validation performed for Goal 9B:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed for the optional NeMo Guardrails adapter probe.
- `git diff --check` passed.
- Tracked generated/runtime path scan passed with no matches.
- Stale economics, renamed requirements, private path, and real-token pattern scans passed.
- Full working-tree generated/runtime scan found ignored local operator artifacts only:
  `.env`, `data/scalex.db`, `backend/.venv`, `frontend/node_modules`, `frontend/dist`, and
  pytest caches. They are not tracked or staged and were intentionally not modified except for
  build output regenerated by validation.

Earlier completed work:

Goal 9A prepared the repository for public GitHub review:

- README and quickstart were rewritten for a polished public project page.
- `.gitignore` and `.env.example` were hardened for safe local checkout.
- Attribution, security, contribution, conduct, and release-safety docs were added or cleaned.
- Public docs were aligned to the final Northstar economics and final UI story.
- Private local machine paths were removed from public docs and default backend config.
- Secret/history scans found no real-looking committed secrets; only placeholders and redaction
  patterns were present.
- Validation passed for frontend build, full test script, NeMo guardrail check, tracked unsafe
  path scan, and whitespace diff check. The full working-tree generated/runtime scan still shows
  ignored local operator files (`.env` and `data/scalex.db`); they are not tracked or staged and
  were intentionally not modified.

## License Status

License selected: MIT.

## Current Priority

Final release owner review before public push:

1. Push the Goal 9D clean-checkout documentation fix.
2. Review `README.md`, `docs/OPERATOR_GUIDE.md`, `docs/SUBMISSION_WRITEUP.md`,
   `docs/DEMO_SCRIPT.md`, and `docs/OPEN_SOURCE_AUDIT.md`.
3. Confirm no local artifacts or secrets are staged before any future push.
