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
margin today, optional real NVIDIA NeMo Guardrails runtime probing is available through
`nemo_guardrails` mode, SQLite records evidence, and the final Profit Outcome reports protected
profit and blocked risk. Local policy remains the deterministic business-rule gate.

The current proof is a functional live working product prototype, not a static mock. The operator
logs in, creates or selects a saved local client operation, reviews money rules, starts a run for
the active operation, watches the connected proof graph move, clicks proof nodes, reviews blocked
risk, inspects persisted run history, and finishes with an audited profit outcome.

ScaleX Connection Hub is documented as a planned internal product layer that will show which
systems the ClientOps Autopilot is allowed to use, what execution mode each connector is in, what
guardrails apply, which actions are blocked, which configuration is missing, and what evidence was
recorded. Connection Hub supports the ClientOps Autopilot story; it is not a generic connector
marketplace or MCP platform.

MCP is documented as a future access pattern only. ScaleX does not currently expose an MCP server,
external agents cannot yet call ScaleX through MCP, and the submission should not imply otherwise.

Current implementation note:

- Northstar Dental Group / Client Implementation Launch is the implemented sample.
- Northstar is a synthetic multi-location client account for B2B implementation operations only.
- It uses no patient data and no PHI, and ScaleX does not claim healthcare compliance or HIPAA
  support.
- It proves $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk, $7,350 protected
  gross profit, and 86.5% protected margin.
- Harbor Fleet Services is historical only and is no longer the current implemented sample.

Demo-readiness note:

- Goal 7.12 is complete and makes `Start Run` visibly execute the Northstar Client Implementation
  Launch from run start through planning, finance proof, guardrail review, spend decisions, work
  execution, evidence ledger, and profit outcome.
- Judge Demo Mode works without secrets using deterministic local proof/test-double records and
  clearly labels demo/sandbox proof.
- Full Proof Mode preserves real isolated Hermes and real Stripe test-mode proof when local
  ignored `.env` values are safely configured.
- Goal 7.14B passed Full Proof local validation with synthetic Northstar data only: real isolated
  Hermes ran, real Stripe test-mode invoice proof ran with `livemode=false`, Stripe invoice ID and
  hosted invoice URL were present, `paid=false` remained unpaid, no real client email was used,
  real NeMo runtime verification passed with `adapter_status=runtime_verified`, and local policy
  remained active.
- Goal 7.13A documents Connection Hub, the future MCP-shaped boundary, the Full Proof Mode
  real-tool demo plan, and the real NeMo requirement only. It does not implement MCP, NeMo, new UI,
  or backend behavior.

Demo story:

Northstar Dental Group is a multi-location client that purchased an implementation package.
ScaleX launches the client operation, confirms revenue through Stripe test invoice proof, lets
Hermes plan onboarding and delivery, checks spend and vendor actions through local policy now and
targets real NVIDIA NeMo Guardrails later, approves safe setup spend, blocks risky enrichment
spend, coordinates work units, records evidence, and reports protected profit and launch status.

Full Proof Mode demo plan:

- Use real isolated Hermes planning.
- Use real Stripe test-mode invoice creation/finalization.
- Keep `used_real_hermes=true` and `used_real_stripe=true` only when those real adapters ran.
- Keep Stripe `livemode=false`, show hosted invoice URL only when Stripe provides it, and never
  call `paid=false` paid.
- Use synthetic Northstar data only.
- Do not use live money, real client email, patient data, or PHI.
- Claim real NeMo only when `nemo_guardrails` runtime verification passes; otherwise keep
  `used_real_nemo=false`.

Invoice lifecycle:

- Hermes plans the finance step but does not create or send invoices directly.
- ScaleX backend executes approved finance actions.
- Stripe returns test-mode invoice proof objects and hosted invoice URL when available.
- ScaleX stores invoice proof in the Evidence Ledger.
- Demo mode creates sandbox finance proof and does not call Stripe.
- Full Proof Mode invoice creation/finalization is proof only and must not be described as sending
  an invoice email to a real client.
- No mode should claim a real client was emailed unless an explicit send step exists and is verified.

Truthfulness boundaries:

- The login gate is local prototype auth, not production enterprise auth.
- Workflow management is local/sample workflow management, not full multi-tenant SaaS.
- The active spend authority is the local policy engine.
- Real NVIDIA NeMo Guardrails is optional through `nemo_guardrails` mode only when
  `SCALEX_NEMO_PYTHON` runtime verification passes.
- `nemo_compatible` is a labeled fallback and must not claim real NeMo.
- MCP is planned and not implemented yet.
- Stripe payment status is labeled honestly; invoices are not called paid unless Stripe reports `paid=true`.
- Test doubles stay clearly labeled and are not product-mode integrations.
- Future live-money payments require Verified Live Mode.
- No live-money support was added.
