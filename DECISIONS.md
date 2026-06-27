# DECISIONS - ScaleX

## Locked Product Decisions

- Product name: ScaleX ClientOps Autopilot.
- Product category: Enterprise Function Accelerator.
- Product type: functional product-style prototype.
- Core use case: revenue-backed client operations.
- Target users: B2B agencies, SaaS implementation teams, client success teams, managed service
  providers, operations teams, finance operations teams, and AI transformation teams.
- Main goal: help B2B teams turn repeatable client operations into autonomous, revenue-backed,
  policy-governed runs with finance proof, guardrail enforcement, and audit evidence.
- ScaleX must not be positioned as a generic MCP platform, generic connector marketplace,
  integration dashboard, Zapier/n8n clone, developer tool first, or AI agent playground.
- Product mode uses real integrations first in the appropriate environment: isolated Hermes Agent,
  Stripe test mode for Goal 7, real guardrail integration only when safe, and SQLite evidence records.
- Mock/fallback/test-double paths are for automated tests, CI, local offline development, or
  explicitly labeled diagnostics only.
- Real integration failures surface visible error states; product mode must not silently fall back
  and pretend the run succeeded.

## Template Decisions

- Current implemented sample: Northstar Dental Group / Client Implementation Launch.
- Current implemented data boundary: synthetic B2B implementation operations only; no patient
  data, no PHI, no healthcare compliance claim, and no HIPAA support claim.
- Current implemented invoice amount: $8,500.
- Current implemented spend cap: $1,150.
- Current implemented margin floor: 50%.
- Current implemented approved setup spend requests: $350 Secure Workspace Pack, $500 Data
  Migration Sandbox, and $300 Launch Asset Kit.
- Current implemented blocked risk request: $3,200 Unapproved Data Broker Enrichment.
- Current implemented final numbers: $8,500 revenue, $1,150 approved setup spend, $3,200
  blocked risk, $7,350 protected gross profit, and 86.5% protected margin.
- Harbor Fleet Services is historical only and is no longer the current implemented sample.

## Stack Decisions

- Hermes plans and routes the client operation.
- Connection Hub is an implemented internal ScaleX product layer that declares allowed systems,
  connector modes, guardrails, missing config, blocked actions, and evidence duties.
- Connection Hub supports ClientOps Autopilot and is not the product itself.
- Stripe provides finance proof through test invoice/payment state.
- ScaleX code executes and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- The NeMo Guardrails adapter is optional through the Goal 8B guardrail adapter boundary when a
  configured external `SCALEX_NEMO_PYTHON` runtime verifies successfully.
- The NeMo Guardrails adapter is implemented through Python `nemoguardrails`; it is not the same
  as actual NVIDIA NemoClaw.
- Actual NVIDIA NemoClaw / OpenShell / `nemohermes` is the target sandboxed Hermes runtime, is not
  installed or wired yet, and must not be claimed active until installed, onboarded, connected, and
  verified.
- Judge Demo Mode defaults to `local_policy` and must not require NeMo or secrets.
- `nemo_compatible` is a labeled temporary fallback only and must not claim real NeMo.
- SQLite is the evidence ledger.
- Profit Outcome is the business result.
- Telegram approval is planned as a human approval channel for risky actions and is not
  implemented yet.
- MCP is a future access pattern only. ScaleX does not currently expose an MCP server, external
  agents cannot call ScaleX through MCP, and no docs should imply otherwise. MCP remains paused
  until NemoClaw preflight, approval-gate planning/implementation or explicit deferral,
  product-story review, and guardrail/tool-boundary review are safe.

## Safety Decisions

- Stripe live-money execution is not implemented in Goal 7.
- Stripe live-money execution may be added later only through Verified Live Mode.
- Verified Live Mode is the only allowed future path for live-money payment actions.
- Real client data is out of scope.
- Production Prometheus/Hermes data is out of scope.
- Windows Hermes dependency is out of scope.
- Homelab/OpenClaw dependency is out of scope.
- Public deployment is optional and not required for MVP.
- No live money in Goal 7 and no real client data.

## Technical Decisions

- Use SQLite for a real local evidence ledger.
- Use FastAPI for backend.
- Use Vite React TypeScript for frontend.
- Use deterministic seeded outputs before live AI calls and for tests/diagnostics.
- Use the ScaleX-isolated laptop Hermes install for Hermes planning/orchestration work:
  - code: `/home/ascabrya/.scalex-hermes/hermes-agent`
  - home/config/auth: `/home/ascabrya/.scalex-hermes/home`
- GPT-5.5 Auth runs through isolated Hermes for product-mode planning/reasoning, with deterministic
  fallback only for tests or `HERMES_TEST_MODE=true`.
- ScaleX's Hermes skill source lives in the repo at `hermes/skills/scalex-operator/SKILL.md` and
  is synced into the isolated Hermes home for product-mode `--skills scalex-operator` runs.
- Hermes cannot directly execute live-money actions.
- ScaleX code enforces verification, mode checks, caps, allowlists, confirmations, and audit records.
- Stripe test mode through the orchestration layer is the Goal 7 payment proof; test doubles are
  not product mode.
- Goal 7 rejects live Stripe keys and any non-`sk_test_` key for Stripe test mode.
- Hermes may plan a finance step, but ScaleX backend creates/finalizes approved Stripe test-mode
  invoice proof in Full Proof Mode. Hermes does not directly create, send, or charge invoices.
- No mode should claim a real client was emailed unless an explicit send step exists and is
  verified.
- Goal 8 is the governed autonomy layer covering the NeMo Guardrails adapter and the future
  NemoClaw sandbox target.
- Goal 8A preflight is complete; local `nemoguardrails` availability was verified outside the repo.
- Goal 8B adds a NeMo-Guardrails-ready adapter boundary with modes `local_policy`,
  `nemo_guardrails`, and `nemo_compatible`.
- `nemo_guardrails` must verify the NeMo Guardrails runtime through `SCALEX_NEMO_PYTHON` and fail
  closed if selected but unavailable, broken, or misconfigured.
- The main backend process must not import `nemoguardrails`; NeMo Guardrails adapter probing uses
  the configured external Python subprocess.
- The local policy engine remains the deterministic business-rule gate for Judge Demo Mode and
  tests, including spend, margin, vendor, and payment-before-spend decisions.
- ScaleX must not claim the NeMo Guardrails adapter is active unless runtime verification passes.
- ScaleX must not claim real NemoClaw integration.
- Goal 7.15A recorded that `nemoclaw`, `nemohermes`, `openshell`, and Docker are missing/not
  usable locally, while `node` v22.22.2, `npm` 10.9.7, `zstd`, and `strings` are present.
- Goal 8D must preflight actual NemoClaw / NemoHermes before any MCP implementation.
- Goal 8E may wire ScaleX to NemoClaw Hermes runtime only if Goal 8D proves it is safe.
- Goal 8F may implement Telegram approval as a human approval gate; approval must not bypass
  local policy, NeMo Guardrails, NemoClaw boundaries, or evidence recording.
- No secrets are committed.
- Hosted judge demo mode must not expose secrets to the browser.
- Local full-proof mode may use ignored `.env` values for real isolated Hermes and Stripe test mode.
- Goal 7.12 formalized two demo-safe execution modes:
  - Judge Demo Mode is the default local mode (`SCALEX_EXECUTION_MODE=demo`), works without
    secrets, uses deterministic local proof/test-double paths, creates local SQLite records, and
    clearly labels demo/sandbox proof.
  - Full Proof Mode (`SCALEX_EXECUTION_MODE=full_proof`) preserves real isolated Hermes and real
    Stripe test mode when local ignored `.env` values are safely configured, and surfaces visible
    errors when misconfigured.
- Goal 7.13A locked the Connection Hub / MCP architecture as docs-only planning:
  - Active connector concepts: Hermes Planning, Stripe Finance Proof, Local Policy, SQLite
    Evidence Ledger, and Prototype Auth.
  - Planned connector concepts now include NemoClaw / OpenShell Sandbox target, Telegram Approval
    Gate, Slack / Email, CRM client context, Docs / Notion workspace, Calendar, and MCP local
    prototype boundary.
  - Future MCP tools/resources/prompts must not expose secrets, bypass local policy, bypass NeMo
    Guardrails adapter checks, bypass future NemoClaw or approval gates, use live money, or use
    real client data.
