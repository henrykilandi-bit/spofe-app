-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: spofe_v2_1
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `spofe_v2_1`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `spofe_v2_1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `spofe_v2_1`;

--
-- Table structure for table `account_balances`
--

DROP TABLE IF EXISTS `account_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_compte_id` int(11) NOT NULL,
  `periode` varchar(7) DEFAULT NULL,
  `solde_debit` decimal(15,2) DEFAULT 0.00,
  `solde_credit` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp - null = actif',
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_compte_id` (`numero_compte_id`,`periode`),
  UNIQUE KEY `idx_balances_compte_periode` (`numero_compte_id`,`periode`),
  KEY `idx_account_balances_deleted_at` (`deleted_at`),
  KEY `idx_account_balances_created_deleted` (`created_at`,`deleted_at`),
  CONSTRAINT `account_balances_ibfk_1` FOREIGN KEY (`numero_compte_id`) REFERENCES `charts_of_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_balances`
--

LOCK TABLES `account_balances` WRITE;
/*!40000 ALTER TABLE `account_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `compagnie_id` int(11) DEFAULT NULL,
  `cle` varchar(100) NOT NULL,
  `valeur` text DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp - null = actif',
  PRIMARY KEY (`id`),
  UNIQUE KEY `compagnie_id` (`compagnie_id`,`cle`),
  KEY `idx_app_settings_deleted_at` (`deleted_at`),
  KEY `idx_app_settings_created_deleted` (`created_at`,`deleted_at`),
  CONSTRAINT `app_settings_ibfk_1` FOREIGN KEY (`compagnie_id`) REFERENCES `compagnies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_audit_logs`
--

DROP TABLE IF EXISTS `approval_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `approval_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pending_approval_id` int(11) NOT NULL,
  `action` enum('submitted','approved','rejected','changes_requested','reassigned') DEFAULT 'submitted',
  `action_by` int(11) NOT NULL,
  `action_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `comment` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  PRIMARY KEY (`id`),
  KEY `idx_pending_approval_id` (`pending_approval_id`),
  KEY `idx_action` (`action`),
  KEY `idx_action_by` (`action_by`),
  KEY `idx_action_date` (`action_date`),
  CONSTRAINT `approval_audit_logs_ibfk_1` FOREIGN KEY (`pending_approval_id`) REFERENCES `pending_approvals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `approval_audit_logs_ibfk_2` FOREIGN KEY (`action_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_audit_logs`
--

LOCK TABLES `approval_audit_logs` WRITE;
/*!40000 ALTER TABLE `approval_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_trails`
--

DROP TABLE IF EXISTS `audit_trails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_trails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `action` varchar(20) DEFAULT NULL,
  `old_values` longtext DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_entity_date` (`entity_type`,`entity_id`,`created_at`),
  KEY `idx_audit_user_date` (`user_id`,`created_at`),
  CONSTRAINT `audit_trails_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_trails`
--

LOCK TABLES `audit_trails` WRITE;
/*!40000 ALTER TABLE `audit_trails` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_trails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `available_consultants`
--

DROP TABLE IF EXISTS `available_consultants`;
/*!50001 DROP VIEW IF EXISTS `available_consultants`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `available_consultants` AS SELECT
 1 AS `id`,
  1 AS `prenom`,
  1 AS `nom`,
  1 AS `email`,
  1 AS `telephone`,
  1 AS `specialites`,
  1 AS `tarif_horaire`,
  1 AS `experience_years`,
  1 AS `role`,
  1 AS `created_at`,
  1 AS `firm_name`,
  1 AS `firm_type`,
  1 AS `active_groups_count`,
  1 AS `avg_billing_rate` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `charts_of_accounts`
--

DROP TABLE IF EXISTS `charts_of_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `charts_of_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `account_number` varchar(20) NOT NULL COMMENT 'OHADA account number (e.g., 101, 201, 301)',
  `account_name` varchar(255) NOT NULL,
  `account_type` enum('ASSETS','LIABILITIES','EQUITY','REVENUES','EXPENSES','OTHER') NOT NULL,
  `sub_account_type` varchar(100) DEFAULT NULL COMMENT 'Sub-classification (e.g., BANK, CASH, INVENTORY)',
  `description` text DEFAULT NULL,
  `parent_account_id` int(11) DEFAULT NULL COMMENT 'For hierarchical accounts',
  `is_active` tinyint(1) DEFAULT 1,
  `is_taxable` tinyint(1) DEFAULT 0,
  `allow_sub_accounts` tinyint(1) DEFAULT 1,
  `level` int(11) DEFAULT 1 COMMENT 'Hierarchy level (1=main, 2=sub, etc.)',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `charts_of_accounts_account_number_company_id` (`account_number`,`company_id`),
  KEY `parent_account_id` (`parent_account_id`),
  KEY `charts_of_accounts_company_id` (`company_id`),
  KEY `idx_charts_company` (`company_id`),
  CONSTRAINT `charts_of_accounts_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `compagnies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `charts_of_accounts_ibfk_2` FOREIGN KEY (`parent_account_id`) REFERENCES `charts_of_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charts_of_accounts`
--

LOCK TABLES `charts_of_accounts` WRITE;
/*!40000 ALTER TABLE `charts_of_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `charts_of_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compagnies`
--

DROP TABLE IF EXISTS `compagnies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compagnies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `tax_id` varchar(255) DEFAULT NULL COMMENT 'From companies.taxId',
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL COMMENT 'From companies.postalCode',
  `country` varchar(255) DEFAULT 'Côte d''Ivoire',
  `phone` varchar(255) DEFAULT NULL COMMENT 'From companies.phone',
  `email` varchar(255) DEFAULT NULL COMMENT 'From companies.email',
  `website` varchar(255) DEFAULT NULL COMMENT 'From companies.website',
  `fiscal_year_start` int(11) DEFAULT 1 COMMENT 'Month when fiscal year starts (1-12)',
  `currency` varchar(255) DEFAULT 'XOF',
  `accounting_standard` varchar(50) DEFAULT 'OHADA' COMMENT 'From companies.accountingStandard',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `registration_number` (`registration_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compagnies`
--

LOCK TABLES `compagnies` WRITE;
/*!40000 ALTER TABLE `compagnies` DISABLE KEYS */;
/*!40000 ALTER TABLE `compagnies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compagnies_permissions_backup`
--

DROP TABLE IF EXISTS `compagnies_permissions_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compagnies_permissions_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `compagnie_id` int(11) NOT NULL,
  `permission` varchar(50) NOT NULL,
  `granted_by` int(11) NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compagnies_permissions_backup`
--

LOCK TABLES `compagnies_permissions_backup` WRITE;
/*!40000 ALTER TABLE `compagnies_permissions_backup` DISABLE KEYS */;
/*!40000 ALTER TABLE `compagnies_permissions_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_permissions`
--

DROP TABLE IF EXISTS `company_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `compagnie_id` int(11) NOT NULL,
  `permission` varchar(50) NOT NULL,
  `granted_by` int(11) NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_compagnie_permission` (`user_id`,`compagnie_id`,`permission`),
  KEY `idx_compagnie_permissions_user` (`user_id`),
  KEY `idx_compagnie_permissions_compagnie` (`compagnie_id`),
  KEY `idx_compagnie_permissions_active` (`is_active`),
  CONSTRAINT `company_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_permissions_ibfk_2` FOREIGN KEY (`compagnie_id`) REFERENCES `compagnies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_permissions`
--

LOCK TABLES `company_permissions` WRITE;
/*!40000 ALTER TABLE `company_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `company_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultant_company_access`
--

DROP TABLE IF EXISTS `consultant_company_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultant_company_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consultant_id` int(11) NOT NULL,
  `compagnie_id` int(11) NOT NULL,
  `groupe_id` int(11) NOT NULL,
  `access_level` enum('read','write','audit','review') DEFAULT 'read',
  `specific_permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specific_permissions`)),
  `reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_consultant_company` (`consultant_id`,`compagnie_id`),
  KEY `compagnie_id` (`compagnie_id`),
  KEY `groupe_id` (`groupe_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `consultant_company_access_ibfk_1` FOREIGN KEY (`consultant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_company_access_ibfk_2` FOREIGN KEY (`compagnie_id`) REFERENCES `compagnies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_company_access_ibfk_3` FOREIGN KEY (`groupe_id`) REFERENCES `groupes_entreprises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_company_access_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultant_company_access`
--

LOCK TABLES `consultant_company_access` WRITE;
/*!40000 ALTER TABLE `consultant_company_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultant_company_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultant_firm_assignments_backup`
--

DROP TABLE IF EXISTS `consultant_firm_assignments_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultant_firm_assignments_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `consulting_firm_id` int(11) NOT NULL,
  `role_in_firm` varchar(50) DEFAULT 'consultant',
  `is_primary_firm` tinyint(1) DEFAULT 1,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` int(11) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultant_firm_assignments_backup`
--

LOCK TABLES `consultant_firm_assignments_backup` WRITE;
/*!40000 ALTER TABLE `consultant_firm_assignments_backup` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultant_firm_assignments_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultant_group_access`
--

DROP TABLE IF EXISTS `consultant_group_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultant_group_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `groupe_id` int(11) NOT NULL,
  `access_level` enum('read','write','admin') DEFAULT 'read',
  `granted_by` int(11) NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_consultant_group` (`user_id`,`groupe_id`),
  KEY `granted_by` (`granted_by`),
  KEY `idx_consultant_group_access_user` (`user_id`),
  KEY `idx_consultant_group_access_group` (`groupe_id`),
  KEY `idx_consultant_group_access_level` (`access_level`),
  KEY `idx_consultant_group_access_active` (`is_active`),
  KEY `idx_consultant_group_access_deleted` (`deleted_at`),
  CONSTRAINT `consultant_group_access_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_group_access_ibfk_2` FOREIGN KEY (`groupe_id`) REFERENCES `groupes_entreprises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_group_access_ibfk_3` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultant_group_access`
--

LOCK TABLES `consultant_group_access` WRITE;
/*!40000 ALTER TABLE `consultant_group_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultant_group_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultant_group_assignments`
--

DROP TABLE IF EXISTS `consultant_group_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultant_group_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `consultant_id` int(11) NOT NULL,
  `groupe_id` int(11) NOT NULL,
  `status` enum('active','pending','suspended','terminated') DEFAULT 'pending',
  `contract_type` varchar(50) DEFAULT NULL,
  `contract_reference` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `billing_rate` decimal(10,2) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_consultant_group` (`consultant_id`,`groupe_id`),
  KEY `groupe_id` (`groupe_id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `consultant_group_assignments_ibfk_1` FOREIGN KEY (`consultant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_group_assignments_ibfk_2` FOREIGN KEY (`groupe_id`) REFERENCES `groupes_entreprises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultant_group_assignments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `consultant_group_assignments_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultant_group_assignments`
--

LOCK TABLES `consultant_group_assignments` WRITE;
/*!40000 ALTER TABLE `consultant_group_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultant_group_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `consultant_group_summaries`
--

DROP TABLE IF EXISTS `consultant_group_summaries`;
/*!50001 DROP VIEW IF EXISTS `consultant_group_summaries`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `consultant_group_summaries` AS SELECT
 1 AS `groupe_id`,
  1 AS `groupe_nom`,
  1 AS `total_consultants`,
  1 AS `active_consultants`,
  1 AS `pending_consultants`,
  1 AS `avg_billing_rate`,
  1 AS `consultant_names` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `consultant_group_summary_backup`
--

DROP TABLE IF EXISTS `consultant_group_summary_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultant_group_summary_backup` (
  `groupe_id` int(11) NOT NULL,
  `groupe_nom` varchar(255) NOT NULL,
  `total_consultants` bigint(21) NOT NULL DEFAULT 0,
  `active_consultants` decimal(22,0) DEFAULT NULL,
  `pending_consultants` decimal(22,0) DEFAULT NULL,
  `avg_billing_rate` decimal(14,6) DEFAULT NULL,
  `consultant_names` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultant_group_summary_backup`
--

LOCK TABLES `consultant_group_summary_backup` WRITE;
/*!40000 ALTER TABLE `consultant_group_summary_backup` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultant_group_summary_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consulting_firm_assignments`
--

DROP TABLE IF EXISTS `consulting_firm_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consulting_firm_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `consulting_firm_id` int(11) NOT NULL,
  `role_in_firm` varchar(50) DEFAULT 'consultant',
  `is_primary_firm` tinyint(1) DEFAULT 1,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` int(11) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_consultant_firm` (`user_id`,`consulting_firm_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_consultant_firm_assignments_user` (`user_id`),
  KEY `idx_consultant_firm_assignments_firm` (`consulting_firm_id`),
  KEY `idx_consultant_firm_assignments_active` (`is_active`),
  KEY `idx_consultant_firm_assignments_deleted` (`deleted_at`),
  CONSTRAINT `consulting_firm_assignments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consulting_firm_assignments_ibfk_2` FOREIGN KEY (`consulting_firm_id`) REFERENCES `consulting_firms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consulting_firm_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consulting_firm_assignments`
--

LOCK TABLES `consulting_firm_assignments` WRITE;
/*!40000 ALTER TABLE `consulting_firm_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `consulting_firm_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consulting_firms`
--

DROP TABLE IF EXISTS `consulting_firms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consulting_firms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `siret` varchar(14) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_telephone` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `address` varchar(255) DEFAULT NULL COMMENT 'Adresse du cabinet',
  `phone` varchar(50) DEFAULT NULL COMMENT 'Téléphone du cabinet',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email du cabinet',
  `is_active` tinyint(1) DEFAULT NULL COMMENT 'Cabinet actif ou non',
  `registration_number` varchar(255) DEFAULT NULL COMMENT 'Numéro d''enregistrement (RCCM/SIRET)',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Date de suppression (soft delete)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `siret` (`siret`),
  KEY `created_by` (`created_by`),
  KEY `idx_consulting_firms_name` (`name`),
  KEY `idx_consulting_firms_registration` (`registration_number`),
  KEY `idx_consulting_firms_active` (`is_active`),
  KEY `idx_consulting_firms_deleted` (`deleted_at`),
  CONSTRAINT `consulting_firms_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consulting_firms`
--

LOCK TABLES `consulting_firms` WRITE;
/*!40000 ALTER TABLE `consulting_firms` DISABLE KEYS */;
/*!40000 ALTER TABLE `consulting_firms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firm_consultants`
--

DROP TABLE IF EXISTS `firm_consultants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `firm_consultants` (
  `consultant_id` int(11) NOT NULL,
  `firm_id` int(11) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  PRIMARY KEY (`consultant_id`),
  KEY `firm_id` (`firm_id`),
  CONSTRAINT `firm_consultants_ibfk_1` FOREIGN KEY (`consultant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `firm_consultants_ibfk_2` FOREIGN KEY (`firm_id`) REFERENCES `consulting_firms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firm_consultants`
--

LOCK TABLES `firm_consultants` WRITE;
/*!40000 ALTER TABLE `firm_consultants` DISABLE KEYS */;
/*!40000 ALTER TABLE `firm_consultants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groupe_super_users`
--

DROP TABLE IF EXISTS `groupe_super_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groupe_super_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `groupe_id` int(11) NOT NULL,
  `role` enum('approver','reviewer','auditor') DEFAULT 'approver',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_groupe` (`user_id`,`groupe_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_groupe_id` (`groupe_id`),
  KEY `idx_role` (`role`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `groupe_super_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `groupe_super_users_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupe_super_users`
--

LOCK TABLES `groupe_super_users` WRITE;
/*!40000 ALTER TABLE `groupe_super_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `groupe_super_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groupes_entreprises`
--

DROP TABLE IF EXISTS `groupes_entreprises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupes_entreprises`
--

LOCK TABLES `groupes_entreprises` WRITE;
/*!40000 ALTER TABLE `groupes_entreprises` DISABLE KEYS */;
INSERT INTO `groupes_entreprises` VALUES (1,'Groupe SPOFE','Groupe principal SPOFE v2.1','Sénégal','XOF','2026-01-24 00:22:39','2026-01-24 00:22:39',NULL);
/*!40000 ALTER TABLE `groupes_entreprises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `journal_code` varchar(10) NOT NULL COMMENT 'Code du journal (OD, AC, AN, etc.)',
  `entry_number` varchar(50) NOT NULL COMMENT 'Numéro unique de l''écriture comptable',
  `entry_date` date NOT NULL COMMENT 'Date de l''écriture comptable',
  `description` varchar(255) DEFAULT NULL COMMENT 'Description ou libellé de l''écriture',
  `status` enum('DRAFT','SUBMITTED','APPROVED','POSTED','REVERSED') NOT NULL DEFAULT 'POSTED',
  `total_debit` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total du débit pour cette écriture',
  `total_credit` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total du crédit pour cette écriture',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entry_number` (`entry_number`),
  UNIQUE KEY `idx_journal_company_number` (`company_id`,`entry_number`),
  KEY `user_id` (`user_id`),
  KEY `journal_entries_company_id` (`company_id`),
  KEY `journal_entries_entry_date` (`entry_date`),
  KEY `journal_entries_status` (`status`),
  KEY `idx_je_company_date` (`company_id`,`entry_date`),
  KEY `idx_je_status` (`status`),
  CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `compagnies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `journal_entries_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entry_lines`
--

DROP TABLE IF EXISTS `journal_entry_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `journal_entry_lines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `journal_entry_id` int(11) NOT NULL,
  `numero_compte_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `montant_debit` decimal(15,2) DEFAULT 0.00,
  `montant_credit` decimal(15,2) DEFAULT 0.00,
  `order_in_entry` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `journal_entry_lines_journal_entry_id` (`journal_entry_id`),
  KEY `idx_jel_entry_compte` (`journal_entry_id`,`numero_compte_id`),
  KEY `idx_jel_compte_date` (`numero_compte_id`,`created_at`),
  CONSTRAINT `journal_entry_lines_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `journal_entry_lines_ibfk_2` FOREIGN KEY (`numero_compte_id`) REFERENCES `charts_of_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entry_lines`
--

LOCK TABLES `journal_entry_lines` WRITE;
/*!40000 ALTER TABLE `journal_entry_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entry_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_audit_trails`
--

DROP TABLE IF EXISTS `login_audit_trails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_audit_trails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `login_status` enum('success','failed','blocked','2fa_required') NOT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `two_factor_required` tinyint(1) DEFAULT 0,
  `session_token` varchar(255) DEFAULT NULL,
  `remember_token_used` tinyint(1) DEFAULT 0,
  `login_attempts_before` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_login_audit_user_id` (`user_id`),
  KEY `idx_login_audit_email` (`email`),
  KEY `idx_login_audit_status` (`login_status`),
  KEY `idx_login_audit_created_at` (`created_at`),
  KEY `idx_login_audit_ip` (`ip_address`),
  CONSTRAINT `login_audit_trails_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_audit_trails`
--

LOCK TABLES `login_audit_trails` WRITE;
/*!40000 ALTER TABLE `login_audit_trails` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_audit_trails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_approvals`
--

DROP TABLE IF EXISTS `pending_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pending_approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected','changes_requested') DEFAULT 'pending',
  `validation_date` datetime DEFAULT NULL,
  `validation_notes` text DEFAULT NULL,
  `groupe_id` int(11) DEFAULT NULL,
  `required_approvals` int(11) DEFAULT 1,
  `current_approvals` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `rejected_by` int(11) DEFAULT NULL,
  `rejected_reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_email` (`email`),
  KEY `idx_groupe_id` (`groupe_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `rejected_by` (`rejected_by`),
  CONSTRAINT `pending_approvals_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pending_approvals_ibfk_2` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_approvals`
--

LOCK TABLES `pending_approvals` WRITE;
/*!40000 ALTER TABLE `pending_approvals` DISABLE KEYS */;
INSERT INTO `pending_approvals` VALUES (1,'test1@spofe.sn','Jean','Dupont','testuser1','pending',NULL,NULL,1,1,0,'2026-01-24 14:01:34','2026-01-24 14:01:34',NULL,NULL,NULL),(2,'test2@spofe.sn','Marie','Martin','testuser2','pending',NULL,NULL,1,1,0,'2026-01-24 14:01:34','2026-01-24 14:01:34',NULL,NULL,NULL),(3,'test3@spofe.sn','Pierre','Bernard','testuser3','pending',NULL,NULL,1,1,0,'2026-01-24 14:01:34','2026-01-24 14:01:34',NULL,NULL,NULL);
/*!40000 ALTER TABLE `pending_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_role_approvals`
--

DROP TABLE IF EXISTS `pending_role_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pending_role_approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`user_data`)),
  `requested_role` varchar(50) NOT NULL,
  `approver_role` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `requires_group` tinyint(1) DEFAULT 0,
  `requires_company` tinyint(1) DEFAULT 0,
  `requested_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `pending_role_approvals_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pending_role_approvals_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_role_approvals`
--

LOCK TABLES `pending_role_approvals` WRITE;
/*!40000 ALTER TABLE `pending_role_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `pending_role_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remember_tokens`
--

DROP TABLE IF EXISTS `remember_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `remember_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_remember_token` (`token`),
  KEY `idx_remember_tokens_user_id` (`user_id`),
  KEY `idx_remember_tokens_token` (`token`),
  KEY `idx_remember_tokens_expires_at` (`expires_at`),
  KEY `idx_remember_tokens_is_active` (`is_active`),
  CONSTRAINT `remember_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remember_tokens`
--

LOCK TABLES `remember_tokens` WRITE;
/*!40000 ALTER TABLE `remember_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `remember_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_approval_workflow`
--

DROP TABLE IF EXISTS `role_approval_workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_approval_workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requested_role` varchar(50) NOT NULL,
  `approver_role` varchar(50) NOT NULL,
  `min_hierarchy_level` int(11) DEFAULT NULL,
  `requires_group_creation` tinyint(1) DEFAULT 0,
  `requires_company_creation` tinyint(1) DEFAULT 0,
  `auto_approve_if_creator_has_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_approval_workflow`
--

LOCK TABLES `role_approval_workflow` WRITE;
/*!40000 ALTER TABLE `role_approval_workflow` DISABLE KEYS */;
INSERT INTO `role_approval_workflow` VALUES (1,'super_utilisateur','admin',1,1,0,0,'2026-01-24 16:58:34','2026-01-25 17:25:40'),(2,'utilisateur','super_utilisateur',2,0,1,0,'2026-01-24 16:58:34','2026-01-25 17:25:40'),(3,'super_consultant','super_utilisateur',3,0,0,0,'2026-01-24 16:58:34','2026-01-25 17:25:40'),(4,'consultant','super_utilisateur',3,0,0,0,'2026-01-24 16:58:34','2026-01-25 17:25:40');
/*!40000 ALTER TABLE `role_approval_workflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `compagnie_id` int(11) DEFAULT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `compagnie_id` (`compagnie_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`compagnie_id`) REFERENCES `compagnies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_events`
--

DROP TABLE IF EXISTS `security_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `security_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `event_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp - null = actif',
  PRIMARY KEY (`id`),
  KEY `idx_security_user` (`user_id`),
  KEY `idx_security_type` (`event_type`),
  KEY `idx_security_events_deleted_at` (`deleted_at`),
  KEY `idx_security_events_created_deleted` (`created_at`,`deleted_at`),
  KEY `idx_security_user_ip_date` (`user_id`,`ip_address`,`created_at`),
  CONSTRAINT `security_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_events`
--

LOCK TABLES `security_events` WRITE;
/*!40000 ALTER TABLE `security_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('000-snapshot-current-state.js'),('20260122-fix-soft-delete-consistency.cjs'),('20260123001-fix-dangerous-fk-constraints.cjs'),('20260123002-cleanup-fk.cjs'),('20260123002-create-critical-indexes.js'),('20260123003-create-audit-view.cjs');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `third_parties`
--

DROP TABLE IF EXISTS `third_parties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `third_parties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `type` enum('CUSTOMER','SUPPLIER','EMPLOYEE','OTHER') NOT NULL COMMENT 'Type de tiers: Client, Fournisseur, Employé, Autre',
  `code` varchar(50) NOT NULL COMMENT 'Code unique du tiers (ex: CLI-001, FOUR-002)',
  `name` varchar(255) NOT NULL COMMENT 'Nom ou raison sociale',
  `legal_form` varchar(100) DEFAULT NULL COMMENT 'Forme juridique (SARL, SAS, SA, EI...)',
  `siret` varchar(14) DEFAULT NULL COMMENT 'Numéro SIRET (14 chiffres)',
  `vat_number` varchar(50) DEFAULT NULL COMMENT 'Numéro TVA intracommunautaire',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `fax` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `address_complement` varchar(255) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'France',
  `bank_name` varchar(255) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL COMMENT 'IBAN (max 34 caractères)',
  `bic` varchar(11) DEFAULT NULL COMMENT 'BIC/SWIFT (8 ou 11 caractères)',
  `bank_code` varchar(5) DEFAULT NULL COMMENT 'Code banque (5 chiffres)',
  `branch_code` varchar(5) DEFAULT NULL COMMENT 'Code guichet (5 chiffres)',
  `account_number` varchar(11) DEFAULT NULL COMMENT 'Numéro de compte (11 caractères)',
  `rib_key` varchar(2) DEFAULT NULL COMMENT 'Clé RIB (2 chiffres)',
  `payment_terms` int(11) DEFAULT 30 COMMENT 'Délai de paiement en jours',
  `payment_method` enum('CASH','CHECK','TRANSFER','CARD','DIRECT_DEBIT','OTHER') DEFAULT 'TRANSFER',
  `discount_rate` decimal(5,2) DEFAULT 0.00 COMMENT 'Taux de remise en %',
  `credit_limit` decimal(15,2) DEFAULT NULL COMMENT 'Encours maximum autorisé',
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_blocked` tinyint(1) DEFAULT 0 COMMENT 'Tiers bloqué (dépassement encours, litige...)',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'Nom du contact principal',
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `third_parties_code_company_id` (`code`,`company_id`),
  UNIQUE KEY `third_parties_siret` (`siret`),
  KEY `third_parties_company_id` (`company_id`),
  KEY `third_parties_type` (`type`),
  KEY `third_parties_email` (`email`),
  KEY `third_parties_name` (`name`),
  CONSTRAINT `third_parties_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `compagnies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `third_parties`
--

LOCK TABLES `third_parties` WRITE;
/*!40000 ALTER TABLE `third_parties` DISABLE KEYS */;
/*!40000 ALTER TABLE `third_parties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_blacklists`
--

DROP TABLE IF EXISTS `token_blacklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `token_blacklists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `token` varchar(1024) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `token_blacklists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklists`
--

LOCK TABLES `token_blacklists` WRITE;
/*!40000 ALTER TABLE `token_blacklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `token_blacklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `two_factor_auths`
--

DROP TABLE IF EXISTS `two_factor_auths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `two_factor_auths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `secret_totp` varchar(32) DEFAULT NULL,
  `backup_codes` longtext DEFAULT NULL CHECK (json_valid(`backup_codes`)),
  `is_enabled` tinyint(1) DEFAULT 0,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `two_factor_auths_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `two_factor_auths`
--

LOCK TABLES `two_factor_auths` WRITE;
/*!40000 ALTER TABLE `two_factor_auths` DISABLE KEYS */;
/*!40000 ALTER TABLE `two_factor_auths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `specialites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specialites`)),
  `tarif_horaire` decimal(10,2) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL COMMENT 'Adresse du consultant',
  `pays` varchar(100) DEFAULT NULL COMMENT 'Pays du consultant',
  `type_consultant` varchar(50) DEFAULT NULL COMMENT 'Type de consultant (coach, mentor, etc.)',
  `website` varchar(255) DEFAULT NULL COMMENT 'Site web utilisateur/groupe',
  `description` text DEFAULT NULL COMMENT 'Description utilisateur/groupe',
  `email_verified` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Email vérifié (0=non, 1=oui)',
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0 COMMENT '2FA activé (0=non, 1=oui)',
  `login_attempts` int(11) NOT NULL DEFAULT 0 COMMENT 'Nombre de tentatives de connexion',
  `last_login` datetime DEFAULT NULL COMMENT 'Dernière connexion réussie',
  `account_locked` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Compte bloqué (0=non, 1=oui)',
  `remember_token` varchar(255) DEFAULT NULL COMMENT 'Token pour "Se souvenir de moi"',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_users_username_unique` (`username`),
  UNIQUE KEY `idx_users_email_unique` (`email`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_groupe_id` (`groupe_id`),
  KEY `idx_users_invitation_token` (`invitation_token`),
  KEY `idx_users_email_verified` (`email_verified`),
  KEY `idx_users_two_factor_enabled` (`two_factor_enabled`),
  KEY `idx_users_login_attempts` (`login_attempts`),
  KEY `idx_users_account_locked` (`account_locked`),
  KEY `idx_users_remember_token` (`remember_token`),
  KEY `idx_users_last_login` (`last_login`),
  CONSTRAINT `fk_users_groupe_id` FOREIGN KEY (`groupe_id`) REFERENCES `groupes_entreprises` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,NULL,NULL,'admin','admin@spofe.sn','$2b$10$CyGjTvng/IInc.XqJ.Nmm.0dLqrm83agwGWxv/wTgpOowUlWROGRC','admin',1,'2026-01-25 19:48:37','2026-01-25 19:48:37',NULL,99,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0,0,NULL,0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `spofe_v2_1`
--

USE `spofe_v2_1`;

--
-- Final view structure for view `available_consultants`
--

/*!50001 DROP VIEW IF EXISTS `available_consultants`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `available_consultants` AS select `u`.`id` AS `id`,`u`.`prenom` AS `prenom`,`u`.`nom` AS `nom`,`u`.`email` AS `email`,`u`.`telephone` AS `telephone`,`u`.`specialites` AS `specialites`,`u`.`tarif_horaire` AS `tarif_horaire`,`u`.`experience_years` AS `experience_years`,`u`.`role` AS `role`,`u`.`created_at` AS `created_at`,`cf`.`nom` AS `firm_name`,`cf`.`type` AS `firm_type`,(select count(0) from `consultant_group_assignments` `cga2` where `cga2`.`consultant_id` = `u`.`id` and `cga2`.`status` = 'active') AS `active_groups_count`,(select avg(`cga2`.`billing_rate`) from `consultant_group_assignments` `cga2` where `cga2`.`consultant_id` = `u`.`id` and `cga2`.`status` = 'active' and `cga2`.`billing_rate` is not null) AS `avg_billing_rate` from ((`users` `u` left join `firm_consultants` `fc` on(`u`.`id` = `fc`.`consultant_id`)) left join `consulting_firms` `cf` on(`fc`.`firm_id` = `cf`.`id`)) where `u`.`role` in ('super_consultant','consultant') and `u`.`is_active` = 1 group by `u`.`id`,`cf`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `consultant_group_summaries`
--

/*!50001 DROP VIEW IF EXISTS `consultant_group_summaries`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `consultant_group_summaries` AS select `cga`.`groupe_id` AS `groupe_id`,`ge`.`nom` AS `groupe_nom`,count(`cga`.`consultant_id`) AS `total_consultants`,sum(case when `cga`.`status` = 'active' then 1 else 0 end) AS `active_consultants`,sum(case when `cga`.`status` = 'pending' then 1 else 0 end) AS `pending_consultants`,avg(`cga`.`billing_rate`) AS `avg_billing_rate`,group_concat(distinct concat(`u`.`prenom`,' ',`u`.`nom`) separator ',') AS `consultant_names` from ((`consultant_group_assignments` `cga` join `users` `u` on(`cga`.`consultant_id` = `u`.`id`)) join `groupes_entreprises` `ge` on(`cga`.`groupe_id` = `ge`.`id`)) group by `cga`.`groupe_id`,`ge`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-30  4:22:03
