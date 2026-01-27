# 🚀 RUNBOOK DE DÉPLOIEMENT – SPOFE APP

**Version** : 2.0 (Enhanced)  
**Dernière mise à jour** : 18 janvier 2026  
**Environnement cible** : Production (Linux)  
**Pré-requis** : PR "Release Readiness" validée et mergée  
**Responsable du déploiement** : ___________________

**Guides complémentaires** :
- [GUIDE_ADMINISTRATEUR.md](../GUIDE_ADMINISTRATEUR.md) - Opérations quotidiennes
- [GUIDE_PREPARATION_PRODUCTION.md](../GUIDE_PREPARATION_PRODUCTION.md) - Configuration production
- [TOUTES_SOLUTIONS_IMPLEMENTEES.md](../TOUTES_SOLUTIONS_IMPLEMENTEES.md) - Détails techniques

---

## 📑 Table des matières

1. [Phase 1 - Avant déploiement](#phase-1--avant-déploiement)
2. [Phase 1.5 - Validation des 7 solutions](#phase-15--validation-des-7-solutions-implementées)
3. [Phase 1.6 - Tests automatisés](#phase-16--tests-automatisés-obligatoires)
4. [Phase 2 - Pendant déploiement](#phase-2--pendant-le-déploiement)
5. [Phase 2.5 - Monitoring avancé](#phase-25--activation-monitoring-avancé)
6. [Phase 3 - Après déploiement](#phase-3--après-déploiement)
7. [Phase 3.5 - Validation sécurité](#phase-35--validation-sécurité-post-déploiement)
8. [Plan de rollback](#plan-de-rollback)
9. [Déploiement Blue-Green](#déploiement-blue-green-optionnel)
10. [Troubleshooting](#troubleshooting-déploiement)
11. [Performance baseline](#performance-baseline)
12. [Post-mortem](#post-mortem-template)

---

## 🟢 PHASE 1 — AVANT DÉPLOIEMENT (PRE-RELEASE)

> 🎯 Objectif : s’assurer que **tout est prêt** avant de toucher à la prod.

---

### 1.1 Validation code & PR
- [ ] PR “Release Readiness” **mergée**
- [ ] Tous les items critiques cochés
- [ ] CI GitHub Actions **verte**
- [ ] Aucun warning bloquant ignoré

---

### 1.1.1 Pré-requis système (Production Linux)
- [ ] Accès SSH fonctionnel (clé/compte de déploiement)
- [ ] Node.js version conforme au projet
- [ ] PM2 installé sur le serveur
- [ ] PM2 configuré pour démarrage automatique (recommandé)
  ```bash
  pm2 startup
  pm2 save
  ```
- [ ] Droits d'écriture sur le dossier de déploiement (logs, backups)

---

### 1.2 Tag & versioning
- [ ] Numéro de version décidé (`v1.0.x`)
- [ ] Tag Git créé :
  ```bash
  git tag v1.0.x
  git push origin v1.0.x
  ```
- [ ] Changelog mis à jour (si applicable)

---

### 1.3 Sauvegardes AVANT release (OBLIGATOIRE)
- [ ] Backup MySQL **manuel déclenché**
- [ ] Fichier `.sql` ou `.sql.gz` présent
- [ ] Vérification rapide :
  ```bash
  gunzip -t backup_xxx.sql.gz
  ```
- [ ] Backup copié hors serveur (cloud / NAS / autre)

📌 **Commande recommandée (backup manuel via mysqldump)**
- [ ] Variables disponibles sur le serveur (exemples) :
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `MYSQLDUMP_PATH` (ex: `/usr/bin/mysqldump`)
- [ ] Exécuter (produit un `.sql.gz`) :
  ```bash
  TS=$(date +%Y-%m-%d_%H-%M-%S)
  "${MYSQLDUMP_PATH:-mysqldump}" -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
    --single-transaction --quick --lock-tables=false --routines --triggers --events "${DB_NAME}" \
    | gzip -9 > "backup_${DB_NAME}_${TS}.sql.gz"
  ```
- [ ] Vérifier l'intégrité du gzip :
  ```bash
  gunzip -t "backup_${DB_NAME}_${TS}.sql.gz"
  ```

📌 **Si backup KO → STOP RELEASE**

---

### 1.4 Environnement production
- [ ] Serveur accessible (SSH)
- [ ] Espace disque suffisant
- [ ] Date / heure serveur correctes
- [ ] Variables d’environnement présentes :
  - `DB_*`
  - `JWT_SECRET`
  - `MYSQLDUMP_PATH`
  - `MYSQL_PATH`
  - `CORS_ORIGIN`
- [ ] Secrets stockés hors du repo

📌 **Note Frontend (Vite)**
- `VITE_API_URL` est injectée **au moment du build** (pas au runtime).
- Vérifier que le build de production utilise la bonne URL API.

---

### 1.5 Communication
- [ ] Fenêtre de déploiement validée
- [ ] Parties prenantes informées
- [ ] Message “maintenance courte” prêt (si nécessaire)

---
## 🔵 PHASE 1.5 — VALIDATION DES 7 SOLUTIONS IMPLÉMENTÉES

> 🎯 Objectif : valider que **toutes les solutions PROPOSED_CHANGES** sont opérationnelles.

### 1.5.1 Exécuter script de validation complet

```bash
cd cascade
node test-all-solutions.js
```

**Résultats attendus** :
- [ ] ✅ Solution #1 SECRETS : 5/5 tests (JWT_SECRET 86 car)
- [ ] ✅ Solution #2 VITEST : 5/5 tests (vitest.config.js, tests/)
- [ ] ✅ Solution #3 CONCURRENTLY : 2/3 tests (PM2 supprimé = OK)
- [ ] ✅ Solution #4 DB-RETRY : 5/6 tests (connectWithRetry, backoff)
- [ ] ✅ Solution #5 HEALTHCHECK : 7/7 tests (GET /health, métriques)
- [ ] ✅ Solution #6 LOGGER-ENHANCED : 7/7 tests (sanitize, rotation)
- [ ] ✅ Solution #7 CORS-DYNAMIQUE : 9/9 tests (whitelist, cache 24h)
- [ ] ✅ BONUS Backup/Restore : 7/7 tests (mysqldump détection)

**Taux de succès minimum** : **95%** (47/49 tests)

📌 **Si < 95% → INVESTIGUER AVANT DÉPLOIEMENT**

---

### 1.5.2 Validation manuelle des solutions critiques

#### Solution #1 - SECRETS
```bash
cd cascade
grep "JWT_SECRET=" .env | wc -c
# Doit retourner 97+ (JWT_SECRET= + 86 caractères)
```

- [ ] JWT_SECRET >= 86 caractères
- [ ] JWT_REFRESH_SECRET >= 86 caractères
- [ ] Secrets différents l'un de l'autre
- [ ] Secrets stockés dans Vault/AWS Secrets Manager (production)

#### Solution #4 - DB-RETRY
```bash
cd cascade
node test-db-retry.js
```

- [ ] Connexion établie avec retry
- [ ] Backoff exponentiel fonctionne
- [ ] Tentatives max = 5
- [ ] Pool connexions configuré (min:2, max:10)

#### Solution #5 - HEALTHCHECK
```bash
curl -f http://localhost:3001/health || echo "FAILED"
```

- [ ] Status 200
- [ ] Réponse JSON valide
- [ ] Champs : status, timestamp, uptime, database, memory, cpu
- [ ] database.status = "connected"

#### Solution #6 - LOGGER-ENHANCED
```bash
cd cascade
node test-logger-sanitization.js
grep "password" logs/app-*.log | grep -v "REDACTED"
```

- [ ] Aucun secret en clair dans logs
- [ ] Rotation quotidienne activée
- [ ] Compression archives (.gz)
- [ ] Rétention : app 14j, error 30j, security 90j

#### Solution #7 - CORS-DYNAMIQUE
```powershell
powershell -ExecutionPolicy Bypass -File cascade\test-cors-simple.ps1
```

- [ ] Origin autorisée : Status 200 + headers CORS
- [ ] Origin bloquée : Status 500 + log WARN
- [ ] Cache preflight : maxAge = 86400 (24h)
- [ ] Credentials : true

---

## 🧪 PHASE 1.6 — TESTS AUTOMATISÉS (OBLIGATOIRES)

> 🎯 Objectif : s'assurer que **aucun bug critique** n'est déployé.

### 1.6.1 Tests unitaires backend

```bash
cd cascade
npm test
```

**Critères** :
- [ ] **100% des tests passent** (19/19 minimum)
- [ ] Couverture : Controllers >= 80%
- [ ] Couverture : Services >= 70%
- [ ] Aucun test `skip` ou `todo`

📌 **Si tests échouent → STOP RELEASE**

---

### 1.6.2 Tests d'intégration CORS

```bash
# Backend démarré requis
cd cascade
npm run dev &

# Attendre démarrage (5s)
sleep 5

# Ouvrir page de tests dans navigateur
# http://localhost:5173/test-integration-cors.html
```

**Tests à valider manuellement** :
- [ ] Test 1 : Health endpoint (GET /health) → ✅ 200
- [ ] Test 2 : Authentication (POST /api/auth/login) → ✅ 401 (sans creds)
- [ ] Test 3 : Preflight OPTIONS → ✅ Headers CORS
- [ ] Test 4 : Credentials (cookies) → ✅ withCredentials: true
- [ ] Test 5 : All solutions → ✅ Intégration complète

---

### 1.6.3 Tests de charge (optionnel mais recommandé)

```bash
# Installer Apache Bench (si pas déjà présent)
sudo apt-get install apache2-utils

# Test charge modérée : 100 requêtes, 10 concurrentes
ab -n 100 -c 10 -H "Accept: application/json" http://localhost:3001/health
```

**Métriques attendues** :
- [ ] Time per request : < 50ms (moyenne)
- [ ] Failed requests : 0
- [ ] Transfer rate : > 100 KB/s
- [ ] Connexions DB max : < 20

---

### 1.6.4 Audit sécurité

```bash
cd cascade
npm audit --production
```

- [ ] **0 vulnérabilités critiques**
- [ ] **0 vulnérabilités hautes**
- [ ] Vulnérabilités moyennes documentées

```bash
# Scan secrets accidentellement committés
npm install -g trufflehog
trufflehog filesystem . --json > security-scan.json
```

- [ ] Aucun secret détecté dans le code

---
## 🟡 PHASE 2 — PENDANT LE DÉPLOIEMENT (RELEASE)

> 🎯 Objectif : déployer **sans perte de service ni de données**.

---

### 2.1 Mise en maintenance (si nécessaire)
- [ ] Frontend mis en maintenance **ou**
- [ ] Communication “déploiement en cours” envoyée

---

### 2.2 Récupération du code
```bash
git fetch --tags
git checkout v1.0.x
```

- [ ] Tag correct vérifié (`git describe --tags`)
- [ ] Code conforme à la PR validée

---

### 2.3 Dépendances
```bash
npm install --production
```

- [ ] Pas d’erreur bloquante
- [ ] Version Node conforme

---

### 2.4 Base de données
- [ ] Migrations à appliquer (si oui) :
  ```bash
  npm run db:migrate
  ```
- [ ] Aucune erreur SQL
- [ ] Aucune migration destructive non validée

📌 **Si migration KO → ROLLBACK**

---

### 2.5 Démarrage backend
```bash
pm2 reload ecosystem.config.js --env production
```

- [ ] Process PM2 `online`
- [ ] Aucun crash immédiat
- [ ] Logs propres (`pm2 logs`)

---

### 2.6 Démarrage frontend
- [ ] Build frontend terminé (avec la bonne URL d'API)
  ```bash
  cd frontend
  VITE_API_URL="https://api.votredomaine.com/api" npm run build
  ```
- [ ] Assets servis correctement (ex: Nginx/Apache/CDN)
- [ ] Aucun `404` critique
- [ ] Cache navigateur/CDN invalidé si nécessaire

---

### 2.7 Vérifications immédiates
- [ ] `GET /health` → `200 OK`
  ```bash
  curl -f http://localhost:3001/health
  ```
- [ ] Login admin OK
- [ ] Endpoint critique OK
- [ ] Aucun pic d’erreurs dans les logs

📌 **Si erreur critique → ROLLBACK**

---
## 📊 PHASE 2.5 — ACTIVATION MONITORING AVANCÉ

> 🎯 Objectif : surveiller la **santé applicative en temps réel**.

### 2.5.1 Vérification endpoints monitoring

```bash
# Health check détaillé
curl -s http://localhost:3001/health | jq '.'
```

**JSON attendu** :
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T...",
  "uptime": "123.45s",
  "database": {
    "status": "connected",
    "responseTime": "<10ms"
  },
  "memory": {
    "used": 45.2,
    "total": 8192,
    "free": 3421.5
  },
  "cpu": {
    "loadAverage": [0.5, 0.4, 0.3]
  }
}
```

- [ ] status = "ok"
- [ ] database.responseTime < 50ms
- [ ] memory.used < 70% du total
- [ ] cpu.loadAverage[0] < 2.0

---

### 2.5.2 Configuration Uptime Robot

**Accès** : https://uptimerobot.com/dashboard

```bash
# Créer monitor via API (optionnel)
curl -X POST "https://api.uptimerobot.com/v2/newMonitor" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=YOUR_API_KEY" \
  -d "friendly_name=SPOFE Production Health" \
  -d "url=https://api.spofe.com/health" \
  -d "type=1" \
  -d "interval=300" \
  -d "keyword=ok"
```

**Configuration manuelle** :
- [ ] Monitor créé : "SPOFE Production Health"
- [ ] URL : https://api.spofe.com/health
- [ ] Type : HTTP(s)
- [ ] Intervalle : 5 minutes
- [ ] Keyword : "ok"
- [ ] Alertes : Email + SMS (incidents)

---

### 2.5.3 Configuration Prometheus + Grafana

#### Prometheus scraping

**Fichier** : `/etc/prometheus/prometheus.yml`

```yaml
scrape_configs:
  - job_name: 'spofe-production'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

```bash
# Recharger configuration
sudo systemctl reload prometheus

# Vérifier scraping
curl http://localhost:9090/api/v1/targets
```

- [ ] Target "spofe-production" : State UP

#### Grafana dashboards

**Accès** : https://grafana.spofe.com

**Dashboards à créer** :

1. **Dashboard Performance** :
   - Panel : Temps réponse moyen (http_request_duration_seconds)
   - Panel : Requêtes par seconde (http_requests_total)
   - Panel : Taux d'erreur (http_requests_total{status=~"5.."})
   - Panel : Connexions DB actives

2. **Dashboard Santé** :
   - Panel : CPU Load (cpu_loadaverage)
   - Panel : Memory Used % (memory_used / memory_total * 100)
   - Panel : Disk Free % (df -h)
   - Panel : Health check status (up/down)

3. **Dashboard Logs** :
   - Panel : Erreurs par heure (logs ERROR)
   - Panel : Top 10 endpoints appelés
   - Panel : Origines CORS bloquées

**Import dashboard existant** :
```bash
# Copier dashboard JSON vers Grafana
curl -X POST https://grafana.spofe.com/api/dashboards/db \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana-dashboard-spofe.json
```

- [ ] Dashboard Performance créé et fonctionnel
- [ ] Dashboard Santé créé et fonctionnel
- [ ] Alertes configurées (CPU > 80%, RAM > 90%, Disk < 10%)

---

### 2.5.4 Configuration Alertmanager

**Fichier** : `/etc/alertmanager/alertmanager.yml`

```yaml
route:
  receiver: 'email-devops'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10m
  repeat_interval: 12h

receivers:
  - name: 'email-devops'
    email_configs:
      - to: 'devops@spofe.com'
        from: 'alertmanager@spofe.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@spofe.com'
        auth_password: 'YOUR_PASSWORD'
```

**Règles d'alerte** : `/etc/prometheus/rules.yml`

```yaml
groups:
  - name: spofe-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreur élevé (> 5%)"

      - alert: DatabaseDown
        expr: up{job="spofe-production"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Base de données inaccessible"

      - alert: HighMemoryUsage
        expr: (memory_used / memory_total) > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Mémoire > 90%"
```

```bash
# Valider règles
promtool check rules /etc/prometheus/rules.yml

# Recharger Prometheus
sudo systemctl reload prometheus
```

- [ ] Alertes configurées et validées
- [ ] Test alerte (déclencher volontairement)
- [ ] Email reçu dans les 2 minutes

---
## 🔴 PLAN DE ROLLBACK (SI PROBLÈME)

> ⚠️ À utiliser **sans hésitation**.

---

### R1. Arrêt application
```bash
pm2 stop ecosystem.config.js
```

---

### R2. Restauration base de données (si nécessaire)
```bash
# Si la sauvegarde est compressée
gunzip -c backup_pre_release.sql.gz | "${MYSQL_PATH:-mysql}" -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"

# Si la sauvegarde est en .sql
"${MYSQL_PATH:-mysql}" -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < backup_pre_release.sql
```

⚠️ Restore **uniquement sur validation explicite** du responsable technique.

---

### R3. Retour version précédente
```bash
git checkout v1.0.(x-1)
npm install --production
pm2 reload ecosystem.config.js
```

---

### R4. Vérifications post-rollback
- [ ] Application accessible
- [ ] Base de données cohérente
- [ ] Incident communiqué

---

## 🟢 PHASE 3 — APRÈS DÉPLOIEMENT (POST-RELEASE)

> 🎯 Objectif : confirmer que la release est **stable dans le temps**.

---

### 3.1 Smoke tests (J+0)
- [ ] Login admin
- [ ] Création / lecture d’entités clés
- [ ] Pages critiques accessibles
- [ ] Backups automatiques actifs

---

### 3.2 Monitoring (J+1)
- [ ] CPU / RAM stables
- [ ] Logs d’erreurs vérifiés
- [ ] Aucun crash PM2
- [ ] Healthcheck toujours OK

---

### 3.3 Backups post-release
- [ ] Backup automatique exécuté
- [ ] Fichier présent
- [ ] Taille cohérente

---

### 3.4 Documentation & communication
- [ ] Version annoncée
- [ ] Changelog publié
- [ ] Ticket release fermé

---

## � PHASE 3.5 — VALIDATION SÉCURITÉ POST-DÉPLOIEMENT

> 🎯 Objectif : confirmer que la **sécurité est renforcée** en production.

### 3.5.1 Vérification secrets JWT

```bash
# Vérifier longueur secrets (sans afficher valeur)
cd cascade
grep "JWT_SECRET=" .env | wc -c
# Doit retourner 97+ caractères (JWT_SECRET= + 86 caractères)

grep "JWT_REFRESH_SECRET=" .env | wc -c
# Doit retourner 106+ caractères
```

- [ ] JWT_SECRET >= 86 caractères
- [ ] JWT_REFRESH_SECRET >= 86 caractères
- [ ] Secrets différents (vérifier hash)
- [ ] Secrets stockés dans Vault (pas en fichier .env)

**Test génération token** :
```bash
curl -X POST https://api.spofe.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spofe.local","password":"CORRECT_PASSWORD"}'
```

- [ ] Token reçu (champ "token")
- [ ] Expiration = 15 minutes
- [ ] Refresh token reçu
- [ ] Refresh expiration = 7 jours

---

### 3.5.2 Vérification CORS en production

```bash
# Test 1: Origin autorisée
curl -H "Origin: https://spofe.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://api.spofe.com/api/auth/login -I
```

**Headers attendus** :
```
Access-Control-Allow-Origin: https://spofe.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

- [ ] Access-Control-Allow-Origin présent
- [ ] Access-Control-Allow-Credentials: true
- [ ] Access-Control-Max-Age: 86400 (24h cache)

```bash
# Test 2: Origin NON autorisée
curl -H "Origin: https://malicious-site.com" \
  -X GET https://api.spofe.com/health -I
```

- [ ] Status 500 ou pas de header CORS
- [ ] Log backend : "CORS: Origin bloquée" visible

**Vérifier whitelist production** :
```bash
grep "CORS_WHITELIST=" cascade/.env
# Doit contenir UNIQUEMENT les domaines HTTPS production
# Ex: CORS_WHITELIST=https://spofe.com,https://www.spofe.com,https://app.spofe.com
```

- [ ] Aucune origin HTTP (sauf localhost en dev)
- [ ] Aucune origin de développement (* interdit)

---

### 3.5.3 Vérification Rate Limiting

```bash
# Déclencher rate limit volontairement (100 requêtes rapides)
for i in {1..105}; do
  curl -X POST https://api.spofe.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}' \
    -o /dev/null -s -w "Request $i: %{http_code}\n"
done
```

**Résultats attendus** :
- [ ] Requêtes 1-100 : Status 401 (unauthorized, normal)
- [ ] Requêtes 101+ : Status 429 (too many requests)
- [ ] Message : "Too many requests, please try again later"

**Vérifier configuration** :
```bash
cd cascade
grep "RATE_LIMIT" .env
```

- [ ] RATE_LIMIT_WINDOW_MS = 900000 (15 min)
- [ ] RATE_LIMIT_MAX = 100

---

### 3.5.4 Vérification sanitization logs

```bash
# Rechercher secrets dans logs (ne doit rien trouver)
cd cascade
grep -i "password" logs/app-*.log | grep -v "REDACTED"
grep -i "token" logs/app-*.log | grep -v "REDACTED"
grep -i "secret" logs/app-*.log | grep -v "REDACTED"
grep -i "authorization" logs/app-*.log | grep -v "REDACTED"
```

- [ ] **Aucun résultat** (tous les secrets masqués par ***REDACTED***)

**Si secrets trouvés** :
1. Identifier source (controller, middleware)
2. Corriger code pour sanitizer
3. Purger logs compromis
4. Notifier équipe sécurité

---

### 3.5.5 Audit SSL/TLS (production uniquement)

```bash
# Tester configuration SSL
sslscan https://api.spofe.com

# Ou via testssl.sh
./testssl.sh https://api.spofe.com
```

**Critères** :
- [ ] TLS 1.2 minimum (TLS 1.0/1.1 désactivés)
- [ ] Certificat valide (Let's Encrypt ou commercial)
- [ ] HSTS activé (Strict-Transport-Security header)
- [ ] Grade A ou A+ sur SSL Labs

**Vérifier headers sécurité** :
```bash
curl -I https://api.spofe.com/health
```

**Headers attendus** :
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

- [ ] Tous les headers sécurité présents

---

### 3.5.6 Test blacklist tokens

```bash
# 1. Login et récupérer token
TOKEN=$(curl -X POST https://api.spofe.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spofe.local","password":"PASSWORD"}' \
  | jq -r '.token')

# 2. Utiliser token (doit fonctionner)
curl -H "Authorization: Bearer $TOKEN" https://api.spofe.com/api/users
# Status 200 attendu

# 3. Logout (ajoute token à blacklist)
curl -X POST https://api.spofe.com/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# 4. Re-utiliser même token (doit échouer)
curl -H "Authorization: Bearer $TOKEN" https://api.spofe.com/api/users
# Status 401 attendu + message "Token révoqué"
```

- [ ] Token valide après login
- [ ] Token blacklisté après logout
- [ ] Token blacklisté refusé (401)

---

## �🟢 DÉCISION FINALE

| Critère | Statut |
|--------|--------|
| Déploiement | ⬜ OK / ⬜ KO |
| Base de données | ⬜ OK / ⬜ KO |
| Monitoring | ⬜ OK / ⬜ KO |

**Release validée par** : ___________________  
**Date** : ___________________

---

## 📌 RÈGLES D’OR

- ❌ Pas de release sans backup
- ❌ Pas de migration non comprise
- ❌ Pas de restore à chaud sans décision claire
- ❌ Pas de hotfix non documenté

---

---

## 🔵 DÉPLOIEMENT BLUE-GREEN (OPTIONNEL)

> 🎯 Objectif : déployer **sans downtime** avec rollback instantané.

### Principe

```
┌─────────────────────────────────────────────────┐
│         Load Balancer (Nginx/HAProxy)           │
├─────────────────────────────────────────────────┤
│  ┌─────────────────┐      ┌─────────────────┐ │
│  │  BLUE (v1.0.0)  │      │ GREEN (v1.0.1)  │ │
│  │   Port 3001     │      │   Port 3002     │ │
│  │   [ACTIVE]      │  →   │   [STANDBY]     │ │
│  └─────────────────┘      └─────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Étapes** :
1. Environnement BLUE actif (v1.0.0, port 3001)
2. Déployer GREEN (v1.0.1, port 3002)
3. Tester GREEN en interne
4. Basculer Load Balancer : BLUE → GREEN
5. Monitorer GREEN pendant 1h
6. Si OK : Désactiver BLUE
7. Si KO : Rollback instantané vers BLUE

---

### Configuration Nginx Blue-Green

**Fichier** : `/etc/nginx/sites-available/spofe`

```nginx
upstream backend {
    # BLUE (actif)
    server localhost:3001 max_fails=3 fail_timeout=30s;
    
    # GREEN (standby - commenté)
    # server localhost:3002 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name api.spofe.com;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Health check
        proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
    }
}
```

---

### Procédure Blue-Green

#### Étape 1 : Déployer GREEN (v1.0.1) sur port 3002

```bash
# Copier code dans dossier séparé
cp -r /var/www/spofe /var/www/spofe-green
cd /var/www/spofe-green/cascade

# Modifier .env pour port 3002
sed -i 's/PORT=3001/PORT=3002/' .env

# Déployer comme Phase 2 normale
git fetch --tags
git checkout v1.0.1
npm install --production
npm run db:migrate  # Attention : migrations partagées

# Démarrer GREEN avec PM2
pm2 start ecosystem.config.js --name spofe-green --env production
```

- [ ] GREEN démarré sur port 3002
- [ ] PM2 status : "online"
- [ ] Health check GREEN : `curl http://localhost:3002/health`

---

#### Étape 2 : Tests GREEN en interne

```bash
# Tester tous les endpoints critiques sur port 3002
curl http://localhost:3002/health
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spofe.local","password":"PASSWORD"}'

# Tests de charge
ab -n 100 -c 10 http://localhost:3002/health
```

- [ ] Tous les tests passent
- [ ] Performance identique ou meilleure
- [ ] Aucune erreur dans logs GREEN

---

#### Étape 3 : Basculer Load Balancer (BLUE → GREEN)

```bash
# Modifier Nginx config
sudo nano /etc/nginx/sites-available/spofe
```

**Commenter BLUE, activer GREEN** :
```nginx
upstream backend {
    # BLUE (désactivé)
    # server localhost:3001 max_fails=3 fail_timeout=30s;
    
    # GREEN (actif)
    server localhost:3002 max_fails=3 fail_timeout=30s;
}
```

```bash
# Tester config
sudo nginx -t

# Recharger Nginx (0 downtime)
sudo nginx -s reload
```

- [ ] Nginx rechargé sans erreur
- [ ] GREEN reçoit maintenant le trafic
- [ ] BLUE toujours actif (fallback)

---

#### Étape 4 : Monitoring intensif GREEN (1h)

```bash
# Surveiller logs GREEN
pm2 logs spofe-green

# Surveiller métriques
watch -n 5 'curl -s http://localhost:3002/health | jq "."

# Comparer erreurs BLUE vs GREEN
tail -f /var/log/nginx/access.log | grep "3002"
```

**Métriques à surveiller** :
- [ ] Taux d'erreur GREEN <= BLUE
- [ ] Temps réponse GREEN <= BLUE
- [ ] Aucune alerte Grafana
- [ ] Aucune plainte utilisateurs

---

#### Étape 5a : Si GREEN stable → Arrêter BLUE

```bash
# Après 1h sans incident
pm2 stop spofe-blue
pm2 delete spofe-blue

# Renommer GREEN → BLUE pour prochaine release
pm2 stop spofe-green
pm2 start ecosystem.config.js --name spofe-blue --env production

# Modifier Nginx pour port 3001
sed -i 's/PORT=3002/PORT=3001/' /var/www/spofe/cascade/.env
pm2 restart spofe-blue
```

- [ ] BLUE arrêté
- [ ] GREEN devient nouvelle baseline

---

#### Étape 5b : Si GREEN problématique → Rollback instant

```bash
# Modifier Nginx : GREEN → BLUE
sudo nano /etc/nginx/sites-available/spofe
```

**Réactiver BLUE** :
```nginx
upstream backend {
    # BLUE (réactivé)
    server localhost:3001 max_fails=3 fail_timeout=30s;
    
    # GREEN (désactivé)
    # server localhost:3002 max_fails=3 fail_timeout=30s;
}
```

```bash
# Recharger Nginx
sudo nginx -s reload

# Arrêter GREEN
pm2 stop spofe-green
```

**Durée rollback** : < 10 secondes ⚡

---

## 🔍 TROUBLESHOOTING DÉPLOIEMENT

> 🎯 Objectif : résoudre les **problèmes courants** rapidement.

### Problème 1 : Migrations échouent

**Symptôme** :
```
ERROR: Executing (default): ALTER TABLE `users` ADD COLUMN `new_field`...
ER_DUP_FIELDNAME: Duplicate column name 'new_field'
```

**Causes** :
1. Migration déjà appliquée partiellement
2. Rollback précédent incomplet
3. Migration écrite incorrectement

**Solutions** :
```bash
# Vérifier état migrations
npx sequelize-cli db:migrate:status

# Si migration "up" mais table non modifiée
mysql -u root -p spofeapp_prod -e "DESCRIBE users;"

# Rollback dernière migration
npx sequelize-cli db:migrate:undo

# Réappliquer
npx sequelize-cli db:migrate

# Si toujours KO : Éditer migration, corriger, réessayer
```

---

### Problème 2 : PM2 crash loop

**Symptôme** :
```bash
pm2 status
# spofe-backend | errored | restart: 15
```

**Diagnostic** :
```bash
# Logs d'erreur
pm2 logs spofe-backend --err --lines 100

# Causes fréquentes :
# - Port déjà utilisé
# - Connexion DB échoue
# - Secret manquant
# - Syntaxe JS erreur
```

**Solutions** :
```bash
# Tester démarrage manuel (voir erreur exacte)
cd /var/www/spofe/cascade
NODE_ENV=production node src/server.js

# Si port occupé
lsof -ti:3001 | xargs kill -9

# Si connexion DB
mysql -u spofe_prod_user -p spofeapp_prod -e "SELECT 1;"

# Si secret manquant
grep JWT_SECRET .env

# Redémarrer proprement
pm2 delete spofe-backend
pm2 start ecosystem.config.js --env production
```

---

### Problème 3 : Frontend 404 après build

**Symptôme** :
- https://spofe.com → OK
- https://spofe.com/dashboard → 404

**Cause** : Nginx ne gère pas React Router (SPA)

**Solution** :
```nginx
# /etc/nginx/sites-available/spofe
location / {
    root /var/www/spofe/frontend/dist;
    try_files $uri $uri/ /index.html;  # ← Ajouter cette ligne
}
```

```bash
sudo nginx -t
sudo nginx -s reload
```

---

### Problème 4 : CORS bloque tout en production

**Symptôme** :
```
Access to fetch at 'https://api.spofe.com/...' from origin 'https://spofe.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Diagnostic** :
```bash
# Vérifier CORS_WHITELIST
cd /var/www/spofe/cascade
grep CORS_WHITELIST .env

# Doit contenir : https://spofe.com,https://www.spofe.com
```

**Solution** :
```bash
# Modifier .env
CORS_WHITELIST=https://spofe.com,https://www.spofe.com,https://app.spofe.com

# Redémarrer
pm2 restart spofe-backend

# Vérifier logs
pm2 logs spofe-backend | grep "CORS"
```

---

### Problème 5 : Backup échoue "mysqldump not found"

**Symptôme** :
```
Error: Command failed: mysqldump ...
mysqldump: command not found
```

**Solution** :
```bash
# Trouver chemin mysqldump
which mysqldump
# Ex: /usr/bin/mysqldump

# Ajouter dans .env
MYSQLDUMP_PATH=/usr/bin/mysqldump
MYSQL_PATH=/usr/bin/mysql

# Tester
cd cascade
npm run db:backup
```

---

### Problème 6 : Health check 503 après déploiement

**Symptôme** :
```bash
curl http://localhost:3001/health
# {"status":"degraded","database":{"status":"disconnected"}}
```

**Diagnostic** :
```bash
# Vérifier connexion DB
mysql -u spofe_prod_user -p -e "SELECT 1;"

# Vérifier credentials .env
grep DB_ /var/www/spofe/cascade/.env
```

**Solution** :
```bash
# Si credentials KO
vim /var/www/spofe/cascade/.env
# Corriger DB_USER, DB_PASSWORD, DB_NAME

# Si MySQL down
sudo systemctl status mysql
sudo systemctl start mysql

# Redémarrer backend
pm2 restart spofe-backend

# Vérifier retry logic (Solution #4)
cd cascade
node test-db-retry.js
```

---

## 📈 PERFORMANCE BASELINE

> 🎯 Objectif : établir des **métriques de référence** avant/après déploiement.

### Capturer baseline AVANT déploiement

```bash
#!/bin/bash
# Script: capture-baseline.sh

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BASELINE_FILE="baseline_${TIMESTAMP}.json"

echo "📊 Capture baseline - $TIMESTAMP"

# 1. Health check
HEALTH=$(curl -s http://localhost:3001/health)
echo $HEALTH | jq '.'

# 2. Temps réponse endpoints critiques
echo "\n⏱️ Temps réponse endpoints:"
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/health
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/auth/login

# 3. Métriques système
echo "\n💻 Métriques système:"
CPU_LOAD=$(uptime | awk '{print $(NF-2)}' | sed 's/,//')
MEM_USED=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2 }')
DISK_USED=$(df -h / | awk 'NR==2{print $5}')

echo "CPU Load: $CPU_LOAD"
echo "Memory Used: $MEM_USED%"
echo "Disk Used: $DISK_USED"

# 4. Connexions DB
DB_CONNECTIONS=$(mysql -u root -p -e "SHOW PROCESSLIST;" | wc -l)
echo "DB Connections: $DB_CONNECTIONS"

# 5. Sauvegarder JSON
cat > $BASELINE_FILE << EOF
{
  "timestamp": "$TIMESTAMP",
  "version": "v1.0.0",
  "health": $HEALTH,
  "system": {
    "cpu_load": "$CPU_LOAD",
    "memory_used_pct": $MEM_USED,
    "disk_used_pct": "$DISK_USED",
    "db_connections": $DB_CONNECTIONS
  }
}
EOF

echo "\n✅ Baseline sauvegardée: $BASELINE_FILE"
```

**Format curl** : `curl-format.txt`
```
time_namelookup:  %{time_namelookup}s\n
time_connect:  %{time_connect}s\n
time_starttransfer:  %{time_starttransfer}s\n
time_total:  %{time_total}s\n
```

---

### Comparer APRÈS déploiement

```bash
# Capturer nouvelle baseline
./capture-baseline.sh

# Comparer JSON
jq -s '.[0] as $before | .[1] as $after | 
  {
    cpu_load_diff: ($after.system.cpu_load | tonumber) - ($before.system.cpu_load | tonumber),
    memory_diff: $after.system.memory_used_pct - $before.system.memory_used_pct,
    db_connections_diff: $after.system.db_connections - $before.system.db_connections
  }' baseline_before.json baseline_after.json
```

**Critères d'acceptation** :
- [ ] CPU Load : +/- 10% max
- [ ] Memory : +5% max
- [ ] DB Connections : +20% max (pic normal au démarrage)
- [ ] Temps réponse /health : < 50ms
- [ ] Temps réponse /api/* : +10% max

---

## 📝 POST-MORTEM TEMPLATE

> 🎯 Objectif : documenter **incidents et apprentissages**.

### Template à remplir si problème majeur

```markdown
# Post-Mortem - Déploiement v1.0.X

**Date incident** : YYYY-MM-DD HH:MM UTC  
**Durée** : XX minutes  
**Sévérité** : P1 (critique) / P2 (majeur) / P3 (mineur)  
**Responsable** : [Nom]

---

## Résumé exécutif (3 lignes max)

[Décrire en 3 phrases : Quoi, Impact, Résolution]

Exemple :
> Lors du déploiement de v1.0.1, les migrations DB ont échoué causant l'indisponibilité de l'API pendant 15 minutes. 120 utilisateurs impactés. Rollback effectué et déploiement reprogrammé.

---

## Timeline

| Heure | Événement |
|-------|----------|
| 14:00 | Début déploiement v1.0.1 |
| 14:15 | PM2 démarré, application répond 500 |
| 14:18 | Investigation logs → migrations KO |
| 14:20 | Décision rollback |
| 14:25 | Rollback terminé, application fonctionnelle |
| 14:30 | Confirmation santé application |

---

## Impact

- **Utilisateurs affectés** : 120 (trafic normal)
- **Fonctionnalités impactées** : Toute l'API (500 errors)
- **Données perdues** : Aucune
- **Revenus perdus** : Estimé 0€ (app gratuite)
- **Durée downtime** : 15 minutes

---

## Cause racine (Root Cause)

**Problème** : Migration SQL contenait `ADD COLUMN` sur colonne déjà existante.

**Pourquoi #1** : Migration testée en dev mais pas en staging identique à prod.  
**Pourquoi #2** : Base de données staging désynchronisée (migrations manuelles).  
**Pourquoi #3** : Pas de process validation schema avant déploiement.  
**Pourquoi #4** : Checklist déploiement ne contenait pas "Vérifier état DB prod".  
**Pourquoi #5 (root)** : Manque process formalisé pour maintenir parité dev/staging/prod.

---

## Actions correctives

### Immédiates (fait)
- [x] Rollback v1.0.0
- [x] Corriger migration (supprimer duplicate ADD COLUMN)
- [x] Tester migration sur staging synchronisé

### Court terme (< 1 semaine)
- [ ] Créer script `sync-db-schema.sh` (dev → staging)
- [ ] Ajouter step "Validate migrations on staging" dans runbook
- [ ] Documenter état exact schema prod (dump + version tracking)

### Moyen terme (< 1 mois)
- [ ] Mettre en place environnement staging iso-prod (Docker)
- [ ] Automatiser tests migrations dans CI/CD
- [ ] Ajouter alerte PagerDuty si downtime > 5 min

### Long terme (< 3 mois)
- [ ] Implémenter déploiement Blue-Green (0 downtime)
- [ ] Formation équipe sur troubleshooting production

---

## Leçons apprises

✅ **Ce qui a bien fonctionné** :
- Détection rapide du problème (3 min)
- Décision rollback rapide (pas d'hésitation)
- Communication équipe efficace
- Backup pré-déploiement fonctionnel

❌ **Ce qui doit s'améliorer** :
- Validation migrations avant prod insuffisante
- Environnement staging non iso-prod
- Monitoring ne notifie pas assez vite (15 min pour alerte)

---

## Signatures

**Rédigé par** : [Nom] - [Date]  
**Reviewé par** : [CTO/Lead Dev] - [Date]  
**Archivé dans** : `docs/postmortems/2026-01-18-deploy-v1.0.1.md`
```

---

## 🔜 ÉVOLUTIONS POSSIBLES

### Court terme (déjà implémenté)
- ✅ Runbook détaillé avec 7 solutions validées
- ✅ Tests automatisés (test-all-solutions.js)
- ✅ Monitoring avancé (Prometheus, Grafana)
- ✅ Déploiement Blue-Green documenté

### Moyen terme (à implémenter)
- [ ] CI/CD GitHub Actions complet (build + deploy auto)
- [ ] Environnement staging iso-prod (Docker Compose)
- [ ] Tests E2E automatisés (Playwright/Cypress)
- [ ] Canary deployment (5% trafic → 100% progressif)
- [ ] Feature flags (déployer code désactivé)

### Long terme (roadmap)
- [ ] Infrastructure as Code (Terraform/Pulumi)
- [ ] Kubernetes orchestration (haute dispo)
- [ ] Multi-région deployment (disaster recovery)
- [ ] Observability complète (traces distribuées)
- [ ] Chaos engineering (tests résilience)

