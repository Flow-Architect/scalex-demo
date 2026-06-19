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
- Main goal: working product-style prototype with a real local audit ledger and test/sandbox integrations where safe.
- Mock/fallback mode is for reliability and safety, not the preferred final product story.
- Real test/sandbox integrations are the target for Hermes, Stripe, and policy safety.
- Host machine: Fedora 44 laptop.
- Repo path: /home/ascabrya/dev/scalex-demo.

## Safety decisions

- Stripe live mode is out of scope.
- Real client data is out of scope.
- Production Prometheus/Hermes data is out of scope.
- Windows Hermes dependency is out of scope.
- Homelab/OpenClaw dependency is out of scope.
- Real 30-day campaign execution is out of scope.
- Public deployment is optional and not required for MVP.
- No live money or real client data.

## Technical decisions

- Use SQLite for a real local audit ledger.
- Use FastAPI for backend.
- Use Vite React TypeScript for frontend.
- Use deterministic seeded outputs before live AI calls.
- Use the ScaleX-isolated laptop Hermes install for Hermes brain/orchestration work:
  - code: /home/ascabrya/.scalex-hermes/hermes-agent
  - home/config/auth: /home/ascabrya/.scalex-hermes/home
- GPT-5.5 Auth should run through isolated Hermes for planning/reasoning, with deterministic fallback.
- Stripe test mode through the orchestration layer is the target payment proof, with local fallback.
- NemoClaw or a policy safety layer is the target spend governance path, with the local policy engine as fallback.
