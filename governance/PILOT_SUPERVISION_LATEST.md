# Pilot Supervision Cycle (latest)

Generated at: 2026-04-19T23:24:46.895Z
Verdict: **GO**

| Step | Status | Duration (ms) | Command |
| --- | --- | ---: | --- |
| Start server | OK | 1178 | `npm run server:start` |
| Health check | OK | 1681 | `npm run server:health` |
| DB connectivity | OK | 825 | `npm run db:check` |
| KPI refresh | OK | 666 | `npm run kpi:exploitation` |
| SLO refresh | OK | 670 | `npm run observability:slo` |

