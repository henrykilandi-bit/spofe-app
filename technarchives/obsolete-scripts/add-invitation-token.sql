-- ============================================================
-- FIX: Ajouter les colonnes manquantes à la table users
-- Pour MariaDB/MySQL XAMPP
-- ============================================================

USE spofe_v2_1;

-- 1. Ajouter la colonne invitation_token si elle n'existe pas
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255) NULL AFTER groupe_id;

-- 2. Ajouter l'index pour invitation_token
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_invitation_token (invitation_token);

-- 3. Vérifier le résultat - afficher les colonnes groupe_id et invitation_token
SELECT '=== Colonnes groupe_id et invitation_token ===' AS status;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA='spofe_v2_1' 
AND TABLE_NAME='users'
AND COLUMN_NAME IN ('groupe_id', 'invitation_token', 'groupeId', 'invitationToken')
ORDER BY ORDINAL_POSITION;

-- 4. Afficher toutes les colonnes pour vérifier
SELECT '=== Toutes les colonnes ===' AS status;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA='spofe_v2_1' 
AND TABLE_NAME='users'
ORDER BY ORDINAL_POSITION;
