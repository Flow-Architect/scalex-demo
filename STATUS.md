# STATUS - ScaleX ClientOps Autopilot

Last updated: 2026-06-29

## Verified Current State

- Project folder exists at `/home/ascabrya/dev/scalex-demo`.
- Latest committed baseline before Goal 8E: `615a9bd Document NemoClaw correction and next
  integration plan`.
- Last completed goal: Goal 8U - Connection Hub system logos.
- Last completed implementation/QA goal: Goal 8U - frontend-only Connection Hub logo polish.
- Last completed documentation/tracking update: Goal 8U Connection Hub logo closeout.
- Last completed checkout cleanup: Open Source Checkout Cleanup for judge readiness.
- Current priority: Goal 9 - final repo/video/submission polish.
- Goal 8I used the uploaded six-phase control-room visual prompt as a design specification only.
  It did not become a hardcoded single-file prototype, did not remove API calls, and preserved
  deterministic Judge Demo Mode, auth behavior, backend state, evidence boundaries, Stripe
  safety, isolated Hermes, optional NemoHermes, local policy truthfulness, and fail-closed
  behavior.
- Goal 7.11B replaced the legacy Harbor sample with Northstar Dental Group / Client Implementation Launch.
- Goal 7.11C-followup replaced the remaining generated dashboard/card shell with a ClientOps
  operation-file workspace across Dashboard, Function Studio, Onboarding, Client Operations,
  Runs, Evidence Ledger, Integrations, and Settings.
- Goal 7.11D unified the visual language across the light operation-file workspace, polished
  Function Studio into a more business-readable demo path, normalized primary proof labels, and
  verified the browser flow from login through logout.
- Goal 7.12 made Start Run visibly execute the Northstar client operation end to end.
- Goal 7.13A documented Connection Hub, the future MCP-shaped boundary, the Full Proof Mode
  real-tool demo plan, and the real NeMo target without changing code.
- Open Source Checkout Cleanup made Judge Demo Mode the safe `.env.example` default, taught
  `scripts/dev.sh` to load `.env` quietly when present, added checkout run/test commands to
  START_HERE, and clarified README/demo/submission checkout language.
- Goal 8A preflight is complete. The NeMo Guardrails Python package is installed locally outside
  the repo at `/home/ascabrya/.venvs/scalex-nemo/bin/python` and imports `nemoguardrails`,
  `LLMRails`, and `RailsConfig`; observed version is 0.21.0.
- Goal 8B added the guardrail adapter boundary, optional NeMo Guardrails runtime probing, SQLite
  guardrail evaluation persistence, API/UI proof fields, and setup/check scripts.
- Goal 8C strengthened guardrail execution rails around input, planning, protected finance
  requests, spend policy/ledger actions, and output honesty. Guardrail decisions are now recorded
  as `allow`, `warn`, `block`, or `fail_closed`, and blocked unsafe content stops before protected
  actions continue.
- Goal 7.13B replaced the old Integrations surface with a product-facing Connection Hub view for
  allowed systems, connector modes, guardrails, missing config, blocked policy actions, planned
  connectors, and evidence duties.
- Goal 7.14B passed Full Proof local validation in a configured local-only environment with real
  isolated Hermes, real Stripe test-mode invoice proof, NeMo Guardrails adapter runtime
  verification, local policy active, and synthetic Northstar data only.
- Goal 7.15A corrected the roadmap distinction between the implemented NeMo Guardrails adapter
  through the Python `nemoguardrails` package and the not-yet-installed actual NVIDIA NemoClaw /
  OpenShell / `nemohermes` runtime. It also added the product-depth UI plan, Telegram approval-gate
  plan, and MCP pause/reorder.
- Goal 8E added an optional backend runtime adapter for the externally validated local
  NemoClaw/NemoHermes API at `127.0.0.1:8642/v1`. ScaleX can route planning through
  `HERMES_RUNTIME=nemoclaw` with model `hermes-agent`, records non-secret sandbox/provider/model
  evidence, and fails closed if selected but unavailable.
- Goal 8F implemented the command-center/product-depth pass with client onboarding, employee
  onboarding, document intake review, labor costing, richer economic controls, policy guardrail
  proof, agent workbench, judge proof, and final profit after labor.
- Goal 8G is now the enterprise governed execution narrative lock. It supersedes the earlier
  Telegram approval-gate handoff for this deadline window; Telegram remains deferred/planned.
- Goal 8G updated the UI to lead with "Governed execution for revenue-backed client operations",
  relabeled Function Studio to Governed Run Studio, changed Start Run to Start Governed Run,
  added the first-screen Control Stack, Enterprise Pain -> ScaleX Control panel, governed
  execution rails, blocked-risk spotlight, central Economic Control formula, enterprise Evidence
  Ledger table, and Why This Is Not Zapier comparison.
- Goal 8H completed the frontend-first cinematic demo redesign. It was a visual storytelling
  pass, not a new integration. The final recording story is:
  Act 1 - Northstar Dental Group has a paid Client Implementation Launch with secured revenue,
  approved setup spend, labor cost, blocked risk, protected profit, and protected margin.
  Act 2 - Hermes creates the plan, Stripe proves finance state, NeMo/local policy checks risky
  actions, and ScaleX approves safe actions while blocking unsafe ones.
  Act 3 - the evidence ledger records approvals, blocks, proof, safety notes, and the final
  protected-profit outcome.
- Goal 8I replaced the scrolling/section-heavy demo skin with a fixed full-viewport dark
  enterprise control-room shell. The app now opens with a 200px left sidebar, compact topbar,
  Active Operation card, API-backed metric strip, governed execution rails, proof tabs for Hermes
  Plan / Stripe Proof / NeMo Guardrails, Governed Run Studio, Enterprise Audit Ledger,
  Connection Hub, Settings / Boundaries, and supporting modules behind the main story.
- Goal 8J completed the final demo-drama polish pass. It restored higher-impact governed-run
  animation, made the seventh rail the blocked $3,200 risky vendor action, added rail activity,
  proof artifact cards, a stronger Evidence Drawer, clearer Connection Hub mode cards, and
  explicit Judge Demo Mode / Stripe Sandbox Prototype / Verified Live Mode framing. It did not add
  integrations or backend state-machine scope and preserved API-backed state, auth, Stripe safety
  boundaries, isolated Hermes, optional NemoHermes, NeMo/local policy truthfulness, and fail-closed
  behavior.
- Goal 8K completed the frontend-only motion storytelling pass. It added local visual rail state
  for Ready -> Running -> final outcomes, progressive proof artifact reveal, live activity chips,
  metric glow, control-stack glow, Evidence Ledger row motion, and judge-friendly labels without
  changing backend mechanics, adding Telegram, adding live mode, adding integrations, or replacing
  the API-backed app.
- Goal 8L completed the frontend-only signal-to-noise pass. It removed the dashboard Rail
  Activity ticker, added an Active Operation identity bar, kept all ten execution rails visible
  in the dashboard viewport, replaced the old proof tabs with context-aware Live Run Detail,
  added four compact run signals, reduced repeated proof/blocked/queued wording, simplified
  artifacts to five control records, and preserved all backend mechanics and truthfulness
  boundaries.
- Goal 8L validation passed `cd frontend && npm run build`, `./scripts/test.sh`,
  `./scripts/check-nemo.sh`, and `git diff --check`. Browser smoke at
  `http://127.0.0.1:5174/` verified the redesigned dashboard render, no default dashboard Rail
  Activity ticker, compact ten-rail map, Live Run Detail, run signals, and protected-profit
  outcome in one viewport. An isolated temp-stack click smoke confirmed the UI enters the running
  state and keeps the blocked-risk/Live Run Detail story visible; its temp backend POST hit a
  readonly `/tmp` SQLite file, so backend completion remains validated by `./scripts/test.sh` and
  the direct deterministic runner against `/tmp/scalex-goal8l-direct.db`.
- Goal 8M completed the frontend-first enterprise polish pass. It slowed visual rail pacing,
  toned down overly shiny animation, resurfaced Business Intake & Cost Basis, added an MCP-ready /
  skill Tool Action Rail, made Stripe invoice/payment flow explicit, made NemoClaw / NeMo
  guardrail boundaries judge-facing, shortened the first-screen product copy, and preserved
  backend mechanics and truthfulness.
- Goal 8M validation passed `./scripts/test.sh`, `./scripts/check-nemo.sh`, `git diff --check`,
  unsafe/generated path scan, staged added-lines secret scan, and browser smoke at
  `http://127.0.0.1:5174/` for Dashboard, Governed Run, Evidence Ledger, Connection Hub,
  Settings, and the blocked-risk animation moment.
- Goal 8N completed the frontend-only brand and overflow polish pass. It uses the provided ScaleX
  logo asset as a cleaned transparent sidebar logo, locks the control-room brand to
  black/white/#fcba03 with semantic colors reserved for status meaning, sharpens corner radii and
  visual treatment, removes page-level horizontal overflow, compacts governed and enterprise
  rails, replaces horizontal activity styling with fixed Run Signals, and preserves backend
  mechanics, API-backed state, truthfulness, and all safety boundaries.
- Goal 8N validation passed `./scripts/test.sh`, `./scripts/check-nemo.sh`, browser smoke for all
  main views, strict browser overflow measurement with no page or uncontrolled element horizontal
  overflow at 1440x900, logo render bounds, blocked-risk animation, and no runtime exceptions.
- Goal 8O completed the tiny frontend-only logo polish pass for the prior transparent asset. That
  historical treatment was superseded by the current new logo implementation using the 1027x348
  RGBA ScaleX logo asset and reusable `BrandLogo` component. Backend mechanics, product layout,
  integrations, and brand colors were not changed.
- Goal 8O validation passed `cd frontend && npm run build` and local browser smoke at
  `http://127.0.0.1:5174/`, confirming the logo renders at 142px by about 50px with
  `object-fit: contain`, transparent wrapper background, dark sidebar background, dashboard
  loaded, no document overflow, and no runtime exceptions.
- The current logo asset at `frontend/public/brand/scalex-logo.png` is now a 1027x348 RGBA PNG
  with its own dark brand treatment. The app uses a reusable `BrandLogo` component with a
  cache-busted source in the fixed sidebar, loading screen, login screen, and shared header.
- Documentation/open-source audit alignment added `docs/OPEN_SOURCE_AUDIT.md`, `SECURITY.md`,
  and `CONTRIBUTING.md`; tightened `.gitignore` for env variants, SQLite files, videos, coverage,
  and generated artifacts; and aligned README/roadmap/spec/architecture/demo/submission docs to
  the then-current optional NemoHermes status and profit display. Goal 8R supersedes those
  economics with the current enterprise cost-basis model.
- Documentation/open-source audit validation passed `git diff --check`, tracked generated/unsafe
  file scan, `./scripts/test.sh`, and `./scripts/check-nemo.sh`. The diff secret-pattern scan
  returned only documentation safety-boundary text such as "without secrets" and "non-secret
  runtime evidence"; no credentials were present.
- Narrow credential-shape scan found only the existing Stripe test-key redaction regex in
  `backend/app/services/hermes_adapter.py`, not an actual key. Repo-local ignore check confirmed
  `.env`, SQLite DBs, build output, `node_modules`, venvs, and pytest caches are ignored.
- Goal 8P slowed the governed run presentation so the frontend remains in running state for the
  readable 16-22 second rail sequence. Stripe finance, NemoClaw/NeMo policy, blocked risk, and
  profit outcome rails now hold long enough for the recording.
- Goal 8P kept the blocked-risk flash/climax, red rail emphasis, blocked-risk count-up, and
  blocked Live Run Detail card. Browser smoke caught the blocked rail at `blockedFlash=true` with
  `blocked-card-flash` on both the rail and detail card.
- Goal 8P added a Dashboard-only running compact mode for the active run area. While
  `runVisualState === "running"`, the Dashboard active area becomes a two-column rails/detail
  stage, hides only secondary Dashboard-running helper text, moves Enterprise Rails lower on the
  Dashboard, and keeps the metric strip, governed rails, active rail state, Live Run Detail,
  blocked-risk detail, and profit outcome visible without scrolling at 1440x900.
- Goal 8P did not compact Governed Run, Evidence Ledger, Connection Hub, Settings / Boundaries,
  sidebar, topbar, or complete-state layout; it did not change backend mechanics, Stripe, Hermes,
  NemoClaw, Telegram, MCP, live mode, `.env`, database files, or integrations.
- Goal 8Q slowed the governed-run presentation again for final recording readability. The
  default ten-rail automatic run now holds active decisions for roughly 48 seconds in browser
  smoke: 3.3s intake, 3.3s cost basis, 3.6s Hermes plan, 5.0s for each Stripe finance rail, 5.0s
  NemoClaw / NeMo policy, 3.6s setup spend approval, 7.2s blocked risky vendor action, 4.2s
  evidence ledger, and 5.0s profit outcome.
- Goal 8Q kept Live Run Detail synchronized with the active rail, stretched the blocked-risk
  count-up to about 3.0 seconds, kept the blocked flash/climax to a single readable moment, and
  preserved the final stable complete state.
- Goal 8Q validation passed `cd frontend && npm run build`, `./scripts/test.sh`,
  `./scripts/check-nemo.sh`, `git diff --check`, and browser smoke at 1440x900. Browser smoke
  sampled the rail sequence from Business Intake through stable complete state at about 47.7s,
  confirmed no horizontal overflow, confirmed Live Run Detail synchronization, and confirmed the
  blocked-risk metric counted through `$1,400` mid-climax before settling at `$3,200`.
- Goal 8Q did not change backend mechanics, Stripe, Hermes, NemoClaw / NeMo backend behavior,
  Telegram, live mode, MCP, `.env`, database files, secrets, branding, colors, or integrations.
- Goal 8R recalibrated protected profit around an enterprise approved delivery cost basis instead
  of setup spend plus a small labor-only adjustment. The current deterministic economics are:
  $8,500 revenue, $3,935 total approved costs, $3,200 blocked risk, $4,565 protected profit,
  53.7% protected margin, and a 50.0% margin floor.
- Goal 8R cost basis line items are $1,150 setup/tool spend, $950 loaded labor cost, $600
  campaign/media cost, $375 materials/delivery cost, $285 platform/processing fees, $350
  QA/compliance overhead, and $225 contingency reserve. Labor is job costing only, not payroll.
- Goal 8R records that allowing the $3,200 Data Broker Enrichment risk would create $7,135 total
  costs, $1,365 profit, and 16.1% margin, so ScaleX blocks it because it violates the 50.0%
  margin floor and vendor/risk policy. Backend mechanics, Judge Demo Mode, Stripe Sandbox
  Prototype wording, Verified Live Mode locked, local policy, optional NemoClaw/NeMo truthfulness,
  no live money, no Telegram, and no new integrations were preserved.
- Goal 8R validation passed `cd frontend && npm run build`, `./scripts/test.sh`,
  `./scripts/check-nemo.sh`, `git diff --check`, unsafe/generated path scan, staged added-lines
  secret scan, API deterministic run smoke, and browser route smoke at 1440x900. Browser smoke
  verified the metric strip shows $8,500 / $3,935 / $3,200 / $4,565 / 53.7%, Cost Basis shows the
  approved delivery stack and $950 job-costing labor, Evidence Ledger shows the new cost-basis
  economics and 16.1% blocked-risk impact, Connection Hub and Settings summarize current
  economics truthfully, `Start Governed Run` clicks successfully, no old $7,088 / 83.4% / $262 /
  $7,350 refs appear in current UI text, and document width equals viewport width.
- Goal 8S updated only the frontend governed-run timing constants for the final recording. The
  default automatic run now takes about 29-30 seconds plus small rail gaps: Business Intake 2.2s,
  Cost Basis 2.2s, Hermes 2.4s, each Stripe finance rail 3.2s, NemoClaw / NeMo policy 3.2s,
  setup spend approval 2.4s, blocked risky vendor action 4.8s, Evidence Ledger 2.6s, and Profit
  Outcome 3.2s.
- Goal 8S shortened the detail transition to 550ms, the blocked-risk count-up to about 1.8s, and
  the blocked flash to 1.2s while keeping the blocked climax, red rail emphasis, blocked-risk
  metric count-up, synchronized Live Run Detail, and stable complete state. Goal 8R economics,
  layout, colors, branding, Evidence Ledger content, Connection Hub, Settings, backend mechanics,
  Stripe/Hermes/NemoClaw behavior, Judge Demo Mode, no live money, no Telegram, and no new
  integrations were preserved.
- Goal 8S validation passed `cd frontend && npm run build`, `./scripts/test.sh`,
  `./scripts/check-nemo.sh`, `git diff --check`, unsafe/generated path scan, staged added-lines
  secret scan, and browser smoke at 1440x900. Browser smoke sampled Business Intake at ~0.6s,
  Cost Basis at ~3.1s, Hermes at ~5.1s, Stripe Invoice at ~7.7s, Stripe Payment Status at
  ~11.2s, NemoClaw / NeMo Check at ~14.2s, approved setup spend at ~17.7s, blocked risky vendor
  action at ~20.3s, Evidence Ledger at ~24.8s, Profit Outcome at ~27.8s, and stable complete
  state at ~30.9s. A focused blocked smoke confirmed the blocked-risk metric counted through
  `$400`, `$800`, `$1,200`, `$1,800`, `$2,200`, `$2,800`, and `$3,200` over about 1.7 seconds,
  then held the blocked detail until Evidence Ledger. Browser smoke also confirmed the Goal 8R
  metrics remained $8,500 / $3,935 / $3,200 / $4,565 / 53.7% and document width matched the
  1440px viewport.
- Goal 8T completed the frontend-only Cost Basis / Delivery Cost Stack display polish. It
  replaced raw approved-cost lines with a compact enterprise table showing cost item, amount,
  percent of revenue, and status; changed the labor disclosure into a restrained "View Labor Job
  Costing" action; and rendered role-based labor job costing as a compact aligned table.
- Goal 8T preserved the $8,500 revenue, $3,935 total approved costs, $3,200 risk contained,
  $4,565 protected profit, 53.7% protected margin, 50.0% margin floor, $950 loaded labor cost,
  backend mechanics, run/reset behavior, Stripe Sandbox Prototype wording, Verified Live Mode
  locked, local policy truthfulness, no live money, no Telegram, no new integrations, no `.env`
  changes, and no database artifacts.
- Goal 8T validation passed `cd frontend && npm run build`, `./scripts/test.sh` with 68 backend
  tests and a successful frontend build, `./scripts/check-nemo.sh`, and browser smoke at
  `http://127.0.0.1:5174/`. Browser smoke verified the cost table rows, no `Label$Amount`
  display for approved cost rows, total approved costs `$3,935`, protected profit `$4,565`,
  protected margin `53.7%`, labor cost `$950`, no horizontal document overflow, a real
  `Start Governed Run` click, and the role-based labor table rows.
- Goal 8U completed the frontend-only Connection Hub system-logo polish. It copied the selected
  square logo assets from the uploaded `ui_square_logo_pngs.zip` bundle into
  `frontend/public/brand/connections/` and uses them for Hermes Planning, Stripe Finance State,
  NeMo Guardrails / Local Policy, and SQLite Evidence Ledger. The Connection Hub card renderer
  keeps the original generic Lucide icons as image-load fallbacks and does not depend on the ZIP
  file or `/mnt/data` at runtime.
- Goal 8U preserved the Connection Hub card labels, truthfulness copy, mode badges, backend
  mechanics, economics, animation timing, Dashboard, Governed Run, Evidence Ledger, Settings,
  sidebar logo, no live money, no Telegram, no new integrations, no `.env` changes, and no
  database artifacts.
- Goal 8U validation passed `cd frontend && npm run build`, `./scripts/test.sh` with 68 backend
  tests and a successful frontend build, `./scripts/check-nemo.sh`, and browser smoke at
  `http://127.0.0.1:5174/`. Browser smoke verified all four Connection Hub cards loaded their
  copied logo assets at `/brand/connections/`, each image completed with 1024x1024 natural size
  inside a 32px frame, no horizontal document overflow, truthfulness text unchanged, and the
  image-load fallback path replacing a failed logo with the generic icon.
- Goal 9 remains final polish and submission assets.
- Goal 7B remains future Verified Live Mode hardening.

## Product Positioning

ScaleX is now documented as **ScaleX Governed ClientOps** for the judge-facing UI narrative, built
on the **ScaleX ClientOps Autopilot** product identity and Enterprise Function Accelerator
submission category.

One-line pitch:

> ScaleX helps enterprise teams safely turn paid client work into governed AI-executed operations.
> Hermes plans the work, Stripe proves the financial state, NeMo checks actions before execution,
> and ScaleX records the evidence, blocks unsafe spend, and reports protected profit.

Enterprise problem:

Enterprises want AI agents to help run client operations, but they cannot let raw agents touch
money, vendors, client workflows, approvals, or internal systems without proof, policy, money
control, and audit evidence. ScaleX gives them a governed execution layer that safely turns paid
client work into guarded, finance-backed, auditable runs.

## Stack Truth

- Hermes plans and routes the client operation.
- Connection Hub is now implemented as the ScaleX product layer that declares allowed systems,
  modes, guardrails, missing config, blocked actions, planned boundaries, and evidence duties.
- Stripe provides finance proof through test invoice/payment state.
- ScaleX executes and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- Guardrail mode defaults to `local_policy`; Judge Demo Mode remains deterministic, secret-free,
  and independent of NeMo.
- Optional `nemo_guardrails` mode probes a configured external Python runtime through
  `SCALEX_NEMO_PYTHON` and fails closed if selected but unavailable, broken, or misconfigured.
  This is the implemented NeMo Guardrails adapter and is useful as a guardrail layer.
- Optional `nemo_compatible` mode is a labeled fallback only and does not set `used_real_nemo=true`.
- Actual NVIDIA NemoClaw / OpenShell Sandbox / `nemohermes` is externally validated on this laptop
  for sandbox `scalex-hermes`; ScaleX now has an optional `HERMES_RUNTIME=nemoclaw` adapter for
  the local OpenAI-compatible API. It is active only when selected and the API call succeeds.
- SQLite records evidence.
- Profit Outcome reports protected profit after approved spend and labor cost, plus blocked risk.
- MCP is documented as a future access pattern only. ScaleX does not currently expose an MCP
  server, external agents cannot yet call ScaleX through MCP, and no MCP implementation exists.
  MCP is paused until the NemoClaw runtime boundary, Telegram approval boundary, and product story
  are safe enough.

## NeMo Guardrails vs NemoClaw Correction

ScaleX currently has:

- local policy engine: implemented.
- Stripe test-mode Full Proof: validated in Goal 7.14B.
- isolated local Hermes Full Proof: validated in Goal 7.14B.
- NeMo Guardrails Python package / `nemoguardrails`: installed outside the repo and runtime
  verified through the Goal 8B adapter path.
- actual NVIDIA NemoClaw / OpenShell sandbox / `nemohermes` runtime: externally validated on the
  local laptop before Goal 8E with sandbox `scalex-hermes`, local API `127.0.0.1:8642/v1`, model
  `hermes-agent`, upstream provider `nvidia-prod`, and upstream model
  `nvidia/nemotron-3-ultra-550b-a55b`.
- ScaleX optional NemoHermes adapter: implemented in Goal 8E behind `HERMES_RUNTIME=nemoclaw`.

The implemented NeMo Guardrails adapter is a useful guardrail layer and may report
`used_real_nemo=true` only when `nemo_guardrails` runtime verification passes. It is not the same
as actual NemoClaw.

NemoClaw is the sandboxed-agent runtime integration. Goal 8E did not modify NemoClaw itself, did
not touch Docker or provider credentials, and did not store secrets. ScaleX now calls the already
validated local NemoHermes OpenAI-compatible API only when explicitly selected. If selected but
unavailable, ScaleX fails closed and records non-secret runtime status evidence.

Historical Goal 7.15A probe to preserve as superseded context: `nemoclaw`, `nemohermes`,
`openshell`, and Docker were missing/not usable then; `node` v22.22.2, `npm` 10.9.7, `zstd`, and
`strings` were present; repo baseline was clean at `c70ba17`.

Implemented optional runtime settings:

- `HERMES_MODE=nemohermes_api` or `HERMES_RUNTIME=nemoclaw`.
- `HERMES_API_BASE_URL=http://127.0.0.1:8642/v1`.
- `HERMES_MODEL=hermes-agent`.
- `NEMOCLAW_SANDBOX_NAME=scalex-hermes`.
- `NEMOCLAW_PROVIDER=nvidia-prod`.
- `NEMOCLAW_MODEL=nvidia/nemotron-3-ultra-550b-a55b`.

The Nous OAuth path was intentionally not used because the working runtime is the NVIDIA provider
route and the Nous session-key minting path is retired for this local setup.

## Implemented Today

The code now implements the Client Implementation Launch template with the synthetic Northstar
Dental Group account.

- Client/account: Northstar Dental Group
- Template: Client Implementation Launch
- Industry label: Multi-location healthcare services group
- Implementation package revenue: $8,500
- Setup/tool spend: $1,150
- Margin floor: 50%
- Approved setup spend: $350 Secure Workspace Pack, $500 Data Migration Sandbox, and $300 Launch Asset Kit
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Approved delivery cost basis: $3,935 total approved costs
- Cost basis line items: $1,150 setup/tool spend, $950 loaded labor cost, $600 campaign/media
  cost, $375 materials/delivery cost, $285 platform/processing fees, $350 QA/compliance
  overhead, and $225 contingency reserve
- Current implemented protected profit: $4,565
- Current implemented protected margin: 53.7%
- Blocked-risk impact if allowed: $7,135 total costs, $1,365 profit, and 16.1% margin
- Formula: protected profit = revenue - total approved costs; protected margin =
  protected profit / revenue
- Synthetic account only; no patient data, no PHI, no healthcare compliance claim, and no HIPAA
  support claim

Harbor Fleet Services is no longer the current implemented sample. It remains historical only in
older changelog entries.

Functional product surfaces remain:

- local FastAPI backend
- Vite React TypeScript frontend
- SQLite evidence ledger
- local prototype auth
- Dashboard, Governed Run Studio, Onboarding, Client Operations, Runs, Evidence Ledger,
  Connection Hub, and Settings
- connected Governed Run Studio page with proof nodes and selected-node inspector
- Judge Demo Mode as the default local execution mode: deterministic Hermes plan,
  Stripe test-double/sandbox finance proof, local policy active, and SQLite evidence records
- Full Proof Mode through `SCALEX_EXECUTION_MODE=full_proof` for configured real isolated Hermes
  and real Stripe test mode, with visible integration errors when misconfigured
- isolated Hermes planning in product mode
- optional NemoHermes API planning in product mode through `HERMES_RUNTIME=nemoclaw`; it calls
  the local `chat/completions` endpoint, records sandbox/provider/model/runtime status evidence,
  and sets `used_real_hermes=true` only after a successful API response
- command-center UI sections for Mission Control, Runtime / Connection Hub, Client Onboarding
  Center, Employee Onboarding Center, Document Intake Review, Workforce / Labor Cost Panel,
  Economic Control Panel, Policy / Guardrail Console, Agent Workbench, Judge Proof / Audit Ledger,
  and Final Profit Report
- deterministic command-center state for fake/demo client and employee intake, extracted-data
  review before save, editable local browser records, fully loaded hourly rate, labor cost, profit
  after vendor spend and labor, and margin warnings
- Goal 8G enterprise narrative UI: first-screen hero, Control Stack, governed rails, blocked-risk
  spotlight, labor-aware protected profit, enterprise audit ledger, and comparison panel
- real Stripe test-mode invoice path when configured with `sk_test_...`
- deterministic test-double paths for tests/CI/diagnostics only
- local policy engine for current guardrail enforcement
- guardrail adapter modes: `local_policy`, `nemo_guardrails`, and `nemo_compatible`
- `guardrail_evaluations` SQLite records for input, planning, execution, and output rail proof,
  including pre-action execution gates before Stripe finance proof, revenue ledger marking, spend
  policy checks, approved spend ledger rows, and post-execution blocked-spend consistency
- API/UI proof fields for guardrail mode, adapter status, decision, `used_real_nemo`,
  `fail_closed`, evaluation stages, local policy active status, and blocked-spend ledger-row proof

## Verified For Goal 8F

Goal 8F implemented a docs-first command-center UI, demo-safe document intake review, deterministic
client/employee onboarding proof, and labor costing without modifying NemoClaw, Docker, provider
credentials, real `.env`, databases, backups, Stripe, Hermes production, Full Proof, Telegram,
MCP, or production data.

Recorded updates:

- Added deterministic `command_center` state to `/api/demo/state` for Mission Control, runtime
  route proof, client onboarding, employee onboarding, document intake states, labor costing,
  final profit report, audit proof, and safety proof.
- Added command-center dashboard panels for Mission Control, Runtime / Connection Hub, Client
  Onboarding Center, Employee Onboarding Center, Document Intake Review, Workforce / Labor Cost
  Panel, Economic Control Panel, Policy / Guardrail Console, Agent Workbench, Judge Proof / Audit
  Ledger, and Final Profit Report.
- Added local browser-only manual/edit/save interactions and upload-triggered deterministic
  extraction fixtures. Uploaded files are not stored.
- Added fake/demo employee labor costing with fully loaded hourly rates, assigned hours, total
  labor cost, profit after approved vendor spend and labor, final margin, and margin warning state.
- Preserved deterministic Judge Demo Mode, isolated Hermes, optional NemoHermes runtime routing,
  fail-closed behavior, Stripe safety, local policy guardrails, and SQLite evidence.

Verification completed:

- `backend/.venv/bin/python -m pytest backend/tests/test_demo_runner.py` passed with 24 tests.
- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- `git diff --check` passed.

Suggested commit message:

`Deepen ScaleX command center with intake and labor costing`

## Verified For Goal 8H

Goal 8H completed the cinematic enterprise demo UI redesign without adding new integrations or
changing protected execution behavior.

Recorded updates:

- Replaced the dashboard's first screen with a high-contrast control-room hero for "Governed
  execution for revenue-backed client operations", the Northstar operation, Start Governed Run,
  Review Evidence Ledger, and the Hermes -> Stripe -> NeMo -> ScaleX stack chain.
- Moved Business Intake, Document Intake Review, Workforce Costing, and runtime details into a
  supporting role below the main recording story.
- Added a cinematic Governed Run Stage with 11 visible cards: Input Rail, Hermes Plan, Planning
  Rail, Stripe Finance Proof, Revenue Gate, NeMo / Local Policy, Controlled Spend, Risky Vendor
  Action, Evidence Ledger, Output Honesty Rail, and Profit Outcome.
- Strengthened the blocked-risk moment for Data broker enrichment / premium vendor spend,
  requested amount $3,200, blocked decision, policy/risk reason, margin impact, and fail-closed
  ledger behavior.
- Reworked Economic Control into a central money-control panel with revenue, approved setup spend,
  labor cost, blocked risky spend, protected profit, protected margin, margin floor, and formulas.
- Reworked the Evidence Ledger preview into enterprise audit records with order, actor/system,
  action, result, evidence type, and safety note.
- Made Why This Is Not Zapier a two-column visual comparison between trigger-action automation
  and revenue-backed governed runs.

Deterministic/demo-safe behavior preserved:

- Judge Demo Mode, local policy, Stripe safety boundaries, isolated Hermes, optional NemoHermes,
  intake/document review, workforce costing, evidence boundaries, and fail-closed behavior remain
  intact.

Intentionally not touched:

- No Telegram, new external service, live Stripe, production Hermes, Full Proof run, Docker /
  NemoClaw command, production payroll/HR behavior, live document extraction, real client data,
  real `.env`, real database file, or secret setup was added.

Verification completed:

- Phase 0 docs-first `git diff --check` passed before implementation.
- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Post-implementation `git diff --check` passed.
- Active frontend label scan found no old UI wording for Function Studio, Start Run, ClientOps
  Autopilot, No workflow selected, Create or select a workflow, Harbor Fleet Services, setup
  required, or runtime probe pending.
- Unsafe/generated path scan returned no changed or staged matches.
- Staged added-lines secret scan returned no matches.
- Local dev-server smoke was attempted with `/tmp/scalex-goal8h-smoke.db` and demo-safe
  test-double flags, but sandbox socket binding blocked uvicorn with `PermissionError: [Errno 1]
  Operation not permitted`. Operator local browser smoke remains required before recording.

Suggested commit message:

`Polish ScaleX cinematic enterprise demo`

## Verified For Goal 8I

Goal 8I completed the frontend skin rewrite into a premium dark enterprise control-room UI while
preserving the existing API-backed mechanics.

Recorded updates:

- Replaced the authenticated app shell with a fixed full-viewport dark control room, 200px left
  sidebar, compact topbar, Active Operation card, and persistent Start Governed Run CTA.
- Added a modular `ControlRoomApp` feature instead of a hardcoded single-file prototype.
- Reworked the Dashboard into a metric strip plus Governed Run rails and a proof panel with
  Hermes Plan, Stripe Proof, and NeMo Guardrails tabs.
- Added a dedicated Governed Run Studio with operation details, compact rail map, expandable proof
  snippets, evidence drawer, and rail activity chips.
- Reworked Evidence Ledger into an enterprise audit table with stat pills, evidence type, safety
  notes, result badges, and blocked-risk row emphasis.
- Reworked Connection Hub into product-facing cards for Hermes Planning, Stripe Finance Proof,
  NeMo / Local Policy, and SQLite Evidence Ledger, including truthfulness boundaries.
- Replaced Settings with a Boundaries & Runtime table plus supporting Business Intake, Document
  Review, and Workforce Costing cards behind the main demo story.
- Restored the logout affordance when prototype auth is enabled.

Deterministic/demo-safe behavior preserved:

- Existing backend APIs, `VITE_API_BASE_URL`, auth flow, Judge Demo Mode, Stripe safety,
  deterministic Hermes path, optional NemoHermes path, local policy, NeMo truthfulness fields,
  evidence boundaries, and fail-closed behavior remain intact.

Intentionally not touched:

- No Telegram, new backend feature, new external service, live Stripe, production Hermes, Full
  Proof run, Docker/NemoClaw command, MCP, production payroll/HR behavior, real `.env`, real
  database file, uploaded real file, or secret setup was added.

Verification completed:

- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Local dev-server smoke passed at `http://127.0.0.1:5174/` with demo-safe overrides
  (live Stripe secret key unset, `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`,
  `STRIPE_TEST_DOUBLE_MODE=true`, `SCALEX_AUTH_ENABLED=false`).
- Live browser smoke verified Dashboard, Governed Run, Evidence Ledger, Connection Hub, and
  Settings render without runtime errors.

Suggested commit message:

`Restyle ScaleX enterprise control room UI`

## Verified For Goal 8G

Goal 8G implemented the enterprise demo narrative UI lock without adding new integrations or
changing protected execution behavior.

Recorded updates:

- Updated README, STATUS, TASKS, CHANGELOG, ROADMAP, PRODUCT_SPEC, DEMO_SCRIPT, ARCHITECTURE, and
  SUBMISSION_WRITEUP for the governed execution narrative.
- Reframed the first dashboard screen around ScaleX Governed ClientOps, Northstar Dental Group /
  Client Implementation Launch, revenue secured, approved setup spend, blocked risk, deterministic
  labor cost, protected profit after labor, and protected margin after labor.
- Added prominent UI sections for Enterprise Pain -> ScaleX Control, Control Stack, Governed
  Execution Rails, Blocked Risk Control, Economic Control, Evidence Ledger Preview, and Why This
  Is Not Zapier.
- Relabeled visible UI from Function Studio / Start Run / ClientOps Autopilot to Governed Run
  Studio / Start Governed Run / ScaleX Governed ClientOps where applicable.
- Kept Business Intake, Document Intake Review, Workforce Costing, Connection Hub, Runs, Settings,
  deterministic Judge Demo Mode, isolated Hermes, optional NemoHermes runtime, fail-closed
  behavior, Stripe safety boundaries, local policy behavior, and SQLite evidence.
- Historical Goal 8F/8G economics corrected the then-current labor amount to $261.60, yielding
  $7,088.40 protected profit after labor and 83.4% protected margin after labor, with the old
  ledger gross profit before labor at $7,350 and 86.5%. Goal 8R supersedes the current demo
  outcome with enterprise cost-basis profit.

Intentionally not touched:

- No Telegram, MCP, new external services, real Stripe run, Full Proof run, Docker/NemoClaw
  command, production payroll/HR behavior, external extraction service, live money, real client
  data, real `.env`, real database file, or secret setup was added.

Verification completed:

- Docs-first `git diff --check` passed before implementation.
- `cd frontend && npm run build` passed.
- `./scripts/test.sh` passed with 68 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- Post-implementation frontend label scan found no active old UI wording for Function Studio,
  Function Map, Start Run, ClientOps Autopilot, No workflow selected, Create or select a workflow,
  or Harbor Auto Care.
- Unsafe/generated file scan returned no matches.
- Local dev-server smoke was attempted against `/tmp/scalex-goal8g-demo.db`, but sandbox socket
  binding blocked uvicorn and the required escalation was rejected. No localhost workaround was
  attempted.

Suggested commit message:

`Lock enterprise governed execution demo`

## Verified For Goal 8E

Goal 8E implemented an optional NemoHermes API runtime adapter without modifying NemoClaw,
Docker, provider credentials, real `.env`, databases, backups, Stripe, Telegram, MCP, production
Hermes, or production data.

Recorded updates:

- Added `HERMES_RUNTIME=nemoclaw` support for the externally validated local NemoHermes API.
- Calls `POST {HERMES_API_BASE_URL}/chat/completions` with model `HERMES_MODEL` and the existing
  planning prompt.
- Records non-secret runtime evidence: runtime, endpoint host/path only, model, sandbox, provider,
  upstream model, success/failure, runtime status, duration, and error class.
- Fails closed for unavailable runtime, HTTP errors, malformed responses, and timeouts.
- Keeps Judge Demo Mode deterministic and keeps the existing isolated Hermes path available.
- Updates Connection Hub to show NemoClaw / OpenShell Sandbox, Hermes Agent, local API, NVIDIA
  provider route, upstream model, runtime verified, proof pending, and fail-closed states.

Verification completed:

- `backend/.venv/bin/python -m pytest backend/tests/test_hermes_adapter.py backend/tests/test_demo_runner.py`
  passed with 30 tests.
- `./scripts/test.sh` passed with 66 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with `nemoguardrails` 0.21.0 and `guardrails/scalex` loaded.
- `git diff --check` passed.

Suggested commit message:

`Wire NemoHermes API runtime`

## Verified For Goal 7.15A

Goal 7.15A was docs/tracking/roadmap only. No code implementation, frontend UI change, backend
behavior change, dependency install, Docker install, Stripe run, Hermes run, NeMo run, NemoClaw
run, Full Proof run, `.env` edit, `data/*.db` edit, `data/backups` edit, MCP server, commit, or
new goal-tracking file was created.

Recorded updates:

- Corrected docs to distinguish the implemented `nemoguardrails` adapter from actual NVIDIA
  NemoClaw / OpenShell / `nemohermes`, which is not installed or wired.
- Recorded the local prerequisite probe result: `nemoclaw`, `nemohermes`, `openshell`, and Docker
  missing/not usable; `node` v22.22.2, `npm` 10.9.7, `zstd`, and `strings` present.
- Added the next sequence: Goal 8D actual NemoClaw / NemoHermes preflight; Goal 8E wire ScaleX to
  NemoClaw Hermes runtime if safe; Goal 8F Telegram Human Approval Gate; Goal 7.15B Product Depth
  + Demo-Winning UI Pass; Goal 7.13C MCP Server Prototype only after those boundaries are safe;
  Goal 9 final polish.
- Added the future Product Depth + Demo-Winning UI plan for polished local auth, Command Center
  hero, Operation Catalog, Policy / Risk Library, run-story timeline, evidence drill-down,
  guardrail proof, Stripe honesty, Connection Hub polish, and a 90-second recording path.
- Added the future Telegram approval-gate plan as a human approval channel for risky actions, not
  a chatbot-first feature.
- Paused MCP implementation until the NemoClaw preflight, approval boundary, product-story review,
  and guardrail/tool boundary are complete.

## Verified For Goal 7.13B

- Added a reachable Connection Hub view through the existing product shell navigation.
- The view shows Hermes Planning, Stripe Finance Proof, Guardrails, SQLite Evidence Ledger,
  Prototype Auth, and planned Slack/Email approvals, CRM context, Docs/Notion, Calendar, and MCP
  boundary cards.
- The view distinguishes Judge Demo Mode, Full Proof capability, runtime verification,
  missing configuration, fail-closed, blocked-by-policy, and planned-only states.
- Stripe proof stays honest: live money is unsupported, invoice/hosted URL presence is shown only
  when available, and `paid=false` is not represented as paid.
- Guardrail proof shows mode, adapter status, `used_real_nemo`, `fail_closed`, and the input,
  planning, execution, and output rail stages from existing state fields.
- Evidence proof shows latest selected-run summary, planning/Stripe/policy/guardrail/orchestration
  counts, blocked-spend/no-ledger-row evidence, blocked policy actions, blocked risk, protected
  profit, and protected margin.
- Planned connectors are explicitly planned only; no MCP server, real client email, CRM, Notion,
  calendar, production auth, or generic connector marketplace claim was added.
- No backend API fields or connector backends were added. The UI reuses existing `state_service`
  fields from Goal 8B/8C.
- Verification completed:
  - `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
  - `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
    loaded.
  - A direct `npm run build` in `frontend/` passed during implementation.
  - `git diff --check` passed.
  - Strict added-lines secret scan returned no matches.
  - Unsafe/generated path scan returned no matches for `.env`, SQLite `.db`, data backups,
    `frontend/dist`, `node_modules`, venvs, logs, `CODEX_GOALS.md`, or `GOAL_LOG.md`.
  - `git status --short` was reviewed.
- Goal 7.13B did not run Full Proof validation, make Stripe API calls, call production Hermes,
  edit `.env`, touch `data/*.db` or `data/backups`, add secrets, create an MCP server, or commit.

## Verified For Goal 8C

- Input rail validates selected operation economics, synthetic/local sample boundary, vendor
  safety, no real client data, no real client email, no live-money intent, and no PHI/patient-data
  handling before planning continues.
- Planning rail validates deterministic or Hermes plan JSON, the expected 19-tool sequence, and
  unsafe plan text before any finance/spend action.
- Execution rail now records pre-action guardrail evaluations before Stripe/test-double finance
  proof, before revenue ledger marking, before each spend policy check, before each approved spend
  ledger row, and after execution consistency review.
- Spend execution was split so policy checks/events are recorded first and approved spend ledger
  rows are written only after a guardrail preflight. Blocked spend still creates policy/evidence
  records and no spend ledger row.
- Output rail validates final report economics, protected profit/margin math, paid-state honesty,
  no real client email, no PHI/patient data, and no live-money or Stripe-paid claim when
  `paid=false`.
- `nemo_guardrails` remains optional and fails closed when selected but unavailable before Stripe
  or ledger actions. `nemo_compatible` remains fallback-only and never sets `used_real_nemo=true`.
- Judge Demo Mode remains deterministic and secret-free with the expected 19 orchestration calls
  and unchanged Northstar economics.
- Full Proof compatibility fields remain intact. Goal 8C did not rerun Full Proof or make real
  Stripe API calls.
- UI/API proof now exposes rail/stage, decision, source/mode, adapter status, `used_real_nemo`,
  `fail_closed`, and blocked-spend ledger-row evidence.
- Verification completed:
  - `backend/.venv/bin/python -m pytest backend/tests/test_guardrails_service.py backend/tests/test_demo_runner.py` passed with 34 tests.
  - `./scripts/test.sh` passed with 61 backend tests and a successful frontend build.
  - `./scripts/check-nemo.sh` passed with real NeMo runtime available and `guardrails/scalex`
    loaded.

## Verified For Goal 8B

- Added guardrail config with default `SCALEX_GUARDRAIL_MODE=local_policy`.
- Added optional real NeMo runtime settings:
  - `SCALEX_NEMO_PYTHON`
  - `SCALEX_NEMO_CONFIG_PATH=./guardrails/scalex`
  - `GUARDRAILS_FAIL_CLOSED=true`
  - `GUARDRAILS_RECORD_EVALUATIONS=true`
- Added `backend/app/services/guardrails_service.py` with a subprocess-only NeMo probe. The main
  Python 3.14 backend does not import `nemoguardrails`.
- Added a credential-free `guardrails/scalex` config that `RailsConfig.from_path` can load.
- Added `guardrail_evaluations` to `data/schema.sql`, repository helpers, state service output,
  and table counts.
- Added guardrail evaluations to the run lifecycle for input, planning, execution, and output
  stages without changing the 19-step orchestration call sequence.
- Preserved local policy as the active deterministic business-rule gate for payment-before-spend,
  vendor allow/block lists, the $1,150 setup spend cap, 50% margin floor, human approval threshold,
  and blocked Unapproved Data Broker Enrichment behavior.
- Added frontend proof in Dashboard, Function Studio, Evidence Ledger, Integrations, Settings,
  workflow audit counts, and the policy/guardrail inspector.
- Added `requirements-nemo.txt`, `scripts/setup-nemo.sh`, and `scripts/check-nemo.sh`.
- `scripts/check-nemo.sh` passed against `/home/ascabrya/.venvs/scalex-nemo/bin/python`, reported
  NeMo 0.21.0, imported `LLMRails` and `RailsConfig`, and loaded `guardrails/scalex`.
- A `/tmp` smoke run with `SCALEX_GUARDRAIL_MODE=nemo_guardrails` and
  `SCALEX_NEMO_PYTHON=/home/ascabrya/.venvs/scalex-nemo/bin/python` completed with
  `adapter_status=runtime_verified`, `used_real_nemo=true`, `fail_closed=false`, four guardrail
  evaluations, and Stripe still in `test_double` mode.
- Judge Demo Mode still works without secrets and with `used_real_nemo=false`.
- No live Stripe keys, live money, Hermes production calls, production data, `.env` edits,
  SQLite `.db` files, data backups, secrets, or local venv files were added.

## Verified For Goal 7.14B Full Proof Local Validation

Goal 7.14B passed from a local-only configured environment. No repo files were edited during the
validation run, and the temporary `/tmp/scalex-fullproof-validation.db` database was removed after
inspection.

- Baseline commit: `c0d2964 Add real-NeMo-ready guardrail adapter`.
- `./scripts/test.sh` passed with 55 backend tests and a successful frontend build.
- `./scripts/check-nemo.sh` passed with real NeMo runtime available.
- Full Proof Start Run completed with synthetic Northstar data only.
- Real isolated Hermes ran: `used_real_hermes=true`.
- Real Stripe test-mode invoice proof ran: `used_real_stripe=true`, `stripe_mode=stripe_test`,
  `livemode=false`, Stripe invoice ID present, hosted invoice URL present, and `paid=false`
  remained unpaid and was not represented as Stripe-paid.
- No real client email was used.
- Real NeMo runtime verification ran: `used_real_nemo=true`, `adapter_status=runtime_verified`,
  and `fail_closed=false`.
- Local policy remained active as the deterministic business-rule gate.
- SQLite proof counts: `planning_runs=1`, `stripe_events=4`, `policy_checks=4`,
  `guardrail_evaluations=4`, `orchestration_calls=19`, `events=14`, `reports=1`, and
  `ledger_entries=4`.
- Historical economics verified at that checkpoint: $1,150 approved setup spend, $3,200 blocked
  Unapproved Data Broker Enrichment risk, $7,350 protected gross profit, and 86.5% protected
  margin. Goal 8R supersedes the current demo outcome with enterprise cost-basis profit.
- Blocked spend created policy/evidence records and did not create a spend ledger row.
- Safety boundaries preserved: no live money, no live Stripe key, no real client email, no
  patient data, no PHI, no production Hermes, and no committed database changes.

## Verified For Open Source Checkout Cleanup

- `.env.example` now defaults to `SCALEX_EXECUTION_MODE=demo`, `SCALEX_AUTH_ENABLED=false`,
  deterministic Hermes planning, and Stripe test-double/sandbox finance proof.
- `.env.example` keeps real credentials blank, avoids live Stripe key examples, and marks Full
  Proof Mode values as optional local-only configuration.
- `scripts/dev.sh` loads `.env` if present without printing values and without failing when `.env`
  is missing.
- `scripts/setup.sh` no longer implies `.env` is required for the judge-safe demo.
- README now presents the judge checkout path: install, run, use the printed frontend URL, click
  Start Run in Judge Demo Mode, run tests, and optionally configure Full Proof Mode locally.
- START_HERE now includes setup, run, frontend URL, and test commands.
- Demo and submission docs clarify that Full Proof Mode uses Stripe test-mode invoice
  creation/finalization for proof only and must not be presented as sending invoice email to a
  real client.
- A LICENSE file is still not present. Recommended license choices before public open-source
  submission are MIT or Apache-2.0, subject to owner approval.
- Goal 8 was not implemented; NeMo was not installed or wired; no MCP server or Connection Hub UI
  was created; no Stripe API calls or Hermes model calls were run; no live-money support, real
  client data, `.env` real values, SQLite `.db`, data backups, extra goal logs, or commits were
  added.

## Verified For Goal 7.13A

- Added the ScaleX Connection Hub concept as a planned internal product layer for ClientOps
  Autopilot. It declares which systems Hermes and future agents are allowed to use, what mode each
  connector is in, what guardrails apply, what configuration is missing, which actions are blocked,
  and what evidence is recorded.
- Preserved the concept lock: ScaleX is business tooling for revenue-backed client operations, not
  a generic MCP platform, generic connector marketplace, integration dashboard, Zapier/n8n clone,
  developer tool first, or AI agent playground.
- Documented active connector concepts: Hermes Planning, Stripe Finance Proof, Local Policy,
  SQLite Evidence Ledger, and Prototype Auth.
- Documented planned connector concepts: NeMo Guardrails, Slack / Email approvals, CRM client
  context, Docs / Notion workspace, and Calendar kickoff scheduling.
- Documented connector statuses: active, demo mode, full proof mode, planned, missing config,
  blocked by policy, unavailable, and failed closed.
- Documented MCP as a future access pattern that may expose safe ScaleX tools, resources, and
  prompts only after the guardrail/tool boundary is clear. ScaleX does not currently expose an MCP
  server and external agents cannot yet call ScaleX through MCP.
- Added the Full Proof Mode real-tool demo plan: real isolated Hermes planning, real Stripe
  test-mode invoice creation/finalization, local policy guardrails, SQLite evidence, synthetic
  Northstar data only, no live money, no real client email, no patient data, no PHI, and no real
  NeMo claim until wired and verified.
- Strengthened Goal 8 positioning: real NVIDIA NeMo Guardrails is the target governed autonomy
  layer, not an optional nice-to-have. Goal 8A must determine the safest practical wiring path.
- Documented the fallback rule: a NeMo-compatible/local adapter is allowed only if Goal 8A proves
  real NeMo cannot be safely wired before submission, with the blocker, temporary adapter, and
  remaining real-NeMo work clearly documented and no UI claim that real NeMo is active.
- Clarified invoice lifecycle: Hermes plans the finance step; ScaleX backend executes approved
  finance actions; Stripe returns test-mode invoice proof and hosted invoice URL when available;
  ScaleX stores proof in the Evidence Ledger; Demo mode creates sandbox finance proof and does not
  call Stripe.
- Preserved Judge Demo Mode and Full Proof Mode truthfulness, including `used_real_hermes`,
  `used_real_stripe`, `stripe_mode=stripe_test`, `livemode=false`, and no paid claim unless
  Stripe reports `paid=true`.
- Goal 8A, Goal 8B-8E, Goal 9, and Goal 7B / Verified Live Mode remain intact.
- No code implementation, MCP server, frontend UI, backend behavior change, Stripe API call,
  Hermes model call, Full Proof Mode live test, Goal 8 implementation, NeMo install/wiring,
  live-money support, `.env` edit, `data/*.db` touch, `data/backups` touch, extra goal log, commit,
  or secret addition was performed.

## Verified For Goal 7.12

- Root cause found: Start Run relied on one blocking `POST /api/demo/run` and only replaced state
  after completion; the button label stayed `Start Run`, so fast deterministic runs collapsed into
  static cards and slower integration runs offered little visible product motion.
- Added explicit execution modes:
  - `SCALEX_EXECUTION_MODE=demo` is the default Judge Demo Mode and works without real secrets.
  - `SCALEX_EXECUTION_MODE=full_proof` preserves real isolated Hermes and real Stripe test-mode
    behavior when safely configured, and keeps visible errors when credentials are missing.
- Added an execution summary to API state with Demo proof mode, deterministic Hermes plan,
  Stripe test-double/sandbox proof, local policy active, and real-adapter flags.
- Added a `run_started` event and kept Runs, timeline events, planning runs, orchestration calls,
  Stripe proof records, policy checks, ledger entries, agent outputs, and profit reports populated
  in SQLite after a successful run.
- Updated Function Studio so `Start Run` changes to `Running...`, the Function Map plays through
  Run Started, Hermes Plan, Stripe Finance Proof, Revenue Gate, Guardrail Review, Approved
  Resources, Blocked Risk, Work Execution, Evidence Ledger, and Profit Outcome, and the Evidence
  Drawer auto-selects the active step.
- Updated evidence proof for Hermes, Stripe, Guardrail Review, Blocked Risk, Profit Outcome, and
  Evidence Ledger; Runs and Evidence Ledger now expose the completed execution and grouped proof.
- Preserved the then-current Northstar economics: $8,500 revenue, $1,150 approved setup spend,
  $3,200 blocked risk, $7,350 protected gross profit, and 86.5% protected margin. Goal 8R
  supersedes the current demo outcome with enterprise cost-basis profit.
- Preserved truthfulness: demo mode does not claim real Hermes or real Stripe; Stripe `paid=false`
  is not shown as paid; local policy active now; real NeMo Guardrails planned/not wired; no
  live-money support; no production auth claim; no patient data and no PHI.

## Verified For Goal 7.11D

- Unified the app around the lighter operation-file visual system so the shell, Dashboard,
  Function Studio, and secondary pages no longer feel like separate products.
- Kept Dashboard business-first with the Northstar operation brief, outcome rail, operating stack,
  template shelf, technical proof route footer, and clear `Open Function Studio` path.
- Strengthened Function Studio with a top operation fact strip, clearer business labels, readable
  Function Map rows, proof-oriented Evidence Drawer copy, and normalized primary proof badges such
  as `test planning proof` and `setup needed` instead of raw snake_case.
- Polished navigation labels to Dashboard, Function Studio, Onboarding, Client Operations, Runs,
  Evidence Ledger, Integrations, and Settings while preserving existing routes and state.
- Lightly polished Onboarding, Client Operations, Runs, Evidence Ledger, Integrations, Settings,
  login, and logout so the demo path is consistent without adding fake functionality.
- Preserved Northstar economics and truthfulness: synthetic account only, no patient data, no PHI,
  no HIPAA claim, local policy active now, NeMo planned/not wired, Stripe not paid unless
  `paid=true`, no live-money support, and no production auth claim.
- Did not implement Goal 8, install or wire NeMo, run Stripe API calls, run Hermes model calls,
  edit `.env`, touch `data/*.db`, touch `data/backups`, create extra goal logs, commit, or change
  Northstar economics.

## Verified For Goal 7.11C-followup

- Replaced the card-grid Dashboard architecture with a top-to-bottom ClientOps operation file for
  the Northstar Dental Group / Client Implementation Launch function.
- Added shared workspace primitives for operation pages, operation hero, outcome rail, operation
  timeline, template shelf, proof routes, empty workspace states, and plain tables.
- Replaced repeated bordered panel/card patterns with larger sections, table/list layouts,
  operation rows, timelines, drawers, and supporting workspace routes.
- Kept Dashboard business-first: hero operation brief, outcome rail, operating stack timeline,
  template shelf, and small supporting routes only.
- Removed Payment, Policy, SQLite, raw invoice IDs, database paths, and detailed counts from the
  first Dashboard screen; they now live in Evidence Ledger, Integrations, Settings, or the
  Function Studio Evidence Drawer.
- Reworked Function Studio into a business workspace with operation brief, readable Function Map,
  Evidence Drawer, and client activity timeline.
- Reworked Onboarding into a Configure Client Implementation Launch operation setup document.
- Reworked Client Operations into Client Operation Files and Runs into Execution History with a clear
  no-execution empty state.
- Reworked Audit/Evidence Ledger into Evidence Ledger, Integrations into Operating Stack, and Settings into
  Boundaries & Runtime.
- Preserved Northstar economics and truthfulness: synthetic account only, no patient data, no PHI,
  no HIPAA claim, local policy active now, NeMo planned/not wired, Stripe not paid unless `paid=true`,
  no live-money support, and no production auth claim.
- Did not touch `.env`, `data/*.db`, live Stripe, real Hermes production config, live-money paths,
  or Goal 8 implementation.

## Verified For Goal 7.11C Initial Pass

- Replaced the Dashboard card-grid console with a business landing page for one revenue-backed
  Northstar client operation.
- Added a hero operation brief for Northstar Dental Group / Client Implementation Launch with
  primary `Open Function Studio` and secondary `Review Evidence Ledger` CTAs.
- Added the historical business outcome strip at that checkpoint: $8,500 revenue, $1,150
  approved setup spend, $3,200 blocked risk, $7,350 protected gross profit, and 86.5% protected
  margin. Goal 8R supersedes the current demo outcome with enterprise cost-basis profit.
- Added the ClientOps operating stack: Hermes plans the operation, Stripe provides finance proof,
  guardrails review spend/risk, SQLite records evidence, and Profit Outcome reports the result.
- Added the function templates section with implemented Client Implementation Launch and planned
  Invoice-to-Cash, Vendor Spend Approval, Client Onboarding, Research-to-Report, Ops Handoff,
  and Renewal Recommendation templates.
- Moved payment, policy, SQLite, raw IDs, database paths, and detailed counts out of the first
  business screen and into supporting evidence routes.
- Preserved Stripe honesty: the Dashboard shows `paid=false` unless Stripe returns `paid=true`.
- Preserved guardrail truthfulness: no real NeMo Guardrails claim was added.
- Did not touch `.env`, `data/*.db`, live Stripe, real Hermes production config, or live-money paths.

## Template Model

Goal 7.11B implemented the previously selected template:

- Template: Client Implementation Launch
- Sample account: Northstar Dental Group
- Revenue: $8,500 implementation package
- Approved setup spend:
  - $350 Secure Workspace Pack
  - $500 Data Migration Sandbox
  - $300 Launch Asset Kit
  - $1,150 total approved setup spend
- Blocked risk: $3,200 Unapproved Data Broker Enrichment
- Historical protected gross profit at that checkpoint: $7,350
- Historical protected margin at that checkpoint: 86.5%
- Margin floor: 50%

Future templates remain planned only: Invoice-to-Cash, Vendor Spend Approval, Client Onboarding,
Research-to-Report, Ops Handoff, and Renewal Recommendation.

## Verified For Goal 7.11B

- Replaced Harbor sample defaults, policy/sample data, UI copy, tests, Hermes skill text, and
  docs with Northstar Dental Group / Client Implementation Launch.
- Preserved guardrail truthfulness: local policy is active now; real NeMo Guardrails is planned
  and not wired yet.
- Preserved Stripe truthfulness: invoices must not be called paid unless Stripe returns `paid=true`.
- Preserved Goal 8A, Goal 9, and Goal 7B.
- Did not install dependencies.
- Did not run live Stripe API calls.
- Did not run real Hermes model calls.
- Did not implement Goal 8.
- Did not wire NeMo.
- Did not add live-money support.
- Did not edit `.env` with real values.
- Did not touch `data/*.db`.
- Did not create `CODEX_GOALS.md` or `GOAL_LOG.md`.
- Did not commit.

## Verification Commands

- For Open Source Checkout Cleanup, `./scripts/test.sh` passed: 49 backend tests and Vite
  production build.
- For Open Source Checkout Cleanup, `git diff --check` passed.
- For Open Source Checkout Cleanup, strict added-lines secret scan returned no matches.
- For Open Source Checkout Cleanup, no `.env`, SQLite `.db`, `data/backups`, `frontend/dist`,
  `CODEX_GOALS.md`, or `GOAL_LOG.md` file is in the git diff or staged.
- For Open Source Checkout Cleanup, `CODEX_GOALS.md` and `GOAL_LOG.md` do not exist.
- For Open Source Checkout Cleanup, `git status --short` was reviewed.
- For Goal 7.13A, `git diff --check` passed.
- For Goal 7.13A, strict added-lines secret scan returned no matches.
- For Goal 7.13A, no `.env`, SQLite `.db`, `data/backups`, `frontend/dist`, `CODEX_GOALS.md`, or
  `GOAL_LOG.md` file is in the git diff.
- For Goal 7.13A, `CODEX_GOALS.md` and `GOAL_LOG.md` do not exist.
- For Goal 7.13A, `git status --short` was reviewed.
- For Goal 7.12, `./scripts/test.sh` passed: 49 backend tests and Vite production build.
- For Goal 7.12, final auth-enabled browser QA passed on backend `8787` and frontend `5174`,
  using `/tmp/scalex-goal712-qa3.db`, `SCALEX_EXECUTION_MODE=demo`, `STRIPE_SECRET_KEY` unset,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=<local-demo-username>`,
  `SCALEX_DEMO_PASSWORD=<local-demo-password>`, and `SCALEX_SESSION_SECRET=<local-session-secret>`.
- Browser QA confirmed login, zero pre-run counts, Northstar selection, Function Studio,
  `Running...` state, run completion, Hermes/Stripe/Guardrail/Blocked Risk/Profit proof,
  Runs, Evidence Ledger, Integrations, logout, and no browser console issues.
- Final QA state recorded 1 run, 14 timeline events, 1 planning run, 19 orchestration calls,
  4 Stripe test-double proof records, 4 policy checks, 4 ledger entries, 4 agent outputs, and
  1 profit report.
- For Goal 7.12, `git diff --check` passed.
- For Goal 7.12, strict added-lines secret scan returned no matches.
- For Goal 7.12, no `.env`, SQLite `.db`, `data/backups`, `frontend/dist`, `CODEX_GOALS.md`, or
  `GOAL_LOG.md` file was staged.
- For Goal 7.12 planning docs update, `git diff --check` passed.
- For Goal 7.12 planning docs update, strict added-lines secret scan returned no matches.
- For Goal 7.12 planning docs update, `git status --short` was reviewed.
- For Goal 7.11D, `./scripts/test.sh` passed: 48 backend tests and Vite production build.
- For Goal 7.11D, `npm run build` in `frontend/` passed after final proof-label polish.
- Auth-enabled browser QA used `/tmp/scalex-goal711d-qa.db`,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=<local-demo-username>`,
  `SCALEX_DEMO_PASSWORD=<local-demo-password>`, `SCALEX_SESSION_SECRET=<local-session-secret>`,
  `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, and `STRIPE_TEST_DOUBLE_MODE=true`.
- Browser QA ran on backend port `8787` and frontend port `5174`.
- Browser QA confirmed login, Dashboard, Northstar operation selection, Function Studio, Start Run,
  Hermes/Finance/Guardrail/Blocked Risk/Profit Outcome Evidence Drawer selections, Onboarding,
  Client Operations, Runs, Evidence Ledger, Integrations, Settings, and logout.
- Final QA screenshots were written to `/tmp/scalex-goal711d-final`.
- For Goal 7.11C-followup, `./scripts/test.sh` passed: 48 backend tests and Vite production build.
- For Goal 7.11C-followup, `npm run build` in `frontend/` passed before the full test script and
  after final visual fixes.
- Auth-enabled browser QA used `/tmp/scalex-goal711c-followup.db`,
  `SCALEX_AUTH_ENABLED=true`, `SCALEX_DEMO_USERNAME=<local-demo-username>`,
  `SCALEX_DEMO_PASSWORD=<local-demo-password>`, `SCALEX_SESSION_SECRET=<local-session-secret>`,
  `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, and `STRIPE_TEST_DOUBLE_MODE=true`.
- Browser QA ran on backend port `8793` and frontend port `5180`.
- Browser QA confirmed login, Dashboard operation file, Start Run in the test-double QA environment,
  Function Studio with Guardrail Review selected in the Evidence Drawer, post-run Studio/Runs
  evidence, Onboarding, Customers, Runs, Audit, Integrations, Settings, and logout.
- Final QA screenshots were written to `/tmp/scalex-goal711c-followup-final`.
- The stale-copy sweep found no current UI matches for `proof routes`, `debug console`, `raw invoice
  identifiers`, `Payment state`, `Policy state`, `SQLite state`, `Selected node`, `nodes active`,
  `Operator console`, or `proof panel`.
- Previous Goal 7.11B full-suite verification passed: 48 backend tests and Vite production build.
- Previous Goal 7.11B safe browser QA passed with `/tmp/scalex-goal711b-browser.db`, local prototype auth,
  `HERMES_TEST_MODE=true`, `HERMES_REQUIRE_REAL=false`, and `STRIPE_TEST_DOUBLE_MODE=true`.
- Historical browser QA confirmed login, Dashboard, Northstar sample load, Studio run, $8,500
  revenue, $1,150 approved setup spend, $3,200 blocked risk, $7,350 protected gross profit,
  86.5% margin, Hermes/Stripe/Guardrail/Blocked Risk/Profit Outcome inspectors, Runs, Audit,
  Integrations, Settings, and logout.
- `git diff --check` passed.
- Tracked-file secret scan passed; broad placeholder hits were reviewed, and the strict tracked-file
  key-material scan returned no matches.
- No `.env`, `data/*.db`, `frontend/dist`, `data/backups`, `CODEX_GOALS.md`, or `GOAL_LOG.md`
  file was staged.
- `git status --short` was reviewed.

## Incomplete Items

- Telegram Human Approval Gate has not been implemented and is deferred unless explicitly
  reprioritized after the enterprise demo lock.
- Goal 7.14B Full Proof local validation has passed; rerun it only before final recording or after
  relevant integration changes.
- Goal 7.13C MCP Server Prototype has not been implemented and is paused until after NemoClaw,
  approval-gate, product-depth, and guardrail/tool-boundary review.
- Real NeMo is not active by default; it is available only through optional `nemo_guardrails` mode
  after runtime verification.
- NemoHermes is not active by default; it is available only through optional
  `HERMES_RUNTIME=nemoclaw` after the local API call succeeds.
- Verified Live Mode live-money execution is not implemented.
- License has not been selected; no `LICENSE` file exists yet.
- Final demo recording and final submission assets are not complete.

## Deferred / Revisit

- Stripe webhooks remain deferred.
- Checkout Session and Payment Link flows remain deferred; current Goal 7 path is invoice-first Stripe test mode.
- Live-money payments remain deferred to Verified Live Mode.
- Production auth, multi-tenant SaaS features, public deployment, real customer workflows,
  production Hermes, Windows Hermes config, Prometheus production data, homelab OpenClaw, Recall
  memory, production NemoClaw/OpenClaw, and real client systems remain out of scope.

## Current Priority

Goal 9 - final repo/video/submission polish and open-source audit closeout.

Recommended sequence:

1. Goal 9 - final repo/video/submission polish and open-source audit closeout.
2. License selection before calling the repo open source.
3. Goal 7.13C - MCP Server Prototype only after NemoClaw, guardrail, and approval boundaries are
   safe.

Goal 7.14B Full Proof validation has passed. Rerun it only before final recording or after changes
that touch Hermes, Stripe, NeMo Guardrails, NemoClaw, policy, guardrail, ledger, or run-proof
behavior.
