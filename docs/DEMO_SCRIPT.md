# ScaleX Demo Script

Target recording after Goal 7.9E:

1. Open ScaleX.
2. Log in through the Secure Operator Console.
3. Land on Dashboard and confirm it is the operator overview surface.
4. Open Onboarding or Customers.
5. Select Harbor Fleet Services or create a synthetic/sample customer workflow.
6. Confirm the selected workflow: customer, job goal, invoice amount, spend cap, margin floor, approved vendors, and blocked vendors.
7. Open Workflow and click `Start Run`.
8. Watch the connected workflow canvas progress through Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report.
9. Confirm the right inspector defaults to Run Summary.
10. Optionally drag a workflow node to show that the canvas background stays fixed while the node graph reflows in place.
11. Click Hermes Brain and show the selected-node inspector with `used_real_hermes=true` when configured, `openai-codex / gpt-5.5`, `scalex-operator / skills`, planning output, and proposed tool sequence.
12. Click Stripe Test Invoice and show the inspector with `used_real_stripe=true` when configured, `stripe_mode=stripe_test`, `livemode=false`, customer ID, invoice ID, hosted invoice URL, `invoice_status=open`, and `paid=false` unless Stripe reports a paid invoice.
13. Click Payment Status and confirm it does not claim Stripe-paid revenue unless `paid=true`; local compressed-run confirmation is labeled separately.
14. Click Blocked Spend and show why the $750 Premium Automation Suite request was blocked and that no spend ledger row was created for it.
15. Click Profit Report and show the final economics. For Harbor, show $1,200 revenue, $187 approved spend, $750 blocked unsafe spend, $1,013 gross profit, and about 84.4% margin.
16. Open Runs and show the selected-run summary, execution feed, and final report proof.
17. Open Audit and show the organized SQLite timeline, orchestration calls, ledger rows, Stripe records, and policy checks.
18. Open Integrations and show Hermes status, Stripe test mode/open-unpaid honesty, SQLite ledger, local policy engine, and NeMo Guardrails as Goal 8 planned/not wired yet.
19. Open Settings and show prototype auth, local API/database status, selected workflow/run records, and no-live-money safety boundaries.
20. Log out from the visible top-bar or sidebar control.

Goal 7.9C makes the main Workflow recording feel like product usage in a workflow
automation control room rather than a passive proof-panel tour. No terminal output should
be needed in the video.

Hosted judge demo mode must not expose secrets. Local full-proof mode can use ignored
`.env` values for real isolated Hermes and real Stripe test-mode invoice proof.

Current state after Goal 7.9E: the product now lands on Dashboard, separates Onboarding
from Customers, keeps the Workflow page on the central connected canvas with repositionable
nodes on a fixed background and a right selected-node inspector, keeps the secondary views
on the darker command-center styling, and has a verified browser-only route from login
through logout. Goal 8 is now planned as the Governed Autonomy Layer with NVIDIA NeMo
Guardrails; Goal 8A is the next read-only preflight. Local policy is active now, and real
NeMo Guardrails is not wired yet.
