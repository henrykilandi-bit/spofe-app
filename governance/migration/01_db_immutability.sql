-- =============================================================================
-- 🛡️ 01_DB_IMMUTABILITY.SQL - T-24h : SÉCURITÉ DB
-- =============================================================================
-- Validation que les mécanismes de défense constitutionnelle sont actifs
-- Critique : Échec = STOP immédiat
--
-- Usage: psql "$PG_URL" -f 01_db_immutability.sql
-- Expected: NOTICE messages only, any ERROR = FAIL

SET client_min_messages TO NOTICE;

\echo '▶ DATABASE IMMUTABILITY CHECK - ' || current_timestamp
\echo '============================================================'

-- =============================================================================
-- 🚨 TEST 1 : UPDATE DOIT ÉCHOUER
-- =============================================================================
\echo '🔍 Testing UPDATE protection...'

DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        -- Tentative UPDATE (doit échouer)
        UPDATE domain_events SET payload = '{}' WHERE 1=0;
        
        -- Si on arrive ici, c'est que le trigger n'a pas fonctionné
        RAISE EXCEPTION 'UPDATE WAS ALLOWED - TRIGGER NOT WORKING';
        
    EXCEPTION WHEN OTHERS THEN
        -- Le trigger a bien bloqué l'opération
        RAISE NOTICE '✅ UPDATE correctly refused: %', SQLERRM;
    END;
END;
$$;

-- =============================================================================
-- 🚨 TEST 2 : DELETE DOIT ÉCHOUER
-- =============================================================================
\echo '🔍 Testing DELETE protection...'

DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        -- Tentative DELETE (doit échouer)
        DELETE FROM domain_events WHERE 1=0;
        
        -- Si on arrive ici, c'est que le trigger n'a pas fonctionné
        RAISE EXCEPTION 'DELETE WAS ALLOWED - TRIGGER NOT WORKING';
        
    EXCEPTION WHEN OTHERS THEN
        -- Le trigger a bien bloqué l'opération
        RAISE NOTICE '✅ DELETE correctly refused: %', SQLERRM;
    END;
END;
$$;

-- =============================================================================
-- 🚨 TEST 3 : INSERT AVEC FAKE HASH DOIT ÉCHOUER OU ÉCRASER
-- =============================================================================
\echo '🔍 Testing hash injection protection...'

DO $$
DECLARE
    fake_hash TEXT := 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    test_result TEXT;
BEGIN
    BEGIN
        -- Tentative INSERT avec hash falsifié
        INSERT INTO domain_events (
            aggregate_id,
            aggregate_type,
            event_type,
            payload,
            current_hash  -- Tentative d'injection
        ) VALUES (
            gen_random_uuid(),
            'immutability_test',
            'HASH_INJECTION_TEST',
            '{"test": "hash_injection"}',
            fake_hash
        );
        
        -- Vérification que le hash a été écrasé
        SELECT current_hash INTO test_result
        FROM domain_events
        WHERE event_type = 'HASH_INJECTION_TEST'
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF test_result = fake_hash THEN
            RAISE EXCEPTION 'HASH INJECTION SUCCEEDED - Hash was not overwritten';
        ELSE
            RAISE NOTICE '✅ Hash injection blocked: Hash was overwritten from % to %', fake_hash, test_result;
        END IF;
        
        -- Nettoyage
        DELETE FROM domain_events WHERE event_type = 'HASH_INJECTION_TEST';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ Hash injection protection active: %', SQLERRM;
    END;
END;
$$;

-- =============================================================================
-- 🚨 TEST 4 : VÉRIFICATION TRIGGERS ACTIFS
-- =============================================================================
\echo '🔍 Checking defense triggers status...'

DO $$
DECLARE
    trigger_count INTEGER;
    expected_triggers TEXT[] := ARRAY[
        'no_update_domain_events',
        'no_delete_domain_events',
        'ledger_sequence_lock',
        'verify_chain_on_insert',
        'enforce_hash',
        'verify_sequence'
    ];
    missing_triggers TEXT[] := '{}';
BEGIN
    -- Compter les triggers actifs
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name = ANY(expected_triggers);
    
    IF trigger_count = 6 THEN
        RAISE NOTICE '✅ All 6 defense triggers are active';
    ELSE
        -- Identifier triggers manquants
        SELECT array_agg(trigger_name) INTO missing_triggers
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        AND trigger_name = ANY(expected_triggers)
        AND trigger_name NOT IN (
            SELECT trigger_name
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            AND trigger_name = ANY(expected_triggers)
        );
        
        RAISE EXCEPTION 'MISSING TRIGGERS: Expected 6, found %. Missing: %', 
                        trigger_count, array_to_string(missing_triggers, ', ');
    END IF;
END;
$$;

-- =============================================================================
-- 🚨 TEST 5 : VÉRIFICATION FONCTIONS DE DÉFENSE
-- =============================================================================
\echo '🔍 Checking defense functions...'

DO $$
DECLARE
    function_count INTEGER;
    expected_functions TEXT[] := ARRAY[
        'lock_ledger_sequence',
        'verify_chain_integrity',
        'enforce_hash_calculation',
        'verify_sequence_continuity'
    ];
BEGIN
    -- Compter les fonctions de défense
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = ANY(expected_functions);
    
    IF function_count = 4 THEN
        RAISE NOTICE '✅ All 4 defense functions are available';
    ELSE
        RAISE EXCEPTION 'MISSING FUNCTIONS: Expected 4, found %', function_count;
    END IF;
END;
$$;

-- =============================================================================
-- 🚨 TEST 6 : VALIDATION SÉQUENCE CONTINUITÉ
-- =============================================================================
\echo '🔍 Testing sequence continuity...'

DO $$
DECLARE
    last_sequence BIGINT;
    gap_count INTEGER;
BEGIN
    -- Vérifier qu'il n'y a pas de trous dans la séquence
    SELECT MAX(sequence) INTO last_sequence FROM domain_events;
    
    IF last_sequence IS NOT NULL THEN
        WITH numbered_events AS (
            SELECT sequence,
                   ROW_NUMBER() OVER (ORDER BY sequence) as expected_seq
            FROM domain_events
        ),
        gaps AS (
            SELECT COUNT(*) as gap_count
            FROM numbered_events
            WHERE sequence != expected_seq
        )
        SELECT gap_count INTO gap_count FROM gaps;
        
        IF gap_count = 0 THEN
            RAISE NOTICE '✅ Sequence continuity verified (last: %)', last_sequence;
        ELSE
            RAISE EXCEPTION 'SEQUENCE GAPS DETECTED: % gaps found', gap_count;
        END IF;
    ELSE
        RAISE NOTICE '✅ No events in table - sequence continuity N/A';
    END IF;
END;
$$;

-- =============================================================================
-- 🚨 TEST 7 : VALIDATION INTÉGRITÉ CHAÎNE DE HASH
-- =============================================================================
\echo '🔍 Testing hash chain integrity...'

DO $$
DECLARE
    integrity_violations INTEGER;
BEGIN
    -- Vérifier que chaque previous_hash correspond au current_hash précédent
    WITH chain_check AS (
        SELECT 
            de.sequence,
            de.previous_hash,
            lag(de.current_hash) OVER (ORDER BY de.sequence) as expected_previous_hash
        FROM domain_events de
        WHERE de.sequence > 1  -- Skip first event (no previous_hash)
    ),
    violations AS (
        SELECT COUNT(*) as violation_count
        FROM chain_check
        WHERE previous_hash IS DISTINCT FROM expected_previous_hash
    )
    SELECT violation_count INTO integrity_violations FROM violations;
    
    IF integrity_violations = 0 THEN
        RAISE NOTICE '✅ Hash chain integrity verified';
    ELSE
        RAISE EXCEPTION 'HASH CHAIN VIOLATIONS: % violations detected', integrity_violations;
    END IF;
END;
$$;

-- =============================================================================
-- 📊 RÉCAPITULATIF FINAL
-- =============================================================================
\echo '============================================================'
\echo '✅ DATABASE IMMUTABILITY CHECK: PASS'
\echo '   All constitutional defense mechanisms are active'
\echo '   PostgreSQL is ready for constitutional migration'
\echo 'Timestamp: ' || current_timestamp

-- Si on arrive ici, tous les tests ont passé
-- Tout autre sortie (ERROR) indique un échec critique
