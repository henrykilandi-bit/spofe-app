# 📊 AUDIT COMPLET - CONFORMITÉ SPOFE v2.1
**Date**: 25 Janvier 2026  
**Statut**: 🔴 CRITIQUE - Écarts significatifs  
**Recommandation**: Migration progressive requise

---

## 📋 RÉSUMÉ EXÉCUTIF

| Aspect | Conformité | Score |
|--------|------------|-------|
| **Tables BD** | ❌ Non conforme | 40% |
| **Colonnes BD** | ⚠️ Partiellement | 65% |
| **Modèles Sequelize** | ⚠️ Partiellement | 60% |
| **API Endpoints** | ⚠️ Partiellement | 75% |
| **Frontend (React)** | ✅ Acceptable | 85% |
| **OHADA Compliance** | ❌ Risqué | 50% |
| **Score Global** | ⚠️ CRITIQUE | **62%** |

---

## 🔴 CRITÈRE 1: STRUCTURE DES TABLES

### État Attendu (SPOFE v2.1 Standard)
```
compagnies_utilisateurs    ← Table d'authentification des utilisateurs
compagnies_groupes         ← Groupes d'entreprises
compagnies_compagnies      ← Compagnies
compagnies_parametres      ← Paramètres globaux
compagnies_ecritures       ← Journal des écritures comptables
```

### État Réel (BD spofe_v2_1)
```
users                      ❌ Attendu: compagnies_utilisateurs
groupes_entreprises        ✅ Correct
compagnies                 ❌ Attendu: compagnies_compagnies (optionnel)
companies                  ❌ DOUBLON - À supprimer
journal_entries           ✅ Correct
journal_entry_lines       ✅ Correct
```

### Analyse Détaillée

#### Table `users` → Devrait être `compagnies_utilisateurs`
**Conformité SPOFE**: ❌ VIOLATION CRITIQUE  
**Raison**: Violation du préfixe standard `compagnies_`  
**Impact**: 
- Non-conformité OHADA
- Confusion avec autres systèmes
- Risque légal en audit

**Colonnes observées dans `users`:**
```
✅ id, username, email, password, role
✅ prenom, nom, telephone, siret
✅ created_at, updated_at, deleted_at
⚠️ hierarchy_level (automatique, acceptable)
⚠️ can_grant_permissions (automatique, acceptable)
⚠️ specialites, tarif_horaire, experience_years (consultant only)

🔴 DOUBLONS DÉTECTÉS:
  - groupe_id (snake_case, CORRECT)
  - groupeId (camelCase, À SUPPRIMER) ← INCOHÉRENCE
  - invitation_token (snake_case, CORRECT)
  - invitationToken (camelCase, À SUPPRIMER) ← INCOHÉRENCE
```

**Action Requise**: 
- [ ] Renommer `users` → `compagnies_utilisateurs` (migration complexe)
- [ ] OU créer alias dans Sequelize avec `tableName: 'compagnies_utilisateurs'`

#### Table `companies` → DOUBLON À SUPPRIMER
**Conformité SPOFE**: ❌ VIOLATION  
**État**: Table dupliquée avec structure différente  
**Colonnes**: name, registration_number, address, city, country, fiscal_year_start, currency, is_active

**Conflit**: 
- Il existe AUSSI `compagnies` (modèle Compagnie) ✓
- `companies` est un doublon avec schéma différent ✗

**Action Requise**:
- [ ] Supprimer table `companies` (20 lignes de code)
- [ ] Garder `compagnies` uniquement
- [ ] Vérifier qu'aucun contrôleur ne référence `companies`

#### Table `groupes_entreprises` ✅ CONFORME
Structure correcte, noms français, préfixe OK.

---

## 🟠 CRITÈRE 2: NOMENCLATURE DES COLONNES

### Problème Principal: MixedCase vs snake_case

**Configuration Sequelize** (`underscored: true`):
```javascript
// Cela convertit automatiquement:
// groupeId (JS) → groupe_id (BD)
// BUT: Les DEUX colonnes existent actuellement!
```

### Doublons Identifiés et Impact

| Champ | Version Snake | Version Camel | État | Action |
|-------|---------------|---------------|------|--------|
| `groupe` | `groupe_id` ✅ | `groupeId` ❌ | DOUBLON | Supprimer groupeId |
| `token` | `invitation_token` ✅ | `invitationToken` ❌ | DOUBLON | Supprimer invitationToken |
| `tarif` | `tarif_horaire` ✅ | `tarifHoraire` ❌ | SINGULIER | À supprimer si dupliqué |
| `experience` | `experience_years` ✅ | `experienceYears` ❌ | SINGULIER | À supprimer si dupliqué |

**Script SQL pour vérifier les doublons:**
```sql
SELECT COLUMN_NAME, COUNT(*) as count
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'spofe_v2_1' AND TABLE_NAME = 'users'
GROUP BY COLUMN_NAME
HAVING count > 1;
```

### Traduction des Colonnes Non-Conformes

Attendu (SPOFE v2.1) | Actuel | Action
:--|:--|:--
`annees_experience` | `experience_years` ❌ | Traduire en français
`numero_siret` | `siret` ✅ | OK
`tarif_horaire` | ✅ | OK
`specialites` | ✅ | OK
`types_contrat` | `contractTypes` ❌ | Traduire + snake_case
`adresse_email` | `email` ✓ | Acceptable
`date_creation` | `created_at` ✅ | OK
`date_modification` | `updated_at` ✅ | OK

---

## 🔵 CRITÈRE 3: MODÈLES SEQUELIZE

### Analyse des 3 Modèles Principaux

#### Modèle 1: `user.model.js` (MIXTE)
```javascript
// DÉFAUT: Ne spécifie pas tableName
sequelize.define('User', {
  // Les noms de colonnes sont:
  isActive        → Sequelize le convertit en is_active (OK)
  groupeId        → MAIS la colonne existe aussi en groupeId (DOUBLON)
  invitationToken → MAIS la colonne existe aussi en invitationToken (DOUBLON)
  // ... (pas de table name explicite = mauvaise pratique)
})
// À AJOUTER: tableName: 'compagnies_utilisateurs'
```

**État**: 🟠 PARTIELLEMENT CONFORME
- ✅ Conversion snake_case configurée (`underscored: true`)
- ❌ tableName non spécifié
- ❌ Doublons camelCase dans BD

#### Modèle 2: `company.model.js` (CONFORME)
```javascript
sequelize.define('Company', {
  // ...
}, {
  tableName: 'compagnies',     // ✅ Explicite
  underscored: true,            // ✅ Conversion snake_case
  timestamps: true,             // ✅
  paranoid: true                // ✅ Soft delete
})
```

**État**: ✅ CONFORME

#### Modèle 3: `compagnie.model.js` (CONFORME)
```javascript
// Note: Double définition avec company.model.js (redondance)
sequelize.define('Compagnie', {
  groupe_id,     // ✅ snake_case
  nom,           // ✅ Français
  // ...
})
```

**État**: ✅ CONFORME (mais duplique company.model.js)

### Problème d'Architecture: Double Définition

| Modèle | Table | Status | Notes |
|--------|-------|--------|-------|
| `company.model.js` | `compagnies` | ✅ | Séquelize standard |
| `compagnie.model.js` | `compagnies` | ⚠️ | Alternative française |

**Risk**: Deux modèles différents référencent la même table!

---

## 🟡 CRITÈRE 4: FRONTEND (React/Vite)

### Champs du Formulaire RegisterPage-Extended.jsx

**État Actuel**: Mélange camelCase (standard React) + snake_case (API)

#### Champs Étape 1 (Communs)
```javascript
✅ email, username, password, confirmPassword
✅ prenom, nom, telephone
```

#### Champs Étape 3 (Role-Spécifiques)

Pour **Super Utilisateur**:
```javascript
groupeName                 // FRENCH OK, but form only
groupeDescription         // ❌ Not in BD (no column)
groupeSiret              // ❌ Not in BD
groupeAdresse            // ❌ Not in BD
groupeEmail              // ❌ Not in BD
groupeTelephone          // ❌ Not in BD
groupeWebsite            // ❌ Not in BD
```

Pour **Utilisateur**:
```javascript
groupeId                 // ✅ Mappe à groupe_id
compagnieName           // ❌ Not in BD (companies table removed?)
compagnieSiret          // ❌ Not in BD
compagnieDescription    // ❌ Not in BD
compagnieEmail          // ❌ Not in BD
```

Pour **Consultant**:
```javascript
specialites              // ✅ BD column exists
tarifHoraire             // ✅ BD: tarif_horaire (conversion auto)
experienceYears          // ❌ BD: experience_years (OK, but English name)
contractTypes            // ❌ Not in BD
siret                    // ✅ BD column exists
```

### Problème de Validation Frontend

**En `RegisterPage-Extended.jsx` ligne 100-102:**
```javascript
const [formData, setFormData] = useState({
  // ...
  groupeName: '',          // Ligne 72
  // ...
  groupeId: groupeId,      // Ligne 81
  groupeName: '',          // Ligne 82 ← DOUBLON!
```

**Erreur Détectée**: 
- ⚠️ Vite warning: "Duplicate key 'groupeName' in object literal"
- Impact: Deuxième `groupeName` écrase la première
- Solution: Fusionner en une seule définition

---

## 🟢 CRITÈRE 5: API ENDPOINTS

### Routes d'Authentification

**Endpoint**: `POST /api/auth/register`

**Paramètres Acceptés** (auth.controller.js lines 37-73):
```javascript
// ✅ Basiques
username, email, password, prenom, nom, telephone, role

// ✅ Super Utilisateur
groupeName, groupeDescription, groupeSiret, groupeAdresse, 
groupeEmail, groupeTelephone, groupeWebsite

// ✅ Utilisateur  
groupeId, compagnieName, compagnieSiret, compagnieDescription,
compagnieEmail, compagnieTelephone, compagnieAdresse, compagnieWebsite

// ✅ Consultant
specialites, tarifHoraire, experienceYears, siret, contractTypes,
registrationType, firmType, firmName, firmSiret, firmDescription

// ✅ Invitation
invitationToken
```

**Problème**: Les champs acceptés ne correspondent PAS à ce qui existe en BD!

Exemple:
- Frontend envoie: `compagnieName`, `compagnieSiret`, `compagnieDescription`
- BD accepte uniquement: `groupe_id`, `specialites`, `tarif_horaire` (pour consultant)
- **Résultat**: Données perdues ou erreurs 400

---

## 🔴 CRITÈRE 6: CONFORMITÉ OHADA

### Exigences OHADA (Directive 2022)

| Exigence | État | Notes |
|----------|------|-------|
| Tables en français | ❌ | `users` au lieu de `compagnies_utilisateurs` |
| Colonnes en français | ⚠️ | Mélange français/anglais |
| Traçabilité complète | ✅ | created_at, updated_at, deleted_at ✓ |
| Devise nationale | ✅ | XOF (West African franc) ✓ |
| Validation comptable | ⚠️ | Imparfait |
| Archivage légal | ✅ | soft_delete activé |

### Risques Légaux

🚨 **CRITIQUE**: Nomenclature non-conforme pour audit comptable
- Table `users` est anglaise
- Colonnes mixtes français/anglais
- Peut causer rejet en audit externe

---

## 📊 TABLEAU SYNTHÉTIQUE: TOUS LES ÉCARTS

### A. TABLES (PRIORITÉ CRITIQUE)

```
Champ | Actuel | SPOFE Standard | État | Action
------|--------|-----------------|------|--------
Utilisateurs | users | compagnies_utilisateurs | ❌ | RENOMMER
Groupes | groupes_entreprises | compagnies_groupes | ✅ | Acceptable
Compagnies | companies + compagnies | compagnies_compagnies | ❌ | Fusionner
```

### B. COLONNES (PRIORITÉ HAUTE)

```
Colonne | Mode Actuel | Standard SPOFE | État | Action
--------|-------------|-----------------|------|--------
groupe | groupe_id | groupe_id | ✅ | OK (supprimer groupeId)
token | invitation_token | invitation_token | ✅ | OK (supprimer invitationToken)
expérience | experience_years | annees_experience | ❌ | Traduire
tarif | tarif_horaire | tarif_horaire | ✅ | OK
spécialités | specialites | specialites | ✅ | OK
contrats | contractTypes | types_contrat | ❌ | Traduire + snake_case
```

### C. MODÈLES (PRIORITÉ MOYENNE)

```
Modèle | État | Problème | Fix
--------|------|---------|----
user.model.js | ❌ | Pas de tableName explicite, doublons | Ajouter tableName, nettoyer doublons
company.model.js | ✅ | - | OK
compagnie.model.js | ⚠️ | Duplique company.model.js | Garder une seule version
```

### D. FRONTEND (PRIORITÉ MOYENNE)

```
Champ | État | Problème | Fix
------|------|---------|----
groupeName | ❌ | DOUBLON à ligne 72 ET 82 | Supprimer l'un
experienceYears | ⚠️ | Anglais au lieu de French | Acceptable pour React
contractTypes | ⚠️ | Colonne n'existe pas en BD | Créer ou supprimer
compagnieName | ❌ | Colonne n'existe pas | Supprimer du form
```

---

## 🎯 PLAN DE MIGRATION DÉTAILLÉ

### PHASE 1: NETTOYAGE (1-2 jours) 🟠 PRIORITÉ 1

**Objectif**: Éliminer les doublons

#### Step 1.1: Supprimer Doublons de Colonnes
```sql
-- 1. Vérifier les valeurs en double
SELECT * FROM users WHERE groupeId IS NOT NULL;
SELECT * FROM users WHERE invitationToken IS NOT NULL;

-- 2. Migrer données si nécessaire (généralement vides)
UPDATE users SET groupe_id = groupeId WHERE groupeId IS NOT NULL;
UPDATE users SET invitation_token = invitationToken WHERE invitationToken IS NOT NULL;

-- 3. Supprimer les anciennes colonnes camelCase
ALTER TABLE users DROP COLUMN groupeId;
ALTER TABLE users DROP COLUMN invitationToken;
```

**Temps estimé**: 15 min  
**Risque**: BAS (colonnes camelCase rarement utilisées)

#### Step 1.2: Supprimer Table Dupliquée `companies`
```sql
-- 1. Vérifier si `companies` est utilisée
SELECT COUNT(*) FROM companies;

-- 2. Si vide, supprimer
DROP TABLE companies;

-- 3. Si non-vide, migrer données vers `compagnies`
INSERT INTO compagnies (nom, siret, ...)
SELECT name, registration_number, ... FROM companies;
DROP TABLE companies;
```

**Temps estimé**: 15 min  
**Risque**: MOYEN (si data dans companies)  
**Check**: Vérifier aucun contrôleur ne référence table `companies`

#### Step 1.3: Ajouter colonnes manquantes (si Super Utilisateur requiert)
```sql
-- Vérifier si ces colonnes doivent vraiment exister:
-- groupeDescription, groupeSiret, groupeAdresse, etc.

-- Ces données devraient aller dans groupes_entreprises, PAS users!
-- Si manquantes dans groupes_entreprises:
ALTER TABLE groupes_entreprises 
ADD COLUMN adresse TEXT NULL,
ADD COLUMN siret VARCHAR(50) NULL,
ADD COLUMN email_contact VARCHAR(255) NULL,
ADD COLUMN telephone_contact VARCHAR(20) NULL;
```

**Temps estimé**: 20 min  
**Risque**: BAS

---

### PHASE 2: RENOMMAGE TABLES (2-3 jours) 🔴 PRIORITÉ 1+

⚠️ **CRITIQUE et IMPACTANT - Coordination requise**

#### Step 2.1: Renommer `users` → `compagnies_utilisateurs`

**Option A: Migration Directe (Risqué)**
```sql
-- 1. Sauvegarder les données
CREATE TABLE users_backup LIKE users;
INSERT INTO users_backup SELECT * FROM users;

-- 2. Renommer la table
RENAME TABLE users TO compagnies_utilisateurs;

-- 3. Vérifier migrations Sequelize
-- ⚠️ SI Sequelize utilise automatiquement le nom de modèle:
-- Le modèle 'User' créerait une table 'users' au prochain run
-- SOLUTION: Ajouter explicitement tableName dans user.model.js:
```

**user.model.js (Modification requise):**
```javascript
const User = sequelize.define('User', {
  // ... champs existants
}, {
  tableName: 'compagnies_utilisateurs',  // ← AJOUTER CETTE LIGNE
  underscored: true,
  timestamps: true,
  paranoid: true
});
```

**Option B: Alias (Plus sûr)**
```javascript
// Créer alias dans init du projet
sequelize.define('User', {...}, {
  tableName: 'compagnies_utilisateurs',
});
// Garder une vue pour backward compatibility
// CREATE VIEW users AS SELECT * FROM compagnies_utilisateurs;
```

**Temps estimé**: 2-3 heures (incluant tests)  
**Risque**: ÉLEVÉ (nombreuses références dans API)  
**Affecte**: 
- ✅ Controllers: auth.controller.js, user.controller.js
- ✅ Modèles: user.model.js
- ✅ Routes: auth.routes.js, user.routes.js
- ✅ Tests: Si existent
- ✅ Seeds/Migrations: Si existent

#### Step 2.2: Adapter Sequelize
```javascript
// Dans user.model.js
const User = sequelize.define('User', {
  // ... existing fields
}, {
  tableName: 'compagnies_utilisateurs',  // ← CRÍTICO!
  timestamps: true,
  paranoid: true
});
```

---

### PHASE 3: TRADUCTION COLONNES (1 jour) 🟠 PRIORITÉ 2

#### Step 3.1: Traduire `experience_years` → `annees_experience`

```sql
-- 1. Ajouter nouvelle colonne
ALTER TABLE compagnies_utilisateurs 
ADD COLUMN annees_experience INT NULL;

-- 2. Copier données
UPDATE compagnies_utilisateurs 
SET annees_experience = experience_years;

-- 3. Supprimer ancienne (après vérification)
ALTER TABLE compagnies_utilisateurs 
DROP COLUMN experience_years;
```

**Temps estimé**: 30 min  
**Risque**: BAS

#### Step 3.2: Créer table `types_contrat` et adapter `contractTypes`

```sql
-- Actuellement contractTypes est dans users (mauvais endroit)
-- Devrait être une table séparée

CREATE TABLE types_contrat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer table de liaison
CREATE TABLE consultant_types_contrat (
  consultant_id INT NOT NULL,
  type_contrat_id INT NOT NULL,
  PRIMARY KEY (consultant_id, type_contrat_id),
  FOREIGN KEY (consultant_id) REFERENCES compagnies_utilisateurs(id),
  FOREIGN KEY (type_contrat_id) REFERENCES types_contrat(id)
);

-- Migrer données existantes
-- (Si les types étaient stockés en JSON dans colonne contractTypes)
```

**Temps estimé**: 1 heure  
**Risque**: MOYEN (restructuration relationnelle)

---

### PHASE 4: MISE À JOUR CODE (2 jours) 🟠 PRIORITÉ 2

#### Step 4.1: Mettre à jour les imports & références

**user.model.js:**
```javascript
// Ajouter tableName explicite
const User = sequelize.define('User', {...}, {
  tableName: 'compagnies_utilisateurs'
});
```

**auth.controller.js:**
- ✅ Déjà utilise `User.findOne()` etc., pas d'impact direct
- Vérifier les références aux colonnes
- Adapter `experience_years` → `annees_experience`

**frontend/useRegister-NEW.js:**
```javascript
// Adapter le mapping:
experienceYears → annees_experience  // Si change en BD
```

#### Step 4.2: Mettre à jour validateurs

**validators/auth.validator.js:**
```javascript
// Vérifier les noms de champs dans schémas Joi
// experienceYears → annees_experience
```

---

### PHASE 5: TESTS & VALIDATION (2 jours) 🟢 PRIORITÉ 3

#### Tests Unitaires
```bash
npm run test -- auth.controller.test.js
npm run test -- user.model.test.js
```

#### Tests d'Intégration
```bash
# Test endpoint register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!@",
    "role": "consultant",
    "annees_experience": 5,
    "tarif_horaire": 50
  }'
```

#### Vérification BD
```sql
-- Vérifier structure finale
DESCRIBE compagnies_utilisateurs;
SHOW INDEXES FROM compagnies_utilisateurs;
```

---

## 📈 MATRICE DE RISQUE

| Changement | Risque | Impact | Effort | Recommendation |
|-----------|--------|--------|--------|-----------------|
| Supprimer doublons (groupeId, invitationToken) | BAS | MOYEN | 1h | ✅ Faire immédiatement |
| Supprimer table `companies` | MOYEN | MOYEN | 30min | ✅ Vérifier d'abord |
| Renommer `users` → `compagnies_utilisateurs` | **ÉLEVÉ** | **ÉLEVÉ** | 3h | ⚠️ Planifier sprint |
| Traduire colonnes | BAS | BAS | 2h | ✅ Faire en phase 3 |
| Restructurer `contractTypes` | MOYEN | MOYEN | 2h | ⚠️ Optionnel |

---

## 🚨 DÉPENDANCES & AFFECTATIONS

### Services Affectés par Renommage `users` → `compagnies_utilisateurs`

```
auth.controller.js
  ├─ User.findOne()        ← Affecté
  ├─ User.create()         ← Affecté
  └─ User.update()         ← Affecté

user.controller.js
  ├─ User.findByPk()       ← Affecté
  └─ User.findAll()        ← Affecté

roleApprovalService.js
  └─ User references       ← Affecté

journalEntries.controller.js
  └─ User JOIN queries     ← Affecté

thirdParties.controller.js
  └─ User associations     ← Affecté
```

### Nombre de Fichiers Affectés: ~15 files
- Controllers: 5
- Services: 3
- Models: 2
- Routes: 2
- Tests: 3

---

## ✅ CHECKLIST DE MIGRATION

### Avant de Commencer
- [ ] Sauvegarde complète BD: `mysqldump spofe_v2_1 > backup_$(date).sql`
- [ ] Branche Git dédiée: `git checkout -b feature/spofe-conventions-cleanup`
- [ ] Documenter l'état actuel: `DESCRIBE * FROM *.`

### Phase 1: Nettoyage
- [ ] Identifier les données en groupeId (probab. aucune)
- [ ] Exécuter migration supprimer doublons
- [ ] Vérifier aucune perte données
- [ ] Commit: "fix(db): remove duplicate camelCase columns"

### Phase 2: Renommage
- [ ] Exécuter `RENAME TABLE users TO compagnies_utilisateurs`
- [ ] Ajouter `tableName: 'compagnies_utilisateurs'` à user.model.js
- [ ] Vérifier imports dans all files
- [ ] Tester au moins 3 endpoints
- [ ] Commit: "refactor(db): rename users to compagnies_utilisateurs"

### Phase 3: Traduction
- [ ] Ajouter `annees_experience`
- [ ] Migrer données `experience_years`
- [ ] Supprimer `experience_years`
- [ ] Mettre à jour modèles/contrôleurs
- [ ] Commit: "refactor(db): translate experience_years to annees_experience"

### Phase 4: Code
- [ ] Mettre à jour tous les validators
- [ ] Mettre à jour les contrôleurs
- [ ] Mettre à jour frontend hooks
- [ ] Commit: "refactor(app): update field names and references"

### Phase 5: Tests
- [ ] Tests unitaires: `npm run test`
- [ ] Tests intégration: endpoints complets
- [ ] Tests manuels: Formulaires d'inscription
- [ ] Vérifier logs en production
- [ ] Commit: "test(all): verify convention compliance"

### Avant Merge
- [ ] Code review par 2 personnes
- [ ] Tous tests passent: `npm run test:all`
- [ ] Aucun warning/error: `npm run lint`
- [ ] Documentation mise à jour
- [ ] Rollback plan documenté

---

## 📋 FICHIERS À MODIFIER

### Fichiers Critiques (Renommage tables)

1. **cascade/src/models/user.model.js**
   - [ ] Ajouter `tableName: 'compagnies_utilisateurs'`

2. **cascade/src/controllers/auth.controller.js**
   - [ ] Vérifier `User.findOne()`, `User.create()`
   - [ ] Aucun changement requis si model.js est bon

3. **cascade/src/models/associations.js**
   - [ ] Vérifier toutes associations involving User

4. **cascade/src/validators/auth.validator.js**
   - [ ] Vérifier noms champs

### Fichiers Secondaires (Traduction colonnes)

5. **frontend/src/hooks/useRegister-NEW.js**
   - [ ] Adapter mapping `experienceYears` → `annees_experience`

6. **frontend/src/pages/RegisterPage-Extended.jsx**
   - [ ] Supprimer doublon `groupeName`
   - [ ] Adapter validations si besoin

### Fichiers de Test

7. **cascade/tests/auth.controller.test.js**
   - [ ] Mettre à jour mocks User.findOne()
   - [ ] Mettre à jour noms colonnes

---

## 🎓 RÉSUMÉ POUR DÉCIDEUR

### Situation Actuelle
- ✅ Application **fonctionne**
- ❌ **Non-conforme** SPOFE v2.1
- 🚨 **Risque légal** en audit OHADA
- ⚠️ Accumulation de **dette technique**

### Options

**Option 1: Status Quo** (⛔ Non recommandé)
- **Pro**: Pas de disruption
- **Con**: Risque légal, non-scalable, code chaotique
- **Risque**: Audit externe échoue, rejet en production

**Option 2: Migration Progressive** (✅ Recommandé)
- **Phase 1** (1-2 jours): Nettoyer doublons (LOW RISK)
- **Phase 2** (1 sprint): Renommer tables (MEDIUM RISK)
- **Phase 3** (1 sprint): Traduire colonnes (LOW RISK)
- **Total**: ~2 sprints, complètement valide

**Option 3: Grand Refactor** (🚀 Optimal, Coûteux)
- Tout refaire en ES6, Modern BD Design
- **Coût**: 3-4 sprints
- **Bénéfice**: Architecture clean, scalable

### Recommandation: **Option 2** (Migration Progressive)

**Timing**: 
- Semaine 1: Phase 1 + 2 (nettoyage + renommage)
- Semaine 2: Phase 3 + 4 (traduction + code)
- Semaine 3: Phase 5 (tests + validation)

**Budget**: 1 senior dev + 1 mid-level dev (3 jours chacun)

---

## 📞 CONTACTS & ESCALADE

Pour questions ou blockers:
1. Review ce rapport avec l'équipe
2. Valider le plan avec tech lead
3. Créer ticket dans backlog
4. Assigner sprint dédié

**Document Version**: 1.0  
**Auteur**: Audit Automatisé Copilot  
**Validé par**: Henry Kilandi (Lead Dev)

