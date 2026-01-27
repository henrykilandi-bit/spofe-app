# 📋 FK CASCADE COMMANDS REFERENCE

## 🚀 QUICK COMMAND GUIDE

All the commands you need to deploy the FK CASCADE security fix.

---

## 📌 PHASE 0: BACKUP (CRITICAL!)

### Create Full Database Backup

```bash
# Windows Command Prompt or PowerShell
cd cascade

# Create backup
mysqldump -u root -p spofe_v2_1 > ..\backup_before_fk_fix_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.sql

# Or simpler (auto-timestamp)
mysqldump -u root -p spofe_v2_1 > backup_$(date +%s).sql

# Verify backup size
ls -lh backup_*.sql

# Expected: > 1 MB
# Example: -rw-r--r-- 1 user user 12M Jan 23 14:30 backup_1674415800.sql ✅
```

### Optional: Compress Backup
```bash
gzip backup_*.sql
# Creates: backup_*.sql.gz
```

---

## 📊 PHASE 1: AUDIT & ANALYSIS

### Run All Audit Scripts

```bash
# Go to cascade directory
cd cascade

# 1. List all FK constraints and identify CASCADE
npm run db:audit:foreign-keys

# Expected output:
# ✓ Connexion BD établie
# ✓ 18 tables identifiées
# 🔴 FK CASCADE DANGEREUSES IDENTIFIÉES:
#    1. compagnies.groupe_id → groupes_entreprises
#    2. charts_of_accounts.compagnie_id → compagnies
#    3. journal_entries.compagnie_id → compagnies
#    4. fiscal_years.compagnie_id → compagnies
```

### Analyze CASCADE Risk

```bash
# 2. Evaluate impact of potential CASCADE deletions
npm run db:analyze:cascade:risk

# Expected output:
# 🔴 CASCADE RISK ANALYSIS
# 🔴 groupes_entreprises.id
#    Impact: CATASTROPHIQUE
#    → compagnies: 42 records
#    ⚠️  42 records potentiellement supprimés EN CASCADE
```

### Run Both Audits Together

```bash
# 3. Run all audit and analysis scripts at once
npm run fk:safety:full

# Equivalent to:
# npm run db:audit:foreign-keys && \
# npm run db:analyze:cascade:risk && \
# npm run db:check:integrity
```

---

## 🔧 PHASE 2: APPLY MIGRATION

### Execute the Correction Migration

```bash
# cd cascade (if not already there)

# Run the migration that fixes FK CASCADE constraints
npm run fk:migrate

# Or directly:
npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints

# Expected output:
# ✓ Migration started...
# ✓ Removing old FK constraint: compagnies.groupe_id CASCADE
# ✓ Adding new FK constraint: compagnies.groupe_id RESTRICT
# ✓ Removing old FK constraint: charts_of_accounts.compagnie_id CASCADE
# ✓ Adding new FK constraint: charts_of_accounts.compagnie_id RESTRICT
# ✓ Removing old FK constraint: journal_entries.compagnie_id CASCADE
# ✓ Adding new FK constraint: journal_entries.compagnie_id RESTRICT
# ✓ Removing old FK constraint: fiscal_years.compagnie_id CASCADE
# ✓ Adding new FK constraint: fiscal_years.compagnie_id RESTRICT
# ✓ Setting audit_trails.user_id to SET NULL (OHADA compliance)
# ✓ Migration complete ✅
```

### Check Migration Status

```bash
# Verify the migration was applied
npx sequelize-cli db:migrate:status

# Expected output:
# up  20260121001-initial-schema.js
# up  20260122001-soft-delete-consistency.js
# up  20260123001-fix-dangerous-fk-constraints.js ✅
```

---

## ✅ PHASE 3: VERIFY CONSTRAINTS

### Check That RESTRICT Works

```bash
# Test that new RESTRICT constraints are working
npm run db:check:integrity

# Or directly:
npm run fk:verify

# Expected output:
# ✅ Groupe → Compagnies
#    compagnies.groupe_id → RESTRICT (Correct)
# ✅ Compagnie → Plan Comptable
#    charts_of_accounts.compagnie_id → RESTRICT (Correct)
# ✅ Compagnie → Écritures
#    journal_entries.compagnie_id → RESTRICT (Correct)
# ✅ Compagnie → Exercices
#    fiscal_years.compagnie_id → RESTRICT (Correct)
# 
# 🧪 TEST DE FONCTIONNEMENT - RESTRICT Block:
#    Test 1: Supprimer un groupe avec compagnies
#    ✅ RESTRICT fonctionne correctement - Suppression bloquée
#
# 📊 RÉSUMÉ CHECK
#    Vérifications effectuées:     5
#    ✅ Réussi:                    5
#    ❌ Échoué:                    0
#    ✓ Intégrité vérifiée
```

### Manual Verification in Database

```bash
# Connect to database and verify constraints
mysql -u root -p

# Run these SQL commands:
USE spofe_v2_1;

# Check that FK constraints exist and are RESTRICT
SELECT CONSTRAINT_NAME, DELETE_RULE
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE TABLE_NAME IN ('compagnies', 'charts_of_accounts', 'journal_entries', 'fiscal_years')
ORDER BY TABLE_NAME;

# Expected output:
# CONSTRAINT_NAME                        | DELETE_RULE
# ----------------------------------------+------------
# compagnies_ibfk_1                       | RESTRICT     ✅
# charts_of_accounts_ibfk_1               | RESTRICT     ✅
# journal_entries_ibfk_1                  | RESTRICT     ✅
# fiscal_years_ibfk_1                     | RESTRICT     ✅
```

---

## 🔌 PHASE 4: INTEGRATE MIDDLEWARE

### Update App Configuration

```bash
# 1. Edit cascade/src/app.js
# Add these lines:

# At the top (with other imports):
import SafeDeletionService from './services/safe-deletion.service.js';
import { allDeletionProtections } from './middleware/fk-protection.middleware.js';

# In the app setup (after other middleware):
app.use('/api/admin/delete', allDeletionProtections);

# 2. Restart the application
npm run start:protected

# Or in dev mode:
npm run dev:protected
```

### Verify Middleware is Active

```bash
# Check that app started successfully
npm run health

# Expected: 200 OK response with health status

# Check that deletion endpoints are protected
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1

# Expected: 401 Unauthorized (no token provided)
```

---

## 🧪 PHASE 5: TEST EVERYTHING

### Run Unit Tests

```bash
# Test the FK protection components
npm test -- fk-protection.test.js

# Expected: All tests pass
# ✓ Foreign Key Protection (5 tests)
#   ✓ Should prevent deletion of groupe with compagnies
#   ✓ Should allow deletion of empty groupe
#   ✓ Should require deletion reason
#   ✓ Should enforce rate limiting
#   ✓ Should create audit trail
```

### Run Integration Tests

```bash
# Test the full deletion workflow
npm run test:integration

# Or with filtering:
npm run test:integration -- --grep "fk-protection"

# Expected: All integration tests pass
# ✓ FK Protection Integration (8 tests)
#   ✓ DELETE without auth → 401
#   ✓ DELETE without admin role → 403
#   ✓ DELETE without reason → 400
#   ✓ DELETE with dependency → 409
#   ✓ DELETE empty record → 200
#   ✓ Rate limit 10/min → 429 on 11th
#   ✓ Audit trail created
#   ✓ Soft delete active
```

---

## 🧬 PHASE 5B: MANUAL ENDPOINT TESTING

### Test 1: Missing Authentication

```bash
# Should return 401 Unauthorized
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1

# Expected response:
# HTTP/1.1 401 Unauthorized
# {"error":"Unauthorized"}
```

### Test 2: Missing Admin Role

```bash
# Set USER_TOKEN to a non-admin user's JWT token
export USER_TOKEN="eyJhbGc..."

curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected response:
# HTTP/1.1 403 Forbidden
# {"error":"Only admin can delete"}
```

### Test 3: Missing Deletion Reason

```bash
# Set ADMIN_TOKEN to an admin user's JWT token
export ADMIN_TOKEN="eyJhbGc..."

curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response:
# HTTP/1.1 400 Bad Request
# {"error":"Deletion reason required"}
```

### Test 4: Cannot Delete (FK Constraint)

```bash
# Try to delete a groupe that has companies
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Test deletion"}'

# Expected response:
# HTTP/1.1 409 Conflict
# {
#   "error":"Cannot delete - dependent records exist",
#   "impact":{
#     "errors":["Active companies exist in this group"],
#     "affectedRecords":{"companies":42}
#   }
# }
```

### Test 5: Rate Limiting

```bash
# Make 15 deletion requests quickly
# First 10 should succeed (or get 409)
# 11-15 should get 429 Too Many Requests

for i in {1..15}; do
  echo "Request $i:"
  curl -s -X DELETE http://localhost:3001/api/admin/delete/compagnie/dummy_$i \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"reason":"Test"}' | jq '.message // .error'
done

# Expected output (last 5):
# "Rate limit exceeded - max 10 deletions per minute"
# "Rate limit exceeded - max 10 deletions per minute"
# (etc)
```

---

## 🔄 ROLLBACK PROCEDURES

### Undo Migration (If Needed)

```bash
# Rollback the most recent migration
npm run fk:migrate:undo

# Or directly:
npx sequelize-cli db:migrate:undo --name 20260123001-fix-dangerous-fk-constraints

# Expected output:
# ✓ Migration rolled back
# ✓ CASCADE constraints restored (for rollback only - not recommended!)
# ✓ Database returned to previous state
```

### Restore from Backup (Full Rollback)

```bash
# If something went wrong, restore from backup
# WARNING: This will overwrite ALL changes since backup!

# 1. Stop the app
npm run stop-server

# 2. Restore from backup
mysql -u root -p spofe_v2_1 < backup_before_fk_fix_1674415800.sql

# 3. Restart the app
npm run start:protected

# 4. Verify
npm run health

# 5. Run audit to confirm state
npm run db:audit:foreign-keys
```

---

## 🚨 TROUBLESHOOTING COMMANDS

### If Migration Fails

```bash
# 1. Check migration status
npx sequelize-cli db:migrate:status

# 2. Check database logs
tail -f logs/error.log

# 3. Check MySQL error log
mysql -u root -p -e "SHOW ENGINE INNODB STATUS\G" | head -20

# 4. Try again
npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints

# 5. If still fails, rollback
npx sequelize-cli db:migrate:undo --name 20260123001-fix-dangerous-fk-constraints

# 6. Restore backup
mysql -u root -p spofe_v2_1 < backup_*.sql
```

### If RESTRICT Isn't Working

```bash
# 1. Verify constraint exists
npm run db:check:integrity

# 2. Check constraint details
mysql -u root -p -e "
  SELECT CONSTRAINT_NAME, DELETE_RULE 
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
  WHERE TABLE_NAME='compagnies';
"

# 3. If CASCADE still showing, re-run migration
npm run fk:migrate

# 4. Verify again
npm run db:check:integrity
```

### If Middleware Isn't Working

```bash
# 1. Verify app started
npm run health

# 2. Check that imports are in app.js
grep "fk-protection" cascade/src/app.js
grep "SafeDeletionService" cascade/src/app.js

# 3. Check middleware is registered
curl -X OPTIONS http://localhost:3001/api/admin/delete/groupe/1

# 4. Restart app
npm run stop-server
npm run start:protected

# 5. Test again
curl http://localhost:3001/api/admin/delete/groupe/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📊 MONITORING & VERIFICATION

### Full Safety Check

```bash
# Run complete safety audit
npm run fk:safety:full

# Shows:
# - All FK constraints
# - CASCADE risk analysis
# - RESTRICT constraints verification
# - Test results
```

### Continuous Monitoring

```bash
# Monitor database health
npm run monitor:critical

# Shows:
# - Connection status
# - Query performance
# - Constraint integrity
# - Error logs
```

### Health Check Endpoint

```bash
# Check overall app health
npm run health

# Or directly:
curl http://localhost:3001/api/health

# Expected: 200 OK with full status report
```

---

## 📝 COMMAND SUMMARY BY PHASE

### PHASE 0: Backup
```bash
mysqldump -u root -p spofe_v2_1 > backup_$(date +%s).sql
```

### PHASE 1: Audit
```bash
npm run db:audit:foreign-keys
npm run db:analyze:cascade:risk
npm run db:check:integrity
# Or all three: npm run fk:safety:full
```

### PHASE 2: Migrate
```bash
npm run fk:migrate
# Or: npx sequelize-cli db:migrate --name 20260123001-fix-dangerous-fk-constraints
```

### PHASE 3: Verify
```bash
npm run fk:verify
# Or: npm run db:check:integrity
```

### PHASE 4: Integrate
```bash
# Edit app.js, then:
npm run start:protected
```

### PHASE 5: Test
```bash
npm test -- fk-protection.test.js
npm run test:integration
# Manual tests with curl (see above)
```

---

## ✅ FINAL VALIDATION CHECKLIST

```bash
# 1. Backup exists and is > 1MB
ls -lh backup_*.sql

# 2. Migration applied
npx sequelize-cli db:migrate:status | grep 20260123001

# 3. RESTRICT constraints active
npm run db:check:integrity

# 4. Middleware registered
grep "allDeletionProtections" cascade/src/app.js

# 5. App running
npm run health

# 6. Tests pass
npm test -- fk-protection.test.js

# 7. Manual test: auth required
curl -X DELETE http://localhost:3001/api/admin/delete/groupe/1
# Should return: 401 Unauthorized
```

---

## 🎯 QUICK START (TL;DR)

```bash
# 1. Backup
mysqldump -u root -p spofe_v2_1 > backup_$(date +%s).sql

# 2. Audit
cd cascade
npm run fk:safety:full

# 3. Migrate
npm run fk:migrate

# 4. Verify
npm run db:check:integrity

# 5. Integrate (edit app.js then restart)
npm run start:protected

# 6. Test
npm test -- fk-protection.test.js

# Done! Your database is now protected. ✅
```

---

**Document:** Command Reference  
**Status:** ✅ Complete  
**Last Updated:** 2026-01-23  

🔒 **Run these commands to secure your database!**
