# 🗄️ SCHÉMA DE LA BASE DE DONNÉES ACTUELLE - SPOFE v2.1

*Généré le 28/01/2026 depuis XAMPP MySQL*

---

## 📊 **Vue d'Ensemble**

**Base de données:** `spofe_v2_1`  
**Moteur:** InnoDB  
**Charset:** utf8mb4_unicode_ci  
**Nombre de tables:** 33

---

## 🏗️ **Structure Principale**

### 📋 **Liste Complète des Tables**

| Table | Description | Type |
|-------|-------------|------|
| `users` | Utilisateurs du système | Entité principale |
| `roles` | Rôles et permissions | Entité principale |
| `compagnies` | Entreprises/Compagnies | Entité principale |
| `groupes_entreprises` | Groupes d'entreprises | Entité principale |
| `account_balances` | Soldes de comptes | Métier |
| `app_settings` | Configuration application | Système |
| `approval_audit_logs` | Logs d'approbation | Audit |
| `audit_trails` | Journal d'audit | Audit |
| `available_consultants` | Consultants disponibles | Métier |
| `charts_of_accounts` | Plan comptable | Métier |
| `compagnies_permissions_backup` | Backup permissions | Système |
| `company_permissions` | Permissions entreprises | Sécurité |
| `consultant_company_access` | Accès consultants | Sécurité |
| `consultant_firm_assignments_backup` | Backup affectations | Système |
| `consultant_group_access` | Accès groupes | Sécurité |
| `consultant_group_assignments` | Affectations groupes | Métier |
| `consultant_group_summaries` | Résumés groupes | Métier |
| `consultant_group_summary_backup` | Backup résumés | Système |
| `consulting_firm_assignments` | Affectations cabinets | Métier |
| `consulting_firms` | Cabinets de conseil | Métier |
| `firm_consultants` | Consultants cabinets | Métier |
| `groupe_super_users` | Super utilisateurs groupes | Sécurité |
| `journal_entries` | Écritures comptables | Métier |
| `journal_entry_lines` | Lignes écritures | Métier |
| `login_audit_trails` | Logs de connexion | Audit |
| `password_reset_tokens` | Tokens reset mot de passe | Sécurité |
| `pending_approvals` | Approbations en attente | Workflow |
| `pending_role_approvals` | Approbations rôles | Workflow |
| `remember_tokens` | Tokens "se souvenir" | Sécurité |
| `role_approval_workflow` | Workflow approbation rôles | Workflow |
| `security_events` | Événements sécurité | Sécurité |
| `sequelizemeta` | Métadonnées Sequelize | Système |
| `third_parties` | Tiers (clients/fournisseurs) | Métier |
| `token_blacklists` | Tokens blacklistés | Sécurité |
| `two_factor_auths` | Authentification 2FA | Sécurité |

---

## 🔍 **Tables Principales Détaillées**

### 👤 **Table `users`**

```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupe_id` int(11) DEFAULT NULL,
  `invitation_token` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','super_utilisateur','utilisateur','super_consultant','consultant','viewer','accountant') DEFAULT 'utilisateur',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `hierarchy_level` int(11) DEFAULT 99,
  `can_grant_permissions` tinyint(1) DEFAULT 0,
  `prenom` varchar(100) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `siret` varchar(14) DEFAULT NULL,
  `specialites` longtext,
  `tarif_horaire` decimal(10,2) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `type_consultant` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `login_attempts` int(11) NOT NULL DEFAULT 0,
  `last_login` datetime DEFAULT NULL,
  `account_locked` tinyint(1) NOT NULL DEFAULT 0,
  `remember_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_groupe_id` (`groupe_id`),
  CONSTRAINT `fk_users_groupe_id` FOREIGN KEY (`groupe_id`) REFERENCES `groupes_entreprises` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

**🚨 NON CONFORMITÉ SILC:**
- ❌ Champ `role` directement dans `users` (viol contrat User)
- ❌ Champs métier mélangés (`specialites`, `tarif_horaire`, etc.)
- ❌ Pas de séparation User/Role/UserRole

### 🔐 **Table `roles`**

```sql
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `compagnie_id` int(11) DEFAULT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `compagnie_id` (`compagnie_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`compagnie_id`) REFERENCES `compagnies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

**🚨 NON CONFORMITÉ SILC:**
- ❌ Champ `permissions` dans `roles` (viol contrat Role)
- ❌ Lien direct avec `compagnie_id` (viol contrat Role)
- ❌ Pas de champ `code` unique et immuable

### 🏢 **Table `compagnies`**

```sql
CREATE TABLE `compagnies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `tax_id` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT 'Côte d''Ivoire',
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `fiscal_year_start` int(11) DEFAULT 1,
  `currency` varchar(255) DEFAULT 'XOF',
  `accounting_standard` varchar(50) DEFAULT 'OHADA',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `registration_number` (`registration_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

**✅ PARTIELLEMENT CONFORME SILC:**
- ✅ Structure de base correcte
- ❌ Manque champ `type` (opérationnelle/holding/non opérationnelle)
- ❌ Manque champ `is_active` (existe mais pas d'état `suspended`)

### 👥 **Table `groupes_entreprises`**

```sql
CREATE TABLE `groupes_entreprises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `devise` varchar(3) DEFAULT 'XOF',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

**🚨 NON CONFORMITÉ SILC:**
- ❌ Manque champ `type` (organisationnel/fonctionnel/transversal)
- ❌ Manque champ `is_active`
- ❌ Manque lien avec `company_id`
- ❌ Pas de cycle de vie explicite

---

## 🚨 **ANALYSE DE CONFORMITÉ SILC**

### ❌ **Violations Majeures**

1. **Table `users`**
   - Rôle intégré (viol contrat User)
   - Champs métier mélangés
   - Pas de séparation User/Role/UserRole

2. **Table `roles`**
   - Permissions intégrées (viol contrat Role)
   - Lien direct avec compagnies
   - Pas de champ `code` immuable

3. **Manques Critiques**
   - ❌ Pas de table `user_roles`
   - ❌ Pas de table `contexts`
   - ❌ Pas de table `company_context`
   - ❌ Pas de table `group_context`

### 📊 **Score de Conformité SILC**

| Contrat | État Actuel | Score |
|---------|-------------|-------|
| User | ❌ Violé | 20% |
| Role | ❌ Violé | 25% |
| UserRole | ❌ Manquant | 0% |
| Context | ❌ Manquant | 0% |
| Group | ⚠️ Partiel | 40% |
| Company | ⚠️ Partiel | 60% |

**Score global:** **24%** ❌

---

## 🔧 **RECOMMANDATIONS DE MIGRATION**

### 🎯 **Priorité 1 - Correction Structurelle**

1. **Créer table `user_roles`**
2. **Créer table `contexts`**
3. **Créer table `company_context`**
4. **Créer table `group_context`**

### 🎯 **Priorité 2 - Nettoyage Tables**

1. **Retirer `role` de `users`**
2. **Retirer `permissions` de `roles`**
3. **Ajouter champs manquants**

### 🎯 **Priorité 3 - Migration Données**

1. **Migrer roles vers `user_roles`**
2. **Créer contexts par défaut**
3. **Mettre à jour les clés étrangères**

---

## 📋 **SYNTHÈSE**

**État actuel:** Base de données fonctionnelle mais **NON CONFORME SILC**

**Problèmes principaux:**
- Architecture monolithique vs contractuelle
- Mélange des responsabilités
- Manque des tables relationnelles critiques

**Action requise:** Migration complète vers structure SILC pour atteindre conformité 100%

---

*Document généré depuis XAMPP MySQL - SPOFE v2.1*
