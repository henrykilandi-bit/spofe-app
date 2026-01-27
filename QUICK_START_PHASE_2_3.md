# QUICK START: PHASE 2 & 3 TESTING

**Last Updated:** January 22, 2026

---

## 🚀 ONE-MINUTE SETUP

```bash
# 1. Verify Phase 2 (Code Level - No DB Needed)
cd cascade
node scripts/phase2-soft-delete-tests.mjs

# Expected: ✨ PHASE 2: ALL CRITICAL TESTS PASSED

# 2. Verify Phase 3 (SQL Ready - No DB Needed)
node scripts/phase3-verify-views.mjs

# Expected: ✅ View Creation Ready: PASS
```

---

## ⏸️ WHEN MYSQL IS AVAILABLE

```bash
# 1. Start MySQL
net start MySQL80

# 2. Re-run Phase 2 (now includes DB checks)
cd cascade
node scripts/phase2-soft-delete-tests.mjs

# 3. Create Audit Views
mysql -h localhost -u root spofe_v2_1 < scripts/phase3-create-audit-views.sql

# 4. Verify Views
node scripts/phase3-verify-views.mjs

# 5. Run Full Tests
npm test

# 6. Start Application
npm run dev
```

---

## 📋 PHASE 2: WHAT'S TESTED

✅ All 10 models have `paranoid: true`
✅ All 10 models have `deletedAt: 'deleted_at'`
✅ Sequelize v6.37.7 supports paranoid mode
✅ Default scopes configured

---

## 📋 PHASE 3: WHAT'S CREATED

✅ vw_audit_global - Main audit view
✅ vw_audit_daily_summary - Daily stats
✅ vw_audit_user_activity - User tracking
✅ vw_audit_deleted_records - Soft delete retention
✅ vw_audit_security_events - Security tracking

---

## 🔥 KEY CHANGES

### Soft Delete Now Works
```javascript
// Records are hidden, not deleted
await User.destroy();  // Sets deleted_at, not dropped

// Find active only (default)
const users = await User.findAll();

// Find all including deleted
const allUsers = await User.findAll({ paranoid: false });

// Recover deleted
await user.restore();
```

### Audit Views Enable Reporting
```sql
-- Track company modifications
SELECT * FROM vw_audit_global
WHERE entity_type = 'Company' AND entity_id = 1;

-- Daily summary
SELECT * FROM vw_audit_daily_summary
WHERE audit_date >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- High-security events
SELECT * FROM vw_audit_security_events
WHERE security_level = 'HIGH';
```

---

## ✨ STATUS

- ✅ Phase 2: Code Level Tests PASS
- ✅ Phase 3: SQL Scripts Ready
- ⏳ Phase 2: DB Tests (when MySQL available)
- ⏳ Phase 3: Deploy Views (when MySQL available)

---

**Next:** Start MySQL and run the tests!

```bash
net start MySQL80
cd cascade
npm test
```
