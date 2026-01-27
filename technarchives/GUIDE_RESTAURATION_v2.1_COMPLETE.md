# 🔧 GUIDE DE RESTAURATION - SPOFE v2.1 COMPLÈTE

**Date**: 21 janvier 2026  
**Objectif**: Aligner la base XAMPP à l'architecture SPOFE v2.1 cible  
**Durée estimée**: 10-15 minutes  
**Risque**: ✅ **FAIBLE** (backup automatique généré avant)

---

## 📋 PRÉ-REQUIS

- ✅ XAMPP/MySQL en cours d'exécution
- ✅ Base `spofe_v2_1` créée
- ✅ Node.js + npm installés
- ✅ Dépendances: `npm install`

---

## 🎯 PLAN D'ACTION

### **Phase 1: Diagnostic (5 min)**

```bash
# Analyser l'état actuel
cd cascade
node analyze-db-complete.js
```

**Résultat attendu:**
- ✅ 5 tables trouvées (users, companies, chartsofaccounts, journal_entries, sequelizemeta)
- ❌ 9 tables manquantes (roles, groupes_entreprises, 2fa, etc.)
- ⚠️ Conformité: ~29%

---

### **Phase 2: Préparation (2 min)**

```bash
# Vérifier le fichier SQL de restauration
cat CASCADE_RESTORE_v2.1_COMPLETE.sql | head -50

# Vérifier les modèles disponibles
ls src/models/*.model.js | wc -l
# Doit afficher: 22 (tous les modèles incluant sécurité)
```

---

### **Phase 3: Exécution Restauration (3-5 min)**

#### **Option A: Automatisée (Recommandée)**

```bash
# Mode DRY-RUN (sans risque - affiche les opérations)
node restore-v2.1-complete.js --dry-run

# Exécution réelle (avec confirmation)
node restore-v2.1-complete.js

# Exécution sans confirmation (CI/CD)
node restore-v2.1-complete.js --force
```

#### **Option B: Manuelle (MySQL direct)**

```bash
# Connexion MySQL
mysql -h localhost -u root -p spofe_v2_1

# Charger le script SQL
source CASCADE_RESTORE_v2.1_COMPLETE.sql;

# Vérifier résultat
SHOW TABLES;
SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'spofe_v2_1';
```

#### **Option C: Via Node.js Interactive**

```bash
# Lancer REPL avec Sequelize
node
> import db from './src/config/database.js'
> await db.sync({ force: false })  // Ne pas perdre les données!
> .exit
```

---

### **Phase 4: Vérification Post-Restauration (2-3 min)**

```bash
# ✅ Audit FK complet
npm run audit:fk --verbose

# Résultat attendu:
# ✅ 14 tables validées
# ✅ 22 modèles ORM chargés
# ✅ 0 anomalies détectées
# ✅ 100% conformité
```

```bash
# ✅ Vérifier structure tables
node -e "
import db from './src/config/database.js';
const seq = db.default || db;
const [tables] = await seq.query(\`SHOW TABLES\`);
console.log('Tables:', tables.map(t => Object.values(t)[0]).sort());
await seq.close();
"
```

```bash
# ✅ Tester associations ORM
npm run test:integration -- --grep "associations"
```

---

## 🚨 DÉPANNAGE

### **Problème: "Table already exists"**

✅ **Normal** - Le script détecte et ignore les tables existantes  
→ Continuer, c'est OK

### **Problème: "Foreign key constraint failed"**

❌ **Ordre d'exécution** - Les FK sont créées en mauvais ordre  
→ Solution:
```bash
# Créer groupes_entreprises en premier
mysql -h localhost -u root spofe_v2_1 -e "
  CREATE TABLE IF NOT EXISTS groupes_entreprises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
  );
"

# Puis réexécuter
node restore-v2.1-complete.js --force
```

### **Problème: "Cannot find module: appSetting.model.js"**

❌ **Modèles manquants non créés**  
→ Solution:
```bash
# Vérifier que les modèles existent
ls -la src/models/ | grep -E "(role|group|two|password|token|security|audit|app)"

# S'ils manquent, créer les fichiers selon SPOFE_v2.1_MODELS.sql
# (voir section ci-dessous)
```

### **Problème: Migration échoue après 30 sec**

❌ **Timeout de connexion MySQL**  
→ Solution:
```bash
# Augmenter timeout
export DB_CONNECT_TIMEOUT=60000
node restore-v2.1-complete.js --force

# Ou vérifier XAMPP MySQL status
sudo systemctl status mysql
# Ou dans XAMPP: netstat -tuln | grep 3306
```

---

## 📊 VÉRIFICATION MANUELLE FINALE

Après restauration réussie, vérifier que:

```bash
# 1. Toutes les 14 tables existent
mysql spofe_v2_1 -e "SELECT COUNT(*) as table_count FROM information_schema.TABLES WHERE TABLE_SCHEMA='spofe_v2_1' AND TABLE_NAME NOT IN ('SequelizeMeta');"
# Résultat: 14

# 2. Les colonnes manquantes sont créées
mysql spofe_v2_1 -e "DESC users;" | grep -E "(groupe_id|role_id|deleted_at)"
# Doit afficher 3 lignes

# 3. Les FK sont en place
mysql spofe_v2_1 -e "SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='spofe_v2_1' AND REFERENCED_TABLE_NAME IS NOT NULL;" | wc -l
# Doit afficher: >5 FK

# 4. Les rôles initialisés
mysql spofe_v2_1 -e "SELECT COUNT(*) FROM roles;"
# Résultat: 4 (admin, comptable, user, viewer)

# 5. Groupe par défaut créé
mysql spofe_v2_1 -e "SELECT COUNT(*) FROM groupes_entreprises;"
# Résultat: ≥1
```

---

## ✅ CHECKLIST DE SUCCÈS

- [ ] Script SQL exécuté sans erreur fatale
- [ ] 14 tables présentes dans la base
- [ ] Toutes les colonnes manquantes créées
- [ ] Toutes les FK établies (22+)
- [ ] Audit FK retourne **0 anomalies**
- [ ] ORM charge tous les modèles (22)
- [ ] Rôles initialisés dans DB
- [ ] Groupe d'entreprises créé
- [ ] Tests d'association passent ✅
- [ ] Application démarre: `npm run dev` ✅

---

## 📚 FICHIERS GÉNÉRÉS LORS DE LA RESTAURATION

```
cascade/
├── CASCADE_RESTORE_v2.1_COMPLETE.sql          ← Script SQL principal
├── restore-v2.1-complete.js                    ← Script automatisé
├── logs/
│   └── backups/
│       └── restore/
│           ├── restore_TIMESTAMP.log           ← Logs d'exécution
│           └── backup_before_restore_*.sql    ← Sauvegarde avant (préalable)
├── src/
│   └── models/
│       ├── role.model.js                       ← Modèles SPOFE v2.1 ajoutés
│       ├── groupeEntreprise.model.js
│       ├── twoFactorAuth.model.js
│       ├── passwordResetToken.model.js
│       ├── tokenBlacklist.model.js
│       ├── securityEvent.model.js
│       ├── auditTrail.model.js
│       ├── appSetting.model.js
│       └── index.js                            ← Mis à jour (imports ajoutés)
└── ...
```

---

## 🎯 PROCHAINES ÉTAPES

Après une restauration réussie:

### 1. **Valider Intégrité FK** (5 min)
```bash
npm run audit:fk --verbose
```

### 2. **Exécuter Tests** (5 min)
```bash
npm test
npm run test:integration
```

### 3. **Lancer Application** (2 min)
```bash
npm run dev
# → API disponible sur http://localhost:3001
```

### 4. **Tester Endpoints Critiques** (5 min)
```bash
# Test authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Test journaux comptables
curl -X GET http://localhost:3001/api/entries \
  -H "Authorization: Bearer TOKEN"
```

### 5. **Commit Git** (2 min)
```bash
git add -A
git commit -m "🔧 SPOFE v2.1: Restauration complète architecture BD

- Créé 9 nouvelles tables (roles, groupes_entreprises, 2FA, etc.)
- Migré données (companies → compagnies, chartsofaccounts → charts_of_accounts)
- Ajouté colonnes manquantes (groupe_id, role_id, deleted_at, user_id)
- Établi 22+ contraintes FK
- Mis à jour ORM Sequelize (imports + associations)
- Conformité: 100% (audit:fk = 0 anomalies)

Fixes: #v2.1-migration"
```

---

## 🆘 SUPPORT

Si vous rencontrez une erreur:

1. **Vérifier les logs**:
   ```bash
   cat logs/backups/restore/restore_*.log | tail -50
   ```

2. **Revenir à l'état avant** (rollback):
   ```bash
   # Restaurer depuis backup généré
   mysql spofe_v2_1 < logs/backups/restore/backup_before_restore_*.sql
   ```

3. **Réinitialiser la base complètement** (dernière option):
   ```bash
   # ⚠️ ATTENTION: Perte de données!
   mysql -e "DROP DATABASE spofe_v2_1; CREATE DATABASE spofe_v2_1;"
   npm run migrate:up  # (si script disponible)
   ```

---

**Généré par**: SPOFE Deployment System  
**Version**: v2.1 - 21 janvier 2026  
**Statut**: ✅ Production-Ready
