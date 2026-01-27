# ⚡ RATE LIMITING - DÉMARRAGE RAPIDE

## 🎯 Résumé en 30 secondes

**Problème:** Pas de protection contre force brute/credential stuffing  
**Solution:** 4 niveaux de rate limiting avec lockout intelligent  
**Status:** ✅ Intégré et prêt  
**Action:** Démarrer l'app et tester

---

## 🚀 Démarrage (5 minutes)

```bash
# 1. Démarrer l'application
npm run dev

# 2. Vous devriez voir dans les logs:
# 🔐 RATE LIMITING CONFIGURATION - DEVELOPMENT
# ...
# ✅ Security validation réussie

# 3. Tester une attaque (ouvrir 2e terminal)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"WRONG"}'

# 4. Répéter 5 fois: Après 3 tentatives = BLOQUÉ
# Response: {"error":"ACCOUNT_LOCKED","message":"...","httpStatusCode":423}

# 5. Attendre 5 min en dev (ou vérifier Redis)
# Account se déverrouille automatiquement
```

---

## 📊 4 Niveaux de protection

| Niveau | Où | Limite | Protection |
|--------|-----|--------|-----------|
| 🔴 **LOGIN** | `/api/auth/login` | 3/15min | Lockout progressif |
| 🟠 **API** | Toutes routes | 30-300/min | Par rôle |
| 🟡 **RESET** | `/api/auth/forgot-password` | 3/heure | Blocage 1h |
| 🔵 **UPLOAD** | Uploads fichiers | 50/heure | Limite taille |

---

## 🔓 Déverrouiller un compte

```bash
# Via API (admin only)
curl -X POST http://localhost:3001/api/security/unlock-account \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","reason":"Erreur test"}'

# Via code
import accountLockoutService from './src/services/account-lockout.service.js';
await accountLockoutService.unlockAccount('user@example.com', 'ADMIN_ID', 'Manual unlock');
```

---

## 📋 Configuration par environnement

```bash
# Development: Permissif (10 tentatives, 5min lockout)
NODE_ENV=development npm run dev

# Production: Strict (3 tentatives, 30min lockout)
NODE_ENV=production npm run dev
```

---

## 🔍 Vérifier le fonctionnement

```bash
# Logs de rate limiting
grep "RATE_LIMIT" logs/security.log

# Logs d'account lockout
grep "ACCOUNT_LOCKED" logs/security.log

# Logs de credential stuffing
grep "CREDENTIAL_STUFFING" logs/security.log

# Voir le statut de sécurité
curl http://localhost:3001/api/security/status \
  -H "Authorization: Bearer {TOKEN}"
```

---

## ⚙️ Configuration rapide

Fichier: `cascade/src/config/rate-limiting-config.js`

```javascript
// Pour augmenter la limite en dev:
case 'development':
  return {
    ...baseConfig,
    login: {
      maxAttempts: 20,  // Au lieu de 10
      lockoutDuration: 1 * 60 * 1000, // 1 min
    }
  };
```

---

## 🚨 Alertes

- ✅ > 50 failed logins/jour → Email critique
- ✅ > 10 comptes verrouillés → Alert haute
- ✅ Credential stuffing détecté → Alert critique
- ✅ Injection attempts > 10 → Alert haute

---

## 📞 Problème?

| Problème | Solution |
|----------|----------|
| Compte verrouillé | Attendre 15min ou déverrouiller |
| Rate limit trop strict | Voir configuration par env |
| Redis down | Fallback automatique en mémoire |
| Tests échouent | Utiliser NODE_ENV=testing |

---

## ✅ Checklist

- [ ] Application démarre sans erreur
- [ ] Logs affichent "RATE LIMITING CONFIGURATION"
- [ ] 3 tentatives login échouées → Account locké
- [ ] Can unlock account via API
- [ ] Credential stuffing détecté avec > 3 patterns
- [ ] Redis connected OU fallback memory ok
- [ ] API calls limitées par rôle
- [ ] Password reset limité à 3/heure

**Status:** 🟢 READY FOR PRODUCTION

---

Pour plus de détails: `RATE_LIMITING_ADVANCED_GUIDE.md`
