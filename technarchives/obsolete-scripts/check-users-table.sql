-- Vérifier la structure complète de la table users
DESCRIBE spofe_v2_1.users;

-- Vérifier si la colonne groupe_id existe
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'spofe_v2_1' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'groupe_id';

-- Lister toutes les colonnes de la table
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'spofe_v2_1' 
  AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
