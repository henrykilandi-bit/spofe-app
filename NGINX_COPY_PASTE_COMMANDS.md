# 🚀 NGINX Load Balancer - Copy-Paste Commands

## ⚡ Deploy in 5 Minutes (Docker)

### **Step 1: Deploy**

#### **macOS/Linux**
```bash
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0"
bash cascade/deploy-nginx-lb.sh docker
```

#### **Windows PowerShell**
```powershell
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0"
.\cascade\deploy-nginx-lb.ps1 -DeploymentType docker
```

### **Step 2: Wait & Verify**
```bash
# Check services started (wait 30 seconds)
docker-compose -f docker-compose.multi-instance.yml ps

# Expected output:
# cascade_nginx_1           Up (healthy)
# cascade_api-instance-1_1  Up (healthy)
# cascade_api-instance-2_1  Up (healthy)
# cascade_api-instance-3_1  Up (healthy)
# cascade_api-instance-4_1  Up (healthy)
# cascade_mysql_1           Up (healthy)
# cascade_redis_1           Up (healthy)
```

### **Step 3: Test**

#### **Test Health**
```bash
curl http://localhost/health
# Expected: JSON response with status "ok"
```

#### **Test All Instances**
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
# Expected: All return 200 OK
```

#### **Run Full Validation**

**macOS/Linux**:
```bash
bash cascade/validate-nginx-lb.sh
```

**Windows PowerShell**:
```powershell
.\cascade\validate-nginx-lb.ps1
```

### **Step 4: Load Test**
```bash
npm run load:setup     # One time
npm run load:k6        # Run K6 test (~30 seconds)
npm run load:artillery # Run Artillery test (~60 seconds)
npm run load:report    # View HTML report
```

---

## 📊 Monitoring Commands

### **Docker Status**
```bash
# List all containers
docker-compose -f docker-compose.multi-instance.yml ps

# View real-time resource usage
docker stats

# View logs from all services
docker-compose -f docker-compose.multi-instance.yml logs -f

# View logs from specific service
docker logs cascade_nginx_1 -f
docker logs cascade_api-instance-1_1 -f
docker logs cascade_mysql_1 -f
docker logs cascade_redis_1 -f
```

### **PM2 Status (if using PM2)**
```bash
# View all processes
pm2 status

# Monitor real-time
pm2 monit

# View logs
pm2 logs

# View logs from specific app
pm2 logs spofe-api
```

### **Health Endpoints**
```bash
# Load balancer health
curl http://localhost/health

# Nginx status
curl http://localhost/nginx_status

# Individual instances
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

---

## 🛑 Stop & Cleanup

### **Stop All Services**
```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml down

# PM2
pm2 stop all
pm2 delete all
```

### **Remove All Data (WARNING!)**
```bash
# Docker - Remove containers and volumes
docker-compose -f docker-compose.multi-instance.yml down -v

# PM2 - Clear all logs
pm2 flush
```

### **Restart Services**
```bash
# Docker - Restart all
docker-compose -f docker-compose.multi-instance.yml restart

# Docker - Restart specific service
docker-compose -f docker-compose.multi-instance.yml restart api-instance-1

# PM2
pm2 restart all
pm2 restart spofe-api
```

---

## 🔍 Troubleshooting Commands

### **Check What's Running**
```bash
# Docker
docker ps

# Windows - Check ports
netstat -ano | findstr LISTENING | findstr "3001\|3002\|3003\|3004"

# macOS/Linux - Check ports
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004
```

### **Database Commands**

```bash
# Connect to MySQL
docker exec cascade_mysql_1 mysql -u spofe_user -p spofe_db

# Then in MySQL:
SHOW TABLES;
SELECT COUNT(*) FROM users;
SHOW PROCESSLIST;  # Check current connections
```

### **Redis Commands**

```bash
# Connect to Redis
docker exec cascade_redis_1 redis-cli

# Then in Redis:
KEYS *          # List all keys
KEYS SESS_*     # List sessions
GET key_name    # Get value
FLUSHDB         # Clear cache
INFO memory     # Check memory usage
```

### **View Logs**

```bash
# All logs together
docker-compose -f docker-compose.multi-instance.yml logs

# Follow logs (tail -f)
docker-compose -f docker-compose.multi-instance.yml logs -f

# Last 50 lines
docker-compose -f docker-compose.multi-instance.yml logs --tail=50

# Specific service
docker logs cascade_api-instance-1_1
docker logs cascade_nginx_1 | head -20  # First 20 lines
docker logs cascade_nginx_1 | tail -20  # Last 20 lines
```

---

## 🧪 Testing Scenarios

### **Test Load Balancing**
```bash
# Make 10 requests and see which instance handles each
for i in {1..10}; do 
  curl -s http://localhost/health | grep -o "instance.*[0-9]"
done
```

### **Test Failover**
```bash
# Terminal 1: Monitor traffic
watch -n 1 'curl -s http://localhost/health'

# Terminal 2: Stop an instance
docker-compose -f docker-compose.multi-instance.yml stop api-instance-1

# Terminal 1: Should see requests continue to other instances
# After ~30 seconds, api-instance-1 removed from LB

# Terminal 2: Restart instance
docker-compose -f docker-compose.multi-instance.yml start api-instance-1
```

### **Test Rate Limiting**
```bash
# Generate 200 rapid requests and count 429 responses
for i in {1..200}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost/health
done | grep -c 429  # Should see some 429 responses
```

### **Load Test (K6)**
```bash
# Single scenario
npm run load:k6

# Custom duration & load
cd cascade/load-testing/k6
k6 run spofe-baseline.js --vus 100 --duration 60s
```

### **Load Test (Artillery)**
```bash
# Run artillery
npm run load:artillery

# Custom config
cd cascade/load-testing/artillery
artillery run spofe-normal.yml
```

---

## 🔐 Configuration Management

### **Update Environment Variables**
```bash
# Edit .env file
nano .env      # Linux/macOS
notepad .env   # Windows

# Then restart services
docker-compose -f docker-compose.multi-instance.yml restart

# Verify new values
docker-compose -f docker-compose.multi-instance.yml config | grep VARIABLE_NAME
```

### **Update Nginx Configuration**
```bash
# Edit config
nano nginx/spofe-backend.conf  # Linux/macOS
notepad nginx\spofe-backend.conf  # Windows

# Validate syntax
docker exec cascade_nginx_1 nginx -t

# Reload without restart
docker exec cascade_nginx_1 nginx -s reload
```

### **Update Instance Count**
```bash
# Edit docker-compose.multi-instance.yml
# Add new instance block (copy api-instance-4 and change port)

# Edit nginx/spofe-backend.conf
# Add new server line in upstream block

# Restart
docker-compose -f docker-compose.multi-instance.yml restart nginx
```

---

## 📈 Performance Testing

### **Measure Response Time**
```bash
# Single request timing
time curl http://localhost/health

# Multiple requests with timing
for i in {1..10}; do time curl -s http://localhost/health > /dev/null; done
```

### **Concurrent Connections Test**
```bash
# Using ab (Apache Bench)
ab -n 1000 -c 100 http://localhost/health

# Using wrk (better)
wrk -t4 -c100 -d30s http://localhost/health
```

### **Memory Profiling**
```bash
# Real-time memory usage
watch -n 1 'docker stats --no-stream'

# Historical memory usage (every 10 seconds for 5 minutes)
for i in {1..30}; do docker stats --no-stream; sleep 10; done
```

---

## 🔄 Blue-Green Deployment (Zero Downtime)

```bash
# 1. Deploy new version to api-instance-3 & 4
docker-compose -f docker-compose.multi-instance.yml restart api-instance-3
docker-compose -f docker-compose.multi-instance.yml restart api-instance-4

# 2. Verify new version works
curl http://localhost:3003/health
curl http://localhost:3004/health

# 3. Update remaining instances
docker-compose -f docker-compose.multi-instance.yml restart api-instance-1
docker-compose -f docker-compose.multi-instance.yml restart api-instance-2

# 4. Verify all running new version
for i in {1..4}; do 
  curl http://localhost:300$i/health
done
```

---

## 📊 Generate Performance Report

```bash
# Run all load tests and generate report
npm run load:setup
npm run load:k6
npm run load:artillery
npm run load:report

# Open report in browser
open load-testing/reports/index.html          # macOS
xdg-open load-testing/reports/index.html      # Linux
start load-testing/reports/index.html         # Windows
```

---

## 🚨 Emergency Commands

### **Force Stop Everything**
```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml kill
docker-compose -f docker-compose.multi-instance.yml down

# PM2
pm2 kill
```

### **Reset to Clean State**
```bash
# Docker - Remove everything
docker-compose -f docker-compose.multi-instance.yml down -v
docker system prune -a --volumes

# Then restart fresh
docker-compose -f docker-compose.multi-instance.yml up -d
```

### **Clear Logs**
```bash
# Docker - Truncate logs
docker-compose -f docker-compose.multi-instance.yml logs | truncate -s 0

# PM2
pm2 flush
```

---

## 📝 Quick Reference

| Task | Command |
|------|---------|
| **Deploy** | `bash cascade/deploy-nginx-lb.sh docker` |
| **Validate** | `bash cascade/validate-nginx-lb.sh` |
| **View Logs** | `docker-compose logs -f` |
| **Check Status** | `docker-compose ps` |
| **Stop** | `docker-compose down` |
| **Restart** | `docker-compose restart` |
| **Health Check** | `curl http://localhost/health` |
| **Test Load** | `npm run load:k6` |
| **Monitor** | `docker stats` |
| **Database** | `docker exec cascade_mysql_1 mysql -u spofe_user -p spofe_db` |
| **Redis** | `docker exec cascade_redis_1 redis-cli` |
| **Reload Nginx** | `docker exec cascade_nginx_1 nginx -s reload` |

---

## 💡 Pro Tips

1. **Always check logs first**: `docker-compose logs`
2. **Keep environment backed up**: `cp .env .env.backup`
3. **Test changes on one instance first**: Stop instance 3, update config, restart
4. **Monitor during high load**: `docker stats` in separate terminal
5. **Document manual changes**: Update this file with any manual changes
6. **Regular backups**: `docker-compose exec mysql mysqldump -u root -p spofe_db > backup.sql`
7. **Clean up old logs**: `docker-compose logs --tail=100 > archive.log && docker-compose logs | truncate`

---

## ⚠️ Common Mistakes

❌ **Don't**: Start without checking `.env` file exists  
✅ **Do**: Copy `.env.example` to `.env` first

❌ **Don't**: Use same port for multiple services  
✅ **Do**: Verify ports 3001-3004 are free: `netstat -ano | findstr :300`

❌ **Don't**: Stop all instances at once  
✅ **Do**: Restart one at a time during updates

❌ **Don't**: Ignore database connection errors  
✅ **Do**: Check MySQL is running: `docker logs cascade_mysql_1`

❌ **Don't**: Change NGINX config without testing  
✅ **Do**: Run `nginx -t` before reloading: `docker exec cascade_nginx_1 nginx -t`

---

## 🎯 Next Steps

1. ✅ Copy commands above and run deployment
2. ✅ Verify with health checks
3. ✅ Run validation tests
4. ✅ Run load tests
5. ✅ Monitor for 24 hours
6. ✅ Document any issues
7. ✅ (Optional) Setup Prometheus monitoring
8. ✅ (Optional) Implement Cache Scheduler (Phase 3)

**You're ready to deploy! Good luck! 🚀**

