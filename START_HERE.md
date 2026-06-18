# START_HERE — ScaleX Codex Context

You are working in:

/home/ascabrya/dev/scalex-demo

ScaleX is a hackathon demo for profit-aware agent operations for service businesses.

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

Build a functional local demo showing:

Job Intake
→ Margin Plan
→ Stripe Test Invoice or Mock Stripe Event
→ Payment Simulation
→ Policy-Gated Spend
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

## Session startup requirement

At the start of a new Codex session:

1. Read the files listed above.
2. Summarize what is done.
3. Summarize what is incomplete.
4. Recommend the next /goal.
5. Wait for approval before editing.

## Session closeout requirement

Before ending a session:

1. Run relevant tests/build checks.
2. Update STATUS.md with verified facts only.
3. Update TASKS.md with the next recommended task.
4. Update CHANGELOG.md with what changed.
5. Update DECISIONS.md only if decisions changed.
6. Run git status.
7. Suggest a concise commit message.
