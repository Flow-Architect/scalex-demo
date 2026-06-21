# ScaleX Submission Writeup

ScaleX helps service teams run agent work against revenue-backed workflows while protecting gross margin.

ScaleX is a live working product-style prototype with a local FastAPI backend, real isolated Hermes Agent planning through the ScaleX `scalex-operator` skill, real Stripe test-mode invoice creation/finalization, SQLite audit records for planning and orchestration calls, policy-gated spend, deterministic agent outputs, and a Vite dashboard for the Harbor Fleet Services sample workflow.

The current proof is integration-backed: isolated Hermes/GPT-5.5 planning is wired; Goal 7 added real Stripe test-mode customer and finalized invoice records through orchestration when a local `sk_test_...` key is configured; Goal 7.6 polished the first viewport, Profit Protected outcome panel, Live Stack Proof, and staged execution replay without changing backend business logic. Stripe payment status is labeled honestly: the verified invoice is `invoice_status=open` and `paid=false` unless Stripe reports otherwise.

The active spend authority is the local policy engine. Goal 8 remains next for NemoClaw or NemoClaw-style safety governance if it can be wired safely; ScaleX does not yet claim real NemoClaw integration. Test doubles must stay clearly labeled and must not be described as product-mode integrations. Future live-money payments require Verified Live Mode.
