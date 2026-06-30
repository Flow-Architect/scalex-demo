# STATUS - ScaleX

Last updated: 2026-06-30

## Current State

ScaleX is a MIT-licensed hackathon prototype for governed execution of revenue-backed client
operations. The current demo is ready for public review and uses a synthetic Northstar Dental
Group / Client Implementation Launch operation.

## Verified Demo Economics

- Revenue secured: `$8,500`
- Approved delivery cost basis after governed run: `$3,935`
- Risk contained after blocked vendor action: `$3,200`
- Protected profit after governed run: `$4,565`
- Protected margin: `53.7%`
- Margin floor: `50.0%`

## Product Story

ScaleX gives enterprise teams a governed control plane for letting AI participate in paid client
operations without losing control of money, margin, policy, or audit.

- Hermes plans the work through a Nemotron 3 Ultra-capable planning route when runtime evidence is
  configured; Judge Demo Mode uses deterministic planning proof.
- Stripe provides sandbox/test finance state or an explicitly labeled test double.
- NemoClaw / NeMo / local policy checks risky actions.
- ScaleX blocks unsafe execution, records evidence, and reports protected profit.

## Verified Repository State

- GitHub README landing page now uses the ScaleX logo, badges, quick links, and public screenshots
  under `docs/assets/github/`.
- Clean-checkout backend install, frontend install, frontend build, full test script, optional
  NeMo adapter check, and runtime smoke have passed.
- Required frontend, backend, data/config, scripts, docs, brand assets, and optional NeMo
  requirements are tracked.
- Referenced logo/brand assets resolve through Vite.
- Scripts are executable in git.
- Runtime `data/scalex.db` is ignored and recreated locally from tracked `data/schema.sql` and
  `data/seed.json`.
- Root `AGENTS.md`, root `DECISIONS.md`, and `requirements-nemo.txt` are absent.
- `docs/internal/AGENTS.md`, `docs/DECISIONS.md`, `docs/OPERATOR_GUIDE.md`, and
  `requirements-nemo-optional.txt` are present.

## Implemented Safety Boundaries

- Judge Demo Mode is the default and requires no external credentials.
- Stripe live-money execution is not implemented.
- Verified Live Mode is future-only and disabled.
- The demo uses fake/demo clients and employees only.
- Labor costing is job costing only, not payroll or HR compliance processing.
- No real client data, PHI, SSNs, tax IDs, bank data, production customer data, or uploaded real
  files are required.
- Real NemoClaw / NeMo / production Hermes usage is claimed only when runtime evidence proves it.
- Runtime SQLite databases, `.env` files, build output, caches, recordings, logs, virtual
  environments, and `node_modules` are ignored.

## License Status

License selected: MIT.

## Current Priority

1. Push the latest README visual polish commit after review.
2. Review `README.md`, `docs/OPERATOR_GUIDE.md`, `docs/SUBMISSION_WRITEUP.md`,
   `docs/DEMO_SCRIPT.md`, and `docs/OPEN_SOURCE_AUDIT.md`.
3. Confirm no local artifacts or secrets are staged before any future push.
