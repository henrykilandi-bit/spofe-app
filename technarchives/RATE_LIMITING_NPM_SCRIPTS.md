# 📋 NPM SCRIPTS À AJOUTER À package.json

## Ajouter ces scripts dans la section "scripts" du `package.json`

```json
{
  "scripts": {
    // ... scripts existants ...
    
    // 🔐 RATE LIMITING & SECURITY SCRIPTS
    "security:display-config": "node -e \"import('./src/config/rate-limiting-config.js').then(m => m.displayConfig())\"",
    
    "security:unlock-account": "node -e \"import('./src/services/account-lockout.service.js').then(m => { const username = process.argv[2] || 'admin'; m.default.unlockAccount(username, 'CLI_ADMIN', 'Manual unlock via CLI').then(r => console.log('Unlocked:', r)); })\"",
    
    "security:view-stats": "node -e \"import('./src/services/security-monitoring.service.js').then(m => m.default.getSecurityStatus().then(s => console.log(JSON.stringify(s, null, 2))))\"",
    
    "security:generate-report": "node -e \"import('./src/services/security-monitoring.service.js').then(m => m.default.generateDailySecurityReport().then(r => console.log(JSON.stringify(r, null, 2))))\"",
    
    "security:check-redis": "redis-cli ping",
    
    "security:test-rate-limit": "node scripts/test-rate-limit.js",
    
    "security:view-lockouts": "node scripts/view-lockouts.js",
    
    "security:export-logs": "node scripts/export-security-logs.js"
  }
}
```

---

## Scripts shell à créer

### 1. `scripts/test-rate-limit.js`

```javascript
// scripts/test-rate-limit.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testRateLimit() {
  console.log('🧪 Testing Rate Limiting...\n');
  
  const testEmail = 'test@example.com';
  const maxAttempts = 5;
  
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      console.log(`Attempt ${i}/${maxAttempts}...`);
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testEmail,
        password: 'WRONG_PASSWORD_FOR_TESTING'
      });
      console.log(`✅ Attempt ${i} accepted\n`);
    } catch (error) {
      if (error.response?.status === 423) {
        console.log(`🔒 Attempt ${i} BLOCKED - Account locked`);
        console.log(`   Error: ${error.response.data.error}`);
        console.log(`   Message: ${error.response.data.message}\n`);
        console.log('✅ Rate limiting working correctly!');
        return;
      } else if (error.response?.status === 429) {
        console.log(`⚠️  Attempt ${i} rate limited (HTTP 429)\n`);
      } else {
        console.log(`❌ Attempt ${i} error: ${error.response?.status || error.message}\n`);
      }
    }
  }
  
  console.log('\n✅ Test complete!');
}

testRateLimit().catch(console.error);
```

### 2. `scripts/view-lockouts.js`

```javascript
// scripts/view-lockouts.js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

async function viewLockouts() {
  console.log('🔒 Current Account Lockouts\n');
  
  try {
    const keys = await redis.keys('lockout:locked:*');
    
    if (keys.length === 0) {
      console.log('✅ No locked accounts');
      redis.disconnect();
      return;
    }
    
    console.log(`Found ${keys.length} locked account(s):\n`);
    
    for (const key of keys) {
      const username = key.replace('lockout:locked:', '');
      const lockData = await redis.get(key);
      const data = JSON.parse(lockData);
      
      console.log(`📌 ${username}`);
      console.log(`   Locked at: ${data.lockedAt}`);
      console.log(`   Unlock at: ${data.unlockTimeFormatted || data.unlockTime}`);
      console.log(`   Reason: ${data.reason}`);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    redis.disconnect();
  }
}

viewLockouts();
```

### 3. `scripts/export-security-logs.js`

```javascript
// scripts/export-security-logs.js
import fs from 'fs';
import path from 'path';

function exportSecurityLogs() {
  const logFile = path.join(process.cwd(), 'logs', 'security.log');
  const outputFile = path.join(process.cwd(), `security-report-${new Date().toISOString().split('T')[0]}.txt`);
  
  try {
    const logs = fs.readFileSync(logFile, 'utf-8');
    fs.writeFileSync(outputFile, logs);
    
    console.log(`✅ Security logs exported to: ${outputFile}`);
    console.log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)}KB`);
  } catch (error) {
    console.error('❌ Error exporting logs:', error.message);
  }
}

exportSecurityLogs();
```

---

## Commandes d'utilisation

```bash
# Voir la configuration actuelle
npm run security:display-config

# Tester le rate limiting (démarrer app d'abord)
npm run security:test-rate-limit

# Voir les comptes verrouillés
npm run security:view-lockouts

# Déverrouiller un compte
npm run security:unlock-account -- user@example.com

# Voir les statistiques de sécurité
npm run security:view-stats

# Générer un rapport complet
npm run security:generate-report

# Exporter les logs de sécurité
npm run security:export-logs

# Vérifier Redis
npm run security:check-redis
```

---

## Ajout aux hooks npm (optionnel)

Vous pouvez aussi ajouter dans `package.json`:

```json
{
  "scripts": {
    "prestart": "npm run security:display-config",
    "predev": "npm run security:display-config"
  }
}
```

Cela affichera la configuration de rate limiting au démarrage de l'app.

---

## 📋 Checklist pour package.json

- [ ] Scripts ajoutés à la section "scripts"
- [ ] Scripts créés dans dossier `scripts/`
- [ ] `npm run security:display-config` fonctionne
- [ ] `npm run security:test-rate-limit` fonctionne
- [ ] `npm run security:view-lockouts` fonctionne (si Redis ok)
- [ ] `npm run security:unlock-account` fonctionne
- [ ] `npm run security:view-stats` fonctionne
- [ ] `npm run security:generate-report` fonctionne

---

## Alternative: Sans ajouter de scripts

Si vous préférez ne pas ajouter de scripts npm, vous pouvez toujours utiliser:

```bash
# Voir config
node -e "import('./src/config/rate-limiting-config.js').then(m => m.displayConfig())"

# Déverrouiller compte
node -e "import('./src/services/account-lockout.service.js').then(m => m.default.unlockAccount('user@example.com', 'ADMIN'))"

# Voir stats
node -e "import('./src/services/security-monitoring.service.js').then(m => m.default.getSecurityStatus().then(s => console.log(JSON.stringify(s, null, 2))))"
```

---

**Status:** ✅ Prêt à utiliser  
**Complexité:** Facile  
**Temps ajout:** 5 min
