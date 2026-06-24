# ScaleX Submission Writeup

ScaleX turns repeatable enterprise functions into autonomous, governed workflows while protecting gross margin.

ScaleX is a functional live working product prototype, not a static mock-card demo. The walkthrough is
an operator using the product: log in, create or select a saved local workflow, review money
rules, start a run for the active workflow, watch the workflow graph move, click proof
nodes, review blocked spend, inspect persisted run history, and finish with an audited
profit report.

Under the product shell, ScaleX uses a local FastAPI backend, real isolated Hermes Agent
planning through the ScaleX `scalex-operator` skill, real Stripe test-mode invoice
creation/finalization, SQLite audit records for planning and orchestration calls,
local policy-gated spend, and deterministic agent outputs for the Harbor Fleet Services
sample workflow. Judges should see the enterprise-function workflow, Hermes orchestrator,
Stripe finance skill, NeMo Guardrail Gate target with local policy active until wired,
SQLite audit ledger, and profit report. Hosted mode must not expose secrets; local
full-proof mode can use an ignored `.env` for real isolated Hermes and Stripe `sk_test_...`
configuration.

The current proof is integration-backed: isolated Hermes/GPT-5.5 planning is wired; Goal 7
added real Stripe test-mode customer and finalized invoice records through orchestration
when a local `sk_test_...` key is configured; Goal 7.8 adds saved local workflows, active
workflow selection, selected-workflow-driven runs, persisted run history, historical run
inspection, functional Dashboard/Onboarding/Customers/Runs/Audit/Integrations/Settings views,
and clickable workflow proof nodes. Goal 7.9 replaces the main Workflow surface with a
connected enterprise canvas, visible approved/blocked branches, a right selected-node inspector,
aligned secondary views, visible logout, and browser-only QA while preserving backend proof.
Stripe payment status is labeled honestly: the
verified invoice is `invoice_status=open` and `paid=false` unless Stripe reports otherwise.

Goal 7.9 is complete as the product UX consolidation before Goal 8. The intent is a
commercial-style browser recording where the demo is the operator using ScaleX, not a tour
through static proof panels.

The login gate is local prototype auth, not production enterprise auth. Workflow management is
local/sample workflow management, not full multi-tenant SaaS. The active spend authority is
the local policy engine. Goal 8 is now planned as the Governed Autonomy Layer with NVIDIA
NeMo Guardrails, split into Goals 8A-8E. Goal 8A is the next read-only preflight to decide
whether real NeMo Guardrails or a NeMo-compatible adapter is safely available. ScaleX does not
yet claim real NeMo Guardrails or real NemoClaw integration. Test doubles must stay clearly
labeled and must not be described as product-mode integrations. Future live-money payments
require Verified Live Mode. No live-money support was added.
