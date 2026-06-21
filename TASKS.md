# TASKS - ScaleX

## Current priority

Goal 8 - NemoClaw / policy safety integration and presentation.

## Next recommended goal

Run Codex /goal 8 - make spend governance clear and, if safe, wire a real NemoClaw-compatible or NemoClaw-style safety adapter while keeping local policy support for tests and diagnostics.

## Why this is next

Goal 6 is complete: product mode uses the real ScaleX-isolated Hermes Agent with the `scalex-operator` skill and `skills` toolset.

Goal 7 is complete for real Stripe test-mode invoice creation/finalization. Product mode now proves real isolated Hermes plus real Stripe test-mode invoice flow: `used_real_hermes=True`, `used_real_stripe=True`, `stripe_mode=stripe_test`, `livemode=False`, real `cus_` customer ID, real `in_` invoice ID, hosted invoice URL on `invoice.stripe.com`, `invoice_status=open`, and `paid=False`.

The Stripe test invoice payment remains honestly labeled open/unpaid unless Stripe actually reports `paid=True`. The revenue/profit display remains the compressed-run business result, and final economics stayed at `gross_profit_cents=101300` and `actual_margin_percent=84.4`.

Goal 7.5 is complete for product demo UX/presentation polish. The frontend is now a full-width ScaleX Command Center with a live run pipeline, Hermes brain/orchestration feed, Stripe proof panel, money/profit proof, policy guardrail decisions, and Judge Proof stack section. No backend business logic changed.

Goal 7.6 is complete for judge-ready first-viewport polish. The top of the app now states that ScaleX ran a live AI business workflow, highlights $1,013 protected profit, 84.4% margin, and $750 blocked unsafe spend, shows a first-screen live stack proof strip, and adds staged execution replay cards that animate while `POST /api/demo/run` is in flight and settle on API-backed state after completion. Stripe open/unpaid honesty and NemoClaw Goal 8 labeling are preserved.

The post-Goal 7.6 docs audit is complete in the working tree. README, ROADMAP, docs, `.env.example` comments, STATUS, TASKS, and CHANGELOG now align on Goal 8 next, Goal 9 final submission prep, Goal 7B future Verified Live Mode, real/test/future integration boundaries, Stripe open/unpaid honesty, and NemoClaw not yet real.

Goal 7.7 is complete for product shell UX before Goal 8. ScaleX now has a local prototype auth gate, local/sample onboarding flow, product navigation, a moving Autonomous Workflow Map, run history, audit view, and integrations view. The login gate is local prototype auth, not production enterprise auth. Onboarding is local/sample workflow setup, not full multi-tenant SaaS. No live-money support was added.

The final Goal 7.7 verification and product-doc alignment pass is complete in the working tree. Auth, protected endpoints, onboarding persistence, selected-run behavior, Harbor full-proof output, source-level product shell views, and workflow-map truthfulness were rechecked. The final automated Chrome rerender is blocked locally by crashpad sandbox permissions, so final recording should still be confirmed in a normal browser.

Goal 7.8 is complete in this working tree for functional product workflow usage. ScaleX can now be used from the browser to create/select/delete saved local workflows, load the Harbor sample, start a run for the selected workflow, inspect clickable workflow graph nodes, view persisted run history, load historical run proof by run ID, and review Audit and Settings tabs without terminal output. Workflow configs persist in SQLite, each run appends a unique job/run record, and selected workflow economics drive Stripe amount, policy checks, ledger totals, agent output context, and final report math.

The next product proof gap is safety-governance realism. The local policy engine is deterministic and useful, but Goal 8 should either wire a real safe policy adapter or label the local safety layer honestly while improving the presentation.

## Required outputs for Goal 8

- Keep Hermes planning/proposal authority separate from payment and policy execution.
- Keep Stripe Goal 7 behavior intact:
  - product mode uses real Stripe test mode
  - Stripe invoice payment remains honestly labeled open/unpaid unless actually paid
  - test-double Stripe is tests/CI/diagnostic only
  - no live-money execution
- Investigate whether a safe NemoClaw-compatible or NemoClaw-style adapter can be wired without touching production, homelab/OpenClaw, or real client systems.
- If a real safe adapter is available, route spend checks through it and persist audit records.
- If a real safe adapter is not available, keep the local policy engine but label it clearly as local safety support.
- Preserve deterministic local policy support for automated tests.
- Keep final economics unchanged:
  - $1,200 revenue
  - $187 approved spend
  - $750 blocked spend
  - $1,013 gross profit
  - about 84.4% margin
  - 0 policy violations
- Improve the policy panel and timeline so judges can see:
  - spend cap
  - margin floor
  - payment-before-spend rule
  - vendor allowlist/blocklist
  - why $89 and $98 were approved
  - why $750 was blocked
- Preserve the Goal 7.5 command-center UI and keep NemoClaw status honest until a real safety adapter is wired.
- Preserve the Goal 7.6 judge-ready first viewport, Profit Protected hero, Live Stack Proof strip, staged execution replay, and Stripe open/unpaid honesty.
- Preserve the Goal 7.7 product shell, local prototype auth boundary, onboarding flow, moving workflow map, run history, audit view, and integrations view.
- Preserve the Goal 7.8 functional product workflow:
  - Customers creates/selects/deletes saved local workflows.
  - Active workflow drives `/api/demo/run`.
  - Runs persist as unique SQLite job records.
  - `GET /api/demo/state?run_id=...` inspects historical run proof.
  - Workflow graph nodes remain clickable and show real proof details.
- Preserve the post-Goal 7.8 documentation boundary: functional product prototype, local prototype auth, SQLite-backed local/sample workflow management, selected-workflow runs, persisted run history, real Hermes, real Stripe test mode, SQLite audit ledger, active local policy, NemoClaw next/not yet real, and Verified Live Mode as future live-money hardening.
- Add tests that do not require external policy network calls.
- Run `./scripts/test.sh`.
- Run `git diff --check`.
- Run the live-key grep safety check.
- Update STATUS.md, TASKS.md, and CHANGELOG.md at closeout.

## Required product facts to preserve

- ScaleX product mode is real-integration-first.
- Product-mode integration failures show visible errors instead of silently falling back.
- Mock/fallback/test-double paths are for tests, CI, offline development, or explicitly labeled diagnostics only.
- Harbor Fleet Services remains the sample workflow, not the whole product.
- Auth remains local prototype auth unless a future explicit production auth milestone is defined.
- Workflow/customer management remains local/sample workflow management and not full multi-tenant SaaS.
- Invoice remains $1,200.
- Approved spend remains $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend remains $750 Premium Automation Suite.
- Margin floor remains 50%.
- Hermes plans and proposes orchestration only.
- ScaleX code remains the authority for spend policy, payment actions, ledger writes, and reports.
- SQLite remains the audit ledger.
- Stripe live-money execution is not implemented until a future Verified Live Mode milestone.

## Follow-up hardening milestone

Goal 7B / Production Hardening - Verified Live Mode for future live-money payments.

Verified Live Mode must require explicit config, live-key/test-key separation, operator confirmation phrase, maximum live charge cap, customer allowlist, pre-charge review, policy approval, and SQLite audit records. Hermes may propose a live-money step, but ScaleX code must enforce every safeguard and execute any allowed action.

## Do not work on yet

- Live-money Stripe execution.
- Real client data.
- Public deployment.
- Production Prometheus or production Hermes.
- Windows Hermes config.
- Homelab/OpenClaw.
- Recall memory.
- Complex auth.
- Multi-client dashboard.
- Production packaging.
