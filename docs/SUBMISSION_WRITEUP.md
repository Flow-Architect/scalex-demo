# ScaleX Governed ClientOps Submission Writeup

ScaleX Governed ClientOps is the judge-facing demo narrative for ScaleX ClientOps Autopilot, an
Enterprise Function Accelerator for revenue-backed client operations.

ScaleX helps enterprise teams safely turn paid client work into governed AI-executed operations.
Hermes plans the work, Stripe proves the financial state, NeMo checks actions before execution,
and ScaleX records the evidence, blocks unsafe spend, and reports protected profit.

Enterprises want AI agents to help run client operations, but they cannot let raw agents touch
money, vendors, client workflows, approvals, or internal systems without proof, policy, money
control, and audit evidence.

ScaleX demonstrates the governed execution loop: business intake passes the input rail, Hermes
plans and routes the operation, the planning rail approves bounded work, Stripe provides finance
proof in test mode, the revenue gate verifies the financial state honestly, NeMo/local policy
checks spend and margin before execution, ScaleX approves controlled setup spend, ScaleX blocks
unsafe vendor/data enrichment spend, SQLite records evidence, the output rail verifies paid-state
honesty, and the final Profit Outcome reports protected profit and blocked risk. Local policy
remains the deterministic business-rule gate.

The current proof is a functional live working product prototype, not a static mock. Goal 8F
deepened the browser surface into a command center. Goal 8G locks the judge-facing product
narrative around ScaleX as the enterprise control plane that lets AI safely execute paid client
operations without losing control of money, margin, compliance boundaries, or audit proof.
Goal 8H completed the frontend-first cinematic visual redesign for the recording. It does not add
a new integration or backend feature; it turns the existing deterministic Northstar story into
three visible acts: the paid client operation, governed AI execution, and enterprise proof.
Goal 8I completed the final control-room skin rewrite without replacing the app with a static
prototype: the dashboard, governed run, evidence ledger, connection hub, and settings boundaries
views remain API-backed while presenting a fixed dark enterprise shell for the recording.

ScaleX Connection Hub is an implemented internal product layer that shows which
systems the ClientOps Autopilot is allowed to use, what execution mode each connector is in, what
guardrails apply, which actions are blocked, which configuration is missing, and what evidence was
recorded. Connection Hub supports the ClientOps Autopilot story; it is not a generic connector
marketplace or MCP platform.

MCP is documented as a future access pattern only. ScaleX does not currently expose an MCP server,
external agents cannot yet call ScaleX through MCP, and the submission should not imply otherwise.
MCP is paused until the Telegram approval boundary, product-depth review, and guardrail/tool
boundary are safe.

Current implementation note:

- Northstar Dental Group / Client Implementation Launch is the implemented sample.
- Northstar is a synthetic multi-location client account for B2B implementation operations only.
- It uses no patient data and no PHI, and ScaleX does not claim healthcare compliance or HIPAA
  support.
- It proves $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk, $261.60
  deterministic labor cost, $7,350 protected profit, and 86.5% protected margin in the current
  API-backed control-room profit outcome.
- Harbor Fleet Services is historical only and is no longer the current implemented sample.

Demo-readiness note:

- Goal 7.12 is complete and makes `Start Governed Run` visibly execute the Northstar Client Implementation
  Launch from run start through planning, finance proof, guardrail review, spend decisions, work
  execution, evidence ledger, and profit outcome.
- Judge Demo Mode works without secrets using deterministic local proof/test-double records and
  clearly labels demo/sandbox proof.
- Full Proof Mode preserves real isolated Hermes and real Stripe test-mode proof when local
  ignored `.env` values are safely configured.
- Goal 7.14B passed Full Proof local validation with synthetic Northstar data only: real isolated
  Hermes ran, real Stripe test-mode invoice proof ran with `livemode=false`, Stripe invoice ID and
  hosted invoice URL were present, `paid=false` remained unpaid, no real client email was used,
  NeMo Guardrails adapter runtime verification passed with `adapter_status=runtime_verified`, and
  local policy remained active. This did not verify actual NemoClaw.
- Goal 7.13A documents Connection Hub, the future MCP-shaped boundary, the Full Proof Mode
  real-tool demo plan, and the NeMo Guardrails adapter requirement only. It does not implement MCP, actual
  NemoClaw, new UI, or backend behavior.
- Goal 7.15A corrected the docs so NeMo Guardrails adapter proof is not confused with actual
  NemoClaw. It also added the future Telegram approval-gate plan and Product Depth + Demo-Winning
  UI plan.
- Goal 8F targets a docs-first command-center UI, client/employee onboarding with manual and
  demo-safe document intake, and labor costing. It implements deterministic command-center state,
  local browser-only intake review/edit/save controls, upload-triggered deterministic extraction
  fixtures, fake/demo labor costing, and final profit after labor. It does not add live-money
  behavior, production payroll, HR compliance processing, tax processing, real client data, or real
  employee records.
- Goal 8G targets a docs-first enterprise narrative UI lock. It does not add Telegram, MCP, new
  integrations, real Stripe runs, Full Proof runs, production payroll/HR behavior, Docker/NemoClaw
  commands, external extraction services, live money, real client data, or secrets.
- Goal 8H completed a cinematic enterprise demo UI. It keeps the same deterministic demo-safe
  behavior and same integration truth while making the first screen, governed run stage, blocked
  risk, economic control, control stack, evidence ledger, and comparison panel visually strong
  enough for a three-minute judge recording.

Demo story:

Northstar Dental Group is a multi-location client that purchased an implementation package.
ScaleX launches the Client Implementation Launch operation, confirms revenue through Stripe test
invoice proof, lets Hermes plan onboarding and delivery, checks spend and vendor actions through
local policy now and the optional NeMo Guardrails adapter when configured, targets actual
NemoClaw/OpenShell sandboxing only when selected and verified, approves safe setup spend, blocks
risky enrichment spend, coordinates work units, records evidence, adds demo labor-cost
assumptions, and reports protected profit and launch status after approved vendor spend and labor.

Visible run sequence:

1. Input rail passed.
2. Hermes plan created.
3. Planning rail approved.
4. Stripe finance proof created.
5. Revenue gate verified.
6. NeMo/local policy reviewed action.
7. Controlled setup spend approved.
8. Risky vendor/data enrichment spend blocked.
9. Work execution completed.
10. Evidence ledger recorded proof.
11. Output rail verified paid-state honesty.
12. Profit outcome recorded.

Goal 8F command-center proof:

- Mission Control shows active client/job economics, runtime mode, labor cost, margin, and safe
  status.
- Client Onboarding Center and Employee Onboarding Center support manual entry and demo-safe PDF,
  Excel/spreadsheet, and Word/document intake.
- Document Intake Review requires extracted-data review and editing before save; unsupported-file
  and extraction-failed states are visible.
- Workforce / Labor Cost Panel shows fake/demo employees, base rates, burden, fully loaded rates,
  assigned hours, labor cost, and margin after labor.
- Economic Control uses `Margin = (Revenue - Approved Vendor Spend - Labor Cost) / Revenue`.
- Policy / Guardrail Console shows approved/blocked decisions and proves blocked spend does not
  update the ledger.
- Agent Workbench separates Orchestrator, Finance Agent, Marketing Agent, Research Agent, and Ops
  Agent outputs when available.
- Judge Proof / Audit Ledger shows non-secret events for onboarding, extraction review,
  runtime selection, finance proof, policy checks, labor-cost calculations, agent work, and final
  report.

Full Proof Mode demo plan:

- Use real isolated Hermes planning.
- Use real Stripe test-mode invoice creation/finalization.
- Keep `used_real_hermes=true` and `used_real_stripe=true` only when those real adapters ran.
- Keep Stripe `livemode=false`, show hosted invoice URL only when Stripe provides it, and never
  call `paid=false` paid.
- Use synthetic Northstar data only.
- Do not use live money, real client email, patient data, or PHI.
- Claim NeMo Guardrails adapter proof only when `nemo_guardrails` runtime verification passes;
  otherwise keep `used_real_nemo=false`.
- Do not claim NemoHermes was used unless `HERMES_RUNTIME=nemoclaw` was selected and the local API
  call succeeded.

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
- NeMo Guardrails adapter proof is optional through `nemo_guardrails` mode only when
  `SCALEX_NEMO_PYTHON` runtime verification passes.
- `nemo_compatible` is a labeled fallback and must not claim real NeMo.
- Optional NemoHermes API routing is implemented behind `HERMES_RUNTIME=nemoclaw`, not active by
  default, and fail-closed when unavailable.
- Telegram approval is planned and not implemented.
- MCP is planned and not implemented yet.
- Stripe payment status is labeled honestly; invoices are not called paid unless Stripe reports `paid=true`.
- Test doubles stay clearly labeled and are not product-mode integrations.
- Future live-money payments require Verified Live Mode.
- No live-money support was added.
