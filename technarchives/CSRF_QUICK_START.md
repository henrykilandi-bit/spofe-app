# 🛡️ CSRF PROTECTION - QUICK START (5 min)

**Status**: ✅ Production-ready | **Priority**: 🔴 URGENT | **Effort**: Easy

## 🚀 TL;DR - 30 secondes

```bash
# 1. Installer
npm install csrf-csrf

# 2. Déployer
npm run deploy:csrf

# 3. Tester
npm test -- csrf-protection.test.js

# 4. Démarrer
npm run dev

# Vérifier dans les logs:
# "✅ CSRF Protection initialisée avec succès"
```

**C'est tout!** ✨ La protection CSRF est maintenant active.

---

## ⚡ En 5 Minutes

### Minute 1-2: Installation
```bash
cd cascade
npm install csrf-csrf
```

### Minute 3-4: Déploiement
```bash
npm run deploy:csrf
```

Cela va:
- ✅ Backuper vos fichiers
- ✅ Configurer CSRF dans `.env`
- ✅ Intégrer les middlewares
- ✅ Configurer les routes

### Minute 5: Vérification
```bash
npm run dev
```

Cherchez dans les logs:
```
✅ CSRF Protection initialisée avec succès
🔐 CONFIGURATION: RATE LIMITING CONFIGURATION
   -> methodsProtected: ['POST','PUT','PATCH','DELETE']
```

---

## 🧪 Test Rapide (Sans redémarrer)

### Terminal 1 - Récupérer token CSRF:
```bash
curl -s http://localhost:3001/api/csrf-token | jq .csrfToken
# Résultat: "abc123def456..."
```

### Terminal 2 - Essayer POST sans token (doit échouer):
```bash
curl -X POST http://localhost:3001/api/journal-entries \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'

# Résultat: {"error": "CSRF_TOKEN_INVALID", ...}  ✅
```

### Terminal 3 - Essayer POST avec token (peut échouer sur auth, pas CSRF):
```bash
TOKEN="<token_from_step_1>"
curl -X POST http://localhost:3001/api/journal-entries \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{"amount": 1000}'

# Résultat: {"error": "UNAUTHORIZED"} OU {"message": "validation failed"}
# Important: PAS "CSRF_TOKEN_INVALID" ✅
```

---

## 📝 Configuration dans .env

Copier depuis `.env.csrf.example`:

```bash
# Générer secret fort
CSRF_SECRET=$(node -e "require('crypto').randomBytes(32).toString('hex')")

# Ajouter à .env
echo "CSRF_SECRET=$CSRF_SECRET" >> .env
echo "CSRF_COOKIE_NAME=__Host-csrf-token" >> .env
```

---

## 🔒 Protection Appliquée À

**Routes Protégées** (nécessitent token CSRF):
- ✅ `POST /api/*` (sauf exceptions)
- ✅ `PUT /api/*`
- ✅ `PATCH /api/*`
- ✅ `DELETE /api/*`

**Routes Exclues** (pas de CSRF requis):
- ✅ `/api/auth/login`
- ✅ `/api/auth/register`
- ✅ `/api/auth/forgot-password`
- ✅ `/api/health`
- ✅ `/webhooks/*`
- ✅ GET requests (safe)

---

## 🧬 Frontend Integration (React)

### 1. Importer le service CSRF

```javascript
import csrfService from 'src/services/csrf-service.js';

// Dans useEffect au chargement:
useEffect(() => {
  csrfService.fetchCSRFToken();
}, []);
```

### 2. Utiliser dans les requêtes axios

```javascript
import axios from 'axios';

// Axios interceptor (automatique après setup CSRF service)
axios.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const token = await csrfService.ensureToken();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }
  return config;
});

// Utilisation normale:
await axios.post('/api/transactions', { amount: 1000 });
// Token CSRF automatiquement ajouté ✅
```

### 3. Ou avec fetch

```javascript
// Utiliser le wrapper fourni
const response = await csrfService.fetchWithCSRF('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000 })
});
```

---

## 🐛 Troubleshooting

### Problème: HTTP 403 CSRF_TOKEN_INVALID

**Cause**: Token manquant, expiré, ou invalide

**Solutions**:
1. Vérifier que `X-CSRF-Token` header est présent
2. Récupérer un nouveau token: `GET /api/csrf-token`
3. Token a 24h expiration - en obtenir un nouveau si ancien

```bash
# Récupérer nouveau token
curl http://localhost:3001/api/csrf-token | jq -r '.csrfToken' > token.txt

# Utiliser dans requête
TOKEN=$(cat token.txt)
curl -X POST http://localhost:3001/api/... -H "X-CSRF-Token: $TOKEN"
```

### Problème: "CSRF_SECRET not configured"

**Cause**: Variable .env manquante

**Solution**:
```bash
# Générer et ajouter à .env
CSRF_SECRET=$(node -e "require('crypto').randomBytes(32).toString('hex')")
echo "CSRF_SECRET=$CSRF_SECRET" >> .env

# Redémarrer
npm run dev
```

### Problème: Logs affichent "CSRF token génération failed"

**Cause**: Erreur lors du fetch token

**Solution**: Vérifier que:
- 1. Server tourne: `curl http://localhost:3001/health`
- 2. Redis accessible (ou fallback mémoire OK)
- 3. CORS configuré correctement

---

## 📊 Vérifier le déploiement

```bash
# Afficher statut CSRF
npm run security:display-config

# Lancer tests complets
npm test -- csrf-protection.test.js

# Voir logs sécurité
tail -f logs/security.log | grep CSRF
```

---

## 🔄 Rollback (Si problème)

```bash
# Restaurer depuis backup automatique
npm run rollback:csrf

# Ou manuellement:
cp .backups/csrf-*/src/app.js src/app.js
cp .backups/csrf-*/src/middleware/error.middleware.js src/middleware/error.middleware.js

# Redémarrer
npm run dev
```

---

## ✅ Checklist Post-Déploiement

- [ ] `npm run dev` démarre sans erreur
- [ ] Logs affichent "✅ CSRF Protection initialisée"
- [ ] `curl http://localhost:3001/api/csrf-token` retourne token
- [ ] POST sans token retourne 403 CSRF_TOKEN_INVALID
- [ ] POST avec token retourne erreur métier (pas CSRF)
- [ ] `npm test -- csrf` passe tous les tests
- [ ] Frontend mise à jour pour inclure headers CSRF
- [ ] Logs sécurité enregistrent les tentatives d'attaque

---

## 📚 Documentation Complète

Pour plus de détails:

- **Configuration avancée**: [CSRF_PROTECTION_CONFIG.md](./CSRF_PROTECTION_CONFIG.md)
- **Intégration frontend**: [CSRF_FRONTEND_INTEGRATION.md](./CSRF_FRONTEND_INTEGRATION.md)
- **Troubleshooting**: [CSRF_TROUBLESHOOTING.md](./CSRF_TROUBLESHOOTING.md)
- **Tests détaillés**: Voir `tests/csrf-protection.test.js`

---

## 🎓 Comprendre CSRF Protection

**Qu'est-ce que CSRF?**
Une attaque où un attaquant fait faire une action (virement, suppression) depuis le compte d'une victime.

**Comment ça marche?**
1. Victime connectée à SPOFE dans l'onglet A
2. Victime visite site malveillant dans l'onglet B
3. Site B fait POST à SPOFE (dans le contexte de la victime)
4. Sans CSRF: Requête acceptée = ATTAQUE
5. Avec CSRF: Token requis = attaque bloquée ✅

**Notre solution:**
- Double-Submit Cookie Pattern
- Synchronizer Token Pattern
- Token expiration 24h
- Cookie HttpOnly + Secure + SameSite=Strict

---

## 🚨 En Cas d'Urgence

```bash
# Désactiver rapidement (mode maintenance):
# 1. Commenter les middlewares dans src/app.js
# 2. Redémarrer
# ⚠️  NE PAS LAISSER DÉSACTIVÉ - réactiver ASAP!

# Contact support:
# - Problème: Email support@spofe.local
# - Urgent: Appeler +1-xxx-xxx-xxxx
```

---

**Created**: 2026-01-22 | **Version**: 2.1 | **Status**: ✅ Production-Ready
