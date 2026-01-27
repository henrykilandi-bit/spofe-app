# 📋 FICHIERS CRITIQUES À SURVEILLER - SPOFE v2.1

**Date**: 21 janvier 2026  
**Statut**: ✅ Production Ready  
**Objectif**: Prévention des anomalies blocantes

---

## 🎯 Résumé Exécutif

Pour éviter les anomalies blocantes dans SPOFE, il faut surveiller **32 fichiers critiques** répartis en 6 catégories:

| Catégorie | Fichiers | Impact | Fréquence |
|-----------|----------|--------|-----------|
| **🔧 Configuration** | 7 | Application ne démarre pas | Quotidien |
| **💾 Base de données** | 6 | Données perdues/corrompues | Temps réel |
| **🔐 Sécurité** | 5 | Accès non-autorisé | Temps réel |
| **🚦 Middleware** | 7 | Requêtes échouées | Hourly |
| **📊 Modèles ORM** | 4 | Requêtes échouées | Quotidien |
| **📝 Logs & Monitoring** | 3 | Diagnostique aveugle | Continu |

---

## 1️⃣ CONFIGURATION & ENVIRONNEMENT (7 fichiers)

### 🔴 **Critique - Surv. Quotidienne**

| Fichier | Chemin | Élément à Surveiller | Impact | Alerte Si |
|---------|--------|----------------------|--------|-----------|
| **.env** | `cascade/.env` | Variables d'env (DB, JWT, Redis) | Application ne démarre pas | Valeur vide/invalide |
| **.env.production** | `cascade/.env.production` | Config production | Production crash | Non-synchronisé |
| **package.json** | `cascade/package.json` | Dépendances, scripts NPM | Build failure | Versions cassées |
| **package-lock.json** | `cascade/package-lock.json` | Lock des dépendances | Inconsistance versions | Modifié manuellement |
| **.sequelizerc** | `cascade/.sequelizerc` | Config Sequelize ORM | Migrations échouent | Paths invalides |
| **babel.config.json** | `cascade/babel.config.json` | ES6 transpilation | Syntax errors | Presets manquants |
| **.eslintrc.cjs** | `cascade/.eslintrc.cjs` | Code style rules | Quality degradation | Rules cassées |

### ✅ Actions de Surveillance
```bash
# Vérifier variables env
grep -E "^[A-Z_]+=\$|^$" cascade/.env | wc -l  # Doit avoir ≥20 variables

# Vérifier dépendances
npm outdated
npm audit

# Vérifier lock
md5sum package-lock.json  # Comparer checksums
```

---

## 2️⃣ BASE DE DONNÉES & MIGRATIONS (6 fichiers)

### 🔴 **Critique - Surv. Temps Réel**

| Fichier | Chemin | Élément à Surveiller | Impact | Alerte Si |
|---------|--------|----------------------|--------|-----------|
| **database.js** | `cascade/src/config/database.js` | Connexion DB, pool, retry logic | Pas de DB = application morte | Erreur de connexion |
| **migrations/** | `cascade/src/database/migrations/*` | État des migrations | Schéma invalide | Fichier manquant/corrompu |
| **user.model.js** | `cascade/src/models/user.model.js` | Schéma User (auth) | Auth échouée | Colonnes manquantes |
| **chartOfAccount.model.js** | `cascade/src/models/chartOfAccount.model.js` | Plan comptable OHADA | Écritures invalides | Indices corrompus |
| **journalEntry.model.js** | `cascade/src/models/journalEntry.model.js` | Écritures comptables | Données financières perdues | Relations rompues |
| **associations.js** | `cascade/src/models/associations.js` | Relations Sequelize | Queries échouent | Foreign keys invalides |

### ✅ Actions de Surveillance
```bash
# Vérifier connexion DB
curl http://localhost:3001/api/health | jq '.database.status'

# Vérifier état des migrations
npm run db:migrate:status

# Vérifier intégrité modèles
npm run db:verify

# Dump des colonnes critiques
mysql -u root -p spofe_v2_1 -e "SHOW TABLES; DESC users; DESC chart_of_accounts;"
```

---

## 3️⃣ SÉCURITÉ & AUTHENTIFICATION (5 fichiers)

### 🔴 **Critique - Surv. Temps Réel**

| Fichier | Chemin | Élément à Surveiller | Impact | Alerte Si |
|---------|--------|----------------------|--------|-----------|
| **auth.middleware.js** | `cascade/src/middleware/auth.middleware.js` | JWT token validation | Accès non-autorisé | Bypass possible |
| **security.middleware.js** | `cascade/src/middleware/security.middleware.js` | CORS, CSP, XSS, HPP | Injection attacks | Headers manquants |
| **tokenBlacklist.middleware.js** | `cascade/src/middleware/tokenBlacklist.middleware.js` | Token revocation | Tokens compromis actifs | Blacklist non fonctionnelle |
| **rateLimit.middleware.js** | `cascade/src/middleware/rateLimit.middleware.js` | Rate limiting (brute force) | Brute force attacks | Rate limiter bypass |
| **securityEvent.model.js** | `cascade/src/models/securityEvent.model.js` | Audit des événements sec. | Pas de trace des attaques | Table pleine/corrompue |

### ✅ Actions de Surveillance
```bash
# Tester auth
curl -X POST http://localhost:3001/api/auth/login -d '{"username":"admin","password":"admin"}'

# Vérifier security headers
curl -I http://localhost:3001/api/health | grep -i "x-content-type"

# Vérifier rate limiting
for i in {1..101}; do curl http://localhost:3001/api/health; done | grep -i "429\|too many"

# Vérifier tokens blacklistés
mysql -u root -p spofe_v2_1 -e "SELECT COUNT(*) FROM token_blacklists WHERE is_active=1;"
```

---

## 4️⃣ MIDDLEWARE CRITIQUE (7 fichiers)

### 🟡 **Important - Surv. Hourly**

| Fichier | Chemin | Élément à Surveiller | Impact | Alerte Si |
|---------|--------|----------------------|--------|-----------|
| **error.middleware.js** | `cascade/src/middleware/error.middleware.js` | Global error handler | 500 errors non gérés | Exceptions non catchées |
| **requestLogger.middleware.js** | `cascade/src/middleware/requestLogger.middleware.js` | HTTP request logging | Debug logs manquants | Erreurs de log |
| **metricsMiddleware.js** | `cascade/src/middleware/metricsMiddleware.js` | Prometheus metrics | Metrics non disponibles | Métriques manquantes |
| **performance.middleware.js** | `cascade/src/middleware/performance.middleware.js` | Response time tracking | Performance dégradée invisible | Temps > 5s |
| **validate.middleware.js** | `cascade/src/middleware/validate.middleware.js` | Input validation (Joi) | Données invalides acceptées | Validation bypass |
| **businessOperation.middleware.js** | `cascade/src/middleware/businessOperation.middleware.js` | Validation métier | Écritures invalides | Règles métier cassées |
| **tokenBlacklist.middleware.js** | `cascade/src/middleware/tokenBlacklist.middleware.js` | Token revocation | Tokens révoqués actifs | Middleware non appliqué |

### ✅ Actions de Surveillance
```bash
# Tester middleware d'erreur
curl http://localhost:3001/api/invalid-endpoint 2>&1 | grep -i "error"

# Vérifier logs des requêtes
tail -f cascade/logs/combined.log | grep "POST\|GET\|PUT\|DELETE"

# Tester performance
curl http://localhost:3001/api/health -w "Response time: %{time_total}s\n"

# Vérifier métriques
curl http://localhost:9090/api/v1/query?query=http_requests_total
```

---

## 5️⃣ MODÈLES ORM CRITIQUES (4 fichiers)

### 🟡 **Important - Surv. Quotidienne**

| Fichier | Chemin | Élément à Surveiller | Impact | Alerte Si |
|---------|--------|----------------------|--------|-----------|
| **user.model.js** | `cascade/src/models/user.model.js` | Schéma User (hashing, validation) | Auth échouée | Colonnes manquantes |
| **chartOfAccount.model.js** | `cascade/src/models/chartOfAccount.model.js` | OHADA chart structure | Comptabilité invalide | Indices corrompus |
| **journalEntry.model.js** | `cascade/src/models/journalEntry.model.js` | Journal entries | Perte de données financières | Relations rompues |
| **auditTrail.model.js** | `cascade/src/models/auditTrail.model.js` | Audit logs | Pas de traçabilité | Table corrompue |

### ✅ Actions de Surveillance
```bash
# Vérifier schémas modèles
mysql -u root -p spofe_v2_1 -e "DESC users; DESC chart_of_accounts; DESC journal_entries;"

# Vérifier indices
mysql -u root -p spofe_v2_1 -e "SHOW INDEXES FROM users; SHOW INDEXES FROM journal_entries;"

# Vérifier intégrité
npm run db:verify
```

---

## 6️⃣ LOGS & MONITORING (3 fichiers + 1 répertoire)

### 🟢 **Diagnostique - Surv. Continue**

| Fichier | Chemin | Élément à Surveiller | Impact | Alerte Si |
|---------|--------|----------------------|--------|-----------|
| **logger.js** | `cascade/src/utils/logger.js` | Winston logger config | Pas de logs = diagnostic impossible | Logger non chargé |
| **error.log** | `cascade/logs/error.log` | Erreurs production | Anomalies non vues | > 100 errors/heure |
| **combined.log** | `cascade/logs/combined.log` | Tous les logs | Audit trail manquant | Fichier > 1GB |
| **logs/** | `cascade/logs/*` | Dossier logs | Disk full | Espace < 1GB |

### ✅ Actions de Surveillance
```bash
# Taille des logs
du -sh cascade/logs/

# Erreurs récentes
tail -100 cascade/logs/error.log | grep -i "error\|exception"

# Taux d'erreurs
grep -c "ERROR" cascade/logs/error.log

# Logs compressés (archivage)
ls -lh cascade/logs/*.gz | head -10
```

---

## 📊 MATRICE DE SURVEILLANCE (COMPLÈTE)

### Par Impact (Criticité)

```
🔴 CRITIQUE (Surv. Temps Réel / Quotidien)
├── Configuration (.env, package.json)
├── Base de Données (database.js, migrations)
├── Sécurité (auth, tokenBlacklist)
└── Total: 18 fichiers

🟡 IMPORTANT (Surv. Hourly)
├── Middleware applicatif (7 fichiers)
├── Modèles ORM (4 fichiers)
└── Total: 11 fichiers

🟢 DIAGNOSTIQUE (Surv. Continue)
├── Logs & Monitoring (3 fichiers)
└── Total: 3 fichiers
```

### Par Fréquence

```
⏱️ TEMPS RÉEL (Continu - 24/7)
├── Health checks: /api/health
├── Error monitoring: logs/error.log
├── Metrics: Prometheus scraping
└── Actions: Auto-alertes + Slack

📅 QUOTIDIEN (Une fois par jour)
├── .env validation
├── Dépendances (npm audit)
├── DB backup verification
├── DB integrity check
└── Actions: Report matinal

🕐 HORAIRE (Toutes les heures)
├── Performance metrics
├── Rate limiting stats
├── Error rate trends
└── Actions: Auto-correction + notification

📈 HEBDOMADAIRE (Une fois par semaine)
├── Logs archivage/rotation
├── Disk space analysis
├── Security events review
└── Actions: Cleanup + report
```

---

## 🔍 SCRIPT DE SURVEILLANCE (À IMPLÉMENTER)

### 1. Health Check Script
```bash
#!/bin/bash
# monitoring/health-check.sh

# Vérifier tous les services critiques
services=(
  "database"
  "redis"
  "auth"
  "security"
  "performance"
)

for service in "${services[@]}"; do
  status=$(curl -s http://localhost:3001/api/health | jq ".${service}.status")
  if [ "$status" != '"UP"' ]; then
    echo "ALERT: $service is DOWN" >> logs/alerts.log
    # Envoyer Slack/Email/SMS
  fi
done
```

### 2. File Integrity Script
```bash
#!/bin/bash
# monitoring/file-integrity.sh

# Tracker checksums des fichiers critiques
find cascade/src/{config,middleware,models} -name "*.js" \
  | xargs md5sum > .file-checksums

# Comparer avec la dernière vérification
diff .file-checksums .file-checksums.old > .file-changes
```

### 3. Database Audit Script
```bash
#!/bin/bash
# monitoring/db-audit.sh

mysql -u root -p$DB_PASSWORD spofe_v2_1 << EOF
-- Vérifier tables critiques
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES 
WHERE TABLE_SCHEMA='spofe_v2_1' ORDER BY TABLE_ROWS DESC;

-- Vérifier fragmentations
SELECT TABLE_NAME, DATA_FREE FROM information_schema.TABLES 
WHERE TABLE_SCHEMA='spofe_v2_1' AND DATA_FREE > 1000000;

-- Vérifier dernière mise à jour
SELECT TABLE_NAME, UPDATE_TIME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA='spofe_v2_1' ORDER BY UPDATE_TIME DESC LIMIT 10;
EOF
```

---

## 🚨 ALERTES À CONFIGURER

### Par Outil (Prometheus/Grafana)

```yaml
# monitoring/alert_rules.yml (à ajouter)

groups:
  - name: file_integrity
    interval: 1m
    rules:
      - alert: CriticalFileModified
        expr: file_changed{file=~"\.env|\.sequelizerc"} == 1
        for: 1m
        annotations:
          summary: "Critical config file modified: {{ $labels.file }}"

  - alert: DatabaseConnectionFailed
        expr: pg_up == 0
        for: 30s
        annotations:
          summary: "Database connection failed"

  - alert: ErrorRateHigh
        expr: increase(http_requests_total{status=~"5.."}[5m]) > 10
        for: 5m
        annotations:
          summary: "High error rate detected"

  - alert: LogFileSizeHigh
        expr: node_filesystem_files_free{mountpoint="/var/log"} < 1073741824
        for: 10m
        annotations:
          summary: "Log disk space < 1GB"
```

---

## 📋 CHECKLIST DE MISE EN PLACE

- [ ] Configurer Prometheus scraping pour health endpoint
- [ ] Mettre en place alertes Grafana/Slack
- [ ] Créer cronjobs pour scripts monitoring
- [ ] Implémenter file integrity checking
- [ ] Configurer log rotation + archivage
- [ ] Documenter runbooks par alerte
- [ ] Tester alerting en staging
- [ ] Former équipe ops
- [ ] Configurer dashboard Grafana
- [ ] Mettre en place backup automation

---

## 📞 CONTACTS D'ESCALADE

| Niveau | Service | Contact | Delai Réponse |
|--------|---------|---------|---------------|
| 🔴 CRITIQUE | On-call DevOps | Slack #alerts | < 15 min |
| 🟡 IMPORTANT | Team Lead | Email + Slack | < 1 heure |
| 🟢 INFO | Admin système | Ticket Jira | < 4 heures |

---

## 🎯 RÉSUMÉ FINAL

**32 fichiers critiques** à surveiller organisés par:
- ✅ **Impact**: 3 niveaux (Critique, Important, Info)
- ✅ **Fréquence**: 4 cadences (Temps réel, Quotidien, Hourly, Hebdo)
- ✅ **Automatisation**: Scripts + Prometheus + Grafana + Slack
- ✅ **Documentation**: Runbooks + Escalade process

**Prochaine étape**: Implémenter scripts monitoring + configurer alertes Prometheus

---

**Document généré**: 21 janvier 2026  
**Version**: 1.0  
**Status**: ✅ Ready for Implementation
