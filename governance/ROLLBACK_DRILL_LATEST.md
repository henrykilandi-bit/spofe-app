# Rollback Drill Report (latest)

Generated at: 2026-04-19T22:27:45.999Z
Verdict: **GO**

## Inputs

- staging env: C:\Users\henry\Desktop\SPOFE-APP VERS 1.0\.env.staging
- production env: C:\Users\henry\Desktop\SPOFE-APP VERS 1.0\.env.production
- mirror report: C:\Users\henry\Desktop\SPOFE-APP VERS 1.0\governance\PREPROD_MIRROR_REAL_LATEST.json

## Steps

| Step | Status | Duration (ms) | Command |
| --- | --- | ---: | --- |
| preprod-mirror-check | OK | 141 | `node tools/operations/preprod-mirror-check.mjs --staging-env .env.staging --production-env .env.production --report governance/PREPROD_MIRROR_REAL_LATEST.json` |
| db-backup-restore-smoke | OK | 952 | `npm run db:backup:smoke` |
| db-check | OK | 813 | `npm run db:check` |

## Mirror parity summary

- parity status: ok
- warnings: 0
- errors: 0
- fingerprint: 5222f5106abcbae88e87750ffa4adbc7391853f25148c8931ceea44eec330333

## Criteria

- All technical steps must be successful.
- Mirror parity must be `ok` with zero warning and zero error.
- Backup/restore smoke must pass.

