# 🔧 NGINX Load Balancer - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **502 Bad Gateway Error**

**Symptom**: Browser shows "502 Bad Gateway"

**Root Causes**:
- Backend instances not running
- Backend instances crashed
- Nginx can't connect to backend

**Solutions**:

#### **Check Instance Status**
```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml ps

# Expected output: All instances running
# api-instance-1  UP  (healthy)
# api-instance-2  UP  (healthy)
# api-instance-3  UP  (healthy)
# api-instance-4  UP  (healthy)

# PM2
pm2 status

# Expected: All online
```

#### **Check Instance Logs**
```bash
# Docker - View all logs
docker-compose -f docker-compose.multi-instance.yml logs

# Docker - View specific instance
docker logs cascade_api-instance-1_1 -f

# PM2 - View logs
pm2 logs
```

#### **Restart Services**
```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml restart

# PM2
pm2 restart all
```

#### **Check Port Availability**
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :80

# macOS/Linux
lsof -i :3001
lsof -i :80
```

---

### 2. **Connection Refused (Cannot Connect to Nginx)**

**Symptom**: `curl: (7) Failed to connect to localhost port 80`

**Root Causes**:
- Nginx not running
- Port 80 in use
- Firewall blocking

**Solutions**:

#### **Check Nginx Status**
```bash
# Docker
docker ps | grep nginx
docker logs cascade_nginx_1

# Manual
sudo systemctl status nginx
```

#### **Check Port 80 Availability**
```bash
# Windows
netstat -ano | findstr LISTENING | findstr :80

# macOS/Linux
lsof -i :80

# If port 80 in use by another process, either:
# 1. Stop that process
# 2. Change Nginx port to 8080 in nginx/spofe-backend.conf
```

#### **Firewall Issues**
```bash
# Windows - Allow through firewall
# Windows Defender Firewall → Allow an app → Add nginx.exe

# macOS
# System Preferences → Security & Privacy → Firewall

# Linux
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

### 3. **All Instances Down / Cannot Start**

**Symptom**: All instances failing to start or immediately crashing

**Root Causes**:
- Port conflicts
- Configuration error
- Database not running
- Redis not running

**Solutions**:

#### **Check Database**
```bash
# Docker
docker ps | grep mysql
docker logs cascade_mysql_1

# Manual - Test connection
mysql -h localhost -u spofe_user -p spofe_db

# If not running:
docker-compose -f docker-compose.multi-instance.yml up -d mysql
```

#### **Check Redis**
```bash
# Docker
docker ps | grep redis
docker logs cascade_redis_1

# Manual - Test connection
redis-cli ping
# Should return: PONG

# If not running:
docker-compose -f docker-compose.multi-instance.yml up -d redis
```

#### **Check Configuration**
```bash
# Validate Nginx config
docker exec cascade_nginx_1 nginx -t

# Review environment variables
cat .env | grep -E "DB_|REDIS_|JWT_"
```

#### **Check Port Conflicts**
```bash
# Windows
netstat -ano | findstr LISTENING | findstr "3001\|3002\|3003\|3004"

# macOS/Linux
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004
```

---

### 4. **Sessions Not Persisting (Lost on Failover)**

**Symptom**: Logged in on instance 1, redirected to instance 2, session lost

**Root Causes**:
- Redis not running
- Redis not configured correctly
- Session key mismatch

**Solutions**:

#### **Verify Redis Connection**
```bash
# Docker - Connect to Redis
docker exec cascade_redis_1 redis-cli

# Check sessions
keys SESS_*
# Should show active sessions

# Check specific session
get SESS_abc123
```

#### **Check Environment Variables**
```bash
# Ensure REDIS_HOST and REDIS_PASSWORD set correctly
grep REDIS .env

# Should be:
# REDIS_HOST=redis  (or localhost if manual)
# REDIS_PASSWORD=redis_secure_password
```

#### **Restart Redis and Instances**
```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml restart redis
docker-compose -f docker-compose.multi-instance.yml restart

# PM2
pm2 restart all
```

#### **Clear Sessions and Test**
```bash
# Docker - Clear Redis cache
docker exec cascade_redis_1 redis-cli FLUSHDB

# Then login again and verify session persists across instances
```

---

### 5. **Rate Limiting Too Strict / Too Lenient**

**Symptom**: Legitimate requests blocked (429) or no rate limiting

**Root Causes**:
- Rate limit set too low/high
- Configuration not reloaded

**Solutions**:

#### **Check Current Limits**
```bash
# View Nginx config
cat nginx/spofe-backend.conf | grep "limit_req_zone"

# Current defaults:
# - 100 req/s for general API
# - 10 req/s for auth endpoints
```

#### **Adjust Rate Limits**

Edit `nginx/spofe-backend.conf`:

```nginx
# For GENERAL API (increase to 200 req/s):
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=200r/s;

# For AUTH endpoints (increase to 20 req/s):
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=20r/s;
```

#### **Reload Nginx**
```bash
# Docker
docker exec cascade_nginx_1 nginx -s reload

# Manual
sudo nginx -s reload
```

#### **Test New Limits**
```bash
# Generate requests and check for 429
for i in {1..200}; do curl http://localhost/health; done
```

---

### 6. **High Latency / Slow Response**

**Symptom**: Requests taking 5+ seconds

**Root Causes**:
- Instances overloaded
- Database slow
- Network issues
- Memory pressure

**Solutions**:

#### **Check Instance Load**
```bash
# Docker
docker stats

# Look for high CPU/Memory

# PM2
pm2 monit

# System (Windows)
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# System (macOS/Linux)
top
```

#### **Check Database Performance**
```bash
# Docker - Connect to MySQL
docker exec cascade_mysql_1 mysql -u spofe_user -p spofe_db

# Show slow queries
SHOW VARIABLES LIKE 'slow_query%';

# Check current connections
SHOW PROCESSLIST;
```

#### **Check Memory Usage**
```bash
# Docker - Check container memory
docker stats cascade_api-instance-1_1

# If memory high, increase limit:
# Edit docker-compose.multi-instance.yml
# Add to service: mem_limit: 1g

# PM2 - View memory usage
pm2 status

# PM2 - If memory high, increase max_memory_restart
# Edit ecosystem.config.js
# max_memory_restart: '800M'
```

#### **Scale to More Instances**
```bash
# Docker - Add instance 5
# Copy api-instance-4 in docker-compose.multi-instance.yml
# Change port to 3005, INSTANCE_ID to 5

# Update nginx/spofe-backend.conf
# Add: server localhost:3005 max_fails=2 fail_timeout=30s;

# Restart
docker-compose -f docker-compose.multi-instance.yml up -d
```

---

### 7. **Nginx Not Load-Balancing (Always Goes to Same Instance)**

**Symptom**: All traffic goes to one instance

**Root Causes**:
- IP-based session affinity
- Wrong load balancing algorithm
- Upstream not configured correctly

**Solutions**:

#### **Check Nginx Configuration**
```bash
# View upstream config
grep -A 10 "upstream backend_cluster" nginx/spofe-backend.conf

# Verify it has all 4 instances
```

#### **Verify Load Balancing Algorithm**
```bash
# Check algorithm is set to least_conn
grep "least_conn" nginx/spofe-backend.conf

# If not found, ensure this line is in upstream block:
# least_conn;
```

#### **Test Load Distribution**
```bash
# Make 10 requests and log responses
for i in {1..10}; do 
  curl -I http://localhost/health 2>/dev/null | head -n1
done

# Check logs to see which instance handled each
docker logs cascade_api-instance-1_1
docker logs cascade_api-instance-2_1
docker logs cascade_api-instance-3_1
docker logs cascade_api-instance-4_1
```

#### **Reload Nginx Configuration**
```bash
docker exec cascade_nginx_1 nginx -s reload
```

---

### 8. **Failover Not Working (Dead Instance Still Gets Traffic)**

**Symptom**: When stopping an instance, it still gets requests (502 errors)

**Root Causes**:
- Health checks disabled
- Health check interval too long
- Backend doesn't respond to health checks

**Solutions**:

#### **Check Health Check Configuration**
```bash
# View Nginx config
grep -A 5 "health_uri\|health_check" nginx/spofe-backend.conf

# Nginx Plus has health checks
# OpenSource Nginx needs alternative approach
```

#### **For Nginx Plus**
```nginx
# Ensure health checks configured:
upstream backend_cluster {
    zone backend 64k;
    server localhost:3001 max_fails=2 fail_timeout=30s;
    # ...
    
    # Health check settings (Nginx Plus)
    health_uri /health;
    health_interval 2000ms;
    health_timeout 1000ms;
    health_failures 3;
    health_passes 2;
}
```

#### **For Open Source Nginx**
```bash
# Use passive health checks (default)
# With: max_fails=2 fail_timeout=30s

# Or use monitoring script:
# Create external health check service
```

#### **Test Failover Manually**
```bash
# Stop instance 1
docker stop cascade_api-instance-1_1

# Verify no 502 errors (should take ~30s)
for i in {1..10}; do 
  curl -s http://localhost/health
  sleep 3
done

# Restart instance
docker start cascade_api-instance-1_1
```

---

### 9. **Database Connection Pool Exhausted**

**Symptom**: `Error: PROTOCOL_ACQUIRE_TIMEOUT`

**Root Causes**:
- Too many long-running queries
- Queries not properly closed
- Connection leak

**Solutions**:

#### **Check Connection Usage**
```bash
# Docker - Connect to MySQL
docker exec cascade_mysql_1 mysql -u spofe_user -p spofe_db

# Show current connections
SHOW PROCESSLIST;

# Show max connections
SHOW VARIABLES LIKE 'max_connections';
```

#### **Increase Connection Pool**
```bash
# Edit .env
DB_POOL_MAX=30  # Increase from 20

# Restart instances
docker-compose -f docker-compose.multi-instance.yml restart
```

#### **Find Slow Queries**
```bash
# Enable slow query log
# Edit my.cnf or set in docker-compose.multi-instance.yml
# slow_query_log=1
# long_query_time=2

# Then check:
SHOW VARIABLES LIKE 'slow_query_log%';
```

#### **Close Idle Connections**
```bash
# Edit .env
DB_POOL_IDLE=5000  # Reduce timeout to close idle connections faster
```

---

### 10. **Memory Leak (Memory Usage Keeps Growing)**

**Symptom**: Instance memory increases over time, eventually crashes

**Root Causes**:
- Event listener not cleaned up
- Cache growing unbounded
- Buffer accumulation

**Solutions**:

#### **Check Memory Trend**
```bash
# Docker
docker stats cascade_api-instance-1_1 --no-stream

# Watch over time
watch -n 1 'docker stats --no-stream'

# PM2
pm2 status
```

#### **Enable Memory Limit & Restart**
```bash
# Docker - Edit docker-compose.multi-instance.yml
api-instance-1:
  mem_limit: 512m
  memswap_limit: 512m

# PM2 - Edit ecosystem.config.js
max_memory_restart: '500M'

# Restart
docker-compose -f docker-compose.multi-instance.yml restart
# or
pm2 restart all
```

#### **Check Cache Size**
```bash
# Docker - Connect to Redis
docker exec cascade_redis_1 redis-cli

# Check memory usage
INFO memory
# Look for: used_memory_human

# If high, flush cache
FLUSHDB

# Or set TTL
EXPIRE cache_key 3600  # 1 hour
```

---

## 📊 Diagnostic Commands

### **Complete Health Check**
```bash
#!/bin/bash
echo "=== Nginx Status ==="
curl -s http://localhost/nginx_status | head -5

echo -e "\n=== Instance 1 ==="
curl -s http://localhost:3001/health

echo -e "\n=== Instance 2 ==="
curl -s http://localhost:3002/health

echo -e "\n=== Instance 3 ==="
curl -s http://localhost:3003/health

echo -e "\n=== Instance 4 ==="
curl -s http://localhost:3004/health

echo -e "\n=== Database ==="
docker exec cascade_mysql_1 mysql -u spofe_user -p -e "SELECT COUNT(*) FROM users;"

echo -e "\n=== Redis ==="
docker exec cascade_redis_1 redis-cli ping

echo -e "\n=== Docker Containers ==="
docker ps

echo -e "\n=== Resource Usage ==="
docker stats --no-stream
```

### **Windows PowerShell Health Check**
```powershell
function Test-SPOFE {
    Write-Host "=== Health Checks ===" -ForegroundColor Green
    
    $endpoints = @(
        "http://localhost/health",
        "http://localhost:3001/health",
        "http://localhost:3002/health",
        "http://localhost:3003/health",
        "http://localhost:3004/health"
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5
            Write-Host "✅ $endpoint - OK" -ForegroundColor Green
        } catch {
            Write-Host "❌ $endpoint - FAILED" -ForegroundColor Red
        }
    }
}

Test-SPOFE
```

---

## 🚀 Recovery Procedures

### **Complete Service Recovery**

```bash
# 1. Stop everything
docker-compose -f docker-compose.multi-instance.yml down

# 2. Clean volumes (WARNING: deletes data!)
docker-compose -f docker-compose.multi-instance.yml down -v

# 3. Start fresh
docker-compose -f docker-compose.multi-instance.yml up -d

# 4. Wait for initialization
sleep 30

# 5. Verify
bash cascade/validate-nginx-lb.sh
```

### **Database Recovery**

```bash
# 1. Stop containers
docker-compose -f docker-compose.multi-instance.yml down

# 2. Backup current database
docker run --volumes-from cascade_mysql_1 -v $(pwd):/backup \
  mysql:8.0 \
  mysqldump -u spofe_user -p spofe_db > backup.sql

# 3. Restore from backup
docker run -i --rm \
  -v $(pwd):/backup \
  mysql:8.0 \
  mysql -h mysql -u spofe_user -p spofe_db < backup.sql

# 4. Restart
docker-compose -f docker-compose.multi-instance.yml up -d
```

---

## 📝 Logging Best Practices

### **Check Logs Systematically**

```bash
# 1. Nginx logs
docker logs cascade_nginx_1 | tail -50

# 2. API logs (all instances)
docker logs cascade_api-instance-1_1 | tail -50
docker logs cascade_api-instance-2_1 | tail -50

# 3. MySQL logs
docker logs cascade_mysql_1 | tail -50

# 4. Redis logs
docker logs cascade_redis_1 | tail -50
```

### **Enable Debug Logging**

Edit `.env`:
```bash
LOG_LEVEL=debug
NGINX_DEBUG=on
```

Then restart:
```bash
docker-compose -f docker-compose.multi-instance.yml restart
```

---

## ⚠️ Prevention Tips

1. **Monitor regularly**: Setup alerts for high CPU/memory
2. **Test failover**: Schedule monthly failover tests
3. **Keep logs**: Archive logs for debugging
4. **Update dependencies**: Regular security updates
5. **Load test**: Test before major traffic increases
6. **Backup database**: Daily automated backups
7. **Document changes**: Keep deployment notes

