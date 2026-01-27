# 🚀 PROCHAINES ÉTAPES TECHNIQUES - SPOFE v2.1

**Date**: 21 janvier 2026  
**Priority**: HIGH  
**Estimation**: 2-3 jours

---

## 📋 CHECKLIST PROCHAINES ÉTAPES

### ✅ ÉTAPE 1: Finaliser ORM ↔ Models (2h)
- [ ] Vérifier tous les modèles Sequelize
- [ ] Corriger/ajouter associations manquantes
- [ ] Valider conformité avec BD actuelle
- [ ] Tester eager loading

### ✅ ÉTAPE 2: Réactiver Surveillance FK Automatique (1h)
- [ ] Configurer cron audit:fk:auto
- [ ] Tester execution automatique
- [ ] Vérifier logs générés
- [ ] Configurer alertes (optionnel)

### ✅ ÉTAPE 3: Intégrer dans Helper SPOFE (1.5h)
- [ ] Ajouter option audit:fk au helper
- [ ] Documenter dans spofe-helper.js
- [ ] Tester execution post-migration
- [ ] Ajouter à npm scripts

### ✅ ÉTAPE 4: Documentation Technique (1h)
- [ ] Créer/mettre à jour README_DATABASE.md
- [ ] Documenter snapshot approach
- [ ] Lister migrations désactivées
- [ ] Ajouter procédures d'urgence

---

## 🔍 ÉTAPE 1 - FINALISER ORM ↔ MODELS

### 1.1 Vérifier Modèles Existants

**Fichiers à vérifier:**
```
cascade/src/models/
  ├─ user.model.js
  ├─ company.model.js (à créer?)
  ├─ chartOfAccount.model.js (à créer?)
  └─ journalEntry.model.js
```

**Checklist pour chaque modèle:**
- [ ] Propriétés correspondent à BD
- [ ] Types Sequelize corrects
- [ ] Associations bidirectionnelles
- [ ] Timestamps présents

### 1.2 Associations Requises

```javascript
// User Model
User.hasMany(JournalEntry, { 
  foreignKey: 'userId',
  as: 'journalEntries'
});

// Company Model
Company.hasMany(JournalEntry, { 
  foreignKey: 'company_id',
  as: 'entries'
});
Company.hasMany(ChartOfAccount, { 
  foreignKey: 'companyId',
  as: 'accounts'
});

// JournalEntry Model
JournalEntry.belongsTo(Company, { 
  foreignKey: 'company_id',
  as: 'company'
});
JournalEntry.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'creator'
});

// ChartOfAccount Model
ChartOfAccount.belongsTo(Company, { 
  foreignKey: 'companyId',
  as: 'company'
});
```

### 1.3 Validation

```bash
# Tester associations
npm test -- models

# Vérifier sync BD
npm run db:verify

# Tester eager loading
node -e "
import { sequelize } from './src/config/database.js';
const { User, Company, JournalEntry } = sequelize.models;
// Test loading
const entries = await JournalEntry.findAll({
  include: ['company', 'creator']
});
console.log('✓ Associations OK');
"
```

---

## 🔄 ÉTAPE 2 - SURVEILLANCE FK AUTOMATIQUE

### 2.1 Configuration Cron

**Option A: Linux/Mac - Crontab**
```bash
# Ouvrir crontab
crontab -e

# Ajouter ligne (tous les dimanches 00:05)
5 0 * * 0 cd /path/to/cascade && npm run audit:fk:auto >> logs/cron-audit-fk.log 2>&1
```

**Option B: Windows - Task Scheduler**
```
Voir: Docs/04_DATABASE/SETUP_CRON_FK_AUDIT.md
Scheduler → Tâche planifiée → Dimanche 00:05 → npm run audit:fk:auto
```

**Option C: Node-Cron (In-app)**
```javascript
// src/scripts/cron-fk-audit.js
import cron from 'node-cron';
import { execSync } from 'child_process';

// Tous les dimanches à 00:05
cron.schedule('5 0 * * 0', () => {
  console.log('🔍 Audit FK programmé...');
  execSync('npm run audit:fk:auto', { stdio: 'inherit' });
});

console.log('✓ Cron audit FK actif');
```

### 2.2 Tester Exécution

```bash
# Mode test (immédiat)
npm run audit:fk:auto

# Vérifier rapport généré
ls logs/audits/fk/AUDIT_FK_RESULT_*.md

# Vérifier historique
npm run audit:fk:history
```

### 2.3 Configuration Alertes (Optionnel)

```javascript
// Si anomalies détectées → envoyer email/Slack
if (anomalies.length > 0) {
  await sendAlert({
    channel: '#database-alerts',
    message: `🚨 Anomalies FK détectées: ${anomalies.length}`,
    attachments: [reportPath]
  });
}
```

---

## 🧠 ÉTAPE 3 - INTÉGRER DANS HELPER SPOFE

### 3.1 Mettre à Jour Helper

**Fichier: `cascade/src/scripts/spofe-helper.js` (ou équivalent)**

```javascript
// Ajouter option audit:fk
export const SPOFE_COMMANDS = {
  // ... autres commands
  
  audit: {
    fk: {
      name: 'audit:fk',
      description: 'Auditer contraintes FK',
      execute: async () => {
        execSync('npm run audit:fk', { stdio: 'inherit' });
      }
    },
    fkAuto: {
      name: 'audit:fk:auto',
      description: 'Auditer FK (mode auto, sans interactivité)',
      execute: async () => {
        execSync('npm run audit:fk:auto', { stdio: 'inherit' });
      }
    },
    fkFix: {
      name: 'audit:fk:fix',
      description: 'Auditer FK et corriger anomalies',
      execute: async () => {
        const confirmed = await prompt('Confirmer corrections? (y/n)');
        if (confirmed === 'y') {
          execSync('npm run audit:fk:fix', { stdio: 'inherit' });
        }
      }
    }
  }
};

// Menu helper
export const MAINTENANCE_MENU = {
  database: {
    'Audit FK': () => SPOFE_COMMANDS.audit.fk.execute(),
    'Audit FK (Auto)': () => SPOFE_COMMANDS.audit.fkAuto.execute(),
    'Audit FK (Corriger)': () => SPOFE_COMMANDS.audit.fkFix.execute(),
  }
};
```

### 3.2 Intégrer Post-Migration

```javascript
// cascade/src/scripts/migration-post-hook.js
import { execSync } from 'child_process';
import fs from 'fs';

export async function postMigrationChecks() {
  console.log('🔍 Vérifications post-migration...');
  
  try {
    // 1. Vérifier BD
    console.log('  ✓ Vérification BD...');
    execSync('npm run db:verify', { stdio: 'inherit' });
    
    // 2. Auditer FK
    console.log('  ✓ Audit FK...');
    execSync('npm run audit:fk:auto', { stdio: 'inherit' });
    
    // 3. Vérifier intégrité fichiers
    console.log('  ✓ Audit fichiers...');
    execSync('npm run audit:files', { stdio: 'inherit' });
    
    console.log('✅ Toutes les vérifications passées!');
    return true;
  } catch (err) {
    console.error('❌ Vérification échouée:', err.message);
    return false;
  }
}

// Exécuter après migration
if (process.argv[2] === 'post-migrate') {
  await postMigrationChecks();
}
```

### 3.3 Npm Scripts - Mise à Jour

```json
{
  "scripts": {
    "db:migrate": "npx sequelize db:migrate && npm run post-migrate",
    "post-migrate": "node src/scripts/migration-post-hook.js post-migrate",
    "maintenance:fk": "node src/scripts/spofe-helper.js audit:fk",
    "maintenance:fk:auto": "node src/scripts/spofe-helper.js audit:fk:auto",
    "maintenance:fk:fix": "node src/scripts/spofe-helper.js audit:fk:fix"
  }
}
```

---

## 📚 ÉTAPE 4 - DOCUMENTATION TECHNIQUE

### 4.1 Créer README_DATABASE.md

**Contenu:**

```markdown
# 📊 Documentation Base de Données - SPOFE v2.1

## Vue d'ensemble
SPOFE utilise:
- MySQL 8.0 (spofe_v2_1)
- Sequelize ORM (v6.37.7)
- Sequelize CLI (v6.6.5)
- Migrations ES modules

## Architecture

### Snapshot Approach
- Migration de base: `000-snapshot-current-state.js`
- Représente l'état "zéro défaut" du schéma
- Toute nouvelle migration part de ce point
- Voir: RAPPORT_RESOLUTION_MIGRATIONS_2026-01-21.md

### Tables Principales
```
users (CHAR(36))
  ├─ id: PRIMARY KEY
  ├─ username: UNIQUE
  ├─ email: UNIQUE
  └─ ...

companies (INT auto-increment)
  ├─ id: PRIMARY KEY, AUTO_INCREMENT
  ├─ registrationNumber: UNIQUE
  └─ ...

journal_entries (INT auto-increment)
  ├─ id: PRIMARY KEY
  ├─ company_id: FK → companies(id)
  └─ ...

chartsOfAccounts (CHAR(36))
  ├─ id: PRIMARY KEY
  ├─ companyId: FK → companies(id)
  └─ ...
```

## Migrations

### Status
```
Active:
  ✅ 000-snapshot-current-state.js

Désactivées (.disabled):
  • 001-003-xxx (doublon)
  • 004-007-xxx (références invalides)
  • 202601xx-xxx (CommonJS incompatible)
```

### Ajouter une Migration

```bash
# 1. Créer
npx sequelize migration:generate --name add-new-table

# 2. Implémenter (EN ES MODULES!)
export async function up(queryInterface, Sequelize) {
  // Utiliser queryInterface.createTable() ou SQL brut
}

# 3. Tester local
npm run db:migrate

# 4. Vérifier FK
npm run audit:fk

# 5. Commiter
git add src/database/migrations/
git commit -m "migration: add new table"
```

## Audit FK

### Commandes
```bash
npm run audit:fk              # Audit simple
npm run audit:fk:fix          # Audit + correction
npm run audit:fk:auto         # Auto (CI/CD)
npm run audit:fk:history      # Historique
npm run audit:fk:watch        # Watch mode
```

### Automatisation
- Cron: Chaque dimanche 00:05
- Pre-push: Via Husky
- Post-migrate: Automatique
- Voir: SETUP_CRON_FK_AUDIT.md

### Rapports
```
logs/audits/fk/
  ├─ AUDIT_FK_RESULT_*.md
  ├─ AUDIT_FK_RESULT_*.json
  ├─ backups/
  │  └─ schema_backup_*.sql
  └─ fk_audit_history.json
```

## Maintenance

### Weekly Checklist
- [ ] Vérifier logs/audits/fk/
- [ ] Vérifier conformité ORM/BD
- [ ] Vérifier migrations appliquées

### Emergency
```bash
# Analyser BD
node analyze-full-db.js

# Nettoyer BD (ATTENTION!)
node clean-db-reset.js

# Restaurer depuis backup
mysql < logs/audits/fk/backups/schema_backup_*.sql
```

## Problèmes Courants

### "Foreign key constraint is incorrectly formed"
→ Voir: RAPPORT_RESOLUTION_MIGRATIONS_2026-01-21.md
→ Vérifier types données FK = tables référencées
→ Exécuter: npm run audit:fk:fix

### Migration échoue
→ Vérifier syntaxe ES modules
→ Vérifier existence tables dépendances
→ Tester: npm run audit:fk avant migration

### Anomalies FK détectées
→ Voir rapport: npm run audit:fk
→ Corriger: npm run audit:fk:fix
→ Vérifier: npm run audit:fk
```

### 4.2 Mise à Jour Structure

```
Docs/
  04_DATABASE/
    ├─ README_DATABASE.md (NEW)
    ├─ GUIDE_AUDIT_FK_CONSTRAINTS.md (existant)
    ├─ SETUP_CRON_FK_AUDIT.md (existant)
    ├─ DEPLOYMENT_CHECKLIST_AUDIT_FK.md (existant)
    └─ AUDIT_FK_LIVRABLE_COMPLET.md (existant)

cascade/
  ├─ RAPPORT_RESOLUTION_MIGRATIONS_2026-01-21.md
  ├─ src/database/migrations/
  │  └─ 000-snapshot-current-state.js ✅ ACTIVE
  ├─ src/scripts/
  │  ├─ audit_fk_constraints_spofe_v2.1.js
  │  ├─ migration-post-hook.js (NEW)
  │  └─ spofe-helper.js (UPDATED)
  └─ logs/audits/fk/
     └─ AUDIT_FK_RESULT_*.md (générés)
```

---

## 📊 SYSTÈME DE SURVEILLANCE SPOFE

| Surveillance | Statut | Fréquence | Localisation |
|---|---|---|---|
| 🔍 Audit FK | ✅ OK | Hebdomadaire (dim 00h05) | src/scripts/audit_fk_constraints_spofe_v2.1.js |
| 🔄 Sync ORM/DB | ✅ OK | À chaque commit/push | src/scripts/sync_backend_db_spofe_v2.1_AI.js |
| 🧠 Audit fichiers critiques | ✅ OK | Continu | src/scripts/audit_files_spofe_v2.1_AI.js |
| 🗃️ Snapshot BD | ✅ Stable | Unique | src/database/migrations/000-snapshot-current-state.js |
| 🧾 Logs | ✅ Centralisés | / | logs/audits/fk/ |
| 📋 SequelizeMeta | ✅ À jour | / | BD |

---

## ✅ CONCLUSION & RECOMMANDATIONS

### Maintenir le Snapshot comme Baseline
```
000-snapshot-current-state.js = État "zéro défaut"
Représente l'accord BD/ORM initial
Point de départ pour toute nouvelle migration
```

### Créer Migrations à partir du Snapshot
```bash
# Ancien workflow (❌ problématique)
Migrations 001-003 → Créer users, companies, chartsOfAccounts

# Nouveau workflow (✅ robuste)
Migration 000 (snapshot) → État stable connu
Migration 001 (future) → Ajouter nouvelle table
Migration 002 (future) → Modifier colonne existante
```

### Activer audit:fk:auto dans Cron
```bash
# Chaque dimanche 00:05
5 0 * * 0 cd /path && npm run audit:fk:auto

# Vérifie FK automatiquement
# Génère rapport
# Alerte si anomalies
```

### Mettre à Jour Helper SPOFE
```bash
npm run maintenance:fk        # Audit manuel
npm run maintenance:fk:auto   # Audit auto
npm run maintenance:fk:fix    # Corriger anomalies
```

### Points de Contrôle Essentiels
1. **Avant chaque commit** → `npm run audit:fk` (Husky pre-push)
2. **Après chaque migration** → `npm run post-migrate` (automatique)
3. **Chaque semaine** → Consulter `npm run audit:fk:history`
4. **Avant production** → Valider `npm run audit:fk` = 0 anomalies

---

## 🎯 Priorités

### URGENT (cette semaine)
1. ✅ Vérifier modèles Sequelize
2. ✅ Tester associations ORM/BD
3. ✅ Configurer cron audit:fk

### IMPORTANT (prochaine semaine)
4. ✅ Intégrer dans helper
5. ✅ Écrire README_DATABASE.md
6. ✅ Former équipe sur snapshot approach

### NICE-TO-HAVE (après)
7. ⏳ Dashboard audit FK (web UI)
8. ⏳ Alertes Slack/Email
9. ⏳ Historique audit en BD

---

**Estimation totale**: 5-6 jours  
**ROI**: Zéro anomalie FK, migrations fiables, surveillance continue  
**Prochaine review**: 28 janvier 2026

🚀 Let's go!
