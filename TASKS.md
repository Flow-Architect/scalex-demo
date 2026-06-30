# TASKS - ScaleX

## Current Priority

Final release owner review and GitHub push prep.

Before pushing to GitHub:

- Review `docs/OPERATOR_GUIDE.md` as the public local-demo runbook.
- Re-run the release checks in `docs/OPEN_SOURCE_AUDIT.md`.
- Confirm `git status --short` is clean after the final commit.
- Confirm ignored local files such as `.env`, `data/*.db`, `frontend/dist`, `frontend/node_modules`,
  `backend/.venv`, caches, logs, and recordings are not staged.
- Review third-party logo usage and attribution in `docs/ATTRIBUTIONS.md`.
- Review README quickstart on a clean checkout if time allows.

## Do Not Add For This Release

- Telegram approval flow
- Live Stripe or live-money mode
- Production Hermes integration
- Docker/NemoClaw command execution
- Real customer data, PHI, payroll, HR compliance, or tax behavior
- MCP server or external agent access
- New backend mechanics or demo economics changes

## Current Demo Checklist

- Dashboard opens with Northstar Dental Group / Client Implementation Launch.
- Pre-run outcome values stay pending or zero until the governed run completes.
- `Start Governed Run` plays the readable governed-run animation.
- Hermes surfaces show a Nemotron 3 Ultra-capable route in Judge Demo Mode.
- Connection Hub and Settings preserve the boundary: Hermes proposes; ScaleX governs.
- Evidence Ledger is empty before the run and shows audit rows after completion.
- Completed run shows $8,500 revenue, $3,935 cost basis, $3,200 risk contained, $4,565 protected
  profit, and 53.7% protected margin.
- Reset returns outcome and evidence values to pending/zero state.

## Suggested Next Goal

Goal 9D - final clean-checkout smoke and GitHub push.
