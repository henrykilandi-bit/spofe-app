# Documentation Complète - Correction des Violations de Schéma SILC v1.0

**Version**: 1.0  
**Date**: 27 janvier 2026  
**Status**: 🎯 Guide d'exécution progressif  
**Mode**: Non-destructif, Testé, Avec Rollback Plans

---

## 📑 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prerequis](#prerequis)
3. [Configuration Environnement](#configuration-environnement)
4. [Procédures par Priorité](#procédures-par-priorité)
5. [Scripts de Migration](#scripts-de-migration)
6. [Validation & Tests](#validation--tests)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Plans](#rollback-plans)

---

## Vue d'ensemble

### Les 7 violations critiques

| Priorité | Type | Détail | Tables | Impact |
|----------|------|--------|--------|--------|
| 🔴 P1 | PRIMARY KEY Missing | 5 tables sans PK définie | available_consultants + 4 autres | BLOQUANT ORM |
| 🟠 P2 | PRIMARY KEY Malformée | 2 tables avec PK ≠ "id" | firm_consultants, sequelizemeta | Convention SILC |
| 🟡 P3 | Timestamps Manquants | 12 tables sans audit trail | Various | Audit trail incomplet |

### Timeline recommandée

```
Semaine 1:
  - Jour 1-2: Audit complet (script audit-data-integrity.js)
  - Jour 3: Backup complet + team sign-off
  - Jour 4-5: Exécution P1 (ajouter PKs)

Semaine 2:
  - Jour 1-2: Validation P1 + tests
  - Jour 3-4: Exécution P2 (renommer PKs)
  - Jour 5: Validation P2 + update models Sequelize

Semaine 3:
  - Jour 1-2: Exécution P3 (ajouter timestamps)
  - Jour 3: Validation finale
  - Jour 4-5: Documentation finale + retrospective
```

---

## Prerequis

### Avant de commencer

- [ ] MySQL 8.0+ running (XAMPP ou autre)
- [ ] Database `spofe_v2_1` accessible
- [ ] User MySQL avec permissions ALTER TABLE
- [ ] Node.js v18+ pour scripts
- [ ] Git pour version control
- [ ] Access à ce repo SPOFE-APP VERS 1.0

### Vérification de prerequis

```bash
# Vérifier MySQL connection
mysql -u{user} -p{password} -e "SELECT VERSION();"

# Vérifier base de données
mysql -u{user} -p{password} -e "SHOW DATABASES LIKE 'spofe_v2_1';"

# Vérifier les tables
mysql -u{user} -p{password} spofe_v2_1 -e "SHOW TABLES;" | wc -l

# Vérifier Node.js
node --version  # v18+

# Vérifier .env
cat cascade/.env | grep DB_
```

---

## Configuration Environnement

### 1. Variables `.env` pour tous les environnements

Ajouter à `cascade/.env`:

```bash
# ========================================
# DATABASE VALIDATION & CORRECTION CONFIG
# ========================================

# Mode de validation: audit | fix | strict
# audit = scan only, rapport uniquement
# fix = corrections auto avec log
# strict = audit + bloque déploiement si violations
DB_VALIDATION_MODE=audit

# Verbosité: silent | info | verbose | debug
DB_VALIDATION_LOG_LEVEL=verbose

# Backup automatique avant corrections
DB_AUTO_BACKUP=true
DB_BACKUP_DIR=./backups/database

# Rollback automatique si erreur
DB_AUTO_ROLLBACK_ON_ERROR=true

# Format rapport: json,markdown,csv
DB_VALIDATION_REPORT_FORMAT=json,markdown
DB_VALIDATION_REPORT_DIR=./cascade/contract/reports

# Sécurité
DB_VALIDATION_READONLY=true
DB_REQUIRE_APPROVAL_FOR_CHANGES=true
DB_APPROVAL_TEAM=admin@spofe.local
```

### 2. Variables `.env.production`

```bash
# En production: STRICT mode
DB_VALIDATION_MODE=strict
DB_VALIDATION_LOG_LEVEL=info
DB_AUTO_BACKUP=true
DB_AUTO_ROLLBACK_ON_ERROR=true
DB_REQUIRE_APPROVAL_FOR_CHANGES=true
```

### 3. Variables `.env.test`

```bash
# En test: audit seul
DB_VALIDATION_MODE=audit
DB_VALIDATION_LOG_LEVEL=debug
DB_AUTO_BACKUP=false
```

### 4. Vérifier configuration

```bash
cd cascade
node -e "require('dotenv').config(); console.log({
  mode: process.env.DB_VALIDATION_MODE,
  level: process.env.DB_VALIDATION_LOG_LEVEL,
  backup: process.env.DB_AUTO_BACKUP,
  readonly: process.env.DB_VALIDATION_READONLY
})"
```

---

## Procédures par Priorité

### PRIORITÉ 1: Ajouter PRIMARY KEY Manquantes

**Tables**: 5  
**Durée estimée**: 30 minutes  
**Risque**: 🟡 Moyen (NULL/Duplicatas possibles)  
**Impact**: 🔴 BLOQUANT - ORM dépend de PKs

#### Étape 1: Audit pré-exécution

```bash
# Générer rapport d'intégrité
npm run audit:db-integrity

# Vérifier le rapport
cat cascade/contract/reports/data-integrity-audit.json
```

**Vérifier que tous les checks sont ✅ PASS**

#### Étape 2: Backup

```bash
# Full backup
mysqldump -u{USER} -p{PASSWORD} spofe_v2_1 > backups/backup-before-p1-$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backups/backup-before-p1-*.sql
wc -l backups/backup-before-p1-*.sql
```

**Vérifier que le backup est > 10MB (données complètes)**

#### Étape 3: Exécuter migration P1

```bash
# Option A: Via Node script (RECOMMANDÉ - avec log et rollback auto)
node cascade/scripts/execute-migration.mjs --file=migrations/01-add-missing-pks.sql --verify --auto-rollback

# Option B: Via MySQL CLI (plus rapide, moins sûr)
mysql -u{USER} -p{PASSWORD} spofe_v2_1 < cascade/migrations/01-add-missing-pks.sql
```

#### Étape 4: Valider succès

```bash
# Vérifier que les PKs existent
mysql -u{USER} -p{PASSWORD} spofe_v2_1 -e \
  "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_NAME IN ('available_consultants', 'compagnies_permissions_backup', 'consultant_firm_assignments_backup', 'consultant_group_summaries', 'consultant_group_summary_backup')
   AND INDEX_NAME = 'PRIMARY';"

# Vérifier le count de lignes
mysql -u{USER} -p{PASSWORD} spofe_v2_1 -e \
  "SELECT 'available_consultants' as tbl, COUNT(*) as cnt FROM available_consultants
   UNION
   SELECT 'compagnies_permissions_backup', COUNT(*) FROM compagnies_permissions_backup
   UNION
   SELECT 'consultant_firm_assignments_backup', COUNT(*) FROM consultant_firm_assignments_backup
   UNION
   SELECT 'consultant_group_summaries', COUNT(*) FROM consultant_group_summaries
   UNION
   SELECT 'consultant_group_summary_backup', COUNT(*) FROM consultant_group_summary_backup;"
```

**Exemple résultat attendu:**
```
| TABLE_NAME                          | COUNT(*) |
|-------------------------------------|----------|
| available_consultants               |       50 |
| compagnies_permissions_backup       |       10 |
| consultant_firm_assignments_backup  |       25 |
| consultant_group_summaries          |       30 |
| consultant_group_summary_backup     |       15 |
```

#### Étape 5: Tester l'application

```bash
# Restart backend
npm run dev

# Tester une requête ORM (ex: chercher un consultant)
curl -X GET http://localhost:3001/api/consultants/1 \
  -H "Authorization: Bearer {TOKEN}"

# Vérifier les logs
tail -f cascade/logs/combined.log | grep -i "primary"
```

#### ✅ Étape 6: Sign-off P1

```
✅ Checklist P1:
  [ ] Audit script passed
  [ ] Backup pris (vérifié)
  [ ] Migration exécutée sans erreur
  [ ] 5 tables ont maintenant une PK
  [ ] Counts de lignes identiques avant/après
  [ ] Application démarre sans erreur
  [ ] Tests ORM passent
```

---

### PRIORITÉ 2: Renommer PRIMARY KEY Mal Nommées

**Tables**: 2 (firm_consultants, sequelizemeta)  
**Durée estimée**: 45 minutes  
**Risque**: 🟠 Élevé (FK dépendances possibles)  
**Impact**: 🟠 Convention - Sequelize espère "id"

#### ⚠️ Important: Foreign Keys Audit

```bash
# Vérifier les FKs dépendantes
mysql -u{USER} -p{PASSWORD} spofe_v2_1 -e \
  "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE REFERENCED_TABLE_NAME IN ('firm_consultants', 'sequelizemeta');"
```

**Si des FKs existent**, créer plan de mise à jour avant de renommer!

#### Étape 1: Backup complet

```bash
mysqldump -u{USER} -p{PASSWORD} spofe_v2_1 > backups/backup-before-p2-$(date +%Y%m%d_%H%M%S).sql
```

#### Étape 2: Exécuter migration P2

```bash
# firm_consultants: consultant_id → id
mysql -u{USER} -p{PASSWORD} spofe_v2_1 << 'EOF'
-- Étape 1: Ajouter colonne id
ALTER TABLE firm_consultants 
ADD COLUMN id INT NOT NULL UNIQUE AFTER consultant_id;

-- Étape 2: Remplir id
UPDATE firm_consultants SET id = consultant_id;

-- Étape 3: Changer la PK
ALTER TABLE firm_consultants DROP PRIMARY KEY;
ALTER TABLE firm_consultants ADD PRIMARY KEY (id);

-- Étape 4: Garder consultant_id comme unique (compat)
ALTER TABLE firm_consultants ADD UNIQUE KEY uk_consultant_id (consultant_id);

-- Vérifier
SHOW CREATE TABLE firm_consultants;
EOF
```

#### Étape 3: Mettre à jour Sequelize model

**Fichier**: `cascade/src/models/firm-consultants.model.js`

```javascript
// AVANT:
FirmConsultant.init({
  consultant_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  // ... other fields
}, { ... })

// APRÈS:
FirmConsultant.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  consultant_id: { 
    type: DataTypes.INTEGER, 
    unique: true,  // Garder pour compatibilité
    allowNull: false
  },
  // ... other fields
}, { ... })
```

#### Étape 4: Valider & Tester

```bash
# Vérifier la structure
mysql -u{USER} -p{PASSWORD} spofe_v2_1 -e \
  "SHOW CREATE TABLE firm_consultants\G"

# Tester l'ORM
npm run dev

# Test requête
curl -X GET http://localhost:3001/api/firm-consultants \
  -H "Authorization: Bearer {TOKEN}"

# Check logs pour erreurs d'ORM
grep -i "error\|constraint" cascade/logs/combined.log
```

#### ✅ Étape 5: Sign-off P2

```
✅ Checklist P2:
  [ ] FK audit complété
  [ ] Backup pris
  [ ] Migration exécutée (firm_consultants)
  [ ] Migration exécutée (sequelizemeta)
  [ ] Sequelize models mis à jour
  [ ] Application démarre
  [ ] Tests ORM passent
  [ ] Pas d'erreur FK dans logs
```

---

### PRIORITÉ 3: Ajouter Timestamps Manquants

**Tables**: 12  
**Durée estimée**: 20 minutes  
**Risque**: 🟢 Bas (colonnes non-liées)  
**Impact**: 🟡 Audit trail - Traçabilité

#### Étape 1: Backup complet

```bash
mysqldump -u{USER} -p{PASSWORD} spofe_v2_1 > backups/backup-before-p3-$(date +%Y%m%d_%H%M%S).sql
```

#### Étape 2: Exécuter migration P3

```bash
mysql -u{USER} -p{PASSWORD} spofe_v2_1 < cascade/migrations/03-add-timestamps.sql
```

#### Étape 3: Créer indexes (perf)

```bash
mysql -u{USER} -p{PASSWORD} spofe_v2_1 << 'EOF'
-- Voir: cascade/migrations/04-add-timestamp-indexes.sql
CREATE INDEX idx_approval_logs_created_at ON approval_audit_logs(created_at);
CREATE INDEX idx_available_consultants_created_at ON available_consultants(created_at);
-- ... (voir fichier migration complet)
EOF
```

#### Étape 4: Valider

```bash
# Vérifier que tous les timestamps existent
mysql -u{USER} -p{PASSWORD} spofe_v2_1 -e \
  "SELECT TABLE_NAME, GROUP_CONCAT(COLUMN_NAME) as timestamp_columns
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME IN ('approval_audit_logs', 'available_consultants', 'company_permissions', 
                        'consultant_group_summaries', 'firm_consultants', 'login_audit_trails', 
                        'remember_tokens', 'groupe_super_users')
   AND COLUMN_NAME IN ('created_at', 'updated_at', 'deleted_at')
   GROUP BY TABLE_NAME;"
```

#### Étape 5: Mettre à jour Sequelize models

Ajouter `timestamps: true` dans la config de chaque model:

```javascript
// Exemple pour ApprovalAuditLog
ApprovalAuditLog.init({
  // ... fields ...
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
  // Pour soft deletes (groupe_super_users seulement):
  // deletedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  modelName: 'ApprovalAuditLog',
  tableName: 'approval_audit_logs',
  underscored: true,
  timestamps: true,  // ⭐ IMPORTANT
  paranoid: false,   // true = enable soft deletes
})
```

#### Étape 6: Test complet

```bash
# Restart app
npm run dev

# Test: créer une nouvelle entité (vérifier created_at)
curl -X POST http://localhost:3001/api/consultants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"name":"Test Consultant"}'

# Vérifier dans BD que created_at est remplie
mysql -u{USER} -p{PASSWORD} spofe_v2_1 -e \
  "SELECT id, name, created_at, updated_at FROM available_consultants ORDER BY created_at DESC LIMIT 1;"
```

#### ✅ Étape 7: Sign-off P3

```
✅ Checklist P3:
  [ ] Backup pris
  [ ] Migration exécutée
  [ ] Indexes créés
  [ ] 12 tables ont timestamps
  [ ] Sequelize models mis à jour
  [ ] Tests timestamping passent
  [ ] created_at/updated_at remplis automatiquement
```

---

## Scripts de Migration

### Script d'exécution automatisé

Créer `cascade/scripts/execute-migration.mjs`:

```javascript
#!/usr/bin/env node
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const args = process.argv.slice(2);
const filePath = args.find(a => a.startsWith('--file='))?.split('=')[1];
const verify = args.includes('--verify');
const autoRollback = args.includes('--auto-rollback');

if (!filePath) {
  console.error('Usage: node execute-migration.mjs --file=path/to/migration.sql [--verify] [--auto-rollback]');
  process.exit(1);
}

async function executeMigration() {
  const sqlContent = await fs.readFile(filePath, 'utf-8');
  const connection = await mysql.createConnection({...});
  
  try {
    console.log(`Exécution: ${filePath}`);
    const statements = sqlContent.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim() && !statement.trim().startsWith('--')) {
        console.log(`→ ${statement.substring(0, 60)}...`);
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Migration succès');
    if (verify) {
      console.log('Vérification...');
      // Exécuter les queries de vérification
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (autoRollback) {
      console.log('Rollback automatique...');
      // Exécuter rollback script
    }
    process.exit(1);
  } finally {
    await connection.end();
  }
}

executeMigration();
```

---

## Validation & Tests

### Après chaque phase

```bash
# 1. Validation SILC
npm run validate:db

# 2. Tests unitaires
npm run test

# 3. Tests intégration
npm run test:integration

# 4. Lint code
npm run lint

# 5. Vérifier models Sequelize
npm run test:models
```

### Résultats attendus

**Phase 1 completée:**
```
✅ 5 tables ont PRIMARY KEY
❌ 2 tables toujours avec PK mal nommées (P2 à faire)
❌ 12 tables toujours sans timestamps (P3 à faire)
Score SILC: 60% → 70%
```

**Phase 2 completée:**
```
✅ 5 tables avec PKs
✅ 2 tables avec PK = "id"
❌ 12 tables toujours sans timestamps (P3 à faire)
Score SILC: 70% → 80%
```

**Phase 3 completée:**
```
✅ Toutes les violations résolues
✅ 35 tables conformes SILC v1.0
❌ 0 violations restantes
Score SILC: 80% → 100%
```

---

## Troubleshooting

### Problème: "Table already exists"

```bash
# Vérifier que la colonne/index n'existe pas déjà
DESC table_name;

# Si elle existe, commenter ou skip dans le script
# Puis relancer
```

### Problème: "Cannot add or update a child row"

```bash
# FK constraint violation
# Vérifier les FKs pointant vers la table

SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'your_table';

# Désactiver temporairement les constraints:
SET FOREIGN_KEY_CHECKS=0;
-- exécuter migration
SET FOREIGN_KEY_CHECKS=1;
```

### Problème: "Duplicate key on update"

```bash
# Il y a des duplicatas
SELECT id, COUNT(*) FROM table_name GROUP BY id HAVING COUNT(*) > 1;

# Résoudre les duplicatas:
-- Garder le premier, supprimer les autres
DELETE FROM table_name WHERE id IN (
  SELECT id FROM (
    SELECT id FROM table_name 
    GROUP BY id HAVING COUNT(*) > 1
  ) t
) AND id NOT IN (
  SELECT MIN(id) FROM table_name GROUP BY id
);
```

---

## Rollback Plans

### Rollback P1: Supprimer les PKs ajoutées

```bash
# À partir du backup
mysql -u{USER} -p{PASSWORD} spofe_v2_1 < backups/backup-before-p1-{timestamp}.sql
```

### Rollback P2: Renommer PKs revenir

```bash
# Inverse les renommages
mysql -u{USER} -p{PASSWORD} spofe_v2_1 << 'EOF'
ALTER TABLE firm_consultants DROP PRIMARY KEY, DROP KEY uk_consultant_id;
ALTER TABLE firm_consultants ADD PRIMARY KEY (consultant_id);
ALTER TABLE firm_consultants DROP COLUMN id;

-- Revenir les models Sequelize
EOF
```

### Rollback complet: Full restore

```bash
# Restore from backup
mysql -u{USER} -p{PASSWORD} < backups/backup-before-p1-{timestamp}.sql

# Vérifier
npm run validate:db

# Redémarrer app
npm run dev
```

---

## Monitoring Post-Migration

### Dashboard de vérification

Créer `cascade/scripts/post-migration-check.mjs`:

```javascript
// Vérifier:
// 1. Intégrité PKs
// 2. Validité timestamps
// 3. Compatibilité ORM
// 4. Performance queries
// 5. Logs d'erreur
```

### Commandes de monitoring

```bash
# Vérifier la conformité
npm run contract:check

# Afficher rapport
cat cascade/contract/reports/database-validation.md

# Tester performance
npm run perf:test

# Watch logs
tail -f cascade/logs/error.log
```

---

## Conclusion

Cette documentation fournit un plan complet et non-destructif pour corriger les 7 violations critiques de schéma SILC v1.0.

**Rappel clé**: Chaque phase peut être exécutée indépendamment, avec backup/rollback assurés.

**Support**: En cas de problème, consultez le section Troubleshooting ou créez une issue avec les logs.

**Succès attendu**: 35 tables → 100% conformité SILC v1.0 ✅
