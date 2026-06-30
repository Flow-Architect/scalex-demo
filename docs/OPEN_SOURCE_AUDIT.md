# Open Source Audit Readiness

Last reviewed: 2026-06-30

## Current Release Posture

ScaleX is ready for a source audit as a local product prototype, not as a production SaaS release.
The public story should stay aligned to ScaleX Governed ClientOps / ScaleX ClientOps Autopilot:
governed execution for revenue-backed client operations with Hermes planning, Stripe test-mode or
test-double finance proof, local policy / optional NeMo Guardrails checks, optional NemoHermes
planning, SQLite evidence, blocked risk, and protected profit.

## Safe To Show

- Synthetic Northstar Dental Group / Client Implementation Launch sample only.
- Judge Demo Mode default with no secrets required.
- Local FastAPI backend, Vite React frontend, SQLite schema, deterministic demo fixtures, local
  policy, guardrail adapter boundary, and evidence-ledger behavior.
- Optional Full Proof Mode documentation for local ignored `.env` values when real isolated
  Hermes and Stripe test mode are safely configured.
- Optional NemoHermes runtime documentation only as an explicitly selected, fail-closed local
  planning route.

## Must Not Be Published As Claims

- Production auth, production payroll/HR, healthcare compliance, HIPAA support, live-money Stripe,
  production Hermes, real client workflows, real client email delivery, implemented Telegram
  approvals, implemented MCP server, or external agent MCP access.
- Real NeMo Guardrails proof unless `nemo_guardrails` runtime verification passed for that run.
- NemoClaw/NemoHermes usage unless `HERMES_RUNTIME=nemoclaw` was selected and the local API call
  succeeded.

## Tracked File Hygiene

Current `.gitignore` protects `.env`, local env variants, logs, Python caches, virtual
environments, `node_modules`, build output, SQLite database files, recordings, common media files,
archives, OS/editor files, and coverage output. Tracked source should not include:

- `.env` or other secret-bearing env files.
- SQLite `.db`, `.sqlite`, WAL, or backup files.
- uploaded real files, raw file contents, recordings, logs, browser caches, virtual environments,
  `node_modules`, or build artifacts.
- API keys, auth cookies, provider tokens, Stripe secrets, raw credential headers, private local
  machine paths, or production config paths.

## Required Checks Before Publishing

Run these from the repo root before any public push or release:

```bash
git status --short
git diff --check
git ls-files | rg '(^|/)(\.env|.*\.db|.*\.sqlite|node_modules|dist|\.venv|venv|\.pytest_cache|recordings|.*\.(webm|mp4|mov|mkv|log))$'
git diff --cached --unified=0 | rg -i 'sk_live|sk_test|api[_-]?key|secret|token|password|authorization|cookie|session'
./scripts/test.sh
./scripts/check-nemo.sh
```

Expected tracked-file scan result: no matches. The staged added-lines secret scan should also
return no matches.

## Open Items Before Calling It Open Source

- Choose and add a license. Do not call the repo open source until the license owner selects one.
- Keep `docs/ATTRIBUTIONS.md` with the third-party trademark notice if third-party logos remain
  in `frontend/public/brand/connections/`.
- Confirm whether screenshots are allowed in `demo-assets/screenshots/`; recordings remain ignored.
- Re-run the full validation suite after final docs/UI changes.
- Review generated dependency lockfiles for expected package names and versions.
