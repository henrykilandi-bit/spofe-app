# 📚 SPOFE Complete Documentation

## Vue d'ensemble

Cette documentation couvre les 6 nouveaux systèmes intégrés dans le cycle de vie de SPOFEAPP:

1. **Automatisation des Tests** - test-automation.js
2. **Intégration CI/CD** - GitHub Actions workflow
3. **Vérification Pré-Déploiement** - pre-deploy-check.js
4. **Surveillance Continue** - health-monitor.js
5. **Tests de Charge** - load-test.js
6. **Documentation** - Ce guide

---

## 1️⃣ Automatisation des Tests d'Intégration

### Fichier: `scripts/test-automation.js`

**Objectif:** Automatiser l'exécution de tous les tests unitaires, intégration et vérifications.

**Tests exécutés:**
- ESLint (linting)
- Unit tests (Jest)
- Integration tests
- Code coverage
- Database verification (verify-migrations-v5.js)

**Modes de fonctionnement:**

```bash
# Mode standard (tous les tests)
cd cascade
node scripts/test-automation.js

# Mode CI/CD (output minimal)
node scripts/test-automation.js --ci

# Mode watch (re-run automatique)
node scripts/test-automation.js --watch

# Mode debug (output détaillé)
node scripts/test-automation.js --debug
```

**Rapports générés:**
- `logs/tests/test-report-[timestamp].json` - Rapport technique
- `logs/tests/test-report-[timestamp].md` - Rapport lisible

**Critères de succès:**
- Tous les tests passent (0 erreurs)
- Linting OK
- Coverage > 80%
- Database verification OK

**Intégration dans le workflow:**
```bash
# Avant commit
npm run test

# Dans CI/CD
node scripts/test-automation.js --ci
```

---

## 2️⃣ Intégration CI/CD avec GitHub Actions

### Fichier: `.github/workflows/ci-cd.yml`

**Objectif:** Automatiser les tests et déploiements via GitHub Actions.

**Étapes du workflow:**

### Phase 1: Test & Validation
- Setup Node.js (18.x, 20.x)
- Install dependencies
- Run ESLint
- Run unit & integration tests
- Database verification
- Upload test reports

### Phase 2: Pre-Deployment Checks
**Déclenché seulement:** Push vers `main`
- Configuration validation
- Database backup
- Dependency check
- Health checks
- Comment PR avec résultats

### Phase 3: Load Testing
**Déclenché seulement:** Push vers `main`
- Start application
- Run load tests (mode light)
- Upload reports

### Phase 4: Security Scanning
- NPM audit
- SNYK scan (optionnel)

### Phase 5: Notifications
- Slack notification
- Email notification (optionnel)

**Configuration requise:**

```yaml
# Secrets à configurer dans GitHub:
- JWT_SECRET: Votre clé JWT
- SLACK_WEBHOOK_URL: URL du webhook Slack (optionnel)
- SNYK_TOKEN: Token SNYK (optionnel)
```

**Exemple d'utilisation:**

```bash
# Sur feature branch
git push origin feature-branch
# → Déclenche: Test & Validation

# Sur main
git push origin main
# → Déclenche: Test, Pre-Deployment, Load Testing, Security
```

**Voir rapports:**
1. GitHub Actions → Run logs
2. Artifacts: test-reports, deployment-reports, load-test-reports

---

## 3️⃣ Vérification Pré-Déploiement

### Fichier: `scripts/pre-deploy-check.js`

**Objectif:** Valider que l'application est prête pour la production.

**Checklist complète:**
1. ✅ Database Connection
2. ✅ Environment Configuration
3. ✅ Dependencies
4. ✅ Database Backup
5. ✅ Database Migrations
6. ✅ Unit & Integration Tests

**Usage:**

```bash
cd cascade

# Vérification complète (avec sauvegarde)
NODE_ENV=production node scripts/pre-deploy-check.js

# Sans sauvegarde (test rapide)
node scripts/pre-deploy-check.js --skip-backup

# Output détaillé
node scripts/pre-deploy-check.js --verbose
```

**Rapports générés:**
- `logs/deployments/pre-deploy-check-[timestamp].json`
- `logs/deployments/pre-deploy-check-[timestamp].md`

**Résultat final:**

```
Status: ✅ READY / ❌ NOT READY

🚫 Bloqueurs détectés:
  1. Missing JWT_SECRET
  2. Database connection failed
  
Recommandation:
  - Fix blockers before deployment
```

**Exit codes:**
- `0` = OK, prêt à déployer
- `1` = Erreurs détectées, bloquer le déploiement

**Intégration dans le déploiement:**

```bash
# Avant production deploy
NODE_ENV=production node scripts/pre-deploy-check.js || exit 1

# Si OK, procéder au déploiement
kubectl apply -f deployment.yaml
```

---

## 4️⃣ Surveillance Continue

### Fichier: `scripts/health-monitor.js`

**Objectif:** Surveiller la santé de l'application et DB en continu.

**Contrôles effectués:**
1. Database connection & response time
2. Table statistics (row counts)
3. System resources (memory, CPU)
4. API health (endpoints disponibles)
5. Performance metrics

**Usage:**

```bash
cd cascade

# Une vérification unique
node scripts/health-monitor.js

# Mode continu (vérification toutes les 5min)
node scripts/health-monitor.js --continuous

# Output détaillé
node scripts/health-monitor.js --verbose

# Continu + verbose
node scripts/health-monitor.js --continuous --verbose
```

**Alertes générées:**
- `SLOW_QUERY` - Requête > 1000ms
- `DB_CONNECTION_ERROR` - Connexion échouée
- `LARGE_TABLE` - Table > 1M rows
- `HIGH_MEMORY_USAGE` - Mémoire > 85%

**Logs et alertes:**
- `logs/health/health-check-[timestamp].json` - Rapport
- `logs/health/health-[date].log` - Log quotidien
- `logs/health/alerts-[date].log` - Alertes uniquement

**Setup surveillance continue:**

```bash
# Via PM2
pm2 start scripts/health-monitor.js --name "spofe-health" -- --continuous

# Via cron (toutes les 5min)
*/5 * * * * cd /path/to/cascade && node scripts/health-monitor.js >> /var/log/spofe-health.log 2>&1

# Via systemd service
[Service]
ExecStart=/usr/bin/node /path/to/cascade/scripts/health-monitor.js --continuous
Restart=always
```

**Intégration Slack:**
```javascript
// Dans health-monitor.js, décommenter:
async notifySlack(alert) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  // POST alert to Slack
}
```

---

## 5️⃣ Tests de Charge

### Fichier: `scripts/load-test.js`

**Objectif:** Valider les performances sous charge.

**Endpoints testés:**
1. POST /api/auth/login
2. POST /api/journalentries
3. GET /api/balancesheet
4. GET /api/companies

**Modes de test:**

```bash
cd cascade

# Test standard (30s, 50 RPS, 20 connections)
node scripts/load-test.js

# Test léger (10s, 10 RPS, 5 connections)
node scripts/load-test.js --light

# Test stress (60s, 100 RPS, 50 connections)
node scripts/load-test.js --stress

# Test spécifique (endpoint)
node scripts/load-test.js --endpoint login
```

**Configuration des tests:**

| Mode | Duration | RPS | Connections |
|------|----------|-----|-------------|
| Light | 10s | 10 | 5 |
| Standard | 30s | 50 | 20 |
| Stress | 60s | 100 | 50 |

**Critères d'acceptation:**

| Endpoint | P95 | P99 | Error Rate |
|----------|-----|-----|-----------|
| Login | 1000ms | 2000ms | < 5% |
| Journal Entry | 1500ms | 3000ms | < 5% |
| Balance Sheet | 2000ms | 4000ms | < 5% |
| Companies | 500ms | 1000ms | < 5% |

**Rapports:**
- `logs/load-tests/load-test-[timestamp].json`
- `logs/load-tests/load-test-[timestamp].md`

**Résultat:**
```
✅ ACCEPTED - All endpoints pass acceptance criteria
  Login: P95=850ms (target: 1000ms) ✅
  Companies: P95=450ms (target: 500ms) ✅
  Balance Sheet: P95=1800ms (target: 2000ms) ✅
  Journal Entry: P95=1350ms (target: 1500ms) ✅
```

**Avant production:**
```bash
node scripts/load-test.js --stress
# Si résultat: ❌ REJECTED
# → Optimiser les endpoints lents avant déploiement
```

---

## 6️⃣ Checklist de Déploiement

### Avant Déploiement

- [ ] Tous les tests passent: `npm run test`
- [ ] ESLint OK: `npm run lint`
- [ ] Pre-deploy check OK: `node scripts/pre-deploy-check.js`
- [ ] Load tests OK: `node scripts/load-test.js`
- [ ] Database backup créée: `node scripts/backup-db.js`
- [ ] Code review effectué
- [ ] Changelog mis à jour
- [ ] Tags git créés

### Déploiement

```bash
# 1. Vérifications finales
NODE_ENV=production node scripts/pre-deploy-check.js

# 2. Sauvegarde
node scripts/backup-db.js

# 3. Migrations
npm run migrate:up

# 4. Déploiement
kubectl apply -f k8s/deployment.yaml

# 5. Smoke tests
node scripts/verify-migrations-v5.js --ci

# 6. Monitoring
node scripts/health-monitor.js
```

### Après Déploiement

- [ ] Health check: `curl http://api.example.com/api/health`
- [ ] Database accessible
- [ ] Logs clean (pas d'erreurs)
- [ ] Load test rapide: `node scripts/load-test.js --light`
- [ ] Users can login
- [ ] Core features working

---

## Scripts Résumé

| Script | Usage | Mode |
|--------|-------|------|
| test-automation.js | Automatiser tous les tests | CI/CD, Dev |
| pre-deploy-check.js | Vérifier avant déploiement | Deployment |
| health-monitor.js | Surveillance continue | Ops, Monitoring |
| load-test.js | Tests de charge | Pre-deploy, Perf |
| verify-migrations-v5.js | Vérifier DB | Démarrage, CI |
| backup-db.js | Sauvegarde | Deployment |

---

## Configuration Recommandée

### Pour Development

```bash
# Terminal 1: Application
npm run dev

# Terminal 2: Health monitoring
node scripts/health-monitor.js --continuous --verbose

# Terminal 3: Tests
npm run test:watch
```

### Pour CI/CD

```yaml
# En push
- npm ci
- npm run lint
- npm run test
- node scripts/verify-migrations-v5.js --ci

# Si OK: Deploy
```

### Pour Production

```bash
# Avant déploiement
NODE_ENV=production node scripts/pre-deploy-check.js

# Déployer si OK

# Après déploiement
node scripts/health-monitor.js --continuous
```

---

## Support & Maintenance

**Questions?** Voir les guides spécifiques:
- [VERIFICATION_GUIDE.md](../VERIFICATION_GUIDE.md)
- [DEPLOYMENT_COMPLETE.md](../DEPLOYMENT_COMPLETE.md)

**Logs:**
- Tests: `logs/tests/`
- Deployments: `logs/deployments/`
- Health: `logs/health/`
- Load tests: `logs/load-tests/`

**Contact:** SPOFE Dev Team

---

**Version:** 1.0  
**Last Updated:** 17 janvier 2026  
**Status:** Production Ready ✅
