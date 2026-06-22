# ScaleX Demo Script

Target recording after Goal 7.9:

1. Open ScaleX.
2. Log in through the Secure Operator Console.
3. Open Customers.
4. Select Harbor Fleet Services or create a synthetic/sample customer workflow.
5. Confirm the selected workflow: customer, job goal, invoice amount, spend cap, margin floor, approved vendors, and blocked vendors.
6. Open Workflow and click `Start Run`.
7. Watch the workflow canvas progress through Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report.
8. Click Hermes Brain and show the selected-node inspector with `used_real_hermes=true` when configured, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and ordered tool calls.
9. Click Stripe Test Invoice and show the inspector with `used_real_stripe=true` when configured, `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
10. Click Blocked Spend and show why the $750 Premium Automation Suite request was blocked.
11. Click Profit Report and show the final economics. For Harbor, show $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and about 84.4% margin.
12. Open Runs and show persisted run history with selected run proof.
13. Open Audit and show SQLite events, orchestration calls, ledger rows, Stripe records, and policy checks.
14. Open Integrations and show Hermes status, Stripe test mode/open-unpaid honesty, SQLite ledger, local policy engine, prototype auth, and NemoClaw as Goal 8 next/not real yet.
15. Log out.

Goal 7.9 should make the recording feel like product usage in a workflow automation
control room rather than a passive proof-panel tour. No terminal output should be needed
in the video.

Hosted judge demo mode must not expose secrets. Local full-proof mode can use ignored
`.env` values for real isolated Hermes and real Stripe test-mode invoice proof.

Current pre-7.9 state: Goal 7.8 already supports local prototype auth, saved local
workflows, selected-workflow runs, clickable workflow graph proof, persisted run history,
Audit, and Settings/Integrations. Goal 7.9 is planned because the working UI is still
visually scattered and needs a central canvas plus right selected-node inspector before
Goal 8.
