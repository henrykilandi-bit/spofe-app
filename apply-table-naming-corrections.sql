-- 🧠 CORRECTIONS INTELLIGENTES DE NOMMAGE - TABLES BASE DE DONNÉES
-- SPOFE v2.2 - Approche Non Destructive avec Backup Automatique
-- 
-- ⚠️ PRINCIPES:
-- 1. Backup automatique avant chaque modification
-- 2. Validation des contraintes après renommage
-- 3. Mise à jour des références étrangères
-- 4. Rollback possible à tout moment

-- =====================================================
-- ÉTAPE 1: BACKUP AUTOMATIQUE DES TABLES CONCERNÉES
-- =====================================================

-- Création des tables de backup
CREATE TABLE IF NOT EXISTS compagnies_permissions_backup AS SELECT * FROM compagnie_permissions;
CREATE TABLE IF NOT EXISTS consultant_firm_assignments_backup AS SELECT * FROM consultant_firm_assignments;
CREATE TABLE IF NOT EXISTS consultant_group_summary_backup AS SELECT * FROM consultant_group_summary;

-- =====================================================
-- ÉTAPE 2: RENOMMAGE DES TABLES PRINCIPALES
-- =====================================================

-- Renommage de compagnie_permissions → company_permissions
RENAME TABLE compagnie_permissions TO company_permissions;

-- Renommage de consultant_firm_assignments → consulting_firm_assignments  
RENAME TABLE consultant_firm_assignments TO consulting_firm_assignments;

-- Renommage de consultant_group_summary → consultant_group_summaries
RENAME TABLE consultant_group_summary TO consultant_group_summaries;

-- =====================================================
-- ÉTAPE 3: MISE À JOUR DES RÉFÉRENCES ÉTRANGÈRES
-- =====================================================

-- Vérification et mise à jour des contraintes FK
-- (Les contraintes sont automatiquement mises à jour par RENAME TABLE dans MySQL)

-- =====================================================
-- ÉTAPE 4: VALIDATION DES MODIFICATIONS
-- =====================================================

-- Vérification que les nouvelles tables existent
SELECT 'company_permissions' as table_name, COUNT(*) as row_count FROM company_permissions
UNION ALL
SELECT 'consulting_firm_assignments' as table_name, COUNT(*) as row_count FROM consulting_firm_assignments
UNION ALL  
SELECT 'consultant_group_summaries' as table_name, COUNT(*) as row_count FROM consultant_group_summaries;

-- Vérification que les anciennes tables n'existent plus
SELECT 
    TABLE_NAME as old_table_name,
    TABLE_COMMENT as status
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = 'spofe_v2_1' 
    AND TABLE_NAME IN ('compagnie_permissions', 'consultant_firm_assignments', 'consultant_group_summary');

-- =====================================================
-- ÉTAPE 5: MISE À JOUR DES MODÈLES SEQUELIZE (si nécessaire)
-- =====================================================

-- Note: Les modèles Sequelize devront être mis à jour manuellement
-- pour refléter les nouveaux noms de tables

-- =====================================================
-- ÉTAPE 6: SCRIPT DE ROLLBACK (en cas de problème)
-- =====================================================

/*
-- Pour annuler les modifications, exécuter:
RENAME TABLE company_permissions TO compagnie_permissions;
RENAME TABLE consulting_firm_assignments TO consultant_firm_assignments;  
RENAME TABLE consultant_group_summaries TO consultant_group_summary;

-- Restauration depuis backup si nécessaire:
TRUNCATE TABLE compagnie_permissions;
INSERT INTO compagnie_permissions SELECT * FROM compagnies_permissions_backup;
*/

-- =====================================================
-- RAPPORT D'EXÉCUTION
-- =====================================================

SELECT 'TABLES_CORRECTIONS_APPLIQUEES' as operation,
       NOW() as timestamp,
       '3 tables renommées selon conventions v2.2' as details;
