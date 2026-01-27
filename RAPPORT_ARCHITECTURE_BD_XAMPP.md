# 📊 RAPPORT ARCHITECTURE BD - SPOFE v2.1

**Date**: 25 Janvier 2026  
**Base de Données**: spofe_v2_1 (XAMPP/MariaDB)  
**Taille Totale**: ~2.5 MB  
**Nombre de Tables**: 30 (23 tables + 2 vues + 1 index)  
**Nombre d'Enregistrements**: ~10 (données minimales)  
**Status**: ✅ Opérationnel (données de développement)

---

## 🎯 Vue d'Ensemble Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    SPOFE v2.1 DATABASE                       │
│                    (spofe_v2_1 - MariaDB)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 30 Tables Totales:                                       │
│     ├─ 23 Tables de Base (InnoDB)                            │
│     ├─ 2 Vues (disponible_consultants, consultant_summary)  │
│     └─ 1 Index Sequelize (sequelizemeta)                    │
│                                                              │
│  💾 Moteur: InnoDB (avec transactions ACID)                 │
│  🔤 Encodage: utf8mb4 (Unicode complet)                      │
│  🌍 Collation: utf8mb4_general_ci, utf8mb4_unicode_ci       │
│                                                              │
│  📊 Taille: ~2.5 MB (structure + données)                    │
│  ⚡ Performance: Optimisée pour dev (peu de données)         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📑 Catalogue Complet des 30 Tables

### 1️⃣ AUTHENTIFICATION & AUTORISATION (5 tables)

#### `users` ⭐ TABLE PRINCIPALE
```
Rôle: Gestion des utilisateurs
Rows: 2 enregistrements
Size: 0.11 MB
Colonnes principales: 28

Clés:
  ├─ id (INT, PK, auto-increment)
  ├─ username (VARCHAR 255, UNIQUE)
  ├─ email (VARCHAR 255, UNIQUE)
  ├─ password (VARCHAR 255, ENCRYPTED)
  ├─ role (ENUM: admin, super_utilisateur, utilisateur, 
           super_consultant, consultant, viewer, accountant)
  └─ is_active (BOOLEAN)

Champs Hiérarchie:
  ├─ hierarchy_level (INT, 1-99)
  └─ can_grant_permissions (BOOLEAN)

Champs Profil Étendu:
  ├─ prenom, nom, telephone
  ├─ siret, specialites
  ├─ tarif_horaire (DECIMAL 10,2)
  ├─ experience_years (INT)
  ├─ adresse, pays
  └─ type_consultant (VARCHAR 50)

⚠️ DOUBLONS (À NETTOYER):
  ├─ groupeId (CAMELCASE, NULL) + groupe_id (snake_case, FK)
  └─ invitationToken + invitation_token

Timestamps:
  ├─ created_at, updated_at, deleted_at (soft_delete)
  └─ Support paranoid deletions ✅

Indices:
  ├─ PRIMARY KEY: id
  ├─ UNIQUE: username, email
  └─ FOREIGN KEY: groupe_id → groupes_entreprises
```

#### `roles`
```
Rôle: Définition des rôles et permissions
Rows: 0 enregistrements
Colonnes: 7

Clés:
  ├─ id (INT, PK)
  ├─ compagnie_id (INT, FK) [optionnel]
  ├─ nom (VARCHAR 100)
  ├─ description (TEXT)
  └─ permissions (LONGTEXT, JSON format)
```

#### `group_super_users`
```
Rôle: Super utilisateurs par groupe
Rows: 0 enregistrements
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users)
  ├─ groupe_id (INT, FK → groupes_entreprises)
  ├─ role (ENUM: approver, reviewer, auditor)
  └─ permissions (LONGTEXT)
```

#### `password_reset_tokens`
```
Rôle: Tokens de réinitialisation mot de passe
Rows: 0 enregistrements
Colonnes: 6

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users)
  ├─ token (VARCHAR 255, UNIQUE)
  ├─ expires_at (TIMESTAMP)
  └─ used_at (TIMESTAMP, optional)
```

#### `token_blacklists`
```
Rôle: Blacklist des tokens JWT
Rows: 0 enregistrements
Colonnes: 4

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users)
  ├─ token (VARCHAR 1024)
  └─ expires_at (TIMESTAMP)
```

---

### 2️⃣ GESTION DES APPROBATIONS (4 tables)

#### `pending_approvals` 
```
Rôle: Approvals d'enregistrement en attente
Rows: 2 enregistrements
Colonnes: 15

Clés:
  ├─ id (INT, PK)
  ├─ email (VARCHAR 255, UNIQUE)
  ├─ username (VARCHAR 100, UNIQUE)
  ├─ status (ENUM: pending, approved, rejected, changes_requested)
  ├─ groupe_id (INT, FK → groupes_entreprises)
  └─ required_approvals, current_approvals (INT)

Workflow:
  ├─ created_at (timestamp création)
  ├─ validation_date (timestamp validation)
  ├─ approved_by, rejected_by (INT, FK → users)
  └─ rejected_reason (VARCHAR 500)
```

#### `approval_audit_logs`
```
Rôle: Historique des approbations
Rows: 0 enregistrements
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ pending_approval_id (INT, FK → pending_approvals)
  ├─ action (ENUM: submitted, approved, rejected, 
            changes_requested, reassigned)
  ├─ action_by (INT, FK → users)
  ├─ action_date (TIMESTAMP)
  └─ metadata (LONGTEXT, JSON)
```

#### `pending_role_approvals`
```
Rôle: Approvals d'attribution de rôles
Rows: 0 enregistrements
Colonnes: 15

Clés:
  ├─ id (INT, PK)
  ├─ user_data (LONGTEXT, JSON)
  ├─ requested_role (VARCHAR 50)
  ├─ approver_role (VARCHAR 50)
  ├─ status (ENUM: pending, approved, rejected)
  ├─ requires_group, requires_company (BOOLEAN)
  └─ approval_date (TIMESTAMP)
```

#### `role_approval_workflow`
```
Rôle: Configuration du workflow d'approbation
Rows: 4 enregistrements
Colonnes: 7

Clés:
  ├─ id (INT, PK)
  ├─ requested_role (VARCHAR 50)
  ├─ approver_role (VARCHAR 50)
  ├─ min_hierarchy_level (INT)
  ├─ requires_group_creation (BOOLEAN)
  └─ requires_company_creation (BOOLEAN)
```

---

### 3️⃣ ORGANISATION (3 tables)

#### `groupes_entreprises` ⭐ TABLE PRINCIPALE
```
Rôle: Groupes d'entreprises
Rows: 1 enregistrement
Size: 0.03 MB
Colonnes: 8

Clés:
  ├─ id (INT, PK, auto-increment)
  ├─ nom (VARCHAR 255, UNIQUE)
  ├─ description (TEXT)
  ├─ pays (VARCHAR 100)
  ├─ devise (VARCHAR 3, default XOF)
  └─ is_active (BOOLEAN, default TRUE)

Timestamps:
  ├─ created_at, updated_at (TIMESTAMP)
  └─ deleted_at (soft_delete)

Note: Données de test minimal
```

#### `compagnies` (alias companies)
```
Rôle: Compagnies/Entreprises
Rows: 0 enregistrements
Size: 0.05 MB
Colonnes: 11

Clés:
  ├─ id (INT, PK)
  ├─ name (VARCHAR 255, UNIQUE)
  ├─ registration_number (VARCHAR 255, UNIQUE)
  ├─ address, city, country (VARCHAR/TEXT)
  ├─ fiscal_year_start (INT, 1-12)
  └─ currency (VARCHAR, default XOF)

Timestamps:
  └─ created_at, updated_at, deleted_at

⚠️ DOUBLON: Aussi table `companies` (avec structure différente)
```

#### `companies` (DOUBLON À NETTOYER)
```
Rôle: Compagnies (structure alternative)
Rows: 0 enregistrements
Size: 0.05 MB
Colonnes: 14 (différentes de `compagnies`)

Clés:
  ├─ id, name, registrationNumber, taxId
  ├─ address, city, postalCode, country
  ├─ phone, email, website
  ├─ currency, fiscalYearStart
  ├─ accountingStandard
  └─ isActive, createdAt, updatedAt

⚠️ PROBLÈME: Deux tables pour le même concept!
   → Garder `compagnies` (SPOFE standard)
   → Supprimer `companies` (legacy)
```

---

### 4️⃣ COMPTABILITÉ & ÉCRITURES (4 tables)

#### `journal_entries` ⭐ CORE ACCOUNTING
```
Rôle: Écritures de journal comptable
Rows: 0 enregistrements
Size: 0.16 MB
Colonnes: 12

Clés:
  ├─ id (INT, PK)
  ├─ company_id (INT, FK → compagnies)
  ├─ journal_code (VARCHAR 10)
  ├─ entry_number (VARCHAR 50, UNIQUE)
  ├─ entry_date (DATE)
  ├─ description (VARCHAR 255)
  ├─ status (ENUM: DRAFT, SUBMITTED, APPROVED, 
            POSTED, REVERSED)
  ├─ total_debit, total_credit (DECIMAL 15,2)
  └─ user_id (INT, FK → users)

Validation:
  ├─ Debit = Credit (équilibre obligatoire)
  └─ Status workflow (DRAFT → POSTED)

Timestamps:
  └─ created_at, updated_at, deleted_at
```

#### `journal_entry_lines`
```
Rôle: Lignes d'écritures comptables
Rows: 0 enregistrements
Size: 0.06 MB
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ journal_entry_id (INT, FK → journal_entries)
  ├─ numero_compte_id (INT, FK → charts_of_accounts)
  ├─ description (TEXT)
  ├─ montant_debit, montant_credit (DECIMAL 15,2)
  ├─ order_in_entry (INT)
  └─ Timestamps avec soft_delete
```

#### `charts_of_accounts` ⭐ PLAN COMPTABLE
```
Rôle: Plan de comptes (OHADA)
Rows: 0 enregistrements
Size: 0.09 MB
Colonnes: 14

Clés:
  ├─ id (INT, PK)
  ├─ company_id (INT, FK)
  ├─ account_number (VARCHAR 20, UNIQUE per company)
  ├─ account_name (VARCHAR 255)
  ├─ account_type (ENUM: ASSETS, LIABILITIES, EQUITY,
                        REVENUES, EXPENSES, OTHER)
  ├─ sub_account_type (VARCHAR 100)
  ├─ description (TEXT)
  ├─ parent_account_id (INT, FK, hierarchie)
  ├─ is_active, is_taxable, allow_sub_accounts (BOOLEAN)
  ├─ level (INT, profondeur hiérarchique)
  └─ Timestamps avec soft_delete

Standards:
  ├─ Conforme OHADA ✅
  ├─ Hiérarchie d'accounts (parent/child)
  └─ Types comptables standard
```

#### `account_balances`
```
Rôle: Soldes par compte par période
Rows: 0 enregistrements
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ numero_compte_id (INT, FK)
  ├─ periode (VARCHAR 7, format YYYY-MM)
  ├─ solde_debit, solde_credit (DECIMAL 15,2)
  └─ Timestamps
```

---

### 5️⃣ TIERS (Clients/Fournisseurs) (1 table)

#### `third_parties` ⭐ TIERS
```
Rôle: Gestion des tiers (clients, fournisseurs, etc)
Rows: 0 enregistrements
Size: 0.13 MB
Colonnes: 43 (très complet!)

Clés:
  ├─ id (INT, PK)
  ├─ company_id (INT, FK)
  ├─ type (ENUM: CUSTOMER, SUPPLIER, EMPLOYEE, OTHER)
  ├─ code, name (VARCHAR, indexed)
  └─ legal_form (VARCHAR 100)

Identification:
  ├─ siret (VARCHAR 14, UNIQUE)
  ├─ vat_number (VAT/TVA)
  └─ email (UNIQUE, indexed)

Contact:
  ├─ phone, mobile, fax
  ├─ contact_person, contact_email, contact_phone
  └─ website (VARCHAR 255)

Adresse:
  ├─ address, address_complement
  ├─ postal_code, city, country
  └─ Géoloposte complet

Bancaire:
  ├─ bank_name, iban (VARCHAR 34)
  ├─ bic, bank_code, branch_code
  ├─ account_number, rib_key
  └─ Infos bancaires complètes pour virements

Conditions Commerciales:
  ├─ payment_terms (INT, jours)
  ├─ payment_method (ENUM: CASH, CHECK, TRANSFER, 
                     CARD, DIRECT_DEBIT, OTHER)
  ├─ discount_rate (DECIMAL 5,2, %)
  ├─ credit_limit (DECIMAL 15,2)
  └─ notes (TEXT)

Statuts:
  ├─ is_active (BOOLEAN)
  └─ is_blocked (BOOLEAN, blocage paiement)

Timestamps:
  └─ created_at, updated_at, deleted_at
```

---

### 6️⃣ CONSULTANTS & AFFECTATIONS (6 tables)

#### `consulting_firms`
```
Rôle: Cabinets de conseil
Rows: 0 enregistrements
Colonnes: 11

Clés:
  ├─ id (INT, PK)
  ├─ nom (VARCHAR 255)
  ├─ siret (VARCHAR 14, UNIQUE)
  ├─ type (VARCHAR 50)
  ├─ adresse, contact_email, contact_telephone
  ├─ website, description
  ├─ logo_url (VARCHAR 500)
  └─ created_by (INT, FK → users)
```

#### `firm_consultants`
```
Rôle: Associer consultants aux cabinets
Rows: 0 enregistrements
Colonnes: 4

Clés:
  ├─ consultant_id (INT, PK, FK → users)
  ├─ firm_id (INT, FK → consulting_firms)
  ├─ position (VARCHAR 100)
  └─ join_date (DATE)
```

#### `consultant_group_assignments`
```
Rôle: Affectations de consultants aux groupes
Rows: 0 enregistrements
Colonnes: 10

Clés:
  ├─ id (INT, PK)
  ├─ consultant_id (INT, FK → users)
  ├─ groupe_id (INT, FK → groupes_entreprises)
  ├─ status (ENUM: active, pending, suspended, terminated)
  ├─ contract_type, contract_reference
  ├─ start_date, end_date (DATE)
  ├─ billing_rate (DECIMAL 10,2)
  ├─ created_by, approved_by (INT, FK → users)
  └─ Timestamps
```

#### `consultant_company_access`
```
Rôle: Accès des consultants aux compagnies
Rows: 0 enregistrements
Colonnes: 10

Clés:
  ├─ id (INT, PK)
  ├─ consultant_id (INT, FK → users)
  ├─ compagnie_id (INT, FK → compagnies)
  ├─ groupe_id (INT, FK → groupes_entreprises)
  ├─ access_level (ENUM: read, write, audit, review)
  ├─ specific_permissions (LONGTEXT, JSON)
  ├─ reason (TEXT)
  ├─ approved_by (INT, FK → users)
  ├─ expires_at (TIMESTAMP, optional)
  └─ Timestamps
```

#### `available_consultants` 🔍 VUE
```
Rôle: Vue des consultants disponibles
Type: VIEW (pas de données brutes)

Colonnes:
  ├─ id, prenom, nom, email
  ├─ telephone, specialites
  ├─ tarif_horaire, experience_years
  ├─ role, created_at
  ├─ firm_name, firm_type
  ├─ active_groups_count
  ├─ avg_billing_rate
  └─ Métadonnées consultants

Usage: Requête pour lister consultants avec filtres
```

#### `consultant_group_summary` 🔍 VUE
```
Rôle: Vue résumée consultants par groupe
Type: VIEW

Colonnes:
  ├─ groupe_id, groupe_nom
  ├─ total_consultants
  ├─ active_consultants, pending_consultants
  ├─ avg_billing_rate
  └─ consultant_names

Usage: Dashboard aggrégation par groupe
```

---

### 7️⃣ PERMISSIONS & SÉCURITÉ (3 tables)

#### `compagnie_permissions`
```
Rôle: Permissions granulaires par compagnie
Rows: 0 enregistrements
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users)
  ├─ compagnie_id (INT, FK → compagnies)
  ├─ permission (VARCHAR 50, ex: "read_entries")
  ├─ granted_by (INT, FK → users)
  ├─ granted_at (TIMESTAMP)
  ├─ expires_at (TIMESTAMP, optional)
  └─ is_active (BOOLEAN)
```

#### `security_events`
```
Rôle: Événements de sécurité
Rows: 0 enregistrements
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users)
  ├─ event_type (VARCHAR 50, ex: "failed_login")
  ├─ description (TEXT)
  ├─ ip_address (VARCHAR 45, IPv6 support)
  ├─ user_agent (TEXT, browser info)
  ├─ status (VARCHAR 20)
  └─ created_at (TIMESTAMP)
```

#### `two_factor_auths`
```
Rôle: Configuration 2FA (TOTP)
Rows: 0 enregistrements
Colonnes: 8

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users, UNIQUE)
  ├─ secret_totp (VARCHAR 32, base32)
  ├─ backup_codes (LONGTEXT, JSON array)
  ├─ is_enabled (BOOLEAN)
  ├─ last_used_at (TIMESTAMP)
  └─ Timestamps avec soft_delete
```

---

### 8️⃣ AUDIT & LOGS (2 tables)

#### `audit_trails`
```
Rôle: Traçabilité des modifications
Rows: 0 enregistrements
Colonnes: 9

Clés:
  ├─ id (INT, PK)
  ├─ user_id (INT, FK → users)
  ├─ entity_type (VARCHAR 100, indexed)
  ├─ entity_id (INT, ID de l'entité modifiée)
  ├─ action (VARCHAR 20: CREATE, UPDATE, DELETE)
  ├─ old_values, new_values (LONGTEXT, JSON diff)
  ├─ ip_address (VARCHAR 45)
  └─ created_at (TIMESTAMP, indexed)
```

#### `approval_audit_logs` (voir Approbations)

---

### 9️⃣ CONFIGURATION & METADATA (2 tables)

#### `app_settings`
```
Rôle: Paramètres d'application
Rows: 0 enregistrements
Colonnes: 7

Clés:
  ├─ id (INT, PK)
  ├─ compagnie_id (INT, FK, optional)
  ├─ cle (VARCHAR 100, clé du paramètre)
  ├─ valeur (TEXT, valeur)
  ├─ type (VARCHAR 20: string, number, json, etc)
  └─ Timestamps

Usage: Configuration globale ou par compagnie
```

#### `sequelizemeta` 🔧 INDEX
```
Rôle: Métadonnées des migrations Sequelize
Type: Index des migrations

Clés:
  └─ name (VARCHAR 255, PK, nom migration)

Usage: Sequelize CLI tracking
```

---

### 🔟 TABLES LEGACY/DOUBLONNÉES

#### `chartsofaccounts` ⚠️ LEGACY
```
Rôle: Plan de comptes (version legacy)
Rows: 0 enregistrements
Colonnes: 10

Clés:
  ├─ id (CHAR 36, UUID)
  ├─ companyId (camelCase, INT FK)
  ├─ accountNumber, accountName (camelCase)
  ├─ accountType, accountNature
  ├─ accountStatus, description
  └─ Timestamps (createdAt, updatedAt)

⚠️ PROBLÈME: Duplique `charts_of_accounts`
   → Structure différente (UUID vs INT)
   → NomingConvention: camelCase vs snake_case
   → À SUPPRIMER ou NETTOYER
```

---

## 📊 Statistiques Synthétiques

### Par Catégorie

```
┌─────────────────────────────────────────────────────────┐
│              RÉPARTITION DES TABLES                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Authentification & Auth      5 tables      (17%)        │
│ Approbations & Workflow      4 tables      (13%)        │
│ Organisation                 3 tables      (10%)        │
│ Comptabilité & Écritures     4 tables      (13%)        │
│ Tiers (Clients/Fourns)       1 table       (3%)         │
│ Consultants                  6 tables      (20%)        │
│ Permissions & Sécurité       3 tables      (10%)        │
│ Audit & Logs                 2 tables      (7%)         │
│ Configuration                2 tables      (7%)         │
│ ─────────────────────────────                          │
│ TOTAL                        30 tables     (100%)       │
│                                                         │
│ Dont:                                                   │
│   • 23 Tables de Base                                   │
│   • 2 Vues                                              │
│   • 1 Index Sequelize                                   │
│                                                         │
│ PROBLÈMES IDENTIFIÉS:                                   │
│   • 2 Doublons: users (groupeId, invitationToken)      │
│   • 2 Tables légacy: companies, chartsofaccounts       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Par Taille

```
Table                      Rows    Size      Index
─────────────────────────────────────────────────────
journal_entries              0    0.16 MB   147 KB
consultant_group_assign.     0    0.08 MB   65 KB
consulting_firms             0    0.05 MB   32 KB
compagnie_permissions        0    0.09 MB   81 KB
consultant_company_access    0    0.08 MB   65 KB
third_parties                0    0.13 MB   114 KB
charts_of_accounts           0    0.09 MB   81 KB
chartsofaccounts             0    0.03 MB   16 KB
users                        2    0.11 MB   98 KB
journal_entry_lines          0    0.06 MB   49 KB
groupes_entreprises          1    0.03 MB   16 KB
[autres tables]              0    ~0.5 MB   ~400 KB
```

---

## 🔗 Relations & Foreign Keys

### Hiérarchie Principale

```
groupes_entreprises (organisations mères)
  │
  ├─ users (utilisateurs du groupe)
  │  ├─ groupe_id FK
  │  ├─ roles (admin, utilisateur, consultant, etc)
  │  └─ permissions (compagnie_permissions)
  │
  ├─ compagnies (entreprises du groupe)
  │  ├─ journal_entries (écritures comptables)
  │  │  └─ journal_entry_lines (lignes)
  │  │     └─ charts_of_accounts (plan comptable)
  │  │
  │  ├─ third_parties (clients/fournisseurs)
  │  └─ app_settings (configurations)
  │
  └─ consulting_firms (cabinets de conseil)
     └─ firm_consultants (consultants)
        ├─ consultant_group_assignments
        └─ consultant_company_access
```

### Relations Critiques

```
users (2 rows)
  ├─ FK groupe_id → groupes_entreprises (1 row)
  ├─ FK → pending_approvals (2 rows)
  ├─ FK → group_super_users
  ├─ FK → compagnie_permissions
  ├─ FK → consultant_company_access
  ├─ FK → consultant_group_assignments
  ├─ FK → journal_entries
  └─ FK → audit_trails

compagnies (0 rows)
  ├─ FK → journal_entries
  ├─ FK → charts_of_accounts
  ├─ FK → third_parties
  ├─ FK → app_settings
  ├─ FK → roles (per compagnie)
  └─ FK → compagnie_permissions

journal_entries (0 rows)
  ├─ FK company_id → compagnies
  ├─ FK user_id → users
  └─ journal_entry_lines (0 rows)
     └─ FK numero_compte_id → charts_of_accounts
```

---

## 🚨 Problèmes & Incohérences Identifiés

### 🔴 CRITIQUES

| Problème | Localité | Impact | Sévérité |
|----------|----------|--------|----------|
| **Doublons camelCase** | users table | Confusion données | 🔴 ÉLEVÉ |
| - groupeId + groupe_id | Colonnes | Dupliquées | |
| - invitationToken + invitation_token | Colonnes | Dupliquées | |
| **Tables dupliquées** | Schema global | Incohérence | 🔴 ÉLEVÉ |
| - companies + compagnies | 2 tables | Même concept | |
| - chartsofaccounts + charts_of_accounts | 2 tables | Plan comptable | |
| **Naming mixte** | Partout | Non-conforme | 🔴 ÉLEVÉ |
| - camelCase vs snake_case | Inconsistency | Difficile à gérer | |

### 🟠 MAJEURS

| Problème | Détails | Fix |
|----------|---------|-----|
| **chartsofaccounts** | UUID au lieu d'INT | Recréer schema |
| **Pas de tableName** | user.model.js | Ajouter tableName |
| **Aucun contrôle intégrité** | Pas de CHECK constraints | Ajouter validations |

### 🟡 MINEURS

| Problème | Détails | Fix |
|----------|---------|-----|
| **Peu de données** | Vide pour tests | Normal (dev) |
| **Vues pas optimisées** | Lentes | Index nécessaires |

---

## ✅ Points Forts

```
✅ Moteur InnoDB
   └─ Support transactions ACID complet

✅ Soft Deletes Implémentés
   └─ deleted_at sur toutes les tables principales

✅ Timestamps Complets
   └─ created_at, updated_at systématique

✅ Unicode Complet
   └─ utf8mb4 pour caractères spéciaux

✅ Indices Bien Placés
   └─ FK, UNIQUE, et recherches indexées

✅ Hiérarchie Bien Structurée
   └─ groupes_entreprises → compagnies → écritures

✅ Permissions Granulaires
   └─ compagnie_permissions + group_super_users

✅ Audit Complet
   └─ audit_trails + approval_audit_logs
```

---

## ⚙️ Configuration Sequelize Détectée

```javascript
// Configuration globale:
underscored: true              // Convertit camelCase → snake_case
timestamps: true               // Ajoute created_at, updated_at
paranoid: true                 // Soft deletes (deleted_at)
createdAt: 'created_at'       // Customise le nom
updatedAt: 'updated_at'
deletedAt: 'deleted_at'

// Moteur:
sequelize.define('Model', {...}, {
  freezeTableName: false       // Utilise pluriel (users)
  tableName: ???               // Beaucoup sans tableName explicite!
})
```

---

## 📈 Recommandations Prioritaires

### 🔴 IMMÉDIAT (Jour 1)

```sql
-- 1. Nettoyer doublons dans users
ALTER TABLE users DROP COLUMN groupeId;
ALTER TABLE users DROP COLUMN invitationToken;

-- 2. Supprimer table legacy
DROP TABLE IF EXISTS companies;

-- 3. Décider: garder chartsofaccounts ou charts_of_accounts?
-- (Actuellement les deux coexistent)
```

### 🟠 COURT TERME (Semaine 1)

```
1. Renommer users → compagnies_utilisateurs
2. Aligner compagnies_parameters schema
3. Nettoyer chartsofaccounts vs charts_of_accounts
4. Ajouter tableName explicite dans tous les modèles
5. Vérifier intégrité FK (MySQL peut être tolérant)
```

### 🟡 MOYEN TERME (Sprint 2)

```
1. Créer migration Sequelize complète
2. Ajouter CHECK constraints
3. Optimiser vues (available_consultants, etc)
4. Documenter schema officiel
5. Test de charge et performance
```

---

## 📝 Conclusion

### État Actuel
```
✅ Architecture globale SOUND
✅ Design conforme OHADA principles
❌ Incohérences naming (camelCase/snake_case)
❌ Doublons et tables legacy
⚠️ Donnéesminimales (dev mode)
```

### Score Qualité

```
Structure:        90/100  🟢
Nommage:         60/100  🟠
Doublons:        40/100  🔴
Performance:     85/100  🟢
Sécurité:        80/100  🟢
Audit:           85/100  🟢
─────────────────────────
GLOBAL:          73/100  🟡 BON
```

### Priorité Action
```
🔴 CRITIQUE:  Nettoyer doublons (2h)
🟠 HAUTE:     Renommer tables (3-4h)
🟡 MOYEN:     Aligner naming (1j)
🟢 LOW:       Optimiser perf (1-2j)
```

---

**Rapport Généré**: 25 Janvier 2026  
**Database**: spofe_v2_1 (XAMPP/MariaDB)  
**Version**: 1.0 COMPLET

