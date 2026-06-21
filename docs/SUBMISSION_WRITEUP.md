# ScaleX Submission Writeup

ScaleX helps service teams run agent work against revenue-backed workflows while protecting gross margin.

ScaleX is a functional live working product prototype, not a static mock-card demo. The walkthrough is
an operator using the product: log in, create or select a saved local workflow, review money
rules, start a run for the active workflow, watch the workflow graph move, click proof
nodes, review blocked spend, inspect persisted run history, and finish with an audited
profit report.

Under the product shell, ScaleX uses a local FastAPI backend, real isolated Hermes Agent
planning through the ScaleX `scalex-operator` skill, real Stripe test-mode invoice
creation/finalization, SQLite audit records for planning and orchestration calls,
policy-gated spend, and deterministic agent outputs for the Harbor Fleet Services sample
workflow. Goal 7.8 adds SQLite-backed workflow configs and durable run history so a
recording can be browser-only product usage. Judges can use a hosted browser demo when
provided or clone GitHub and run the local full-proof path. Hosted mode must not expose
secrets; local full-proof mode can use an ignored `.env` for real isolated Hermes and
Stripe `sk_test_...` configuration.

The current proof is integration-backed: isolated Hermes/GPT-5.5 planning is wired; Goal 7
added real Stripe test-mode customer and finalized invoice records through orchestration
when a local `sk_test_...` key is configured; Goal 7.8 adds saved local workflows, active
workflow selection, selected-workflow-driven runs, persisted run history, historical run
inspection, functional Customers/Runs/Audit/Settings views, and clickable workflow graph
nodes while preserving the Profit Protected outcome panel, Live Stack Proof, staged
execution replay, and backend proof. Stripe payment status is labeled honestly: the
verified invoice is `invoice_status=open` and `paid=false` unless Stripe reports otherwise.

The login gate is local prototype auth, not production enterprise auth. Workflow management is
local/sample workflow management, not full multi-tenant SaaS. The active spend authority is
the local policy engine. Goal 8 remains next for NemoClaw or NemoClaw-style safety
governance if it can be wired safely; ScaleX does not yet claim real NemoClaw integration.
Test doubles must stay clearly labeled and must not be described as product-mode
integrations. Future live-money payments require Verified Live Mode. No live-money support
was added.
