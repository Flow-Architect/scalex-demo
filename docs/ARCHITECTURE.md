# ScaleX Architecture

Target architecture:

```text
ScaleX UI
  -> FastAPI backend
  -> isolated Hermes brain/orchestration
  -> real Stripe test mode / policy layer / agents
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
- Real Stripe test-mode invoice records through orchestration for Goal 7.
- Local policy engine for spend governance until Goal 8 wires a real safety adapter if safely available.
- Deterministic agent outputs.
- One-click Harbor Fleet Services sample workflow.

## Hermes Integration

Goal 6 wires the backend to the ScaleX-isolated Hermes install:

```text
code: /home/ascabrya/.scalex-hermes/hermes-agent
home/config/auth: /home/ascabrya/.scalex-hermes/home
skill source: hermes/skills/scalex-operator/SKILL.md
```

Product mode calls real Hermes for planning. ScaleX code still executes Stripe, policy checks,
ledger writes, local agent outputs, and reports. Hermes may propose payment steps but cannot
execute payment actions directly.

## Stripe Integration

Goal 7 makes real Stripe test mode the product payment path:

```text
customer -> invoice item -> invoice -> finalized hosted invoice URL -> honest payment status
```

Tests and CI may use Stripe test doubles. Product mode must surface a visible Stripe
integration error instead of silently using test doubles.

## Verified Live Mode

Live-money Stripe capability is future production hardening only. Verified Live Mode must
require explicit config, human confirmation, amount caps, customer allowlists, policy approval,
and SQLite audit records before any live-money action.

## Safety Boundary

Goal 7 must not use live Stripe mode, production Hermes, Windows Hermes config, production
Prometheus, homelab/OpenClaw, Recall memory, or real client data.
