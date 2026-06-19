# TASKS - ScaleX

## Current priority

Perform the required final user-visible browser click-through at http://127.0.0.1:5174, then commit the Goal 5 dashboard, browser verification fixes, and Harbor Fleet Services cleanup.

## Next recommended goal

Run Codex /goal 8 - Hermes + Policy Presentation Polish, or skip to /goal 9 - Final Polish + Submission Prep if the dashboard is already sufficient for recording.

## Why this is next

The local dashboard now has the required API defaults, CORS origins, strict frontend port behavior, service workflows positioning, and Harbor Fleet Services concrete demo example. The remaining MVP risk is presentation clarity: judges should quickly understand that ScaleX is coordinating local skill-style steps, using mock/test-style Stripe records, enforcing a local policy engine, and protecting job margin.

Goal 6 and Goal 7 are stretch integrations. They are not required before recording if the local dashboard already tells the core story.

## Required outputs before commit

- Manual browser verification is required before commit; shell/headless checks are not a substitute.
- Confirm the browser opens http://127.0.0.1:5174.
- Confirm the dashboard shows backend online and API base http://127.0.0.1:8787.
- Click Run Demo Job and confirm the dashboard shows:
  - $1,200 revenue / 120000 cents
  - $187 approved spend / 18700 cents
  - $750 blocked unsafe spend / 75000 cents
  - $1,013 gross profit / 101300 cents
  - 84.4% margin
  - Finance, Marketing, Research, and Ops outputs
  - local mock/test-style Stripe records
- Confirm dashboard copy references Harbor Fleet Services and the 30-day fleet brake inspection workflow.
- Confirm dashboard copy says service workflows/service teams, not small-business-only positioning.
- Confirm git status does not stage .env, data/scalex.db, venvs, pycache, logs, node_modules, frontend/dist, or other generated artifacts.
- Suggested commit message: Finalize Goal 5 browser demo cleanup

## Required outputs for next milestone

- Add local Hermes-style skill-call events or a structured local orchestration log.
- Keep the adapter honest: label it "Hermes-style local adapter" or similar wording.
- Do not connect to production Hermes.
- Show skill-call style steps in the UI timeline or a dedicated orchestration section:
  - job.create
  - planning.generate
  - stripe.create_customer
  - stripe.create_invoice
  - stripe.confirm_payment
  - policy.check_spend
  - ledger.record_revenue
  - ledger.record_spend
  - agent.run_finance
  - agent.run_marketing
  - agent.run_research
  - agent.run_ops
  - report.generate
- Improve policy presentation only where it helps the recording:
  - spend cap
  - margin floor
  - payment-before-spend rule
  - vendor allowlist
  - vendor blocklist
  - clear reason the $750 Premium Automation Suite request was blocked
- Keep the final report values unchanged:
  - revenue_cents 120000
  - approved_spend_cents 18700
  - blocked_spend_cents 75000
  - gross_profit_cents 101300
  - actual_margin_percent about 84.4
  - policy_violations 0
- Run ./scripts/test.sh.
- Update STATUS.md, TASKS.md, and CHANGELOG.md at closeout.

## Do not work on yet

- Live Stripe.
- Real customer data.
- Public deployment.
- Real Prometheus/Hermes connection.
- Homelab/OpenClaw connection.
- Real NemoClaw integration.
- Complex auth.
- Multi-client dashboard.
- GPT-5.5 planning integration unless explicitly approved as a stretch goal.
- Real Stripe SDK/test-mode integration unless explicitly approved as a stretch goal.
- Production packaging.
