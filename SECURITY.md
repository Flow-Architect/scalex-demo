# Security Policy

ScaleX is a local hackathon prototype. It is not production software and should not be deployed
with live-money authority, real customer data, production identity, production Hermes access, or
production system credentials.

## Reporting Issues

Do not report real secrets publicly. If you find a vulnerability, open a GitHub issue without
including credentials, private URLs, raw logs, uploaded files, customer data, or exploit details
that would expose users. If a private maintainer contact is available in the repository settings,
use that for sensitive reports.

## Demo Boundaries

- Judge Demo Mode is the default and works without secrets.
- Stripe live-money execution is not implemented.
- Verified Live Mode is future-only and disabled.
- Telegram approval and MCP server access are not implemented.
- Real customer data, PHI, payroll records, production auth, production Hermes, production
  monitoring systems, and private memory systems are out of scope.

## Secret Handling

Never commit `.env`, API keys, provider tokens, Stripe secrets, auth cookies, session secrets,
raw credential headers, SQLite databases, uploaded real files, recordings, logs, virtual
environments, `node_modules`, or build artifacts.

Do not test this demo against real Stripe live systems or production customer workflows.
