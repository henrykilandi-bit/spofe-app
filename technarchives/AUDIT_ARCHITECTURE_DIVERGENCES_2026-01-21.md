# 🔍 AUDIT ARCHITECTURE BD SPOFE v2.1 - RAPPORT DE DIVERGENCES
**Date**: 21 janvier 2026  
**Base**: spofe_v2_1 (XAMPP MySQL)

---

## 📊 RÉSUMÉ EXÉCUTIF

Votre base de données XAMPP **N'EST PAS CONFORME** à l'architecture SPOFE v2.1 cible.

| Domaine | État | Details |
|---------|------|---------|
| **Conformité Générale** | ❌ **29%** | 5 tables seulement au lieu de 14 requises |
| **Noyau Comptable** | ⚠️ **Partiel** | 3/4 tables principales présentes |
| **Sécurité & Auth** | ❌ **0%** | Toutes les 5 tables manquent |
| **Configuration** | ❌ **0%** | Tables manquantes |
| **Structures ORM** | ❌ **Cassées** | Associations incomplètes, FK manquantes |

---

## 🗃️ TABLES: COMPARAISON DÉTAILLÉE

### ✅ TABLES PRÉSENTES (5)

#### 1. `users`
**État**: ✅ Existe, mais **INCOMPLET**
- ✅ Colonnes basiques présentes (id, username, email, password, role, is_active)
- ❌ **Clés étrangères manquantes**: 
  - Pas de FK vers `roles` (role_id)
  - Pas de FK vers `groupes_entreprises` (groupe_id)
- ❌ **Colonnes manquantes**: `deleted_at` (soft delete)

#### 2. `companies` (alias pour `compagnies`)
**État**: ⚠️ Existe avec mauvais nom + **INCOMPLET**
- ✅ Nom présent
- ❌ **Clés étrangères manquantes**:
  - Pas de FK vers `groupes_entreprises` (groupe_id)
- ❌ **Colonnes manquantes**: 
  - Pas de `groupe_id` (FK)
  - Pas de `deleted_at` (soft delete)
  - Pas de `status`

#### 3. `chartsofaccounts` (alias pour `charts_of_accounts`)
**État**: ⚠️ Existe avec mauvais nom + **INCOMPLET**
- ✅ Structure minimale présente
- ❌ **Colonnes manquantes**:
  - Pas de `parentAccountId` (hierarchie)
  - Pas de `deleted_at`
  - Pas de `status`

#### 4. `journal_entries`
**État**: ✅ Existe, mais **INCOMPLET**
- ✅ Structure de base correcte
- ❌ **Clés étrangères manquantes**:
  - Pas de FK vers `users` (user_id)
- ❌ **Colonnes manquantes**:
  - Pas de `submitted_by`, `approved_by`
  - Pas de `deleted_at`

#### 5. `sequelizemeta`
**État**: ⚠️ Table système Sequelize (générée automatiquement)

---

### ❌ TABLES MANQUANTES (9)

#### 🔐 **Couche Sécurité & Authentification** (5 tables CRITIQUES)

| Table | Objectif | Urgence |
|-------|----------|---------|
| `roles` | Définition rôles/permissions | 🔴 CRITIQUE |
| `two_factor_auth` | Secrets TOTP 2FA | 🔴 CRITIQUE |
| `password_reset_tokens` | Jetons réinitialisation | 🟠 HAUTE |
| `token_blacklist` | JWT révoqués | 🟠 HAUTE |
| `security_events` | Tentatives/blocages | 🟠 HAUTE |

#### 📊 **Couche Organisation** (1 table CRITIQUE)

| Table | Objectif | Urgence |
|-------|----------|---------|
| `groupes_entreprises` | Racine hiérarchie (1:N compagnies) | 🔴 CRITIQUE |

#### 📝 **Couche Comptable** (2 tables)

| Table | Objectif | Urgence |
|-------|----------|---------|
| `journal_entry_lines` | Détails écritures | 🔴 CRITIQUE |
| `account_balances` | Soldes comptes/périodes | 🟠 HAUTE |

#### ⚙️ **Couche Admin & Config** (2 tables)

| Table | Objectif | Urgence |
|-------|----------|---------|
| `audit_trail` | Historique opérations | 🟠 HAUTE |
| `app_settings` | Paramètres dynamiques | 🟡 MOYENNE |

---

## 🔴 ANOMALIES CRITIQUES DÉTECTÉES

### 1. **Hiérarchie Organisationnelle Cassée**
```
❌ MANQUE: groupes_entreprises (table racine)
└─ ❌ companies.groupe_id (FK)
   └─ ✅ journal_entries.company_id (FK existante)
      └─ users.groupe_id (FK manquante)
```

### 2. **Authentification Incomplète**
- ❌ Table `roles` inexistante → Rôles stockés en ENUM dans `users` (inflexible)
- ❌ Pas de 2FA (table `two_factor_auth` manquante)
- ❌ Pas de gestion tokens (table `token_blacklist` manquante)
- ❌ Pas de suivi sécurité (table `security_events` manquante)

### 3. **Écritures Comptables Incomplètes**
- ❌ Table `journal_entry_lines` manquante → Pas de lignes d'écriture!
- ❌ Table `account_balances` manquante → Pas de calcul de soldes
- ❌ Pas de traçabilité utilisateur (user_id manquant sur entries)

### 4. **Nommage Inconsistant** (Problème ORM)
| Base | Standard SPOFE v2.1 | Conséquence |
|------|---------------------|------------|
| `companies` | `compagnies` | Associations ORM cassées |
| `chartsofaccounts` | `charts_of_accounts` | Modèles non reconnus |
| `company_id` (entries) | `compagnie_id` | FK mal nommées |

### 5. **Soft Deletes Manquants**
- ❌ Aucune colonne `deleted_at` sur users/companies/charts/entries
- Impact: Impossible d'implémenter la suppression logique (audit trail)

---

## 📋 ASSOCIATIONS ORM INVALIDES

Actuellement, les modèles Sequelize dans `cascade/src/models/index.js` ont:

```javascript
// ❌ PROBLÈMES:
// 1. Pas de modèle Role
// 2. Pas de modèle GroupeEntreprise  
// 3. Pas d'association User → GroupeEntreprise
// 4. Pas d'association User → Role (avec FK role_id)
// 5. Pas d'association Company → GroupeEntreprise
// 6. Pas de modèles sécurité (TwoFactorAuth, TokenBlacklist, etc.)
// 7. Pas de modèle JournalEntryLine (CRITIQUE!)
// 8. Pas de modèle AuditTrail
```

**Résultat**: L'audit FK détecte 6 anomalies (modèles non chargés).

---

## 🛠️ PLAN DE RESTAURATION

### **Phase 1: Créer les tables manquantes** (SQL)
Priority: 1️⃣ Critique → 2️⃣ Haute → 3️⃣ Moyenne

### **Phase 2: Corriger nommage + colonnes** 
- Renommer `companies` → `compagnies`
- Renommer `chartsofaccounts` → `charts_of_accounts`
- Ajouter colonnes manquantes (deleted_at, grupo_id, user_id, etc.)
- Ajouter contraintes FK

### **Phase 3: Mettre à jour modèles Sequelize**
- Créer modèles manquants (Role, GroupeEntreprise, TwoFactorAuth, etc.)
- Mettre à jour associations dans `associations.js`
- Mettre à jour `index.js` pour importer tous les modèles

### **Phase 4: Valider avec audit FK**
```bash
npm run audit:fk --verbose
```
Cible: **0 anomalies détectées**, **100% conformité**

---

## ✅ CONCLUSION

**Diagnostic**: Votre base est à ~30% du schéma SPOFE v2.1 attendu.

**Recommandation**: Procéder à une **restauration complète** via les scripts de migration pour garantir:
- ✅ Intégrité référentielle (FK)
- ✅ Traçabilité complète (audit trail)
- ✅ Sécurité multi-couches (2FA, tokens, events)
- ✅ Conformité ORM 100%
- ✅ Extensibilité modulaire (futurs modules RH, Facturation, etc.)

**Durée estimée**: 2-3 heures avec scripts automatisés

---

**Généré par**: SPOFE Audit System  
**Version**: v2.1 snapshot  
**Signature**: audit_db_conformity_2026-01-21
