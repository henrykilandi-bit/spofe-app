# Pilot Supervision Cycle (latest)

Generated at: 2026-04-19T23:16:24.394Z
Verdict: **GO**

| Step | Status | Duration (ms) | Command |
| --- | --- | ---: | --- |
| Start server | OK | 1065 | `npm run server:start` |
| Health check | OK | 1171 | `npm run server:health` |
| DB connectivity | OK | 787 | `npm run db:check` |
| KPI refresh | OK | 647 | `npm run kpi:exploitation` |
| SLO refresh | OK | 845 | `npm run observability:slo` |

