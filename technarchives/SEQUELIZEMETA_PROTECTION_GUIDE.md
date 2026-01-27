# 🔐 SEQUELIZEMETA PROTECTION SUITE

## Vue d'ensemble

La **SEQUELIZEMETA Protection Suite** est un système complet de surveillance et de protection de la table `sequelizemeta` (table système Sequelize pour les migrations).

### Problèmes Adressés

| Problème | Impact | Solution |
|----------|--------|----------|
| ❌ Suppression manuelle de lignes | Perte de tracking des migrations | Trigger + autorisation maîtrisée |
| ❌ Modification des noms de migrations | Inconsistance/erreurs | Trigger de blocage |
| ❌ Changements de structure | Corruption du schema | Trigger de surveillance |
| ❌ Rollbacks incontrôlés | Migrations orphelines | Système d'autorisation temporaire |

---

## 🏗️ Architecture

### Composants

```
┌─────────────────────────────────────────────────────────────┐
│         SEQUELIZEMETA PROTECTION SUITE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣  COUCHE SQL (sequelizemeta-protection.sql)             │
│     ├── Tables d'audit                                      │
│     ├── Tables d'autorisation                               │
│     ├── Triggers de protection                              │
│     ├── Procédures stockées                                 │
│     └── Vues de monitoring                                  │
│                                                              │
│  2️⃣  COUCHE NODE.JS (sequelizemeta-monitor.js)             │
│     ├── Surveillance continue                               │
│     ├── Détection d'anomalies                               │
│     ├── Logging de sécurité                                 │
│     └── API de gestion                                      │
│                                                              │
│  3️⃣  SETUP & CONFIGURATION (sequelizemeta-setup.js)        │
│     ├── Installation des composants                         │
│     ├── Validation                                          │
│     ├── Configuration cron                                  │
│     └── Documentation                                       │
│                                                              │
│  4️⃣  INTÉGRATION NPM (package.json scripts)                 │
│     ├── Commandes de monitoring                             │
│     ├── Commandes d'autorisation                            │
│     ├── Commandes d'audit                                   │
│     └── Rapports                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tables Créées

#### `sequelizemeta_audit`
Historique complet de tous les événements concernant sequelizemeta.

```sql
CREATE TABLE sequelizemeta_audit (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(50),              -- DELETE_ATTEMPT_BLOCKED, UPDATE_NAME_BLOCKED, etc.
  migration_name VARCHAR(255),     -- Nom de la migration affectée
  old_sequelize_version VARCHAR(255),
  new_sequelize_version VARCHAR(255),
  attempted_by VARCHAR(255),       -- Utilisateur/processus qui a tenté
  operation_timestamp TIMESTAMP,
  query_text LONGTEXT,
  status VARCHAR(50),              -- LOGGED, BLOCKED, AUTHORIZED, ALLOWED
  reason VARCHAR(500)
);
```

#### `sequelizemeta_rollback_auth`
Autorisations temporaires pour les rollbacks maîtrisés.

```sql
CREATE TABLE sequelizemeta_rollback_auth (
  rollback_id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE,
  reason VARCHAR(500),             -- Raison du rollback
  authorized_by VARCHAR(255),      -- Admin/Dev qui a autorisé
  authorized_at TIMESTAMP,
  rollback_executed BOOLEAN,       -- Marque si le rollback a eu lieu
  rollback_executed_at TIMESTAMP,
  token VARCHAR(64)                -- Token de révocation
);
```

### Triggers de Protection

#### 1. `sequelizemeta_prevent_delete`
**Bloque la suppression de lignes sauf si autorisée**

```sql
BEFORE DELETE ON sequelizemeta
-- Vérife sequelizemeta_rollback_auth
-- Si autorisation valide → Permet + Enregistre
-- Sinon → Bloque + Enregistre tentative
```

#### 2. `sequelizemeta_prevent_name_change`
**Interdit les changements de noms de migrations**

```sql
BEFORE UPDATE ON sequelizemeta
-- Si old.name != new.name → Bloque
-- Si version change → Enregistre (autorisé)
```

#### 3. `sequelizemeta_prevent_structure_change`
**Surveillé au niveau application (voir monitoring Node.js)**

---

## 🚀 Installation

### 1. Exécuter le Setup

```bash
cd cascade
npm run sequelizemeta:setup
```

Cela va:
- ✅ Créer les tables de protection
- ✅ Créer les triggers
- ✅ Créer les procédures stockées
- ✅ Créer les vues
- ✅ Valider l'installation

### 2. Mettre à jour `package.json`

Ajouter les scripts dans `cascade/package.json`:

```json
{
  "scripts": {
    "sequelizemeta:setup": "node src/scripts/sequelizemeta-setup.js",
    "sequelizemeta:monitor": "node src/scripts/sequelizemeta-monitor.js monitor",
    "sequelizemeta:status": "node src/scripts/sequelizemeta-monitor.js status",
    "sequelizemeta:report": "node src/scripts/sequelizemeta-monitor.js report",
    "sequelizemeta:authorize": "node src/scripts/sequelizemeta-monitor.js authorize",
    "sequelizemeta:revoke": "node src/scripts/sequelizemeta-monitor.js revoke",
    "sequelizemeta:logs": "node src/scripts/sequelizemeta-monitor.js logs"
  }
}
```

### 3. Configurer `.env`

```bash
# Monitoring de sequelizemeta
SEQUELIZEMETA_MONITORING_ENABLED=true
SEQUELIZEMETA_CHECK_INTERVAL=30000  # Vérification toutes les 30 secondes
SEQUELIZEMETA_ALERT_EMAIL=admin@example.com
```

### 4. Démarrer la Surveillance

```bash
npm run sequelizemeta:monitor
```

---

## 📖 Utilisation

### Commandes Disponibles

#### 1. **Démarrer la surveillance continue**

```bash
npm run sequelizemeta:monitor
```

La surveillance va:
- ✅ Vérifier les changements de sequelizemeta toutes les 30 secondes
- ✅ Détecter les additions/suppressions de migrations
- ✅ Détecter les tentatives de modification
- ✅ Enregistrer les anomalies
- ✅ Nettoyer les autorisations expirées (24h)

**Output:**
```
🔐 Initialisation du moniteur de protection sequelizemeta...
✅ Connexion à la base établie
✅ Tables de protection validées
✅ État initial capturé
✅ Surveillance activée
🔍 Surveillance continue activée (Ctrl+C pour arrêter)
```

#### 2. **Afficher le statut actuel**

```bash
npm run sequelizemeta:status
```

**Output:**
```
📊 STATUS PROTECTION SEQUELIZEMETA

┌─────────────────────────────────────┐
│ period                      CURRENT  │
│ total_migrations                  15 │
│ migrations_in_db                  15 │
│ pending_rollbacks                   0 │
│ completed_rollbacks                2 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ period                     LAST_24H  │
│ total_events                     23 │
│ blocked_attempts                   2 │
│ authorized_actions                 1 │
│ allowed_changes                   20 │
└─────────────────────────────────────┘
```

#### 3. **Générer un rapport complet**

```bash
npm run sequelizemeta:report
```

**Output:**
```json
{
  "timestamp": "2026-01-21T16:30:00Z",
  "status": [
    {
      "period": "CURRENT",
      "total_migrations": 15,
      "pending_rollbacks": 0,
      "completed_rollbacks": 2
    }
  ],
  "summary": {
    "totalMigrations": 15,
    "pendingRollbacks": 0,
    "completedRollbacks": 2,
    "lastHourBlockedAttempts": 0
  }
}
```

#### 4. **Autoriser un rollback maîtrisé**

```bash
npm run sequelizemeta:authorize -- 20251215_123456_migration_name
```

Cela va:
- ✅ Générer un token unique
- ✅ Créer une entrée dans `sequelizemeta_rollback_auth`
- ✅ Permettre la suppression pour 24h
- ✅ Enregistrer dans l'audit

**Output:**
```
✅ Rollback autorisé pour: 20251215_123456_migration_name
Token: a3f2b1c9d8e7f6a5b4c3d2e1f0a9b8c7
```

#### 5. **Révoquer une autorisation**

```bash
npm run sequelizemeta:revoke -- 20251215_123456_migration_name
```

**Output:**
```
✅ Rollback révoqué pour: 20251215_123456_migration_name
```

#### 6. **Consulter l'historique d'audit**

```bash
# Dernier 7 jours (défaut)
npm run sequelizemeta:logs

# Dernier 30 jours
npm run sequelizemeta:logs -- 30

# Dernier jour
npm run sequelizemeta:logs -- 1
```

**Output:**
```
📜 HISTORIQUE D'AUDIT

┌─────────┬──────────────────────────┬────────────────────┬──────────────┬─────────────────────┬────────────┐
│ audit_id│ action                   │ migration_name     │ attempted_by │ operation_timestamp │ status     │
├─────────┼──────────────────────────┼────────────────────┼──────────────┼─────────────────────┼────────────┤
│ 42      │ MIGRATION_ADDED          │ 20260121_160000... │ SYSTEM       │ 2026-01-21 16:00:00 │ ALLOWED    │
│ 41      │ DELETE_ATTEMPT_BLOCKED   │ 20251215_123456... │ admin        │ 2026-01-21 15:45:30 │ BLOCKED    │
│ 40      │ ROLLBACK_AUTHORIZED      │ 20251215_123456... │ admin        │ 2026-01-21 15:45:00 │ AUTHORIZED │
└─────────┴──────────────────────────┴────────────────────┴──────────────┴─────────────────────┴────────────┘
```

---

## 🔄 Workflow: Rollback Maîtrisé

### Scénario: Reverter une migration

#### Étape 1: Autoriser le rollback

```bash
npm run sequelizemeta:authorize -- 20251215_123456_add_users_columns
```

**Résultat:**
- Enregistrement dans `sequelizemeta_rollback_auth`
- Autorisation valide pour 24h
- Un token unique généré

#### Étape 2: Exécuter le downgrade Sequelize

```bash
npx sequelize-cli db:migrate:undo --name 20251215_123456_add_users_columns
```

**Résultats:**
- ✅ Sequelize exécute la migration `down()`
- ✅ Trigger détecte l'autorisation valide
- ✅ Suppression autorisée
- ✅ Entrée marquée comme `rollback_executed = TRUE`
- ✅ Log enregistré avec AUTHORIZED status

#### Étape 3 (optionnel): Révoquer si besoin

Si vous changez d'avis avant d'exécuter le downgrade:

```bash
npm run sequelizemeta:revoke -- 20251215_123456_add_users_columns
```

**Résultat:**
- Suppression de l'entrée d'autorisation
- Prochaine tentative de suppression sera bloquée

---

## 🛡️ Protection: Cas d'Usage

### Cas 1: Tentative de Suppression Non Autorisée

```bash
# Tentative manuelle (via client MySQL, script, etc.)
DELETE FROM sequelizemeta WHERE name = '20251215_123456_add_users_columns';
```

**Résultat:**
```
ERROR 1644 (45000): PROTECTION SEQUELIZEMETA: Suppression de la migration 
"20251215_123456_add_users_columns" est interdite. 
Utilisez authorize_rollback() pour les rollbacks maîtrisés.
```

**Audit Log:**
```
action: DELETE_ATTEMPT_BLOCKED
migration_name: 20251215_123456_add_users_columns
attempted_by: root@localhost
status: BLOCKED
reason: Suppression non autorisée - pas de rollback auth valide
```

### Cas 2: Tentative de Renommage

```bash
# Tentative manuelle
UPDATE sequelizemeta 
SET name = '20251215_999999_wrong_name' 
WHERE name = '20251215_123456_add_users_columns';
```

**Résultat:**
```
ERROR 1644 (45000): PROTECTION SEQUELIZEMETA: Renommage de migrations est interdit. 
Ancien nom: "20251215_123456_add_users_columns", 
Nouveau nom: "20251215_999999_wrong_name"
```

**Audit Log:**
```
action: UPDATE_NAME_BLOCKED
migration_name: 20251215_123456_add_users_columns
attempted_by: root@localhost
status: BLOCKED
reason: Tentative de renommer...
```

### Cas 3: Modification Autorisée (Version Sequelize)

```bash
# Mise à jour de la version Sequelize (normal)
UPDATE sequelizemeta 
SET sequelize_version = '6.35.0' 
WHERE name = '20251215_123456_add_users_columns';
```

**Résultat:**
```
✅ Mise à jour autorisée
```

**Audit Log:**
```
action: VERSION_UPDATE
migration_name: 20251215_123456_add_users_columns
old_sequelize_version: 6.34.0
new_sequelize_version: 6.35.0
attempted_by: root@localhost
status: ALLOWED
```

---

## 📊 Vues de Monitoring

### Vue 1: État Actuel des Migrations

```sql
SELECT * FROM v_sequelizemeta_current_state;
```

**Output:**
```
┌────────────────────────────────────────┬─────────────────┬──────────────────┬────────────────────┬────────────────┐
│ migration_name                         │ sequelize_vers  │ status           │ reason             │ authorized_by  │
├────────────────────────────────────────┼─────────────────┼──────────────────┼────────────────────┼────────────────┤
│ 20251210_081234_create_users           │ 6.34.0          │ PROTECTED        │ NULL               │ NULL           │
│ 20251210_081500_create_compagnies      │ 6.34.0          │ PROTECTED        │ NULL               │ NULL           │
│ 20251215_123456_add_users_columns      │ 6.34.0          │ PENDING_ROLLBACK  │ Testing rollback   │ admin          │
│ 20251220_140000_add_audit              │ 6.34.0          │ PROTECTED        │ NULL               │ NULL           │
└────────────────────────────────────────┴─────────────────┴──────────────────┴────────────────────┴────────────────┘
```

### Vue 2: Tentatives Bloquées

```sql
SELECT * FROM v_sequelizemeta_blocked_attempts;
```

**Output:**
```
┌─────────┬─────────────────────────┬────────────────────┬──────────────┬─────────────────────┐
│ audit_id│ action                  │ migration_name     │ attempted_by │ operation_timestamp │
├─────────┼─────────────────────────┼────────────────────┼──────────────┼─────────────────────┤
│ 35      │ DELETE_ATTEMPT_BLOCKED  │ 20251215_123456... │ root         │ 2026-01-21 14:23:15 │
│ 32      │ UPDATE_NAME_BLOCKED     │ 20251210_081234... │ admin        │ 2026-01-21 13:10:00 │
└─────────┴─────────────────────────┴────────────────────┴──────────────┴─────────────────────┘
```

### Vue 3: Changements Autorisés

```sql
SELECT * FROM v_sequelizemeta_allowed_changes;
```

**Output:**
```
┌─────────┬──────────────────┬────────────────────┬─────────────────────┬─────────────────────┬──────────────┬─────────────────────┐
│ audit_id│ action           │ migration_name     │ old_sequelize_vers  │ new_sequelize_vers  │ attempted_by │ operation_timestamp │
├─────────┼──────────────────┼────────────────────┼─────────────────────┼─────────────────────┼──────────────┼─────────────────────┤
│ 28      │ VERSION_UPDATE   │ 20251210_081234... │ 6.33.0              │ 6.34.0              │ system       │ 2026-01-20 09:00:00 │
│ 25      │ MIGRATION_ADDED  │ 20251220_140000... │ NULL                │ NULL                │ SYSTEM       │ 2026-01-20 08:30:00 │
└─────────┴──────────────────┴────────────────────┴─────────────────────┴─────────────────────┴──────────────┴─────────────────────┘
```

---

## 🔌 Intégration avec Sequelize CLI

### Configuration Recommandée

#### `.sequelizerc`

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations'),
  'url': process.env.DATABASE_URL,
  'dialect': 'mysql',
  'sequerlizemeta-table': 'sequelizemeta'  // ← Utiliser la table protégée
};
```

#### Workflow Sequelize Normal

```bash
# Créer une nouvelle migration (AUTORISÉE)
npx sequelize-cli migration:generate --name add_new_column

# Exécuter les migrations (AUTORISÉE - Sequelize CLI ajoute à sequelizemeta)
npx sequelize-cli db:migrate

# Pour reverter (PROTECTION ACTIVÉE):
# 1. Autoriser le rollback
npm run sequelizemeta:authorize -- 20260121_120000_add_new_column

# 2. Exécuter le downgrade
npx sequelize-cli db:migrate:undo
```

---

## ⚙️ Tâches Planifiées (Cron)

### Configuration Automatique

Le nettoyage des autorisations expirées peut être configuré avec:

#### Option 1: Cron Linux/macOS

```bash
# Ajouter à crontab (tous les jours à minuit)
0 0 * * * cd /path/to/cascade && npm run sequelizemeta:cleanup
```

#### Option 2: Windows Task Scheduler

```powershell
# Créer une tâche pour nettoyer toutes les 24h
$trigger = New-ScheduledTaskTrigger -Daily -At 00:00
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run sequelizemeta:cleanup" -WorkingDirectory "C:\path\to\cascade"
Register-ScheduledTask -TaskName "SequerlizemataCleanup" -Trigger $trigger -Action $action
```

#### Option 3: Node.js Cron (Recommandé)

Dans `cascade/src/app.js`:

```javascript
const cron = require('node-cron');

// Nettoyer les autorisations expirées tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  logger.logInfo('🧹 Nettoyage des autorisations sequelizemeta expirées...');
  // Appeler la procédure de nettoyage
});
```

---

## 📈 Monitoring & Alerting

### Dashboard Grafana (Optionnel)

Créer un dashboard pour:
- **Graphiques:**
  - Total migrations par jour
  - Tentatives bloquées par heure
  - Rollbacks autorisés
  
- **Alertes:**
  - `blocked_attempts > 5` dans la dernière heure → Email admin
  - `pending_rollbacks > 0` depuis >12h → Email admin
  - `structure_change_detected` → Email admin

### Email Alerts

Configurer les alertes dans `.env`:

```bash
SEQUELIZEMETA_ALERT_EMAIL=devops@example.com
SEQUELIZEMETA_ALERT_THRESHOLD_BLOCKED=5  # Alerter après 5 tentatives bloquées
SEQUELIZEMETA_ALERT_THRESHOLD_PENDING=12  # Alerter après 12h de rollback pending
```

---

## 🆘 Troubleshooting

### Problème 1: "Table sequelizemeta_audit not found"

**Solution:**
```bash
npm run sequelizemeta:setup
```

### Problème 2: "Rollback autorisé mais suppression toujours bloquée"

**Vérifier:**
```sql
-- Vérifier l'autorisation existe
SELECT * FROM sequelizemeta_rollback_auth WHERE migration_name = 'xxx';

-- Vérifier l'expiration (< 24h)
SELECT *, NOW() - authorized_at as age FROM sequelizemeta_rollback_auth 
WHERE migration_name = 'xxx';
```

### Problème 3: Monitoring affiche des faux positifs

**Vérifier:**
```bash
# Redémarrer le monitoring
npm run sequelizemeta:monitor

# Consulter les logs
npm run sequelizemeta:logs -- 1
```

---

## 🔒 Sécurité

### Bonnes Pratiques

| Recommandation | Raison |
|----------------|--------|
| Autoriser le rollback toujours manuellement | Éviter les reversions accidentelles |
| Consulter le rapport avant d'autoriser | Vérifier qu'aucune tentative suspecte |
| Monitorer continuellement en production | Détecter les accès non autorisés |
| Archiver les logs audit régulièrement | Conformité & traçabilité |
| Restreindre l'accès aux procédures stockées | Seul admin peut autoriser rollbacks |

### Permissions MySQL Recommandées

```sql
-- Utilisateur Sequelize CLI (lectures seules + exécution)
GRANT SELECT, INSERT, DELETE ON spofe_v2_1.sequelizemeta TO 'sequelize'@'localhost';

-- Admin (accès complet)
GRANT ALL PRIVILEGES ON spofe_v2_1.sequelizemeta_* TO 'admin'@'localhost';
GRANT EXECUTE ON PROCEDURE spofe_v2_1.authorize_sequelizemeta_rollback TO 'admin'@'localhost';
GRANT EXECUTE ON PROCEDURE spofe_v2_1.revoke_sequelizemeta_rollback TO 'admin'@'localhost';

-- Application (monitoring uniquement)
GRANT SELECT ON spofe_v2_1.sequelizemeta_audit TO 'app'@'localhost';
GRANT SELECT ON spofe_v2_1.sequelizemeta_rollback_auth TO 'app'@'localhost';
```

---

## 📋 Checklist Déploiement

### Avant Production

- [ ] Exécuter `npm run sequelizemeta:setup`
- [ ] Mettre à jour `package.json` avec les scripts
- [ ] Configurer `.env` avec les variables
- [ ] Tester un rollback autorisé en dev
- [ ] Consulter le rapport de statut
- [ ] Configurer les alertes email
- [ ] Documenter le processus pour l'équipe

### En Production

- [ ] Démarrer le monitoring: `npm run sequelizemeta:monitor` (daemon)
- [ ] Vérifier quotidiennement le statut: `npm run sequelizemeta:status`
- [ ] Archiver les logs audit chaque semaine
- [ ] Revoir les alertes bloquées mensuellement
- [ ] Tester un rollback maîtrisé tous les trimestres

---

## 📞 Support

### Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `src/database/sequelizemeta-protection.sql` | Composants SQL (tables, triggers, procs) |
| `src/scripts/sequelizemeta-monitor.js` | Surveillance & monitoring |
| `src/scripts/sequelizemeta-setup.js` | Installation & configuration |
| `package.json` | Scripts npm |

### Documentation

- 📖 Cette doc: Utilisation & concepts
- 📝 Code: Commentaires inline détaillés
- 🔍 Logs: `logs/error.log` et `logs/security.log`

---

**Version:** 1.0  
**Date:** 21 janvier 2026  
**Status:** ✅ Production-Ready
