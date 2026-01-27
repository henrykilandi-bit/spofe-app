-- ============================================================
-- FIX: Ajouter la colonne groupe_id à la table users
-- Pour MariaDB/MySQL XAMPP
-- ============================================================

USE spofe_v2_1;

-- 1. Ajouter la colonne groupe_id si elle n'existe pas
ALTER TABLE users ADD COLUMN IF NOT EXISTS groupe_id INT NULL AFTER id;

-- 2. Ajouter l'index d'abord
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_groupe_id (groupe_id);

-- 3. Ajouter la contrainte FK CORRECTEMENT pour MariaDB
ALTER TABLE users 
ADD CONSTRAINT fk_users_groupe_id 
FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 4. Vérifier le résultat
SELECT '=== Colonnes de la table users ===' AS status;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA='spofe_v2_1' 
AND TABLE_NAME='users'
ORDER BY ORDINAL_POSITION;

-- 5. Afficher les contraintes FK
SELECT '=== Contraintes FK ===' AS status;
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA='spofe_v2_1'
AND TABLE_NAME='users'
AND REFERENCED_TABLE_NAME IS NOT NULL;
