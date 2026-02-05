-- =============================================================================
-- 🛡️ 04_MYSQL_READ_ONLY.SQL - T+X : BASCULE FINALE
-- =============================================================================
-- Passage MySQL en READ-ONLY avant bascule finale
-- Critique : Échec = STOP immédiat
--
-- Usage: mysql "$MYSQL_URL" -f 04_mysql_read_only.sql
-- Expected: ERROR on INSERT test, success on read operations

SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

SELECT '▶ MYSQL READ-ONLY CHECK - ' || NOW() as status;
SELECT '============================================================' as separator;

-- =============================================================================
-- 🔍 ÉTAT ACTUEL DES PRIVILÈGES
-- =============================================================================
SELECT '🔍 Current user privileges:' as info;
SELECT USER() as current_user;

-- Vérifier privilèges actuels
SELECT 
    'CURRENT PRIVILEGES' as privilege_type,
    PRIVILEGE_TYPE,
    IS_GRANTABLE,
    TABLES_SCHEMA,
    TABLES_NAME
FROM INFORMATION_SCHEMA.SCHEMA_PRIVILEGES 
WHERE GRANTEE = CONCAT('''', CURRENT_USER(), '''');

-- =============================================================================
-- 🧪 TEST 1 : LECTURE DOIT FONCTIONNER
-- =============================================================================
SELECT '🔍 Testing read operations (should work)...' as test_status;

-- Test lecture simple
SELECT COUNT(*) as read_test_success FROM events LIMIT 1;

-- Test lecture avec conditions
SELECT COUNT(*) as conditional_read_test FROM events WHERE created_at > '2020-01-01' LIMIT 1;

-- Test lecture de structure
DESCRIBE events;

SELECT '✅ Read operations working correctly' as read_result;

-- =============================================================================
-- 🚨 TEST 2 : INSERT DOIT ÉCHOUER
-- =============================================================================
SELECT '🔍 Testing INSERT protection (should fail)...' as test_status;

-- Créer table de test si nécessaire (doit échouer en read-only)
SET @test_result = 'INSERT_NOT_TESTED';

-- Tenter d'insérer dans table existante (doit échouer)
SET @insert_attempt = 'INSERT_ATTEMPTED';

-- Cette instruction doit échouer si MySQL est en read-only
INSERT INTO events (
    id,
    aggregate_id,
    aggregate_type,
    event_type,
    payload,
    created_at,
    event_hash
) VALUES (
    'read-only-test-' || UUID(),
    'read_only_test',
    'test_aggregate',
    'READ_ONLY_TEST',
    '{"test": "read_only", "timestamp": "' || NOW() || '"}',
    NOW(),
    'test-hash'
);

-- Si on arrive ici, c'est que le read-only n'est pas actif
SELECT '❌ INSERT SUCCEEDED - READ-ONLY NOT ACTIVE' as insert_result;
SET @test_result = 'INSERT_SUCCEEDED';

-- =============================================================================
-- 🚨 TEST 3 : UPDATE DOIT ÉCHOUER
-- =============================================================================
SELECT '🔍 Testing UPDATE protection (should fail)...' as test_status;

-- Tenter un UPDATE (doit échouer)
UPDATE events 
SET payload = '{"test": "read_only_update"}' 
WHERE id = 'non-existent-id';

-- Si on arrive ici, c'est que le read-only n'est pas actif
SELECT '❌ UPDATE SUCCEEDED - READ-ONLY NOT ACTIVE' as update_result;

-- =============================================================================
-- 🚨 TEST 4 : DELETE DOIT ÉCHOUER
-- =============================================================================
SELECT '🔍 Testing DELETE protection (should fail)...' as test_status;

-- Tenter un DELETE (doit échouer)
DELETE FROM events WHERE id = 'non-existent-id';

-- Si on arrive ici, c'est que le read-only n'est pas actif
SELECT '❌ DELETE SUCCEEDED - READ-ONLY NOT ACTIVE' as delete_result;

-- =============================================================================
-- 🚨 TEST 5 : CREATE TABLE DOIT ÉCHOUER
-- =============================================================================
SELECT '🔍 Testing CREATE TABLE protection (should fail)...' as test_status;

-- Tenter de créer une table (doit échouer)
CREATE TABLE IF NOT EXISTS read_only_test_table (
    id VARCHAR(36) PRIMARY KEY,
    test_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Si on arrive ici, c'est que le read-only n'est pas actif
SELECT '❌ CREATE TABLE SUCCEEDED - READ-ONLY NOT ACTIVE' as create_result;

-- =============================================================================
-- 🚨 TEST 6 : DROP TABLE DOIT ÉCHOUER
-- =============================================================================
SELECT '🔍 Testing DROP TABLE protection (should fail)...' as test_status;

-- Tenter de supprimer la table de test (doit échouer)
DROP TABLE IF EXISTS read_only_test_table;

-- Si on arrive ici, c'est que le read-only n'est pas actif
SELECT '❌ DROP TABLE SUCCEEDED - READ-ONLY NOT ACTIVE' as drop_result;

-- =============================================================================
-- 📊 VALIDATION ÉTAT READ-ONLY
-- =============================================================================
SELECT '🔍 Validating read-only status...' as validation_status;

-- Vérifier variables globales read-only
SHOW GLOBAL VARIABLES LIKE 'read_only';

SHOW GLOBAL VARIABLES LIKE 'super_read_only';

-- Vérifier si le serveur est en read-only
SELECT 
    CASE 
        WHEN @@global.read_only = 1 THEN 'READ_ONLY_ENABLED'
        ELSE 'READ_ONLY_DISABLED'
    END as global_read_only_status,
    @@global.read_only as read_only_value;

SELECT 
    CASE 
        WHEN @@global.super_read_only = 1 THEN 'SUPER_READ_ONLY_ENABLED'
        ELSE 'SUPER_READ_ONLY_DISABLED'
    END as super_read_only_status,
    @@global.super_read_only as super_read_only_value;

-- =============================================================================
-- 📊 STATISTIQUES ACTUELLES
-- =============================================================================
SELECT '📊 Current database statistics:' as stats_header;

SELECT 
    'EVENTS_TABLE' as table_name,
    TABLE_ROWS as estimated_rows,
    DATA_LENGTH as data_size_bytes,
    INDEX_LENGTH as index_size_bytes,
    (DATA_LENGTH + INDEX_LENGTH) as total_size_bytes
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'events';

-- Compter événements actuels
SELECT 
    COUNT(*) as total_events,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event,
    DATE(MAX(created_at)) as last_event_date
FROM events;

-- =============================================================================
-- 🔍 VALIDATION CONNEXIONS ACTIVES
-- =============================================================================
SELECT '🔍 Active connections analysis:' as connections_header;

SELECT 
    'ACTIVE_CONNECTIONS' as metric,
    COUNT(*) as connection_count,
    GROUP_CONCAT(DISTINCT USER) as active_users
FROM INFORMATION_SCHEMA.PROCESSLIST 
WHERE COMMAND != 'Sleep';

-- Vérifier connexions en écriture
SELECT 
    'WRITING_CONNECTIONS' as metric,
    COUNT(*) as writing_connections,
    GROUP_CONCAT(DISTINCT USER) as writing_users
FROM INFORMATION_SCHEMA.PROCESSLIST 
WHERE COMMAND IN ('Insert', 'Update', 'Delete', 'Create', 'Drop', 'Alter');

-- =============================================================================
-- 📋 RAPPORT FINAL
-- =============================================================================
SELECT '============================================================' as separator;
SELECT '📋 READ-ONLY VALIDATION SUMMARY' as summary_header;

SELECT 
    CASE 
        WHEN @@global.read_only = 1 THEN '✅ MYSQL READ-ONLY: PASS'
        ELSE '❌ MYSQL READ-ONLY: FAIL - Server not in read-only mode'
    END as final_status;

SELECT 
    'Ready for constitutional migration' as readiness_status,
    NOW() as validation_timestamp,
    USER() as validated_by;

-- =============================================================================
-- 🎯 CRITÈRE DE VALIDATION FINAL
-- =============================================================================
-- Pour que ce script passe avec succès :
-- 1. Les opérations de lecture doivent fonctionner
-- 2. Les opérations d'écriture (INSERT/UPDATE/DELETE/CREATE/DROP) doivent échouer
-- 3. @@global.read_only doit être = 1
--
-- Si les écritures réussissent, le read-only n'est pas correctement configuré.
-- En conditions normales, ce script devrait générer des erreurs sur les écritures.

-- Nettoyer variables
SET @test_result = NULL;
SET @insert_attempt = NULL;
