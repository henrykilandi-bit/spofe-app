# 📋 NPM SCRIPTS CSRF À AJOUTER

## Ajouter ces scripts à `package.json`

Dans la section `"scripts"`:

```json
{
  "scripts": {
    "// ═══════════════════════════════════════════": "",
    "// 🛡️  CSRF PROTECTION SCRIPTS": "",
    "// ═══════════════════════════════════════════": "",
    
    "csrf:deploy": "node scripts/deploy-csrf.js",
    "csrf:verify": "node scripts/verify-csrf.js",
    "csrf:test": "jest tests/csrf-protection.test.js --verbose",
    "csrf:test:watch": "jest tests/csrf-protection.test.js --watch",
    "csrf:status": "node -e \"import('./src/middleware/csrf-protection.js').then(m => console.log(JSON.stringify(m.default.getStatus(), null, 2)))\"",
    "csrf:config": "node -e \"import('./src/middleware/csrf-protection.js').then(m => console.log(JSON.stringify(m.default.getConfiguration(), null, 2)))\"",
    "csrf:rotate": "node scripts/rotate-csrf-secrets.js",
    "csrf:logs": "grep CSRF logs/security.log | tail -50",
    "csrf:stats": "grep CSRF logs/security.log | jq -r '.ip' 2>/dev/null | sort | uniq -c | sort -rn",
    "rollback:csrf": "npm run rollback -- csrf"
  }
}
```

---

## Scripts à Créer

### 1. `scripts/verify-csrf.js`

```javascript
#!/usr/bin/env node
/**
 * Vérifier que CSRF est correctement configuré
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function verifyCSSRF() {
  console.log('\n🔍 Vérification Configuration CSRF\n');

  const checks = [
    // Check 1: Fichiers existent
    {
      name: 'Middleware CSRF existe',
      check: () => fs.existsSync('src/middleware/csrf-protection.js')
    },
    // Check 2: CSRF_SECRET en .env
    {
      name: 'CSRF_SECRET configuré en .env',
      check: () => {
        const env = fs.readFileSync('.env', 'utf-8');
        return env.includes('CSRF_SECRET');
      }
    },
    // Check 3: CSRF_SECRET a suffisant entropy
    {
      name: 'CSRF_SECRET suffisamment long',
      check: () => {
        const env = fs.readFileSync('.env', 'utf-8');
        const match = env.match(/CSRF_SECRET=([^\n]+)/);
        return match && match[1].length >= 32;
      }
    },
    // Check 4: App.js intégré
    {
      name: 'Middleware intégré dans app.js',
      check: () => {
        const app = fs.readFileSync('src/app.js', 'utf-8');
        return app.includes('csrfProtection.middleware()');
      }
    },
    // Check 5: Error handler intégré
    {
      name: 'Error handler CSRF configuré',
      check: () => {
        const error = fs.readFileSync('src/middleware/error.middleware.js', 'utf-8');
        return error.includes('EBADCSRFTOKEN');
      }
    }
  ];

  let passed = 0;
  for (const check of checks) {
    try {
      if (check.check()) {
        console.log(`✅ ${check.name}`);
        passed++;
      } else {
        console.log(`❌ ${check.name}`);
      }
    } catch (error) {
      console.log(`⚠️  ${check.name}: ${error.message}`);
    }
  }

  // Check 6: Server accessible
  try {
    console.log('\n🔍 Tests de connectivité:');
    const response = await fetch(`${BASE_URL}/api/csrf-token`);
    if (response.ok) {
      console.log(`✅ Server accessible: ${BASE_URL}`);
      const data = await response.json();
      if (data.csrfToken) {
        console.log(`✅ Token CSRF retourné (${data.csrfToken.length} chars)`);
        passed += 2;
      }
    }
  } catch (error) {
    console.log(`⚠️  Server not accessible: ${error.message}`);
  }

  console.log(`\n📊 Résultat: ${passed}/${checks.length + 2} checks passés\n`);
  process.exit(passed === checks.length + 2 ? 0 : 1);
}

verifyCSSRF().catch(console.error);
```

### 2. `scripts/rotate-csrf-secrets.js`

```javascript
#!/usr/bin/env node
/**
 * Rotater les secrets CSRF (sécurité)
 */

import { randomBytes } from 'crypto';
import fs from 'fs';

function rotateCSSRFSecrets() {
  console.log('\n🔄 Rotation des Secrets CSRF\n');

  // Générer nouveau secret
  const newSecret = randomBytes(32).toString('hex');

  // Lire .env
  let envContent = fs.readFileSync('.env', 'utf-8');

  // Remplacer CSRF_SECRET
  if (envContent.includes('CSRF_SECRET=')) {
    const oldSecret = envContent.match(/CSRF_SECRET=([^\n]+)/)[1];
    envContent = envContent.replace(/CSRF_SECRET=[^\n]+/, `CSRF_SECRET=${newSecret}`);
    console.log(`✅ CSRF_SECRET rotationné`);
    console.log(`   Ancien: ${oldSecret.substring(0, 20)}...`);
    console.log(`   Nouveau: ${newSecret.substring(0, 20)}...`);
  } else {
    envContent += `\nCSRF_SECRET=${newSecret}`;
    console.log(`✅ CSRF_SECRET créé`);
  }

  // Sauvegarder
  fs.writeFileSync('.env', envContent);

  console.log('\n✅ Rotation complétée');
  console.log('⚠️  Redémarrez le serveur pour appliquer les changements\n');
}

rotateCSSRFSecrets().catch(console.error);
```

---

## Utilisation

### Déploiement

```bash
npm run csrf:deploy
```

### Vérification

```bash
npm run csrf:verify
npm run csrf:status
npm run csrf:config
```

### Tests

```bash
npm run csrf:test          # Tests une fois
npm run csrf:test:watch    # Tests en mode watch
```

### Monitoring

```bash
npm run csrf:logs    # Voir derniers logs CSRF
npm run csrf:stats   # Stats par IP (pour détecter attaques)
```

### Maintenance

```bash
npm run csrf:rotate        # Rotater secrets tous les 3 mois
npm run rollback:csrf      # Rollback en cas d'erreur
```

---

## Configuration dans package.json

Positionnement des scripts (ordre recommandé):

```json
{
  "scripts": {
    // ... autres scripts existants ...
    
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    
    // 🛡️ Security scripts
    "security:display-config": "node -e \"...\"",
    "csrf:deploy": "node scripts/deploy-csrf.js",
    "csrf:verify": "node scripts/verify-csrf.js",
    "csrf:test": "jest tests/csrf-protection.test.js",
    
    // 🧪 Test scripts
    "test": "jest",
    "test:watch": "jest --watch",
    
    // ... autres scripts ...
  }
}
```

---

## Intégration Complète

Après ajouter les scripts:

```bash
# 1. Redémarrer npm pour que les scripts soient disponibles
npm run csrf:deploy

# 2. Vérifier
npm run csrf:verify

# 3. Lancer tests
npm run csrf:test

# 4. Démarrer app
npm run dev

# 5. Monitorer
npm run csrf:logs
```

---

## Checklist

- [ ] Scripts ajoutés à package.json
- [ ] `npm run csrf:verify` passe tous les tests
- [ ] `npm run csrf:test` passe tous les tests
- [ ] `npm run csrf:status` affiche configuration
- [ ] `npm run css:deploy` s'exécute sans erreur

---

**Status**: ✅ Ready to implement  
**Created**: 2026-01-22  
**Version**: 2.1
