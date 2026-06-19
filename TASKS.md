# TASKS - ScaleX

## Current priority

Goal 7 - Stripe Test Mode through the orchestration layer.

## Next recommended goal

Run Codex /goal 7 - wire Stripe test-mode objects through the existing orchestration call sequence.

## Why this is next

Goal 6 is complete: the normal product path now uses the real ScaleX-isolated Hermes Agent install with the `scalex-operator` skill and `skills` toolset. The dashboard proves Hermes ran and the SQLite audit trail records planning and orchestration calls.

The next product proof gap is payment realism. Stripe is still represented by local mock/test-style records, which is acceptable for Goal 6 but should be replaced with Stripe test-mode objects in Goal 7.

## Required outputs for Goal 7

- Keep live Stripe mode disabled.
- Use only Stripe test mode keys and objects.
- Route Stripe test-mode customer, invoice, payment link, and payment confirmation through the existing orchestration layer.
- Preserve fallback local Stripe-shaped records for tests and safety.
- Keep `policy.check_spend` and ledger writes controlled by ScaleX code.
- Do not implement NemoClaw yet.
- Keep final economics unchanged:
  - $1,200 revenue
  - $187 approved spend
  - $750 blocked spend
  - $1,013 gross profit
  - about 84.4% margin
  - 0 policy violations
- Expose Stripe test-mode object IDs and fallback state honestly in the API and dashboard.
- Add tests that do not require live Stripe or real payments.
- Run `./scripts/test.sh`.
- Run `git diff --check`.
- Run the live-key grep safety check.
- Update STATUS.md, TASKS.md, and CHANGELOG.md at closeout.

## Required product facts to preserve

- Harbor Fleet Services remains the sample workflow, not the whole product.
- Invoice remains $1,200.
- Approved spend remains $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend remains $750 Premium Automation Suite.
- Margin floor remains 50%.
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for spend policy, payment actions, ledger writes, and reports.
- SQLite remains the audit ledger.
- Fallback paths are for safety and tests, not the preferred product story.

## Do not work on yet

- Live Stripe.
- Real client data.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Live NemoClaw or external policy calls before Goal 8.
- Complex auth.
- Multi-client dashboard.
- Production packaging.
