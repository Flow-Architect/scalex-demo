# DECISIONS — ScaleX

## Locked decisions

- Product name: ScaleX.
- Product type: hackathon demo.
- Target user: service businesses.
- Demo client: Harbor Auto Care.
- Demo job: 30-day brake service campaign.
- Demo invoice amount: $1,200.
- Demo spend cap: $300.
- Demo margin floor: 50%.
- Approved spend requests: $89 Local Ads API and $98 Design Asset Pack.
- Blocked spend request: $750 Premium Automation Suite.
- Final target numbers: $1,200 revenue, $187 approved spend, $1,013 gross profit, about 84.4% margin.
- Main goal: working local demo, not production SaaS.
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

## Technical decisions

- Use SQLite for a real local audit ledger.
- Use FastAPI for backend.
- Use Vite React TypeScript for frontend.
- Use deterministic seeded outputs before live AI calls.
- GPT-5.5 Auth is a stretch integration with fallback.
- Stripe test mode is a stretch integration with mock fallback.
- NemoClaw is optional; local policy engine ships first.
- Hermes-style orchestration adapter ships first; real Hermes only if safe test access exists.
