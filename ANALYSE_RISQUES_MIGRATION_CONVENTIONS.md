# 🚨 ANALYSE DES RISQUES - MIGRATION CONVENTIONS SPOFE

## Vue d'Ensemble des Risques

### Matrice de Risque Globale

```
PROBABILITÉ vs IMPACT

                   CATASTROPHIQUE   CRITIQUE      MAJEUR        MINEUR
TRÈS PROBABLE          🔴            🔴           🟠            🟡
PROBABLE               🔴            🟠           🟡            🟢
POSSIBLE               🟠            🟡           🟢            🟢
IMPROBABLE             🟡            🟢           🟢            🟢
```

---

## 🔴 RISQUES CRITIQUES

### R1: PERTE DE DONNÉES (Renommage Table)

**Description**: Lors du renommage `users` → `compagnies_utilisateurs`, risque de corruption ou perte de données

**Probabilité**: 🟡 POSSIBLE  
**Impact**: 🔴 CATASTROPHIQUE  
**Score de Risque**: **ÉLEVÉ - 7/10**

#### Scénarios d'Occurrence

1. **Erreur de Commande SQL**
   ```sql
   RENAME TABLE utilisateurs TO compagnies_utilisateurs;  -- ❌ Mauvais nom!
   DROP TABLE users;  -- ❌ Si exécuté accidentellement
   ```
   - **Probabilité**: BAS avec checklist
   - **Prévention**: Double-vérifier avant exécution

2. **Conflit avec Migrations Sequelize**
   ```javascript
   // user.model.js définit 'User' → crée table 'users'
   // Mais renommée en 'compagnies_utilisateurs'
   // Si migration auto-run → crée NOUVELLE table 'users' vide!
   ```
   - **Probabilité**: MOYEN
   - **Prévention**: Ajouter `tableName: 'compagnies_utilisateurs'` D'ABORD

3. **Intégrité Référentielle Cassée**
   ```sql
   -- FK de autres tables pointent vers 'users'
   -- Renommage casse automatiquement les FK
   ```
   - **Probabilité**: BAS (MySQL gère les FK)
   - **Vérification**: Vérifier avec INFORMATION_SCHEMA

#### Mesures d'Atténuation

| Mesure | Effort | Efficacité |
|--------|--------|------------|
| ✅ Backup complet avant | 5 min | 99% |
| ✅ Backup incrmental après chaque étape | 5 min | 100% |
| ✅ Test de rollback | 30 min | 95% |
| ✅ Dry-run en environnement staging | 2 h | 99% |

#### Plan de Récupération

```bash
# Si disaster:
1. Arrêter immédiatement le backend
2. Vérifier les logs d'erreur
3. Restaurer depuis backup:
   mysqldump -u root < backup_before_rename.sql

4. Analyser ce qui s'est passé
5. Relancer avec corrections
```

---

### R2: DOWNTIME APPLICATION (Pendant Renommage)

**Description**: Renommage table causera `Unknown table 'users'` errors si backend tourne

**Probabilité**: 🟢 TRÈS PROBABLE si pas stoppé  
**Impact**: 🔴 CRITIQUE  
**Score de Risque**: **ÉLEVÉ - 8/10**

#### Impact sur Utilisateurs

```
Étape 1: Arrêter Backend       ← 0 sec downtime
Étape 2: Exécuter RENAME       ← 2-3 sec
Étape 3: Redémarrer Backend    ← 5-10 sec
         Attendre Sequelize    ← 10-20 sec
Total Downtime                  ← ~30 secondes
```

#### Mesures d'Atténuation

| Mesure | Efficacité |
|--------|------------|
| Exécuter migration hors heures de pointe | 99% |
| Notifier utilisateurs à l'avance | N/A (prévention) |
| Avoir rollback plan prêt | 95% |
| Tester sur environnement identique | 99% |

#### Éviter le Downtime (Blue-Green Strategy)

```javascript
// Option: Créer une vue pendant la migration
CREATE VIEW users AS SELECT * FROM compagnies_utilisateurs;

// Cela permet aux anciens appels de fonctionner
// Puis progressivement migrer le code
// Finalement supprimer la vue
```

---

### R3: DÉPENDANCES CODE NON-IDENTIFIÉES

**Description**: Des références à la table `users` existent partout, impossibilité de toutes les trouver

**Probabilité**: 🟡 POSSIBLE  
**Impact**: 🔴 CRITIQUE  
**Score de Risque**: **ÉLEVÉ - 8/10**

#### Lieux Probables de Dépendances

```bash
# Grep rapide pour trouver les références
grep -r "users" cascade/src --include="*.js" | head -20

# Résultats probables:
User.findOne()          ← Référence au modèle ✅
User.findByPk()         ← Référence au modèle ✅
User.create()           ← Référence au modèle ✅
findByUserId()          ← FK reference ⚠️
groupeId (users table)  ← DOUBLON A NETTOYER ✅
```

#### Fichiers Critiques à Vérifier

1. **cascade/src/models/associations.js**
   - User associations possibles
   ```javascript
   // CHERCHER:
   User.hasMany(...)
   User.belongsTo(...)
   // Ces associations devraient continuer de fonctionner
   ```

2. **cascade/src/controllers/**
   - Tous les controllers qui utilisent User
   ```javascript
   // CHERCHER: await User.findOne, await User.create, etc.
   // Ces appels continueront de fonctionner si tableName est correct
   ```

3. **cascade/src/services/**
   - Services qui font des requêtes BD
   - RoleApprovalService
   - JournalEntryService

#### Mesures d'Atténuation

```bash
# Audit complet avant migration
grep -r "\\busers\\b" cascade/src --include="*.js" | wc -l
# Si > 50 occurrences: risque élevé

# Script de recherche intelligente:
grep -r "FROM users\|FROM \`users\`\|'users'\|\"users\"" cascade/src
# Cela trouvera les requêtes SQL directes (si y en a)
```

---

## 🟠 RISQUES MAJEURS

### R4: INCONSISTANCE MODÈLE-BD

**Description**: Le fichier `user.model.js` n'aura pas `tableName` → Sequelize créera une nouvelle table `users`

**Probabilité**: 🟢 PROBABLE si oublie d'ajouter tableName  
**Impact**: 🟠 MAJEUR  
**Score de Risque**: **MOYEN - 6/10**

#### Scénario

```javascript
// AVANT (MAUVAIS):
const User = sequelize.define('User', {...});
// → Sequelize crée automatiquement table 'users' au 1er appel

// APRÈS Migration renommage:
// Table dans BD: compagnies_utilisateurs
// Sequelize essaie de créer: users
// → INCOHÉRENCE! Deux tables différentes

// SOLUTION (CORRECT):
const User = sequelize.define('User', {...}, {
  tableName: 'compagnies_utilisateurs',  // ← CRUCIAL!
});
```

#### Prévention

- [x] Ajouter `tableName` AVANT de renommer la table
- [x] Vérifier dans `user.model.js` ligne X

#### Détection

```sql
-- Vérifier qu'une table 'users' ne s'est pas recréée
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'spofe_v2_1'
  AND TABLE_NAME IN ('users', 'compagnies_utilisateurs');

-- Devrait retourner SEULEMENT: compagnies_utilisateurs
```

---

### R5: FRONTEND INCOMPATIBLE

**Description**: Certains champs du formulaire frontend ne correspondent pas aux colonnes BD

**Probabilité**: 🟡 POSSIBLE  
**Impact**: 🟠 MAJEUR  
**Score de Risque**: **MOYEN - 5/10**

#### Champs Problématiques

| Champ Frontend | Colonne BD | État |
|---|---|---|
| `groupeName` | ✅ Mappé à groupes_entreprises | OK |
| `compagnieName` | ❌ Pas de colonne | Problème |
| `experienceYears` | ✅ experience_years | OK (à traduire) |
| `contractTypes` | ❌ Pas de colonne | Problème |

#### Prévention

```javascript
// Dans auth.controller.js, vérifier que TOUS les champs
// acceptés sont gérés correctement:

// ✅ Les champs simples (email, username) → directement à users
// ✅ Les champs groupe → créer GroupeEntreprise
// ⚠️ Les champs entreprise → CLARIFIER LA LOGIQUE

// Actuellement:
// - Si role='super_utilisateur' → créer groupeEntreprise
// - Si role='utilisateur' → lier à groupeId existant
// - Si role='consultant' → ajouter spécialités à users
```

---

## 🟡 RISQUES MOYENS

### R6: PERFORMANCE DÉGRADÉE (Indices Manquants)

**Description**: Après renommage, les indices peuvent ne pas être présents

**Probabilité**: 🟢 IMPROBABLE  
**Impact**: 🟡 MAJEUR  
**Score de Risque**: **BAS - 3/10**

#### Vérification

```sql
-- AVANT renommage:
SHOW INDEXES FROM users;

-- APRÈS renommage:
SHOW INDEXES FROM compagnies_utilisateurs;

-- Les indices devraient être conservés par MySQL
-- Si missing: recréer
ALTER TABLE compagnies_utilisateurs ADD INDEX idx_email (email);
ALTER TABLE compagnies_utilisateurs ADD INDEX idx_username (username);
```

---

### R7: CLÉS ÉTRANGÈRES CASSÉES

**Description**: Les FK dans autres tables pointant à `users` pourraient ne pas se mettre à jour automatiquement

**Probabilité**: 🟡 POSSIBLE  
**Impact**: 🟠 MAJEUR  
**Score de Risque**: **MOYEN - 5/10**

#### Identification

```sql
-- Trouver toutes les FK vers 'users':
SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'spofe_v2_1'
  AND REFERENCED_TABLE_NAME = 'users';

-- Résultat attendu: AUCUNE (car renommé)
-- Si résultat non-vide: problème!

-- Tables affectées possibles:
-- pending_approvals.user_id FK
-- group_super_users.user_id FK
-- approval_audit_logs.user_id FK
```

#### Solution

```sql
-- Si FK est cassée, la recréer:
ALTER TABLE pending_approvals
DROP FOREIGN KEY fk_pending_approvals_user_id,
ADD CONSTRAINT fk_pending_approvals_user_id
  FOREIGN KEY (user_id) REFERENCES compagnies_utilisateurs(id);
```

---

## 🟢 RISQUES MINEURS

### R8: DOCUMENTATION OBSOLÈTE

**Description**: Les docs qui parlent de table `users` deviendront obsolètes

**Probabilité**: 🟢 TRÈS PROBABLE  
**Impact**: 🟢 MINEUR  
**Score de Risque**: **TRÈS BAS - 1/10**

#### Mitigation

- [ ] Mettre à jour README.md
- [ ] Mettre à jour diagrammes architecture
- [ ] Mettre à jour DATABASE.md
- [ ] Ajouter note de migration aux committers

---

### R9: OUBLIS DE MIGRATION CODE

**Description**: Certains fichiers JS pourraient avoir des references à string 'users'

**Probabilité**: 🟡 POSSIBLE  
**Impact**: 🟢 MINEUR  
**Score de Risque**: **BAS - 2/10**

#### Grep pour trouver

```bash
# Chercher les références en string:
grep -r "'users'" cascade/src --include="*.js"
grep -r '"users"' cascade/src --include="*.js"

# Ignorer les commentaires:
grep -v "//" | grep -v "\*"
```

---

## 🛡️ MATRICE COMPLÈTE DE CONTRÔLE DES RISQUES

| ID | Risque | Probab. | Impact | Score | Critique? | Mitigation | Owner |
|----|----|---------|--------|-------|-----------|-----------|-------|
| R1 | Perte données | 🟡 | 🔴 | 7 | ✅ OUI | Backup + Test rollback | DBA |
| R2 | Downtime | 🟢 | 🔴 | 8 | ✅ OUI | Off-peak + Blue-green | Ops |
| R3 | Dépendances cachées | 🟡 | 🔴 | 8 | ✅ OUI | Grep exhaustif + Tests | Dev |
| R4 | Incohérence modèle | 🟢 | 🟠 | 6 | ⚠️ MOYEN | Code review + Tests | Dev |
| R5 | Frontend incompatible | 🟡 | 🟠 | 5 | ⚠️ MOYEN | Audit champs + Tests | Dev |
| R6 | Perf dégradée | 🟢 | 🟡 | 3 | ❌ NON | Vérifier indices | DBA |
| R7 | FK cassées | 🟡 | 🟠 | 5 | ⚠️ MOYEN | Vérifier INFORMATION_SCHEMA | DBA |
| R8 | Doc obsolète | 🟢 | 🟢 | 1 | ❌ NON | Mettre à jour docs | Tech Writer |
| R9 | Oublis migration | 🟡 | 🟢 | 2 | ❌ NON | Grep + Code review | Dev |

---

## 📋 PLAN D'ATTÉNUATION COMPLET

### Avant Migration (1 jour avant)

- [ ] **Backup Complet**
  ```bash
  mysqldump spofe_v2_1 > backup_$(date +%Y%m%d_%H%M%S).sql
  # Vérifier: ls -lh backup_*.sql
  ```

- [ ] **Audit Dépendances**
  ```bash
  grep -r "FROM users" cascade/src --include="*.js"
  grep -r "'users'" cascade/src --include="*.js"
  # Créer liste de tous les fichiers affectés
  ```

- [ ] **Préparation Code**
  ```javascript
  // Ajouter dans user.model.js:
  // tableName: 'compagnies_utilisateurs'
  ```

- [ ] **Communication**
  - Notifier équipe
  - Planifier sur calendrier
  - Obtenir accord stakeholders

### Pendant Migration (Jour J)

- [ ] **Vérifications Pré-Migration**
  ```bash
  npm run test:all  # Tous les tests passent
  npm run lint      # Pas d'erreurs
  ```

- [ ] **Gel du Trafic**
  - Arrêter backend
  - Arrêter frontend
  - Vérifier aucun process Node actif

- [ ] **Exécution Cautionnée**
  - Exécuter chaque SQL statement
  - Vérifier résultat après chaque statement
  - Si erreur → immédiatement restore

- [ ] **Redémarrage Progressif**
  - Démarrer backend
  - Vérifier logs (aucun error)
  - Faire 3-5 tests manuels
  - Démarrer frontend

### Après Migration (Jour +1)

- [ ] **Monitoring**
  - Vérifier logs: `tail -f logs/error.log`
  - Vérifier performance: aucun spike
  - Vérifier utilisateurs: pas de plaintes

- [ ] **Tests Complets**
  ```bash
  npm run test:all      # Full suite
  npm run test:e2e      # Si existent
  ```

- [ ] **Validation BD**
  ```sql
  -- Vérifier intégrité
  SHOW TABLES LIKE '%user%';
  DESCRIBE compagnies_utilisateurs;
  SELECT COUNT(*) FROM compagnies_utilisateurs;
  ```

- [ ] **Documentation**
  - Mettre à jour CHANGELOG
  - Mettre à jour architecture docs
  - Créer post-mortem si problèmes

---

## 🚨 SEUILS D'ESCALADE

### Si Score Risque > 7:

```
1. Arrêter immédiatement la migration
2. Notifier le tech lead
3. Analyser le problème
4. Décider: continuer avec fixes ou rollback complet
5. Documenter pour future reference
```

### Si Downtime Excède 5 minutes:

```
1. Initier rollback automatique
2. Restaurer depuis backup
3. Analyser root cause
4. Relancer dans 24h minimum
```

### Si Perte Données Détectée:

```
1. 🚨 INCIDENT CRITIQUE
2. Notifier immédiatement CEO/CTO
3. Restaurer depuis backup
4. Investiguer
5. Post-mortem et prevention plan
```

---

## ✅ CHECKLIST D'EXÉCUTION SÉCURISÉE

- [ ] Backup local et sauvegardé
- [ ] Code modifié (tableName) préparé et reviewé
- [ ] Tests passent à 100%
- [ ] Aucun utilisateur ne sera affecté (off-peak)
- [ ] Plan de rollback documenté et testé
- [ ] Équipe tech en standby
- [ ] Monitoring préparé
- [ ] Escalade contacts (lead, CEO) notifiés
- [ ] Autorisation finale donnée
- [ ] GO/NO-GO decision

**Status Final**: 🟡 RISQUE MOYEN-À-ÉLEVÉ  
**Recommandation**: Exécuter avec MAXIMUM de précautions

