# ScaleX

ScaleX is a governed execution layer for revenue-backed client operations.

Enterprise teams want AI agents to help run client operations, but they cannot let raw agents
touch money, vendors, client workflows, approvals, or internal systems without proof, policy,
money control, and audit. ScaleX wraps planning, finance state, policy checks, controlled
execution, evidence, and profit reporting into one governed run.

## What It Does

ScaleX turns a paid client operation into a governed run:

- Business intake and reviewed operation context
- Prepared delivery cost basis
- Hermes planning with a Nemotron 3 Ultra-capable route
- Stripe sandbox/test finance state
- NemoClaw / NeMo / local policy guardrails
- Tool action rail with policy boundaries
- Blocked risky spend
- SQLite evidence ledger
- Protected profit report

Judge Demo Mode uses deterministic planning proof unless runtime evidence verifies the selected
model. Hermes proposes the plan; ScaleX governs execution.

## Demo Story

Current sample:

- Client: Northstar Dental Group
- Operation: Client Implementation Launch
- Revenue secured: $8,500
- Prepared/approved cost basis after governed run: $3,935
- Risk contained after blocked vendor action: $3,200
- Protected profit after governed run: $4,565
- Protected margin: 53.7%
- Margin floor: 50.0%

The blocked action is a risky data-broker/vendor enrichment request. ScaleX blocks it because it
would create uncontrolled spend exposure and push margin below the configured floor.

## Execution Modes

- Judge Demo Mode: default deterministic/local mode. No external credentials are required.
- Stripe Sandbox Prototype: test-mode finance path when configured safely. No live money.
- Verified Live Mode: locked future mode. It is not enabled for this hackathon project.

## System Roles

- Hermes / Nemotron 3 Ultra-capable planning route: proposes the plan and next actions.
- Stripe: provides sandbox/test finance state.
- NemoClaw / NeMo / local policy: checks risky actions before execution.
- ScaleX: controls execution, records evidence, blocks unsafe spend, and reports protected profit.

## Safety Boundaries

- No live money.
- No production customer data.
- Fake/demo clients only.
- Fake/demo employees only.
- No payroll or HR compliance processing.
- No SSNs, tax IDs, bank data, PHI, or real client records.
- No production Hermes claim.
- No real NemoClaw or NeMo runtime claim unless runtime evidence proves it.
- No secrets committed.

## Quickstart

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

Open:

```text
http://127.0.0.1:5174/
```

You can also use `./scripts/dev.sh` for the local demo workflow. Keep real credentials in an
ignored `.env` file only.

## Validation

```bash
./scripts/test.sh
./scripts/check-nemo.sh
cd frontend && npm run build
```

Run the open-source safety checks in `docs/OPEN_SOURCE_AUDIT.md` before publishing or pushing a
public release.

For a step-by-step local operator flow, see `docs/OPERATOR_GUIDE.md`.

Optional NeMo Guardrails adapter dependencies live in `requirements-nemo-optional.txt`; they are
not required for normal quickstart or Judge Demo Mode.

## Repository Structure

- `backend/` - FastAPI app, deterministic demo runner, policy/guardrail services, and tests.
- `frontend/` - Vite React control-room UI.
- `docs/` - product, architecture, demo, operator, audit, attribution, decision, and release notes.
- `policies/` - local business-rule policy configuration.
- `scripts/` - local setup, dev, test, reset, and guardrail check helpers.
- `data/` - schema and synthetic seed data only. Runtime databases are ignored.
- `demo-assets/` - intentionally public demo placeholders only.

## License

License pending. See `docs/LICENSE_DECISION_REQUIRED.md`. Do not treat this repository as
open-source reusable until a license is selected and added.

## Third-Party Names And Logos

Third-party names and logos are trademarks of their respective owners. Their use here is for
demo/integration identification only and does not imply endorsement. See
`docs/ATTRIBUTIONS.md`.
