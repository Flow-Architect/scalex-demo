# START_HERE - ScaleX Codex Context

You are working in:

`/home/ascabrya/dev/scalex-demo`

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client
operations. Product mode is real-integration-first in the appropriate environment; test doubles
are for automated tests, CI, offline development, or explicitly labeled diagnostics.

Do not assume previous chat context. The repo files are the source of truth.

## Read First

Read these files in this order:

1. AGENTS.md
2. ROADMAP.md
3. DECISIONS.md
4. STATUS.md
5. TASKS.md
6. CHANGELOG.md

Then inspect:

- `git status --short`
- `git log --oneline -5`

## Current Product Goal

Maintain a functional local product shell showing:

```text
Client operation intake
-> Hermes/GPT-5.5 planning and routing
-> ScaleX Connection Hub declares allowed systems, modes, guardrails, and evidence duties
-> Stripe test invoice/payment-state proof
-> ScaleX business-rule enforcement
-> local policy guardrails now / NeMo Guardrails planned
-> SQLite evidence ledger
-> agent work
-> Profit Outcome
```

Goal 7.12 is complete: `Start Run` visibly executes the Northstar Client Implementation Launch
from run start through proof, evidence, and profit outcome. Goal 7.13A is complete as a docs-only
Connection Hub / MCP architecture planning pass. The next product goal is Goal 8A: read-only NeMo
Guardrails Preflight / Architecture Audit.

## Current Sample State

Implemented today:

- Client Implementation Launch
- Northstar Dental Group
- synthetic B2B implementation operations account only; no patient data and no PHI
- $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk, $7,350 protected gross
  profit, and 86.5% protected margin.

Harbor Fleet Services is historical only and is no longer the current implemented sample.

## Hard Constraints

- No live Stripe money in Goal 7 work.
- Future live-money Stripe work is allowed only through Verified Live Mode.
- No real client data.
- No Prometheus production data.
- No Windows Hermes dependency.
- No homelab/OpenClaw dependency.
- No real Recall memory.
- Must run locally from this Fedora laptop repo.
- Do not claim real Hermes, NeMo Guardrails/NemoClaw, or Stripe integration unless it is actually wired and working.
- Do not claim ScaleX has an MCP server or external agent MCP access; MCP is a future access
  pattern only.
- Keep Connection Hub positioned as an internal ClientOps Autopilot product layer, not a generic
  connector dashboard or marketplace.
- Do not propose fallback-first implementation goals.
- Product acceptance criteria should prove real integration usage.
- Local auth is prototype auth, not production enterprise identity.
- Workflow management is local/sample workflow management, not production multi-client SaaS.
- Hosted judge demo mode must not expose secrets; local full-proof mode can use ignored `.env`.
- Use the ScaleX-isolated Hermes install for product-mode planning:
  - code: `/home/ascabrya/.scalex-hermes/hermes-agent`
  - home/config/auth: `/home/ascabrya/.scalex-hermes/home`

## Current Next Goals

1. Goal 8A - NeMo Guardrails Preflight / Architecture Audit.
2. Full Proof local validation - verify real isolated Hermes plus real Stripe test mode if safe
   ignored local credentials are configured.
3. Goal 7.13B - Connection Hub UI.
4. Goal 8B / 8C - Guardrail Adapter and Guardrail Execution Rails after Goal 8A.
5. Goal 7.13C - MCP Server Prototype only after the guardrail/tool boundary is clear.

Connection Hub is planned as the layer where ScaleX declares which systems Hermes and future
agents can use, what mode each connector is in, what guardrails apply, which actions are blocked,
what configuration is missing, and what evidence is recorded. It must support the ClientOps
Autopilot story, not replace it.

MCP is planned as a future safe access pattern. Possible future tools/resources/prompts must not
expose secrets, bypass local policy or future NeMo guardrails, touch live money, or use real
client data.

Goal 8A is read-only and should audit whether real NeMo Guardrails or a NeMo-compatible adapter
is safely available after Goal 7.13A. Local policy is active now; real NeMo is not wired yet and
must not be claimed as real until installed, wired, tested, and documented.

## Session Closeout Requirement

Before ending a session:

1. Run relevant checks.
2. Update STATUS.md with verified facts only.
3. Update TASKS.md with the next recommended task.
4. Update CHANGELOG.md with what changed.
5. Update DECISIONS.md only if locked decisions changed.
6. Run `git status --short`.
7. Suggest a concise commit message.

Do not create separate goal-tracking files unless the user explicitly asks. STATUS.md is the
current-state tracker.
