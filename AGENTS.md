# AGENTS.md - ScaleX Codex Rules

These rules apply to all Codex work in this repo.

## Project Identity

Product: ScaleX ClientOps Autopilot

Category: Enterprise Function Accelerator

Submission title: ScaleX ClientOps Autopilot: Enterprise Function Accelerator for Revenue-Backed Client Operations

Repo path: this repository root.

ScaleX helps B2B teams turn repeatable client operations into autonomous, revenue-backed,
policy-governed runs with finance proof, guardrail enforcement, and audit evidence. Product mode
is real-integration-first in the appropriate environment; test doubles are for automated tests,
CI, offline development, or explicitly labeled diagnostics.

Connection Hub and MCP planning must preserve this product identity. ScaleX is not a generic MCP
platform, connector marketplace, integration dashboard, Zapier/n8n clone, developer tool first, or
AI agent playground.

## Core Product Loop

```text
Client operation intake
-> Hermes/GPT-5.5 planning and routing
-> ScaleX Connection Hub declares allowed systems, modes, guardrails, and evidence duties
-> Stripe test invoice/payment-state proof
-> ScaleX business-rule enforcement
-> local policy guardrails now / real NVIDIA NeMo Guardrails targeted in Goal 8
-> SQLite evidence ledger
-> agent work
-> Profit Outcome
```

## Non-Negotiable Safety Rules

- Do not touch files outside this repo.
- For Goal 7 work, do not use live Stripe keys and do not create live-money payments.
- Future live-money Stripe work is allowed only through a documented Verified Live Mode.
- Do not use real client data.
- Do not connect to Prometheus production data.
- Do not connect to Windows Hermes production config.
- Do not connect to homelab OpenClaw.
- Do not connect to Recall memory.
- Do not commit secrets.
- Do not commit `.env`, SQLite `.db` files, recordings, logs, node_modules, venvs, or build artifacts.

## Integration Truthfulness

Only claim what is actually implemented.

Allowed wording before an integration is wired:

- local policy engine
- Hermes-style orchestration adapter
- Stripe test-double event for tests/diagnostics
- sandbox product prototype
- Connection Hub planned/internal product layer
- MCP planned/future access pattern
- NeMo Guardrails planned/not wired

Do not claim:

- real NeMo Guardrails or NemoClaw integration
- real Hermes production integration
- implemented MCP server or external agent MCP access
- live Stripe money movement outside Verified Live Mode
- real customer workflow

unless that integration is actually wired, tested, and documented.

## Build Rules

- Working product-mode integration proof beats architectural perfection.
- Keep scope small.
- Current implemented sample: Northstar Dental Group / Client Implementation Launch.
- Current sample is synthetic B2B implementation operations only: no patient data, no PHI, no
  healthcare compliance claim, and no HIPAA support claim.
- Current implemented invoice: $8,500.
- Current implemented approved setup spend: $350, $500, and $300.
- Current implemented blocked risk: $3,200.
- Current implemented margin floor: 50%.
- Current implemented profit outcome should show $8,500 revenue, $3,935 prepared/approved
  delivery cost basis after governed run, $3,200 blocked risk, $4,565 protected profit, and
  53.7% protected margin.
- Harbor Fleet Services is historical only and is no longer the current implemented sample.

## Preferred Stack

Frontend:

- Vite
- React
- TypeScript
- Tailwind

Backend:

- FastAPI
- Python sqlite3

Database:

- SQLite at `data/scalex.db`
- schema in `data/schema.sql`

Guardrails:

- local policy engine is active now
- real NVIDIA NeMo Guardrails is the Goal 8 target
- NeMo-compatible/local fallback is allowed only if Goal 8A proves real NeMo cannot be safely
  wired before submission

AI planning:

- GPT-5.5 Auth through isolated Hermes in product mode
- deterministic test-double planning required for automated tests

Stripe:

- real Stripe test-mode API path is the Goal 7 product path
- Stripe test-double mode is for tests/CI/explicit diagnostics only

## Product-Mode Integration Rules

- Do not propose fallback-first implementation goals.
- Do not say the product loop must work when an integration is unavailable unless the behavior is
  a visible integration error or an explicitly configured test/diagnostic mode.
- Product acceptance criteria should prove real integration usage.
- Future Stripe work must distinguish:
  - Stripe test mode: real Stripe API calls with test keys and no live-money movement.
  - Stripe live-money mode: real Stripe live API capability.
  - Verified Live Mode: the only allowed future path for live-money actions.
- Hermes may plan and propose payment steps, but ScaleX code and guardrails must enforce keys,
  modes, caps, allowlists, confirmations, and audit records.
- Goal 8A is not deciding whether NeMo matters. It determines the safest practical path to wire
  real NVIDIA NeMo Guardrails without production-system access, secret leakage, demo breakage, or
  false claims.

Hermes:

- use an operator-configured isolated Hermes install only through ignored local environment
  variables
- do not commit local Hermes paths, credentials, auth state, or production configuration

## Documentation Rules

ROADMAP.md is the long-term plan.
STATUS.md is verified current state.
TASKS.md is the next handoff.
DECISIONS.md is locked decisions.
CHANGELOG.md records completed changes.

Update STATUS.md, TASKS.md, and CHANGELOG.md before session closeout.

## Goal Closeout Rule

At the end of every Codex `/goal`, update the project handoff docs.

Required:

- STATUS.md: current verified state, last completed goal, incomplete items, deferred/revisit items, and current priority.
- TASKS.md: next recommended goal, required outputs, and do-not-work-on-yet items.
- CHANGELOG.md: chronological summary of what changed, verification performed, and suggested commit message.
- DECISIONS.md: update only if a locked decision changed.

Do not add redundant tracking files. STATUS.md is the current-state tracker.
