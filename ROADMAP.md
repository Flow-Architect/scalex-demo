# ScaleX Codex Roadmap

> **Project path:** `/home/ascabrya/dev/scalex-demo/`
> **Purpose:** Build a live working product-style prototype with real integrations in the appropriate mode.
> **Product:** **ScaleX — Governed Enterprise Function Workflows**
> **Core product loop:** enterprise function intake → Hermes/GPT-5.5 planning → Stripe test invoice/payment flow → NeMo Guardrail Gate / local policy guardrails → SQLite ledger/audit records → agent work → profit report.

---

## 0. Non-Negotiable Build Rules

Codex must follow these rules for the entire repo.

### Safety / Sandbox Rules

- **For Goal 7, do not use live Stripe keys.** Stripe test mode requires `sk_test_...` keys.
- **Future live-money Stripe work is allowed only through Verified Live Mode.**
- **Do not touch Prometheus, xScaleOS, production Hermes, Windows Hermes, homelab OpenClaw, Recall memory, or real client files.**
- **Do not commit secrets.** `.env`, `.env.local`, SQLite `.db` files, recordings, and logs must stay ignored.
- **Use sample workflow data only.** The sample client is `Harbor Fleet Services`.
- **No autonomous real-world payments.** Goal 7 uses Stripe test mode only; future live-money actions must pass Verified Live Mode.
- **Do not claim real NeMo Guardrails/NemoClaw/Hermes/Stripe integration unless it is actually wired.** If test-double or diagnostic-only, label it clearly.
- **Product mode is real-integration-first.** If a real integration is unavailable in product mode, surface a visible integration error instead of silently falling back.

### Scope Rules

- One client.
- One service job.
- One invoice.
- Two spend checks: one approved, one blocked.
- Four agents: Finance, Marketing, Research, Ops.
- One final profit report.
- Working product-mode integration proof beats architectural perfection.

### Git Rules

- Commit at the end of each completed milestone.
- Keep commits small and named clearly.
- Do not commit `.env`, `.db`, node modules, venvs, recordings, or logs.

---

## 1. Product Lock

### Name

**ScaleX**

### Submission Title

**ScaleX: Profit-Aware Agent Operations for Service Workflows**

### One-Sentence Pitch

> ScaleX turns repeatable enterprise functions into autonomous, governed workflows. It lets agents confirm revenue, route work through Hermes, execute finance primitives through Stripe test mode, enforce guardrails, coordinate work, and produce an auditable profit report.

### Product Thesis

Most autonomous agent demos focus on whether an agent can spend money. ScaleX focuses on whether a business can trust an agent to run repeatable enterprise functions **only while protecting margin and policy boundaries**.

### Differentiation

- SOLVENT-style agents protect an agent treasury.
- **ScaleX protects profitability on governed enterprise workflows.**
- Core object is not a treasury; core object is an **enterprise function ledger**.

---

## 2. Recommended Stack

Use a reliable, boring stack optimized for fast local development.

```text
Frontend: Vite + React + TypeScript + Tailwind
Backend: FastAPI + Python sqlite3
Database: SQLite file in ./data/scalex.db
Hermes brain: real ScaleX-isolated laptop Hermes install in product mode
AI planning: GPT-5.5 Auth through Hermes, with deterministic test-double planning for tests only
Stripe: real Stripe test-mode objects through the orchestration layer for Goal 7
Guardrails: NVIDIA NeMo Guardrails or NeMo-compatible adapter target, with local policy active now and deterministic support for tests/diagnostics
```

### Why SQLite?

Yes, use SQLite.

Not because SOLVENT uses it — because ScaleX needs a believable, replayable, auditable ledger for:

- jobs
- events
- Stripe test objects
- revenue ledger entries
- spend ledger entries
- policy checks
- agent outputs
- final reports

A JSON file could work, but SQLite gives the prototype a real job ledger without running Postgres.

---

## 3. Target Repo Structure

Codex should create this structure inside `/home/ascabrya/dev/scalex-demo/`.

```text
scalex-demo/
├── README.md
├── ROADMAP.md
├── AGENTS.md
├── .gitignore
├── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── demo_runner.py
│   │   ├── services/
│   │   │   ├── agent_service.py
│   │   │   ├── ledger_service.py
│   │   │   ├── policy_service.py
│   │   │   ├── stripe_service.py
│   │   │   ├── planning_service.py
│   │   │   └── hermes_adapter.py
│   │   └── seed/
│   │       └── demo_outputs.py
│   ├── tests/
│   │   ├── test_margin.py
│   │   ├── test_policy.py
│   │   └── test_demo_runner.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── api.ts
│       ├── types.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── JobIntakeCard.tsx
│       │   ├── MetricsCards.tsx
│       │   ├── Timeline.tsx
│       │   ├── PolicyPanel.tsx
│       │   ├── StripePanel.tsx
│       │   ├── AgentWorkboard.tsx
│       │   └── ProfitReport.tsx
│       └── styles.css
├── data/
│   ├── schema.sql
│   └── seed.json
├── policies/
│   └── scalex-policy.json
├── agents/
│   ├── finance-agent.md
│   ├── marketing-agent.md
│   ├── research-agent.md
│   └── ops-agent.md
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DEMO_SCRIPT.md
│   └── SUBMISSION_WRITEUP.md
├── scripts/
│   ├── setup.sh
│   ├── dev.sh
│   ├── reset-demo.sh
│   └── test.sh
└── demo-assets/
    └── screenshots/
```

---

## 4. Environment Files

Create `.env.example` at repo root.

```env
# ScaleX Product Prototype
APP_ENV=development
BACKEND_PORT=8787
FRONTEND_PORT=5174
DATABASE_PATH=./data/scalex.db

# Legacy direct-reasoning compatibility.
# Product-mode planning uses the isolated Hermes settings below.
MODEL_PROVIDER=openai
SCALEX_REASONING_MODEL=
OPENAI_API_KEY=
AI_FALLBACK_MODE=true

# Hermes brain/orchestration layer
HERMES_MODE=isolated_cli
HERMES_CLI_PATH=/home/ascabrya/.scalex-hermes/hermes-agent/venv/bin/hermes
HERMES_HOME=/home/ascabrya/.scalex-hermes/home
HERMES_MODEL=gpt-5.5
HERMES_PROVIDER=openai-codex
HERMES_TIMEOUT_SECONDS=60
HERMES_REQUIRE_REAL=true
HERMES_TEST_MODE=false
HERMES_MAX_OUTPUT_CHARS=12000
HERMES_SKILL_NAME=scalex-operator
HERMES_SKILL_SOURCE_PATH=./hermes/skills/scalex-operator
HERMES_TOOLSETS=skills

# Stripe product path for Goal 7: real Stripe test-mode API calls
STRIPE_MODE=test
STRIPE_SECRET_KEY=
STRIPE_TEST_MODE=true
STRIPE_LIVE_MODE=false
STRIPE_TEST_DOUBLE_MODE=false
STRIPE_CURRENCY=usd
STRIPE_IDEMPOTENCY_PREFIX=scalex-demo
STRIPE_SUCCESS_URL=
STRIPE_CANCEL_URL=
STRIPE_WEBHOOK_SECRET=

# Future Verified Live Mode placeholders only; current product mode does not execute live-money charges
STRIPE_LIVE_MONEY_ENABLED=false
STRIPE_LIVE_REQUIRE_VERIFIED=true
SCALEX_LIVE_MAX_AMOUNT_CENTS=0
SCALEX_LIVE_ALLOWED_CUSTOMER_EMAILS=
SCALEX_LIVE_CONFIRMATION_PHRASE=LIVE_MONEY_APPROVED

# Guardrails / policy; current product path uses local policy until Goal 8 safely wires a verified adapter
POLICY_ENGINE=local
NEMOCLAW_BASE_URL=
NEMOCLAW_API_KEY=
GUARDRAIL_ENGINE=local_policy
NEMO_GUARDRAILS_CONFIG_PATH=
NEMO_GUARDRAILS_SERVER_URL=
NEMO_GUARDRAILS_API_KEY=
GUARDRAILS_FAIL_CLOSED=true
GUARDRAILS_RECORD_EVALUATIONS=true

# Product prototype guardrails
DEFAULT_INVOICE_AMOUNT_USD=1200
DEFAULT_SPEND_CAP_USD=300
DEFAULT_MARGIN_FLOOR_PERCENT=50
REQUIRE_HUMAN_APPROVAL_ABOVE_USD=250
ENABLE_LIVE_PROOF=false
```

Create `.gitignore`.

```gitignore
.env
.env.local
*.log
__pycache__/
.pytest_cache/
.venv/
node_modules/
dist/
.vite/
data/*.db
data/*.db-*
recordings/
demo-assets/recordings/
.DS_Store
```

---

## 5. SQLite Schema

Create `data/schema.sql`.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  job_name TEXT NOT NULL,
  job_goal TEXT NOT NULL,
  invoice_amount_cents INTEGER NOT NULL,
  spend_cap_cents INTEGER NOT NULL,
  margin_floor_percent REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('revenue', 'spend', 'adjustment')),
  label TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS policy_checks (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  request_type TEXT NOT NULL,
  vendor TEXT NOT NULL,
  requested_amount_cents INTEGER NOT NULL,
  approved INTEGER NOT NULL,
  reason TEXT NOT NULL,
  margin_after_spend_percent REAL NOT NULL,
  required_action TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  stripe_object_type TEXT NOT NULL,
  stripe_object_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  mode TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_outputs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  output_markdown TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  revenue_cents INTEGER NOT NULL,
  approved_spend_cents INTEGER NOT NULL,
  gross_profit_cents INTEGER NOT NULL,
  margin_percent REAL NOT NULL,
  policy_violations INTEGER NOT NULL,
  recommendation TEXT NOT NULL,
  report_markdown TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
```

---

## 6. Demo Data

Create `data/seed.json`.

```json
{
  "clientName": "Harbor Fleet Services",
  "businessType": "Regional fleet maintenance provider",
  "jobName": "30-day fleet brake inspection campaign",
  "jobGoal": "Generate a client-ready fleet brake inspection package, including campaign copy, operations handoff notes, landing page copy, follow-up messages, and a final profitability report.",
  "invoiceAmountUsd": 1200,
  "spendCapUsd": 300,
  "marginFloorPercent": 50,
  "approvedSpendRequests": [
    {
      "vendor": "Local Ads API",
      "amountUsd": 89,
      "purpose": "Local campaign distribution test"
    },
    {
      "vendor": "Design Asset Pack",
      "amountUsd": 98,
      "purpose": "Brake service creative asset package"
    }
  ],
  "blockedSpendRequests": [
    {
      "vendor": "Premium Automation Suite",
      "amountUsd": 750,
      "purpose": "Overpriced automation bundle that violates the margin floor"
    }
  ]
}
```

Expected final sample-run numbers:

```text
Revenue: $1,200
Approved Spend: $187
Gross Profit: $1,013
Final Margin: 84.4%
Policy Violations: 0 successful violations, 1 blocked unsafe spend
Recommendation: Renew campaign for another 30 days
```

---

## 7. API Contract

Backend base URL: `http://127.0.0.1:8787`

### Required Endpoints

```text
GET  /api/health
POST /api/demo/reset
POST /api/demo/run
GET  /api/demo/state
POST /api/jobs
GET  /api/jobs/{job_id}
GET  /api/jobs/{job_id}/events
GET  /api/jobs/{job_id}/report
```

### `POST /api/demo/run`

Runs the entire compressed sample workflow and returns the final state.

Sequence:

```text
1. Reset local DB state
2. Create Harbor Fleet Services job
3. Generate operating plan
4. Create Stripe test customer and invoice through the orchestration layer
5. Record the $1,200 compressed-run revenue/profit result without claiming Stripe-paid status unless Stripe reports `paid=true`
6. Request $89 spend and approve it
7. Request $98 spend and approve it
8. Request $750 spend and block it
9. Run Finance, Marketing, Research, and Ops agents
10. Generate final profit report
11. Return full state for UI replay
```

---

## 8. Core Business Logic

### Margin Functions

Implement in `backend/app/services/ledger_service.py` or a dedicated `finance.py`.

```text
projected_profit = invoice_amount - spend_cap
projected_margin_percent = projected_profit / invoice_amount * 100
actual_profit = revenue - approved_spend
actual_margin_percent = actual_profit / revenue * 100
```

### Policy Rules

Create `policies/scalex-policy.json`.

```json
{
  "name": "ScaleX Demo Policy",
  "rules": {
    "stripe_live_mode": false,
    "max_job_spend_usd": 300,
    "margin_floor_percent": 50,
    "require_invoice_before_spend": true,
    "require_payment_before_spend": true,
    "require_human_approval_above_usd": 250,
    "approved_vendors": [
      "Local Ads API",
      "Design Asset Pack",
      "SMS Campaign Tool",
      "Email Campaign Tool"
    ],
    "blocked_vendors": [
      "Unknown SaaS Vendor",
      "Premium Automation Suite"
    ]
  }
}
```

### Spend Policy Logic

A spend request is approved only if all checks pass:

```text
Stripe live mode is false
Invoice exists
Payment status is confirmed honestly through Stripe test mode; any compressed local test
confirmation must be explicitly labeled and must not pretend a Stripe-paid invoice occurred.
Vendor is allowed
Vendor is not blocked
Requested amount does not exceed per-transaction approval threshold unless human approved
Total approved spend after request <= spend cap
Margin after spend >= margin floor
```

Blocked spend must create a policy check event but must **not** create a spend ledger entry.

---

## 9. Agent Outputs

Use deterministic outputs for tests and diagnostics. Product-mode planning uses the real isolated Hermes path.

### Finance Agent

Output:

- projected P&L
- actual P&L
- margin explanation
- approval/blocked spend rationale

### Marketing Agent

Output:

- campaign theme
- offer copy
- 5 social posts
- landing page headline and body
- SMS/email follow-up copy

### Research Agent

Output:

- competitor positioning
- local market angle
- recommended promotion hook

### Ops Agent

Output:

- delivery checklist
- client handoff packet summary
- renewal recommendation

---

## 10. UI Requirements

The frontend should feel like a usable product shell that can be recorded as a
commercial-style browser walkthrough. Goal 7.7 added local prototype auth, local/sample
workflow onboarding, product navigation, and a moving workflow map; Goal 7.8 made
Customers, selected-workflow runs, run history, and clickable proof nodes functional.

Goal 7.9 is the planned product UX consolidation before Goal 8. It should make ScaleX
feel like a workflow automation canvas and inspection tool for business operations, not
a stacked proof layout. The target product model is:

```text
Left navigation
Top command bar
Central workflow canvas
Right selected-node inspector
Separate Customers, Runs, Audit, Integrations, and Settings views
```

The current proof panels are useful but visually scattered. Goal 7.9 should preserve
real Hermes, Stripe test-mode, SQLite, and local policy proof while moving the main
experience toward a focused canvas plus inspector.

### Required Components

```text
Secure Operator Console login
Local/sample workflow onboarding
Product navigation
Dashboard / Workflow view
Customers view
Runs view
Audit view
Settings / Integrations view
Autonomous Workflow Map
Stripe test proof panel
Policy proof panel
Agent workboard
Profit report
Reset Demo button
Run Demo Job button
```

### Visual Story

The page should make this obvious within 5 seconds:

```text
ScaleX accepted a revenue-backed service job.
ScaleX created a Stripe test invoice and recorded payment status honestly.
ScaleX moved through a workflow graph while the run executed.
ScaleX approved safe spend.
ScaleX blocked unsafe spend.
ScaleX coordinated agents.
ScaleX delivered work.
ScaleX reported profit.
```

### Final Report Card

Must show:

```text
Revenue: $1,200
Approved Spend: $187
Gross Profit: $1,013
Final Margin: 84.4%
Blocked Unsafe Spend: $750
Policy Violations: 0
Invoice Status: Stripe Paid / Open / Local Test Confirmation
Recommendation: Renew campaign for another 30 days
```

---

## 11. Hermes / GPT-5.5 Auth Planning

Goal 6 is complete. ScaleX product mode uses the ScaleX-isolated Hermes brain/orchestration
install on the Fedora laptop for planning/reasoning, using GPT-5.5 Auth through the isolated
Hermes configuration. Deterministic planning is a test/diagnostic path only.

### Rules

- Use the ScaleX-isolated Hermes install:
  - code: `/home/ascabrya/.scalex-hermes/hermes-agent`
  - home/config/auth: `/home/ascabrya/.scalex-hermes/home`
- Launch Hermes with `HERMES_HOME` pointing at the isolated home directory.
- Keep OpenAI/Codex auth inside the isolated Hermes home.
- Read direct model settings from `SCALEX_REASONING_MODEL` only for local compatibility.
- Never commit keys.
- Tests may use `HERMES_TEST_MODE=true` for deterministic test-double planning.
- If Hermes/model planning fails in product mode, surface a visible Hermes integration error.
- Do not silently replace failed product-mode Hermes planning with deterministic output.

### Hermes / GPT-5.5 Should Generate

```text
Operating plan
Agent task list
Campaign strategy
Executive summary
```

### GPT Should Not Control

```text
Actual spend approval
Policy enforcement
Live payment actions
Secret handling
```

Policy code is the authority, not the model.

---

## 12. Stripe Test Mode

Goal 7 is complete and makes real Stripe test-mode API calls the product payment path. Test doubles are
allowed only for automated tests, CI, local offline development, or explicitly labeled
diagnostics.

### Goal 7 Product Path

1. Use `STRIPE_TEST_MODE=true`.
2. Use `STRIPE_TEST_DOUBLE_MODE=false`.
3. Use `STRIPE_LIVE_MODE=false`.
4. Require `STRIPE_SECRET_KEY` to start with `sk_test_`.
5. Reject missing, live, or malformed keys.
6. Create a real Stripe test customer.
7. Create a real Stripe test invoice item for the $1,200 Harbor Fleet Services job.
8. Create and finalize a real Stripe test invoice.
9. Store `livemode=false`, customer ID, invoice ID, hosted invoice URL, invoice status,
   paid status, idempotency keys, and sanitized raw object JSON in SQLite.
10. If Stripe test mode fails in product mode, return a visible Stripe integration error.

### Payment Status Rule

ScaleX records payment status honestly:

- If Stripe says the invoice is paid, ScaleX may record Stripe-paid revenue.
- If Stripe says the invoice is open/finalized but unpaid, ScaleX must show that status.
- If the compressed workflow uses a local test confirmation to keep the economics flowing,
  it must be explicitly labeled as local test confirmation and must not claim the invoice
  is Stripe-paid.

### Test-Double Path

Tests/CI may set `STRIPE_TEST_DOUBLE_MODE=true`. Test-double records must identify their
mode as `test_double` and must not be described as the product payment path.

### Future Verified Live Mode

Stripe live-money mode is a future hardening milestone, not part of Goal 7. Live-money
execution is allowed only through Verified Live Mode, which requires explicit config,
operator confirmation, amount caps, customer allowlists, policy approval, and SQLite audit
records. Hermes may propose a payment step but must never directly execute live-money actions.

---

## 13. Hermes Brain / Orchestration Layer

Goal 6 created `backend/app/services/hermes_adapter.py`.

The adapter calls the ScaleX-isolated Hermes install for planning and orchestration. The verified laptop command was:

```bash
HERMES_HOME="$HOME/.scalex-hermes/home" \
"$HOME/.scalex-hermes/hermes-agent/venv/bin/hermes" \
--ignore-rules \
-z 'Reply with exactly: SCALEX_HERMES_READY'
```

That command returned `SCALEX_HERMES_READY` on the Fedora laptop, and Goal 6 wired ScaleX to this isolated Hermes environment without touching production Hermes or Windows Hermes config.

The adapter should produce visible skill-call events like:

```json
{
  "tool_name": "stripe.create_invoice",
  "status": "complete",
  "tool_input_json": { "amount_cents": 120000, "client_name": "Harbor Fleet Services" },
  "tool_output_json": { "invoice_id": "in_..." }
}
```

Required skills:

```text
job.create
planning.generate
stripe.create_customer
stripe.create_invoice
stripe.prepare_payment_url
stripe.confirm_payment_status
policy.check_spend
ledger.record_revenue
ledger.record_spend
agent.run_finance
agent.run_marketing
agent.run_research
agent.run_ops
report.generate
```

UI should show these as ScaleX-owned orchestration events. Hermes is the planner and
orchestration proposer; ScaleX code remains the execution authority for payment, policy,
ledger, agent work, and reports.

---

## 14. Governed Autonomy Layer / NeMo Guardrails Target

ScaleX should use NVIDIA NeMo Guardrails, or a NeMo-compatible local adapter, for product-mode
governed autonomy when it is safely available. The local policy engine is active now and remains
deterministic safety/test support until Goal 8 verifies and wires a real guardrail adapter.

Goal 8 should make the governed-autonomy layer clear:

- Hermes plans and routes autonomous work.
- Stripe executes finance/invoice/payment primitives in test mode now.
- NVIDIA NeMo Guardrails or a NeMo-compatible local adapter validates autonomous workflow actions.
- SQLite records guardrail proof and audit evidence.
- Policy/profit rules enforce safe business outcomes.

Do not claim real NeMo Guardrails or real NemoClaw unless it is installed, wired, tested, and
documented. Until then, product copy should say "local policy active" or "NeMo-compatible
guardrail adapter planned."

### Local Policy Engine Must Show

- Spend cap
- Margin floor
- Vendor allowlist
- Vendor blocklist
- Payment-before-spend rule
- Human approval threshold
- Clear approval/block reason

### Demo Policy Events

Approved:

```text
Vendor: Local Ads API
Spend: $89
Decision: Approved
Reason: Vendor allowed; margin remains above 50%; spend cap not exceeded.
```

Approved:

```text
Vendor: Design Asset Pack
Spend: $98
Decision: Approved
Reason: Vendor allowed; total spend remains within $300 cap.
```

Blocked:

```text
Vendor: Premium Automation Suite
Spend: $750
Decision: Blocked
Reason: Vendor blocked and spend would exceed cap / violate margin policy.
```

---

## 15. Testing Requirements

Create `scripts/test.sh`.

It should run:

```bash
cd backend
source .venv/bin/activate
pytest
cd ../frontend
npm run build
```

Required tests:

```text
test_projected_margin_1200_300_is_75_percent
test_actual_margin_1200_187_is_84_4_percent
test_approved_vendor_under_cap_is_approved
test_blocked_vendor_is_blocked
test_spend_over_cap_is_blocked
test_blocked_spend_does_not_create_ledger_entry
test_demo_runner_generates_final_report
```

---

## 16. Milestone Roadmap

### Milestone 1 — Repo Foundation

Goal: clean repo with docs, env example, scripts, and initial backend/frontend folders.

Tasks:

- Initialize git if needed.
- Create folder structure.
- Create `.gitignore`.
- Create `.env.example`.
- Create README.
- Create AGENTS.md for Codex rules.
- Create data schema and seed files.

Done when:

- `git status` is clean except intended files.
- No secrets are present.
- README explains local setup.

Suggested commit:

```bash
git add .
git commit -m "Initialize ScaleX product prototype scaffold"
```

---

### Milestone 2 — Backend Core + SQLite

Goal: FastAPI backend with SQLite schema, reset, seed, health, and demo state endpoints.

Tasks:

- Create Python venv.
- Add FastAPI, uvicorn, pydantic, pytest, python-dotenv.
- Implement DB initialization from `data/schema.sql`.
- Implement seed/reset.
- Implement basic models/schemas.
- Implement `/api/health`, `/api/demo/reset`, `/api/demo/state`.

Done when:

- `./scripts/dev.sh` starts backend.
- `GET /api/health` works.
- `POST /api/demo/reset` recreates demo data.
- Tests pass.

Suggested commit:

```bash
git add .
git commit -m "Add FastAPI backend and SQLite demo ledger"
```

---

### Milestone 3 — Finance + Policy Engine

Goal: real margin math and policy approvals/blocks.

Tasks:

- Implement ledger service.
- Implement projected and actual margin calculations.
- Implement policy service.
- Implement approved spend requests.
- Implement blocked spend request.
- Add audit events.
- Add tests.

Done when:

- $89 is approved.
- $98 is approved.
- $750 is blocked.
- Blocked spend does not enter ledger.
- Final margin calculates to about 84.4%.

Suggested commit:

```bash
git add .
git commit -m "Implement profit ledger and policy-gated spend"
```

---

### Milestone 4 — Demo Runner

Goal: one backend function runs the full compressed job lifecycle.

Tasks:

- Implement `demo_runner.py`.
- Implement event timeline.
- Implement clearly labeled payment events for the current Stripe mode.
- Implement agent output generation.
- Implement final report generation.
- Add `POST /api/demo/run`.

Done when:

- One API call creates the full demo state.
- Returned JSON includes job, events, ledger, policy checks, Stripe events, agent outputs, and report.

Suggested commit:

```bash
git add .
git commit -m "Add one-click ScaleX demo runner"
```

---

### Milestone 5 — Frontend Dashboard — Historical Baseline

Goal: polished single-page demo dashboard. This was the historical frontend baseline before
Goal 7.7 upgraded the experience into a product shell.

Tasks:

- Create Vite React TypeScript app.
- Add Tailwind.
- Build dashboard components.
- Add Run Demo Job button.
- Add Reset Demo button.
- Fetch demo state from backend.
- Replay events visually in timeline.

Done when:

- User can open `http://127.0.0.1:5174`.
- Click `Run Demo Job`.
- See full flow and final report.

Suggested commit:

```bash
git add .
git commit -m "Build ScaleX demo dashboard"
```

---

### Milestone 7.7 — Product Shell, Auth, Onboarding, and Workflow Map — Complete

Goal: make ScaleX usable as a product-style operator console that can be recorded
browser-only.

Completed:

- Local prototype login gate.
- Local/sample workflow onboarding.
- Product navigation for Workflow, Customers, Runs, Audit, and Settings / Integrations.
- Moving Autonomous Workflow Map with API-backed settled states.
- Approved/proceed and blocked spend branches.
- Real Hermes and Stripe test proof preserved.
- NemoClaw labeled as Goal 8 next, not claimed as wired.

Boundaries:

- Local auth is prototype auth, not production enterprise identity.
- Local/sample onboarding demonstrates the product path; production multi-client onboarding is future work.
- Hosted judge demo mode must not expose secrets.
- Local full-proof mode can use ignored `.env` values for real isolated Hermes and Stripe test mode.

---

### Milestone 6 — Isolated Hermes Brain + Orchestration — Complete

Goal: wire ScaleX to the ScaleX-isolated Hermes brain/orchestration install and use GPT-5.5 Auth through Hermes for planning/reasoning.

Tasks:

- Add a Hermes adapter/service that shells out to the isolated Hermes binary or calls the isolated local Hermes interface if one is exposed.
- Use `HERMES_HOME=/home/ascabrya/.scalex-hermes/home`.
- Keep all Hermes state isolated from production or Windows Hermes config.
- Ask Hermes/GPT-5.5 for the operating plan and agent task list.
- Parse structured output safely.
- Store planning/orchestration events in SQLite.
- Use deterministic output only for tests/diagnostics.
- Surface visible Hermes errors in product mode.

Done when:

- Tests work without Hermes by using deterministic test-double planning.
- Product mode uses isolated Hermes.
- Hermes/model failure becomes a visible product-mode error.
- No production Hermes config is touched.

Suggested commit:

```bash
git add .
git commit -m "Wire isolated Hermes planning adapter"
```

---

### Milestone 7 — Real Stripe Test-Mode Invoice Flow Through Orchestration — Complete

Goal: create real Stripe test-mode customer and invoice objects through the orchestration layer.

Tasks:

- Add Stripe package.
- Implement real Stripe test-mode path behind strict guards.
- Require `STRIPE_SECRET_KEY=sk_test_...`, `STRIPE_TEST_MODE=true`, and `STRIPE_LIVE_MODE=false`.
- Reject missing, live, or malformed keys in product mode.
- Create customer, invoice item, invoice, and finalized hosted invoice URL.
- Store Stripe object IDs, `livemode=false`, invoice status, paid state, idempotency keys, and sanitized raw object JSON.
- Emit orchestration and ledger audit events for payment actions.
- Return a visible Stripe integration error if Stripe API setup or calls fail in product mode.
- Keep test-double Stripe records available for tests/CI only.

Done when:

- Product mode uses real Stripe test mode when configured.
- Test-double mode works only when explicitly enabled for tests/CI.
- UI clearly labels Stripe as `stripe_test` or `test_double`.
- No live Stripe key is accepted in Goal 7.

Verified in the current implementation:

- `./scripts/test.sh` passes with backend Stripe service tests and frontend production build.
- Product-mode Stripe setup without `STRIPE_SECRET_KEY` returns a visible `stripe_failed` state.
- Automated tests use `STRIPE_TEST_DOUBLE_MODE=true` and do not make network calls.
- Real Stripe API verification has been performed with an ignored local `sk_test_...` key; future reruns still require a local test key.

Suggested commit:

```bash
git add .
git commit -m "Add Stripe test-mode invoice flow"
```

---

### Milestone 7.9 — Workflow Canvas Product UX Redesign — Planned

Goal: consolidate the existing functional product shell into a focused workflow
automation/control-room UX before Goal 8 policy safety work.

This is a planning and implementation sequence for product UX only. It must not replace
Goal 8, Goal 9, or Goal 7B. It must preserve the working product loop, real isolated
Hermes proof, real Stripe test-mode proof, SQLite audit records, selected-workflow runs,
run history, local policy guardrails, and honest labels for NemoClaw and Verified Live Mode.

#### Goal 7.9A — UX Blueprint / Product IA Audit

No code.

Tasks:

- Inspect the current UI and define the exact target layout.
- Identify duplicate proof panels, clutter, weak hierarchy, and unclear recording flow.
- Lock the product model:
  - left navigation
  - top command bar
  - central workflow canvas
  - right selected-node inspector
  - separate Customers, Runs, Audit, Integrations, and Settings views
- Treat the current UI as functional but not final.
- Output exact implementation prompts for Goals 7.9B, 7.9C, 7.9D, and 7.9E.

Done when:

- The docs contain a concrete screen model, component targets, and UX acceptance criteria.
- The next implementation goals can be started without rediscovering the product IA.
- No code is changed.

#### Goal 7.9B — Design System + App Shell Foundation

Goal: clean the visual foundation before moving workflow nodes around.

Tasks:

- Establish a consistent dark command-center theme.
- Make sidebar, top command bar, cards, node surfaces, and inspector styles consistent.
- Create reusable layout primitives only where they reduce `App.tsx` complexity or match
  an existing local pattern.
- Reduce `App.tsx` complexity only if safe and tightly scoped.
- Preserve all current functionality.

Done when:

- The app shell feels coherent and product-like across Workflow, Customers, Runs, Audit,
  Integrations, and Settings.
- Existing auth, workflow selection, run controls, run history, proof surfaces, and API
  behavior still work.

#### Goal 7.9C — Workflow Canvas + Selected-Node Inspector

Goal: make the main Workflow page the product center.

Tasks:

- Replace stacked proof panels on the main Workflow page with a connected workflow canvas.
- Use these nodes:
  - Customer Intake
  - Hermes Brain
  - Stripe Test Invoice
  - Payment Status
  - Policy Gate
  - Approved Spend
  - Blocked Spend
  - Agent Work
  - SQLite Audit
  - Profit Report
- Make clicking a node update the right selected-node inspector instead of opening
  scattered or modal proof panels.
- Show real proof for the selected node in the inspector.
- Make approved and blocked spend branches visually obvious.
- Preserve real Hermes, Stripe test-mode, SQLite, and local policy proof.

Done when:

- The Workflow page can be recorded as a canvas-driven product flow.
- The inspector shows the exact proof behind the selected node.
- Stripe open/unpaid status remains honest unless Stripe reports `paid=true`.

#### Goal 7.9D — Customers / Runs / Audit / Integrations Cleanup

Goal: make secondary product views useful and specific without placeholder-only tabs.

Tasks:

- Customers view:
  - create, select, and delete local workflows
  - make the Harbor sample prominent
  - make the selected workflow obvious
- Runs view:
  - list prior runs
  - show selected run details
  - summarize run proof
- Audit view:
  - timeline
  - orchestration calls
  - ledger
  - Stripe events
  - policy checks
- Integrations / Settings:
  - Hermes status
  - Stripe test-mode status
  - SQLite ledger
  - local policy
  - NemoClaw Goal 8 next
  - prototype auth
- Remove or replace any placeholder-only tabs.

Done when:

- Every navigation item has a real product purpose and visible state.
- Customers, Runs, Audit, Integrations, and Settings support the browser-only recording.

#### Goal 7.9E — Recording Readiness / Browser-Only Demo QA

Goal: make ScaleX ready for a commercial-style recording where the demo is product usage.

Recording path:

1. Login.
2. Select or create workflow.
3. Start run.
4. Watch graph nodes progress.
5. Click Hermes node.
6. Click Stripe node.
7. Click blocked spend node.
8. Click Profit Report node.
9. Open Runs.
10. Open Audit.
11. Open Integrations.
12. Logout.

Tasks:

- Ensure no terminal output is needed in the video.
- Ensure every visible claim is real, test-mode, or honestly labeled future work.
- Update demo script and submission docs.
- Verify the hosted judge demo boundary: safe browser experience without exposed secrets.
- Verify local full-proof mode can use ignored `.env` values for real Hermes and Stripe
  test mode.

Done when:

- The recording can be completed browser-only.
- No UI copy implies production auth, live-money support, real NemoClaw, real client data,
  or Stripe-paid invoices unless those facts are true.

Suggested commit after Goal 7.9 implementation:

```bash
git add .
git commit -m "Redesign ScaleX workflow canvas UX"
```

---

### Milestone 7B — Production Hardening / Verified Live Mode

Goal: add the only allowed future path for live-money Stripe payments.

Sequence note: Goal 7B remains future hardening. It is not the next active milestone and
does not replace Goal 7.9, Goal 8, or Goal 9.

Tasks:

- Keep live-money mode disabled by default.
- Require explicit local/secrets config for live-money mode.
- Reject test keys when live-money mode is requested.
- Reject live keys when Stripe test mode is requested.
- Require typed operator confirmation: `LIVE_MONEY_APPROVED`.
- Require `SCALEX_LIVE_MAX_AMOUNT_CENTS`.
- Require customer email/domain or verified customer ID allowlist.
- Require pre-charge review state before creating, finalizing, or confirming a live payment.
- Record who/what/when, amount, mode, customer, approval text/hash, policy result, and operator confirmation in SQLite.
- Keep Hermes limited to proposing payment steps; ScaleX code executes and enforces safeguards.
- Surface a visible blocked/error state if verification fails.

Done when:

- Live-money mode cannot run without all verification controls.
- Live-money audit records are complete.
- No silent fallback can pretend a live charge happened.

Suggested commit:

```bash
git add .
git commit -m "Add Verified Live Mode payment safeguards"
```

### Milestone 8 — Governed Autonomy Layer with NVIDIA NeMo Guardrails

Goal: after Goal 7.9, make ScaleX's governed-autonomy stack explicit and safely add a
guardrail layer centered on NVIDIA NeMo Guardrails concepts.

Stack identity:

- Hermes plans and routes autonomous work.
- Stripe executes finance/invoice/payment primitives in test mode now.
- NVIDIA NeMo Guardrails or a NeMo-compatible local adapter validates the autonomous workflow.
- SQLite records guardrail proof and audit evidence.
- Policy/profit rules enforce safe business outcomes.

Do not claim real NeMo Guardrails unless it is installed, wired, tested, and documented.
Until then, say "local policy active" or "NeMo-compatible guardrail adapter planned."

#### Goal 8A — NeMo Guardrails Preflight / Architecture Audit

- Read-only.
- Inspect whether `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling are locally available.
- Inspect current local policy engine.
- Decide whether real NeMo Guardrails is safely available.
- Produce exact 8B implementation prompt.

#### Goal 8B — Guardrail Adapter + Schema/API

- Add a guardrail adapter boundary with modes:
  - `local_policy`
  - `nemo_guardrails`
  - `nemo_compatible`
- Add guardrail evaluation persistence if needed.
- Add API state for guardrail mode/status/proof.
- Keep local policy deterministic for tests.

#### Goal 8C — Guardrail Execution Rails in Run Lifecycle

- Add pre-action guardrail checks around onboarding/workflow input, Hermes plan/tool sequence,
  Stripe finance action request, spend approval/block, and agent deliverables/final report.
- Map to NeMo-style rails:
  - input rail
  - planning/dialog rail
  - execution rail
  - output rail
- Fail closed on guardrail errors in product mode.

#### Goal 8D — Guardrail Proof UI in Workflow Canvas

- Add or enhance nodes/inspector proof for:
  - NeMo Guardrail Gate
  - local policy fallback/test support
  - fail-closed status
  - blocked action proof
  - rule evidence
- Do not claim real NeMo unless verified.

#### Goal 8E — Enterprise Function Template Positioning + Recording Proof

- Make the product story show ScaleX as an enterprise function framework.
- Keep Service Campaign Launch as implemented.
- Present future templates honestly:
  - Invoice-to-Cash
  - Vendor Spend Approval
  - Client Onboarding
  - Research-to-Report
  - Ops Handoff
  - Renewal Recommendation
- Update demo/submission docs and browser recording path.

Done when:

- Goal 8A has determined whether real NeMo Guardrails is safely available before implementation.
- Later Goal 8 work shows the guardrail layer as a governed-autonomy gate, not just a spend panel.
- The UI clearly shows why unsafe actions, including the $750 request, were blocked.
- No production Hermes, homelab/OpenClaw, production Prometheus, Recall, or real client data is touched.

Suggested commit after the full Goal 8 sequence:

```bash
git add .
git commit -m "Add governed autonomy guardrails"
```

---

### Milestone 9 — Polish + Submission Docs

Goal: make the product prototype, sample run, and submission assets presentable.

Tasks:

- Improve UI copy.
- Add README screenshots instructions.
- Create demo script.
- Draft tweet.
- Draft submission writeup.
- Ensure setup works from fresh clone.
- Run tests/build.

Done when:

- Fresh setup works.
- Recorded walkthrough can be completed in under 3 minutes.
- README explains exactly what is real integration, test-double mode, and future Verified Live Mode.

Suggested commit:

```bash
git add .
git commit -m "Polish demo and add submission docs"
```

---

## 17. Codex `/goal` Plan

Use Codex `/goal` for phase-level work. Paste one goal at a time. Do not ask Codex to build everything in one run.

Officially, Goal mode is intended for defining an outcome and success criteria for longer-running work, so every `/goal` below includes explicit acceptance criteria.

### `/goal` 1 — Scaffold

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Create the clean ScaleX product prototype scaffold for a sandbox-safe local build.

Constraints:
- Do not touch any files outside this repo.
- Do not add secrets.
- Do not connect to live Stripe, production Hermes, Prometheus, xScaleOS, Recall, or homelab services.
- Use the repo structure in ROADMAP.md.

Deliverables:
- README.md
- AGENTS.md
- .gitignore
- .env.example
- backend/ skeleton
- frontend/ skeleton
- data/schema.sql
- data/seed.json
- policies/scalex-policy.json
- scripts/setup.sh, scripts/dev.sh, scripts/test.sh

Acceptance criteria:
- Repo has the expected structure.
- .gitignore protects secrets, DB files, venvs, node_modules, logs, and recordings.
- README contains product pitch and local setup placeholder.
- No live keys or real client data are present.
```

### `/goal` 2 — Backend + SQLite Ledger

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Build the FastAPI backend and SQLite job ledger for ScaleX.

Constraints:
- Use Python sqlite3 or a lightweight dependency only.
- Database file must be data/scalex.db and ignored by git.
- No external network calls.

Deliverables:
- FastAPI app at backend/app/main.py
- DB initialization from data/schema.sql
- Demo reset/state endpoints
- Models/schemas for jobs, events, ledger entries, policy checks, Stripe events, agent outputs, reports
- Unit tests for DB initialization and demo reset

Acceptance criteria:
- scripts/dev.sh can start backend.
- GET /api/health returns OK.
- POST /api/demo/reset resets local DB.
- GET /api/demo/state returns valid empty/seed state.
- pytest passes.
```

### `/goal` 3 — Margin + Policy Engine

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Implement ScaleX profit math and policy-gated spend logic.

Constraints:
- Policy code is the authority, not AI output.
- Blocked spend must not create a spend ledger entry.
- Use policies/scalex-policy.json.

Deliverables:
- Margin calculator
- Ledger service
- Policy service
- Tests for approved $89 spend, approved $98 spend, blocked $750 spend, final margin

Acceptance criteria:
- Projected margin for $1,200 revenue and $300 spend cap is 75%.
- Actual margin for $1,200 revenue and $187 approved spend is about 84.4%.
- $750 Premium Automation Suite spend is blocked.
- Blocked spend creates a policy check event only.
- Tests pass.
```

### `/goal` 4 — One-Click Demo Runner

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Create a one-click compressed sample runner that executes the full ScaleX job lifecycle.

Constraints:
- Default test mode must be sandbox-safe; product mode should use real integrations where wired.
- No real network calls required.
- Must generate a complete timeline and final report.

Deliverables:
- backend/app/demo_runner.py
- POST /api/demo/run
- Events for job creation, operating plan, payment/invoice proof, payment confirmation, spend checks, agent work, final report
- Deterministic agent outputs

Acceptance criteria:
- POST /api/demo/run returns a full final state.
- Final report shows revenue $1,200, approved spend $187, profit $1,013, margin about 84.4%.
- Event timeline includes approved and blocked spend.
- Tests pass.
```

### `/goal` 5 — Frontend Dashboard — Historical Baseline

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Build the ScaleX single-page dashboard for the product prototype sample run.
This is now historical context; Goal 7.7 added the current product shell.

Constraints:
- Clean, polished, product-like UI.
- Must work locally against FastAPI backend.
- Historical baseline did not require auth or deployment; current Goal 7.7 product shell can enable local prototype auth.

Deliverables:
- Vite React TypeScript frontend
- Tailwind styling
- Header, metrics cards, job intake card, timeline, Stripe panel, policy panel, agent workboard, profit report
- Run Demo Job button
- Reset Demo button

Acceptance criteria:
- frontend starts on `http://127.0.0.1:5174`.
- Click Run Demo Job and see the full lifecycle.
- Final report is visible without scrolling too much.
- UI labels Stripe mode clearly.
- npm build passes.
```

### `/goal` 6 — Isolated Hermes Brain + Orchestration

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Wire ScaleX to the ScaleX-isolated Hermes brain/orchestration install and use GPT-5.5 Auth through Hermes for product-mode planning/reasoning.

Constraints:
- Use the isolated Hermes install at /home/ascabrya/.scalex-hermes/hermes-agent.
- Use isolated Hermes home/config/auth at /home/ascabrya/.scalex-hermes/home.
- Do not touch production Hermes or Windows Hermes config.
- Do not commit secrets.
- Product mode must show a visible Hermes integration error if Hermes/model planning fails.

Deliverables:
- backend/app/services/hermes_adapter.py
- Structured Hermes prompt for operating plan and agent task list
- Safe structured output parsing
- Deterministic test-double plan for automated tests only
- SQLite events showing Hermes planning/orchestration or explicit test-double planning
- UI indicator for Hermes-generated vs test-double plan

Acceptance criteria:
- Tests work without Hermes by using deterministic test-double planning.
- Product mode uses isolated Hermes.
- Hermes/model failure returns a visible `hermes_failed` state.
- No production Hermes config is read or written.
- Tests pass.
```

### `/goal` 7 — Real Stripe Test-Mode Invoice Flow Through Orchestration

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Add real Stripe test-mode invoice/payment support through the orchestration layer.

Constraints:
- Never use live Stripe keys in Goal 7.
- STRIPE_LIVE_MODE must remain false.
- STRIPE_TEST_MODE must be true for product mode.
- STRIPE_TEST_DOUBLE_MODE is for tests/CI only.
- If Stripe fails in product mode, return a visible Stripe integration error.

Deliverables:
- stripe_service.py
- Real Stripe test customer, invoice item, invoice, and finalized hosted invoice URL path
- Test-double Stripe customer/invoice/payment events for tests/CI only
- Hermes/orchestration events for Stripe payment actions
- UI displays Stripe test object IDs, hosted invoice URL, `livemode=false`, invoice status, and paid state

Acceptance criteria:
- Product mode rejects missing, live, or malformed Stripe keys.
- Product mode uses real Stripe test mode and does not silently use test doubles.
- No live-money execution exists in Goal 7.
- Revenue ledger entry is recorded after Stripe-paid status or explicitly labeled local test confirmation.
- Tests pass.
```

### `/goal` 7.9A — Workflow Canvas Product UX Redesign Blueprint

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Create the no-code UX blueprint and product IA audit for Goal 7.9 - Workflow Canvas Product UX Redesign.

Constraints:
- Do not implement code.
- Do not commit.
- Preserve real isolated Hermes, real Stripe test mode, SQLite ledger, local policy, selected-workflow runs, and run history.
- Do not claim real NemoClaw.
- Do not claim live-money support.
- Do not claim Stripe invoices are paid unless paid=true.

Deliverables:
- Exact target layout:
  - left navigation
  - top command bar
  - central workflow canvas
  - right selected-node inspector
  - separate Customers, Runs, Audit, Integrations, and Settings views
- Current UI audit covering duplicate panels, clutter, weak hierarchy, and recording-flow gaps.
- Implementation prompts for Goal 7.9B, Goal 7.9C, Goal 7.9D, and Goal 7.9E.
- Acceptance criteria for each 7.9 sub-goal.

Acceptance criteria:
- Docs clearly state that the current UI is functional but not final.
- Goal 7.9 remains before Goal 8.
- Goal 8, Goal 9, and Goal 7B remain intact.
- No code implementation is done.
```

### `/goal` 7.9B — Design System + App Shell Foundation

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Clean ScaleX's visual foundation and app shell before moving workflow nodes around.

Constraints:
- Preserve current functionality.
- Keep auth, selected workflows, run history, audit proof, Hermes proof, Stripe test-mode proof, and local policy proof working.
- Reduce App.tsx complexity only if safe.

Deliverables:
- Consistent dark command-center theme.
- Consistent sidebar, top bar, card, node, and inspector styling.
- Reusable layout primitives if they reduce real duplication.
- Focused verification that existing product flows still work.
```

### `/goal` 7.9C — Workflow Canvas + Selected-Node Inspector

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Make the Workflow page the product center with a connected canvas and right selected-node inspector.

Constraints:
- Preserve real proof for Hermes, Stripe test mode, SQLite, and local policy.
- Keep Stripe open/unpaid honesty.
- Do not add fabricated proof.

Deliverables:
- Connected workflow canvas with Customer Intake, Hermes Brain, Stripe Test Invoice, Payment Status, Policy Gate, Approved Spend, Blocked Spend, Agent Work, SQLite Audit, and Profit Report nodes.
- Right inspector that changes when a node is clicked.
- Visually obvious approved and blocked spend branches.
```

### `/goal` 7.9D — Customers / Runs / Audit / Integrations Cleanup

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Clean the secondary product views so every navigation item supports real product usage and recording.

Constraints:
- No placeholder-only tabs.
- Keep local/sample workflow boundaries honest.
- Keep production auth, real NemoClaw, and live-money support out of scope.

Deliverables:
- Customers: create/select/delete local workflow, prominent Harbor sample, obvious selected workflow.
- Runs: prior runs list, selected run details, run proof summary.
- Audit: timeline, orchestration calls, ledger, Stripe events, policy checks.
- Integrations/Settings: Hermes status, Stripe test mode, SQLite ledger, local policy, NemoClaw Goal 8 next, prototype auth.
```

### `/goal` 7.9E — Recording Readiness / Browser-Only Demo QA

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Prepare ScaleX for a commercial-style browser-only product recording.

Constraints:
- No terminal output should be needed in the recording.
- Every visible claim must be real, test-mode, or honestly labeled future work.
- Hosted judge demo must not expose secrets.
- Local full-proof mode can use ignored .env values for real Hermes and Stripe test mode.

Acceptance criteria:
- Recording path works: login, select/create workflow, start run, watch graph progress, click Hermes, Stripe, blocked spend, and Profit Report nodes, open Runs, Audit, Integrations, and logout.
- Demo script and submission docs are updated.
- Goal 8A remains next after Goal 7.9.
```

### `/goal` 8A — NeMo Guardrails Preflight / Architecture Audit

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Run Goal 8A - NeMo Guardrails Preflight / Architecture Audit.

Decide, read-only, whether real NVIDIA NeMo Guardrails or a NeMo-compatible adapter is safely
available for Goal 8 implementation, and produce the exact Goal 8B prompt.

Constraints:
- Read-only.
- Do not implement code.
- Do not install anything.
- Do not connect to production Hermes.
- Do not connect to homelab/OpenClaw.
- Do not connect to production Prometheus, xScaleOS, Recall, or real client files.
- Do not run Stripe API calls.
- Do not run Hermes model calls.
- Do not use real client data.
- Do not claim real NeMo Guardrails or real NemoClaw unless actually installed, wired, tested, and documented.

Deliverables:
- Inventory of local availability for `nemoguardrails`, `nemoclaw`, `openclaw`, Docker, and NVIDIA tooling.
- Read-only audit of the current local policy engine and SQLite audit schema.
- Decision on whether Goal 8B should use `nemo_guardrails`, `nemo_compatible`, or `local_policy` first.
- Exact Goal 8B implementation prompt for Guardrail Adapter + Schema/API.
- Docs updated if the plan changes.

Acceptance criteria:
- No code implementation is done.
- Goal 8A output clearly distinguishes local policy active now from real NeMo planned/not wired.
- Goal 8B is ready to run as the next implementation step.
```

### `/goal` 9 — Final Polish + Submission Prep

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Polish ScaleX for recording and submission as a working product-style prototype.

Constraints:
- Keep scope narrow.
- Do not add new major features.
- Fix reliability and presentation first.

Deliverables:
- README with setup/run instructions
- docs/DEMO_SCRIPT.md
- docs/SUBMISSION_WRITEUP.md
- docs/ARCHITECTURE.md
- Screenshots directory placeholder
- Fresh-clone setup verification

Acceptance criteria:
- scripts/setup.sh works.
- scripts/dev.sh starts backend and frontend.
- scripts/test.sh passes.
- Sample Harbor Fleet Services run can be recorded in under 3 minutes.
- README clearly distinguishes Stripe test mode, future Verified Live Mode, and unsupported live-money execution.
```

---

## 18. Developer Commands

Initial commands from the Fedora laptop:

```bash
cd /home/ascabrya/dev/scalex-demo
pwd
git init
```

After scaffold exists:

```bash
cp .env.example .env
./scripts/setup.sh
./scripts/dev.sh
```

Run tests:

```bash
./scripts/test.sh
```

Reset demo:

```bash
./scripts/reset-demo.sh
```

Check git hygiene:

```bash
git status --short
git diff --stat
```

---

## 19. Demo Script

Target length: 1:30–2:30.

### 0:00–0:10

> Enterprise teams do not need an AI CEO. They need governed AI operators that can turn repeatable functions into revenue without losing margin.

### 0:10–0:20

> This is ScaleX: autonomous, governed workflows for repeatable enterprise functions.

### 0:20–0:35

Show prompt/job:

```text
Onboard Harbor Fleet Services for a $1,200 fleet brake inspection campaign.
Spend up to $300 only if margin stays above 50%.
```

### 0:35–0:50

Show operating plan:

```text
Revenue: $1,200
Spend Cap: $300
Projected Profit: $900
Projected Margin: 75%
Decision: Profitable
```

### 0:50–1:05

Show Stripe test invoice:

```text
Customer created
Invoice created
Current proof: invoice_status=open, paid=false
Revenue/profit shown as the compressed-run business result, not a Stripe-paid claim
```

### 1:05–1:25

Show policy checks:

```text
$89 spend approved
$98 spend approved
$750 spend blocked
Reason: margin/spend policy violation
```

### 1:25–1:50

Show agents:

```text
Finance Agent
Marketing Agent
Research Agent
Ops Agent
```

### 1:50–2:10

Show deliverables:

```text
Campaign copy
Social posts
Landing page copy
Follow-up messages
Client handoff checklist
```

### 2:10–2:30

Show final report:

```text
Revenue: $1,200
Approved Spend: $187
Gross Profit: $1,013
Margin: 84.4%
Blocked Unsafe Spend: $750
Policy Violations: 0
```

Closing:

> ScaleX lets Hermes agents earn, spend, operate, and protect margin safely.

---

## 20. Definition of Done

ScaleX is ready when all are true:

```text
Fresh repo setup works.
Backend starts locally.
Frontend starts locally.
SQLite DB initializes and resets.
Run Demo Job works from UI.
Timeline shows full job lifecycle.
Stripe test invoice appears in product mode, including hosted invoice URL, `livemode=false`, invoice status, and paid state; an explicit test-double invoice appears only in test/diagnostic mode.
Policy approves safe spend.
Policy blocks unsafe spend.
Agents produce client-ready deliverables.
Final report shows correct revenue/spend/profit/margin.
No live Stripe keys are used in current product mode; no real client data is used.
Sample Harbor Fleet Services run can be recorded in under 3 minutes.
Repo is clean enough to publish on GitHub.
```

---

## 21. Remaining Product Roadmap

Goal 7.6 was a presentation polish pass pulled forward before Goal 8. Goal 7.7 added
the product shell, local prototype auth, local/sample onboarding, and live workflow map.
Goal 7.8 made saved workflows, selected-workflow runs, persisted run history, and
clickable proof nodes functional. Goal 7.9 is the UX/product consolidation milestone
before Goal 8. None of these replaces Goal 8 or Goal 9.

The remaining core roadmap is:

```text
Goal 7.9A - UX Blueprint / Product IA Audit
Goal 7.9B - Design System + App Shell Foundation
Goal 7.9C - Workflow Canvas + Selected-Node Inspector
Goal 7.9D - Customers / Runs / Audit / Integrations Cleanup
Goal 7.9E - Recording Readiness / Browser-Only Demo QA
Goal 8A - NeMo Guardrails Preflight / Architecture Audit
Goal 8B - Guardrail Adapter + Schema/API
Goal 8C - Guardrail Execution Rails in Run Lifecycle
Goal 8D - Guardrail Proof UI in Workflow Canvas
Goal 8E - Enterprise Function Template Positioning + Recording Proof
Goal 9 - Final polish and submission assets
Goal 7B / Production Hardening - Verified Live Mode for future live-money payments
```

Additional optional work after the product prototype is stable:

```text
Report export button
Public deployment
```

Do not do these for the hackathon submission:

```text
Ad hoc live $1 proof outside Verified Live Mode
Production multi-client onboarding
Real 30-day campaign
Multi-client accounts
Subscription billing
Production auth
Real vendor payouts
```

---

## 22. Final Reminder for Codex

Build the thing that records well.

Do not overbuild. Do not chase production architecture. Do not invent extra product surfaces.

The winning demo is:

```text
A service job comes in.
Hermes/GPT-5.5 plans the work.
ScaleX creates a real Stripe test-mode invoice and records payment status honestly.
ScaleX protects margin with local policy now and a planned NeMo Guardrail Gate.
ScaleX records audit-backed execution in SQLite.
ScaleX coordinates agent work.
ScaleX delivers work.
ScaleX reports profit.
```
