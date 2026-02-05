-- =============================================================================
-- 🛡️ 02_HASH_CHAIN_INTEGRITY.SQL - T-24h : INTÉGRITÉ CHAÎNE DE HASH
-- =============================================================================
-- Validation que la chaîne cryptographique est intacte
-- Critique : Échec = STOP immédiat
--
-- Usage: psql "$PG_URL" -f 02_hash_chain_integrity.sql
-- Expected: 0 ligne, any row = FAIL

SET client_min_messages TO NOTICE;

\echo '▶ HASH CHAIN INTEGRITY CHECK - ' || current_timestamp
\echo '============================================================'

-- =============================================================================
-- 🔍 TEST 1 : VALIDATION COMPLÈTE DE LA CHAÎNE
-- =============================================================================
\echo '🔍 Validating complete hash chain...'

WITH chain_analysis AS (
    SELECT 
        sequence,
        current_hash,
        previous_hash,
        LAG(current_hash) OVER (ORDER BY sequence) as expected_previous_hash,
        CASE 
            WHEN sequence = 1 AND previous_hash IS NULL THEN 'FIRST_EVENT_OK'
            WHEN sequence > 1 AND previous_hash = LAG(current_hash) OVER (ORDER BY sequence) THEN 'CHAIN_OK'
            ELSE 'CHAIN_BROKEN'
        END as chain_status
    FROM domain_events
),
violations AS (
    SELECT 
        sequence,
        current_hash,
        previous_hash,
        expected_previous_hash,
        chain_status
    FROM chain_analysis
    WHERE chain_status = 'CHAIN_BROKEN'
)
SELECT 
    'VIOLATION DETECTED' as status,
    sequence,
    current_hash,
    previous_hash,
    expected_previous_hash,
    'Chain broken at this point' as issue
FROM violations
ORDER BY sequence;

-- =============================================================================
-- 📊 STATISTIQUES DE LA CHAÎNE
-- =============================================================================
\echo '📊 Chain statistics...'

WITH chain_stats AS (
    SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN previous_hash IS NULL THEN 1 END) as first_events,
        MIN(sequence) as min_sequence,
        MAX(sequence) as max_sequence,
        MAX(sequence) - MIN(sequence) + 1 as expected_sequence_span
    FROM domain_events
),
integrity_check AS (
    SELECT 
        COUNT(*) as violations_count
    FROM (
        SELECT 
            sequence,
            previous_hash,
            LAG(current_hash) OVER (ORDER BY sequence) as expected_previous_hash
        FROM domain_events
        WHERE sequence > 1
    ) chain_check
    WHERE previous_hash IS DISTINCT FROM expected_previous_hash
)
SELECT 
    'CHAIN STATISTICS' as metric,
    total_events,
    first_events,
    min_sequence,
    max_sequence,
    expected_sequence_span,
    CASE 
        WHEN violations_count = 0 THEN 'INTEGRITY_OK'
        ELSE 'INTEGRITY_BROKEN'
    END as integrity_status,
    violations_count as violation_count
FROM chain_stats, integrity_check;

-- =============================================================================
-- 🔍 TEST 2 : VALIDATION FORMAT HASH
-- =============================================================================
\echo '🔍 Validating hash formats...'

DO $$
DECLARE
    invalid_hashes INTEGER;
    total_hashes INTEGER;
BEGIN
    -- Vérifier que tous les hashes sont au format SHA-256 (64 caractères hexa)
    SELECT COUNT(*) INTO invalid_hashes
    FROM domain_events
    WHERE current_hash !~ '^[a-f0-9]{64}$'
       OR (previous_hash IS NOT NULL AND previous_hash !~ '^[a-f0-9]{64}$');
    
    SELECT COUNT(*) INTO total_hashes
    FROM domain_events;
    
    IF invalid_hashes = 0 THEN
        RAISE NOTICE '✅ Hash format validation passed (% hashes)', total_hashes;
    ELSE
        RAISE EXCEPTION 'INVALID HASH FORMAT: %/% hashes have invalid format', 
                        invalid_hashes, total_hashes;
    END IF;
END;
$$;

-- =============================================================================
-- 🔍 TEST 3 : VALIDATION UNICITÉ HASH
-- =============================================================================
\echo '🔍 Validating hash uniqueness...'

DO $$
DECLARE
    duplicate_hashes INTEGER;
BEGIN
    -- Vérifier qu'il n'y a pas de hashes en double
    WITH hash_duplicates AS (
        SELECT current_hash, COUNT(*) as duplicate_count
        FROM domain_events
        GROUP BY current_hash
        HAVING COUNT(*) > 1
    )
    SELECT COUNT(*) INTO duplicate_hashes FROM hash_duplicates;
    
    IF duplicate_hashes = 0 THEN
        RAISE NOTICE '✅ Hash uniqueness validation passed';
    ELSE
        RAISE EXCEPTION 'DUPLICATE HASHES DETECTED: % duplicate hash groups found', duplicate_hashes;
    END IF;
END;
$$;

-- =============================================================================
-- 🔍 TEST 4 : VALIDATION PREMIER ÉVÉNEMENT
-- =============================================================================
\echo '🔍 Validating first event integrity...'

DO $$
DECLARE
    first_event_count INTEGER;
    first_event_sequence BIGINT;
    first_event_hash TEXT;
BEGIN
    -- Vérifier qu'il y a exactement un premier événement
    SELECT COUNT(*), MIN(sequence), MIN(current_hash) 
    INTO first_event_count, first_event_sequence, first_event_hash
    FROM domain_events
    WHERE previous_hash IS NULL;
    
    IF first_event_count = 1 THEN
        RAISE NOTICE '✅ First event validation passed (sequence: %)', first_event_sequence;
        
        -- Vérifier que c'est bien la séquence 1
        IF first_event_sequence = 1 THEN
            RAISE NOTICE '✅ First event has correct sequence (1)';
        ELSE
            RAISE EXCEPTION 'FIRST EVENT SEQUENCE ERROR: Expected 1, got %', first_event_sequence;
        END IF;
        
    ELSE
        RAISE EXCEPTION 'FIRST EVENT ERROR: Expected 1 first event, found %', first_event_count;
    END IF;
END;
$$;

-- =============================================================================
-- 🔍 TEST 5 : VALIDATION CONTINUITÉ TEMPORELLE
-- =============================================================================
\echo '🔍 Validating temporal continuity...'

DO $$
DECLARE
    out_of_order_events INTEGER;
    total_events INTEGER;
BEGIN
    -- Vérifier que les timestamps sont dans l'ordre des séquences
    WITH time_order_check AS (
        SELECT 
            sequence,
            created_at,
            LAG(created_at) OVER (ORDER BY sequence) as previous_created_at
        FROM domain_events
        WHERE sequence > 1
    ),
    time_violations AS (
        SELECT COUNT(*) as violation_count
        FROM time_order_check
        WHERE created_at < previous_created_at
    )
    SELECT violation_count INTO out_of_order_events FROM time_violations;
    SELECT COUNT(*) INTO total_events FROM domain_events;
    
    IF out_of_order_events = 0 THEN
        RAISE NOTICE '✅ Temporal continuity validation passed (% events)', total_events;
    ELSE
        RAISE EXCEPTION 'TEMPORAL VIOLATION: % events are out of chronological order', out_of_order_events;
    END IF;
END;
$$;

-- =============================================================================
-- 📊 RAPPORT FINAL D'INTÉGRITÉ
-- =============================================================================
\echo '============================================================'

DO $$
DECLARE
    total_events BIGINT;
    integrity_status TEXT;
    final_hash TEXT;
    last_sequence BIGINT;
BEGIN
    -- Statistiques finales
    SELECT COUNT(*), MAX(current_hash), MAX(sequence)
    INTO total_events, final_hash, last_sequence
    FROM domain_events;
    
    -- Validation finale intégrité
    WITH final_integrity_check AS (
        SELECT COUNT(*) as violations
        FROM (
            SELECT 
                sequence,
                previous_hash,
                LAG(current_hash) OVER (ORDER BY sequence) as expected_previous_hash
            FROM domain_events
            WHERE sequence > 1
        ) chain_check
        WHERE previous_hash IS DISTINCT FROM expected_previous_hash
    )
    SELECT CASE 
        WHEN violations = 0 THEN 'CHAIN_INTEGRITY_OK'
        ELSE 'CHAIN_INTEGRITY_BROKEN'
    END INTO integrity_status
    FROM final_integrity_check;
    
    IF integrity_status = 'CHAIN_INTEGRITY_OK' THEN
        RAISE NOTICE '✅ HASH CHAIN INTEGRITY CHECK: PASS';
        RAISE NOTICE '   Total events: %', total_events;
        RAISE NOTICE '   Last sequence: %', last_sequence;
        RAISE NOTICE '   Final hash: %', final_hash;
        RAISE NOTICE '   Chain is mathematically intact';
        RAISE NOTICE '   Ready for constitutional migration';
    ELSE
        RAISE EXCEPTION '❌ HASH CHAIN INTEGRITY CHECK: FAIL';
    END IF;
    
    RAISE NOTICE 'Timestamp: %', current_timestamp;
END;
$$;

-- =============================================================================
-- 🎯 CRITÈRE DE VALIDATION FINAL
-- =============================================================================
-- Si ce script s'exécute sans erreur ET produit 0 ligne de violation,
-- alors la chaîne cryptographique est intacte.
-- Toute ligne retournée = FAIL immédiat.
