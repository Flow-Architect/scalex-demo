# START HERE

Start with `README.md` for the public project overview and quickstart.

## What This Repo Contains

ScaleX is a hackathon prototype for governed execution of revenue-backed client operations. It
demonstrates a synthetic Northstar Dental Group / Client Implementation Launch operation with
finance proof, policy guardrails, blocked risky spend, evidence, and protected profit reporting.

## Safe Local Run

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

## Important Docs

- `README.md` - public project overview.
- `docs/DEMO_SCRIPT.md` - final recording script.
- `docs/OPERATOR_GUIDE.md` - local demo operation, modes, reset, and troubleshooting.
- `docs/SUBMISSION_WRITEUP.md` - hackathon submission draft.
- `docs/OPEN_SOURCE_AUDIT.md` - release safety checks.
- `docs/ATTRIBUTIONS.md` - third-party trademark notice.
- `docs/DECISIONS.md` - locked product, safety, and release decisions.
- `SECURITY.md` - security boundaries.
- `CONTRIBUTING.md` - contribution rules.

## Current Boundaries

- Judge Demo Mode is the default and requires no external credentials.
- Keep real credentials in ignored `.env` only.
- Do not commit runtime databases, logs, recordings, build output, virtual environments, or
  `node_modules`.
- Do not claim live money, production Hermes, real NemoClaw/NeMo, Telegram, MCP, or production
  customer workflow behavior unless runtime evidence proves it.
