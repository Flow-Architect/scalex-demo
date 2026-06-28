# Contributing

ScaleX is near-submission demo software. Keep changes narrow, truthful, and safe.

## Development Rules

- Preserve Judge Demo Mode as the safe default.
- Do not add live-money Stripe behavior, production Hermes access, production auth, Telegram,
  MCP, external extraction services, payroll/HR production behavior, or real client workflows
  unless a task explicitly scopes and verifies that work.
- Keep Northstar Dental Group synthetic. Do not add real client data, PHI, payroll records,
  secrets, uploaded real files, or raw file contents.
- Product claims must match implemented behavior. Do not claim real NeMo Guardrails,
  NemoClaw/NemoHermes, Stripe, Hermes, MCP, Telegram, or live-money behavior unless the selected
  path actually ran and recorded evidence.

## Validation

Before handing off a change, run the smallest relevant checks plus the open-source hygiene scans
in `docs/OPEN_SOURCE_AUDIT.md`. For broad changes, run:

```bash
./scripts/test.sh
./scripts/check-nemo.sh
git diff --check
```

Update `STATUS.md`, `TASKS.md`, and `CHANGELOG.md` for completed goal-level work.
