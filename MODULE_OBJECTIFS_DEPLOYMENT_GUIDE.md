# MODULE OBJECTIFS - DEPLOYMENT GUIDE
## Production Readiness & Rollout Plan

**Version**: 2.2  
**Date**: 2026-01-25  
**Target Environment**: Production  
**Estimated Duration**: 2-4 hours (including verification)

---

## PRE-DEPLOYMENT CHECKLIST

### Code Quality Verification
- [ ] All 120+ tests passing locally
- [ ] Code coverage > 90% for all Phase 2 controllers
- [ ] No console.log statements (must use logger)
- [ ] All error messages are user-friendly (no stack traces in responses)
- [ ] Security audit passed (auth, validation, SQL injection checks)
- [ ] Linting: `npm run lint` passes without errors
- [ ] No hardcoded credentials in code

### Environment Preparation
- [ ] Production .env configured with correct values
  - DB_HOST, DB_USER, DB_PASSWORD
  - JWT_SECRET (strong 32+ character value)
  - REDIS_URL (if using caching)
  - NODE_ENV=production
  - LOG_LEVEL=info
- [ ] Database server verified running
- [ ] Redis server verified running (if using)
- [ ] Backup of production database created
- [ ] Rollback procedure documented and tested

### Infrastructure Readiness
- [ ] Server has minimum resources (4GB RAM, 2 CPU cores)
- [ ] Disk space > 5GB available
- [ ] SSL certificate valid and installed
- [ ] Firewall rules allow port 3001 (or configured port)
- [ ] Load balancer configured (if applicable)
- [ ] Monitoring and alerting enabled

### Documentation Ready
- [ ] Deployment guide (this document)
- [ ] Rollback procedure documented
- [ ] Team on-call list updated
- [ ] Incident response plan in place
- [ ] Communication channels verified (Slack, email)

---

## STEP-BY-STEP DEPLOYMENT

### Phase 1: Pre-Deployment (30 minutes)

**1. Final Code Verification**
```bash
# Pull latest code
git pull origin main

# Verify branch is main/production
git branch

# Check latest commit
git log -1 --oneline

# Expected: Should show latest deployment commit
```

**2. Run Final Tests**
```bash
# Clear and reinstall dependencies
rm -rf node_modules
npm install --production

# Run full test suite
npm test -- --bail

# Expected: 120 tests PASSED, no errors
# Note: --bail stops on first failure for quick feedback
```

**3. Build Production Bundle**
```bash
# Create optimized production build
npm run build:prod

# Verify build succeeded
ls -lh dist/
# Should see: server.js, controllers/, routes/, models/, etc.

# Check build size
du -sh dist/
# Should be < 10MB
```

**4. Database Migration Check**
```bash
# Verify database connectivity
node -e "require('./src/config/database.js')"
# Should show: "Database connected"

# Check pending migrations
npm run migration:status
# Expected: All migrations applied

# Create backup
mysqldump -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > \
  backup_$(date +%Y%m%d_%H%M%S).sql

echo "Backup created: $(ls -t backup_*.sql | head -1)"
```

**5. Environment Validation**
```bash
# Verify all required environment variables
node -e "
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
  required.forEach(v => {
    if (!process.env[v]) throw new Error(\`Missing: \${v}\`);
  });
  console.log('✓ All environment variables set');
"

# Test database connection
node -e "
  const sequelize = require('./src/config/database.js');
  sequelize.authenticate()
    .then(() => console.log('✓ Database connected'))
    .catch(e => { console.error('✗ DB error:', e.message); process.exit(1); });
"

# Expected: "✓ Database connected"
```

### Phase 2: Deployment (1-2 hours)

**1. Stop Current Service (if running)**
```bash
# Graceful shutdown of existing process
pm2 stop spofe-objectives --update-env

# Wait for graceful shutdown (max 30s)
sleep 5

# Verify stopped
pm2 status
# Expected: spofe-objectives should show "stopped"
```

**2. Deploy New Code**
```bash
# Copy code to production directory
cp -r dist/* /opt/spofe/app/

# Set correct permissions
chown -R app:app /opt/spofe/app
chmod -R 755 /opt/spofe/app

# Verify files copied
ls -la /opt/spofe/app/src/controllers/
# Should show: objectives.controller.js, indicators.controller.js, strategicAI.controller.js
```

**3. Update Dependencies**
```bash
# Move to app directory
cd /opt/spofe/app

# Install production dependencies only
npm install --production --no-save

# Verify critical packages installed
npm ls express sequelize
# Should show: express@^4.x, sequelize@^6.x

# Clear npm cache
npm cache clean --force
```

**4. Database Migrations**
```bash
# Apply any pending migrations
npm run migrate

# Verify migrations succeeded
npm run migration:status

# If migrations fail:
# - Check logs: tail logs/error.log
# - Rollback: npm run rollback
# - Fix issues and restart deployment
```

**5. Load Configuration**
```bash
# Set production environment
export NODE_ENV=production

# Load .env file (should already exist)
source /opt/spofe/.env

# Verify critical settings
echo "DB_HOST: ${DB_HOST}"
echo "NODE_ENV: ${NODE_ENV}"
echo "JWT_SECRET: ****** (hidden)"
```

**6. Start Service**
```bash
# Start with PM2 (production process manager)
pm2 start /opt/spofe/app/src/server.js \
  --name "spofe-objectives" \
  --env production \
  --error /var/log/spofe/error.log \
  --output /var/log/spofe/combined.log \
  --max-memory-restart 500M \
  --node-args="--max-old-space-size=1024"

# Save PM2 config to restart on reboot
pm2 save

# Verify process started
pm2 status
# Expected: spofe-objectives should show "online" (green)

# Check process is using resources
ps aux | grep "server.js"
# Should show node process consuming memory/CPU
```

**7. Health Check**
```bash
# Wait for service to fully start
sleep 5

# Check health endpoint
curl -s http://localhost:3001/api/health | jq .

# Expected response:
# {
#   "success": true,
#   "status": "healthy",
#   "uptime": 5,
#   "version": "2.2",
#   "modules": ["objectives", "indicators", "ai"]
# }

# If health check fails:
# - Check logs: pm2 logs spofe-objectives
# - Verify database connectivity
# - Check port 3001 is open
# - Rollback if needed
```

### Phase 3: Smoke Testing (30-45 minutes)

**1. Basic Connectivity**
```bash
# Test API is responding
curl -i http://localhost:3001/api/health

# Expected: HTTP 200, JSON response
```

**2. Authentication Test**
```bash
# Login request
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YOUR_PASSWORD"
  }' | jq .

# Save token for subsequent tests
export TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "YOUR_PASSWORD"}' | jq -r '.data.token')

echo "Token: $TOKEN"
```

**3. Core Functionality Tests**
```bash
# Create objective
curl -X POST http://localhost:3001/api/objectives \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "compagnieId": 1,
    "titre": "Objectif de test",
    "type": "vente",
    "dateDebut": "2026-01-25",
    "dateFin": "2026-03-31"
  }' | jq .

# Expected: HTTP 200 with objective data

# List objectives
curl -X GET http://localhost:3001/api/objectives \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# Expected: Array of objectives

# Get objective detail
curl -X GET http://localhost:3001/api/objectives/1 \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# Expected: Objective with indicators and actions
```

**4. AI Features Test**
```bash
# Test predictions
curl -X POST http://localhost:3001/api/objectives/1/ai/predict \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# Expected: HTTP 200 with probability, confidence, factors

# Test insights
curl -X GET http://localhost:3001/api/objectives/1/ai/insights \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# Expected: HTTP 200 with insights data
```

**5. Database Operations Test**
```bash
# Check objectives in database
mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT COUNT(*) as count FROM strategic_objectives;"

# Should return count > 0 if data exists
```

**6. Error Handling Test**
```bash
# Test authentication failure
curl -X GET http://localhost:3001/api/objectives \
  -H "Authorization: Bearer invalid" | jq .

# Expected: HTTP 401, "Unauthorized"

# Test validation error
curl -X POST http://localhost:3001/api/objectives \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Expected: HTTP 400, validation error message
```

### Phase 4: Monitoring Verification (15 minutes)

**1. Log File Monitoring**
```bash
# Monitor live logs
pm2 logs spofe-objectives

# Check for errors (should see none)
tail -f logs/error.log

# Check security logs
tail -f logs/security.log

# Expected: No error messages, security audit logs visible
```

**2. Process Health**
```bash
# Monitor process
pm2 monit

# Check memory usage (should stabilize < 500MB)
# Check CPU usage (should be < 10% at rest)
# Check uptime (should be increasing)
```

**3. Performance Baseline**
```bash
# Measure response time
time curl http://localhost:3001/api/objectives \
  -H "Authorization: Bearer ${TOKEN}" > /dev/null

# Expected: < 500ms for list operation
# Baseline for future comparisons

# Load test (optional, if tools available)
ab -n 100 -c 10 \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:3001/api/health

# Expected: 100 requests, < 1% failures, avg response time < 100ms
```

### Phase 5: Production Sign-Off (15 minutes)

**1. Final Verification Checklist**
- [ ] All 3 test suites passing on production code
- [ ] Health endpoint returns 200 OK
- [ ] Can authenticate and get valid token
- [ ] Can create/read/update/delete objectives
- [ ] AI predictions working
- [ ] No errors in error.log
- [ ] Response times acceptable (< 500ms)
- [ ] Process memory stable (< 500MB)
- [ ] Database connectivity verified

**2. Notification**
```bash
# Notify team of successful deployment
echo "✓ Deployment successful
- Version: 2.2
- Deployed: $(date)
- Health: OK
- Tests: PASSING
- Ready for production traffic" | \
  mail -s "SPOFE Deployment Complete" team@spofe.com
```

**3. Document Deployment**
```bash
# Record deployment in logs
cat >> deployment.log << EOF
Date: $(date)
Version: 2.2
Status: SUCCESSFUL
Tests: 120/120 PASSED
Deployed by: $USER
Duration: 2h 30m
Rollback: git checkout $(git rev-parse HEAD~1)
EOF
```

---

## MONITORING & OBSERVABILITY

### Key Metrics to Monitor

**Availability**
- Uptime (target: 99.9%)
- Endpoint availability
- Database connectivity
- Redis connectivity (if used)

**Performance**
- Response time p50: < 100ms
- Response time p95: < 300ms
- Response time p99: < 500ms
- Throughput: > 100 req/s

**Errors**
- Error rate: < 0.1%
- 4xx errors: < 1%
- 5xx errors: < 0.01%

**Resources**
- Memory: < 500MB
- CPU: < 70%
- Disk: > 1GB free

### Alerting Thresholds

```
CRITICAL (immediate action):
- Error rate > 5%
- Response time p95 > 1000ms
- Memory > 700MB
- Disk < 100MB

WARNING (investigate within 1 hour):
- Error rate > 1%
- Response time p95 > 500ms
- Memory > 600MB
- Disk < 500MB
```

### Log Monitoring

```bash
# Real-time error monitoring
tail -f logs/error.log | grep "ERROR\|CRITICAL"

# Monitor specific errors
grep "database" logs/error.log

# Check error frequency
grep -c "ERROR" logs/error.log

# Analyze errors by type
grep "ERROR" logs/error.log | \
  sed 's/.*ERROR: //' | \
  sort | uniq -c | sort -rn
```

---

## ROLLBACK PROCEDURE

### When to Rollback
- Critical bugs introduced
- Performance degradation > 50%
- Database corruption
- Security vulnerability discovered
- Unable to fix issues within 1 hour

### Rollback Steps

**1. Stop Current Service**
```bash
pm2 stop spofe-objectives
```

**2. Restore Previous Code**
```bash
# Option A: Git rollback (if small changes)
cd /opt/spofe/app
git checkout HEAD~1
npm install --production

# Option B: Use backup (if major deployment)
# Restore from /opt/spofe/backup/
```

**3. Restore Database (if needed)**
```bash
# Restore from backup
mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < \
  backup_YYYYMMDD_HHMMSS.sql

# Verify restore
mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT COUNT(*) FROM strategic_objectives;"
```

**4. Restart Service**
```bash
pm2 restart spofe-objectives

# Verify
pm2 status
curl http://localhost:3001/api/health
```

**5. Notify Team**
```bash
echo "Deployment rolled back due to [REASON]
Previous version: v2.1.X
Current version: v2.2
Status: STABLE" | mail -s "ROLLBACK EXECUTED" team@spofe.com
```

---

## POST-DEPLOYMENT TASKS

### Day 1 (First 24 hours)
- [ ] Monitor logs constantly
- [ ] Check error rates every 30 minutes
- [ ] Verify data integrity in database
- [ ] Test all core workflows manually
- [ ] Have rollback team on standby

### Day 2-7
- [ ] Daily monitoring review
- [ ] Performance baseline comparison
- [ ] User feedback collection
- [ ] Documentation updates
- [ ] Team training (if needed)

### Week 2+
- [ ] Performance optimization
- [ ] Load testing
- [ ] Security audit
- [ ] Capacity planning

---

## TROUBLESHOOTING DEPLOYMENT ISSUES

### Issue: Service fails to start
```bash
# Check logs
pm2 logs spofe-objectives

# Common causes:
# 1. Port 3001 already in use
lsof -i :3001

# 2. Database connection failed
node -e "require('./src/config/database.js')"

# 3. Missing environment variables
env | grep DB_

# Solutions:
# - Kill process on port 3001: kill -9 <PID>
# - Verify database is running: systemctl status mysql
# - Set environment variables: source .env
```

### Issue: Database migration fails
```bash
# Check migration status
npm run migration:status

# Check error
tail -f logs/error.log | grep -i migration

# Rollback migrations
npm run migration:undo

# Verify database schema
mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "SHOW TABLES;"

# Reapply migrations
npm run migrate
```

### Issue: High error rate after deployment
```bash
# Check error types
grep "ERROR" logs/error.log | head -20

# Filter by endpoint
grep "POST /api/objectives" logs/error.log

# Check for specific error code
grep "500" logs/combined.log | wc -l

# If errors are consistent:
# 1. Investigate root cause
# 2. Fix code or configuration
# 3. Redeploy or rollback
```

### Issue: Performance degradation
```bash
# Check slow queries
grep "SLOW QUERY" logs/combined.log

# Monitor response times
grep "response_time_ms" logs/combined.log | \
  awk -F: '{sum+=$NF; count++} END {print "Avg:", sum/count "ms"}'

# Check resource usage
top -b -n 1 | grep "spofe-objectives"

# If resource-limited:
# 1. Scale up server resources
# 2. Enable caching (Redis)
# 3. Optimize database queries
```

---

## DEPLOYMENT CHECKLIST SUMMARY

**Pre-Deployment** (30 min)
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database backup created
- [ ] Rollback procedure tested

**Deployment** (1-2 hours)
- [ ] Code deployed to production
- [ ] Migrations applied
- [ ] Service started successfully
- [ ] Health checks passing

**Smoke Testing** (30-45 min)
- [ ] API responding
- [ ] Authentication working
- [ ] Core operations functional
- [ ] AI features operational
- [ ] No errors in logs

**Monitoring** (15 min)
- [ ] Process health verified
- [ ] Performance baseline established
- [ ] Alerting configured
- [ ] Team notified

**Sign-Off**
- [ ] Deployment lead approval
- [ ] Security team sign-off
- [ ] Operations team acknowledgment
- [ ] Team notified of deployment

---

## CONTACTS & ESCALATION

**Deployment Team**
- Lead: [Name] - [Phone]
- Database: [Name] - [Phone]
- Infrastructure: [Name] - [Phone]
- On-Call: See PagerDuty

**Slack Channels**
- #spofe-deployment (deployment status)
- #spofe-incidents (urgent issues)
- #spofe-team (general team channel)

**Incident Response**
1. Page on-call engineer
2. Post in #spofe-incidents
3. Begin diagnostics (check logs)
4. If critical: initiate rollback
5. Document incident
6. Post-mortem within 24 hours

---

**Deployment Guide Version**: 2.2  
**Last Updated**: 2026-01-25  
**Approved by**: Architecture Team  
**Next Review**: 2026-02-25
