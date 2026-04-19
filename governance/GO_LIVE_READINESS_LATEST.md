# Go-Live Readiness Final (latest)

Generated at: 2026-04-19T23:24:47.593Z
Verdict: **GO**

## Commands

| Step | Status | Duration (ms) | Command |
| --- | --- | ---: | --- |
| release-gate | OK | 61351 | `npm run release:gate` |
| post-release-smoke | OK | 3793 | `npm run post-release:smoke` |
| pilot-supervision | OK | 5653 | `npm run pilot:supervision` |
| server-stop-cleanup | OK | 656 | `npm run server:stop` |

## Evidence

| Evidence | Status | Details |
| --- | --- | --- |
| preprod_mirror_real | OK | parityStatus=ok |
| prod_config_check | OK | decision=GO |
| post_release_smoke | OK | verdict=GO |
| pilot_supervision | OK | verdict=GO |

