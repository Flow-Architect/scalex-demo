# ScaleX Demo Script

Target walkthrough flow:

1. Intake the Harbor Fleet Services fleet brake inspection campaign.
2. Show Hermes Brain / Orchestration with `used_real_hermes=true`, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and ordered tool calls.
3. Show the $1,200 invoice and $300 spend cap.
4. Show the payment step: real Stripe test mode when a local `sk_test_...` key is configured, including `used_real_stripe=true`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, invoice status, and paid state.
5. Show SQLite audit records for the payment/revenue event.
6. Approve $89 and $98 spend requests through policy governance.
7. Block the $750 unsafe spend request.
8. Show agent deliverables.
9. Report $1,013 gross profit and about 84.4% margin.
