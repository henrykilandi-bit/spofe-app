# ✅ Cache Scheduler - Integration Checklist

## 📋 Pre-Integration (5 min)

### Step 1: Verify Files Exist
- [ ] `cascade/src/services/cache-scheduler.service.js` (300 LOC)
- [ ] `cascade/src/jobs/cache-purge.job.js` (200 LOC)
- [ ] `cascade/src/jobs/cache-warmup.job.js` (250 LOC)
- [ ] `cascade/src/bootstrap/cache-scheduler-bootstrap.js` (150 LOC)
- [ ] `cascade/src/routes/scheduler.routes.js` (50 LOC)
- [ ] `cascade/src/controllers/scheduler.controller.js` (80 LOC)
- [ ] `cascade/tests/cache-scheduler.test.js` (350 LOC)
- [ ] `cascade/public/scheduler-dashboard.html` (500 LOC)
- [ ] `SCHEDULER_USAGE_GUIDE.md`
- [ ] `PHASE_3_SCHEDULER_COMPLETE.md`
- [ ] `SCHEDULER_FILE_INDEX.md`
- [ ] `SCHEDULER_INTEGRATION_CHECKLIST.md` (this file)

**Verification Command**:
```bash
ls -la cascade/src/services/cache-scheduler.service.js
ls -la cascade/src/jobs/cache-purge.job.js
ls -la cascade/src/jobs/cache-warmup.job.js
```

### Step 2: Install Dependencies
```bash
cd cascade
npm install node-cron --save
npm install  # Install all dependencies
```

**Verify Installation**:
```bash
npm list node-cron
# Should show: node-cron@^3.0.0 (or latest)
```

### Step 3: Update Environment Variables

Copy variables from `.env.example` to `.env`:

```bash
cat .env.example | grep CACHE_SCHEDULER >> .env
cat .env.example | grep CACHE_PURGE >> .env
cat .env.example | grep CACHE_WARMUP >> .env
cat .env.example | grep CACHE_MEMORY >> .env
```

Or manually add to `.env`:
```dotenv
CACHE_SCHEDULER_ENABLED=true
CACHE_PURGE_SCHEDULE=0 2 * * *
CACHE_WARMUP_SCHEDULE=0 0 * * *
CACHE_MEMORY_CLEANUP_SCHEDULE=0 */6 * * *
```

**Verify Configuration**:
```bash
grep CACHE_SCHEDULER .env
# Should show all 4 variables
```

---

## 🔧 Core Integration (15 min)

### Step 4: Integrate into cascade/src/server.js

**BEFORE** (current code):
```javascript
import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.logInfo(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.logInfo('Server closed');
  });
});
```

**AFTER** (with scheduler):
```javascript
import app from './app.js';
import logger from './utils/logger.js';
import schedulerBootstrap from './bootstrap/cache-scheduler-bootstrap.js';

const PORT = process.env.PORT || 3001;

let scheduler;

const server = app.listen(PORT, async () => {
  logger.logInfo(`Server running on port ${PORT}`);
  
  // Initialize cache scheduler
  try {
    scheduler = await schedulerBootstrap.initialize();
    schedulerBootstrap.registerEndpoints(app);
    logger.logInfo('✅ Cache Scheduler initialized');
  } catch (error) {
    logger.logError('Failed to initialize scheduler', { error: error.message });
  }
});

process.on('SIGTERM', async () => {
  logger.logInfo('Shutting down...');
  
  // Shutdown scheduler gracefully
  if (scheduler) {
    await schedulerBootstrap.shutdown();
  }
  
  server.close(() => {
    logger.logInfo('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.logInfo('Interrupted...');
  
  if (scheduler) {
    await schedulerBootstrap.shutdown();
  }
  
  server.close(() => {
    process.exit(0);
  });
});
```

**Implementation Steps**:
1. [ ] Open `cascade/src/server.js`
2. [ ] Add import: `import schedulerBootstrap from './bootstrap/cache-scheduler-bootstrap.js';`
3. [ ] Add variable: `let scheduler;`
4. [ ] In listen callback, add scheduler initialization:
   ```javascript
   try {
     scheduler = await schedulerBootstrap.initialize();
     schedulerBootstrap.registerEndpoints(app);
     logger.logInfo('✅ Cache Scheduler initialized');
   } catch (error) {
     logger.logError('Failed to initialize scheduler', { error: error.message });
   }
   ```
5. [ ] In SIGTERM handler, add shutdown:
   ```javascript
   if (scheduler) {
     await schedulerBootstrap.shutdown();
   }
   ```
6. [ ] In SIGINT handler, add shutdown (optional but recommended)

**Test Integration**:
```bash
npm run dev
# Should see: ✅ Cache Scheduler initialized
# Should see: 🔥 Running initial cache warm-up...
# Should see: ✅ Initial warm-up: 6 patterns loaded
```

### Step 5: Integrate into cascade/src/app.js

**BEFORE**:
```javascript
import express from 'express';
import authRoutes from './routes/auth.routes.js';
// ... other imports

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
// ... other routes
```

**AFTER**:
```javascript
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import schedulerRoutes from './routes/scheduler.routes.js';
// ... other imports

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/scheduler', schedulerRoutes);
// ... other routes
```

**Implementation Steps**:
1. [ ] Open `cascade/src/app.js`
2. [ ] Add import: `import schedulerRoutes from './routes/scheduler.routes.js';`
3. [ ] Add route: `app.use('/api/scheduler', schedulerRoutes);` (after other routes)
4. [ ] Ensure it's AFTER authentication middleware

**Test Routes**:
```bash
curl -X GET http://localhost:3001/api/scheduler/health \
  -H "Authorization: Bearer your-token"
# Should return health status
```

---

## ✅ Validation (10 min)

### Step 6: Run Tests

```bash
cd cascade

# Run scheduler tests only
npm run scheduler:test

# Run full test suite with coverage
npm run test:coverage

# Watch mode (for development)
npm run scheduler:test:watch
```

**Expected Output**:
- All 33 test cases pass
- No errors or warnings
- Coverage > 80%

**Troubleshooting**:
- If tests fail, check imports in test file
- Ensure mocked dependencies match actual modules
- Check that cache service is available

### Step 7: Verify Endpoints

Start the server:
```bash
npm run dev
```

In another terminal, test endpoints:

#### Health Check
```bash
curl -X GET http://localhost:3001/api/scheduler/health \
  -H "Authorization: Bearer test-token"

# Expected response:
{
  "status": "success",
  "data": {
    "status": "healthy",
    "scheduler": {
      "running": true,
      "activeJobs": 3,
      "lastPurge": "2026-01-23T02:00:00.000Z",
      ...
    }
  }
}
```

#### Statistics
```bash
curl -X GET http://localhost:3001/api/scheduler/stats \
  -H "Authorization: Bearer test-token"

# Expected: Statistics object with purgeTaskCount, warmupTaskCount, etc.
```

#### Tasks List
```bash
curl -X GET http://localhost:3001/api/scheduler/tasks \
  -H "Authorization: Bearer test-token"

# Expected: Array of 3 tasks (purge, warmup, cleanup)
```

#### Manual Trigger
```bash
curl -X POST http://localhost:3001/api/scheduler/trigger/purge \
  -H "Authorization: Bearer test-token"

# Expected: Success response with job execution details
```

**Verify Checklist**:
- [ ] Health endpoint returns `status: "healthy"`
- [ ] Stats endpoint returns numbers > 0
- [ ] Tasks endpoint returns array with 3 items
- [ ] Trigger endpoint executes without errors
- [ ] Responses are valid JSON
- [ ] All endpoints require authentication

### Step 8: Test npm Scripts

```bash
# Test all npm scripts
npm run scheduler:health
npm run scheduler:stats
npm run scheduler:trigger:purge
npm run scheduler:trigger:warmup
npm run scheduler:trigger:cleanup

# Expected: All return JSON responses
```

---

## 📊 Monitoring (5 min)

### Step 9: Access Dashboard

```bash
# In browser, navigate to:
http://localhost:3001/scheduler-dashboard.html

# You should see:
- Health Status card
- Statistics card
- Scheduled Tasks card
- Quick Actions (buttons)
- Memory Impact card
- Auto-refresh indicator
```

**Dashboard Features**:
- [ ] Health status displays correctly
- [ ] Statistics update with correct values
- [ ] Tasks show correct cron schedules
- [ ] Quick action buttons trigger jobs
- [ ] Auto-refresh works (every 30 seconds)

### Step 10: Check Logs

```bash
# Watch scheduler logs
tail -f logs/combined.log | grep -i scheduler

# Expected to see:
# ✅ Cache Scheduler Bootstrap: Starting initialization...
# 🔥 Running initial cache warm-up...
# ✅ Initial warm-up: 6 patterns loaded
# 🕐 Cache Scheduler Bootstrap: Ready
```

**Log Analysis**:
- [ ] No ERROR entries
- [ ] No WARNING entries
- [ ] Initialization completes successfully
- [ ] Warm-up loads 6 patterns

---

## 🔐 Security Validation (5 min)

### Step 11: Test Authentication

```bash
# Without token - should fail
curl -X GET http://localhost:3001/api/scheduler/health
# Expected: 401 Unauthorized

# With invalid token - should fail
curl -X GET http://localhost:3001/api/scheduler/health \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 or 403

# With valid token - should succeed
curl -X GET http://localhost:3001/api/scheduler/health \
  -H "Authorization: Bearer valid-jwt-token"
# Expected: 200 with data
```

**Security Checklist**:
- [ ] Endpoints reject unauthenticated requests
- [ ] Endpoints reject invalid tokens
- [ ] Endpoints accept valid JWT tokens
- [ ] No sensitive data in responses
- [ ] Error messages don't reveal internals

### Step 12: Audit Logging

```bash
# Check security audit log
tail -f logs/security.log | grep scheduler

# Should see entries like:
# [SECURITY] Manual scheduler trigger: taskName=purge
# [SECURITY] Scheduler health check
```

**Audit Checklist**:
- [ ] Manual triggers are logged
- [ ] Health checks are logged
- [ ] Logs include timestamps
- [ ] Logs include user info (if available)

---

## 🚀 Production Setup (10 min)

### Step 13: PM2 Configuration (Optional)

Add to `ecosystem.config.js`:

```javascript
{
  name: 'spofe-scheduler',
  script: './cascade/src/server.js',
  instances: 1,
  exec_mode: 'cluster',
  env: {
    NODE_ENV: 'production',
    CACHE_SCHEDULER_ENABLED: 'true',
    PORT: 3001
  },
  error_file: './logs/pm2-error.log',
  out_file: './logs/pm2-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  watch: false,
  ignore_watch: ['node_modules', 'logs'],
  max_memory_restart: '1G'
}
```

**Start with PM2**:
```bash
pm2 start ecosystem.config.js --name spofe-scheduler
pm2 save
pm2 startup
```

### Step 14: Monitoring Setup (Optional)

```bash
# Start monitoring
npm run monitor:integrated

# Or watch specific logs
watch -n 5 'npm run scheduler:stats | jq ".data"'
```

### Step 15: Backup & Documentation

```bash
# Document your configuration
cp cascade/.env cascade/.env.production.backup

# Document custom schedules if any
cat > SCHEDULER_CONFIGURATION.md << EOF
# Cache Scheduler Configuration

## Cron Schedules
- Purge: 0 2 * * *  (2 AM daily)
- Warmup: 0 0 * * * (Midnight daily)
- Cleanup: 0 */6 * * * (Every 6 hours)

## Patterns
- 6 default SPOFE patterns
- Custom patterns: [list any]

## Monitoring
- Dashboard: http://localhost:3001/scheduler-dashboard.html
- Logs: logs/combined.log
- Health: npm run scheduler:health
EOF
```

---

## 📝 Final Verification (5 min)

### Step 16: Complete Verification

```bash
# 1. Server is running
curl http://localhost:3001/api/health

# 2. Scheduler is initialized
npm run scheduler:health

# 3. Tests pass
npm run scheduler:test 2>&1 | tail -5

# 4. All npm scripts work
npm run scheduler:stats 2>&1 | head -20

# 5. Dashboard loads
curl -s http://localhost:3001/scheduler-dashboard.html | head -10
```

**Final Checklist**:
- [ ] Server starts without errors
- [ ] Scheduler initializes on startup
- [ ] All endpoints respond correctly
- [ ] Tests pass with 33/33 success
- [ ] Dashboard loads and auto-refreshes
- [ ] Logs are generated correctly
- [ ] Authentication is enforced
- [ ] Memory is stable after 1 hour

### Step 17: 24-Hour Validation

Run this check after 24 hours of operation:

```bash
# Check if scheduler executed tasks
grep "executePurge\|executeWarmup\|executeMemory" logs/combined.log | wc -l
# Should show multiple executions

# Check for errors
grep ERROR logs/error.log | grep scheduler | wc -l
# Should show 0 errors

# Check memory usage
ps aux | grep "node.*server.js" | awk '{print $6}'
# Should be stable (not growing unbounded)

# Check last execution times
tail -20 logs/combined.log | grep "execute"
# Should show recent executions
```

**Validation Results**:
- [ ] Purge executed at least 1 time (2 AM)
- [ ] Warmup executed at least 1 time (midnight)
- [ ] Cleanup executed at least 4 times (every 6h)
- [ ] Zero errors in logs
- [ ] Memory stable (±10 MB variance)
- [ ] Dashboard shows accurate stats

---

## 🎯 Success Criteria

All of the following must be TRUE:

- ✅ All 12 files present and readable
- ✅ node-cron dependency installed
- ✅ Environment variables configured
- ✅ Server.js integration complete
- ✅ App.js routes registered
- ✅ All 33 tests passing
- ✅ All 5 endpoints responding
- ✅ All npm scripts working
- ✅ Dashboard loads correctly
- ✅ Logs show no errors
- ✅ Authentication enforced
- ✅ Tasks execute on schedule

---

## 🆘 Troubleshooting Guide

### Issue: "Module not found: cache-scheduler.service.js"

**Solution**:
1. Check file exists: `ls -la cascade/src/services/cache-scheduler.service.js`
2. Check imports use `.js` extension: `import ... from '...service.js'`
3. Check path is relative to file location

### Issue: "node-cron is not installed"

**Solution**:
```bash
cd cascade
npm install node-cron --save
npm list node-cron
```

### Issue: "401 Unauthorized on endpoints"

**Solution**:
1. Check JWT token is valid
2. Check Authorization header format: `Authorization: Bearer {token}`
3. Check auth middleware is properly configured

### Issue: "Scheduler doesn't initialize"

**Solution**:
1. Check `CACHE_SCHEDULER_ENABLED=true` in .env
2. Check logs: `tail -f logs/error.log`
3. Check server startup doesn't error

### Issue: "Tasks not executing on schedule"

**Solution**:
1. Verify cron expressions: `CACHE_PURGE_SCHEDULE=0 2 * * *`
2. Check server time matches cron schedule
3. Monitor logs for execution: `grep execute logs/combined.log`

---

## 📞 Support

**Documentation**:
- [SCHEDULER_USAGE_GUIDE.md](./SCHEDULER_USAGE_GUIDE.md) - Complete guide
- [PHASE_3_SCHEDULER_COMPLETE.md](./PHASE_3_SCHEDULER_COMPLETE.md) - Overview
- [SCHEDULER_FILE_INDEX.md](./SCHEDULER_FILE_INDEX.md) - File details

**Endpoints**:
- Health: GET `/api/scheduler/health`
- Stats: GET `/api/scheduler/stats`
- Tasks: GET `/api/scheduler/tasks`
- Trigger: POST `/api/scheduler/trigger/{jobName}`

**Commands**:
- `npm run scheduler:health`
- `npm run scheduler:stats`
- `npm run scheduler:test`
- `./DEPLOY_SCHEDULER.ps1 -Verify`

---

## ✨ Completion

Once all steps are complete, Phase 3 Cache Scheduler is fully integrated and operational!

**Next**: Monitor performance and consider Phase 4+ optimizations.

---

**Checklist Created**: January 23, 2026  
**Status**: ✅ Production Ready  
**Version**: SPOFE 2.1.0
