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
- Stripe provides finance proof through test invoice/payment state.
- ScaleX code executes and enforces business rules.
- Local policy is active now for spend, margin, vendor, and payment-before-spend enforcement.
- NeMo Guardrails is planned after Goal 8 and is not wired yet.
- SQLite is the evidence ledger.
- Profit Outcome is the business result.

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
- Goal 8 is the governed autonomy layer with NVIDIA NeMo Guardrails or a NeMo-compatible adapter.
- Goal 8A is the read-only preflight to decide whether real NeMo Guardrails, NemoClaw, or a
  NeMo-compatible adapter is safely available.
- The local policy engine remains active until Goal 8 safely wires a verified guardrail adapter.
- ScaleX must not claim real NeMo Guardrails or real NemoClaw until installed, wired, tested, and documented.
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
