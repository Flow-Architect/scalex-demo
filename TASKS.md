# TASKS - ScaleX ClientOps Autopilot

## Current Priority

Goal 9 - final repo/video/submission polish and open-source audit closeout.

Goal 8Q is complete. Return to final recording and submission readiness:

- Rehearse the three-minute recording against `docs/DEMO_SCRIPT.md`.
- Confirm the local demo opens at `http://127.0.0.1:5174/` with the dark control-room UI.
- Capture final screenshots or video assets only if needed for submission.
- Do a final submission copy check against `docs/SUBMISSION_WRITEUP.md`.
- Review `docs/OPEN_SOURCE_AUDIT.md`, `SECURITY.md`, and `CONTRIBUTING.md` before public release.
- Choose a license before calling the repo open source.
- Run final build/tests/safety scans and keep the repo clean.

Do not add Telegram, live Stripe, production Hermes, Full Proof runs, Docker/NemoClaw commands,
new backend features, new external services, production payroll/HR behavior, MCP, real `.env`
changes, database files, uploaded real files, or secrets.

## Recently Completed

Goal 8Q is complete. It was a frontend-only presentation timing pass for final recording
readability:

- Slowed the default ten-rail governed run to roughly 39 seconds so each active decision remains
  readable.
- Held Business Intake, Cost Basis, Hermes, Stripe finance, NemoClaw / NeMo policy, setup spend,
  blocked risk, evidence ledger, and profit outcome details in sync with the active rail.
- Kept the risky vendor action blocked moment visible for about 5.6 seconds, with a single
  readable red flash and a slower $0 -> $3,200 blocked-risk count-up.
- Preserved the final complete state: all rails complete, risky vendor action visibly blocked,
  protected profit visible, and Live Run Detail on Profit Outcome.
- Preserved API-backed state, run/reset behavior, evidence state, Stripe/Hermes/NeMo truthfulness,
  Judge Demo Mode, Stripe Sandbox Prototype wording, Verified Live Mode locked, local policy,
  onboarding/cost basis, labor costing, MCP-ready/tool action rail, Stripe finance flow,
  NemoClaw/NeMo visibility, no live money, no Telegram, and no new integrations.

Goal 8Q validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- `git diff --check` passed.
- Browser smoke at `http://127.0.0.1:5174/` sampled the 1440x900 run from Business Intake
  through stable complete state at about 38.7s, with no horizontal overflow, synchronized Live Run
  Detail, readable blocked-risk hold, and blocked-risk metric settling at `$3,200`.
- Unsafe/generated path scan and staged added-lines secret scan returned no matches.

Goal 8P is complete. It was a tiny frontend-only timing and Dashboard viewport-fit polish pass:

- Slowed global governed-run presentation timing so the frontend stays in running state for the
  readable rail sequence instead of rushing through the active decision.
- Kept the blocked-risk flash/climax, blocked-risk count-up, red blocked rail emphasis, and
  blocked Live Run Detail card.
- Added Dashboard-only running compact mode for the active run area. While running, Dashboard
  keeps the metric strip, governed rails, active rail state, Live Run Detail, blocked-risk moment,
  and profit outcome visible above the fold.
- Moved Dashboard Enterprise Rails/supporting modules lower only during the active run. Governed
  Run, Evidence Ledger, Connection Hub, Settings / Boundaries, sidebar, topbar, and final complete
  state were not compacted.
- Preserved API-backed state, run/reset behavior, evidence state, Stripe/Hermes/NeMo truthfulness,
  Judge Demo Mode, Stripe Sandbox Prototype wording, Verified Live Mode locked, local policy,
  onboarding/cost basis, labor costing, MCP-ready/tool action rail, Stripe finance flow,
  NemoClaw/NeMo visibility, and no live money.

Goal 8P browser smoke:

- Dashboard loaded at `http://127.0.0.1:5174/`.
- No horizontal overflow at 1440x900 (`documentScrollWidth === innerWidth === 1440`).
- During running state, Dashboard active rails and Live Run Detail both rendered from `top=268`
  to `bottom=892`, inside the 900px viewport.
- Policy, blocked-risk, and profit detail panels had no internal scroll for the main detail body.
- Blocked-risk flash was observed with `blockedFlash=true` and `blocked-card-flash` on the
  blocked rail and detail card.
- Complete state returned to the existing non-compact Dashboard layout and stayed screenshot-ready.

Goal 8O is complete. It was a tiny frontend-only logo/sidebar polish pass, later superseded by
the new full ScaleX logo asset now wired through `BrandLogo`:

- At Goal 8O time, confirmed the then-current logo was a transparent RGBA PNG and kept it inside
  an explicitly transparent, compact sidebar wrapper.
- Current post-audit state uses the new 1027x348 RGBA ScaleX logo asset with its own dark brand
  treatment in the sidebar, loading screen, login screen, and shared header.
- Preserved the black/white/#fcba03 brand treatment and did not change backend mechanics,
  product layout, integrations, Telegram, live mode, Stripe, Hermes, or NemoClaw behavior.

Goal 8O validation:

- `cd frontend && npm run build` passed.
- Browser smoke at `http://127.0.0.1:5174/` verified logo render bounds, transparent wrapper
  background, dark sidebar background, dashboard render, no document overflow, and no runtime
  exceptions.

Documentation/open-source audit alignment after Goal 8O:

- Added `docs/OPEN_SOURCE_AUDIT.md`, `SECURITY.md`, and `CONTRIBUTING.md`.
- Tightened `.gitignore` for local env variants, SQLite files outside `data/`, video/recording
  files, coverage output, and generated artifacts.
- Aligned README, START_HERE, ROADMAP, STATUS, product spec, architecture, demo script, and
  submission writeup to the current API-backed control-room setup.
- Current implemented economics are $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
  risk, $261.60 labor cost shown separately, $7,350 protected gross profit, and 86.5% protected
  margin.
- Optional NemoHermes is documented as selected/verified only; MCP, Telegram, live money,
  production auth, production payroll/HR, real client data, PHI, and production Hermes remain out
  of scope.
- Validation passed: `git diff --check`, tracked generated/unsafe file scan, `./scripts/test.sh`,
  and `./scripts/check-nemo.sh`. Diff secret-pattern scan found only documentation safety-boundary
  text, not credentials.

Goal 8N is complete. It kept the API-backed control-room shell and completed the brand/overflow
polish pass:

- Added the provided ScaleX logo asset to the sidebar with a safe text fallback; the checked-in
  logo was cleaned into a transparent cropped asset for dark-shell rendering.
- Locked the visible brand treatment to black/dark surfaces, white typography, and #fcba03 for
  active navigation, primary CTA, product labels, selected controls, and brand dividers.
- Reserved semantic colors for meaning: green for approved/protected, red for blocked/risk,
  purple for Stripe finance, cyan for NemoClaw/NeMo/policy, and amber for locked/warning states.
- Sharpened/toned down control surfaces, hover borders, badges, and glow so the UI reads more like
  enterprise control software.
- Fixed dashboard/rail horizontal overflow with min-width guards, overflow clipping, compact fixed
  status badges, table clipping, and responsive panel columns.
- Replaced the horizontal activity-strip behavior with fixed Run Signals and kept the blocked-risk
  animation readable.
- Preserved API-backed auth, health/demo state, run/reset behavior, evidence state,
  Stripe/Hermes/NeMo truthfulness, Judge Demo Mode, Stripe Sandbox Prototype wording, Verified
  Live Mode locked, local policy truthfulness, no live money, no Telegram, and no new integrations.

Goal 8N validation:

- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Browser smoke at `http://127.0.0.1:5174/` verified Dashboard, Governed Run, Evidence Ledger,
  Connection Hub, Settings, logo render bounds, no page or uncontrolled element horizontal
  overflow at 1440x900, and the blocked-risk animation moment with no runtime exceptions.

Goal 8M is complete. It kept the API-backed control-room shell and completed the enterprise
polish pass:

- Slowed frontend-only governed-run pacing and reduced game-like flashing/bounce.
- Resurfaced Business Intake & Cost Basis in the dashboard with client/document review,
  workforce costing, labor workers, labor cost, and margin-impact context.
- Added a truthful MCP-ready / skill Tool Action Rail showing intake, Hermes, Stripe, policy /
  NemoClaw, and ledger actions without claiming a real MCP server executed calls.
- Made Stripe Finance Flow explicit: create customer, create invoice, send invoice/payment link,
  retrieve invoice/payment status, record finance state, and gate spend on finance state.
- Made NemoClaw / NeMo Guardrail Layer judge-facing with local policy truth, `used_real_nemo`,
  fail-closed state, checked risk categories, and no Docker/NemoClaw commands invoked.
- Kept the top recording view clear with Northstar operation identity, money/risk/profit metrics,
  support chips, after-sale story strip, governed rails, Live Run Detail, and Enterprise Rails.
- Preserved API-backed auth, health/demo state, run/reset behavior, evidence state, Stripe/Hermes/
  NeMo truthfulness, Judge Demo Mode, Stripe Sandbox Prototype wording, Verified Live Mode locked,
  local policy truthfulness, no live money, no Telegram, and no new integrations.

Goal 8M validation:

- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Browser smoke at `http://127.0.0.1:5174/` verified Dashboard, Governed Run, Evidence Ledger,
  Connection Hub, Settings, and the slower blocked-risk animation moment with no runtime
  exceptions.
- `git diff --check`, unsafe/generated path scan, and staged added-lines secret scan passed.

Goal 8F is complete. ScaleX now has a docs-first command-center UI, deterministic client and
employee intake proof, demo-safe document review states, labor costing, economic controls, policy
proof, agent workbench, judge proof, and final profit after labor.

Goal 8G is complete. ScaleX now opens with the enterprise governed execution narrative, preloaded
Northstar operation metrics, Control Stack, governed execution rails, blocked-risk spotlight,
labor-aware Economic Control, enterprise Evidence Ledger, and Why This Is Not Zapier comparison.
Telegram approval remains deferred and was not implemented in Goal 8G.

Goal 8H is complete. It was a frontend-first visual storytelling redesign for the final recording,
not a new integration. The above-the-fold view now presents a premium control-room product
surface that immediately shows:

- Act 1 - Northstar Dental Group / Client Implementation Launch with $8,500 revenue, $1,150
  approved setup spend, $261.60 labor cost shown separately, $3,200 blocked risk, $7,350
  protected gross profit, and 86.5% protected margin.
- Act 2 - governed AI execution: Hermes plans, Stripe proves finance state, NeMo/local policy
  checks risky actions, and ScaleX approves safe actions while blocking unsafe execution.
- Act 3 - enterprise proof: the evidence ledger records what happened, what was approved, what
  was blocked, what proof exists, and the final protected-profit outcome.

Goal 8H did not add Telegram, new external services, live Stripe, production Hermes, Full Proof
runs, production payroll/HR behavior, live document extraction, or backend state-machine scope.

Goal 8I is complete. It was a frontend skin rewrite, not a new integration or static prototype.
The authenticated app is now a fixed dark enterprise control room with left sidebar, compact
topbar, Active Operation card, API-backed metric strip, governed rails, proof tabs, Governed Run
Studio, Enterprise Audit Ledger, Connection Hub, and Settings / Boundaries.

Goal 8I preserved API-backed mechanics, auth behavior, deterministic Judge Demo Mode, evidence
boundaries, Stripe safety, isolated Hermes, optional NemoHermes, NeMo/local policy truthfulness,
and fail-closed behavior. The local smoke state rendered the current API outcome as $8,500
revenue, $1,150 approved spend, $3,200 blocked risk, $261.60 labor cost, $7,350 protected profit,
and 86.5% protected margin.

Goal 8J is complete. It kept the Goal 8I shell API-backed and added the final visual storytelling
polish: stronger product sentence in the topbar, deliberate rail animation state, blocked-risk
metric count/flash, rail 7 as the $3,200 risky vendor stop, rail activity chips, proof artifacts,
Evidence Drawer proof path, Stripe Sandbox Prototype mode cards, Verified Live Mode locked state,
and clearer NeMo Guardrails vs NemoClaw/NemoHermes boundary language.

Goal 8K is complete. It kept the existing API-backed shell and added the motion storytelling pass:
local visual run state, active/completed rail status, approved-then-blocked rail ordering, the
blocked $3,200 data broker enrichment climax, progressive proof artifact reveal, live rail
activity chips, metric glow, control-stack glow, Evidence Ledger row motion, and clearer
judge-facing labels.

Goal 8L is complete. It kept the API-backed shell and reduced recording noise:

- Removed the full-width dashboard Rail Activity ticker and replaced that role with compact run
  signals inside Live Run Detail.
- Added the Active Operation identity bar above metrics and kept the first screen focused on
  operation identity, metrics, rails, run signals, and the context-aware detail panel.
- Replaced the dashboard proof tabs with Live Run Detail states for ready, Hermes, Stripe,
  NeMo/local policy, blocked risky spend, audit record, and profit outcome.
- Reduced repeated proof/blocked/queued wording across the dashboard and simplified artifacts to
  five control records: Operator Plan, Finance State, Guardrail Decision, Labor Costing, and
  Profit Outcome.
- Preserved API-backed auth, health/demo state, run/reset behavior, evidence state, Stripe/Hermes/
  NeMo truthfulness, Judge Demo Mode, Stripe Sandbox Prototype wording, Verified Live Mode locked,
  local policy truthfulness, and no live money.

Goal 8L validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- `git diff --check` passed.
- Browser render smoke at `http://127.0.0.1:5174/` verified the dashboard fits in one viewport
  with no default Rail Activity ticker, all ten rails visible, Live Run Detail, run signals, and
  protected-profit outcome.
- Isolated temp-stack click smoke confirmed the frontend enters running state and keeps
  blocked-risk/Live Run Detail visible. The temp backend POST hit a readonly `/tmp` SQLite file,
  so backend run completion is covered by `./scripts/test.sh` and direct deterministic runner
  validation.

Goal 8K validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Post-implementation `git diff --check` passed.
- Unsafe/generated path scan returned no matches.
- Staged added-lines secret scan returned no matches.
- Browser animation smoke passed at `http://127.0.0.1:5174/`: initial labels, running labels,
  blocked-risk climax, progressive proof labels, and complete state were verified through Chrome
  DevTools.

Goal 8J validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Post-implementation `git diff --check` passed.
- Unsafe/generated path scan returned no matches.
- Staged added-lines secret scan returned no matches.
- Live local smoke at `http://127.0.0.1:5174/` passed after restarting the dev stack in explicit
  Judge Demo Mode with `/tmp/scalex-goal8j-demo.db`, auth disabled, deterministic Hermes,
  Stripe test-double proof, local policy active, and no Stripe secret exported.

Goal 8E is complete. ScaleX has an optional backend runtime adapter for the already validated
local NemoHermes OpenAI-compatible API. It is selected with `HERMES_RUNTIME=nemoclaw`, records
non-secret runtime evidence, and fails closed if selected but unavailable.

Goal 7.13B is complete. The repo now has a product-facing Connection Hub view for allowed systems,
connector modes, guardrails, evidence duties, missing config, blocked policy actions, and planned
boundaries while preserving Judge Demo Mode and Full Proof compatibility.

## Goal 8I Gate Result

Goal 8I - Frontend Skin Rewrite Using Control-Room Visual Spec is complete.

Completed:

- Replaced the authenticated app with a fixed full-viewport dark enterprise shell, 200px sidebar,
  compact topbar, Active Operation card, and persistent Start Governed Run action.
- Added a modular `frontend/src/features/control-room/ControlRoomApp.tsx` surface instead of
  replacing the app with a hardcoded single-file prototype.
- Rebuilt Dashboard around five API-backed metrics, governed execution rails, and proof tabs for
  Hermes Plan, Stripe Proof, and NeMo Guardrails.
- Added Governed Run Studio, Enterprise Audit Ledger, Connection Hub, and Settings / Boundaries
  views inside the same SPA shell.
- Kept Business Intake, Document Review, and Workforce Costing visible as supporting modules
  behind the main recording story.
- Preserved existing backend/API/auth mechanics and restored logout when prototype auth is
  enabled.

Validation:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Local demo server smoke passed at `http://127.0.0.1:5174/` with demo-safe overrides and no live
  Stripe key exported.
- Browser DevTools smoke verified Dashboard, Governed Run, Evidence Ledger, Connection Hub, and
  Settings render without runtime errors.

Suggested commit message:

`Restyle ScaleX enterprise control room UI`

## Goal 8H Gate Result

Goal 8H - Cinematic Enterprise Demo UI Redesign is complete.

Completed:

- Replaced the first dashboard viewport with a high-contrast control-room hero for governed
  execution, Northstar Dental Group / Client Implementation Launch, Start Governed Run, Review
  Evidence Ledger, and the Hermes -> Stripe -> NeMo -> ScaleX chain.
- Reframed the page order so the main recording path comes before supporting intake/configuration:
  hero, enterprise pain/control, Control Stack, Governed Run Stage, Blocked Risk Spotlight,
  Economic Control, Evidence Ledger, Why This Is Not Zapier, and Profit Report.
- Added an 11-card governed run stage covering Input Rail, Hermes Plan, Planning Rail, Stripe
  Finance Proof, Revenue Gate, NeMo / Local Policy, Controlled Spend, Risky Vendor Action,
  Evidence Ledger, Output Honesty Rail, and Profit Outcome.
- Made blocked risk, money control, evidence, and the Zapier comparison more visually prominent.
- Preserved Business Intake, Document Intake Review, Workforce Costing, deterministic Judge Demo
  Mode, local policy, Stripe boundaries, isolated Hermes, optional NemoHermes, fail-closed
  behavior, and evidence boundaries.

Validation:

- Phase 0 docs-first `git diff --check` passed.
- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Post-implementation `git diff --check` passed.
- Active frontend label scan found no stale Function Studio / Start Run / empty-state demo labels.
- Unsafe/generated path scan returned no changed or staged matches.
- Staged added-lines secret scan returned no matches.
- Dev-server smoke was attempted with `/tmp/scalex-goal8h-smoke.db` and demo-safe flags, but
  sandbox socket binding blocked uvicorn. Local browser smoke is required before recording.

Suggested commit message:

`Polish ScaleX cinematic enterprise demo`

## Goal 8E Gate Result

Goal 8E - Wire ScaleX to the live NemoHermes API Runtime is complete.

Completed:

- Added optional `HERMES_RUNTIME=nemoclaw` config support with safe `.env.example` placeholders.
- Added the NemoHermes OpenAI-compatible `chat/completions` adapter for model `hermes-agent`.
- Preserved default deterministic Judge Demo Mode and the existing isolated Hermes path.
- Added fail-closed behavior for HTTP errors, malformed responses, timeouts, and unreachable API
  failures.
- Added non-secret runtime evidence for runtime, endpoint host/path, model, sandbox, provider,
  upstream model, status, duration, and error class.
- Updated API/UI state and Connection Hub display for NemoClaw / OpenShell Sandbox, Hermes Agent,
  NVIDIA provider route, local API, and runtime status.
- Recorded that the local runtime was validated externally before this goal and that the Nous
  OAuth path was intentionally not used because the NVIDIA provider route is active and the session
  key minting path is retired for this local setup.

Safety:

- No NemoClaw, Docker, provider credential, production Hermes, production data, `.env`, SQLite
  `.db`, backup, live-money, Telegram, MCP, or secret setup was modified.
- Real `used_real_hermes=true` is set only when the selected runtime call succeeds.
- MCP remains paused until the approval gate and product story are ready.

## Goal 8F Gate Result

Goal 8F - Docs-First Command Center UI, Document Intake, and Labor Costing is complete.

Completed:

- Updated docs/spec/tracking first to define intended command-center behavior, UI sections, data
  flow, demo-safe boundaries, labor-costing model, audit expectations, and validation plan.
- Added deterministic backend `command_center` state for Mission Control, runtime route proof,
  client onboarding, employee onboarding, document intake states, labor costing, final profit
  report, audit proof, and safety proof.
- Added command-center dashboard sections for Mission Control, Runtime / Connection Hub, Client
  Onboarding Center, Employee Onboarding Center, Document Intake Review, Workforce / Labor Cost
  Panel, Economic Control Panel, Policy / Guardrail Console, Agent Workbench, Judge Proof / Audit
  Ledger, and Final Profit Report.
- Added local browser-only manual/edit/save interactions and upload-triggered deterministic
  extraction fixtures. Uploaded files are not stored.
- Added fake/demo employee labor costing with fully loaded hourly rates, assigned hours, total
  labor cost, profit after approved vendor spend and labor, final margin, and margin warning state.
- Preserved deterministic Judge Demo Mode, isolated Hermes, optional NemoHermes runtime routing,
  fail-closed behavior, Stripe safety, local policy guardrails, and SQLite evidence.

Safety:

- No NemoClaw, Docker, provider credential, production Hermes, production data, `.env`, SQLite
  `.db`, backup, live-money, Telegram, MCP, external extraction service, or secret setup was
  modified.
- Client and employee intake uses fake/demo records only.
- Labor costing is job costing only, not payroll, HR compliance, or tax processing.
- No raw file contents are logged or stored.

## Goal 8G Scope - Enterprise Demo Narrative UI Lock

Goal 8G is complete.

Required positioning:

- Problem: enterprises want AI agents to help run client operations, but cannot let raw agents
  touch money, vendors, client workflows, approvals, or internal systems without proof, policy,
  money control, and audit evidence.
- ScaleX answer: ScaleX is a governed execution layer for revenue-backed client operations.
  Hermes plans the work, Stripe proves the financial state, NeMo/local policy checks risky
  actions before execution, ScaleX blocks unsafe actions, and the evidence ledger records proof.
- Core demo line: ScaleX helps enterprise teams safely turn paid client work into governed
  AI-executed operations. Hermes plans the work, Stripe proves the financial state, NeMo checks
  actions before execution, and ScaleX records the evidence, blocks unsafe spend, and reports
  protected profit.

Exact demo story:

- Client: Northstar Dental Group.
- Operation: Client Implementation Launch.
- Revenue secured: $8,500.
- Approved setup spend: $1,150.
- Blocked risky spend: $3,200.
- Deterministic Goal 8F labor cost: $261.60, visible as a separate workforce-costing metric.
- Current implemented protected gross profit: $7,350.
- Current implemented protected margin: 86.5%.
- Historical Goal 8G after-labor planning target: $7,088.40 and 83.4%.

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

Implementation constraints:

- Rewrite UI language from Function Studio / Start Run / ClientOps Autopilot toward Governed Run
  Studio / Start Governed Run / ScaleX Governed ClientOps or equivalent enterprise wording.
- Preload the Northstar judge demo and avoid empty default states such as no workflow selected.
- Make the Control Stack prominent: Hermes planner, Stripe finance proof, NeMo/local policy
  guardrail runtime, and ScaleX enterprise control plane.
- Reframe run timeline as governed execution rails: Input, Planning, Finance, Policy, Execution,
  Output, Evidence, and Profit.
- Make the blocked risk decision one of the strongest visual moments.
- Make Economic Control central and include protected profit and protected margin formulas.
- Make Evidence Ledger feel like enterprise audit with actor/system, action, result, evidence
  type, and safety note.
- Preserve onboarding, document intake, and labor costing as Business Intake and Workforce
  Costing support modules.
- Do not add Telegram, new integrations, live API requirements, real Stripe, Full Proof runs,
  production payroll/HR behavior, Docker, NemoClaw commands, or external extraction services.

Completed Goal 8G outputs:

- First-screen headline and subheadline now present ScaleX as governed execution for
  revenue-backed client operations.
- Primary operation card shows Northstar Dental Group / Client Implementation Launch with revenue
  secured, approved setup spend, blocked risk, labor cost, protected profit, and protected margin.
- Primary CTA is Start Governed Run; secondary CTA is Review Evidence Ledger.
- Execution stack reads Hermes plans -> Stripe proves -> NeMo checks -> ScaleX records.
- Control Stack panel makes Hermes, Stripe, NeMo/local policy, and ScaleX roles prominent.
- Governed Execution Rails show Input, Planning, Finance, Policy, Execution, Evidence, Output,
  and Profit rails with decision/proof language.
- Blocked Risk Control highlights the $3,200 data broker enrichment / premium vendor spend block.
- Economic Control centralizes revenue secured, approved setup spend, blocked risky spend, labor
  cost, protected profit, protected margin, margin floor, and formulas.
- Evidence Ledger Preview and Evidence Ledger page show enterprise audit columns.
- Business Intake, Document Intake Review, and Workforce Costing remain as supporting modules.
- Function Studio / Start Run / ClientOps Autopilot visible labels were reframed to Governed Run
  Studio / Start Governed Run / ScaleX Governed ClientOps where applicable.

Goal 8G validation:

- Docs-first `git diff --check` passed before implementation.
- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Frontend label scan found no active old wording for Function Studio, Function Map, Start Run,
  ClientOps Autopilot, No workflow selected, Create or select a workflow, or Harbor Auto Care.
- Unsafe/generated file scan returned no matches.
- Local dev-server smoke was attempted with a `/tmp` database, but sandbox socket binding blocked
  uvicorn and escalation was rejected; no workaround was attempted.

## Goal 7.15A Gate Result

Goal 7.15A - Product Depth, Demo-Winning UI Plan, Telegram Approval Gate Plan, and NemoClaw
Correction is complete as docs-only work.

Completed:

- Corrected docs to distinguish the implemented NeMo Guardrails adapter through Python
  `nemoguardrails` from actual NVIDIA NemoClaw / OpenShell / `nemohermes`.
- Recorded that ScaleX has local policy implemented, Stripe test-mode Full Proof validated,
  isolated local Hermes Full Proof validated, and `nemoguardrails` installed/runtime verified.
- Recorded that actual NemoClaw, OpenShell sandbox, and `nemohermes` are not installed and not
  wired into ScaleX.
- Recorded the local prerequisite probe: `nemoclaw` missing, `nemohermes` missing, `openshell`
  missing, Docker missing/not usable, `node` v22.22.2 present, `npm` 10.9.7 present, `zstd`
  present, `strings` present, and repo baseline clean at `c70ba17`.
- Added a future actual NemoClaw/NemoHermes plan before MCP implementation.
- Added the future Product Depth + Demo-Winning UI Pass.
- Added the future Telegram Human Approval Gate plan.
- Paused MCP until after NemoClaw preflight, approval-gate planning/implementation or explicit
  deferral, product-story review, and guardrail/tool-boundary review.

Safety:

- No code was implemented.
- No frontend UI or backend behavior was changed.
- No NemoClaw, Docker, NeMo, Hermes, Stripe, Full Proof, or MCP runtime was run.
- No `.env`, SQLite `.db`, `data/backups`, secrets, extra goal logs, staging, commit, or generated
  artifacts were added.

## Goal 7.11A Gate Result

Goal 7.11A - ClientOps Autopilot Product Pivot Docs is complete as a docs-only positioning update.

- ScaleX is now documented as **ScaleX ClientOps Autopilot**, an **Enterprise Function Accelerator**
  for revenue-backed client operations.
- The docs now state the enterprise problem: B2B teams struggle to turn signed client work into
  coordinated execution because onboarding, billing, vendor spend, approvals, task routing, and
  reporting are fragmented.
- The stack mapping is explicit:
  - Hermes plans and routes the client operation.
  - Stripe provides finance proof.
  - ScaleX executes and enforces business rules.
  - local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
  - NeMo Guardrails adapter proof is implemented later through Goal 8B/8C; actual NemoClaw is not
    wired yet.
  - SQLite records evidence.
  - Profit Outcome reports protected profit.
- Harbor Fleet Services is now historical only.
- Northstar Dental Group / Client Implementation Launch is implemented by Goal 7.11B.
- No backend logic, frontend code, sample data in code, `.env`, database file, Stripe API call,
  Hermes model call, NeMo wiring, live-money support, commit, or dependency install was performed.

## Goal 7.11B Gate Result

Goal 7.11B - Replace Harbor Sample with Northstar Client Implementation Launch is complete as
the sample implementation pass.

- Harbor Fleet Services is no longer the current implemented sample.
- Northstar Dental Group / Client Implementation Launch is implemented in sample defaults, local
  policy/sample data, UI copy, tests, Hermes skill text, and current demo docs.
- Northstar is a synthetic B2B implementation operations account only: no patient data, no PHI,
  no healthcare compliance claim, and no HIPAA support claim.
- Implemented economics:
  - $8,500 implementation package revenue
  - $350 Secure Workspace Pack
  - $500 Data Migration Sandbox
  - $300 Launch Asset Kit
  - $1,150 total approved setup spend
  - $3,200 Unapproved Data Broker Enrichment blocked risk
  - $7,350 protected gross profit
  - 86.5% protected margin
  - 50% margin floor
- Local policy remains active now for payment-before-spend, vendor, spend cap, and margin floor.
- NeMo Guardrails adapter proof is implemented later through Goal 8B/8C; actual NemoClaw remains
  planned and not wired yet.
- Goal 8 was not implemented at this earlier checkpoint.
- Live-money support was not added.

## Next Recommended Goal

Run Goal 9 - final repo/video/submission polish and source-audit closeout from the current Goal
8O-plus-doc-audit baseline.

Goal 9 should record and package the judge-facing path around ScaleX as a governed execution layer
for revenue-backed client operations. Telegram approval should remain deferred unless the user
explicitly reprioritizes it after the narrative lock.

Preserve the current truth:

- The implemented NeMo Guardrails adapter uses Python `nemoguardrails` through
  `SCALEX_NEMO_PYTHON`.
- Goal 7.14B Full Proof validation passed with real isolated Hermes, real Stripe test-mode proof,
  NeMo Guardrails runtime verification, local policy active, and synthetic Northstar data only.
- Optional NemoHermes API routing is wired behind `HERMES_RUNTIME=nemoclaw`; it is not active by
  default and fails closed if unavailable.
- Judge Demo Mode must remain safe without NemoClaw.
- Full Proof local mode must remain available through the existing validated path.
- NemoHermes mode must fail closed if selected but unavailable.

Goal 9 required output:

- Final video/demo script verification against `docs/DEMO_SCRIPT.md`.
- Final screenshot/browser pass for first-screen clarity, governed rails, blocked risk, economic
  control, evidence ledger, and profit outcome.
- Submission writeup polish only where it reflects implemented behavior.
- Preserve deterministic Judge Demo Mode, isolated Hermes, optional NemoHermes runtime,
  fail-closed behavior, Stripe safety, no live money, no real HR/payroll/compliance data, and no
  external extraction services.
- Keep MCP and Telegram paused unless explicitly reprioritized.

Recommended sequence:

1. Goal 9 - final repo/video/submission polish and open-source audit closeout.
2. License selection before calling the repo open source.
3. Goal 7.13C - MCP Server Prototype only after NemoClaw, guardrail, and approval boundaries are
   safe.
4. Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Goal 7.14B Full Proof local validation is complete. Rerun it only before final recording or after
changes that touch Hermes, Stripe, NeMo Guardrails, NemoClaw, policy, guardrail, ledger, or
run-proof behavior.

## Goal 7.13B Gate Result

Goal 7.13B - Connection Hub UI is complete.

Completed:

- Replaced the visible Integrations nav label with Connection Hub while preserving the existing
  route key.
- Added a product-facing Connection Hub view for the ClientOps operating boundary, not a generic
  connector marketplace.
- Added Active Today cards for Hermes Planning, Stripe Finance Proof, Guardrails, SQLite Evidence
  Ledger, and Prototype Auth.
- Added Full Proof Capable cards for isolated Hermes, Stripe test-mode finance, and optional
  NeMo Guardrails adapter proof.
- Added Planned cards for Slack/Email approvals, CRM context, Docs/Notion workspace, Calendar
  kickoff scheduling, and MCP server boundary, each clearly marked planned only.
- Surfaced status chips for active, demo mode, full proof capable, runtime verified, missing
  config, fail closed, blocked by policy, and planned states.
- Added evidence panels for latest run proof, rail stages, policy-blocked actions, blocked
  spend/no-ledger-row proof, table counts, blocked risk, protected profit, and protected margin.
- Reused existing state fields only; no new connector backend, API route, MCP server, Stripe call,
  Hermes call, or NeMo call was added.

Verified:

- `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
  loaded.
- A direct `npm run build` in `frontend/` passed during implementation.
- `git diff --check` passed.
- Strict added-lines secret scan returned no matches.
- Unsafe/generated path scan returned no matches.
- `git status --short` was reviewed.

Suggested commit message:
Add Connection Hub UI

## Goal 8C Gate Result

Goal 8C - Guardrail Execution Rails in Run Lifecycle is complete.

Completed:

- Strengthened input rail validation for selected operation economics, synthetic/local boundary,
  vendor safety, unsafe real data/email/live-money intent, and PHI/patient-data handling.
- Strengthened planning rail validation for deterministic or Hermes plan JSON, expected tool
  sequence, policy bypass, live-money intent, real client email, unsafe data, and unauthorized
  connector/MCP intent.
- Added execution rail pre-action guardrail evaluations before Stripe/test-double finance proof,
  revenue ledger marking, each spend policy check, each approved spend ledger row, and final
  blocked-spend consistency review.
- Split run spend execution so blocked spend records policy/evidence but never creates a spend
  ledger row, while approved spend writes the ledger row only after execution rail preflight.
- Strengthened output rail validation for paid-state honesty, final report math, protected
  profit/margin consistency, and unsafe output terms.
- Updated API/UI proof to show rail stage, decision, source/mode, adapter status,
  `used_real_nemo`, `fail_closed`, and blocked-spend ledger-row proof.

Verified:

- Focused backend guardrail/runner tests passed with 34 tests.
- `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
  loaded.
- Full Proof was not rerun.

Suggested commit message:
Add guardrail execution rails

## Goal 7.14B Gate Result

Goal 7.14B - Full Proof Local Validation With Configured Real Tools passed from a local-only
configured environment.

Verified:

- `./scripts/test.sh` passed with 55 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available.
- Full Proof Start Run completed with synthetic Northstar data only.
- `used_real_hermes=true`.
- `used_real_stripe=true`, `stripe_mode=stripe_test`, and `livemode=false`.
- Stripe invoice ID was present and hosted invoice URL was present.
- `paid=false` remained unpaid and was not represented as Stripe-paid.
- No real client email was used.
- `used_real_nemo=true`, `adapter_status=runtime_verified`, and `fail_closed=false`.
- Local policy remained active as the deterministic business-rule gate.
- SQLite proof counts: `planning_runs=1`, `stripe_events=4`, `policy_checks=4`,
  `guardrail_evaluations=4`, `orchestration_calls=19`, `events=14`, `reports=1`, and
  `ledger_entries=4`.
- Economics remained $1,150 approved setup spend, $3,200 blocked Unapproved Data Broker
  Enrichment risk, $7,350 protected gross profit, and 86.5% protected margin.
- Blocked spend created policy/evidence records and did not create a spend ledger row.
- Safety boundaries preserved: synthetic Northstar data only, no live money, no live Stripe key,
  no real client email, no patient data, no PHI, and temporary `/tmp` validation database removed.

## Goal 8B Gate Result

Goal 8B - Real-NeMo-Ready Guardrail Adapter + Schema/API is complete.

Completed:

- Added guardrail modes:
  - `local_policy` default, no secrets, no NeMo dependency.
  - `nemo_guardrails` optional real NeMo target via `SCALEX_NEMO_PYTHON`.
  - `nemo_compatible` labeled temporary fallback, not real NeMo.
- Added subprocess-only real NeMo availability probing; the main backend process does not import
  `nemoguardrails`.
- Added `guardrails/scalex` credential-free NeMo config for `RailsConfig.from_path` checks.
- Added `guardrail_evaluations` persistence and repository helpers.
- Added API state fields for guardrail mode, adapter status, `used_real_nemo`, `fail_closed`,
  local policy active, evaluation stages, and evaluation records.
- Added frontend proof fields in Dashboard, Function Studio, Evidence Ledger, Integrations,
  Settings, workflow audit counts, and policy/guardrail inspector.
- Added `requirements-nemo.txt`, `scripts/setup-nemo.sh`, and `scripts/check-nemo.sh`.
- Preserved Judge Demo Mode and Start Run behavior without NeMo or secrets.

Verified:

- `./scripts/test.sh` passed with 55 backend tests and a successful Vite production build.
- `scripts/check-nemo.sh` passed against the external local venv and loaded `guardrails/scalex`.
- Backend focused tests cover default local policy, selected-but-unavailable NeMo fail-closed,
  successful NeMo availability probing, fallback labeling, persisted guardrail evaluations, and
  unchanged Judge Demo Start Run behavior.

Suggested commit message:
Add real-NeMo-ready guardrail adapter

## Open Source Checkout Cleanup Result

Completed as a small judge-readiness cleanup, not a new roadmap goal:

- `.env.example` defaults to Judge Demo Mode, disables auth by default, keeps credentials blank,
  and keeps Full Proof Mode optional/local-only.
- `scripts/dev.sh` loads `.env` quietly when present and still works without `.env`.
- `scripts/setup.sh` tells reviewers that Judge Demo Mode runs without secrets.
- README explains clone/setup/run/test flow, Judge Demo Mode, optional Full Proof Mode, no live
  money, no real client data/PHI, Connection Hub/MCP planned only, and real NeMo targeted/not
  wired.
- START_HERE includes `./scripts/setup.sh`, `./scripts/dev.sh`, the default frontend URL, and
  `./scripts/test.sh`.
- Demo/submission docs clarify that Full Proof Mode Stripe test invoice creation/finalization is
  proof only and must not be presented as sending invoice email to a real client.
- LICENSE is still missing; choose MIT or Apache-2.0 before public open-source submission if the
  owner approves.
- No Goal 8 implementation, NeMo install/wiring, MCP server, Connection Hub UI, Stripe API call,
  Hermes model call, live-money support, real client data, `.env` real values, SQLite `.db`,
  data backups, extra goal logs, commit, or LICENSE file was added.

## Goal 7.13A Gate Result

Goal 7.13A - Connection Hub / MCP Architecture Docs with ClientOps Concept Lock, Full Proof
Real-Tool Demo Plan, and Real NeMo Requirement is complete as a docs-only planning update.

Completed:

- Defined ScaleX Connection Hub as an internal ClientOps product layer that declares allowed
  systems, connector modes, guardrails, missing config, blocked actions, and evidence duties.
- Locked the product concept around ScaleX ClientOps Autopilot, not a generic MCP platform,
  connector marketplace, integration dashboard, developer tool, Zapier/n8n clone, or agent
  playground.
- Documented MCP as a future access pattern only. ScaleX does not currently expose an MCP server,
  external agents cannot yet call ScaleX through MCP, and no NeMo wiring is claimed.
- Added a Full Proof Mode real-tool demo plan for real isolated Hermes planning plus real Stripe
  test-mode invoice creation/finalization with synthetic Northstar data only.
- Clarified invoice lifecycle: Hermes plans the finance step, ScaleX backend executes approved
  finance actions, Stripe returns test-mode proof, and ScaleX stores proof in the Evidence Ledger.
- Strengthened Goal 8 positioning: real NVIDIA NeMo Guardrails is the target governed autonomy
  layer, and a NeMo-compatible/local fallback is allowed only if Goal 8A proves real NeMo cannot
  be safely wired before submission.
- Preserved Judge Demo Mode as safe without secrets and clearly labeled deterministic/sandbox proof.
- Preserved Full Proof Mode as real isolated Hermes plus real Stripe test mode only when safe
  ignored local credentials are configured.
- Preserved Northstar economics: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked risk,
  $7,350 protected gross profit, 86.5% protected margin, and 50% margin floor.
- Preserved truth boundaries: Northstar is synthetic, no patient data, no PHI, no HIPAA claim,
  local policy active now, real NeMo Guardrails planned/not wired, no live-money support, and no
  production auth claim.
- Did not implement code, create an MCP server, add frontend UI, change backend behavior, run
  Stripe API calls, run Hermes model calls, run Full Proof Mode live tests, implement Goal 8,
  install/wire NeMo, edit `.env`, touch `data/*.db`, touch `data/backups`, create extra goal logs,
  commit, or add secrets.

## Goal 7.12 Gate Result

Goal 7.12 - Make Start Run a Real Product Execution is complete.

Completed:

- `Start Run` visibly changes to `Running...` and plays through the Function Studio execution path.
- Judge Demo Mode is the default safe local mode and works without real secrets.
- Demo mode records deterministic Hermes planning proof, Stripe test-double/sandbox finance proof,
  local policy decisions, ledger entries, agent outputs, and final profit outcome in SQLite.
- Full Proof Mode remains available through `SCALEX_EXECUTION_MODE=full_proof` for configured real
  isolated Hermes and real Stripe test mode, with visible integration errors when misconfigured.
- Runs, Evidence Ledger, Integrations, Dashboard, and Function Studio all reflect the latest run.
- Evidence Drawer proof covers Hermes Plan, Stripe Finance Proof, Guardrail Review, Blocked Risk,
  Evidence Ledger, and Profit Outcome.
- Stripe `paid=false` is still not shown as paid, and demo/test-double output is not claimed as
  real Stripe or real Hermes.
- Northstar remains synthetic with no patient data, no PHI, no HIPAA claim, local policy active
  now, NeMo Guardrails planned/not wired, no live-money support, and no production auth claim.

## Goal 7.11D Gate Result

Goal 7.11D - Demo Polish / Visual Consistency Pass is complete as the final pre-Goal-8 UI
consistency pass.

- Unified the shell, Dashboard, login, logout, Function Studio, and secondary pages around the
  lighter ClientOps operation-file visual language.
- Kept Dashboard business-first with the Northstar operation brief, outcome rail, operating stack,
  template shelf, and small proof route footer.
- Polished Function Studio without replacing the working map: added the operation fact strip,
  clearer `Function Studio` / `Function Map` / `Evidence Drawer` language, readable step rows,
  and business-readable proof labels.
- Polished Onboarding, Client Operations, Runs, Evidence Ledger, Integrations, and Settings enough
  for a smooth demo path without adding fake functionality.
- Preserved login/logout, Northstar selection, onboarding save/select, Start Run, selected step
  Evidence Drawer behavior, Runs, Evidence Ledger, Integrations, and Settings.
- Preserved truthfulness: Northstar is synthetic, no patient data, no PHI, no HIPAA claim, local
  policy active now, NeMo planned/not wired, Stripe is not paid unless `paid=true`, no live-money
  support, and no production auth claim.
- Did not implement Goal 8, wire real NeMo, run Stripe API calls, run Hermes model calls, edit
  `.env`, touch `data/*.db`, touch `data/backups`, create extra goal logs, commit, or change
  Northstar economics.
- Verified with `./scripts/test.sh`, `npm run build` in `frontend/`, `git diff --check`, strict
  tracked-file secret scan, staged-artifact checks, and auth-enabled browser QA including Start Run
  on backend `8787` / frontend `5174`.

## Goal 7.11C Gate Result

Goal 7.11C - ClientOps Function Studio Visual Pass is complete after the follow-up pass replaced
the old card-dashboard shell with a ClientOps product workspace.

- Replaced the old Dashboard card-grid console with a business landing page for one revenue-backed
  Northstar Dental Group / Client Implementation Launch operation.
- Added the hero operation brief with `Open Function Studio` and `Review Evidence Ledger` CTAs.
- Added the business outcome strip: $8,500 revenue, $1,150 approved setup spend, $3,200 blocked
  risk, $7,350 protected gross profit, and 86.5% protected margin.
- Added the ClientOps operating stack: Hermes plans the operation, Stripe provides finance proof,
  Guardrails review spend/risk, SQLite records evidence, and Profit Outcome reports the result.
- Added the function templates section with Implemented: Client Implementation Launch and Planned:
  Invoice-to-Cash, Vendor Spend Approval, Client Onboarding, Research-to-Report, Ops Handoff,
  and Renewal Recommendation.
- Moved payment state, policy state, SQLite state, raw invoice IDs, database paths, and detailed
  counts lower or into Evidence Ledger / Integrations.
- Added shared workspace primitives for operation pages, operation hero, outcome rail, operation
  timeline, template shelf, proof routes, empty workspace states, and plain tables.
- Reworked Function Studio into a business-readable workspace with operation brief, Function Map,
  Evidence Drawer, and activity timeline.
- Reworked Onboarding into Configure Client Implementation Launch, Client Operations into Client
  Operation Files, Runs into Execution History, Evidence Ledger into grouped evidence,
  Integrations into Operating Stack, and Settings into Boundaries & Runtime.
- Preserved Stripe honesty: invoice is not paid unless `paid=true`.
- Preserved local policy active now / real NeMo Guardrails planned and not wired.
- Did not add fake live-money support, real customer workflow claims, real NeMo claims, live Stripe
  calls, real Hermes model calls, `.env` edits, or `data/*.db` changes.
- Verified with `./scripts/test.sh`, `npm run build` in `frontend/`, `git diff --check`, strict
  tracked-file secret scan, staged-artifact checks, and auth-enabled browser QA including Start Run
  on backend `8793` / frontend `5180`.

## Goal 8 Sequence

Goal 8 is the governed autonomy and sandbox boundary. Goal 8A, Goal 8B, and Goal 8C are complete
for the NeMo Guardrails adapter path. Goal 7.15A corrected the roadmap: actual NVIDIA NemoClaw /
OpenShell / `nemohermes` is a separate target and must be handled before MCP.

### Goal 8A - NeMo Guardrails Preflight / Architecture Audit

- Complete.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect the current local policy engine and SQLite audit schema.
- Determine the safest practical path to wire the NeMo Guardrails adapter into this repo.
- If the adapter is blocked before submission, document the blocker, temporary fallback, and
  remaining work.
- Produced the exact Goal 8B implementation prompt.
- Preserved product-mode truthfulness: local policy is active now and the NeMo Guardrails adapter
  is optional only after runtime verification.

### Goal 8B - Guardrail Adapter + Schema/API

- Complete. Adapter boundary, modes, persistence, API state, UI proof, and setup/check scripts are
  implemented.

### Goal 8C - Guardrail Execution Rails in Run Lifecycle

- Complete. Added pre-action guardrail checks around input, Hermes/deterministic plan sequence,
  Stripe finance requests, revenue and spend ledger actions, blocked-spend consistency, and final
  report honesty.
- Persisted NeMo-style input, planning, execution, and output rail decisions as `allow`, `warn`,
  `block`, or `fail_closed`.
- Preserved Judge Demo Mode and Full Proof compatibility.

### Goal 8D - Actual NemoClaw / NemoHermes Preflight

- Complete as external/local runtime validation context for Goal 8E.
- Inspect actual NemoClaw / OpenShell / `nemohermes` prerequisites.
- Preserve the recorded probe unless revalidated: `nemoclaw`, `nemohermes`, `openshell`, and
  Docker missing/not usable; `node` v22.22.2, `npm` 10.9.7, `zstd`, and `strings` present.
- Treat Docker carefully because Docker group access has root-level impact on Linux.
- Account for Fedora laptop risk against the Ubuntu 24.04 primary validated path in NemoClaw docs.
- Do not install or run NemoClaw unless a later goal explicitly authorizes it.
- Produce a safe Goal 8E wiring prompt if practical.
- Do not touch production Hermes, Prometheus, xScaleOS, Recall, homelab OpenClaw, real client
  systems, live money, `.env`, secrets, or data files.

### Goal 8E - Wire ScaleX to NemoClaw Hermes Runtime If Safe

- Complete: ScaleX now routes to the already validated local NemoHermes API when
  `HERMES_RUNTIME=nemoclaw` is selected.
- Keep Judge Demo Mode safe without NemoClaw.
- Keep the existing Full Proof local path working.
- Implemented `HERMES_MODE=nemohermes_api` or `HERMES_RUNTIME=nemoclaw`,
  `HERMES_API_BASE_URL=http://127.0.0.1:8642/v1`, and
  `NEMOCLAW_SANDBOX_NAME=scalex-hermes`.
- Fail closed if NemoClaw is selected but unavailable.
- Do not claim NemoHermes was used unless the selected local API call succeeded.

### Goal 8F - Docs-First Command Center UI, Document Intake, and Labor Costing

- Make the UI feel like a repeatable enterprise ClientOps command center, not one hardcoded
  Northstar workflow.
- Add Mission Control, Runtime / Connection Hub, Client Onboarding Center, Employee Onboarding
  Center, Document Intake Review, Workforce / Labor Cost Panel, Economic Control Panel, Policy /
  Guardrail Console, Agent Workbench, Judge Proof / Audit Ledger, and Final Profit Report.
- Support manual and demo-safe file intake for clients and employees, extracted-data review before
  save, edit-before-save, and edit-after-save.
- Add job costing for fake/demo employees only: loaded hourly rates, assigned hours, labor cost,
  profit after vendor spend and labor, final margin, and margin warning states.
- Preserve deterministic Judge Demo Mode, isolated Hermes, optional NemoHermes runtime,
  fail-closed behavior, no live money, no real HR/payroll/compliance data, and no external
  extraction services.

### Goal 8G - Enterprise Demo Narrative UI Lock

- Lock the first screen around governed execution for revenue-backed client operations.
- Show Northstar Dental Group / Client Implementation Launch with $8,500 revenue, $1,150 approved
  setup spend, $3,200 blocked risk, $261.60 labor cost shown separately, $7,350 protected gross
  profit, and 86.5% protected margin.
- Make Hermes, Stripe, NeMo/local policy, and ScaleX roles obvious.
- Reframe the run timeline as governed rails, make blocked risk visually important, centralize
  money control, and make Evidence Ledger read as enterprise audit.
- Preserve Business Intake, Document Intake Review, and Workforce Costing as support modules.
- Do not add Telegram, MCP, new integrations, Full Proof runs, real Stripe runs, Docker/NemoClaw
  commands, production payroll/HR behavior, external extraction services, live money, real client
  data, or secrets.

### Future Telegram Human Approval Gate

- Telegram remains planned as a human approval channel for risky but allowable actions, not a
  chatbot-first feature.
- Future implementation must create pending approval requests, send authorized approval messages,
  verify approve/deny decisions, resume or block actions, and record evidence.
- Future implementation must require allowlisted chat IDs, no secrets, no PHI/patient data,
  signed one-time approval token or approval ID, expiry, deny/expired fail-closed behavior, policy
  re-check before execution, and evidence for every approval/denial.

## Required Product Facts To Preserve

- ScaleX ClientOps Autopilot is an Enterprise Function Accelerator for revenue-backed client operations.
- Connection Hub is an internal ScaleX product layer for allowed systems, modes, guardrails, and
  evidence duties; it is not the product itself.
- MCP is a future access pattern only; ScaleX does not currently expose an MCP server.
- ScaleX must not be positioned as a generic MCP platform, connector marketplace, integration
  dashboard, Zapier/n8n clone, developer tool first, or AI agent playground.
- The demo video should be product usage in the browser.
- Hosted judge demo mode must be safe and must not expose secrets.
- Local full-proof mode can use ignored `.env` values for real isolated Hermes and Stripe test mode.
- Product mode is real-integration-first.
- Product-mode integration failures show visible errors instead of silently falling back.
- Mock/fallback/test-double paths are for tests, CI, offline development, or explicitly labeled diagnostics only.
- Northstar Dental Group / Client Implementation Launch is the current implemented sample.
- Harbor Fleet Services is historical only, not the current demo sample.
- Auth remains local prototype auth unless a future explicit production auth milestone is defined.
- Workflow/customer management remains local/sample workflow management and not full multi-tenant SaaS.
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for guardrails, spend policy, payment actions, ledger writes, and reports.
- SQLite remains the evidence ledger.
- Local policy is active now.
- Guardrail mode defaults to `local_policy`; Judge Demo Mode does not require NeMo.
- Real NVIDIA NeMo Guardrails is available only through optional `nemo_guardrails` mode when
  `SCALEX_NEMO_PYTHON` runtime verification passes.
- Optional NVIDIA NemoClaw / OpenShell / `nemohermes` routing is wired behind
  `HERMES_RUNTIME=nemoclaw`, but it is not active by default.
- `nemo_compatible` is a labeled fallback only and must not claim real NeMo.
- Telegram approval is planned and not implemented yet.
- Stripe live-money execution is not implemented until a future Verified Live Mode milestone.

## Preserved Later Milestones

Goal 7.13C - MCP Server Prototype after the NemoHermes runtime boundary, guardrail boundary,
Telegram approval boundary, and command-center product story are clear. Start with
read-only/resource-style tools where possible; no live-money tools, no real client data, no PHI,
no secret exposure, and no policy/guardrail/approval bypass.

Goal 9 - Final polish and submission assets.

Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Verified Live Mode must require explicit config, live-key/test-key separation, operator
confirmation phrase, maximum live charge cap, customer allowlist, pre-charge review,
policy approval, and SQLite audit records. Hermes may propose a live-money step, but
ScaleX code must enforce every safeguard and execute any allowed action.

## Do Not Work On Yet

- Goal 7.13C MCP Server Prototype before the approval-gate boundary, command-center product story,
  and guardrail/tool boundary pass review.
- Additional NemoClaw installation/onboarding work; the current adapter must not modify NemoClaw
  itself.
- Live-money Stripe execution.
- Real client data.
- PHI or patient data.
- Real client email.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Complex auth.
- Multi-client SaaS dashboard.
- Production packaging.
