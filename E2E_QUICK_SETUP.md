# 🚀 SPOFE E2E Tests - Quick Start Guide

## ⚡ Current Status

✅ **Completed**:
- Playwright installed (1,243 packages)
- Browsers installed (Chromium, Firefox, WebKit)
- 13 E2E test files created (2,710 LOC)
- 15 npm scripts configured

❌ **Required Before Tests**:
- Redis server (port 6379)
- MySQL database (port 3306)
- Backend services running

---

## 🛠️ Manual Setup (No Docker)

### 1. **Install MySQL Locally**

**Windows**:
1. Download: [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
2. Run installer (MySQL 8.0+)
3. Choose "Server" component
4. Configure port 3306, username `root`
5. Create password (e.g., `root`)

**Verify**:
```bash
mysql --version
mysql -u root -p -e "SELECT VERSION();"
```

### 2. **Install Redis Locally**

**Windows Options**:

**Option A - Memurai (Recommended)**:
```bash
# Download: https://www.memurai.com/
# Run installer
# Redis runs automatically
redis-cli ping
```

**Option B - WSL (Windows Subsystem for Linux)**:
```bash
# In PowerShell as Admin:
wsl redis-server
```

**Option C - Chocolatey**:
```bash
choco install redis
redis-server
```

### 3. **Configure Environment**

**File**: `cascade/.env`

Create or update with:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=spofe_db
DB_PORT=3306
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key-for-development-only
NODE_ENV=development
PORT=3001
```

**File**: `frontend/.env`

Create or update with:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🚀 Startup Sequence

### Terminal 1: Backend Services

```bash
cd cascade
npm run dev
# Wait for: "✅ Server running on port 3001"
```

### Terminal 2: Frontend Services

```bash
cd frontend
npm run dev
# Wait for: "Local: http://127.0.0.1:5173/"
```

### Terminal 3: Verify Services

```bash
# Test backend
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:5173

# Test Redis
redis-cli ping
# Should return: PONG
```

### Terminal 4: Run E2E Tests

```bash
# Once all services verified as running:
npm run test:e2e

# Or specific tests:
npm run test:e2e:business-flows
npm run test:e2e:performance
```

---

## 📊 Service Status Check

**PowerShell Script**:

```powershell
# Check Redis
try {
    $redis = New-Object System.Net.Sockets.TcpClient
    $redis.ConnectAsync("localhost", 6379).Wait(1000)
    Write-Host "✅ Redis: ONLINE (port 6379)" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis: OFFLINE (port 6379)" -ForegroundColor Red
    Write-Host "   Run: redis-cli or Memurai"
}

# Check MySQL
try {
    $mysql = New-Object System.Net.Sockets.TcpClient
    $mysql.ConnectAsync("localhost", 3306).Wait(1000)
    Write-Host "✅ MySQL: ONLINE (port 3306)" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL: OFFLINE (port 3306)" -ForegroundColor Red
    Write-Host "   Run: mysql.server start or service mysql start"
}

# Check Backend
try {
    $backend = New-Object System.Net.Sockets.TcpClient
    $backend.ConnectAsync("localhost", 3001).Wait(1000)
    Write-Host "✅ Backend: ONLINE (port 3001)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: OFFLINE (port 3001)" -ForegroundColor Red
    Write-Host "   Run: cd cascade && npm run dev"
}

# Check Frontend
try {
    $frontend = New-Object System.Net.Sockets.TcpClient
    $frontend.ConnectAsync("localhost", 5173).Wait(1000)
    Write-Host "✅ Frontend: ONLINE (port 5173)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: OFFLINE (port 5173)" -ForegroundColor Red
    Write-Host "   Run: cd frontend && npm run dev"
}
```

**Run**:
```powershell
$script = @"
# Copy script above
@"
Invoke-Expression $script
```

---

## 🎯 E2E Test Commands

```bash
# Run all tests
npm run test:e2e

# Run specific tests
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run with UI
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# Run debug mode
npm run test:e2e:debug

# Performance tests only
npm run test:e2e:performance

# Business flows only
npm run test:e2e:business-flows

# Generate report
npm run test:perf:report
```

---

## 📋 Test Files

**Location**: `e2e/`

| File | Tests | LOC |
|------|-------|-----|
| `business-flows.spec.js` | 15 | 400 |
| `performance.spec.js` | 10+ | 500 |
| `helpers/auth-helper.js` | Utilities | 100 |
| `helpers/business-helpers.js` | Utilities | 350 |

**Coverage**:
- Journal entry creation (single & multi-line)
- Entry validation & posting
- Balance generation & export
- Audit log verification
- Performance thresholds (8 metrics)
- Multi-browser execution

---

## ✅ Verification Checklist

- [ ] MySQL running (port 3306)
- [ ] Redis running (port 6379)
- [ ] `cascade/.env` configured
- [ ] `frontend/.env` configured
- [ ] Backend service started (`cd cascade && npm run dev`)
- [ ] Frontend service started (`cd frontend && npm run dev`)
- [ ] Services accessible:
  - [ ] http://localhost:3001/api/health
  - [ ] http://localhost:5173
  - [ ] redis-cli ping
- [ ] Playwright browsers installed
- [ ] E2E tests ready to run

---

## 🚀 Next Steps

1. **Install & start infrastructure**:
   - Install MySQL (if not present)
   - Install Redis (Memurai recommended)
   - Create `.env` files

2. **Start services** (3 terminals):
   - Terminal 1: `cd cascade && npm run dev`
   - Terminal 2: `cd frontend && npm run dev`
   - Terminal 3: Verify services are online

3. **Run E2E tests**:
   ```bash
   npm run test:e2e
   ```

4. **View results**:
   - HTML report: `playwright-report/index.html`
   - Performance report: `test-results/performance-report.html`
   - JUnit XML: `test-results/junit.xml`

---

## 💡 Tips

- **Keep terminals open** while running tests
- **Wait 10-15 seconds** for services to fully start
- **Check logs** if tests fail
- **Use `npm run test:e2e:ui`** for debugging
- **Review reports** in `playwright-report/` folder

---

## 📞 Troubleshooting

**Tests timeout or fail to connect**:
- Verify Redis running: `redis-cli ping`
- Verify MySQL running: `mysql -u root -p -e "SELECT 1;"`
- Verify backend: `curl http://localhost:3001/api/health`
- Verify frontend: `curl http://localhost:5173`
- Check services are fully started (wait 15s)

**Port already in use**:
- Find process: `netstat -ano | findstr :3001`
- Kill process: `taskkill /PID <PID> /F`
- Or use different port in `.env`

**MySQL connection failed**:
- Check MySQL is running: `mysql --version`
- Check credentials in `.env`
- Create database: `mysql -u root -p -e "CREATE DATABASE spofe_db;"`

**Redis connection failed**:
- Check Redis is running: `redis-cli ping`
- For Memurai: Check Windows Services
- For WSL: `wsl redis-server` in admin terminal

---

## 📚 More Info

- [E2E_ENVIRONMENT_SETUP.md](E2E_ENVIRONMENT_SETUP.md) - Detailed setup guide
- [E2E_TESTS_GUIDE.md](E2E_TESTS_GUIDE.md) - Complete reference
- [playwright.config.js](playwright.config.js) - Test configuration
- [e2e/](e2e/) - Test files and helpers

---

**Ready to test?** 🧪 Follow the startup sequence above!
