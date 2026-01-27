# 🔐 SEQUELIZEMETA PROTECTION - GUIDE D'INSTALLATION

## ⚡ Démarrage Rapide (5 minutes)

### 1. Installer les scripts

```bash
cd cascade

# Les fichiers sont déjà présents:
# - src/database/sequelizemeta-protection.sql
# - src/scripts/sequelizemeta-monitor.js
# - src/scripts/sequelizemeta-setup.js
# - src/scripts/sequelizemeta-test.js
```

### 2. Mettre à jour package.json

Ajouter cette section dans `cascade/package.json` → `"scripts"`:

```json
{
  "scripts": {
    // ... scripts existants ...
    
    "sequelizemeta:setup": "node src/scripts/sequelizemeta-setup.js",
    "sequelizemeta:monitor": "node src/scripts/sequelizemeta-monitor.js monitor",
    "sequelizemeta:status": "node src/scripts/sequelizemeta-monitor.js status",
    "sequelizemeta:report": "node src/scripts/sequelizemeta-monitor.js report",
    "sequelizemeta:authorize": "node src/scripts/sequelizemeta-monitor.js authorize",
    "sequelizemeta:revoke": "node src/scripts/sequelizemeta-monitor.js revoke",
    "sequelizemeta:logs": "node src/scripts/sequelizemeta-monitor.js logs",
    "sequelizemeta:test": "node src/scripts/sequelizemeta-test.js"
  }
}
```

### 3. Exécuter le setup

```bash
npm run sequelizemeta:setup
```

Cela va:
- ✅ Créer les tables de protection
- ✅ Créer les triggers
- ✅ Créer les procédures stockées
- ✅ Créer les vues
- ✅ Valider l'installation

**Output attendu:**
```
🚀 Démarrage de la configuration de protection sequelizemeta...

📝 Installation des composants SQL...
✅ Composants SQL installés

🔍 Validation de l'installation...
✅ Installation validée

⏰ Configuration des tâches planifiées...
✅ Tâches planifiées configurées

📄 Génération des fichiers de configuration...
✅ Fichiers de configuration créés

╔════════════════════════════════════════════════════════════════════════╗
║          ✅ SEQUELIZEMETA PROTECTION SETUP COMPLETE                   ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 4. Configurer .env

Ajouter dans `.env`:

```bash
# Monitoring de sequelizemeta
SEQUELIZEMETA_MONITORING_ENABLED=true
SEQUELIZEMETA_CHECK_INTERVAL=30000
SEQUELIZEMETA_ALERT_EMAIL=admin@example.com
```

### 5. Tester la protection

```bash
npm run sequelizemeta:test
```

**Output attendu:**
```
✅ TOUS LES TESTS ONT RÉUSSI - PROTECTION ACTIVE
```

### 6. Démarrer la surveillance

```bash
npm run sequelizemeta:monitor
```

**C'est tout!** La protection est maintenant active! 🎉

---

## 📋 Étapes Détaillées

### Étape 1: Prérequis

Vérifier que les dépendances existent:

```bash
npm ls mysql2 dotenv
```

Si manquantes:
```bash
npm install mysql2 dotenv
```

### Étape 2: Vérifier la Connexion Base

```bash
# Test rapide de connexion
mysql -u root -p -h localhost -e "SELECT 1 FROM spofe_v2_1.sequelizemeta LIMIT 1;"
```

### Étape 3: Exécuter sequelizemeta-setup.js

```bash
node cascade/src/scripts/sequelizemeta-setup.js
```

Vérifier les logs pour les erreurs potentielles.

### Étape 4: Valider l'Installation

```bash
# Vérifier les tables
mysql -u root -p spofe_v2_1 -e "SHOW TABLES LIKE 'sequelizemeta%';"

# Vérifier les procédures
mysql -u root -p spofe_v2_1 -e "SHOW PROCEDURE STATUS WHERE Db = 'spofe_v2_1';"

# Vérifier les vues
mysql -u root -p spofe_v2_1 -e "SHOW FULL TABLES IN spofe_v2_1 WHERE TABLE_TYPE LIKE 'VIEW';"
```

### Étape 5: Exécuter les Tests

```bash
npm run sequelizemeta:test
```

Tous les tests doivent passer ✅

### Étape 6: Configurer npm Scripts

Mettre à jour `cascade/package.json` avec les commandes (voir section 2 ci-dessus).

### Étape 7: Démarrer le Monitoring

En développement:
```bash
npm run sequelizemeta:monitor
```

En production (avec PM2):
```bash
pm2 start "npm run sequelizemeta:monitor" --name sequelizemeta
pm2 save
pm2 startup
```

---

## 🔍 Vérification Post-Installation

### Test 1: Montrer le statut

```bash
npm run sequelizemeta:status
```

### Test 2: Générer un rapport

```bash
npm run sequelizemeta:report
```

### Test 3: Afficher les logs récents

```bash
npm run sequelizemeta:logs -- 1
```

### Test 4: Tenter une suppression (devrait être bloquée)

```bash
# Dans un client MySQL:
DELETE FROM sequelizemeta LIMIT 1;

# Devrait retourner une erreur:
# ERROR 1644: PROTECTION SEQUELIZEMETA: Suppression... est interdite.
```

### Test 5: Tenter un renommage (devrait être bloqué)

```bash
# Dans un client MySQL:
UPDATE sequelizemeta SET name = 'test' WHERE name = (SELECT name FROM sequelizemeta LIMIT 1);

# Devrait retourner une erreur:
# ERROR 1644: PROTECTION SEQUELIZEMETA: Renommage de migrations est interdit.
```

---

## 🚀 Démarrage en Production

### Configuration PM2

Créer `ecosystem.config.js` avec:

```javascript
module.exports = {
  apps: [
    {
      name: 'sequelizemeta-monitor',
      script: 'npm',
      args: 'run sequelizemeta:monitor',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: 'logs/sequelizemeta-error.log',
      out_file: 'logs/sequelizemeta-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

Démarrer:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Configuration Docker

Dans le Dockerfile:

```dockerfile
# ...autres instructions...

# Démarrer Sequelize monitoring en arrière-plan
RUN npm run sequelizemeta:setup

CMD ["sh", "-c", "npm run sequelizemeta:monitor & npm run dev"]
```

### Configuration Cron (Linux/macOS)

```bash
# Ajouter au crontab
crontab -e

# Ajouter cette ligne:
0 0 * * * cd /path/to/cascade && npm run sequelizemeta:cleanup 2>> logs/cron.log
```

### Configuration Windows Task Scheduler

```powershell
$trigger = New-ScheduledTaskTrigger -Daily -At 00:00
$action = New-ScheduledTaskAction -Execute "powershell" -Argument "-Command `"cd C:\path\to\cascade; npm run sequelizemeta:cleanup`"" -WorkingDirectory "C:\path\to\cascade"
Register-ScheduledTask -TaskName "SequerlizemataMonitor" -Trigger $trigger -Action $action
```

---

## 🆘 Troubleshooting

### Problème: "Cannot find module 'mysql2'"

**Solution:**
```bash
npm install mysql2
```

### Problème: "Connection refused"

**Vérifier:**
```bash
# Que le serveur MySQL est actif
mysql -u root -p -e "SELECT 1;"

# Que les credentials dans .env sont corrects
echo $DB_HOST $DB_USER $DB_NAME
```

### Problème: "Table sequelizemeta_audit not found"

**Solution:**
```bash
# Réexécuter le setup
npm run sequelizemeta:setup

# Vérifier que les tables existent
mysql -u root -p spofe_v2_1 -e "SHOW TABLES LIKE 'sequelizemeta%';"
```

### Problème: Tests échouent

**Debug:**
```bash
# Vérifier les logs
npm run sequelizemeta:logs -- 1

# Vérifier l'état de protection
npm run sequelizemeta:status

# Consulter les entrées d'audit
mysql -u root -p spofe_v2_1 -e "SELECT * FROM sequelizemeta_audit ORDER BY audit_id DESC LIMIT 5;"
```

### Problème: Monitoring s'arrête

**Solution:**
```bash
# Relancer en arrière-plan avec nohup
nohup npm run sequelizemeta:monitor > logs/sequelizemeta.log 2>&1 &

# Ou avec PM2
pm2 start "npm run sequelizemeta:monitor" --name sequelizemeta
```

---

## 📊 Dashboard de Santé

Créer un endpoint Express pour monitoring:

```javascript
// cascade/src/routes/sequelizemeta.routes.js

const express = require('express');
const router = express.Router();
const SequerlizemataMonitor = require('../scripts/sequelizemeta-monitor');

const monitor = new SequerlizemataMonitor(dbConfig);

// Endpoint: /api/sequelizemeta/status
router.get('/status', async (req, res) => {
  try {
    const status = await monitor.getProtectionStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: /api/sequelizemeta/logs
router.get('/logs', async (req, res) => {
  try {
    const days = req.query.days || 7;
    const logs = await monitor.getAuditLog(days);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: /api/sequelizemeta/report
router.get('/report', async (req, res) => {
  try {
    const report = await monitor.generateProtectionReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

Enregistrer dans `app.js`:
```javascript
app.use('/api/sequelizemeta', require('./routes/sequelizemeta.routes'));
```

Accéder à:
```bash
curl http://localhost:3001/api/sequelizemeta/status
curl http://localhost:3001/api/sequelizemeta/report
```

---

## 📚 Documentation Complète

Pour la documentation détaillée, voir:
- [SEQUELIZEMETA_PROTECTION_GUIDE.md](./SEQUELIZEMETA_PROTECTION_GUIDE.md) - Guide complet d'utilisation

---

## ✅ Checklist Finale

- [ ] Scripts installés (`src/scripts/sequelizemeta-*.js`)
- [ ] SQL de protection exécuté (`src/database/sequelizemeta-protection.sql`)
- [ ] Package.json mis à jour avec les scripts npm
- [ ] .env configuré avec les variables
- [ ] Tests réussis (`npm run sequelizemeta:test`)
- [ ] Monitoring démarré (`npm run sequelizemeta:monitor`)
- [ ] Statut vérifié (`npm run sequelizemeta:status`)
- [ ] Documentation lue et comprise
- [ ] Équipe informée du nouveau système

---

## 🎉 Installation Terminée!

La protection de `sequelizemeta` est maintenant **ACTIVE** et **OPÉRATIONNELLE**.

**Prochaines étapes:**
1. Monitorer régulièrement avec `npm run sequelizemeta:monitor`
2. Consulter les rapports avec `npm run sequelizemeta:report`
3. Archiver les logs audit chaque semaine
4. Tester les rollbacks maîtrisés mensuellement

---

**Version:** 1.0  
**Date:** 21 janvier 2026  
**Support:** Voir documentation complète
