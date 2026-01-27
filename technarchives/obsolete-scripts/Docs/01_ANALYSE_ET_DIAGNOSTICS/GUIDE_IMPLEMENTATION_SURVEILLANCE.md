# 🚀 GUIDE D'IMPLÉMENTATION - Surveillance des Fichiers Critiques

**Objectif**: Mettre en place la surveillance automatisée des 32 fichiers critiques  
**Durée**: 30 minutes  
**Complexité**: Moyenne

---

## 📋 TABLE DES MATIÈRES

1. [Mise en place immédiate](#mise-en-place-immédiate)
2. [Automatisation cronjob](#automatisation-cronjob)
3. [Integration Slack/Email](#integration-slackemail)
4. [Dashboard Grafana](#dashboard-grafana)
5. [Runbooks & Escalade](#runbooks--escalade)

---

## 🚀 Mise en Place Immédiate

### Étape 1: Tester le script de surveillance

```bash
# Naviguer au dossier backend
cd cascade

# Exécuter la première surveillance
npm run monitor:critical

# Résultat attendu:
# ✅ 32 vérifications effectuées
# 📝 Rapport généré dans: logs/surveillance.log
```

### Étape 2: Vérifier les résultats

```bash
# Consulter le rapport complet
tail -100 logs/surveillance.log

# Consulter uniquement les alertes
grep "ALERT\|CRITICAL" logs/surveillance.log

# Voir les changements détectés
grep "FILE CHANGED" logs/surveillance.log
```

### Étape 3: Vérifier la configuration .env

```bash
# Valider que toutes les variables critiques sont présentes
npm run monitor:critical 2>&1 | grep -A5 "configuration"

# Variables critiques vérifiées:
# ✅ DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
# ✅ JWT_SECRET, JWT_REFRESH_SECRET
# ✅ PORT, NODE_ENV
# ✅ CORS_ORIGIN
```

---

## ⏰ Automatisation Cronjob

### Option 1: Linux/Mac - Cronjob Unix

```bash
# Éditer crontab
crontab -e

# Ajouter ces lignes:

# 🔍 Surveillance horaire (chaque heure)
0 * * * * cd /chemin/vers/cascade && npm run monitor:critical >> logs/cronjob-surveillance.log 2>&1

# 📊 Rapport quotidien (6h du matin)
0 6 * * * cd /chemin/vers/cascade && npm run monitor:critical && npm run report:monthly >> logs/cronjob-daily.log 2>&1

# 🔄 Synchronisation BD (toutes les 3 heures)
0 */3 * * * cd /chemin/vers/cascade && npm run sync:db >> logs/cronjob-sync-db.log 2>&1

# 🧹 Nettoyage des logs (minuit)
0 0 * * * cd /chemin/vers/cascade && find logs -name "*.log" -mtime +30 -delete

# Vérifier:
crontab -l
```

### Option 2: Windows - Task Scheduler

```powershell
# PowerShell (mode Admin)

# Créer une tâche de surveillance horaire
$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
$action = New-ScheduledTaskAction -Execute "node" -Argument "src/scripts/monitoring-surveillance.js" -WorkingDirectory "C:\chemin\vers\cascade"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest

Register-ScheduledTask -TaskName "SPOFE-Monitor-Critical" `
  -Trigger $trigger `
  -Action $action `
  -Principal $principal `
  -Description "SPOFE v2.1 - Surveillance des fichiers critiques" `
  -Force

# Vérifier:
Get-ScheduledTask -TaskName "SPOFE-Monitor-Critical"
```

### Option 3: PM2 - Ecosystem (Recommandé)

```bash
# Mettre à jour pm2.config.js
cat >> pm2.config.js << 'EOF'

// Ajouter ce module après la config du serveur:
{
  name: 'spofe-monitor',
  script: 'src/scripts/monitoring-surveillance.js',
  cron: '0 * * * *',  // Chaque heure
  max_memory_restart: '500M',
  error_file: 'logs/monitor-error.log',
  out_file: 'logs/monitor-output.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
}

EOF

# Redémarrer PM2
pm2 restart ecosystem
pm2 save
```

---

## 🔔 Integration Slack/Email

### Étape 1: Ajouter Slack Webhook

```bash
# 1. Aller sur https://api.slack.com/apps
# 2. Créer nouvelle app "SPOFE-Monitoring"
# 3. Activer "Incoming Webhooks"
# 4. Ajouter URL webhook dans .env:

echo "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL" >> .env
echo "SLACK_ENABLED=true" >> .env
echo "ALERT_EMAIL=ops@spofe.com" >> .env
```

### Étape 2: Intégrer notifications dans le script

```javascript
// Ajouter dans cascade/src/scripts/monitoring-surveillance.js

async function notifySlack(alerts) {
  if (!process.env.SLACK_ENABLED) return;
  
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  
  const message = {
    channel: '#alerts',
    username: 'SPOFE Monitor Bot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: alerts.some(a => a.includes('[CRITICAL]')) ? 'danger' : 'warning',
        title: `🚨 SPOFE Alert - ${new Date().toISOString()}`,
        text: alerts.join('\n'),
        fields: [
          { title: 'Total Alerts', value: alerts.length, short: true },
          { title: 'Service', value: 'SPOFE v2.1', short: true }
        ]
      }
    ]
  };
  
  try {
    await fetch(slackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (err) {
    console.error('Slack notification failed:', err);
  }
}
```

### Étape 3: Ajouter au rapport

```javascript
// À la fin de main():
if (RESULTS.alerts.length > 0) {
  await notifySlack(RESULTS.alerts);
}
```

---

## 📊 Dashboard Grafana

### Créer visualisations

```bash
# 1. Accéder à Grafana
# http://localhost:3000
# Login: admin / admin

# 2. Créer datasource Prometheus
# Data Sources > Add > Prometheus
# URL: http://localhost:9090

# 3. Créer dashboard
# Dashboards > New > Create

# 4. Ajouter panels:
# Panel 1: File Integrity Status
# Panel 2: Error Count (last 24h)
# Panel 3: Database Health
# Panel 4: Security Events
```

### Prometheus Queries

```yaml
# prometheus/monitoring.yml

global:
  scrape_interval: 1m
  evaluation_interval: 1m

scrape_configs:
  - job_name: 'spofe-monitor'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

---

## 📚 Runbooks & Escalade

### Runbook 1: ❌ Configuration File Missing

```markdown
## Alerte: Configuration File Missing

**Sévérité**: CRITICAL  
**Service**: Config Management  
**Impact**: Application ne démarre pas

### Actions Immédiate
1. Vérifier fichier manquant: `grep "MISSING" logs/surveillance.log`
2. Restaurer fichier depuis backup:
   ```bash
   git checkout cascade/.env
   # OU
   cp cascade/.env.backup cascade/.env
   ```
3. Redémarrer application: `npm run dev`
4. Relancer surveillance: `npm run monitor:critical`

### Actions Préventive
- [ ] Mettre en place file watcher
- [ ] Ajouter pré-commit hook
- [ ] Documenter variable d'env requise
```

### Runbook 2: ❌ Database Connection Failed

```markdown
## Alerte: Database Connection Failed

**Sévérité**: CRITICAL  
**Service**: Database  
**Impact**: Application non-fonctionnelle

### Actions Immédiate
1. Vérifier MySQL est running:
   ```bash
   mysql -u root -p -e "SELECT 1"
   ```
2. Vérifier credentials .env:
   ```bash
   grep "DB_" cascade/.env
   ```
3. Redémarrer MySQL:
   ```bash
   sudo systemctl restart mysql
   ```
4. Tester connexion:
   ```bash
   npm run db:verify
   ```

### Actions Préventive
- [ ] Configurer reconnect logic
- [ ] Augmenter pool size
- [ ] Ajouter health checks
```

### Escalade Process

```
⏱️ 0-5 min   : Auto-alert sur Slack
↓
⏱️ 5-15 min  : On-call Engineer investigates
↓
⏱️ 15-30 min : Escalate to Team Lead
↓
⏱️ 30+ min   : Escalate to CTO
```

### Contact Escalade

| Niveau | Rôle | Contact | Disponibilité |
|--------|------|---------|---------------|
| 🔴 L1 | On-Call Engineer | Slack #alerts | 24/7 |
| 🟠 L2 | Team Lead | team-lead@spofe.com | 9h-18h |
| 🟡 L3 | CTO | cto@spofe.com | Sur appel |

---

## ✅ Checklist de Déploiement

### Phase 1: Préparation (30 min)
- [ ] Tester script `npm run monitor:critical`
- [ ] Valider rapport généré
- [ ] Vérifier variables .env
- [ ] Tester sur staging

### Phase 2: Déploiement (30 min)
- [ ] Ajouter scripts NPM
- [ ] Configurer cronjob
- [ ] Tester première exécution
- [ ] Vérifier logs

### Phase 3: Integration (1h)
- [ ] Configurer Slack webhook
- [ ] Tester notification
- [ ] Créer dashboard Grafana
- [ ] Écrire runbooks

### Phase 4: Documentation (30 min)
- [ ] Documenter processus
- [ ] Former équipe ops
- [ ] Créer procédure d'escalade
- [ ] Ajouter à runbooks

---

## 📊 Métriques Clés

### À surveiller
- **File Integrity**: % de fichiers critiques OK
- **Error Rate**: Erreurs par heure
- **Response Time**: Latence P95 < 500ms
- **Uptime**: 99.9% availability
- **Security Events**: 0 incidents/jour

### Alertes Configurées
- ✅ Database down (< 30s)
- ✅ High error rate (> 10/5min)
- ✅ Configuration missing (immédiat)
- ✅ Disk space < 1GB (horaire)
- ✅ Security breach detected (immédiat)

---

## 🎯 Prochaines Étapes

### Immédiat (Aujourd'hui)
```bash
cd cascade
npm run monitor:critical
# Vérifier rapport: logs/surveillance.log
```

### Semaine 1
```bash
# Configurer cronjob
crontab -e
# Ajouter: 0 * * * * cd /chemin && npm run monitor:critical

# Configurer Slack
echo "SLACK_WEBHOOK_URL=..." >> .env
```

### Semaine 2
```bash
# Créer dashboard Grafana
# Documenter runbooks
# Former équipe ops
```

### Semaine 3
```bash
# Déployer en production
# Monitorer 24/7
# Ajuster alertes si nécessaire
```

---

## 📞 Support

- **Documentation**: [FICHIERS_CRITIQUES_A_SURVEILLER.md](../FICHIERS_CRITIQUES_A_SURVEILLER.md)
- **Script**: `cascade/src/scripts/monitoring-surveillance.js`
- **Logs**: `cascade/logs/surveillance.log`
- **Issues**: GitHub Issues avec label `monitoring`

---

**Version**: 1.0  
**Date**: 21 janvier 2026  
**Status**: ✅ Ready for Implementation
