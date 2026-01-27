# 🚀 NGINX Load Balancer - Quick Start Guide

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] **Docker Desktop** installed and running (for Docker deployment)
- [ ] **Docker Compose** available (`docker-compose --version`)
- [ ] **Node.js** installed (`node --version`)
- [ ] **Port 80** available on your machine (or configure alternative port)
- [ ] **.env file** configured with proper secrets

---

## 🎯 Quick Start (5 minutes)

### **Option 1: Docker Compose (Recommended)**

#### **Step 1: Deploy**
```bash
# On macOS/Linux
bash cascade/deploy-nginx-lb.sh docker

# On Windows PowerShell
.\cascade\deploy-nginx-lb.ps1 -DeploymentType docker
```

#### **Step 2: Wait for startup**
```bash
# Check if services are running
docker-compose -f docker-compose.multi-instance.yml ps
```

#### **Step 3: Verify**
```bash
# Test health endpoint
curl http://localhost/health

# Check Nginx status
curl http://localhost/nginx_status

# Access API instances directly (optional)
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

#### **Step 4: Validate**
```bash
# On macOS/Linux
bash cascade/validate-nginx-lb.sh

# On Windows PowerShell
.\cascade\validate-nginx-lb.ps1
```

---

### **Option 2: PM2 Cluster Mode**

#### **Step 1: Deploy**
```bash
# On macOS/Linux
bash cascade/deploy-nginx-lb.sh pm2

# On Windows PowerShell
.\cascade\deploy-nginx-lb.ps1 -DeploymentType pm2
```

#### **Step 2: Verify**
```bash
# Check PM2 status
pm2 status

# Monitor processes
pm2 monit
```

#### **Step 3: Validate**
```bash
# Same validation as Docker option
# The validation script detects deployment type automatically
```

---

### **Option 3: Manual Setup**

#### **Step 1: Get instructions**
```bash
# On macOS/Linux
bash cascade/deploy-nginx-lb.sh manual

# On Windows PowerShell
.\cascade\deploy-nginx-lb.ps1 -DeploymentType manual
```

This will print step-by-step instructions for manual deployment.

---

## ✅ Validation Checklist

After deployment, verify:

- [ ] **Health Check**: `curl http://localhost/health` returns 200
- [ ] **All 4 instances**: Accessible on ports 3001-3004
- [ ] **Load balancing**: Nginx status shows upstream servers
- [ ] **Rate limiting**: Working (verify with rapid requests)
- [ ] **Session persistence**: Redis connected
- [ ] **Security headers**: X-Frame-Options, CSP headers present
- [ ] **Logs clean**: No 502/503 errors in logs

---

## 📊 Testing Load Balancer

### **Run Load Tests**

```bash
# Setup (one time)
npm run load:setup

# Run K6 baseline
npm run load:k6

# Run Artillery tests
npm run load:artillery

# Generate report
npm run load:report
```

### **Expected Results**
- **Throughput**: 400 req/s (vs 100 req/s single instance)
- **Response time**: 150-250ms
- **Success rate**: >99%
- **Instances**: All 4 handling traffic

---

## 🔍 Monitoring

### **Check Instance Health**

```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml ps

# PM2
pm2 status

# Manual
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### **View Logs**

```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml logs -f

# Docker (specific service)
docker logs <container_id> -f

# PM2
pm2 logs

# PM2 (specific app)
pm2 logs spofe-api
```

### **Check Resource Usage**

```bash
# Docker
docker stats

# PM2
pm2 monit

# System
# macOS/Linux: top, htop
# Windows: Task Manager
```

---

## 🔧 Troubleshooting

### **502 Bad Gateway**

```bash
# Check if backend instances are running
docker-compose -f docker-compose.multi-instance.yml ps
# or
pm2 status

# Check logs
docker logs nginx
# or
docker-compose logs nginx
```

### **Connection Refused**

```bash
# Verify port 80 is available
# Windows: netstat -ano | findstr :80
# macOS/Linux: lsof -i :80

# Try alternative port in nginx.conf
# Change: listen 80; to listen 8080;
```

### **Sessions Not Persisting**

```bash
# Verify Redis is running
docker exec redis redis-cli ping
# Should return: PONG

# Check Redis connection
docker logs redis
```

### **High Latency**

```bash
# Check instance response times
time curl http://localhost/health

# Monitor CPU/Memory
docker stats
pm2 monit

# Check network
# Windows: netstat -an | findstr ESTABLISHED | wc -l
# macOS/Linux: netstat -an | grep ESTABLISHED | wc -l
```

### **Rate Limiting Too Strict**

Edit `nginx/spofe-backend.conf`:
```nginx
# Find this line:
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

# Adjust rate (e.g., 200r/s):
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=200r/s;

# Reload Nginx:
docker exec nginx nginx -s reload
```

---

## 📈 Performance Expectations

### **Single Instance (Before)**
- **Throughput**: ~100 req/s
- **Latency**: 150-200ms
- **Concurrent users**: ~500

### **4 Instances with LB (After)**
- **Throughput**: ~400 req/s (4x)
- **Latency**: 150-250ms (similar)
- **Concurrent users**: ~2000 (4x)
- **Availability**: 99.9% (automatic failover)

---

## 🛑 Stopping & Cleanup

### **Stop Services**

```bash
# Docker
docker-compose -f docker-compose.multi-instance.yml down

# PM2
pm2 stop all
pm2 delete all

# Manual
# Stop Nginx: sudo systemctl stop nginx
# Stop Node instances: kill PID
```

### **Remove All Data**

```bash
# Docker (WARNING: removes volumes!)
docker-compose -f docker-compose.multi-instance.yml down -v

# PM2
pm2 flush
```

---

## 📚 Full Documentation

For detailed information, see:
- **NGINX_DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **LOAD_TESTING_GUIDE.md** - Load testing scenarios
- **nginx/spofe-backend.conf** - Nginx configuration details

---

## 💡 Tips & Tricks

### **Scale to Different Number of Instances**

Edit `docker-compose.multi-instance.yml`:
```yaml
api-instance-5:
  # ... copy an existing instance block and increment port
  ports: ["3005:3005"]
  environment:
    - PORT=3005
    - INSTANCE_ID=5
```

Then update `nginx/spofe-backend.conf`:
```nginx
upstream backend_cluster {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
    server localhost:3004;
    server localhost:3005;  # Add new
}
```

### **Use Alternative Port**

If port 80 is unavailable:
```bash
# Edit nginx/spofe-backend.conf:
# Change: listen 80;
# To: listen 8080;

# Then access at:
# http://localhost:8080
```

### **Enable HTTPS/SSL**

See NGINX_DEPLOYMENT_GUIDE.md section "SSL/TLS Configuration"

### **Setup Auto-Restart**

```bash
# PM2
pm2 startup
pm2 save

# Docker (already built-in)
# restart_policy: unless-stopped
```

---

## 🎓 Learning Resources

- [NGINX Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PM2 Documentation](https://pm2.io/docs/usage/quick-start/)
- [Node.js Clustering](https://nodejs.org/api/cluster.html)

---

## 📞 Support

If you encounter issues:

1. **Check logs**: `docker logs` or `pm2 logs`
2. **Verify connectivity**: `curl http://localhost/health`
3. **Review configuration**: `nginx.conf` and `docker-compose.multi-instance.yml`
4. **Check ports**: Ensure 80, 3001-3004 are available
5. **Verify .env**: Ensure all required variables are set

