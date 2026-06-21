# ScaleX Demo Script

Target walkthrough flow:

1. Open ScaleX.
2. Log in through the Secure Operator Console.
3. Open Customers.
4. Use Harbor Fleet Services or create a synthetic/sample customer workflow.
5. Review the selected workflow config: customer, job goal, invoice amount, spend cap, margin floor, approved vendors, and blocked vendors.
6. Start the selected workflow from Workflow with `Start Run`.
7. Watch the workflow graph move through Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Guardrail, Spend Decision, Agent Work, SQLite Audit Ledger, and Profit Report.
8. Click Hermes node and show `used_real_hermes=true` when configured, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and ordered tool calls.
9. Click Stripe node and show `used_real_stripe=true` when configured, `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
10. Click Policy / Spend Decision and show approved spend branch plus the blocked unsafe spend branch. For Harbor, show why the $750 Premium Automation Suite request was blocked.
11. Click Report node and show the final profit report. For Harbor, show $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and about 84.4% margin.
12. Open Audit and show SQLite events, ledger rows, policy checks, Stripe records, and orchestration calls.
13. Open Runs and show persisted run history. Click a previous run if available.
14. Open Settings / Integrations and show auth status, Hermes status, Stripe test mode/open-unpaid honesty, SQLite path/counts, local policy engine, and NemoClaw as next/not real yet.
15. Log out.

Goal 7.8 makes the recording product usage, not a static dashboard walkthrough. Goal 8 remains next for NemoClaw / policy safety integration and presentation. No live-money support was added.

The recording should show browser product usage, not static cards. Hosted judge demo mode
must not expose secrets. Local full-proof mode can use ignored `.env` values for real
isolated Hermes and real Stripe test-mode invoice proof.
