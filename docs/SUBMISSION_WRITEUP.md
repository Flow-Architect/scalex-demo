# ScaleX Submission Writeup

ScaleX helps service teams run agent work against paid workflows while protecting gross margin.

ScaleX is a working product-style prototype with a local FastAPI backend, real isolated Hermes Agent planning through the ScaleX `scalex-operator` skill, SQLite audit records for planning and orchestration calls, policy-gated spend, deterministic agent outputs, and a Vite dashboard for the Harbor Fleet Services sample workflow.

The product direction is integration-backed proof: isolated Hermes/GPT-5.5 planning is wired; Stripe test-mode payment objects and NemoClaw or policy safety governance remain next where safe. Current fallback paths must stay clearly labeled and must not be described as live production integrations.
