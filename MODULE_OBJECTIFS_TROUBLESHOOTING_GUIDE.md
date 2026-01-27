# MODULE OBJECTIFS - TROUBLESHOOTING GUIDE
## Quick Solutions to Common Problems

**Version**: 2.2  
**Last Updated**: 2026-01-25  
**Audience**: Developers & Operations  
**Use This For**: Quick issue resolution during development and deployment

---

## TABLE OF CONTENTS

1. [Connection & Setup Issues](#connection--setup-issues)
2. [Authentication & Authorization](#authentication--authorization)
3. [Database Issues](#database-issues)
4. [API Response Issues](#api-response-issues)
5. [Performance Problems](#performance-problems)
6. [Testing Issues](#testing-issues)
7. [Deployment Problems](#deployment-problems)
8. [AI & Service Issues](#ai--service-issues)

---

## CONNECTION & SETUP ISSUES

### Problem: "Port 3001 already in use"

**Symptoms**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions**

Option 1: Kill process on port
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Restart server
npm run dev
```

Option 2: Use different port
```bash
# Start on different port
PORT=3002 npm run dev
```

Option 3: Wait and retry
```bash
# Wait 30 seconds for port to release
sleep 30 && npm run dev
```

---

### Problem: "Cannot find module 'express'"

**Symptoms**
```
Error: Cannot find module 'express'
```

**Solutions**

```bash
# Reinstall dependencies
npm install

# If specific package missing
npm install express

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (should be 16+)
node -v
```

---

### Problem: "Module not found: app.js"

**Symptoms**
```
Error: Cannot find module './src/app.js'
```

**Solutions**

```bash
# Verify file exists
ls -la cascade/src/app.js

# Check current directory
pwd
# Should be at project root

# From project root, try:
node cascade/src/server.js

# Or fix require path
cd cascade
npm run dev
```

---

## AUTHENTICATION & AUTHORIZATION

### Problem: "Unauthorized" on all requests

**Symptoms**
```
{
  "success": false,
  "code": 401,
  "message": "Authorization required"
}
```

**Causes & Solutions**

1. **Missing token**
   ```bash
   # Get token first
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password123"}'
   
   # Save token and use it
   export TOKEN="<token_from_response>"
   
   # Use in request
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/objectives
   ```

2. **Invalid token format**
   ```bash
   # Wrong: Missing "Bearer" prefix
   -H "Authorization: eyJhbGc..."
   
   # Correct: Include "Bearer " prefix
   -H "Authorization: Bearer eyJhbGc..."
   ```

3. **Expired token**
   - Tokens expire after 24 hours
   - Request new token via /api/auth/login
   - Store token securely

4. **Invalid JWT_SECRET in .env**
   ```bash
   # Check .env has JWT_SECRET
   cat .env | grep JWT_SECRET
   
   # If missing or empty
   echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
   
   # Restart server
   npm run dev
   ```

---

### Problem: "Invalid token" even with valid token

**Symptoms**
```
{
  "success": false,
  "code": 401,
  "message": "Invalid token"
}
```

**Solutions**

```bash
# 1. Verify JWT_SECRET matches between login and request
# In .env, should be same SECRET used for both

# 2. Check token hasn't been modified
echo "Token should be exactly: Bearer eyJhbGc...xyz"
# (no spaces, no modifications)

# 3. Check token format
# It should be: "Bearer <long string with 3 dots>"

# 4. Generate new token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' \
  | jq -r '.data.token' > token.txt

# Use new token
curl -H "Authorization: Bearer $(cat token.txt)" \
  http://localhost:3001/api/objectives
```

---

## DATABASE ISSUES

### Problem: "Database connection refused"

**Symptoms**
```
SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions**

1. **Check MySQL is running**
   ```bash
   # Check service status
   sudo systemctl status mysql
   
   # Start if not running
   sudo systemctl start mysql
   
   # Verify listening on 3306
   sudo netstat -tlnp | grep mysql
   ```

2. **Check credentials in .env**
   ```bash
   # Verify database configuration
   grep -E "DB_HOST|DB_USER|DB_PASSWORD|DB_NAME" .env
   
   # Test connection
   mysql -h ${DB_HOST} -u ${DB_USER} -p ${DB_PASSWORD} -e "SELECT 1;"
   ```

3. **Check firewall**
   ```bash
   # If MySQL on remote server
   # Allow port 3306
   sudo ufw allow 3306
   
   # Or check firewall rules
   sudo iptables -L | grep 3306
   ```

4. **Check network**
   ```bash
   # Ping database server
   ping 127.0.0.1
   
   # Test port connectivity
   nc -zv 127.0.0.1 3306
   ```

---

### Problem: "Table does not exist" error

**Symptoms**
```
SequelizeError: Table 'spofe.strategic_objectives' doesn't exist
```

**Solutions**

```bash
# 1. Check if tables exist
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e "SHOW TABLES;"

# 2. Run migrations to create tables
npm run migrate

# 3. If migrations not found, create manually
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} < \
  cascade/migrations/create-strategic-objectives.sql

# 4. Verify tables created
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e "SHOW TABLES;"

# Expected output should show:
# strategic_objectives
# performance_indicators
# objective_actions
# external_data_sources
```

---

### Problem: "Duplicate key" error on insert

**Symptoms**
```
SequelizeUniqueConstraintError: Duplicate entry '1' for key 'PRIMARY'
```

**Solutions**

```bash
# 1. Check if record exists
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT * FROM strategic_objectives WHERE id = 1;"

# 2. If record exists, update instead of insert
PATCH /api/objectives/1

# 3. Or delete first, then insert
DELETE FROM strategic_objectives WHERE id = 1;

# 4. Reset auto-increment if needed
ALTER TABLE strategic_objectives AUTO_INCREMENT = 1;
```

---

### Problem: Database locked / slow queries

**Symptoms**
```
Lock wait timeout exceeded
SLOW QUERY detected
```

**Solutions**

```bash
# 1. Check running processes
mysql -u ${DB_USER} -p ${DB_PASSWORD} -e "SHOW PROCESSLIST;"

# 2. Kill long-running query
mysql -u ${DB_USER} -p ${DB_PASSWORD} -e "KILL <PROCESS_ID>;"

# 3. Enable slow query log
mysql -u ${DB_USER} -p ${DB_PASSWORD} -e \
  "SET GLOBAL slow_query_log = 'ON';"

# 4. Check slow queries
tail -f /var/log/mysql/slow-query.log

# 5. Optimize slow query (add index)
ALTER TABLE strategic_objectives \
  ADD INDEX idx_compagnie_id (compagnieId);

# 6. Analyze table
ANALYZE TABLE strategic_objectives;
```

---

## API RESPONSE ISSUES

### Problem: "Bad Request" - Validation errors

**Symptoms**
```
{
  "success": false,
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "titre": ["Title is required"]
  }
}
```

**Solutions**

1. **Missing required fields**
   ```bash
   # Wrong: Missing titre
   curl -X POST http://localhost:3001/api/objectives \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"compagnieId": 1}'
   
   # Correct: Include titre
   curl -X POST http://localhost:3001/api/objectives \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "compagnieId": 1,
       "titre": "My objective",
       "type": "vente",
       "dateDebut": "2026-01-25",
       "dateFin": "2026-03-31"
     }'
   ```

2. **Invalid field types**
   ```bash
   # Wrong: progression as string
   "progression": "50"
   
   # Correct: progression as number
   "progression": 50
   
   # Wrong: dateDebut as text
   "dateDebut": "2026-01-25"
   
   # Correct: ISO 8601 format
   "dateDebut": "2026-01-25T00:00:00Z"
   ```

3. **Invalid enum values**
   ```bash
   # Wrong: invalid type
   "type": "unknown"
   
   # Correct: must be one of
   "type": "vente"  # or "production", "finance"
   ```

4. **Date format issues**
   ```bash
   # Wrong: American format
   "dateDebut": "01/25/2026"
   
   # Correct: ISO 8601
   "dateDebut": "2026-01-25T00:00:00Z"
   
   # Correct: Simple date (gets midnight UTC)
   "dateDebut": "2026-01-25"
   ```

---

### Problem: "Not Found" error (404)

**Symptoms**
```
{
  "success": false,
  "code": 404,
  "message": "Objective not found"
}
```

**Solutions**

```bash
# 1. Verify ID exists
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT id, titre FROM strategic_objectives LIMIT 10;"

# 2. Use valid ID from query
curl http://localhost:3001/api/objectives/1 \
  -H "Authorization: Bearer $TOKEN"

# 3. Check if record was deleted
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT * FROM strategic_objectives WHERE id = 1 AND deletedAt IS NULL;"

# 4. If deleted, restore it
PATCH /api/objectives/1/restore
```

---

### Problem: "Internal Server Error" (500)

**Symptoms**
```
{
  "success": false,
  "code": 500,
  "message": "Internal server error"
}
```

**Solutions**

```bash
# 1. Check server logs
tail -f logs/error.log

# 2. Check specific error line
grep "500\|ERROR\|CRITICAL" logs/error.log | tail -20

# 3. Enable debug logging
LOG_LEVEL=debug npm run dev

# 4. Test with curl -v for full response
curl -v http://localhost:3001/api/objectives \
  -H "Authorization: Bearer $TOKEN"

# 5. Check database connection
node -e "require('./src/config/database.js').authenticate()"

# 6. Restart server
npm run dev
```

**Common Causes**
- Database connection lost
- Unhandled exception in controller
- Service dependency failure
- Environment variable missing

---

## PERFORMANCE PROBLEMS

### Problem: Slow API responses (> 1 second)

**Symptoms**
- API requests take > 1000ms
- User complaints about slowness
- Load testing shows poor performance

**Solutions**

1. **Check database queries**
   ```bash
   # Enable query logging
   mysql -u ${DB_USER} -p ${DB_PASSWORD} -e \
     "SET GLOBAL general_log = 'ON';" 
   
   # View queries
   tail -f /var/log/mysql/general.log
   
   # Look for slow queries (missing indexes)
   # Add indexes on frequently queried columns
   ```

2. **Check eager loading**
   ```javascript
   // BAD: N+1 queries
   const objectives = await StrategicObjective.findAll();
   for (let obj of objectives) {
     const indicators = await obj.getIndicators(); // Extra query per objective
   }
   
   // GOOD: Eager loading
   const objectives = await StrategicObjective.findAll({
     include: [PerformanceIndicator]
   });
   ```

3. **Enable caching**
   ```bash
   # Check if Redis is running
   redis-cli ping
   # Should return: PONG
   
   # If not running, start it
   redis-server
   ```

4. **Monitor response times**
   ```bash
   # Time requests
   time curl http://localhost:3001/api/objectives \
     -H "Authorization: Bearer $TOKEN"
   
   # Expected: real 0.050s (50ms)
   # Warning: real > 0.500s (500ms)
   # Critical: real > 1.000s (1 second)
   ```

5. **Check memory usage**
   ```bash
   # Monitor memory
   watch -n 1 'free -h'
   
   # Check process memory
   ps aux | grep "node\|server.js"
   
   # If using > 500MB RAM:
   # - Reduce batch sizes
   # - Enable caching
   # - Optimize queries
   ```

---

### Problem: High CPU usage

**Symptoms**
- CPU at 80-100%
- Server becoming unresponsive
- Process killing itself

**Solutions**

```bash
# 1. Check which process is using CPU
top -b -n 1 | head -15

# 2. Check Node.js process details
ps aux | grep "node\|server.js"

# 3. Profile with node profiler
node --prof cascade/src/server.js

# 4. Find bottleneck
node --prof-process isolate-*.log > profile.txt
less profile.txt

# 5. Common causes:
# - Tight loop in AI calculations
# - Memory leak causing GC thrashing
# - Inefficient regex/string operations

# 6. Quick fix
npm run dev --max-old-space-size=2048  # Increase heap
```

---

## TESTING ISSUES

### Problem: "Tests failing locally but pass on CI"

**Symptoms**
```
FAIL  objectives.test.js
  × CREATE OBJECTIVE
  Expected 200, got 500
```

**Causes & Solutions**

1. **Database state**
   ```bash
   # Clear database before tests
   npm run db:reset
   
   # Then run tests
   npm test
   ```

2. **Port conflicts**
   ```bash
   # Kill port 3001
   lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
   
   # Try tests again
   npm test
   ```

3. **Environment variables**
   ```bash
   # Check .env file exists
   ls .env
   
   # Verify required variables
   grep -E "DB_HOST|JWT_SECRET|REDIS" .env
   ```

4. **Node version**
   ```bash
   # Check Node.js version
   node -v
   # Should be 16.x or higher
   
   # Update if needed
   nvm install 16
   nvm use 16
   ```

---

### Problem: "Timeout exceeded" in tests

**Symptoms**
```
FAIL  indicators.test.js
  × GET DETAIL
  Timeout - Async callback was not invoked within the 5000 ms timeout specified
```

**Solutions**

```javascript
// 1. Increase timeout for specific test
test('should get detail', async () => {
  // test code
}, 10000);  // 10 second timeout

// 2. Increase timeout globally
jest.setTimeout(15000);

// 3. Check for unresolved promises
// Make sure all async operations complete

// 4. Check database is responding
// Run: mysql -u user -p password -e "SELECT 1;"
```

---

## DEPLOYMENT PROBLEMS

### Problem: Deployment fails at migration step

**Symptoms**
```
Error: Migration failed
SequelizeError: Duplicate column 'id'
```

**Solutions**

```bash
# 1. Check migration status
npm run migration:status

# 2. List applied migrations
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} \
  -e "SELECT * FROM SequelizeMeta;"

# 3. Undo last migration if it failed
npm run migration:undo

# 4. Check migration file syntax
cat cascade/migrations/201-create-strategic-objectives.js

# 5. Reapply migration
npm run migrate
```

---

### Problem: Service crashes after deployment

**Symptoms**
```
pm2 status shows "crashed" or "errored"
No logs appearing
```

**Solutions**

```bash
# 1. Check PM2 logs
pm2 logs spofe-objectives

# 2. Check application logs
tail -f logs/error.log

# 3. Start in foreground to see errors
pm2 start cascade/src/server.js --no-daemon

# 4. Check environment variables
env | grep DB_

# 5. Test manually
node cascade/src/server.js

# 6. Common issues:
# - Missing .env file
# - Database not running
# - Port in use
# - Dependencies not installed
```

---

## AI & SERVICE ISSUES

### Problem: "Prediction returns null"

**Symptoms**
```
"prediction": null
"probability": null
```

**Solutions**

```bash
# 1. Check objective has indicators
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT COUNT(*) FROM performance_indicators WHERE objectiveId = 1;"

# 2. Check indicators have recorded values
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT COUNT(*) FROM performance_values WHERE indicatorId = 1;"

# 3. If no values, record some
curl -X POST http://localhost:3001/api/indicators/1/record \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "indicatorId": 1,
    "valeur": 45.5,
    "date": "2026-01-25"
  }'

# 4. Check AI engine logs
grep "StrategicAI\|prediction" logs/combined.log
```

---

### Problem: "Anomaly detection not working"

**Symptoms**
```
"anomalies": []  (empty array)
No anomalies detected
```

**Solutions**

```bash
# 1. Need historical data (multiple values)
mysql -u ${DB_USER} -p ${DB_PASSWORD} ${DB_NAME} -e \
  "SELECT COUNT(*) FROM performance_values;"

# 2. Record multiple values with different dates
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/indicators/1/record \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "indicatorId": 1,
      "valeur": '$(shuf -i 20-80 -n 1)',
      "date": "'$(date -d "-$i days" +%Y-%m-%d)'"
    }'
done

# 3. Now try anomaly detection
curl -X GET http://localhost:3001/api/objectives/1/ai/anomalies \
  -H "Authorization: Bearer $TOKEN"
```

---

### Problem: Report generation takes too long

**Symptoms**
```
Report generation > 30 seconds
Timeout on report endpoint
```

**Solutions**

```bash
# 1. Check if Redis is available
redis-cli ping

# 2. Start Redis if not running
redis-server

# 3. Check database performance
mysql -u ${DB_USER} -p ${DB_PASSWORD} -e \
  "SHOW PROCESSLIST;"

# 4. Kill slow queries
mysql -u ${DB_USER} -p ${DB_PASSWORD} -e \
  "KILL <PROCESS_ID>;"

# 5. Optimize report query
# Use aggregation and indexes
ALTER TABLE performance_values \
  ADD INDEX idx_indicator_date (indicatorId, date);

# 6. Test report again
curl -X POST http://localhost:3001/api/objectives/ai/report-strategic \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"compagnieId": 1}'
```

---

## QUICK REFERENCE

### Common Commands

```bash
# Start development
npm run dev

# Run all tests
npm test

# Run specific test
npm test objectives.test.js

# Check health
curl http://localhost:3001/api/health

# View logs
tail -f logs/error.log

# Stop server
ctrl + C

# Restart PM2 process
pm2 restart spofe-objectives
```

### File Locations

| File | Path |
|------|------|
| Controllers | cascade/src/controllers/ |
| Routes | cascade/src/routes/ |
| Models | cascade/src/models/ |
| Tests | cascade/tests/integration/ |
| Logs | logs/ |
| Config | .env |
| Database | MySQL database |

### Key URLs

| Endpoint | URL |
|----------|-----|
| Health | http://localhost:3001/api/health |
| Login | POST http://localhost:3001/api/auth/login |
| List Objectives | GET http://localhost:3001/api/objectives |
| Create Objective | POST http://localhost:3001/api/objectives |

---

## GETTING HELP

If you can't find the solution here:

1. **Check logs first**
   ```bash
   tail -f logs/error.log
   ```

2. **Search documentation**
   - [Team Handbook](MODULE_OBJECTIFS_TEAM_HANDBOOK.md)
   - [Deployment Guide](MODULE_OBJECTIFS_DEPLOYMENT_GUIDE.md)
   - [API Docs](API_DOCUMENTATION.md)

3. **Ask on Slack**
   - #spofe-development
   - Tag @development-team

4. **Check GitHub Issues**
   - Search for similar problems
   - Create new issue if needed

5. **Contact On-Call**
   - See team roster in shared drive
   - PagerDuty: urgent issues

---

**Troubleshooting Guide v2.2**  
**Last Updated**: 2026-01-25  
**Maintained by**: Development Team
