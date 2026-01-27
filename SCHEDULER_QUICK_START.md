# 🕐 Cache Scheduler - Quick Start

## ⚡ 5-Minute Setup

### 1. Verify Files (1 min)
```bash
# Check all scheduler files are present
ls -la cascade/src/services/cache-scheduler.service.js
ls -la cascade/src/jobs/cache-purge.job.js
ls -la cascade/src/jobs/cache-warmup.job.js
```

### 2. Install Dependencies (1 min)
```bash
cd cascade
npm install node-cron --save
```

### 3. Update Environment (1 min)
```bash
# Add to .env
echo "CACHE_SCHEDULER_ENABLED=true" >> .env
echo "CACHE_PURGE_SCHEDULE=0 2 * * *" >> .env
echo "CACHE_WARMUP_SCHEDULE=0 0 * * *" >> .env
echo "CACHE_MEMORY_CLEANUP_SCHEDULE=0 */6 * * *" >> .env
```

### 4. Integrate into Server (2 min)

Edit `cascade/src/server.js`:

**Add import:**
```javascript
import schedulerBootstrap from './bootstrap/cache-scheduler-bootstrap.js';
```

**In listen callback, add:**
```javascript
const scheduler = await schedulerBootstrap.initialize();
schedulerBootstrap.registerEndpoints(app);
```

**In SIGTERM handler, add:**
```javascript
scheduler.stop();
```

### 5. Test! (2 min)
```bash
npm run dev
npm run scheduler:health
npm run scheduler:trigger:purge
```

---

## 📁 What You Got

| File | Purpose |
|------|---------|
| `cache-scheduler.service.js` | Task orchestrator |
| `cache-purge.job.js` | Remove expired entries |
| `cache-warmup.job.js` | Pre-load patterns |
| `scheduler.routes.js` | REST endpoints |
| `scheduler.controller.js` | API handlers |
| `scheduler-dashboard.html` | Monitoring UI |
| `SCHEDULER_USAGE_GUIDE.md` | Complete documentation |

---

## 🎮 Common Operations

### Check Health
```bash
npm run scheduler:health
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/scheduler/health
```

### View Statistics
```bash
npm run scheduler:stats
```

### Manually Trigger Tasks
```bash
npm run scheduler:trigger:purge      # Remove expired cache
npm run scheduler:trigger:warmup     # Pre-load patterns
npm run scheduler:trigger:cleanup    # Clean fallback cache
```

### Monitor in Real-Time
```bash
npm run scheduler:test               # Run tests
tail -f logs/combined.log | grep scheduler
```

### Access Dashboard
```
http://localhost:3001/scheduler-dashboard.html
```

---

## ⚙️ Configuration

### Cron Schedule Format
```
Minute (0-59) Hour (0-23) Day (1-31) Month (1-12) DayOfWeek (0-6)

Examples:
0 2 * * *       = 2 AM every day
0 0 * * *       = Midnight every day
0 */6 * * *     = Every 6 hours
30 2 * * 0      = 2:30 AM Sundays
```

### Default Schedules
- **Purge**: 2 AM daily (removes expired entries)
- **Warmup**: Midnight + startup (pre-loads patterns)
- **Cleanup**: Every 6 hours (cleans fallback cache)

---

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "scheduler": {
      "running": true,
      "activeJobs": 3,
      "lastPurge": "2026-01-23T02:00:00Z",
      "lastWarmup": "2026-01-23T00:00:00Z",
      "lastCleanup": "2026-01-23T18:00:00Z"
    }
  }
}
```

### Statistics Response
```json
{
  "status": "success",
  "data": {
    "purgeTaskCount": 1,
    "warmupTaskCount": 1,
    "cleanupTaskCount": 4,
    "totalMemoryFreed": 45.3,
    "lastPurgeTime": "2026-01-23T02:00:00Z",
    "lastWarmupTime": "2026-01-23T00:00:00Z",
    "lastCleanupTime": "2026-01-23T18:00:00Z"
  }
}
```

---

## 🧪 Testing

```bash
# Run scheduler tests
npm run scheduler:test

# Expected: 33/33 tests passing

# Run with coverage
npm run test:coverage
```

---

## 🆘 Troubleshooting

### Scheduler Won't Start
```bash
# Check if node-cron is installed
npm list node-cron

# Check server logs
tail -f logs/error.log | grep scheduler

# Check .env has CACHE_SCHEDULER_ENABLED=true
grep CACHE_SCHEDULER .env
```

### Endpoints Return 401
```bash
# Need valid JWT token
# Check Authorization header format
Authorization: Bearer YOUR_JWT_TOKEN

# Test with valid token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/scheduler/health
```

### Tasks Not Executing
```bash
# Verify cron schedule syntax
CACHE_PURGE_SCHEDULE=0 2 * * *  # Should be in .env

# Check server time matches cron schedule
date  # Current time

# Watch logs for execution
grep execute logs/combined.log
```

---

## 📚 Documentation

- **[SCHEDULER_USAGE_GUIDE.md](./SCHEDULER_USAGE_GUIDE.md)** - Complete user guide
- **[SCHEDULER_INTEGRATION_CHECKLIST.md](./SCHEDULER_INTEGRATION_CHECKLIST.md)** - Step-by-step integration
- **[SCHEDULER_FILE_INDEX.md](./SCHEDULER_FILE_INDEX.md)** - File descriptions
- **[PHASE_3_SCHEDULER_COMPLETE.md](./PHASE_3_SCHEDULER_COMPLETE.md)** - Implementation summary

---

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Update environment variables
3. ✅ Integrate into server.js
4. ✅ Test endpoints
5. ✅ Monitor with dashboard
6. ✅ Configure custom schedules (optional)
7. ✅ Deploy to production

---

## 📞 Quick Help

| Need | Command |
|------|---------|
| Health check | `npm run scheduler:health` |
| Statistics | `npm run scheduler:stats` |
| Run test | `npm run scheduler:test` |
| Manual purge | `npm run scheduler:trigger:purge` |
| Dashboard | `http://localhost:3001/scheduler-dashboard.html` |
| Logs | `tail -f logs/combined.log` |

---

**Status**: ✅ Production Ready  
**Version**: SPOFE 2.1.0  
**Phase**: 3 - Cache Scheduler
