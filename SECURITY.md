# Security Policy

ScaleX is a local product prototype for governed client-operations demos. It is not production
software and should not be deployed with real client data, live-money payment authority, production
identity, or production system access.

## Reporting Issues

For this private hackathon-stage repo, report security issues directly to the repository owner.
Do not open public issues containing secrets, tokens, private URLs, raw logs, uploaded files, or
customer data.

## Supported Boundary

- Judge Demo Mode is the default and works without secrets.
- Full Proof Mode is local-only and must use ignored `.env` values.
- Stripe live-money execution is not implemented.
- Verified Live Mode is future-only.
- Telegram approval and MCP server access are not implemented.
- Real client data, PHI, payroll records, production auth, production Hermes, production
  Prometheus, homelab OpenClaw, and Recall memory are out of scope.

## Secret Handling

Never commit `.env`, API keys, provider tokens, Stripe secrets, auth cookies, session secrets,
raw credential headers, SQLite databases, uploaded real files, recordings, logs, virtual
environments, `node_modules`, or build artifacts.
