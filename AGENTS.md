# AGENTS.md — ScaleX Codex Rules

These rules apply to all Codex work in this repo.

## Project identity

Product: ScaleX
Submission title: ScaleX: Profit-Aware Agent Operations for Service Workflows
Repo path: /home/ascabrya/dev/scalex-demo

ScaleX is a live working product-style prototype for turning repeatable enterprise functions
into autonomous, governed workflows. Product mode is real-integration-first in the appropriate
environment; test doubles are for automated tests, CI, offline development, or explicitly
labeled diagnostics.

## Core product loop

Job Intake
→ Hermes/GPT-5.5 Planning
→ Stripe Test Invoice / Payment Flow
→ NeMo Guardrail Gate / Local Policy Guardrails
→ SQLite Ledger / Audit Records
→ Agent Work
→ Profit Report

## Non-negotiable safety rules

- Do not touch files outside this repo.
- For Goal 7, do not use live Stripe keys and do not create live-money payments.
- Future live-money Stripe work is allowed only through a documented Verified Live Mode.
- Do not use real client data.
- Do not connect to Prometheus production data.
- Do not connect to Windows Hermes production config.
- Do not connect to homelab OpenClaw.
- Do not connect to Recall memory.
- Do not commit secrets.
- Do not commit .env, SQLite .db files, recordings, logs, node_modules, venvs, or build artifacts.

## Integration truthfulness

Only claim what is actually implemented.

Allowed wording before an integration is wired:

- local policy engine
- Hermes-style orchestration adapter
- Stripe test-double event for tests/diagnostics
- sandbox product prototype

Do not claim:

- real NeMo Guardrails or NemoClaw integration
- real Hermes production integration
- live Stripe money movement outside Verified Live Mode
- real customer workflow

unless that integration is actually wired, tested, and documented.

## Build rules

- Working product-mode integration proof beats architectural perfection.
- Keep scope small.
- One client: Harbor Fleet Services.
- One job: 30-day fleet brake inspection campaign.
- One invoice: $1,200.
- Approved spend: $89 and $98.
- Blocked spend: $750.
- Margin floor: 50%.
- Final report should show $1,200 revenue, $187 approved spend, $1,013 gross profit, and about 84.4% margin.

## Preferred stack

Frontend:
- Vite
- React
- TypeScript
- Tailwind

Backend:
- FastAPI
- Python sqlite3

Database:
- SQLite at data/scalex.db
- schema in data/schema.sql

Guardrails:
- NVIDIA NeMo Guardrails or NeMo-compatible safety layer target for Goal 8
- local policy engine is active now and may support tests/diagnostics until Goal 8 wires a verified adapter

AI planning:
- GPT-5.5 Auth through isolated Hermes in product mode
- deterministic test-double planning required for automated tests

Stripe:
- real Stripe test-mode API path is the Goal 7 product path
- Stripe test-double mode is for tests/CI/explicit diagnostics only

## Product-mode integration rules

- Do not propose fallback-first implementation goals.
- Do not say "the product loop must work when an integration is unavailable" unless the
  behavior is a visible integration error or an explicitly configured test/diagnostic mode.
- Product acceptance criteria should prove real integration usage.
- Future Stripe work must distinguish:
  - Stripe test mode: real Stripe API calls with test keys and no live-money movement.
  - Stripe live-money mode: real Stripe live API capability.
  - Verified Live Mode: the only allowed future path for live-money actions.
- Hermes may plan and propose payment steps, but ScaleX code and guardrails must enforce
  keys, modes, caps, allowlists, confirmations, and audit records.

Hermes:
- use the ScaleX-isolated laptop Hermes install
- code: /home/ascabrya/.scalex-hermes/hermes-agent
- home/config/auth: /home/ascabrya/.scalex-hermes/home

## Documentation rules

ROADMAP.md is the long-term plan.
STATUS.md is verified current state.
TASKS.md is the next handoff.
DECISIONS.md is locked decisions.
CHANGELOG.md records completed changes.

Update STATUS.md, TASKS.md, and CHANGELOG.md before session closeout.

## Goal closeout rule

At the end of every Codex /goal, update the project handoff docs.

Required:

- STATUS.md: current verified state, last completed goal, incomplete items, deferred/revisit items, and current priority.
- TASKS.md: next recommended goal, required outputs, and do-not-work-on-yet items.
- CHANGELOG.md: chronological summary of what changed, verification performed, and suggested commit message.
- DECISIONS.md: update only if a locked decision changed.

Do not add redundant tracking files. STATUS.md is the current-state tracker.
