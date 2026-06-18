# ScaleX Codex Roadmap

> **Project path:** `/home/ascabrya/dev/scalex-demo/`  
> **Purpose:** Build a clean, functional hackathon demo in a sandbox.  
> **Product:** **ScaleX — Profit-Aware Agent Operations for Service Businesses**  
> **Core demo loop:** job intake → margin plan → Stripe test invoice → policy-gated spend → agent work → profit report.

---

## 0. Non-Negotiable Build Rules

Codex must follow these rules for the entire repo.

### Safety / Sandbox Rules

- **Do not use live Stripe keys.** Only `sk_test_...` keys are allowed.
- **Do not touch Prometheus, xScaleOS, production Hermes, Windows Hermes, homelab OpenClaw, Recall memory, or real client files.**
- **Do not commit secrets.** `.env`, `.env.local`, SQLite `.db` files, recordings, and logs must stay ignored.
- **Use fake demo data only.** The demo client is `Harbor Auto Care`.
- **No autonomous real-world payments.** All money movement is Stripe test mode or simulated ledger events.
- **Do not claim real NemoClaw/Hermes integration unless it is actually wired.** If local-only, label it clearly as `local policy engine` / `Hermes-style orchestration adapter`.

### Scope Rules

- One client.
- One service job.
- One invoice.
- Two spend checks: one approved, one blocked.
- Four agents: Finance, Marketing, Research, Ops.
- One final profit report.
- Working local demo beats architectural perfection.

### Git Rules

- Commit at the end of each completed milestone.
- Keep commits small and named clearly.
- Do not commit `.env`, `.db`, node modules, venvs, recordings, or logs.

---

## 1. Product Lock

### Name

**ScaleX**

### Submission Title

**ScaleX: Profit-Aware Agent Operations for Service Businesses**

### One-Sentence Pitch

> ScaleX lets a service business give an AI agent a job, a budget, and a margin target — then the agent invoices the client, controls spend, delegates work, and reports profit.

### Demo Thesis

Most autonomous agent demos focus on whether an agent can spend money. ScaleX focuses on whether a business can trust an agent to spend **only while protecting margin**.

### Differentiation

- SOLVENT-style agents protect an agent treasury.
- **ScaleX protects profitability on paid service jobs.**
- Core object is not a treasury; core object is a **customer job ledger**.

---

## 2. Recommended Stack

Use a reliable, boring stack optimized for fast local development.

```text
Frontend: Vite + React + TypeScript + Tailwind
Backend: FastAPI + Python sqlite3
Database: SQLite file in ./data/scalex.db
AI planning: GPT-5.5 Auth via env-configured model, with deterministic fallback
Stripe: Stripe test mode SDK, with mock fallback
Policy: local policy engine first; NemoClaw adapter only if available fast
Hermes: local skill-call orchestration adapter first; real Hermes only if safe/test access is available
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

A JSON file could work, but SQLite makes the demo look more serious and gives us a real job ledger without running Postgres.

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
│   ├── SUBMISSION_WRITEUP.md
│   └── CODEX_GOALS.md
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
# ScaleX Hackathon Demo
APP_ENV=development
BACKEND_PORT=8787
FRONTEND_PORT=5173
DATABASE_PATH=./data/scalex.db

# Reasoning brain
MODEL_PROVIDER=openai
SCALEX_REASONING_MODEL=
OPENAI_API_KEY=
AI_FALLBACK_MODE=true

# Hermes layer
HERMES_MODE=local
HERMES_BASE_URL=
HERMES_API_KEY=

# Stripe test mode only
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_LIVE_MODE=false
STRIPE_MOCK_MODE=true

# Policy / NemoClaw
POLICY_ENGINE=local
NEMOCLAW_BASE_URL=
NEMOCLAW_API_KEY=

# Demo guardrails
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
  "clientName": "Harbor Auto Care",
  "businessType": "Local auto repair shop",
  "jobName": "30-day brake service campaign",
  "jobGoal": "Generate a client-ready brake service promotion package, including campaign copy, social posts, landing page copy, follow-up messages, and a final profitability report.",
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

Expected final demo numbers:

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

Backend base URL: `http://localhost:8787`

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

Runs the entire compressed demo and returns the final state.

Sequence:

```text
1. Reset demo DB state
2. Create Harbor Auto Care job
3. Generate operating plan
4. Create Stripe test customer / invoice / payment event or mock equivalents
5. Record $1,200 revenue ledger entry
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
Payment is confirmed/simulated paid
Vendor is allowed
Vendor is not blocked
Requested amount does not exceed per-transaction approval threshold unless human approved
Total approved spend after request <= spend cap
Margin after spend >= margin floor
```

Blocked spend must create a policy check event but must **not** create a spend ledger entry.

---

## 9. Agent Outputs

Use deterministic outputs first. GPT-5.5 generation is a stretch enhancement with fallback.

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

The frontend should be a single polished dashboard page.

### Required Components

```text
Header
Job Intake Card
Metrics Cards
Economic Loop Timeline
Stripe Panel
Policy Panel
Agent Workboard
Deliverables Preview
Profit Report
Reset Demo Button
Run Demo Job Button
```

### Visual Story

The page should make this obvious within 5 seconds:

```text
ScaleX accepted a paid job.
ScaleX got paid in Stripe test mode.
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
Invoice Status: Paid / Simulated Paid
Recommendation: Renew campaign for another 30 days
```

---

## 11. GPT-5.5 Auth Integration

Add GPT planning only after local deterministic demo works.

### Rules

- Read model from `SCALEX_REASONING_MODEL`.
- Read API key from `OPENAI_API_KEY`.
- Never commit keys.
- Add `AI_FALLBACK_MODE=true` fallback.
- If model call fails, use seeded deterministic demo output.
- The demo must still work offline except for real Stripe test calls.

### GPT Should Generate

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

### MVP Path

1. Use `STRIPE_MOCK_MODE=true` first.
2. Generate fake but realistic Stripe object IDs:
   - `cus_test_scalex_...`
   - `in_test_scalex_...`
   - `plink_test_scalex_...`
3. Show these in UI.
4. Record revenue ledger entry.

### Real Test Mode Path

After MVP works:

1. Set `STRIPE_MOCK_MODE=false`.
2. Use `STRIPE_SECRET_KEY=sk_test_...`.
3. Create Stripe customer.
4. Create invoice or payment link.
5. Display real test object IDs.
6. Simulate payment status for the demo if webhook setup is too slow.

### Never Do

```text
STRIPE_LIVE_MODE=true
Live charges
Live payouts
Real customer data
Autonomous external spend
```

---

## 13. Hermes Layer

Create `backend/app/services/hermes_adapter.py`.

The local adapter should produce visible skill-call events like:

```json
{
  "skill": "stripe.create_invoice",
  "status": "success",
  "input": { "amountUsd": 1200, "client": "Harbor Auto Care" },
  "output": { "invoiceId": "in_test_scalex_001" }
}
```

Required skills:

```text
job.create
planning.generate
stripe.create_customer
stripe.create_invoice
stripe.confirm_payment
policy.check_spend
ledger.record_revenue
ledger.record_spend
agent.run_finance
agent.run_marketing
agent.run_research
agent.run_ops
report.generate
```

UI should show these as `Hermes Orchestrator` events.

---

## 14. NemoClaw / Policy Layer

Build local policy engine first.

Only add real NemoClaw if setup is fast and does not endanger the MVP.

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
git commit -m "Initialize ScaleX hackathon demo scaffold"
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
- Implement simulated Stripe events.
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

### Milestone 5 — Frontend Dashboard

Goal: polished single-page demo dashboard.

Tasks:

- Create Vite React TypeScript app.
- Add Tailwind.
- Build dashboard components.
- Add Run Demo Job button.
- Add Reset Demo button.
- Fetch demo state from backend.
- Replay events visually in timeline.

Done when:

- User can open `http://localhost:5173`.
- Click `Run Demo Job`.
- See full flow and final report.

Suggested commit:

```bash
git add .
git commit -m "Build ScaleX demo dashboard"
```

---

### Milestone 6 — GPT-5.5 Auth Planning Fallback

Goal: optional AI-generated planning, safe fallback always available.

Tasks:

- Add planning service.
- Use env model/key.
- Add structured prompt.
- Parse JSON safely.
- Store plan summary in events or report.
- Fallback to deterministic output if unavailable.

Done when:

- Demo works with no API key.
- Demo enriches plan if API key/model are present.
- No model failure can break recording.

Suggested commit:

```bash
git add .
git commit -m "Add GPT planning with deterministic fallback"
```

---

### Milestone 7 — Stripe Test Integration

Goal: real Stripe test-mode support behind feature flag.

Tasks:

- Add Stripe package.
- Implement mock-first Stripe service.
- Add real test-mode path if key exists and `STRIPE_MOCK_MODE=false`.
- Create customer and invoice/payment link if feasible.
- Store Stripe object IDs.
- Keep demo working if Stripe API fails.

Done when:

- Mock mode works by default.
- Test mode works when configured.
- UI clearly labels Stripe as `test mode` or `mock test object`.

Suggested commit:

```bash
git add .
git commit -m "Add Stripe test-mode invoice flow"
```

---

### Milestone 8 — Hermes Skill Log + NemoClaw-Style Labeling

Goal: make sponsor stack legible without risking production.

Tasks:

- Add Hermes adapter skill-call events.
- Show skill calls in timeline.
- Show policy checks as NemoClaw-style guardrails.
- Add clear labels:
  - `Hermes Orchestrator`
  - `Stripe Skill`
  - `Policy Guardrail`
  - `Local Policy Engine`
- If real NemoClaw is integrated, label accurately.

Done when:

- Judges can see the agent orchestration and safety layer in the UI.
- No production Hermes is touched.

Suggested commit:

```bash
git add .
git commit -m "Add Hermes-style skill log and guardrail timeline"
```

---

### Milestone 9 — Polish + Submission Docs

Goal: make demo and repo presentable.

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
- Video can be recorded in under 3 minutes.
- README explains exactly what is real vs simulated.

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
Create the clean ScaleX hackathon repo scaffold for a sandbox-only demo.

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
Create a one-click compressed demo runner that executes the full ScaleX job lifecycle.

Constraints:
- Default mode must be sandbox/mock.
- No real network calls required.
- Must generate a complete timeline and final report.

Deliverables:
- backend/app/demo_runner.py
- POST /api/demo/run
- Events for job creation, operating plan, Stripe test invoice, payment confirmation, spend checks, agent work, final report
- Deterministic agent outputs

Acceptance criteria:
- POST /api/demo/run returns a full final state.
- Final report shows revenue $1,200, approved spend $187, profit $1,013, margin about 84.4%.
- Event timeline includes approved and blocked spend.
- Tests pass.
```

### `/goal` 5 — Frontend Dashboard

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Build the ScaleX single-page dashboard for the hackathon demo.

Constraints:
- Clean, polished, product-like UI.
- Must work locally against FastAPI backend.
- Must not require auth or deployment.

Deliverables:
- Vite React TypeScript frontend
- Tailwind styling
- Header, metrics cards, job intake card, timeline, Stripe panel, policy panel, agent workboard, profit report
- Run Demo Job button
- Reset Demo button

Acceptance criteria:
- frontend starts on localhost:5173.
- Click Run Demo Job and see the full lifecycle.
- Final report is visible without scrolling too much.
- UI labels Stripe as test/mock mode clearly.
- npm build passes.
```

### `/goal` 6 — GPT-5.5 Planning Fallback

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Add GPT-5.5 Auth planning support with a deterministic fallback.

Constraints:
- Read model from SCALEX_REASONING_MODEL.
- Read key from OPENAI_API_KEY.
- Do not commit secrets.
- Demo must still work if model call fails.

Deliverables:
- planning_service.py
- Structured prompt for operating plan and agent task list
- Safe JSON parsing
- Fallback plan from seed outputs
- UI indicator for AI-generated vs fallback plan

Acceptance criteria:
- Works with no API key.
- Uses model if env vars are present.
- Model failure cannot break POST /api/demo/run.
- Tests pass.
```

### `/goal` 7 — Stripe Test Mode

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Add Stripe test-mode invoice support while preserving mock fallback.

Constraints:
- Never use live Stripe keys.
- STRIPE_LIVE_MODE must remain false.
- Mock mode must remain default.
- If Stripe fails, demo continues with mock test objects.

Deliverables:
- stripe_service.py
- Mock Stripe customer/invoice/payment events
- Optional real test customer/invoice/payment link path when STRIPE_MOCK_MODE=false and sk_test key exists
- UI displays test object IDs

Acceptance criteria:
- Mock path works by default.
- No live mode path exists unless explicitly disabled by code guards.
- Revenue ledger entry is recorded after simulated/test payment.
- Tests pass.
```

### `/goal` 8 — Hermes + Policy Presentation Polish

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Make the Hermes-style orchestration and policy guardrails clear in the demo UI.

Constraints:
- Do not connect to production Hermes.
- Local adapter must be honest and clearly named.
- Do not claim real NemoClaw unless actually integrated.

Deliverables:
- hermes_adapter.py local skill-call wrapper
- Skill-call events in DB and UI timeline
- Policy guardrail panel with spend cap, margin floor, vendor allowlist, blocked vendor, payment-before-spend rule
- UI labels for Hermes Orchestrator, Stripe Skill, Policy Guardrail, Agent Work

Acceptance criteria:
- Timeline makes the stack legible to judges.
- Policy panel clearly explains why $750 was blocked.
- No production endpoints are required.
```

### `/goal` 9 — Final Polish + Submission Prep

```text
/goal
Repo: /home/ascabrya/dev/scalex-demo

Objective:
Polish ScaleX for recording and submission.

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
- Demo can be run and recorded in under 3 minutes.
- README clearly says test/sandbox only.
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

> Service businesses do not need an AI CEO. They need an AI operator that can turn jobs into revenue without losing margin.

### 0:10–0:20

> This is ScaleX: profit-aware agent operations for service businesses.

### 0:20–0:35

Show prompt/job:

```text
Onboard Harbor Auto Care for a $1,200 brake campaign.
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
Payment received / simulated paid
Revenue booked: $1,200
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
Stripe test/mock invoice appears.
Policy approves safe spend.
Policy blocks unsafe spend.
Agents produce client-ready deliverables.
Final report shows correct revenue/spend/profit/margin.
No live keys, real client data, or production integrations exist.
Demo can be recorded in under 3 minutes.
Repo is clean enough to publish on GitHub.
```

---

## 21. Stretch Only After MVP

Only do these after the core demo is stable:

```text
Real Stripe test-mode invoice object creation
Real NemoClaw adapter
Real Hermes test/sandbox integration
Report export button
Animated event replay
Public deployment
```

Do not do these for MVP:

```text
Live $1 proof
Real customer onboarding
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
ScaleX gets paid in Stripe test mode.
ScaleX protects margin with policy.
ScaleX coordinates agents.
ScaleX delivers work.
ScaleX reports profit.
```
