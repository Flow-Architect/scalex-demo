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
- Local fallback Stripe-shaped records.
- Local policy engine for spend governance.
- Deterministic agent outputs.
- One-click Harbor Fleet Services sample workflow.

## Next Integration

Goal 6 wires the backend to the ScaleX-isolated Hermes install:

```text
code: /home/ascabrya/.scalex-hermes/hermes-agent
home/config/auth: /home/ascabrya/.scalex-hermes/home
```

Hermes is verified on the laptop, but ScaleX has not yet been wired to call it.

## Safety Boundary

ScaleX must not use live Stripe mode, production Hermes, Windows Hermes config, production Prometheus, homelab/OpenClaw, Recall memory, or real client data.
