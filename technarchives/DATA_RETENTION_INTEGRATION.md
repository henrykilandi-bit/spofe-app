# 🔄 DATA RETENTION v2.1 - INTEGRATION WITH EXISTING CODEBASE

**Synchronisation complète avec l'application SPOFE v2.1 existante**

---

## 🗂️ STRUCTURE ACTUELLE & INTÉGRATION

### Backend Structure SPOFE v2.1

```
cascade/
├─ src/
│  ├─ server.js ......................... HTTP server entry point
│  ├─ app.js ............................ Middleware & routes setup
│  ├─ config/
│  │  ├─ database.js .................... DB connection config
│  │  ├─ redis.js ....................... Redis client
│  │  └─ [NEW] database-categories.js ... Catégorisation (NEW)
│  ├─ controllers/
│  │  ├─ auth.controller.js
│  │  └─ [ADD HERE] admin.controller.js  Retention endpoints
│  ├─ models/
│  │  ├─ user.model.js ................. BUSINESS_DATA (soft delete)
│  │  ├─ auditTrail.model.js ........... AUDIT_DATA (immutable)
│  │  ├─ securityEvent.model.js ........ AUDIT_DATA (immutable)
│  │  ├─ passwordResetToken.model.js ... TEMPORARY_DATA (expiry)
│  │  ├─ twoFactorAuth.model.js ........ TEMPORARY_DATA (expiry)
│  │  ├─ tokenBlacklist.model.js ....... TEMPORARY_DATA (expiry)
│  │  ├─ compagnie.model.js ............ BUSINESS_DATA (soft delete)
│  │  ├─ chartOfAccounts.model.js ...... BUSINESS_DATA (soft delete)
│  │  ├─ journalEntry.model.js ......... BUSINESS_DATA (soft delete)
│  │  ├─ journalEntryLine.model.js ..... BUSINESS_DATA (soft delete)
│  │  └─ traits/ [NEW]
│  │     ├─ softDeleteTrait.js ......... BusinessSoftDeleteTrait (NEW)
│  │     ├─ immutableTrait.js .......... ImmutableTrait (NEW)
│  │     ├─ temporaryTrait.js .......... TemporaryDataTrait (NEW)
│  │     └─ traitApplier.js ............ Helper function (NEW)
│  ├─ services/
│  │  ├─ authService.js
│  │  ├─ userService.js
│  │  └─ [NEW] dataRetention.service.js  Retention service (NEW)
│  ├─ middleware/
│  │  ├─ auth.middleware.js
│  │  ├─ error.middleware.js
│  │  └─ [OPTIONAL] retention.middleware.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ user.routes.js
│  │  └─ [NEW] retention.routes.js .... Admin endpoints (NEW)
│  ├─ scripts/ [NEW]
│  │  └─ retention-cron.js ............ CRON job setup (NEW)
│  ├─ database/
│  │  ├─ migrations/ [EXISTING]
│  │  │  └─ [NEW] 20260122-fix-soft-delete-consistency.js
│  │  └─ seeders/
│  └─ utils/
│     ├─ logger.js .................... Winston logger
│     ├─ response.js .................. Response utility
│     └─ [ADD] dataRetentionLogger.js .. JSONL retention logs (OPTIONAL)
├─ tests/
│  └─ [NEW] retention/ ................ Test suite (NEW)
│     ├─ soft-delete.test.js
│     ├─ immutable.test.js
│     ├─ temporary.test.js
│     └─ service.test.js
└─ .env.example ....................... Add: RETENTION_ENABLED, RETENTION_CRON_TIME
```

---

## 🔗 POINTS DE INTÉGRATION

### 1️⃣ app.js - Initialiser traits et service

**AVANT** (actuellement):
```javascript
import app from './app.js';
import { setupRoutes } from './routes/index.js';
```

**APRÈS** (avec data retention):
```javascript
import app from './app.js';
import { setupRoutes } from './routes/index.js';
import './scripts/retention-cron.js';  // ← NEW: Initialize CRON

setupRoutes(app);
```

### 2️⃣ Modèles existants - Appliquer traits

**EXEMPLE: User model**

**AVANT** (actuellement):
```javascript
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: true,
  tableName: 'users'
});
export default User;
```

**APRÈS** (avec traits):
```javascript
import { applyTraits } from './traits/traitApplier.js';  // ← NEW

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: true,
  tableName: 'users',
  ...applyTraits(User, 'users', sequelize)  // ← NEW: Auto-applies BusinessSoftDeleteTrait
});
export default User;
```

**EXEMPLE: AuditTrail model**

**AVANT** (actuellement):
```javascript
const AuditTrail = sequelize.define('AuditTrail', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  userId: DataTypes.INTEGER,
  action: DataTypes.STRING,
  details: DataTypes.JSON,
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'audit_trails'
});
export default AuditTrail;
```

**APRÈS** (avec traits):
```javascript
import { applyTraits } from './traits/traitApplier.js';  // ← NEW

const AuditTrail = sequelize.define('AuditTrail', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  userId: DataTypes.INTEGER,
  action: DataTypes.STRING,
  details: DataTypes.JSON,
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'audit_trails',
  ...applyTraits(AuditTrail, 'audit_trails', sequelize)  // ← NEW: Auto-applies ImmutableTrait
});
export default AuditTrail;
```

**EXEMPLE: PasswordResetToken model**

**AVANT** (actuellement):
```javascript
const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  userId: DataTypes.INTEGER,
  token: { type: DataTypes.STRING, unique: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'password_reset_tokens'
});
export default PasswordResetToken;
```

**APRÈS** (avec traits):
```javascript
import { applyTraits } from './traits/traitApplier.js';  // ← NEW

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  userId: DataTypes.INTEGER,
  token: { type: DataTypes.STRING, unique: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expires_at: {  // ← NEW: Required for TemporaryDataTrait
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: new Date().toISOString()
    }
  }
}, {
  timestamps: false,
  tableName: 'password_reset_tokens',
  ...applyTraits(PasswordResetToken, 'password_reset_tokens', sequelize)  // ← NEW
});
export default PasswordResetToken;
```

### 3️⃣ Routes - Ajouter endpoints retention

**NOUVEAU: retention.routes.js**

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import dataRetention from '../services/dataRetention.service.js';
import { success, error as sendError } from '../utils/response.js';

const router = express.Router();

// POST /admin/retention/cycle - Run full retention cycle
router.post('/cycle', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }
    const results = await dataRetention.runFullRetentionCycle();
    return success(res, results, 200, 'Retention cycle completed');
  } catch (err) {
    next(err);
  }
});

// POST /admin/retention/emergency - Emergency cleanup
router.post('/emergency', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }
    const results = await dataRetention.emergencyCleanup();
    return success(res, results, 200, 'Emergency cleanup completed');
  } catch (err) {
    next(err);
  }
});

export default router;
```

**MODIFICATION: app.js**

```javascript
import retentionRoutes from './routes/retention.routes.js';  // ← NEW

// Register routes
app.use('/api/admin/retention', retentionRoutes);  // ← NEW
```

### 4️⃣ CRON Job - Setup automatisation

**NOUVEAU: scripts/retention-cron.js**

```javascript
import cron from 'node-cron';
import dataRetention from '../services/dataRetention.service.js';
import { logInfo, logError } from '../utils/logger.js';

// Initialize CRON jobs (only if RETENTION_ENABLED=true)
if (process.env.RETENTION_ENABLED === 'true') {
  // Run full retention cycle @ 20:00 every day
  cron.schedule('0 20 * * *', async () => {
    try {
      logInfo('RETENTION_CRON', 'Starting daily retention cycle');
      const results = await dataRetention.runFullRetentionCycle();
      logInfo('RETENTION_CRON', 'Daily retention cycle completed', results);
    } catch (err) {
      logError('RETENTION_CRON', 'Error in retention cycle', err);
    }
  });

  logInfo('RETENTION_CRON', 'Retention CRON jobs initialized');
}

export default { initialized: true };
```

---

## 🗄️ DATABASE MIGRATION - EXISTING DATABASE

### Migration Strategy

```
Migration File: 20260122-fix-soft-delete-consistency.js

ÉTAPE 1: Add deleted_at to BUSINESS_DATA tables
  ├─ ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL
  ├─ ALTER TABLE compagnies ADD COLUMN deleted_at DATETIME NULL
  ├─ ... (13 tables total)
  └─ CREATE INDEX idx_deleted_at ON users(deleted_at)

ÉTAPE 2: Verify AUDIT_DATA tables (should NOT have deleted_at)
  ├─ SELECT * FROM audit_trails WHERE deleted_at IS NOT NULL → should be empty
  ├─ SELECT * FROM security_events WHERE deleted_at IS NOT NULL → should be empty
  └─ (remove deleted_at if mistakenly present)

ÉTAPE 3: Add expires_at to TEMPORARY_DATA tables
  ├─ ALTER TABLE password_reset_tokens ADD COLUMN expires_at DATETIME NOT NULL
  ├─ ALTER TABLE two_factor_auths ADD COLUMN expires_at DATETIME NOT NULL
  ├─ ALTER TABLE token_blacklists ADD COLUMN expires_at DATETIME NOT NULL
  └─ CREATE INDEX idx_expires_at ON password_reset_tokens(expires_at)

ÉTAPE 4: Create archive table for audit_trails
  ├─ CREATE TABLE audit_trails_archive LIKE audit_trails
  ├─ ALTER TABLE audit_trails_archive ADD COLUMN archived_at DATETIME NOT NULL
  └─ CREATE INDEX idx_archived_at ON audit_trails_archive(archived_at)
```

### Pre-Migration Checklist

```
✓ Backup database:
  mysqldump -u root -p spofe_v2_1 > backup_2026-01-22.sql

✓ Stop application:
  npm run stop-server:force

✓ Verify backup:
  wc -l backup_2026-01-22.sql  (should be > 1000 lines)

✓ Check database size:
  SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size in MB'
  FROM information_schema.tables WHERE table_schema = 'spofe_v2_1';

✓ Document current table counts:
  SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.tables
  WHERE TABLE_SCHEMA = 'spofe_v2_1';
```

### Execute Migration

```bash
# From cascade directory
cd cascade

# Run migration
npx sequelize-cli db:migrate

# Verify migration success
mysql -u root -p spofe_v2_1 -e "
  SELECT TABLE_NAME, COLUMN_NAME 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA='spofe_v2_1' 
  AND COLUMN_NAME IN ('deleted_at', 'expires_at')
  ORDER BY TABLE_NAME;"

# Expected output:
# TABLE_NAME | COLUMN_NAME
# users | deleted_at
# compagnies | deleted_at
# ... (13 deleted_at total)
# password_reset_tokens | expires_at
# two_factor_auths | expires_at
# token_blacklists | expires_at
```

---

## 🧪 TESTING - INTEGRATION TESTS

### Test Suite Structure

```
tests/retention/
├─ soft-delete.test.js
├─ immutable.test.js
├─ temporary.test.js
└─ service.test.js
```

### Example: soft-delete.test.js

```javascript
import { expect } from 'chai';
import User from '../../src/models/user.model.js';

describe('Soft Delete Trait - User Model', () => {
  
  it('should soft delete user', async () => {
    // Create user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed'
    });
    
    // Soft delete
    await user.destroy();
    
    // Verify deleted_at is set
    const deletedUser = await User.scope('withDeleted').findByPk(user.id);
    expect(deletedUser.deleted_at).to.not.be.null;
  });
  
  it('should not return soft deleted user in default scope', async () => {
    // Default scope filters deleted_at IS NULL
    const users = await User.findAll();
    const deleted = await User.scope('withDeleted').findAll({ where: { deleted_at: { $not: null } } });
    expect(users.length + deleted.length).to.equal(await User.unscoped().count());
  });
  
  it('should allow recovery of soft deleted user', async () => {
    const user = await User.create({...});
    await user.destroy();
    
    // Restore: manually set deleted_at to NULL
    await User.update({ deleted_at: null }, { where: { id: user.id }, individualHooks: true });
    
    const restored = await User.findByPk(user.id);
    expect(restored).to.not.be.null;
    expect(restored.deleted_at).to.be.null;
  });
});
```

### Run Tests

```bash
# Run all retention tests
npm run test -- tests/retention/

# Run with coverage
npm run test:coverage -- tests/retention/

# Run specific test
npm run test -- tests/retention/soft-delete.test.js
```

---

## 🔐 SECURITY CONSIDERATIONS

### Access Control

```javascript
// All retention endpoints require admin role
router.post('/cycle', authMiddleware, adminOnlyMiddleware, ...);
router.post('/emergency', authMiddleware, adminOnlyMiddleware, ...);

// LOG all retention operations
logSecurity('RETENTION_ADMIN_ACTION', {
  userId: req.user.id,
  action: 'runFullRetentionCycle',
  timestamp: new Date().toISOString()
});
```

### Data Protection

```
✓ Soft delete: Data recoverable (protected)
✓ Immutable audit: Cannot be modified (protected)
✓ Temporary cleanup: Only after expiry (protected)
✓ Archive: Copied before delete (protected)
✓ CRON: Automated & logged (protected)
```

### Monitoring

```javascript
// Endpoints for monitoring
GET /api/admin/retention/status
GET /api/admin/retention/stats
GET /api/admin/retention/logs
```

---

## ⚙️ ENVIRONMENT VARIABLES

### Update .env

```
# Data Retention Strategy
RETENTION_ENABLED=true
RETENTION_CRON_TIME=0 20 * * *              # 20:00 every day
RETENTION_ARCHIVE_AGE_YEARS=2               # Archive logs older than 2 years
RETENTION_CLEANUP_BATCH_SIZE=1000           # Batch delete size for performance
RETENTION_LOG_FILE=logs/retention.jsonl     # Retention operation log

# Feature flags
RETENTION_AUTO_CLEANUP=true                 # Auto-delete expired tokens
RETENTION_AUTO_ARCHIVE=true                 # Auto-archive old audit logs
RETENTION_MONITORING=true                   # Monitor DB size
```

### Update .env.example

```diff
+ # Data Retention Strategy (v2.1)
+ RETENTION_ENABLED=true
+ RETENTION_CRON_TIME=0 20 * * *
+ RETENTION_ARCHIVE_AGE_YEARS=2
+ RETENTION_CLEANUP_BATCH_SIZE=1000
+ RETENTION_LOG_FILE=logs/retention.jsonl
+ RETENTION_AUTO_CLEANUP=true
+ RETENTION_AUTO_ARCHIVE=true
+ RETENTION_MONITORING=true
```

---

## 📊 MONITORING & OBSERVABILITY

### Logs

```
Location: logs/retention.jsonl

Format (JSONL):
{
  "timestamp": "2026-01-22T20:00:00.000Z",
  "operation": "runFullRetentionCycle",
  "status": "success",
  "results": {
    "cleanedTemporary": 1250,
    "archivedAuditLogs": 340,
    "databaseSizeMB": 1450
  }
}
```

### Monitoring Endpoints (NEW)

```
GET /api/admin/retention/status
  ├─ Returns: {"enabled": true, "lastRun": "2026-01-22T20:00:00Z", "nextRun": "2026-01-23T20:00:00Z"}

GET /api/admin/retention/stats
  ├─ Returns: {"totalArchived": 10000, "totalCleaned": 5000, "dbSizeMB": 1450}

GET /api/admin/retention/logs?limit=100
  ├─ Returns: [{"timestamp": "...", "operation": "...", "status": "..."}]
```

---

## ✅ INTEGRATION CHECKLIST

### Phase 1: Preparation

```
☐ Read IMPLEMENTATION_EXAMPLES.md
☐ Verify all 7 source files are present
☐ Verify all 9 documentation files are present
☐ Review database-categories.js structure
☐ Review trait implementations
☐ Understand migration steps
```

### Phase 2: Model Updates

```
☐ Modify User model: add applyTraits()
☐ Modify AuditTrail model: add applyTraits()
☐ Modify SecurityEvent model: add applyTraits()
☐ Modify PasswordResetToken model: add expires_at + applyTraits()
☐ Modify TwoFactorAuth model: add expires_at + applyTraits()
☐ Modify TokenBlacklist model: add expires_at + applyTraits()
☐ Modify Compagnie model: add applyTraits()
☐ Modify ChartOfAccounts model: add applyTraits()
☐ Modify JournalEntry model: add applyTraits()
☐ Modify JournalEntryLine model: add applyTraits()
☐ (Additional business models as listed)
```

### Phase 3: Infrastructure

```
☐ Create retention.routes.js
☐ Create retention-cron.js
☐ Create admin.controller.js
☐ Update app.js: import routes & CRON
☐ Update .env & .env.example
✓ Migration file already created
```

### Phase 4: Database

```
☐ Create backup: mysqldump ...
☐ Execute migration: npx sequelize-cli db:migrate
☐ Verify deleted_at columns added (13 tables)
☐ Verify expires_at columns added (3 tables)
☐ Verify archive_trails_archive table created
☐ Verify indexes created
```

### Phase 5: Testing

```
☐ npm run test -- tests/retention/
☐ Test soft delete functionality
☐ Test immutable protection
☐ Test temporary expiry
☐ Test service methods
☐ npm run test:coverage
☐ Achieve > 80% coverage
```

### Phase 6: Deployment

```
☐ All tests pass
☐ Code review approved
☐ npm run stop-server:force
☐ npm run start:protected
☐ Verify /health endpoint
☐ Verify retention endpoints accessible
☐ Verify CRON job initialization logs
☐ Monitor first CRON run @ 20:00
```

---

## 🚨 ROLLBACK PLAN

### If Migration Fails

```bash
# 1. Restore from backup
mysql -u root -p < backup_2026-01-22.sql

# 2. Rollback migration
npx sequelize-cli db:migrate:undo

# 3. Restart application
npm run stop-server:force
npm run start:protected

# 4. Verify system
curl http://localhost:3001/health
```

### If Traits Break Models

```javascript
// Temporarily disable traits by commenting out applyTraits()
// const User = sequelize.define('User', {...}, {
//   ...applyTraits(User, 'users', sequelize)  // ← COMMENT OUT
// });

// Fix issue, then re-enable
```

---

## 📞 SUPPORT

| Issue | Solution |
|-------|----------|
| deleted_at column missing | Ensure migration ran: npx sequelize-cli db:migrate |
| Model not soft-deleting | Verify applyTraits() called in model definition |
| Immutable trait not working | Check hooks applied: beforeUpdate, beforeDestroy |
| Temporary expiry not working | Verify expires_at column added to table |
| CRON not running | Verify RETENTION_ENABLED=true in .env |
| Test failures | Run: npm run test -- tests/retention/ --verbose |

---

**Créé le**: 2026-01-22  
**Intégration complète**: SPOFE v2.1 + Data Retention v2.1  
**Status**: ✅ READY FOR INTEGRATION

🔗 **Prêt à intégrer dans le codebase existant!**
