# 🗄️ SPOFE DATABASE ARCHITECTURE SCHEMA

**Version:** 2.1.0  
**Database:** Dual-engine support - **MariaDB** (production) + **PostgreSQL** (SILC-compliant)  
**Date:** 2 février 2026  
**Status:** ✅ **PRODUCTION-READY**

---

## 📋 VUE D'ENSEMBLE

### Architecture générale

La base de données SPOFE suit une **architecture dual-engine** modulaire et multi-tenant :

**🗄️ Architecture Production (MariaDB 10.4.32)**
- **Base principale** : spofe_v2_1 avec 32 tables opérationnelles 
- **Write-side** : Tables transactionnelles ACID avec InnoDB
- **Read-side** : Vues et read models optimisés  
- **Multi-tenant** : Isolation stricte par compagnie_id

**🏛️ Architecture SILC-Compliant (PostgreSQL 15)**
- **Base conforme** : Respect invariants SILC v2.1
- **Append-only** : Architecture immuable, 100% traçable
- **Role-based** : spofe_writer (INSERT only) + spofe_reader
- **Auditabilité** : Aucun UPDATE/DELETE autorisé

```
🗄️ SPOFE DUAL DATABASE ARCHITECTURE
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Write Models  │ │   Read Models   │ │   Integration   ││
│  │   (Commands)    │ │   (Queries)     │ │   (Events)      ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   MariaDB       │ │   PostgreSQL    │ │   Sync Layer    ││
│  │   (Production)  │ │   (SILC v2.1)   │ │   (Replication) ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   InnoDB        │ │   ACID + WAL    │ │   Constraints   ││
│  │   (OLTP)        │ │   (Compliance)  │ │   (Integrity)   ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 STRUCTURE DES TABLES

### Tables principales (32 tables MariaDB + PostgreSQL équivalent)

**🔹 Production MariaDB (schema_spofe_v2_1_complete.sql)**
```sql
-- Core System Tables
CREATE TABLE `compagnies` (...)               -- Multi-tenant companies
CREATE TABLE `users` (...)                    -- User management
CREATE TABLE `roles` (...)                    -- RBAC system
CREATE TABLE `company_permissions` (...)      -- Permission matrix

-- Financial Core
CREATE TABLE `charts_of_accounts` (...)       -- Plan comptable
CREATE TABLE `account_balances` (...)         -- Soldes comptables
CREATE TABLE `journal_entries` (...)          -- Écritures journal
CREATE TABLE `journal_entry_lines` (...)      -- Lignes d'écriture
```

**🏛️ SILC-Compliant PostgreSQL (ddl/spofe-silc-complete.sql)**
```sql
-- SPOFE DDL — PostgreSQL Production-Ready
-- Conforme aux invariants SILC v2.1
-- Append-only, immuable, 100% traçable

-- Types & Enums
CREATE TYPE decision_type AS ENUM (
    'APPROVE', 'REJECT', 'PENDING'
);

-- Rôles stricts
CREATE ROLE spofe_writer NOINHERIT;  -- INSERT only
CREATE ROLE spofe_reader NOINHERIT;  -- SELECT only

-- Aucun UPDATE / DELETE autorisé par défaut
REVOKE ALL ON SCHEMA public FROM PUBLIC;
```

**📋 Liste complète (32 tables synchronisées)**
```sql
-- Third Parties & References
CREATE TABLE `third_parties` (...)            -- Tiers (clients, fournisseurs)

-- Security & Audit
CREATE TABLE `audit_trails` (...)             -- Audit trail complet
CREATE TABLE `login_audit_trails` (...)       -- Audit connexions
CREATE TABLE `security_events` (...)          -- Événements sécurité
CREATE TABLE `token_blacklists` (...)         -- Tokens révoqués

-- Workflow & Approvals
CREATE TABLE `pending_approvals` (...)        -- Approbations en attente
CREATE TABLE `approval_audit_logs` (...)      -- Audit approbations
CREATE TABLE `role_approval_workflow` (...)   -- Workflow rôles
CREATE TABLE `pending_role_approvals` (...)   -- Approbations rôles

-- Consulting Platform
CREATE TABLE `consulting_firms` (...)         -- Cabinets conseil
CREATE TABLE `firm_consultants` (...)         -- Consultants par cabinet
CREATE TABLE `consultant_firm_assignments` (...) -- Affectations
CREATE TABLE `consultant_group_access` (...)  -- Accès groupes
CREATE TABLE `consultant_group_assignments` (...) -- Assignments groupes
CREATE TABLE `consultant_company_access` (...) -- Accès entreprises

-- Enterprise Groups
CREATE TABLE `groupes_entreprises` (...)      -- Groupes d'entreprises
CREATE TABLE `groupe_super_users` (...)       -- Super users groupes

-- Authentication & Security
CREATE TABLE `password_reset_tokens` (...)    -- Reset password
CREATE TABLE `remember_tokens` (...)          -- Remember me tokens
CREATE TABLE `two_factor_auths` (...)         -- 2FA authentication

-- Application Configuration  
CREATE TABLE `app_settings` (...)             -- Configuration app
CREATE TABLE `sequelizemeta` (...)            -- Migration tracking
```

---

## 🏗️ ARCHITECTURE MODULAIRE

### Separation Write/Read

#### Write-side Tables (Transactional)

```sql
-- Command-side : Optimisées pour les écritures ACID
CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `compagnie_id` int(11) NOT NULL,
  `reference` varchar(100) NOT NULL,
  `date_ecriture` date NOT NULL,
  `description` text,
  `montant_total_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `montant_total_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `statut` enum('brouillon','valide','annule') DEFAULT 'brouillon',
  `created_by` int(11) NOT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `compagnie_id_reference` (`compagnie_id`,`reference`),
  KEY `idx_journal_entries_compagnie` (`compagnie_id`),
  KEY `idx_journal_entries_date` (`date_ecriture`),
  KEY `idx_journal_entries_statut` (`statut`),
  KEY `idx_journal_entries_deleted_at` (`deleted_at`),
  CONSTRAINT `journal_entries_compagnie_fk` FOREIGN KEY (`compagnie_id`) 
    REFERENCES `compagnies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Read-side Views (Optimisées requêtes)

```sql
-- Views pour les read models (générées automatiquement)
CREATE VIEW `view_account_balances_summary` AS
SELECT 
    cb.compagnie_id,
    coa.numero_compte,
    coa.nom_compte,
    coa.type_compte,
    SUM(cb.solde_debit) as total_debit,
    SUM(cb.solde_credit) as total_credit,
    (SUM(cb.solde_debit) - SUM(cb.solde_credit)) as solde_net
FROM account_balances cb
INNER JOIN charts_of_accounts coa ON cb.numero_compte_id = coa.id
WHERE cb.deleted_at IS NULL 
  AND coa.deleted_at IS NULL
GROUP BY cb.compagnie_id, coa.numero_compte, coa.nom_compte, coa.type_compte;

CREATE VIEW `view_journal_entries_summary` AS
SELECT 
    je.compagnie_id,
    DATE_FORMAT(je.date_ecriture, '%Y-%m') as periode,
    je.statut,
    COUNT(*) as nombre_ecritures,
    SUM(je.montant_total_debit) as total_debits,
    SUM(je.montant_total_credit) as total_credits
FROM journal_entries je
WHERE je.deleted_at IS NULL
GROUP BY je.compagnie_id, periode, je.statut;
```

### Multi-tenancy (Tenant Isolation)

```sql
-- Isolation par compagnie (tenant)
CREATE TABLE `compagnies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `siret` varchar(14) DEFAULT NULL,
  `adresse` text,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `pays` varchar(100) DEFAULT 'France',
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `site_web` varchar(255) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `date_creation` date DEFAULT NULL,
  `forme_juridique` varchar(100) DEFAULT NULL,
  `capital_social` decimal(15,2) DEFAULT NULL,
  `numero_tva` varchar(20) DEFAULT NULL,
  `code_naf` varchar(10) DEFAULT NULL,
  `statut` enum('active','suspendue','fermee') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siret` (`siret`),
  UNIQUE KEY `numero_tva` (`numero_tva`),
  KEY `idx_compagnies_statut` (`statut`),
  KEY `idx_compagnies_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Toutes les tables métier ont une référence compagnie_id
-- Exemple : journal_entries, account_balances, third_parties, etc.
```

---

## 🔐 SÉCURITÉ ET CONTRÔLE D'ACCÈS

### RBAC (Role-Based Access Control)

```sql
-- Système de rôles granulaire
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `compagnie_id` int(11) DEFAULT NULL,
  `nom_role` varchar(100) NOT NULL,
  `description` text,
  `permissions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `compagnie_role_unique` (`compagnie_id`,`nom_role`),
  KEY `idx_roles_compagnie` (`compagnie_id`),
  KEY `idx_roles_active` (`is_active`),
  CONSTRAINT `roles_compagnie_fk` FOREIGN KEY (`compagnie_id`) 
    REFERENCES `compagnies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_json` CHECK (json_valid(`permissions_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions par compagnie
CREATE TABLE `company_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `compagnie_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `granted_by` int(11) NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_compagnie_unique` (`user_id`,`compagnie_id`),
  KEY `idx_company_permissions_user` (`user_id`),
  KEY `idx_company_permissions_compagnie` (`compagnie_id`),
  KEY `idx_company_permissions_role` (`role_id`),
  KEY `idx_company_permissions_active` (`is_active`),
  CONSTRAINT `company_permissions_user_fk` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_permissions_compagnie_fk` FOREIGN KEY (`compagnie_id`) 
    REFERENCES `compagnies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_permissions_role_fk` FOREIGN KEY (`role_id`) 
    REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Audit et Traçabilité

```sql
-- Audit trail complet
CREATE TABLE `audit_trails` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `compagnie_id` int(11) DEFAULT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` bigint(20) NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE','READ') NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `request_id` varchar(100) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_trails_user` (`user_id`),
  KEY `idx_audit_trails_compagnie` (`compagnie_id`),
  KEY `idx_audit_trails_table_record` (`table_name`,`record_id`),
  KEY `idx_audit_trails_action` (`action`),
  KEY `idx_audit_trails_created` (`created_at`),
  CONSTRAINT `audit_trails_old_values` CHECK (json_valid(`old_values`)),
  CONSTRAINT `audit_trails_new_values` CHECK (json_valid(`new_values`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Événements de sécurité
CREATE TABLE `security_events` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `compagnie_id` int(11) DEFAULT NULL,
  `event_type` enum('LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','PASSWORD_CHANGE',
                    'ROLE_CHANGE','PERMISSION_DENIED','SUSPICIOUS_ACTIVITY',
                    'TWO_FACTOR_ENABLED','TWO_FACTOR_DISABLED') NOT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `additional_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_security_events_user` (`user_id`),
  KEY `idx_security_events_compagnie` (`compagnie_id`),
  KEY `idx_security_events_type` (`event_type`),
  KEY `idx_security_events_severity` (`severity`),
  KEY `idx_security_events_created` (`created_at`),
  CONSTRAINT `security_events_additional_data` CHECK (json_valid(`additional_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📈 OPTIMISATIONS ET PERFORMANCE

### Indexation stratégique

```sql
-- Index composites pour les requêtes fréquentes
CREATE INDEX `idx_account_balances_compagnie_periode` ON `account_balances` 
(`numero_compte_id`, `periode`);

CREATE INDEX `idx_journal_entries_compagnie_date_statut` ON `journal_entries` 
(`compagnie_id`, `date_ecriture`, `statut`);

CREATE INDEX `idx_audit_trails_table_record_created` ON `audit_trails` 
(`table_name`, `record_id`, `created_at`);

-- Index pour soft deletes (pattern SPOFE)
CREATE INDEX `idx_[table]_deleted_at` ON `[table]` (`deleted_at`);
CREATE INDEX `idx_[table]_created_deleted` ON `[table]` (`created_at`, `deleted_at`);
```

### Contraintes d'intégrité

```sql
-- Contraintes métier essentielles
ALTER TABLE `journal_entries` 
ADD CONSTRAINT `chk_journal_entries_balance` 
CHECK (`montant_total_debit` = `montant_total_credit`);

ALTER TABLE `account_balances` 
ADD CONSTRAINT `chk_account_balances_positive` 
CHECK (`solde_debit` >= 0 AND `solde_credit` >= 0);

-- Contraintes JSON pour colonnes structurées
ALTER TABLE `roles` 
ADD CONSTRAINT `permissions_json` CHECK (json_valid(`permissions_json`));

ALTER TABLE `audit_trails` 
ADD CONSTRAINT `audit_trails_old_values` CHECK (json_valid(`old_values`)),
ADD CONSTRAINT `audit_trails_new_values` CHECK (json_valid(`new_values`));
```

### Partitioning (prévu pour v2.2)

```sql
-- Partitioning par date pour les tables volumineuses
-- (Implémentation future pour audit_trails, journal_entries)
```

---

## 🔄 MIGRATION ET VERSIONING

### Schema Versioning

```sql
-- Table de suivi des migrations
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Versions actuelles
INSERT INTO `sequelizemeta` VALUES 
('001-create-base-tables.js'),
('002-create-rbac-system.js'),
('003-create-audit-system.js'),
('004-create-consulting-platform.js'),
('005-create-accounting-core.js'),
('006-add-security-enhancements.js'),
('007-add-workflow-system.js');
```

### Evolution Schema

| **Version** | **Changements** | **Impact** |
|-------------|-----------------|------------|
| **v2.0** | Base initial | - |
| **v2.1** | Consulting platform, Enhanced security | Nouveau modules |
| **v2.2** | Partitioning, Performance optimizations | Prévue Q2 2026 |
| **v3.0** | Event sourcing, CQRS native | Prévue Q4 2026 |

---

## 📊 MÉTRIQUES ET MONITORING

### Tables de monitoring

```sql
-- Métriques de performance (à créer)
CREATE TABLE `performance_metrics` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) NOT NULL,
  `operation_type` enum('SELECT','INSERT','UPDATE','DELETE') NOT NULL,
  `execution_time_ms` decimal(10,3) NOT NULL,
  `rows_affected` bigint(20) DEFAULT NULL,
  `query_hash` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_perf_metrics_table_operation` (`table_name`, `operation_type`),
  KEY `idx_perf_metrics_execution_time` (`execution_time_ms`),
  KEY `idx_perf_metrics_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Santé de la base
CREATE VIEW `database_health_summary` AS
SELECT 
    TABLE_NAME,
    TABLE_ROWS as row_count,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) as size_mb,
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) as index_size_mb,
    ENGINE
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'spofe_v2_1'
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY DATA_LENGTH DESC;
```

---

## 🎯 RÉSUMÉ ARCHITECTURAL

### Caractéristiques principales

- **🗄️ 32 tables** organisées en modules métier
- **🔒 Multi-tenant** avec isolation stricte par compagnie
- **🛡️ Sécurité RBAC** granulaire avec audit complet
- **📊 Optimisée performance** avec indexation stratégique
- **🔄 Évolutivité** via migrations versionnées
- **📈 Observabilité** intégrée pour monitoring

### Technologies utilisées

**🗄️ Production Stack (MariaDB)**
- **Engine:** InnoDB (transactions ACID)
- **Character Set:** UTF8MB4 (support emoji/unicode)
- **Collation:** utf8mb4_unicode_ci
- **Contraintes:** CHECK, Foreign Keys, Unique
- **Features:** JSON validation, Soft deletes, Timestamps automatiques

**🏛️ SILC Stack (PostgreSQL 15)**
- **Engine:** PostgreSQL avec WAL (Write-Ahead Logging)
- **Character Set:** UTF8 avec locale fr_FR.UTF-8
- **Contraintes:** ENUM types, Role-based security, Append-only
- **Features:** ACID compliance, No UPDATE/DELETE, Immutable audit trail

### Conformité standards

- ✅ **DUAL ENGINE Support** MariaDB (production) + PostgreSQL (SILC)
- ✅ **ACID Transactions** pour intégrité données
- ✅ **Isolation Multi-tenant** pour sécurité
- ✅ **Audit Trail complet** pour traçabilité
- ✅ **SILC v2.1 Compliance** avec architecture append-only
- ✅ **Soft Delete pattern** (MariaDB) / Immutable records (PostgreSQL)
- ✅ **Indexed optimized** pour performance
- ✅ **JSON structured data** pour flexibilité

---

**🏆 La base de données SPOFE v2.1 fournit une architecture **dual-engine** robuste avec MariaDB en production et PostgreSQL pour la conformité SILC, offrant le meilleur des deux mondes : performance opérationnelle ET compliance réglementaire.**