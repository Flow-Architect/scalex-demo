# ScaleX Submission Writeup

ScaleX helps service teams run agent work against paid workflows while protecting gross margin.

ScaleX is a live working product-style prototype with a local FastAPI backend, real isolated Hermes Agent planning through the ScaleX `scalex-operator` skill, SQLite audit records for planning and orchestration calls, policy-gated spend, deterministic agent outputs, and a Vite dashboard for the Harbor Fleet Services sample workflow.

The product direction is integration-backed proof: isolated Hermes/GPT-5.5 planning is wired;
Goal 7 adds real Stripe test-mode invoice objects through orchestration when a local test key
is configured; Goal 8 targets real NemoClaw or NemoClaw-style safety governance where safe.
Test doubles must stay clearly labeled and must not be described as product-mode integrations.
Future live-money payments require Verified Live Mode.
