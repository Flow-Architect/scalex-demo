# AGENTS.md — ScaleX Codex Rules

These rules apply to all Codex work in this repo.

## Project identity

Product: ScaleX
Submission title: ScaleX: Profit-Aware Agent Operations for Service Businesses
Repo path: /home/ascabrya/dev/scalex-demo

ScaleX is a sandbox hackathon demo. It is not production software.

## Core demo loop

Job Intake
→ Margin Plan
→ Stripe Test Invoice or Mock Stripe Event
→ Payment Simulation
→ Policy-Gated Spend
→ Agent Work
→ Profit Report

## Non-negotiable safety rules

- Do not touch files outside this repo.
- Do not use live Stripe keys.
- Do not create live payments.
- Do not use real client data.
- Do not connect to Prometheus production data.
- Do not connect to Windows Hermes production config.
- Do not connect to homelab OpenClaw.
- Do not connect to Recall memory.
- Do not commit secrets.
- Do not commit .env, SQLite .db files, recordings, logs, node_modules, venvs, or build artifacts.

## Integration truthfulness

Only claim what is actually implemented.

Allowed wording if local-only:

- local policy engine
- Hermes-style orchestration adapter
- Stripe mock/test event
- sandbox demo

Do not claim:

- real NemoClaw integration
- real Hermes production integration
- live Stripe money movement
- real customer workflow

unless that integration is actually wired, tested, and documented.

## Build rules

- Working local demo beats architectural perfection.
- Keep scope small.
- One client: Harbor Auto Care.
- One job: 30-day brake service campaign.
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

Policy:
- local policy engine first
- NemoClaw adapter only if available quickly and safely

AI planning:
- GPT-5.5 Auth through env-configured model if available
- deterministic fallback required

Stripe:
- test mode or mock mode only
- mock fallback required

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
