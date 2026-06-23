# ScaleX Demo Script

Target recording after Goal 7.9C:

1. Open ScaleX.
2. Log in through the Secure Operator Console.
3. Open Customers.
4. Select Harbor Fleet Services or create a synthetic/sample customer workflow.
5. Confirm the selected workflow: customer, job goal, invoice amount, spend cap, margin floor, approved vendors, and blocked vendors.
6. Open Workflow and click `Start Run`.
7. Watch the connected workflow canvas progress through Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report.
8. Confirm the right inspector defaults to Run Summary.
9. Optionally drag a workflow node to show that the canvas background stays fixed while the node graph reflows in place.
10. Click Hermes Brain and show the selected-node inspector with `used_real_hermes=true` when configured, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and proposed tool sequence.
11. Click Stripe Test Invoice and show the inspector with `used_real_stripe=true` when configured, `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
12. Click Payment Status and confirm it does not claim Stripe-paid revenue unless `paid=true`; local compressed-run confirmation is labeled separately.
13. Click Blocked Spend and show why the $750 Premium Automation Suite request was blocked and that no spend ledger row was created for it.
14. Click Profit Report and show the final economics. For Harbor, show $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and about 84.4% margin.
15. Open Runs and show persisted run history with selected run proof.
16. Open Audit and show SQLite events, orchestration calls, ledger rows, Stripe records, and policy checks.
17. Open Integrations and show Hermes status, Stripe test mode/open-unpaid honesty, SQLite ledger, local policy engine, and NemoClaw as Goal 8 next/not real yet.
18. Open Settings and show prototype auth, local API/database status, active workflow/run records, and no-live-money safety boundaries.
19. Log out.

Goal 7.9C makes the main Workflow recording feel like product usage in a workflow
automation control room rather than a passive proof-panel tour. No terminal output should
be needed in the video.

Hosted judge demo mode must not expose secrets. Local full-proof mode can use ignored
`.env` values for real isolated Hermes and real Stripe test-mode invoice proof.

Current state after Goal 7.9C: the Workflow page has the central connected canvas,
repositionable nodes on a fixed background, and a right selected-node inspector. Goal 7.9D
remains next to clean up Customers, Runs, Audit, Integrations, and Settings before Goal 8.
