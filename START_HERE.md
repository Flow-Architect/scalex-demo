# START_HERE — ScaleX Codex Context

You are working in:

/home/ascabrya/dev/scalex-demo

ScaleX is a live working product-style prototype for turning repeatable enterprise functions
into autonomous, governed workflows. Product mode is real-integration-first; test doubles are
for automated tests, CI, offline development, or explicitly labeled diagnostics.

Do not assume previous chat context. The repo files are the source of truth.

## Read first

Read these files in this order:

1. AGENTS.md
2. ROADMAP.md
3. DECISIONS.md
4. STATUS.md
5. TASKS.md
6. CHANGELOG.md

Then inspect:

- git status
- git log --oneline -5

## Current product goal

Maintain a functional local product shell showing:

Secure Operator Console
→ Local/sample workflow onboarding
→ Job Intake
→ Hermes/GPT-5.5 Planning
→ Stripe Test Invoice / Payment Flow
→ NeMo Guardrail Gate / Local Policy Guardrails
→ SQLite Ledger / Audit Records
→ Agent Work
→ Profit Report

## Hard constraints

- No live Stripe money in Goal 7.
- Future live-money Stripe work is allowed only through Verified Live Mode.
- No real client data.
- No Prometheus production data.
- No Windows Hermes dependency.
- No homelab/OpenClaw dependency.
- No real Recall memory.
- Must run locally from this Fedora laptop repo.
- Keep repo clean and GitHub-ready.
- Do not claim real Hermes, NeMo Guardrails/NemoClaw, or Stripe integration unless it is actually wired and working.
- Do not propose fallback-first implementation goals.
- Do not say product mode must work when an integration is unavailable unless that means a visible
  integration error or an explicitly configured test/diagnostic path.
- Product acceptance criteria should prove real integration usage.
- Goal 7.7 local auth is prototype auth, not production enterprise identity.
- Goal 7.7 onboarding is local/sample workflow onboarding, not production multi-client SaaS.
- Hosted judge demo mode must not expose secrets; local full-proof mode can use ignored `.env`.
- Use the ScaleX-isolated Hermes install for the next integration target:
  - code: /home/ascabrya/.scalex-hermes/hermes-agent
  - home/config/auth: /home/ascabrya/.scalex-hermes/home

## Session startup requirement

At the start of a new Codex session:

1. Read the files listed above.
2. Summarize what is done.
3. Summarize what is incomplete.
4. Recommend the next /goal.
5. Wait for approval before editing.

Current next recommended /goal: Goal 8A - NeMo Guardrails Preflight / Architecture Audit.

Goal 7.9 is a workflow canvas product UX redesign milestone before Goal 8. Goal 7.9A
completed the no-code UX blueprint, Goal 7.9B completed the app shell foundation, and
Goal 7.9C replaced the main Workflow page with a connected canvas plus right selected-node
inspector. Goal 7.9D cleaned up the secondary views and aligned the product IA so Dashboard,
Onboarding, Customers, Workflow, Runs, Audit, Integrations, and Settings are now distinct
operator surfaces. Goal 7.9E then verified the browser-only recording flow across that IA
and fixed local-only CORS for alternate QA ports.
Goal 8 is now planned as the Governed Autonomy Layer with NVIDIA NeMo Guardrails. Goal 8A
is read-only and should audit whether real NeMo Guardrails or a NeMo-compatible adapter is
safely available before any implementation. Local policy is active now; real NeMo is not
wired yet and must not be claimed as real until installed, wired, tested, and documented.

## Session closeout requirement

Before ending a session:

1. Run relevant tests/build checks.
2. Update STATUS.md with verified facts only.
3. Update TASKS.md with the next recommended task.
4. Update CHANGELOG.md with what changed.
5. Update DECISIONS.md only if decisions changed.
6. Run git status.
7. Suggest a concise commit message.

## Goal closeout rule

Every Codex /goal must end with a clean closeout before starting the next /goal.

Codex must update:

- STATUS.md with current verified state
- TASKS.md with next action
- CHANGELOG.md with what changed

Codex should update DECISIONS.md only if a decision changed.

Do not create separate goal-tracking files unless the user explicitly asks. STATUS.md is the current-state tracker.
