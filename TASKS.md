# TASKS - ScaleX

## Current Priority

Final public-release review and GitHub push prep.

Before pushing:

- Push the latest README visual polish commit if it has not been pushed yet.
- Confirm the GitHub README renders the logo, badges, and screenshots from
  `docs/assets/github/`.
- Review `docs/OPERATOR_GUIDE.md` as the public local-demo runbook.
- Re-run the release checks in `docs/OPEN_SOURCE_AUDIT.md` if more files change.
- Confirm `git status --short` is clean after the final commit.
- Confirm ignored local files such as `.env`, `data/*.db`, `frontend/dist`,
  `frontend/node_modules`, `backend/.venv`, caches, logs, and recordings are not staged.
- Review third-party logo usage and attribution in `docs/ATTRIBUTIONS.md`.

## Do Not Add For This Release

- Telegram approval flow
- Live Stripe or live-money mode
- Production Hermes integration
- Docker/NemoClaw command execution
- Real customer data, PHI, payroll, HR compliance, or tax behavior
- MCP server or external agent access
- New backend mechanics or demo economics changes

## Current Demo Checklist

- README screenshot assets show Dashboard Ready, Governed Run Complete, Evidence Ledger, and
  Connection Hub without terminals, local paths, secrets, or raw logs.
- Dashboard opens with Northstar Dental Group / Client Implementation Launch.
- Pre-run outcome values stay pending or zero until the governed run completes.
- `Start Governed Run` plays the governed-run animation.
- Hermes surfaces preserve the truthfulness boundary: deterministic proof unless runtime evidence
  proves a configured route.
- Connection Hub and Settings preserve the boundary: Hermes proposes; ScaleX governs.
- Evidence Ledger is empty before the run and shows audit rows after completion.
- Completed run shows `$8,500` revenue, `$3,935` cost basis, `$3,200` risk contained, `$4,565`
  protected profit, and `53.7%` protected margin.
- Reset returns outcome and evidence values to pending/zero state.

## Suggested Next Step

Final GitHub push verification and submission packaging.
