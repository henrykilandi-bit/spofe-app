# Commands Copy-Paste - Correction SILC v1.0

**Copier-coller directement dans le terminal** pour exécuter les corrections

---

## 🔵 ÉTAPE 1: Préparation (Jour 1)

### Vérifier les prerequis

```bash
# Vérifier MySQL
mysql -u root -p -e "SELECT VERSION();"

# Vérifier BD spofe
mysql -u root -p -e "SHOW DATABASES LIKE 'spofe_v2_1';"

# Vérifier Node.js
node --version

# Vérifier .env
cat cascade/.env | grep DB_
```

### Configurer les 8 variables d'environnement

```bash
# Ajouter à cascade/.env
cat >> cascade/.env << 'EOF'

# ========================================
# DATABASE VALIDATION & CORRECTION CONFIG
# ========================================
DB_VALIDATION_MODE=audit
DB_VALIDATION_LOG_LEVEL=verbose
DB_AUTO_BACKUP=true
DB_BACKUP_DIR=./backups/database
DB_AUTO_ROLLBACK_ON_ERROR=true
DB_VALIDATION_REPORT_FORMAT=json,markdown
DB_VALIDATION_REPORT_DIR=./cascade/contract/reports
DB_VALIDATION_READONLY=true
EOF

# Vérifier la config
cat cascade/.env | grep DB_VALIDATION
```

---

## 🟢 ÉTAPE 2: Audit Intégrité (Jour 2)

### Générer le rapport d'audit

```bash
# Audit complet
npm run audit:db-integrity

# Avec rapport JSON
npm run audit:db-integrity:report

# Vérifier les résultats
cat cascade/contract/reports/data-integrity-audit.json | jq '.summary'
```

**Si TOUS les checks passent (✅ PASS)**, continuer.  
**Si blockers détectés (❌ BLOCKER)**, voir section Troubleshooting.

---

## 🔴 ÉTAPE 3: Backup Complet (Jour 3)

### Créer un backup de sécurité

```bash
# Créer le dossier backups s'il n'existe pas
mkdir -p backups

# Backup complet
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p spofe_v2_1 > backups/backup-before-migrations-$TIMESTAMP.sql

# Vérifier
ls -lh backups/backup-before-migrations-*.sql

# Taille minimale requise: > 5MB
du -h backups/backup-before-migrations-*.sql
```

---

## 🟡 ÉTAPE 4: PHASE 1 - Ajouter PKs Manquantes

### Exécuter Phase 1

```bash
# Méthode 1: Via MySQL CLI (rapide)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp backups/backup-before-migrations-* backups/backup-p1-backup-$TIMESTAMP.sql
mysql -u root -p spofe_v2_1 < cascade/migrations/01-add-missing-pks.sql

# OU Méthode 2: Via Node (avec logs - recommandé)
# node cascade/scripts/execute-migration.mjs --file=cascade/migrations/01-add-missing-pks.sql --verify
```

### Valider Phase 1

```bash
# Vérifier que les 5 PKs existent
mysql -u root -p spofe_v2_1 -e \
  "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_NAME IN ('available_consultants', 'compagnies_permissions_backup', 'consultant_firm_assignments_backup', 'consultant_group_summaries', 'consultant_group_summary_backup')
   AND INDEX_NAME = 'PRIMARY';"

# Vérifier les row counts (doivent être identiques)
mysql -u root -p spofe_v2_1 << 'SQL'
SELECT 'available_consultants' as table_name, COUNT(*) as row_count FROM available_consultants
UNION
SELECT 'compagnies_permissions_backup', COUNT(*) FROM compagnies_permissions_backup
UNION
SELECT 'consultant_firm_assignments_backup', COUNT(*) FROM consultant_firm_assignments_backup
UNION
SELECT 'consultant_group_summaries', COUNT(*) FROM consultant_group_summaries
UNION
SELECT 'consultant_group_summary_backup', COUNT(*) FROM consultant_group_summary_backup;
SQL

# Relancer l'app
npm run dev

# Tester une requête
curl -X GET http://localhost:3001/api/health
```

---

## 🟠 ÉTAPE 5: PHASE 2 - Renommer PKs Mal Nommées

### Exécuter Phase 2

```bash
# Backup avant P2
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p spofe_v2_1 > backups/backup-before-p2-$TIMESTAMP.sql

# Exécuter migration P2
mysql -u root -p spofe_v2_1 < cascade/migrations/02-rename-pks.sql
```

### Mettre à jour Sequelize Models

#### firm_consultants.model.js

```javascript
// AVANT: PK était consultant_id
FirmConsultant.init({
  consultant_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true 
  },
  // ...
})

// APRÈS: PK est maintenant id
FirmConsultant.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  consultant_id: { 
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  // ...
})
```

### Valider Phase 2

```bash
# Vérifier la structure
mysql -u root -p spofe_v2_1 -e "SHOW CREATE TABLE firm_consultants\G"

# Relancer l'app
npm run dev

# Tester ORM
curl -X GET http://localhost:3001/api/firm-consultants \
  -H "Authorization: Bearer YOUR_TOKEN"

# Vérifier logs pour erreurs
grep -i "error" cascade/logs/error.log | tail -10
```

---

## 🔵 ÉTAPE 6: PHASE 3 - Ajouter Timestamps

### Exécuter Phase 3

```bash
# Backup avant P3
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p spofe_v2_1 > backups/backup-before-p3-$TIMESTAMP.sql

# Exécuter migration P3
mysql -u root -p spofe_v2_1 < cascade/migrations/03-add-timestamps.sql
```

### Créer Indexes pour Performance

```bash
# Indexes déjà dans migration P3, mais si besoin Manuel:
mysql -u root -p spofe_v2_1 << 'SQL'
CREATE INDEX idx_approval_logs_created_at ON approval_audit_logs(created_at);
CREATE INDEX idx_available_consultants_created_at ON available_consultants(created_at);
CREATE INDEX idx_groupe_super_users_deleted_at ON groupe_super_users(deleted_at);
-- ... autres indexes selon migration P3
SQL
```

### Mettre à jour Sequelize Models

```javascript
// Ajouter timestamps: true et paranoid si soft delete
ApprovalAuditLog.init({
  // ... fields ...
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  // deletedAt: { type: DataTypes.DATE },  // si soft delete
}, {
  sequelize,
  modelName: 'ApprovalAuditLog',
  tableName: 'approval_audit_logs',
  underscored: true,
  timestamps: true,     // ⭐ IMPORTANT
  paranoid: false,      // false = pas soft delete, true = activate soft delete
})
```

### Valider Phase 3

```bash
# Vérifier que tous les timestamps existent
mysql -u root -p spofe_v2_1 << 'SQL'
SELECT TABLE_NAME, GROUP_CONCAT(COLUMN_NAME) as timestamp_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
  'approval_audit_logs', 'available_consultants', 'company_permissions',
  'consultant_group_summaries', 'firm_consultants', 'login_audit_trails',
  'remember_tokens', 'groupe_super_users'
)
AND COLUMN_NAME IN ('created_at', 'updated_at', 'deleted_at')
GROUP BY TABLE_NAME;
SQL

# Relancer l'app
npm run dev

# Tester: créer une nouvelle entité
curl -X POST http://localhost:3001/api/consultants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Consultant", "email":"test@test.com"}'

# Vérifier que created_at est rempli
mysql -u root -p spofe_v2_1 -e \
  "SELECT id, name, created_at, updated_at FROM available_consultants ORDER BY created_at DESC LIMIT 5;"
```

---

## ✅ ÉTAPE 7: Validation Finale

### Valider toutes les corrections

```bash
# Validation SILC
npm run validate:db

# Tests unitaires
npm run test

# Tests intégration
npm run test:integration

# Linting
npm run lint

# Full check
npm run migrate:verify
```

**Résultat attendu**:
```
✅ No violations detected
✅ All tests pass
✅ 35/35 tables conform to SILC v1.0
```

---

## 🔄 ROLLBACK - Si Quelque Chose Va Mal

### Rollback après Phase 1

```bash
# Restaurer le backup pris avant P1
mysql -u root -p < backups/backup-before-migrations-*.sql

# Vérifier
npm run validate:db
```

### Rollback après Phase 2

```bash
# Restaurer le backup pris avant P2
mysql -u root -p < backups/backup-before-p2-*.sql

# Vérifier
npm run validate:db
```

### Rollback après Phase 3

```bash
# Restaurer le backup pris avant P3
mysql -u root -p < backups/backup-before-p3-*.sql

# Vérifier
npm run validate:db
```

### Full Rollback (Revenir à l'état initial)

```bash
# Restaurer le tout premier backup
mysql -u root -p < backups/backup-before-migrations-{TIMESTAMP}.sql

# Redémarrer l'app
npm run dev

# Vérifier
npm run validate:db
```

---

## 🆘 Troubleshooting - Erreurs Courantes

### Erreur: "Table already has a primary key"

```bash
# Vérifier PK existante
mysql -u root -p spofe_v2_1 -e "DESC table_name;"

# Si elle existe déjà, skip la commande ALTER et continuer
# Ou commentez la ligne dans le .sql et relancez
```

### Erreur: "Foreign key constraint failed"

```bash
# Vérifier les FKs
mysql -u root -p spofe_v2_1 -e \
  "SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE REFERENCED_TABLE_NAME = 'table_name';"

# Solution temporaire: désactiver FK checks
mysql -u root -p spofe_v2_1 << 'SQL'
SET FOREIGN_KEY_CHECKS=0;
-- exécuter migration
SET FOREIGN_KEY_CHECKS=1;
SQL
```

### Erreur: "Duplicate key on update"

```bash
# Vérifier duplicatas
mysql -u root -p spofe_v2_1 << 'SQL'
SELECT id, COUNT(*) as dup_count
FROM table_name
GROUP BY id
HAVING COUNT(*) > 1;
SQL

# Supprimer les duplicatas (garder le premier)
mysql -u root -p spofe_v2_1 << 'SQL'
DELETE FROM table_name
WHERE id IN (SELECT id FROM table_name GROUP BY id HAVING COUNT(*) > 1)
AND id NOT IN (SELECT MIN(id) FROM table_name GROUP BY id);
SQL
```

---

## 📊 Script d'Exécution Automatisé (Optionnel)

### Tout faire en une commande (non-recommandé sans vérif)

```bash
#!/bin/bash
# migration-all.sh

echo "🔍 Audit..."
npm run audit:db-integrity

read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi

echo "💾 Backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p spofe_v2_1 > backups/backup-all-$TIMESTAMP.sql

echo "📋 Phase 1..."
mysql -u root -p spofe_v2_1 < cascade/migrations/01-add-missing-pks.sql

echo "✅ Valider P1..."
npm run validate:db

echo "📋 Phase 2..."
mysql -u root -p spofe_v2_1 < cascade/migrations/02-rename-pks.sql

echo "✅ Valider P2..."
npm run test:integration

echo "📋 Phase 3..."
mysql -u root -p spofe_v2_1 < cascade/migrations/03-add-timestamps.sql

echo "✅ Validation Finale..."
npm run migrate:verify

echo "🎉 Terminé!"
```

---

## 📞 Besoin d'aide?

- 📖 Guide complet: [CASCADE_CORRECTION_PROCEDURES.md](CASCADE_CORRECTION_PROCEDURES.md)
- 📋 Plan stratégique: [cascade/contract/CORRECTION_PLAN_SILC_v1.0.md](cascade/contract/CORRECTION_PLAN_SILC_v1.0.md)
- 📊 Résumé: [PLAN_CORRECTION_VIOLATIONS_RESUME.md](PLAN_CORRECTION_VIOLATIONS_RESUME.md)

---

**Bonne chance! 🚀**
