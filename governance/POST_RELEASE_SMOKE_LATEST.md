# Post-release Smoke Report (latest)

Generated at: 2026-04-19T23:24:41.242Z
Verdict: **GO**

## Runtime commands

| Step | Status | Duration (ms) | Command |
| --- | --- | ---: | --- |
| server-start | OK | 1132 | `npm run server:start` |
| server-health | OK | 1260 | `npm run server:health` |
| server-stop | OK | 651 | `npm run server:stop` |

## HTTP checks

| Check | Expected | Actual | Status | Details |
| --- | ---: | ---: | --- | --- |
| GET /health | 200 | 200 | PASS | status=healthy |
| POST /aggregates invalid payload | 400 | 400 | PASS | DTO guard active |

