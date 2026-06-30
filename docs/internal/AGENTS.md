# ScaleX Operator Notes

These internal notes guide future Codex/operator work in this repository. They are not required
for normal local setup or demo recording.

## Product Identity

- Product: ScaleX ClientOps Autopilot.
- Category: Enterprise Function Accelerator.
- Positioning: governed execution for revenue-backed client operations.
- ScaleX is not a generic workflow builder, chatbot, connector marketplace, MCP platform, or
  AI agent playground.

## Current Demo Facts

- Client: Northstar Dental Group.
- Operation: Client Implementation Launch.
- Revenue: `$8,500`.
- Approved delivery cost basis: `$3,935`.
- Blocked risk: `$3,200`.
- Protected profit: `$4,565`.
- Protected margin: `53.7%`.
- Margin floor: `50.0%`.
- Harbor Fleet Services is historical only and is not the current sample.

## Safety Rules

- Use fake/demo clients and employees only.
- Do not modify real `.env` files or real runtime database files.
- Do not commit secrets, `.env`, SQLite runtime databases, recordings, logs, build output,
  virtual environments, `node_modules`, or raw uploaded files.
- Do not run live Stripe, Docker/NemoClaw commands, production Hermes, or production customer
  workflows from this repo.
- Do not claim real Hermes, NeMo Guardrails, NemoClaw, Stripe, Telegram, or MCP behavior unless
  runtime evidence proves that exact path.

## Build Rules

- Preserve deterministic Judge Demo Mode.
- Preserve fail-closed guardrail behavior where configured.
- Keep changes narrow and aligned to the existing FastAPI, SQLite, Vite, React, TypeScript, and
  Tailwind stack.
- Normal quickstart must not require optional NeMo dependencies or external credentials.

## Documentation Rules

- `README.md` and `START_HERE.md` are public entrypoints.
- `STATUS.md` is current verified state.
- `TASKS.md` is next public-release handoff.
- `CHANGELOG.md` is concise release history.
- `docs/DECISIONS.md` is the public decision record.
- `docs/internal/archive/` holds public-safe historical notes that are too detailed for public
  docs.
