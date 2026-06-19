# ScaleX Architecture

Target architecture:

```text
ScaleX UI
  -> FastAPI backend
  -> isolated Hermes brain/orchestration
  -> Stripe test mode / policy layer / agents
  -> SQLite ledger and audit records
  -> profit report
```

## Implemented Today

- Vite React TypeScript frontend.
- FastAPI backend.
- SQLite audit ledger at `data/scalex.db`.
- Real isolated Hermes Agent planning through the repo-owned `scalex-operator` skill.
- Hermes CLI invocation with `--skills scalex-operator`, `--toolsets skills`, provider `openai-codex`, and model `gpt-5.5`.
- SQLite `planning_runs` and `orchestration_calls` audit tables.
- Local fallback Stripe-shaped records.
- Local policy engine for spend governance.
- Deterministic agent outputs.
- One-click Harbor Fleet Services sample workflow.

## Hermes Integration

Goal 6 wires the backend to the ScaleX-isolated Hermes install:

```text
code: /home/ascabrya/.scalex-hermes/hermes-agent
home/config/auth: /home/ascabrya/.scalex-hermes/home
skill source: hermes/skills/scalex-operator/SKILL.md
```

Product mode calls real Hermes for planning. ScaleX code still executes Stripe-shaped records, policy checks, ledger writes, local agent outputs, and reports.

## Safety Boundary

ScaleX must not use live Stripe mode, production Hermes, Windows Hermes config, production Prometheus, homelab/OpenClaw, Recall memory, or real client data.
