# 🛡️ CSRF PROTECTION - GUIDE COMPLET INTEGRATION

**Version**: 2.1 | **Created**: 2026-01-22 | **Status**: ✅ Production-Ready

## 📑 Table des Matières

1. [Architecture](#-architecture)
2. [Installation Backend](#-installation-backend)
3. [Configuration](#-configuration)
4. [Intégration Frontend](#-intégration-frontend)
5. [API Endpoints](#-api-endpoints)
6. [Gestion d'Erreurs](#-gestion-derreurs)
7. [Monitoring & Logs](#-monitoring--logs)
8. [Tests](#-tests)
9. [Production Deployment](#-production-deployment)
10. [FAQ](#-faq)

---

## 🏗️ Architecture

### Composants

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION EXPRESS                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  MIDDLEWARE STACK (ordre important)   │
        ├───────────────────────────────────────┤
        │ 1. Security Headers (helmet)          │
        │ 2. CORS                               │
        │ 3. ← CSRF Protection ← (NEW)          │
        │ 4. Rate Limiting                      │
        │ 5. Body Parser                        │
        │ 6. Auth & Routes                      │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │     REQUESTS (POST/PUT/DELETE)        │
        │ Must include X-CSRF-Token header ✓   │
        └───────────────────────────────────────┘
```

### Fichiers Créés

```
cascade/
├── src/
│   ├── middleware/
│   │   ├── csrf-protection.js          ← Middleware CSRF
│   │   └── error.middleware.js         (modifié)
│   ├── services/
│   │   └── csrf-service.js             ← Service frontend
│   └── app.js                          (modifié)
├── tests/
│   └── csrf-protection.test.js         ← Tests
├── scripts/
│   ├── deploy-csrf.js                  ← Déploiement
│   └── verify-csrf.js                  ← Vérification
├── .env.csrf.example                   ← Configuration exemple
└── CSRF_*.md                           ← Documentations
```

---

## 📦 Installation Backend

### Step 1: Installer dépendance

```bash
cd cascade
npm install csrf-csrf
```

**Vérifier installation**:
```bash
npm ls csrf-csrf
# csrf-csrf@1.x.x
```

### Step 2: Exécuter le script de déploiement

```bash
npm run deploy:csrf
```

**Ou manuellement**:
```bash
node scripts/deploy-csrf.js
```

**Le script va:**
- ✅ Backuper vos fichiers
- ✅ Vérifier intégrité
- ✅ Configurer .env
- ✅ Valider modifications
- ✅ Générer CSRF_SECRET

### Step 3: Vérifier installation

```bash
npm run dev
```

**Chercher dans les logs**:
```
✅ CSRF Protection initialisée avec succès
🔐 CONFIGURATION: RATE LIMITING CONFIGURATION
```

---

## ⚙️ Configuration

### .env Configuration

```bash
# 🛡️ CSRF PROTECTION
CSRF_SECRET=<votre_secret_32_chars_min>
CSRF_COOKIE_NAME=__Host-csrf-token
CSRF_COOKIE_DOMAIN=.spofe.local  # Production seulement

# En dev, .env:
CSRF_SECRET=$(node -e "require('crypto').randomBytes(32).toString('hex')")
```

### Middleware Configuration

**Dans `src/middleware/csrf-protection.js`** (déjà configuré):

```javascript
// Routes exclues de protection CSRF
excludedRoutes: [
  '/health',
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/webhooks/*'
],

// Méthodes protégées
methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE'],

// Configuration cookie
cookieOptions: {
  httpOnly: true,        // Pas d'accès JavaScript
  secure: true,          // HTTPS only en prod
  sameSite: 'strict',    // Strict CSRF protection
  maxAge: 24 * 60 * 60 * 1000  // 24 heures
}
```

### Routes Sensibles

Automatiquement protégées (même avec JWT):
```javascript
'/api/transactions',
'/api/journal-entries',
'/api/account/transfer',
'/api/users/role',
'/api/compagnies/delete',
'/api/settings/security'
```

---

## 🎨 Intégration Frontend

### React Setup

#### 1. Importer CSRFService

```javascript
// src/services/index.js
import csrfService from 'src/services/csrf-service.js';

export { csrfService };
```

#### 2. Initialiser au App Start

```javascript
// src/App.jsx
import { useEffect } from 'react';
import { csrfService } from './services';

function App() {
  useEffect(() => {
    // Initialiser service CSRF au démarrage
    csrfService.fetchCSRFToken();
    
    // Log status (dev)
    if (process.env.NODE_ENV === 'development') {
      console.log('CSRF Service Status:', csrfService.getStatus());
    }
  }, []);

  return (
    // ... votre app
  );
}
```

#### 3. Setup Axios Interceptor

```javascript
// src/api/axios-config.js
import axios from 'axios';
import { csrfService } from '../services';

// Request Interceptor
axios.interceptors.request.use(
  async (config) => {
    // Ajouter header CSRF pour méthodes sensibles
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const token = await csrfService.ensureToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gérer erreurs CSRF
    if (error.response?.status === 403 && 
        error.response.data?.error === 'CSRF_TOKEN_INVALID') {
      
      console.warn('CSRF token expiré, régénération...');
      
      // Récupérer nouveau token
      const newToken = await csrfService.fetchCSRFToken();
      
      // Réessayer requête
      const config = error.config;
      config.headers['X-CSRF-Token'] = newToken;
      return axios(config);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
```

#### 4. Utiliser dans les composants

```javascript
// src/components/TransactionForm.jsx
import { useState } from 'react';
import axios from 'src/api/axios-config.js';

export function TransactionForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Token CSRF automatiquement ajouté par interceptor
      const response = await axios.post('/api/transactions', {
        amount: 1000,
        description: 'Payment'
      });

      console.log('Succès:', response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Description" />
      <input type="number" placeholder="Amount" />
      <button type="submit" disabled={loading}>
        {loading ? 'Traitement...' : 'Envoyer'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

## 🔌 API Endpoints

### Obtenir Token CSRF

**Route Publique** (pas de token requis):

```http
GET /api/csrf-token
Content-Type: application/json

Response 200:
{
  "success": true,
  "csrfToken": "abc123def456...",
  "meta": {
    "headerName": "x-csrf-token",
    "cookieName": "__Host-csrf-token",
    "expiresIn": 86400,
    "algorithm": "sha256",
    "timestamp": "2026-01-22T10:30:00.000Z"
  }
}
```

**Réponse CURL**:
```bash
curl -s http://localhost:3001/api/csrf-token | jq .

# Extraire token uniquement:
curl -s http://localhost:3001/api/csrf-token | jq -r '.csrfToken'
```

### Utiliser Token dans Requêtes

```http
POST /api/transactions
X-CSRF-Token: abc123def456...
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 1000,
  "description": "Payment"
}

Response 200:
{
  "success": true,
  "data": { ... }
}

OR Error 403:
{
  "success": false,
  "error": "CSRF_TOKEN_INVALID",
  "message": "Token de sécurité invalide ou expiré"
}
```

---

## 🚨 Gestion d'Erreurs

### Erreur CSRF: HTTP 403

**Cause**: Token manquant, invalide, ou expiré

**Réponse**:
```json
{
  "success": false,
  "error": "CSRF_TOKEN_INVALID",
  "message": "Token de sécurité invalide ou expiré. Veuillez rafraîchir.",
  "code": "SECURITY_VIOLATION",
  "retryUrl": "/api/csrf-token",
  "timestamp": "2026-01-22T10:30:00.000Z"
}
```

**Récupération automatique** (via interceptor axios):
1. Détecter 403 + CSRF_TOKEN_INVALID
2. Récupérer nouveau token: `GET /api/csrf-token`
3. Réessayer requête originale avec nouveau token

### Erreur CSRF: Logs de Sécurité

Les tentatives d'attaque sont loggées:

```log
[2026-01-22 10:30:00] WARN: 🚨 CSRF_TOKEN_INVALID - TENTATIVE POTENTIELLE D'ATTAQUE
{
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "path": "/api/transactions",
  "method": "POST",
  "userId": null,
  "timestamp": "2026-01-22T10:30:00.000Z",
  "severity": "CRITICAL",
  "potentialAttack": true
}
```

---

## 📊 Monitoring & Logs

### Afficher Statut CSRF

```bash
npm run security:display-config
```

**Output**:
```
🔐 CSRF PROTECTION STATUS
═══════════════════════════════════════════════════════════
Enabled:        true
Provider:       csrf-csrf
Algorithm:      sha256
Token Size:     32 bytes
Cookie Options: 
  - httpOnly:   true
  - secure:     true
  - sameSite:   strict
  - maxAge:     86400 (24h)
Environment:    production
```

### Logs Sécurité

```bash
# Voir tous les événements CSRF
grep "CSRF" logs/security.log

# Voir uniquement les erreurs
grep "CSRF_TOKEN_INVALID" logs/security.log

# Monitorer en temps réel
tail -f logs/security.log | grep "CSRF"
```

### Métriques CSRF

```bash
# Compter tentatives échouées
grep "CSRF_TOKEN_INVALID" logs/security.log | wc -l

# Par IP (pour détecter attaques):
grep "CSRF_TOKEN_INVALID" logs/security.log | grep -oP '"ip": "\K[^"]+' | sort | uniq -c

# Tendance (dernière heure):
grep "CSRF" logs/security.log | tail -100 | grep "$(date -d '1 hour ago' '+%Y-%m-%d')"
```

---

## 🧪 Tests

### Lancer Tests CSRF

```bash
npm test -- csrf-protection.test.js
```

**Output esperé**:
```
PASS  tests/csrf-protection.test.js
  🛡️ CSRF Protection Tests
    1️⃣ Récupération de Token CSRF
      ✓ Récupérer un token CSRF valide (15ms)
      ✓ Token CSRF devrait être dans le cookie (12ms)
    2️⃣ Protection POST sans Token
      ✓ Rejeter POST SANS token CSRF (8ms)
      ✓ Rejeter DELETE SANS token (7ms)
    3️⃣ Protection POST avec Token Valide
      ✓ Accepter POST avec token valide (20ms)
    4️⃣ Rejet Token Invalide
      ✓ Rejeter token invalide (9ms)
      ✓ Rejeter token malformé (8ms)
    5️⃣ Routes Exclues
      ✓ POST /api/auth/login sans CSRF (10ms)
      ✓ GET /api/health sans CSRF (5ms)
    6️⃣ Méthodes HTTP
      ✓ POST protected (8ms)
      ✓ PUT protected (7ms)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
```

### Tests Manuels

```bash
# 1. Récupérer token
TOKEN=$(curl -s http://localhost:3001/api/csrf-token | jq -r '.csrfToken')
echo "Token: $TOKEN"

# 2. Tester POST sans token (doit échouer)
curl -X POST http://localhost:3001/api/journal-entries \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
# Résultat: 403 CSRF_TOKEN_INVALID ✅

# 3. Tester POST avec token (peut échouer sur auth, pas CSRF)
curl -X POST http://localhost:3001/api/journal-entries \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{"amount": 100}'
# Résultat: NON 403 CSRF ✅
```

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] `CSRF_SECRET` configuré (32+ chars aléatoire)
- [ ] `NODE_ENV=production`
- [ ] HTTPS/TLS configuré
- [ ] Redis configured for distributed sessions
- [ ] Frontend mise à jour avec CSRF headers
- [ ] Tests CSRF passent: `npm test -- csrf-protection`
- [ ] Logs configurés et testés
- [ ] Monitoring alertes mise en place
- [ ] Plan de rollback prêt

### Déploiement

```bash
# 1. Build
npm run build

# 2. Démarrer avec PM2 (ou votre orchestrateur)
pm2 start ecosystem.config.js

# 3. Vérifier
pm2 logs app | grep "CSRF"

# 4. Monitorer
pm2 monit

# 5. En cas de problème
npm run rollback:csrf
pm2 restart app
```

### Production Security

```javascript
// En production, forcer valeurs sécurisées
const prod Config = {
  secure: true,              // HTTPS only
  sameSite: 'strict',        // Strict mode
  domain: '.yourdomain.com', // Spécifier domaine
  httpOnly: true             // Pas d'accès JS
};
```

---

## ❓ FAQ

### Q: Token CSRF vs JWT?

**R**: 
- **JWT** = Authentification (qui êtes-vous?)
- **CSRF** = Autorisation (pouvez-vous faire cette action?)

Les deux sont nécessaires pour une sécurité complète.

### Q: Pourquoi HttpOnly cookie?

**R**: 
Empêcher JavaScript malveillant d'accéder au token CSRF. L'attaquant ne peut pas voler le token via XSS.

### Q: Peut-on désactiver CSRF?

**R**:
Oui, mais **NE FAITES PAS** en production:
```javascript
// ❌ DANGEROUS - ne pas faire
// app.use(csrfProtection.middleware()); // Commenter
```

C'est une vulnérabilité critique.

### Q: Token expiré automatiquement?

**R**:
Oui, après 24h (configurable dans `.env`). Le frontend gère automatiquement la régénération.

### Q: Pourquoi 403 et pas 401?

**R**:
- **401** = Authentification échouée (qui êtes-vous?)
- **403** = Autorisation échouée (vous ne pouvez pas faire ça)

CSRF est une violation d'autorisation, donc 403.

### Q: Performance impact?

**R**:
- Token generation: <5ms
- Token validation: <3ms
- Total overhead: <10ms par request

Négligeable comparé aux opérations database.

---

## 📞 Support

**Problèmes?**
1. Consulter [CSRF_QUICK_START.md](./CSRF_QUICK_START.md)
2. Vérifier logs: `tail -f logs/security.log | grep CSRF`
3. Lancer tests: `npm test -- csrf-protection`
4. Consulter [CSRF_TROUBLESHOOTING.md](./CSRF_TROUBLESHOOTING.md)

**Contact**: support@spofe.local

---

**Created**: 2026-01-22 | **Version**: 2.1 | **Status**: ✅ Production-Ready
