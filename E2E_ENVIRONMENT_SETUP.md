# 🔧 E2E Tests - Environment Setup Guide

## Current Status

**Prerequisites Not Met**:
- ❌ Redis server (port 6379) - NOT RUNNING
- ❌ MySQL database - Connection issues
- ❌ Backend services (port 3001) - Cannot start without DB/Redis

**Root Cause**:
The backend requires:
1. **Redis** for rate limiting & caching
2. **MySQL** database connection
3. Both must be running before `npm run dev` can succeed

---

## 📋 Prerequisites Checklist

### 1. **MySQL Database**
**Status**: Check connection

```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT VERSION();"
```

**If MySQL not installed**:
- Download: [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
- Or use Docker: `docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0`

### 2. **Redis Cache**
**Status**: NOT RUNNING (causing service startup failure)

```bash
# Option A: Use Docker
docker run --name redis -p 6379:6379 -d redis:latest

# Option B: Install locally (Windows)
# Download from https://github.com/microsoftarchive/redis/releases
# Or use Memurai: https://www.memurai.com/

# Option C: Use WSL
wsl redis-server
```

### 3. **.env Configuration**
**File**: `cascade/.env`

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=spofe_db
DB_PORT=3306

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api
```

---

## 🚀 Setup Steps

### Step 1: Start Infrastructure (Docker Recommended)

```bash
# Start MySQL
docker run --name mysql-spofe \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=spofe_db \
  -p 3306:3306 \
  -d mysql:8.0

# Start Redis
docker run --name redis-spofe \
  -p 6379:6379 \
  -d redis:latest

# Verify connections
docker ps
```

### Step 2: Create Database & Initialize

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS spofe_db;"

# Run migrations (if needed)
cd cascade
npm run migrate
cd ..
```

### Step 3: Start Services

```bash
# Terminal 1: Backend
cd cascade
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Run tests
npm run test:e2e
```

### Step 4: Verify Services

```bash
# Check backend
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:5173

# Check Redis
redis-cli ping

# Check MySQL
mysql -u root -p -e "SELECT 1;"
```

---

## ✅ E2E Tests Execution

Once all services are running:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific browser
npm run test:e2e:chromium

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Performance tests only
npm run test:e2e:performance

# Business flows only
npm run test:e2e:business-flows
```

---

## 🐳 Docker Compose Option (Recommended for Full Stack)

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: spofe_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    depends_on:
      - mysql
      - redis
    environment:
      DB_HOST: mysql
      REDIS_URL: redis://redis:6379
      NODE_ENV: development

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mysql_data:
  redis_data:
```

**Run**:
```bash
docker-compose up
```

---

## 🔍 Troubleshooting

### Issue: "ECONNREFUSED" on port 6379 (Redis)
**Solution**: Start Redis
```bash
docker run --name redis-spofe -p 6379:6379 -d redis:latest
```

### Issue: "ECONNREFUSED" on port 3306 (MySQL)
**Solution**: Start MySQL
```bash
docker run --name mysql-spofe \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=spofe_db \
  -p 3306:3306 \
  -d mysql:8.0
```

### Issue: "pool is draining and cannot accept work"
**Solution**: Database connection failed
1. Verify MySQL is running
2. Check `.env` credentials
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Issue: Tests timeout
**Solution**: Services not responding in time
1. Check backend: `curl http://localhost:3001/api/health`
2. Check frontend: `curl http://localhost:5173`
3. Wait 10-15 seconds for services to fully start

### Issue: "Address already in use"
**Solution**: Port already bound
```bash
# Find process using port 3001
lsof -i :3001

# Kill process (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port in .env
```

---

## 📊 Health Check Script

**File**: `verify-services.ps1`

```powershell
$services = @{
    'MySQL (3306)' = 'localhost:3306'
    'Redis (6379)' = 'localhost:6379'
    'Backend (3001)' = 'localhost:3001'
    'Frontend (5173)' = 'localhost:5173'
}

Write-Host "🔍 Service Health Check`n" -ForegroundColor Cyan

foreach ($service in $services.GetEnumerator()) {
    $port = $service.Value.Split(':')[1]
    $host = $service.Value.Split(':')[0]
    
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.ConnectAsync($host, $port).Wait(2000) | Out-Null
        
        if ($tcp.Connected) {
            Write-Host "✅ $($service.Key) - ONLINE" -ForegroundColor Green
        } else {
            Write-Host "❌ $($service.Key) - OFFLINE" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($service.Key) - OFFLINE" -ForegroundColor Red
    }
}
```

**Run**:
```bash
.\verify-services.ps1
```

---

## 🎯 Quick Start (All-in-One)

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Wait 10 seconds
Start-Sleep -Seconds 10

# 3. Verify
.\verify-services.ps1

# 4. Run tests
npm run test:e2e

# 5. View report
.\playwright-report\index.html
```

---

## 📝 Environment Variables

**`cascade/.env`**:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=spofe_db
DB_PORT=3306
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=7d

# Security
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**`frontend/.env`**:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SPOFE
VITE_APP_VERSION=2.1.0
```

---

## ✨ Next Steps

1. **Set up infrastructure** (MySQL + Redis)
2. **Configure `.env` files**
3. **Start services** (`npm run dev`)
4. **Verify health** (`curl http://localhost:3001/api/health`)
5. **Run E2E tests** (`npm run test:e2e`)
6. **Review reports** (HTML, JSON, JUnit)

---

## 📚 Documentation References

- [E2E_QUICK_START.md](E2E_QUICK_START.md) - Quick setup (5 min)
- [E2E_TESTS_GUIDE.md](E2E_TESTS_GUIDE.md) - Complete reference
- [playwright.config.js](playwright.config.js) - Test configuration
- [e2e/helpers/](e2e/helpers/) - Helper functions

---

## 💬 Support

**Still having issues?** Check:
1. Playwright browsers installed: `npx playwright install --with-deps`
2. Services running: `docker ps` or `Get-Process`
3. Ports available: `netstat -ano | findstr :3001` (Windows)
4. Environment variables: `cat cascade/.env`
5. Network connectivity: `ping localhost`

**Next**: Run E2E tests once services are operational!
