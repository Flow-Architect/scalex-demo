# START_HERE — ScaleX Codex Context

You are working in:

/home/ascabrya/dev/scalex-demo

ScaleX is a working product-style prototype for profit-aware agent operations in service workflows.

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

Build a functional local product loop showing:

Job Intake
→ Hermes/GPT-5.5 Planning
→ Stripe Test Invoice / Payment Flow
→ Policy/NemoClaw-Style Spend Approval
→ SQLite Ledger / Audit Records
→ Agent Work
→ Profit Report

## Hard constraints

- No live Stripe money.
- No real client data.
- No Prometheus production data.
- No Windows Hermes dependency.
- No homelab/OpenClaw dependency.
- No real Recall memory.
- Must run locally from this Fedora laptop repo.
- Keep repo clean and GitHub-ready.
- Do not claim real Hermes, NemoClaw, or Stripe integration unless it is actually wired and working.
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

Current next recommended /goal: Goal 6 - Wire ScaleX to isolated Hermes brain/orchestration.

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
