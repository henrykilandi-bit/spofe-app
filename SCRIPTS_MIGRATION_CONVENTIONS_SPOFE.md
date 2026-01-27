# 🔧 SCRIPTS EXÉCUTION - MIGRATION CONVENTIONS SPOFE

## Phase 1: Diagnostic Pré-Migration

### Script 1.1: Vérifier les Doublons
```sql
-- Afficher TOUS les colonnes contenant "groupe" ou "invitation"
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'spofe_v2_1' 
  AND TABLE_NAME = 'users'
  AND (COLUMN_NAME LIKE '%groupe%' OR COLUMN_NAME LIKE '%invitation%')
ORDER BY ORDINAL_POSITION;

-- Résultat attendu:
-- users | groupe_id | int(11)           ✅ GARDER
-- users | groupeId | int(11)           ❌ SUPPRIMER
-- users | invitation_token | varchar   ✅ GARDER
-- users | invitationToken | varchar    ❌ SUPPRIMER
```

### Script 1.2: Vérifier les Tables Dupliquées
```sql
-- Lister toutes les tables contenant "compan" ou "compagn"
SELECT TABLE_NAME, TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'spofe_v2_1'
  AND TABLE_NAME LIKE '%compan%'
ORDER BY TABLE_NAME;

-- Résultat attendu:
-- companies            ← À supprimer
-- compagnies           ← À garder
-- compagnie_permissions ← À vérifier
```

### Script 1.3: Vérifier Données dans Doublons
```sql
-- Vérifier si les colonnes camelCase contiennent de la data
SELECT COUNT(*) as count_avec_groupeId
FROM users 
WHERE groupeId IS NOT NULL;

SELECT COUNT(*) as count_avec_invitationToken
FROM users 
WHERE invitationToken IS NOT NULL;

-- Si count > 0, migrer les données d'abord!
```

---

## Phase 1a: Nettoyage - SCRIPT COMPLET

### ⚠️ AVANT D'EXÉCUTER:
1. Faire un backup: `mysqldump spofe_v2_1 > backup_$(date +%Y%m%d).sql`
2. Vérifier que les colonnes camelCase sont vides (script 1.3 ci-dessus)
3. Arrêter tous les services Node.js

### EXÉCUTION:

```sql
-- ============================================
-- ÉTAPE 1: SAUVEGARDE DONNÉES SI NÉCESSAIRE
-- ============================================

-- Si groupeId ou invitationToken contiennent de la data:
UPDATE users SET groupe_id = groupeId WHERE groupeId IS NOT NULL AND groupe_id IS NULL;
UPDATE users SET invitation_token = invitationToken WHERE invitationToken IS NOT NULL AND invitation_token IS NULL;


-- ============================================
-- ÉTAPE 2: SUPPRIMER DOUBLONS CAMELCASE
-- ============================================

-- Avant de supprimer, vérifier que c'est sûr:
SHOW CREATE TABLE users\G  -- Vérifier les index et FK

-- Supprimer les colonnes
ALTER TABLE users DROP COLUMN groupeId;
ALTER TABLE users DROP COLUMN invitationToken;

-- Vérifier:
DESCRIBE users;
-- groupeId et invitationToken ne doivent PLUS apparaître


-- ============================================
-- ÉTAPE 3: SUPPRIMER TABLE DUPLIQUÉE companies
-- ============================================

-- D'abord, vérifier qu'elle est vide ou que les données ont été migrées
SELECT COUNT(*) FROM companies;

-- Si elle a de la data et que c'est différent de compagnies:
-- INSERT INTO compagnies (...) SELECT ... FROM companies;

-- Supprimer la table
DROP TABLE IF EXISTS companies;

-- Vérifier:
SHOW TABLES LIKE '%compan%';
-- Seulement compagnies et compagnie_permissions doivent rester


-- ============================================
-- ÉTAPE 4: VÉRIFIER INTÉGRITÉ
-- ============================================

-- Vérifier la structure finale de users
DESCRIBE users;

-- Vérifier les clés étrangères
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'spofe_v2_1' AND TABLE_NAME = 'users';

-- Vérifier les données
SELECT COUNT(*) FROM users;
SELECT * FROM users LIMIT 1\G
```

### Temps estimé: **15-20 minutes**

---

## Phase 2: Renommage Table `users` → `compagnies_utilisateurs`

### ⚠️ AVANT D'EXÉCUTER:
1. Backup complet: `mysqldump spofe_v2_1 > backup_before_rename_$(date).sql`
2. Arrêter le serveur backend
3. Arrêter le serveur frontend
4. Avoir le code modifié prêt à déployer

### EXÉCUTION:

```sql
-- ============================================
-- ÉTAPE 1: RENOMMER LA TABLE
-- ============================================

RENAME TABLE users TO compagnies_utilisateurs;

-- Vérifier:
SHOW TABLES LIKE '%util%';
-- compagnies_utilisateurs doit apparaître


-- ============================================
-- ÉTAPE 2: VÉRIFIER INTÉGRITÉ
-- ============================================

-- Vérifier structure
DESCRIBE compagnies_utilisateurs;

-- Vérifier les clés étrangères
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'spofe_v2_1' AND TABLE_NAME = 'compagnies_utilisateurs';

-- Compter les enregistrements
SELECT COUNT(*) FROM compagnies_utilisateurs;


-- ============================================
-- ÉTAPE 3: VÉRIFIER DÉPENDANCES
-- ============================================

-- Chercher toutes les FK qui pointent vers users
-- (Elles pourraient ne pas être à jour automatiquement)
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'spofe_v2_1' 
  AND REFERENCED_TABLE_NAME = 'users';
-- Résultat attendu: AUCUNE (les FK doivent pointer à compagnies_utilisateurs maintenant)

-- Chercher les FK dans compagnies_utilisateurs
SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'spofe_v2_1'
  AND (TABLE_NAME = 'compagnies_utilisateurs' OR REFERENCED_TABLE_NAME = 'compagnies_utilisateurs');
```

### Temps estimé: **5 minutes (exécution SQL)** + **1-2 heures (tests)**

---

## Phase 2b: Mise à Jour Code (Après Renommage Table)

### Fichier 1: `cascade/src/models/user.model.js`

**Ligne à ajouter après le Joi.object({:**

```javascript
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // ... reste des colonnes ...
}, {
    tableName: 'compagnies_utilisateurs',    // ← AJOUTER CETTE LIGNE!
    timestamps: true,
    underscored: true,
    paranoid: true
});
```

**Location précise**: Après la fermeture de tous les champs (avant la } finale)

### Fichier 2: `cascade/src/models/associations.js`

**À vérifier**: Aucun changement requis si associations utilisent l'objet User

### Fichier 3: Tous les contrôleurs

Pas de modification requise si vous utilisez le modèle User. Les appels comme:
```javascript
User.findOne({ where: { email } })
User.create({ username, email, password })
```
Continueront de fonctionner normalement.

### Validations Frontend:

**cascade/src/validators/auth.validator.js** - Pas de changement requis

---

## Phase 3: Traduction Colonnes

### Optionnel: Traduire `experience_years` → `annees_experience`

```sql
-- ============================================
-- ÉTAPE 1: AJOUTER NOUVELLE COLONNE
-- ============================================

ALTER TABLE compagnies_utilisateurs
ADD COLUMN annees_experience INT NULL
AFTER experience_years;

-- Vérifier:
DESCRIBE compagnies_utilisateurs;


-- ============================================
-- ÉTAPE 2: MIGRER DONNÉES
-- ============================================

UPDATE compagnies_utilisateurs
SET annees_experience = experience_years
WHERE experience_years IS NOT NULL;

-- Vérifier:
SELECT COUNT(*) FROM compagnies_utilisateurs WHERE annees_experience IS NOT NULL;


-- ============================================
-- ÉTAPE 3: SUPPRIMER ANCIENNE COLONNE
-- ============================================

-- Vérifier d'abord qu'aucun code ne l'utilise
-- grep -r "experience_years" cascade/src/

ALTER TABLE compagnies_utilisateurs
DROP COLUMN experience_years;

-- Vérifier:
DESCRIBE compagnies_utilisateurs;
-- experience_years ne doit PLUS apparaître
```

### Temps estimé: **10 minutes**

---

## Phase 5: Tests Post-Migration

### Test 1: Vérifier Structure BD

```bash
# PowerShell - Exécuter depuis workspace root

@"
-- Vérifier table existe
SHOW TABLES WHERE Tables_in_spofe_v2_1 = 'compagnies_utilisateurs';

-- Vérifier colonnes
SHOW COLUMNS FROM compagnies_utilisateurs;

-- Vérifier données
SELECT COUNT(*) as total_users FROM compagnies_utilisateurs;

-- Vérifier FK
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'compagnies_utilisateurs';
"@ | & "C:\xampp\mysql\bin\mysql.exe" -u root spofe_v2_1
```

### Test 2: Redémarrer Backend et Tester Endpoint

```bash
# Terminal 1: Démarrer le backend
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\cascade"
npm run dev

# Terminal 2: Tester l'endpoint register
$payload = @{
    username = "testuser_$(Get-Random)"
    email = "test_$(Get-Random)@spofe.test"
    password = "SecurePass123!@"
    prenom = "John"
    nom = "Doe"
    telephone = "+33123456789"
    role = "utilisateur"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3001/api/auth/register" `
    -Method POST `
    -Body $payload `
    -ContentType "application/json"
```

### Test 3: Vérifier Logs

```bash
# Vérifier qu'aucune erreur "Unknown table" ou "Unknown column"
Get-Content "cascade/logs/error.log" -Tail 20
```

### Test 4: Login et Vérification Token

```bash
# Test login avec nouvel utilisateur
$credentials = @{
    email = "test_123@spofe.test"
    password = "SecurePass123!@"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Body $credentials `
    -ContentType "application/json"

$response | ConvertTo-Json -Depth 3
```

---

## 🚨 Rollback Plan (Si Problème)

### Rollback Étape 1 (Suppression Doublons)

```sql
-- ⚠️ SI LES DONNÉES N'ONT JAMAIS ÉTÉ MIGRÉES, ELLES SONT PERDUES!

-- Recréer les colonnes (mais elles seront vides)
ALTER TABLE users 
ADD COLUMN groupeId INT NULL,
ADD COLUMN invitationToken VARCHAR(255) NULL;

-- Meilleure option: Restaurer depuis backup
-- mysqldump -u root spofe_v2_1 < backup_YYYYMMDD.sql
```

### Rollback Étape 2 (Renommage Table)

```sql
-- Renommer de nouveau:
RENAME TABLE compagnies_utilisateurs TO users;

-- Puis revert le changement dans user.model.js:
// Supprimer: tableName: 'compagnies_utilisateurs',
```

### Rollback Complet

```bash
# Simplement restaurer le backup:
mysql -u root spofe_v2_1 < backup_before_rename_YYYYMMDD.sql

# Vérifier:
mysql -u root -e "SHOW TABLES FROM spofe_v2_1;" | grep users
```

---

## 📋 Checklist d'Exécution

### Avant Tout
- [ ] Backup local: `mysqldump spofe_v2_1 > backup_$(date +%Y%m%d_%H%M%S).sql`
- [ ] Branche Git: `git checkout -b feature/spofe-conventions`
- [ ] Arrêter serveurs: `npm run stop` ou Ctrl+C

### Phase 1: Nettoyage
- [ ] Exécuter diagnostic (scripts 1.1-1.3)
- [ ] Vérifier aucune données en doublons
- [ ] Exécuter nettoyage SQL
- [ ] Vérifier avec `DESCRIBE users`
- [ ] Commit: `git commit -m "fix(db): remove duplicate camelCase columns groupeId, invitationToken"`

### Phase 2: Renommage
- [ ] Exécuter `RENAME TABLE users TO compagnies_utilisateurs`
- [ ] Modifier `cascade/src/models/user.model.js` (ajouter tableName)
- [ ] Démarrer backend: `npm run dev`
- [ ] Tester 3 endpoints (register, login, /me)
- [ ] Commit: `git commit -m "refactor(db): rename users table to compagnies_utilisateurs"`

### Phase 3: Traduction (Optionnel)
- [ ] Ajouter colonne `annees_experience`
- [ ] Migrer données
- [ ] Supprimer `experience_years`
- [ ] Modifier modèles/contrôleurs si utilisés
- [ ] Commit: `git commit -m "refactor(db): translate experience_years to annees_experience"`

### Phase 4: Tests Complets
- [ ] `npm run test -- auth.controller.test.js`
- [ ] Test inscription complète via UI
- [ ] Test login
- [ ] Vérifier logs: aucun error
- [ ] Commit: `git commit -m "test(all): verify SPOFE conventions compliance"`

### Avant Merge
- [ ] `npm run lint` - 0 errors
- [ ] `npm run test:all` - all pass
- [ ] Code review pair
- [ ] Rollback plan documenté
- [ ] Pull request created

---

## 📊 Timeline Estimée

| Phase | Tâche | Durée | Start | End |
|-------|-------|-------|-------|-----|
| 1 | Diagnostic + Nettoyage | 30 min | J1 08:00 | J1 08:30 |
| 2 | Renommage table | 30 min | J1 08:30 | J1 09:00 |
| 2b | Tests + Fixes | 2 h | J1 09:00 | J1 11:00 |
| 3 | Traduction colonnes | 1 h | J2 08:00 | J2 09:00 |
| 4 | Mise à jour code | 2 h | J2 09:00 | J2 11:00 |
| 5 | Tests complets | 2 h | J2 11:00 | J2 13:00 |
| 5b | Fixes + Validation | 2 h | J2 14:00 | J2 16:00 |
| **Total** | | **~10-11 h** | **J1 08:00** | **J2 16:00** |

---

## 🔗 REFERENCES

- [SPOFE Conventions](./cascade/docs/CONVENTIONS_NOMMAGE_SPOFE_v2.0.md)
- [Field Mapping](./FIELD_MAPPING_REGISTER_TO_DATABASE.md)
- [Audit Complet](./AUDIT_COMPLET_CONVENTIONS_SPOFE.md)

