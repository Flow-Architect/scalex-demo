# DECISIONS — ScaleX

## Locked decisions

- Product name: ScaleX.
- Product type: functional product prototype.
- Target user: service teams running revenue-backed service workflows.
- Sample workflow client: Harbor Fleet Services.
- Sample workflow business type: regional fleet maintenance provider.
- Sample workflow job: 30-day fleet brake inspection campaign.
- Sample workflow invoice amount: $1,200.
- Sample workflow spend cap: $300.
- Sample workflow margin floor: 50%.
- Approved spend requests: $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend request: $750 Premium Automation Suite.
- Final target numbers: $1,200 revenue, $187 approved spend, $1,013 gross profit, about 84.4% margin.
- Main goal: live working product-style prototype with real integrations in the appropriate mode.
- Product mode uses real integrations first: isolated Hermes Agent, Stripe test mode for Goal 7,
  real policy safety integration when safe, and SQLite audit records.
- Mock/fallback/test-double paths are for automated tests, CI, local offline development, or
  explicitly labeled diagnostics only.
- Real integration failures surface visible error states; product mode must not silently fall back
  and pretend the run succeeded.
- Stripe test mode is the normal development/demo payment integration path.
- ScaleX will be live-money capable in the future only through Verified Live Mode.
- Verified Live Mode is the only allowed future path for live-money payment actions.
- Host machine: Fedora 44 laptop.
- Repo path: /home/ascabrya/dev/scalex-demo.

## Safety decisions

- Stripe live-money execution is not implemented in Goal 7.
- Stripe live-money execution may be added later only through Verified Live Mode.
- Real client data is out of scope.
- Production Prometheus/Hermes data is out of scope.
- Windows Hermes dependency is out of scope.
- Homelab/OpenClaw dependency is out of scope.
- Real 30-day campaign execution is out of scope.
- Public deployment is optional and not required for MVP.
- No live money in Goal 7 and no real client data.

## Technical decisions

- Use SQLite for a real local audit ledger.
- Use FastAPI for backend.
- Use Vite React TypeScript for frontend.
- Use deterministic seeded outputs before live AI calls.
- Use the ScaleX-isolated laptop Hermes install for Hermes brain/orchestration work:
  - code: /home/ascabrya/.scalex-hermes/hermes-agent
  - home/config/auth: /home/ascabrya/.scalex-hermes/home
- GPT-5.5 Auth runs through isolated Hermes for product-mode planning/reasoning, with deterministic fallback only for tests or `HERMES_TEST_MODE=true`.
- ScaleX's Hermes skill source lives in the repo at hermes/skills/scalex-operator/SKILL.md and is synced into the isolated Hermes home for product-mode `--skills scalex-operator` runs.
- Hermes cannot directly execute live-money actions.
- ScaleX code enforces verification, mode checks, caps, allowlists, confirmations, and audit records.
- Stripe test mode through the orchestration layer is the Goal 7 payment proof; test doubles are not product mode.
- Goal 7 rejects live Stripe keys and any non-`sk_test_` key for Stripe test mode.
- NemoClaw or a NemoClaw-style policy safety adapter is the Goal 8 spend-governance target.
- The local policy engine remains deterministic safety/test support until Goal 8, but is not the final product target if a real safety adapter is safely available.
- No secrets are committed.
