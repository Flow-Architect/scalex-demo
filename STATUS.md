# STATUS - ScaleX

Last updated: 2026-06-19

## Verified current state

- Project folder exists at /home/ascabrya/dev/scalex-demo.
- Last completed implementation goal: Goal 6 - isolated Hermes Agent skill-backed orchestration.
- ScaleX is a working product-style prototype for profit-aware agent operations in service workflows.
- Harbor Fleet Services remains the synthetic sample workflow.
- Locked economics remain unchanged:
  - revenue_cents: 120000
  - approved_spend_cents: 18700
  - blocked_spend_cents: 75000
  - gross_profit_cents: 101300
  - actual_margin_percent: 84.4
  - policy_violations: 0
- FastAPI backend exposes the existing demo endpoints plus Hermes/orchestration state through `GET /api/demo/state` and `POST /api/demo/run`.
- `.env.example` contains product-mode isolated Hermes defaults:
  - `HERMES_MODE=isolated_cli`
  - `HERMES_CLI_PATH=/home/ascabrya/.scalex-hermes/hermes-agent/venv/bin/hermes`
  - `HERMES_HOME=/home/ascabrya/.scalex-hermes/home`
  - `HERMES_MODEL=gpt-5.5`
  - `HERMES_PROVIDER=openai-codex`
  - `HERMES_REQUIRE_REAL=true`
  - `HERMES_TEST_MODE=false`
  - `HERMES_SKILL_NAME=scalex-operator`
  - `HERMES_TOOLSETS=skills`
- Repo-owned Hermes skill source exists at `hermes/skills/scalex-operator/SKILL.md`.
- The backend syncs that skill into the isolated Hermes home for product-mode `--skills scalex-operator` runs if needed.
- Product-mode Hermes call uses:
  - configured `HERMES_CLI_PATH`
  - configured isolated `HERMES_HOME`
  - `--ignore-rules`
  - `--toolsets skills`
  - `--skills scalex-operator`
  - `--provider openai-codex`
  - `-m gpt-5.5`
  - `-z` / oneshot prompt
- Hermes is used only for planning and proposed orchestration.
- ScaleX code remains the authority for Stripe-shaped records, policy checks, ledger writes, agent outputs, and reports.
- If Hermes fails in product mode, `POST /api/demo/run` returns a visible `hermes_failed` state with the planning error instead of pretending the run succeeded.
- Tests default to `HERMES_TEST_MODE=true`; automated tests do not require real Hermes auth.
- SQLite schema now includes:
  - `planning_runs`
  - `orchestration_calls`
- API state now includes:
  - `planning_runs`
  - `planning_run`
  - `orchestration_calls`
  - `hermes`
- Frontend dashboard includes a Hermes Brain / Orchestration panel showing:
  - Hermes mode
  - `used_real_hermes`
  - provider/model
  - skill/tool context
  - planning result
  - proposed sequence
  - ordered recorded tool calls
  - visible Hermes error state if present
- Verified on 2026-06-19:
  - Inspected isolated Hermes `tools --help`, `skills --help`, `profile --help`, root `--help`, and `-z --help` behavior.
  - `hermes tools list --platform cli` showed broad default CLI toolsets; ScaleX product runs constrain the invocation to `--toolsets skills`.
  - Synced `scalex-operator` skill into `/home/ascabrya/.scalex-hermes/home/skills/scalex-operator`.
  - Started local product run with `HERMES_TEST_MODE=false` and `HERMES_REQUIRE_REAL=true`.
  - `POST /api/demo/run` returned HTTP 200 and `status=completed`.
  - Product-mode response showed `used_real_hermes=true`, `provider=openai-codex`, `model=gpt-5.5`, `skill_name=scalex-operator`, and `toolsets_used=["skills"]`.
  - Product-mode response included one `planning_run` with `source=real_hermes`.
  - Product-mode response included 17 ordered `orchestration_calls`.
  - Headless Chrome verified the dashboard at `http://127.0.0.1:5174` rendered:
    - `used_real_hermes=true`
    - `openai-codex / gpt-5.5`
    - `scalex-operator / skills`
    - `17 calls`
    - revenue cents 120000
    - approved spend cents 18700
    - gross profit cents 101300
    - actual margin 84.4%
  - `./scripts/test.sh` passed with 30 backend tests and a successful Vite production build.

## Not yet built

- Real Stripe test-mode customer/invoice/payment-link/payment objects through the orchestration layer.
- NemoClaw or external policy safety adapter.
- Demo recording and final submission assets.

## Not yet verified

- Fresh-clone setup on a clean machine.
- Manual recorded browser walkthrough.
- Screenshot/video capture quality for final submission.

## Deferred / revisit

- Stripe steps still use clearly labeled local mock/test-style records for Goal 6.
- Local policy engine remains the spend authority until a safe NemoClaw/policy safety adapter is explicitly wired.
- Production Hermes, Windows Hermes config, Prometheus production data, homelab/OpenClaw, Recall memory, public deployment, live money, production data, and real customer workflows remain out of scope.
- npm install previously reported one low-severity advisory in the frontend dependency tree; dependency audit remediation remains deferred unless it affects demo safety or build reliability.

## Current priority

Goal 7 - Stripe Test Mode through the orchestration layer.
