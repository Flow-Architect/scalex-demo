# Contributing

ScaleX is a hackathon prototype for governed execution of revenue-backed client operations.
Changes should stay narrow, truthful, and safe.

## Local Development

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

## Validation

For broad changes, run:

```bash
./scripts/test.sh
./scripts/check-nemo.sh
cd frontend && npm run build
git diff --check
```

## Safety Rules

- Do not commit secrets, `.env` files, SQLite databases, logs, recordings, build output,
  virtual environments, or `node_modules`.
- Do not add real customer data, PHI, SSNs, tax IDs, bank data, payroll records, or uploaded
  real files.
- Do not add live Stripe keys or live-money behavior.
- Do not claim production Hermes, real NemoClaw, real NeMo Guardrails, MCP, Telegram, or live
  external runtime behavior unless the path is implemented, configured, run, and recorded with
  evidence.
- Preserve Judge Demo Mode as the safe default.

Run the release checks in `docs/OPEN_SOURCE_AUDIT.md` before public release work.
