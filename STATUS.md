# STATUS - ScaleX

Last updated: 2026-06-30

## Current State

ScaleX is a hackathon prototype for governed execution of revenue-backed client operations. The
current demo is visually ready for review and uses a synthetic Northstar Dental Group / Client
Implementation Launch operation.

Current verified demo economics:

- Revenue secured: $8,500
- Prepared/approved cost basis after governed run: $3,935
- Risk contained after blocked vendor action: $3,200
- Protected profit after governed run: $4,565
- Protected margin: 53.7%
- Margin floor: 50.0%

## Product Story

ScaleX gives enterprise teams a governed control plane for letting AI participate in paid client
operations without losing control of money, margin, policy, or audit.

- Hermes plans the work through a Nemotron 3 Ultra-capable planning route.
- Stripe provides sandbox/test finance state.
- NemoClaw / NeMo / local policy checks risky actions.
- ScaleX blocks unsafe execution, records evidence, and reports protected profit.

Judge Demo Mode uses deterministic planning proof unless runtime evidence verifies the selected
model.

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

## Latest Completed Work

Goal 9A prepared the repository for public GitHub review:

- README and quickstart were rewritten for a polished public project page.
- `.gitignore` and `.env.example` were hardened for safe local checkout.
- Attribution, license-decision, security, contribution, and conduct docs were added or cleaned.
- Public docs were aligned to the final Northstar economics and final UI story.
- Private local machine paths were removed from public docs and default backend config.
- Secret/history scans found no real-looking committed secrets; only placeholders and redaction
  patterns were present.
- Validation passed for frontend build, full test script, NeMo guardrail check, tracked unsafe
  path scan, and whitespace diff check. The full working-tree generated/runtime scan still shows
  ignored local operator files (`.env` and `data/scalex.db`); they are not tracked or staged and
  were intentionally not modified.

## License Status

No license has been selected yet. See `docs/LICENSE_DECISION_REQUIRED.md`. Do not describe the
project as open-source reusable until a license is chosen and added.

## Current Priority

Final operator review before public push:

1. Review `README.md`, `docs/SUBMISSION_WRITEUP.md`, `docs/DEMO_SCRIPT.md`, and
   `docs/OPEN_SOURCE_AUDIT.md`.
2. Choose a license and add `LICENSE`.
3. Re-run validation from `docs/OPEN_SOURCE_AUDIT.md`.
4. Push to GitHub only after confirming no local artifacts or secrets are staged.
