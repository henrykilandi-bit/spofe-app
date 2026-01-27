# ✅ FK CASCADE SECURITY FIX - DEPLOYMENT CHECKLIST

## 📋 PRE-DEPLOYMENT CHECKLIST

Use this checklist to ensure everything is ready before deploying the FK CASCADE security fix.

---

## ✅ FILES & SETUP

### Code Files Created
- [ ] `src/config/foreign-key-policy.js` (450 lines) - FK classification
- [ ] `src/database/migrations/20260123001-fix-dangerous-fk-constraints.js` (300 lines) - Migration
- [ ] `src/services/safe-deletion.service.js` (400 lines) - Safe deletion service
- [ ] `src/middleware/fk-protection.middleware.js` (300 lines) - Protection middleware

### Audit Scripts Created
- [ ] `scripts/audit-foreign-keys.js` (250 lines) - FK audit
- [ ] `scripts/analyze-cascade-risk.js` (300 lines) - Risk analysis
- [ ] `scripts/check-fk-integrity.js` (300 lines) - Integrity check

### Documentation Created
- [ ] `FK_CASCADE_README.md` - Quick start guide
- [ ] `FK_CASCADE_SOLUTION_SUMMARY.md` - Technical architecture
- [ ] `FK_CASCADE_EXECUTION_GUIDE.md` - Step-by-step guide
- [ ] `FK_CASCADE_IMPLEMENTATION_SUMMARY.md` - Deliverables
- [ ] `FK_CASCADE_COMMANDS.md` - Command reference
- [ ] `FK_CASCADE_INDEX.md` - Navigation guide
- [ ] This file: `FK_CASCADE_DEPLOYMENT_CHECKLIST.md`

### Package.json Updated
- [ ] `npm run db:audit:foreign-keys` - Audit FK constraints
- [ ] `npm run db:analyze:cascade:risk` - Analyze CASCADE risk
- [ ] `npm run db:check:integrity` - Check FK integrity
- [ ] `npm run fk:safety:full` - Run all audits
- [ ] `npm run fk:migrate` - Apply migration
- [ ] `npm run fk:migrate:undo` - Rollback migration
- [ ] `npm run fk:verify` - Verify protection

---

## 🔍 PHASE 0: PREPARATION

### Environment Check
- [ ] Development machine: Node.js v18+ installed
- [ ] MySQL 8.0+ running and accessible
- [ ] Database connection credentials available
- [ ] `cascade/src/config/database.js` configured correctly
- [ ] `.env` file has `DB_HOST`, `DB_USER`, `DB_PASSWORD`

### Repository Status
- [ ] All local changes committed (or stashed)
- [ ] Latest code pulled from repository
- [ ] Branch correct (master/main)
- [ ] No uncommitted migrations
- [ ] Git clean: `git status` shows clean working directory

### Application Status
- [ ] Backend running: `npm run start:protected`
- [ ] Database accessible: `npm run db:verify`
- [ ] Health check passing: `npm run health`
- [ ] No pending errors in logs

### Team Coordination
- [ ] Stakeholders notified of planned changes
- [ ] Deployment window scheduled
- [ ] Backup procedure confirmed
- [ ] Rollback procedure understood
- [ ] Support team on standby

---

## 💾 PHASE 1: BACKUP (CRITICAL)

### Create Database Backup

```bash
# Command:
cd cascade
mysqldump -u root -p spofe_v2_1 > ../backup_before_fk_fix_$(date +%Y%m%d_%H%M%S).sql
```

- [ ] Backup command executed without errors
- [ ] Backup file created: `backup_before_fk_fix_*.sql`
- [ ] Backup size > 1 MB (verify: `ls -lh ../backup_*.sql`)
- [ ] Backup file readable: `file ../backup_*.sql`
- [ ] Test restore possible (at least try to read first line)

### Backup Verification

```bash
# Verify backup contains data:
head -20 ../backup_*.sql | grep -q "CREATE TABLE"
echo "Backup valid: $?"  # Should return 0
```

- [ ] Backup contains SQL CREATE TABLE statements
- [ ] Backup contains INSERT data
- [ ] Backup date/time recorded
- [ ] Backup stored in secure location
- [ ] Backup copied to remote location (optional but recommended)

### Backup Documentation

- [ ] Backup filename noted in deployment log
- [ ] Backup location documented
- [ ] Backup size recorded
- [ ] Restore procedure verified
- [ ] Team notified of backup creation

---

## 📊 PHASE 2: AUDIT & ANALYSIS

### Run Audit Scripts

```bash
cd cascade
npm run db:audit:foreign-keys
npm run db:analyze:cascade:risk
npm run fk:verify
```

- [ ] `npm run db:audit:foreign-keys` completes successfully
- [ ] Output shows 4 CASCADE constraints identified:
  - [ ] `compagnies.groupe_id → CASCADE`
  - [ ] `charts_of_accounts.compagnie_id → CASCADE`
  - [ ] `journal_entries.compagnie_id → CASCADE`
  - [ ] `fiscal_years.compagnie_id → CASCADE`

### Analyze Risk

- [ ] `npm run db:analyze:cascade:risk` completes successfully
- [ ] Output shows "CATASTROPHIQUE" impact for each FK
- [ ] Records at risk calculated and documented
- [ ] Risk assessment reviewed by DBA
- [ ] Mitigation plan confirmed

### Pre-Migration Verification

- [ ] `npm run fk:verify` shows current state before changes
- [ ] No previous RESTRICT constraints found (all CASCADE)
- [ ] Scripts complete with exit code 0
- [ ] Logs captured for audit trail
- [ ] Results approved for proceeding

---

## 🔧 PHASE 3: MIGRATION EXECUTION

### Pre-Migration Backup

- [ ] Second backup created (just before migration)
- [ ] Backup filename: `backup_before_migration_$(date +%s).sql`
- [ ] Backup verified > 1 MB

### Execute Migration

```bash
cd cascade
npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints
```

- [ ] Migration command executed without errors
- [ ] Exit code = 0 (success)
- [ ] Output shows all 5 steps completed:
  - [ ] Remove old `compagnies.groupe_id` CASCADE
  - [ ] Add new `compagnies.groupe_id` RESTRICT
  - [ ] Remove old `charts_of_accounts.compagnie_id` CASCADE
  - [ ] Add new `charts_of_accounts.compagnie_id` RESTRICT
  - [ ] Remove old `journal_entries.compagnie_id` CASCADE
  - [ ] Add new `journal_entries.compagnie_id` RESTRICT
  - [ ] Remove old `fiscal_years.compagnie_id` CASCADE
  - [ ] Add new `fiscal_years.compagnie_id` RESTRICT
  - [ ] Set `audit_trails.user_id` to SET NULL

### Migration Verification

```bash
npx sequelize-cli db:migrate:status
```

- [ ] Migration status shows as "up" for 20260123001
- [ ] All previous migrations also show "up"
- [ ] No migration errors in logs
- [ ] Database connection still working

### Post-Migration Checks

- [ ] Application still running without errors
- [ ] Health check passes: `npm run health`
- [ ] No new errors in logs
- [ ] Database accessible and responding

---

## ✅ PHASE 4: INTEGRITY VERIFICATION

### Verify New Constraints

```bash
npm run db:check:integrity
```

- [ ] Script completes successfully
- [ ] Exit code = 0 (all checks passed)
- [ ] Output shows:
  - [ ] ✅ `compagnies.groupe_id → RESTRICT`
  - [ ] ✅ `charts_of_accounts.compagnie_id → RESTRICT`
  - [ ] ✅ `journal_entries.compagnie_id → RESTRICT`
  - [ ] ✅ `fiscal_years.compagnie_id → RESTRICT`
  - [ ] ✅ `audit_trails.user_id → SET NULL`

### RESTRICT Functionality Test

- [ ] Test 1: System tries to delete group with companies
  - [ ] Expected: Error - Foreign key constraint failed
  - [ ] Result: ✅ RESTRICT working correctly
- [ ] Test 2: System tries to delete company with entries
  - [ ] Expected: Error - FK constraint blocks deletion
  - [ ] Result: ✅ RESTRICT working correctly

### Database Verification

```bash
# Manual SQL verification:
mysql> SELECT CONSTRAINT_NAME, DELETE_RULE
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE TABLE_NAME IN ('compagnies', 'charts_of_accounts', 'journal_entries', 'fiscal_years');
```

- [ ] All 4 constraints show `DELETE_RULE = RESTRICT`
- [ ] No CASCADE constraints remaining on critical tables
- [ ] `audit_trails.user_id` shows `DELETE_RULE = SET NULL`

---

## 🔌 PHASE 5: MIDDLEWARE INTEGRATION

### Update Application Code

- [ ] File: `cascade/src/app.js` reviewed
- [ ] Added imports:
  ```javascript
  import SafeDeletionService from './services/safe-deletion.service.js';
  import { allDeletionProtections } from './middleware/fk-protection.middleware.js';
  ```
- [ ] Added middleware registration:
  ```javascript
  app.use('/api/admin/delete', allDeletionProtections);
  ```
- [ ] No syntax errors in app.js
- [ ] ESLint check passes: `npm run lint`

### Restart Application

- [ ] Stop current application: `npm run stop-server`
- [ ] Clear any cached modules (if needed)
- [ ] Start application: `npm run start:protected`
- [ ] Wait for startup messages
- [ ] Check that app started without errors

### Verify Middleware Active

```bash
npm run health
```

- [ ] Application health check returns 200 OK
- [ ] All services reported as healthy
- [ ] Database connection confirmed
- [ ] No errors in startup logs

### Test Middleware Protection

```bash
# Test: Delete without authentication
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1
```

- [ ] Request returns 401 Unauthorized
- [ ] Error message: "Unauthorized" or similar
- [ ] Middleware intercepted request correctly

---

## 🧪 PHASE 6: TESTING

### Unit Tests

```bash
npm test -- cascade/tests/fk-protection.test.js
```

- [ ] All unit tests pass (no failures)
- [ ] Test count: 5+ tests executed
- [ ] Coverage: > 80% (if available)
- [ ] No pending/skipped tests

### Integration Tests

```bash
npm run test:integration -- --grep "fk"
```

- [ ] All integration tests pass
- [ ] Test scenarios covered:
  - [ ] Missing authentication → 401
  - [ ] Missing admin role → 403
  - [ ] Missing deletion reason → 400
  - [ ] FK constraint blocks deletion → 409
  - [ ] Safe deletion succeeds → 200
  - [ ] Audit trail created → verified
  - [ ] Rate limiting works → 429 after 10/min

### Manual API Testing

#### Test 1: Authentication Required
```bash
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1
```
- [ ] Returns 401 Unauthorized

#### Test 2: Authorization Required
```bash
export USER_TOKEN="[non-admin-jwt]"
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $USER_TOKEN"
```
- [ ] Returns 403 Forbidden

#### Test 3: Deletion Reason Required
```bash
export ADMIN_TOKEN="[admin-jwt]"
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}'
```
- [ ] Returns 400 Bad Request

#### Test 4: RESTRICT Blocks Deletion
```bash
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason":"Testing"}'
```
- [ ] Returns 409 Conflict
- [ ] Error message explains why deletion blocked

#### Test 5: Rate Limiting
```bash
# Make 15 requests in quick succession
# Requests 1-10: Success or 409
# Requests 11-15: 429 Too Many Requests
```
- [ ] Rate limiting works correctly
- [ ] Counter resets after 1 minute
- [ ] Appropriate error message returned

### Load Testing (Optional)
- [ ] Application handles normal traffic after changes
- [ ] No performance degradation observed
- [ ] Memory usage normal
- [ ] CPU usage normal

---

## 📊 PHASE 7: FINAL VALIDATION

### Complete Audit Run

```bash
npm run fk:safety:full
```

- [ ] All audit scripts pass
- [ ] No new warnings or errors
- [ ] All constraints verified RESTRICT
- [ ] Test deletion attempts blocked correctly

### Application Functionality

- [ ] Normal login/authentication works
- [ ] User can access dashboard
- [ ] Reports generate correctly
- [ ] Data export works
- [ ] Other features unaffected

### Compliance Verification

- [ ] OHADA requirements met:
  - [ ] Chart of accounts protected (RESTRICT)
  - [ ] Fiscal years protected (RESTRICT)
  - [ ] Transaction history immutable
  
- [ ] CNIL requirements met:
  - [ ] User audit fields use SET NULL
  - [ ] Deletion reason recorded
  - [ ] Audit trail preserved
  
- [ ] SOX requirements met:
  - [ ] No physical deletion of business data
  - [ ] Complete deletion history
  - [ ] Controls cannot be bypassed

### Documentation Updated

- [ ] Deployment log created
- [ ] Changes documented
- [ ] Team notified
- [ ] Runbook updated
- [ ] Disaster recovery updated

---

## 📝 SIGN-OFF

### Deployment Approval

- [ ] **DBA**: `_________________` Date: `__________`
  - Confirms: All database constraints verified

- [ ] **DevOps**: `_________________` Date: `__________`
  - Confirms: Application deployed successfully

- [ ] **QA**: `_________________` Date: `__________`
  - Confirms: All tests passed

- [ ] **Security**: `_________________` Date: `__________`
  - Confirms: Compliance requirements met

- [ ] **Manager**: `_________________` Date: `__________`
  - Confirms: Ready for production

---

## 🎉 POST-DEPLOYMENT

### Monitoring Setup

- [ ] Error logs monitored
- [ ] Performance metrics tracked
- [ ] User reports tracked
- [ ] Alert thresholds set

### Backup Retention

- [ ] Pre-migration backup: Stored securely
- [ ] Post-deployment backup: Created
- [ ] Retention policy applied
- [ ] Disaster recovery tested

### Documentation Handoff

- [ ] Team trained on new constraints
- [ ] Support team briefed
- [ ] Runbook updated
- [ ] Rollback procedure documented

### Success Criteria

✅ **DEPLOYMENT SUCCESSFUL IF:**
- All 4 FK constraints are RESTRICT
- No CASCADE remains on critical tables
- Deletion protection middleware active
- Audit trail recording deletions
- All tests passing
- No errors in logs
- OHADA/CNIL/SOX compliance met
- Team informed and trained

---

## ⏮️ ROLLBACK PLAN (If Needed)

### When to Rollback
- [ ] Critical error preventing normal operations
- [ ] Data loss observed
- [ ] Performance degradation unacceptable
- [ ] Security issues discovered

### Rollback Steps

```bash
# 1. Stop application
npm run stop-server

# 2. Undo migration
cd cascade
npx sequelize-cli db:migrate:undo --name 20260123001-fix-dangerous-fk-constraints

# 3. Restart application
npm run start:protected

# 4. Verify old state
npm run db:audit:foreign-keys
```

### Rollback Sign-Off

- [ ] Rollback executed successfully
- [ ] Database returned to previous state
- [ ] Application functioning normally
- [ ] Team notified
- [ ] Post-mortem scheduled

---

## 📞 SUPPORT CONTACTS

In case of issues:

- **DBA Lead:** _________________________ Phone: __________
- **DevOps Lead:** _______________________ Phone: __________
- **Application Owner:** _________________ Phone: __________
- **Security Team:** _____________________ Phone: __________

---

## 📋 DEPLOYMENT LOG

**Deployment Date:** _____________________  
**Deployment Window:** _____________________  
**Deployed By:** _____________________  
**Approved By:** _____________________  

**Pre-Deployment Status:**
- Database Size: _______ MB
- Record Count (compagnies): _______
- Record Count (entries): _______
- Backup File: _______

**Migration Time:** _______ minutes  
**Testing Time:** _______ minutes  
**Total Deployment Time:** _______ minutes  

**Issues Encountered:** None ☐ Yes ☐
- If yes, describe: _________________________________________________

**Resolution:** _______________________________________________________

**Post-Deployment Status:** ✅ SUCCESSFUL

**Next Review Date:** _______________________

---

## ✅ FINAL SIGN-OFF

By signing below, all parties confirm that the FK CASCADE security fix has been successfully deployed and all verification steps have been completed.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DBA | _____________ | _____________ | _____________ |
| DevOps | _____________ | _____________ | _____________ |
| QA Lead | _____________ | _____________ | _____________ |
| Security Lead | _____________ | _____________ | _____________ |
| Project Manager | _____________ | _____________ | _____________ |

---

**Document:** Deployment Checklist  
**Version:** 1.0  
**Status:** Ready for Use  
**Last Updated:** 2026-01-23

🔒 **Deployment Checklist Complete!**
