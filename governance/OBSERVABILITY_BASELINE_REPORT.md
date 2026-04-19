# Observability Baseline Report

Generated at: 2026-04-19T17:13:57.768Z

## Scope

- Server readiness (`server:start` + `server:health`)
- Database connectivity (`db:check`)
- KPI exploitation generation (`kpi:exploitation`)

## KPI Snapshot

- Availability: 100.00% (target >= 99%) -> GO
- check:repo green rate: 100.00% (target >= 90%) -> GO
- MTTR N1: n/a (target < 24h) -> GO
- Weekly backup + restore smoke: GO

## Decision

- Observability baseline: **GO**
- Note: this baseline validates signal production; alert routing/on-call wiring remains managed in infra tooling.

