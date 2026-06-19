# STATUS - ScaleX

Last updated: 2026-06-19

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Last completed implementation goal: Goal 5 - frontend dashboard, browser verification fixes, and Harbor Fleet Services cleanup.
- Goal 5 is complete.
- Current documentation goal: product-prototype roadmap and handoff update.
- ScaleX is positioned as a working product-style prototype for profit-aware agent operations in service workflows.
- Harbor Fleet Services is the sample workflow; it is an example service run, not the whole product category.
- README.md describes ScaleX as a working product-style prototype and uses http://127.0.0.1:5174 for the browser walkthrough.
- Laptop repo state was clean and current at the start of this documentation goal.
- .gitignore exists and ignores local env files, SQLite database files, logs, venvs, node_modules, frontend build output, and recordings.
- .env.example exists with sandbox defaults, including FRONTEND_PORT=5174, STRIPE_LIVE_MODE=false, and STRIPE_MOCK_MODE=true.
- data/schema.sql exists with the local SQLite ledger tables, including reports.blocked_spend_cents.
- data/seed.json exists with synthetic Harbor Fleet Services sample data.
- policies/scalex-policy.json exists with local product-loop policy rules.
- agents/ contains Finance, Marketing, Research, and Ops role placeholders.
- docs/ contains product, architecture, walkthrough, and submission documentation.
- FastAPI backend exposes:
  - GET /health
  - GET /api/health
  - POST /api/demo/reset
  - POST /api/demo/seed
  - POST /api/demo/run
  - POST /api/demo/mark-paid
  - POST /api/demo/spend-check
  - GET /api/demo/state
- Backend CORS allows the local Vite frontend origins:
  - http://127.0.0.1:5173
  - http://localhost:5173
  - http://127.0.0.1:5174
  - http://localhost:5174
- Backend CORS allows GET, POST, and OPTIONS for local browser preflights.
- Frontend API client defaults to http://127.0.0.1:8787 unless VITE_API_BASE_URL overrides it.
- Vite dev server defaults to port 5174 with strictPort enabled.
- scripts/dev.sh starts both backend and frontend by default:
  - backend: http://127.0.0.1:8787
  - frontend: http://127.0.0.1:5174
- scripts/dev.sh passes --strictPort so a frontend port conflict fails visibly instead of silently moving to another port.
- scripts/dev.sh can start only the backend with SCALEX_BACKEND_ONLY=true.
- scripts/setup.sh installs backend Python dependencies and frontend npm dependencies.
- scripts/test.sh runs backend pytest and frontend npm build.
- POST /api/demo/reset creates a fresh local SQLite database at data/scalex.db.
- POST /api/demo/seed loads the synthetic Harbor Fleet Services job from data/seed.json.
- POST /api/demo/mark-paid records a local sandbox revenue ledger entry for the seeded $1,200 job invoice and creates a payment-confirmed event without calling Stripe.
- POST /api/demo/spend-check persists a policy_check for every spend request.
- Approved spend requests create spend ledger entries.
- Blocked spend requests do not create spend ledger entries.
- Pre-payment prerequisite blocks still create policy_check records and events, but they do not create spend ledger entries or count toward blocked_spend_cents.
- POST /api/demo/run resets and rebuilds the complete compressed local product loop:
  - seeds the Harbor Fleet Services job
  - records job intake, margin plan, payment gate, local fallback Stripe-shaped payment records, policy, agent work, profit report, and job complete timeline events
  - creates local fallback Stripe-shaped records for customer, invoice, payment link, and payment confirmation
  - marks local sandbox payment confirmed
  - approves $89 Local Ads API spend
  - approves $98 Design Asset Pack spend
  - blocks $750 Premium Automation Suite spend
  - creates deterministic Finance, Marketing, Research, and Ops outputs
  - creates the final profit report
  - marks the job complete
- GET /api/demo/state returns job, jobs, events, timeline_events, local fallback payment records, ledger entries, ledger totals, policy checks, agent outputs, reports, and the latest final report.
- Frontend dashboard exists at frontend/src/App.tsx and connected components.
- Frontend dashboard displays:
  - product header and service workflows positioning
  - backend health/status
  - Run Demo Job, Reset Demo, and Refresh controls
  - active Harbor Fleet Services job summary
  - revenue, approved spend, blocked unsafe spend, gross profit, and margin cards
  - timeline events
  - local fallback Stripe-shaped payment records
  - ledger entries
  - local policy guardrails and spend checks
  - deterministic Finance, Marketing, Research, and Ops outputs
  - final profit report and recommendation
  - exact final cents values for report auditability
- Verified on 2026-06-19:
  - ./scripts/test.sh passed with 26 backend tests and a successful Vite production build.
  - Final cleanup rerun: ./scripts/test.sh passed with 26 backend tests and a successful Vite production build.
  - git diff --check passed with no output.
  - Live Stripe key grep check returned no matches outside excluded ignored/generated paths.
  - A stale Vite process from this repo was occupying port 5174; it was stopped before verification.
  - ./scripts/dev.sh started backend at http://127.0.0.1:8787 and frontend at http://127.0.0.1:5174.
  - GET /api/health returned HTTP 200.
  - Vite frontend at http://127.0.0.1:5174 returned HTTP 200.
  - Served frontend source shows API base default http://127.0.0.1:8787.
  - Served frontend source shows the updated service workflows positioning.
  - CORS preflight from Origin http://127.0.0.1:5174 returned HTTP 200 for:
    - GET /api/health
    - GET /api/demo/state
    - POST /api/demo/run
    - POST /api/demo/reset
  - CORS preflight to POST /api/demo/run returned HTTP 200 for all required origins:
    - http://127.0.0.1:5173
    - http://localhost:5173
    - http://127.0.0.1:5174
    - http://localhost:5174
  - POST /api/demo/run returned HTTP 200 and the expected completed lifecycle state.
  - Final cleanup POST /api/demo/run returned HTTP 200 with client_name "Harbor Fleet Services", business_type "Regional fleet maintenance provider", and job_name "30-day fleet brake inspection campaign".
  - Final report values were revenue_cents 120000, approved_spend_cents 18700, blocked_spend_cents 75000, gross_profit_cents 101300, actual_margin_percent 84.4, policy_violations 0, and recommendation "Renew campaign for another 30 days".
  - Final cleanup CORS preflight to POST /api/demo/run returned HTTP 200 for all required origins:
    - http://127.0.0.1:5173
    - http://localhost:5173
    - http://127.0.0.1:5174
    - http://localhost:5174
  - Demo state includes Finance, Marketing, Research, and Ops agent outputs.
  - Demo state includes fallback payment records with mode local_mock_test for customer, invoice, payment_link, and payment.
  - data/scalex.db, frontend/node_modules, frontend/dist, backend/.venv, and backend/.pytest_cache remain ignored by git.
- User-provided verified environment for this documentation goal:
  - Fedora laptop repo at /home/ascabrya/dev/scalex-demo is current and tested.
  - ./scripts/test.sh passed on the laptop before this documentation goal.
  - ScaleX-isolated Hermes Agent v0.16.0 is installed:
    - code: /home/ascabrya/.scalex-hermes/hermes-agent
    - home/config/auth: /home/ascabrya/.scalex-hermes/home
  - Isolated Hermes is configured with OpenAI Codex auth and gpt-5.5.
  - The isolated Hermes readiness command returned SCALEX_HERMES_READY.

## Not yet built

- Real ScaleX-to-isolated-Hermes brain/orchestration integration.
- GPT-5.5 planning through Hermes inside the ScaleX product loop.
- Stripe test-mode support through the orchestration layer.
- NemoClaw or external policy safety adapter.
- Demo recording.
- Final submission polish and recording assets.

## Not yet verified

- Fresh-clone setup on a clean machine.
- Manual recorded browser walkthrough.
- Screenshot/video capture quality.
- Manual browser verification after the Harbor Fleet Services cleanup. Shell checks, served-source checks, CORS preflights, and backend API state are useful but are not a substitute for the required user-visible browser click-through before commit.
- Actual GUI/headless browser DOM inspection from this shell; no browser or Playwright binary was available in the prior verification pass.

## Deferred / revisit

- Local fallback payment records remain in place for reliability and safety until Stripe test mode is wired.
- Production Hermes, Windows Hermes config, Prometheus production data, homelab/OpenClaw, Recall memory, public deployment, live money, production data, and real customer workflows remain out of scope.
- npm install reports one low-severity advisory in the frontend dependency tree; dependency audit remediation is deferred unless it affects demo safety or build reliability.

## Current priority

Goal 6 - wire ScaleX to the isolated Hermes brain/orchestration install while preserving deterministic fallback behavior and all sandbox safety rules.
