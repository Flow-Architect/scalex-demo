# DECISIONS - ScaleX

## Product Identity

- Product name: ScaleX ClientOps Autopilot.
- Judge-facing name: ScaleX Governed ClientOps.
- Category: Enterprise Function Accelerator.
- Core positioning: governed execution for revenue-backed client operations.
- ScaleX is not a generic connector marketplace, Zapier/n8n clone, chatbot, MCP platform, or
  developer tool first.

## Current Demo

- Current sample: Northstar Dental Group / Client Implementation Launch.
- Data boundary: synthetic B2B implementation operation only.
- Revenue secured: $8,500.
- Prepared/approved delivery cost basis after governed run: $3,935.
- Blocked risk: $3,200 Unapproved Data Broker Enrichment.
- Protected profit: $4,565.
- Protected margin: 53.7%.
- Margin floor: 50.0%.
- Harbor Fleet Services is historical only and is not the current demo sample.

## System Roles

- Hermes plans the operation through a Nemotron 3 Ultra-capable route and proposes next actions.
- Stripe provides sandbox/test finance state.
- NemoClaw / NeMo / local policy checks risky actions.
- ScaleX governs execution, records evidence, blocks unsafe spend, and reports protected profit.
- SQLite is the local evidence ledger.

## Truthfulness

- Judge Demo Mode uses deterministic planning proof unless runtime evidence verifies the selected
  model.
- Nemotron 3 Ultra is shown as active only when runtime model/provider evidence proves it.
- Real NeMo Guardrails is claimed only when the configured runtime verifies successfully.
- NemoClaw/NemoHermes is claimed only when the optional local runtime route is selected and the
  API call succeeds.
- Stripe live money is not implemented.
- Verified Live Mode is a future-only locked path.
- Telegram and MCP are not implemented.

## Safety

- Fake/demo clients and employees only.
- No real customer data, PHI, SSNs, tax IDs, bank data, raw uploaded files, production customer
  workflows, or production credentials.
- Labor costing is job costing only, not payroll, HR compliance, tax processing, or workforce
  management.
- Hermes may propose finance steps, but ScaleX enforces mode checks, caps, allowlists, policy,
  confirmations, and audit records.
- No live-money action can execute without a future Verified Live Mode design.

## Technical Stack

- Backend: FastAPI and Python `sqlite3`.
- Frontend: Vite, React, TypeScript, Tailwind.
- Database: SQLite schema and synthetic seed data in `data/`; runtime database files are ignored.
- Guardrails: local policy by default, optional NeMo Guardrails adapter probing through configured
  local runtime.
- Planning: deterministic proof by default, optional isolated Hermes/NemoHermes routes only when
  configured.
- Third-party names/logos require attribution and do not imply endorsement.

## Release

- A license must be selected before the project is described as open-source reusable.
- `.env`, runtime databases, logs, recordings, build output, virtual environments, caches, and
  `node_modules` must not be committed.
