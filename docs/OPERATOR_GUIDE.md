# ScaleX Operator Guide

This guide explains how to run the local ScaleX demo safely for review or recording.

## Running The Local Demo

ScaleX opens in Judge Demo Mode by default. The demo uses synthetic Northstar Dental Group data,
deterministic planning proof unless a runtime proves otherwise, local policy guardrails, a local
SQLite evidence ledger, and no live-money authority.

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8790
```

Frontend:

```bash
cd frontend
npm install
VITE_API_BASE_URL=http://127.0.0.1:8790 npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Open `http://127.0.0.1:5174/`.

You can also run the safe local helper after dependencies are installed:

```bash
./scripts/dev.sh
```

`scripts/dev.sh` defaults to backend port `8790`, frontend port `5174`, and
`VITE_API_BASE_URL=http://127.0.0.1:8790`.

## Execution Modes

### Judge Demo Mode

- Default local mode.
- Requires no external credentials.
- Uses fake/demo clients and employees only.
- Uses deterministic planning proof unless configured runtime evidence proves otherwise.
- Uses local policy guardrails and records evidence locally.
- Does not move live money, contact real customers, or require production systems.

### Stripe Sandbox Prototype

- Optional test-mode finance path when configured with safe local test credentials.
- Must use Stripe test mode or an explicitly labeled test double.
- Does not use live Stripe keys or live-money movement.
- Keep all credentials in ignored local `.env` only.

### Verified Live Mode Locked

- Future-only mode.
- Not implemented or enabled for this hackathon release.
- Do not add live-mode scripts or use live Stripe keys.
- Do not describe the repository as supporting live-money execution until a verified design,
  approvals, caps, allowlists, audit records, and tests are implemented.

## Logging In And Auth

Judge Demo Mode is intended to run with:

```text
SCALEX_AUTH_ENABLED=false
```

If auth is enabled locally, set demo-only username, password, and session-secret values in ignored
`.env`. Do not reuse production credentials.

```text
SCALEX_AUTH_ENABLED=true
```

Do not commit `.env`, session secrets, cookies, or credentials.

## Resetting Demo State

With the backend running on the default port:

```bash
./scripts/reset-demo.sh
```

If the backend uses another port:

```bash
BACKEND_URL=http://127.0.0.1:8790 ./scripts/reset-demo.sh
```

The UI also exposes a reset path in the demo controls. Reset should return outcome and evidence
values to pending/zero state before the next recording pass.

## Recording The Demo

Use the synthetic Northstar Dental Group / Client Implementation Launch operation:

- Revenue secured: `$8,500`
- Prepared/approved cost basis after governed run: `$3,935`
- Risk contained after blocked vendor action: `$3,200`
- Protected profit after governed run: `$4,565`
- Protected margin: `53.7%`
- Margin floor: `50.0%`

Record the flow from Dashboard to Governed Run to Evidence Ledger to Connection Hub. The core
story is: Hermes plans, Stripe proves finance state, configured NemoClaw / NeMo routes or local
policy check risk, ScaleX blocks unsafe execution, and the ledger records proof.

## Troubleshooting NetworkError

If the frontend shows a network error:

- Confirm the backend is running at `http://127.0.0.1:8790`.
- Confirm the frontend was started with `VITE_API_BASE_URL=http://127.0.0.1:8790`.
- Confirm the browser is open at `http://127.0.0.1:5174/`.
- Stop older backend instances on port `8787` if they are confusing the demo.
- Check that no local `.env` override points the frontend at a stale backend port.

## Troubleshooting Frontend Port Mismatch

The recording path assumes Vite is on port `5174`.

- Use `--strictPort` so Vite fails instead of silently moving to another port.
- Stop any old Vite process already using `5174`, or intentionally choose another frontend port
  and open that URL.
- If using `./scripts/dev.sh`, set `FRONTEND_PORT=5174` unless intentionally testing another port.

## Optional NeMo Guardrails Check

Normal quickstart does not require NeMo dependencies. Optional adapter dependencies are listed in
`requirements-nemo-optional.txt` and can be installed into a local venv with:

```bash
./scripts/setup-nemo.sh
./scripts/check-nemo.sh
```

Do not claim real NeMo Guardrails usage unless the configured runtime verification passes for that
run. Do not run Docker/NemoClaw commands for this release check.

## Safety Reminders

- Use fake/demo records only.
- Do not use real client data, PHI, SSNs, tax IDs, bank data, payroll records, or uploaded real
  files.
- Do not use live Stripe keys or live-money mode.
- Do not commit `.env`, SQLite runtime databases, recordings, logs, build output, virtual
  environments, `node_modules`, or credentials.
- Do not claim Telegram, MCP server access, production Hermes, real NemoClaw, real NeMo
  Guardrails, or live Stripe unless runtime evidence proves that exact path.
