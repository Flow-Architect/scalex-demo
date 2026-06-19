# TASKS - ScaleX

## Current priority

Goal 6 - Wire ScaleX to the isolated Hermes brain/orchestration install.

## Next recommended goal

Run Codex /goal 6 - Isolated Hermes Brain + Orchestration.

## Why this is next

Goal 5 is complete and the laptop repo was verified with `./scripts/test.sh` before this documentation update. The next product risk is proving that ScaleX can use Hermes as the agent brain/orchestration layer instead of only relying on deterministic local planning.

The ScaleX-isolated Hermes install is already verified on the Fedora laptop:

```text
code: /home/ascabrya/.scalex-hermes/hermes-agent
home/config/auth: /home/ascabrya/.scalex-hermes/home
ready check: SCALEX_HERMES_READY
```

ScaleX has not yet been wired to call that isolated Hermes install.

## Required outputs for Goal 6

- Add a backend Hermes adapter/service scoped to the ScaleX-isolated Hermes install.
- Use `HERMES_HOME=/home/ascabrya/.scalex-hermes/home`.
- Do not read or write production Hermes or Windows Hermes config.
- Use Hermes/GPT-5.5 for the operating plan and agent task list when available.
- Preserve deterministic fallback for reliability.
- Persist Hermes planning/orchestration or fallback events in SQLite.
- Expose enough state for the dashboard to label Hermes-generated vs fallback planning honestly.
- Run `./scripts/test.sh`.
- Run `git diff --check`.
- Update STATUS.md, TASKS.md, and CHANGELOG.md at closeout.

## Required product facts to preserve

- Harbor Fleet Services remains the sample workflow, not the whole product.
- Invoice remains $1,200.
- Approved spend remains $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend remains $750 Premium Automation Suite.
- Margin floor remains 50%.
- Final report remains $1,200 revenue, $187 approved spend, $1,013 gross profit, about 84.4% margin, and 0 policy violations.
- SQLite remains the audit ledger.
- Fallback paths are for safety and reliability, not the preferred final product story.

## Do not work on yet

- Live Stripe.
- Real client data.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Live NemoClaw or external policy calls unless explicitly scoped and safe.
- Real Stripe test-mode integration before Goal 7.
- Complex auth.
- Multi-client dashboard.
- Production packaging.
