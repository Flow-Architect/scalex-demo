# ScaleX ClientOps Autopilot Submission Writeup

ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.

ScaleX helps B2B teams turn repeatable client operations into autonomous, revenue-backed,
policy-governed runs with finance proof, guardrail enforcement, and audit evidence.

B2B companies win clients, but onboarding and delivery still happen through fragmented handoffs
across operations, finance, tools, approvals, vendors, and reporting. AI can suggest next steps,
but enterprises cannot safely let an agent execute client operations unless money, spend, policy,
and evidence are governed.

ScaleX demonstrates the governed operating loop: Hermes plans and routes the operation, Stripe
provides finance proof in test mode, ScaleX enforces business rules, local policy checks spend and
margin today, SQLite records evidence, and the final Profit Outcome reports protected profit and
blocked risk. NeMo Guardrails is the planned governed autonomy layer after Goal 8; it is not wired
yet and is not claimed as real.

The current proof is a functional live working product prototype, not a static mock. The operator
logs in, creates or selects a saved local client operation, reviews money rules, starts a run for
the active operation, watches the connected proof graph move, clicks proof nodes, reviews blocked
risk, inspects persisted run history, and finishes with an audited profit outcome.

Current implementation note:

- Northstar Dental Group / Client Implementation Launch is the implemented sample.
- Northstar is a synthetic multi-location client account for B2B implementation operations only.
- It uses no patient data and no PHI, and ScaleX does not claim healthcare compliance or HIPAA
  support.
- It proves $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk, $7,350 protected
  gross profit, and 86.5% protected margin.
- Harbor Fleet Services is historical only and is no longer the current implemented sample.

Demo story:

Northstar Dental Group is a multi-location client that purchased an implementation package.
ScaleX launches the client operation, confirms revenue through Stripe test invoice proof, lets
Hermes plan onboarding and delivery, checks spend and vendor actions through local policy now and
NeMo Guardrails later, approves safe setup spend, blocks risky enrichment spend, coordinates work
units, records evidence, and reports protected profit and launch status.

Truthfulness boundaries:

- The login gate is local prototype auth, not production enterprise auth.
- Workflow management is local/sample workflow management, not full multi-tenant SaaS.
- The active spend authority is the local policy engine.
- Real NeMo Guardrails is planned and not wired yet.
- Stripe payment status is labeled honestly; invoices are not called paid unless Stripe reports `paid=true`.
- Test doubles stay clearly labeled and are not product-mode integrations.
- Future live-money payments require Verified Live Mode.
- No live-money support was added.
