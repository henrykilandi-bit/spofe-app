# 🚀 Pull Request – Release Readiness (SPOFE APP)

**Version cible** : ___________  
**Type release** : Major / Minor / Patch  
**Date prévue** : YYYY-MM-DD

**Références** :
- [Runbook de déploiement](../Doc/runbook_deploiement.md)
- [Guide Administrateur](../GUIDE_ADMINISTRATEUR.md)
- [Guide Préparation Production](../GUIDE_PREPARATION_PRODUCTION.md)
- [Solutions implémentées](../TOUTES_SOLUTIONS_IMPLEMENTEES.md)

## 📄 Description de la PR
<!-- Décris clairement l'objectif de cette PR : feature, bugfix, stabilisation, préparation release, hotfix… -->

**Résumé en 3 lignes** :
- [ ] Quoi : [Fonctionnalité/correction/amélioration]
- [ ] Pourquoi : [Besoin/problème résolu]
- [ ] Impact : [Utilisateurs/composants affectés]

**Breaking changes** : Oui / Non  
**Migrations DB requises** : Oui / Non  
**Configuration changes** : Oui / Non

---

## 🧪 Type de PR

- [ ] Feature
- [ ] Bugfix
- [ ] Refactor
- [ ] Stabilisation / Release prep
- [ ] Hotfix
- [ ] Documentation

---

## 🟢 1. Démarrage & exécution locale

### 1.1 Lancement full-stack

- [ ] `npm install` (racine) sans erreur bloquante
- [ ] `npm run dev` démarre sans crash
- [ ] Backend actif sur `http://localhost:3001`
- [ ] Frontend actif sur `http://localhost:5173`
- [ ] Les process restent actifs (Windows inclus)

---

### 1.2 Backend – health & docs

- [ ] `GET /health` → `200 OK`
- [ ] `GET /api-docs` accessible
- [ ] Logs de démarrage propres (pas d’erreur critique)

---

### 1.3 Frontend – accès initial

- [ ] Page login visible
- [ ] Aucun crash JS au chargement
- [ ] API correctement appelée (`VITE_API_URL`)

---

## 🟢 2. Configuration & environnements

### 2.1 Backend `.env`

- [ ] `PORT` défini
- [ ] `DB_HOST`, `DB_NAME`, `DB_USER` définis
- [ ] `DB_PASSWORD` stratégie claire (vide assumé ou valeur)
- [ ] `JWT_SECRET` présent et non trivial
- [ ] `CORS_ORIGIN` configuré
- [ ] `MYSQLDUMP_PATH` défini
- [ ] `MYSQL_PATH` défini
- [ ] `dotenv-safe` chargé au démarrage

---

### 2.2 Frontend `.env`

- [ ] `VITE_API_URL` correct
- [ ] Build frontend sans erreur bloquante

---

## � 2.5. VALIDATION DES 7 SOLUTIONS IMPLÉMENTÉES

> 🎯 **OBLIGATOIRE** : Ces solutions doivent être validées avant toute release.

### Solution #1 - SECRETS (JWT cryptographiques)

```bash
cd cascade
node scripts/generate-secrets.js --validate
```

- [ ] JWT_SECRET existe et >= 86 caractères
- [ ] JWT_REFRESH_SECRET existe et >= 86 caractères
- [ ] Secrets différents l'un de l'autre
- [ ] JWT_EXPIRES_IN = 15m
- [ ] JWT_REFRESH_EXPIRES_IN = 7d
- [ ] Secrets stockés dans Vault/AWS (production)

**Critère**: ✅ 6/6 tests passent

---

### Solution #2 - VITEST (Tests automatisés)

```bash
cd cascade
npm test
```

- [ ] vitest.config.js présent
- [ ] tests/setup.js présent
- [ ] tests/auth.controller.test.js présent et fonctionnel
- [ ] Vitest installé (package.json)
- [ ] Script "test" configuré
- [ ] **100% des tests passent** (19/19 minimum)
- [ ] Couverture >= 70% (controllers)

**Critère**: ✅ Tous tests passent, aucun skip/todo

---

### Solution #3 - CONCURRENTLY (Process management)

```bash
npm run dev  # Depuis racine
```

- [ ] Concurrently installé (package.json racine)
- [ ] Script "dev" démarre backend + frontend simultanément
- [ ] PM2 supprimé (Windows fix appliqué)
- [ ] Backend logs visibles avec préfixe [BACK]
- [ ] Frontend logs visibles avec préfixe [FRONT]
- [ ] Arrêt propre avec Ctrl+C

**Critère**: ✅ Démarrage full-stack sans erreur

---

### Solution #4 - DB-RETRY (Résilience base de données)

```bash
cd cascade
node test-db-retry.js
```

- [ ] connectWithRetry() existe dans config/database.js
- [ ] Retry max = 5 tentatives
- [ ] Backoff exponentiel (1s, 2s, 4s, 8s, 16s)
- [ ] Pool connexions configuré (min:2, max:10)
- [ ] checkDatabaseHealth() exporté
- [ ] Connexion établie avec retry en cas d'échec temporaire

**Critère**: ✅ 5/6 tests passent (retry loop pattern peut varier)

---

### Solution #5 - HEALTHCHECK (Endpoint monitoring)

```bash
cd cascade
node test-health.js
# Ou
curl http://localhost:3001/health | jq '.'
```

- [ ] Route GET /health existe
- [ ] Status 200 quand tout OK
- [ ] Status 503 si DB déconnectée
- [ ] JSON contient : status, timestamp, uptime
- [ ] Métriques database (status, responseTime)
- [ ] Métriques memory (used, total, free)
- [ ] Métriques CPU (loadAverage)
- [ ] Health routes intégré dans app.js

**JSON attendu** :
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T...",
  "uptime": "123.45s",
  "database": { "status": "connected", "responseTime": "<10ms" },
  "memory": { "used": 45.2, "total": 8192, "free": 3421.5 },
  "cpu": { "loadAverage": [0.5, 0.4, 0.3] }
}
```

**Critère**: ✅ 7/7 tests passent

---

### Solution #6 - LOGGER-ENHANCED (Sanitization + rotation)

```bash
cd cascade
node test-logger-sanitization.js

# Vérifier aucun secret en clair
grep -i "password" logs/app-*.log | grep -v "REDACTED"
```

- [ ] Fonction sanitize() existe dans utils/logger.js
- [ ] DailyRotateFile configuré
- [ ] Compression activée (.gz)
- [ ] Patterns sensibles détectés : password, token, secret, authorization, jwt
- [ ] Tous secrets remplacés par ***REDACTED***
- [ ] Rotation quotidienne activée
- [ ] Rétention : app 14j, error 30j, security 90j
- [ ] Logs générés dans logs/ avec format YYYY-MM-DD

**Critère**: ✅ Aucun secret en clair dans logs

---

### Solution #7 - CORS-DYNAMIQUE (Whitelist par environnement)

```bash
cd cascade
powershell -ExecutionPolicy Bypass -File test-cors-simple.ps1
```

- [ ] config/cors.js existe
- [ ] Whitelist par environnement (dev, staging, prod)
- [ ] Fonction origin() avec validation
- [ ] Logging origines bloquées (WARN level)
- [ ] Credentials activés (withCredentials: true)
- [ ] Cache preflight = 86400 (24h)
- [ ] CORS_WHITELIST production = HTTPS uniquement
- [ ] CORS middleware intégré dans app.js
- [ ] Origin autorisée → Status 200 + headers CORS
- [ ] Origin bloquée → Status 500 + log "CORS: Origin bloquée"

**Critère**: ✅ 9/9 tests passent

---

### BONUS - Backup & Restore (Auto-détection Windows)

```bash
cd cascade
npm run db:backup
ls -lh backups/  # Vérifier fichier .sql.gz créé
```

- [ ] databaseBackup.service.js existe
- [ ] getMySQLDumpPath() auto-détecte XAMPP/WAMP/MySQL
- [ ] getMySQLPath() auto-détecte mysql.exe
- [ ] Support XAMPP : C:\xampp\mysql\bin\
- [ ] Support WAMP : C:\wamp64\bin\mysql\...
- [ ] Fonction createBackup() fonctionne
- [ ] Fonction restoreDatabase() fonctionne
- [ ] Backup automatique toutes les 24h
- [ ] Compression gzip activée

**Critère**: ✅ Backup créé et compressé

---

### 📊 Score Global Validation Solutions

```bash
cd cascade
node test-all-solutions.js
```

**Résultats attendus** :
```
Total tests     : 49
Tests réussis   : 47 ✅
Tests échoués   : 2 ❌ (PM2 absent = normal, pattern retry = OK)
Taux de succès  : 95.9%
```

- [ ] **Score >= 95%** (47/49 tests minimum)
- [ ] Échecs documentés et justifiés
- [ ] Rapport `test-all-solutions.js` généré

**🚨 BLOQUANT SI < 95%** : Corriger avant merge

---

## �🟢 3. Base de données & migrations

### 3.1 Migrations

- [ ] `npm run db:setup` OK
- [ ] `npm run db:migrate` OK
- [ ] Aucune migration pending au démarrage

---

### 3.2 Données admin

- [ ] Admin seedé (script exécuté)
- [ ] Login admin fonctionnel

---

## 🟢 4. Authentification & sécurité

### 4.1 Login

- [ ] Login admin OK depuis le frontend
- [ ] JWT reçu et stocké
- [ ] Accès aux routes protégées validé

---

### 4.2 Inscription

- [ ] Inscription fonctionnelle (pas d'erreur 400)
- [ ] Payload frontend aligné avec validator backend
- [ ] Utilisateur créé en base

---

### 4.3 Sécurité API

- [ ] Routes sensibles protégées
- [ ] Rate limiting actif
- [ ] Helmet actif
- [ ] CORS validé

---

## 🟢 5. Endpoints métier (minimum fonctionnel)

- [ ] `/chartsofaccounts`
- [ ] `/journal-entries`
- [ ] `/third-parties`
- [ ] `/users`
- [ ] `/balance-sheet`
- [ ] `/income-statement`

📌 **Convention de réponse validée**  

- [ ] Toutes les APIs respectent le même format (`{ data: ... }` ou documenté)

---

## 🟢 6. Backups MySQL (CRITIQUE)

### 6.1 Backup

- [ ] `mysqldump --version` OK
- [ ] Backup automatique fonctionne
- [ ] Fichier `.sql` ou `.sql.gz` créé
- [ ] Logs de succès présents

---

### 6.2 Restore

- [ ] Restore utilise `MYSQL_PATH` (variable d'environnement)
- [ ] Restore désactivé ou protégé en prod
- [ ] Restore testé uniquement en dev

---

## 🟢 7. Tests & qualité

### 7.1 Backend - Tests unitaires

```bash
cd cascade
npm test
```

- [ ] **100% des tests passent** (19/19 minimum)
- [ ] `npm run test:coverage` OK
- [ ] Couverture Controllers >= 80%
- [ ] Couverture Services >= 70%
- [ ] Framework de tests : Vitest (unifié)
- [ ] Aucun test `skip` ou `todo` actif
- [ ] Mocks configurés (User model, redis, logger, jwt)

**Tests critiques couverts** :
- [ ] auth.controller.test.js (login, register, refresh, logout)
- [ ] Validation Joi schemas
- [ ] Middleware auth (token validation, blacklist)
- [ ] Sanitization logs (pas de secrets)

---

### 7.2 Frontend - Tests E2E

```bash
cd frontend
npm run test
```

- [ ] `npm run test` OK
- [ ] Tests critiques présents (login minimum)
- [ ] Tests navigation (dashboard, plan comptable)
- [ ] Tests formulaires (création écriture)

**Framework** : À implémenter (Cypress recommandé)

---

### 7.3 Tests d'intégration CORS

**Backend démarré requis** :
```bash
npm run dev  # Depuis racine
```

**Ouvrir dans navigateur** :
```
http://localhost:5173/test-integration-cors.html
```

- [ ] Test 1 : Health endpoint (GET /health) → ✅ 200
- [ ] Test 2 : Authentication (POST /api/auth/login) → ✅ 401 sans creds
- [ ] Test 3 : Preflight OPTIONS → ✅ Headers CORS présents
- [ ] Test 4 : Credentials (withCredentials: true) → ✅ OK
- [ ] Test 5 : All solutions intégrées → ✅ Aucune erreur

**Critère** : ✅ 5/5 tests passent avec headers CORS corrects

---

### 7.4 Tests de charge (optionnel mais recommandé)

```bash
# Installer Apache Bench
sudo apt-get install apache2-utils  # Linux
# Ou télécharger pour Windows

# Test charge modérée
ab -n 100 -c 10 -H "Accept: application/json" http://localhost:3001/health
```

**Métriques attendues** :
- [ ] Time per request : < 50ms (moyenne)
- [ ] Failed requests : 0
- [ ] Transfer rate : > 100 KB/s
- [ ] Connexions DB max : < 20

---

### 7.5 Lint & Code quality

```bash
cd cascade
npm run lint

cd ../frontend
npm run lint
```

- [ ] Backend : `npm run lint` sans erreur bloquante
- [ ] Frontend : `npm run lint` sans erreur bloquante
- [ ] ESLint configuré
- [ ] Prettier configuré (optionnel)
- [ ] Pas de `console.log` en production
- [ ] Pas de code commenté en masse

---

### 7.6 Audit sécurité

```bash
cd cascade
npm audit --production

# Si vulnérabilités critiques
npm audit fix
```

- [ ] **0 vulnérabilités critiques**
- [ ] **0 vulnérabilités hautes**
- [ ] Vulnérabilités moyennes documentées
- [ ] Plan de correction si nécessaire

**Scan secrets** (optionnel) :
```bash
npm install -g trufflehog
trufflehog filesystem . --json > security-scan.json
```

- [ ] Aucun secret détecté dans le code

---

## 🟢 8. Docker & CI/CD

### 8.1 Docker

- [ ] `docker compose up` OK
- [ ] Services healthy
- [ ] Ports documentés / pas de conflit

---

### 8.2 CI/CD

- [ ] GitHub Actions passent
- [ ] Secrets configurés
- [ ] `continue-on-error` justifié ou supprimé

---

## 🟢 9. Observabilité & maintenance

- [ ] `/health` reflète l'état réel

- [ ] Logs exploitables

- [ ] Dossier backups vérifié

- [ ] README à jour (setup + run)

---

## 🟢 10. Décision release

### 🔍 Résumé validation

**Score global validation** :
- [ ] Score solutions >= 95% (47/49 tests)
- [ ] Tests unitaires 100% (19/19)
- [ ] Tests intégration CORS 100% (5/5)
- [ ] Audit sécurité : 0 vulnérabilités critiques
- [ ] Performance baseline acceptable

**Bloquants identifiés** :
- ❌ [Liste des bloquants si présents]
- ❌ ...

**Risques acceptés** :
- ⚠️ [Liste des risques acceptés avec justification]
- ⚠️ ...

**Breaking changes** :
- [ ] Aucun breaking change
- [ ] Breaking changes documentés dans CHANGELOG.md
- [ ] Plan de migration utilisateurs préparé

**Migrations base de données** :
- [ ] Aucune migration
- [ ] Migrations testées en staging
- [ ] Plan rollback migrations préparé

---

### ✅ Checklist finale release

#### Infrastructure
- [ ] Backup production créé et vérifié
- [ ] Espace disque suffisant (> 20%)
- [ ] Accès SSH production validé
- [ ] Secrets production générés et stockés (Vault/AWS)

#### Tests
- [ ] Tous tests automatisés passent (100%)
- [ ] Tests intégration CORS passent (5/5)
- [ ] Tests performance acceptables
- [ ] Audit sécurité OK (0 critical)

#### Documentation
- [ ] README à jour
- [ ] CHANGELOG.md mis à jour
- [ ] API docs à jour
- [ ] Runbook déploiement consulté
- [ ] Guide administrateur consulté

#### Monitoring
- [ ] Uptime Robot configuré
- [ ] Grafana dashboards créés
- [ ] Alertes configurées
- [ ] Logs sanitization validée

#### Sécurité
- [ ] CORS production = HTTPS uniquement
- [ ] Rate limiting testé
- [ ] Blacklist tokens fonctionnel
- [ ] SSL/TLS Grade A+ (si prod)

#### Communication
- [ ] Équipe notifiée (date/heure release)
- [ ] Utilisateurs informés (si downtime)
- [ ] Fenêtre de déploiement validée
- [ ] Plan rollback préparé et documenté

---

### ✅ Décision finale

**Reviewer 1** : _______________ - Date : ___________
- [ ] ❌ NOT READY - Bloquants : [Liste]
- [ ] 🟡 READY WITH RISKS - Risques : [Liste]
- [ ] ✅ READY FOR RELEASE

**Reviewer 2** : _______________ - Date : ___________
- [ ] ❌ NOT READY - Bloquants : [Liste]
- [ ] 🟡 READY WITH RISKS - Risques : [Liste]
- [ ] ✅ READY FOR RELEASE

**Release Manager** : _______________ - Date : ___________
- [ ] ❌ NOT READY
- [ ] 🟡 READY WITH RISKS (Risques documentés et acceptés)
- [ ] ✅ READY FOR RELEASE

**Date release programmée** : YYYY-MM-DD HH:MM UTC  
**Version déployée** : v___________  
**Responsable déploiement** : _______________

---

## 📝 Notes complémentaires
<!-- Informations utiles pour le reviewer / release manager -->

**Points d'attention** :
- [ ] [Point 1]
- [ ] [Point 2]

**Post-déploiement (à faire)** :
- [ ] Monitoring intensif 1h après déploiement
- [ ] Vérifier /health toutes les 5 minutes
- [ ] Consulter logs erreurs
- [ ] Valider fonctionnalités critiques
- [ ] Confirmer backups automatiques actifs

**Rollback plan** :
- Backup pré-déploiement : [Nom fichier]
- Tag Git rollback : v___________
- Durée estimée rollback : < 30 minutes
- Responsable rollback : _______________

---

## 🔗 Références utiles

- [Runbook de déploiement](../Doc/runbook_deploiement.md) - Procédure complète
- [Guide Administrateur](../GUIDE_ADMINISTRATEUR.md) - Opérations quotidiennes
- [Guide Préparation Production](../GUIDE_PREPARATION_PRODUCTION.md) - Config production
- [Solutions implémentées](../TOUTES_SOLUTIONS_IMPLEMENTEES.md) - Détails techniques
- [Troubleshooting](../GUIDE_ADMINISTRATEUR.md#troubleshooting) - Problèmes courants

---

**Template version** : 2.0 (Enhanced)  
**Dernière mise à jour** : 18 janvier 2026

