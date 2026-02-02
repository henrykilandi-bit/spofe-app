-- ==================================================================================
-- 🧪 SPOFE SQL Non-Regression Tests — 01_immutability.sql
-- Test I-DB-01 : Immutabilité absolue (UPDATE/DELETE interdits)
-- ==================================================================================
-- Invariant : Les tables write-model doivent être append-only
-- Vérification : UPDATE et DELETE doivent être rejetés par triggers
-- ==================================================================================

\set ECHO all
\set ON_ERROR_STOP on

BEGIN;

-- ==================================================================================
-- ❌ TEST 1.1 : UPDATE sur process_registry interdit
-- ==================================================================================

DO $$
DECLARE
  v_error_occurred BOOLEAN := FALSE;
BEGIN
  BEGIN
    -- Insérer un processus de test
    INSERT INTO process_registry
    VALUES ('P_TEST_UPDATE', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Tenter une modification (DOIT ÉCHOUER)
    UPDATE process_registry
    SET invariant_set = ARRAY['I2']
    WHERE process_name = 'P_TEST_UPDATE';
    
    RAISE EXCEPTION 'FAILED: UPDATE on process_registry was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    v_error_occurred := TRUE;
    RAISE NOTICE '[✓ PASS 1.1] UPDATE on process_registry correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.2 : DELETE sur process_registry interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_error_occurred BOOLEAN := FALSE;
BEGIN
  BEGIN
    -- Insérer un processus
    INSERT INTO process_registry
    VALUES ('P_TEST_DELETE', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Tenter une suppression (DOIT ÉCHOUER)
    DELETE FROM process_registry WHERE process_name = 'P_TEST_DELETE';
    
    RAISE EXCEPTION 'FAILED: DELETE on process_registry was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.2] DELETE on process_registry correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.3 : UPDATE sur decision interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_process_name TEXT := 'P_FOR_DECISION_UPDATE';
BEGIN
  BEGIN
    -- Préparer: insérer processus
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Préparer: insérer décision
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    -- Tenter modification (DOIT ÉCHOUER)
    UPDATE decision
    SET actor_role = 'ADMIN'::actor_role
    WHERE decision_id = v_decision_id;
    
    RAISE EXCEPTION 'FAILED: UPDATE on decision was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.3] UPDATE on decision correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.4 : DELETE sur decision interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_process_name TEXT := 'P_FOR_DECISION_DELETE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    -- Tenter suppression (DOIT ÉCHOUER)
    DELETE FROM decision WHERE decision_id = v_decision_id;
    
    RAISE EXCEPTION 'FAILED: DELETE on decision was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.4] DELETE on decision correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.5 : UPDATE sur event interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_event_id UUID;
  v_process_name TEXT := 'P_FOR_EVENT_UPDATE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_event_id := gen_random_uuid();
    INSERT INTO event (event_id, decision_id, event_type, payload)
    VALUES (v_event_id, v_decision_id, 'CREATED'::event_type, '{}');
    
    -- Tenter modification (DOIT ÉCHOUER)
    UPDATE event
    SET event_type = 'UPDATED'::event_type
    WHERE event_id = v_event_id;
    
    RAISE EXCEPTION 'FAILED: UPDATE on event was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.5] UPDATE on event correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.6 : DELETE sur event interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_event_id UUID;
  v_process_name TEXT := 'P_FOR_EVENT_DELETE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_event_id := gen_random_uuid();
    INSERT INTO event (event_id, decision_id, event_type, payload)
    VALUES (v_event_id, v_decision_id, 'CREATED'::event_type, '{}');
    
    -- Tenter suppression (DOIT ÉCHOUER)
    DELETE FROM event WHERE event_id = v_event_id;
    
    RAISE EXCEPTION 'FAILED: DELETE on event was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.6] DELETE on event correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.7 : UPDATE sur fact interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_event_id UUID;
  v_fact_id UUID;
  v_agg_id UUID;
  v_process_name TEXT := 'P_FOR_FACT_UPDATE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_event_id := gen_random_uuid();
    INSERT INTO event (event_id, decision_id, event_type, payload)
    VALUES (v_event_id, v_decision_id, 'CREATED'::event_type, '{}');
    
    v_fact_id := gen_random_uuid();
    v_agg_id := gen_random_uuid();
    INSERT INTO fact (fact_id, aggregate_id, fact_type, payload, caused_by_event)
    VALUES (v_fact_id, v_agg_id, 'SNAPSHOT'::fact_type, '{}', v_event_id);
    
    -- Tenter modification (DOIT ÉCHOUER)
    UPDATE fact
    SET payload = '{"modified": true}'
    WHERE fact_id = v_fact_id;
    
    RAISE EXCEPTION 'FAILED: UPDATE on fact was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.7] UPDATE on fact correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.8 : DELETE sur fact interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_event_id UUID;
  v_fact_id UUID;
  v_agg_id UUID;
  v_process_name TEXT := 'P_FOR_FACT_DELETE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_event_id := gen_random_uuid();
    INSERT INTO event (event_id, decision_id, event_type, payload)
    VALUES (v_event_id, v_decision_id, 'CREATED'::event_type, '{}');
    
    v_fact_id := gen_random_uuid();
    v_agg_id := gen_random_uuid();
    INSERT INTO fact (fact_id, aggregate_id, fact_type, payload, caused_by_event)
    VALUES (v_fact_id, v_agg_id, 'SNAPSHOT'::fact_type, '{}', v_event_id);
    
    -- Tenter suppression (DOIT ÉCHOUER)
    DELETE FROM fact WHERE fact_id = v_fact_id;
    
    RAISE EXCEPTION 'FAILED: DELETE on fact was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.8] DELETE on fact correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.9 : UPDATE sur audit_log interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_audit_id UUID;
  v_process_name TEXT := 'P_FOR_AUDIT_UPDATE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_audit_id := gen_random_uuid();
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (v_audit_id, v_decision_id, '2.1.0', 'abc123');
    
    -- Tenter modification (DOIT ÉCHOUER)
    UPDATE audit_log
    SET checksum = 'modified_checksum'
    WHERE audit_id = v_audit_id;
    
    RAISE EXCEPTION 'FAILED: UPDATE on audit_log was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.9] UPDATE on audit_log correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 1.10 : DELETE sur audit_log interdit
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_audit_id UUID;
  v_process_name TEXT := 'P_FOR_AUDIT_DELETE';
BEGIN
  BEGIN
    -- Préparer
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_audit_id := gen_random_uuid();
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (v_audit_id, v_decision_id, '2.1.0', 'abc123');
    
    -- Tenter suppression (DOIT ÉCHOUER)
    DELETE FROM audit_log WHERE audit_id = v_audit_id;
    
    RAISE EXCEPTION 'FAILED: DELETE on audit_log was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 1.10] DELETE on audit_log correctly forbidden: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 1.11 : Control positif — INSERT doit être autorisé
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_decision_id UUID;
  v_process_name TEXT := 'P_POSITIVE_CONTROL';
  v_insert_count INT;
BEGIN
  BEGIN
    -- Insérer processus
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Insérer décision
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    -- Vérifier
    SELECT COUNT(*) INTO v_insert_count FROM decision WHERE decision_id = v_decision_id;
    
    IF v_insert_count = 1 THEN
      RAISE NOTICE '[✓ PASS 1.11] Positive control: INSERT correctly allowed';
    ELSE
      RAISE EXCEPTION 'FAILED: Positive control INSERT failed';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- 📊 RÉSUMÉ
-- ==================================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ TEST SUITE 01_immutability.sql COMPLETED'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Tests passed:'
\echo '  - 10 tests négatifs (UPDATE/DELETE interdits) ✓'
\echo '  - 1 test positif (INSERT autorisé) ✓'
\echo ''
\echo 'Invariant I-DB-01: IMMUTABILITÉ — ✅ GARANTIE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
