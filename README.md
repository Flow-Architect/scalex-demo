# ScaleX

ScaleX is a sandbox hackathon demo for profit-aware agent operations for service businesses.

Submission title: **ScaleX: Profit-Aware Agent Operations for Service Businesses**

The demo thesis is simple: a service business should be able to give an AI operator a paid job, a budget, and a margin floor, then see the operator invoice, control spend, coordinate work, and report profit without risking live money or production systems.

## Demo Scope

The locked demo scenario uses fake data only:

- Client: Harbor Auto Care
- Job: 30-day brake service campaign
- Invoice: $1,200
- Spend cap: $300
- Margin floor: 50%
- Approved spend: $89 Local Ads API and $98 Design Asset Pack
- Blocked spend: $750 Premium Automation Suite
- Target report: $1,200 revenue, $187 approved spend, $1,013 gross profit, about 84.4% margin

## Safety Boundary

ScaleX is not production software. It must stay local and sandbox-safe.

- No live Stripe keys.
- No live payments.
- No real client data.
- No production Hermes, Prometheus, OpenClaw, Recall, or xScaleOS connections.
- Stripe is mock/test mode only.
- Policy enforcement starts as a local policy engine.
- Hermes is represented by a local Hermes-style orchestration adapter unless a safe test integration is later implemented and documented.

## Current Scaffold

This repository currently contains the project structure, configuration placeholders, demo data, policy file, backend skeleton, frontend skeleton, and helper scripts. The working backend ledger, policy engine, demo runner, and dashboard are planned in later goals.

## Local Setup Placeholder

After the backend and frontend are implemented, the intended local flow is:

```bash
cp .env.example .env
./scripts/setup.sh
./scripts/dev.sh
```

Run checks with:

```bash
./scripts/test.sh
```

Reset the demo state with:

```bash
./scripts/reset-demo.sh
```

These commands are local-only. They must not use live Stripe mode or production service credentials.

## Core Demo Loop

```text
Job Intake
-> Margin Plan
-> Stripe Test Invoice or Mock Stripe Event
-> Payment Simulation
-> Policy-Gated Spend
-> Agent Work
-> Profit Report
```
