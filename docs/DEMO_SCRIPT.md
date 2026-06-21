# ScaleX Demo Script

Target walkthrough flow:

1. Open ScaleX.
2. Log in through the Secure Operator Console.
3. Onboard or select Harbor Fleet Services from the local/sample onboarding flow.
4. Review the workflow and money rules: $1,200 invoice, $300 spend cap, 50% margin floor, approved vendors, and blocked vendors.
5. Start the autonomous run with `Run Demo Job`.
6. Watch the workflow graph move through Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Guardrail, Spend Decision, Agent Work, SQLite Audit Ledger, and Profit Report.
7. Show Hermes proof: `used_real_hermes=true`, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and ordered tool calls.
8. Show Stripe test invoice proof: `used_real_stripe=true`, `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
9. Show the blocked spend branch for the $750 Premium Automation Suite request.
10. Show the profit report and audit trail: $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, about 84.4% margin, SQLite events, ledger rows, policy checks, Stripe records, and orchestration calls.
11. Visit Customers, Runs, Audit, and Settings / Integrations to show the product shell around the workflow proof.
12. Close by stating that Goal 8 adds NemoClaw-compatible safety integration if safely available.

Goal 7.7 adds product shell, local auth gate, onboarding flow, and live workflow visualization. Goal 8 remains next for NemoClaw / policy safety integration and presentation. No live-money support was added.

The recording should show browser product usage, not static cards. Hosted judge demo mode
must not expose secrets. Local full-proof mode can use ignored `.env` values for real
isolated Hermes and real Stripe test-mode invoice proof.
