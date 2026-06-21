# ScaleX Demo Script

Target walkthrough flow:

1. Open with the first viewport: "ScaleX ran a live AI business workflow."
2. Show the Profit Protected panel: $1,200 Stripe test invoice, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and 84.4% margin.
3. Show Live Stack Proof: real Hermes, real Stripe test mode, SQLite audit ledger, local Policy Guardrails, and NemoClaw Goal 8 next.
4. Show Hermes Brain / Orchestration with `used_real_hermes=true`, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and ordered tool calls.
5. Show the payment step: real Stripe test mode when a local `sk_test_...` key is configured, including `used_real_stripe=true`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
6. Show SQLite audit records for Stripe, ledger, policy, orchestration, agent, and report records.
7. Approve $89 and $98 spend requests through local policy governance.
8. Block the $750 unsafe spend request.
9. Show the staged execution replay cards settling onto API-backed state after `POST /api/demo/run`.
10. Show agent deliverables.
11. Report $1,013 gross profit and about 84.4% margin.
