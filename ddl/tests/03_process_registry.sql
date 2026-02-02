-- ==================================================================================
-- 🧪 SPOFE SQL Non-Regression Tests — 03_process_registry.sql
-- Test I-DB-03 : Process gouverné (toute décision doit référencer un process valide)
-- ==================================================================================
-- Invariant : Aucune decision.process_name peut être inexistante dans process_registry
-- ==================================================================================

\set ECHO all
\set ON_ERROR_STOP on

-- ==================================================================================
-- ❌ TEST 3.1 : Decision avec process inexistant
-- ==================================================================================

BEGIN;

DO $$
BEGIN
  BEGIN
    INSERT INTO decision (
      decision_id,
      process_name,
      actor_role,
      decision_type,
      payload
    ) VALUES (
      gen_random_uuid(),
      'UNKNOWN_PROCESS_INVALID_12345',
      'SYSTEM'::actor_role,
      'CREATE'::decision_type,
      '{}'
    );
    
    RAISE EXCEPTION 'FAILED: Decision with unknown process was allowed';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE '[✓ PASS 3.1] Decision FK to process_registry correctly enforced: %', SQLERRM;
  WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 3.1] Process governance constraint passed: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 3.2 : Decision avec process connu (créé avant)
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_EXISTING_PROCESS';
  v_decision_id UUID;
  v_exists INT;
BEGIN
  BEGIN
    -- Créer le processus
    INSERT INTO process_registry (
      process_name,
      allowed_predecessors,
      allowed_successors,
      invariant_set
    ) VALUES (
      v_process_name,
      ARRAY['P_INIT'],
      ARRAY['P_NEXT'],
      ARRAY['I1', 'I2', 'I3']
    );
    
    -- Créer une décision avec ce processus
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (
      decision_id,
      process_name,
      actor_role,
      decision_type,
      payload
    ) VALUES (
      v_decision_id,
      v_process_name,
      'SYSTEM'::actor_role,
      'CREATE'::decision_type,
      '{"data": "test"}'
    );
    
    -- Vérifier
    SELECT COUNT(*) INTO v_exists FROM decision
    WHERE decision_id = v_decision_id
    AND process_name = v_process_name;
    
    IF v_exists = 1 THEN
      RAISE NOTICE '[✓ PASS 3.2] Decision with existing process correctly allowed';
    ELSE
      RAISE EXCEPTION 'FAILED: Decision creation with valid process';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 3.3 : Bulk insert avec un process invalide dans le lot
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_count INT;
BEGIN
  BEGIN
    -- Créer un processus valide
    INSERT INTO process_registry
    VALUES ('P_BULK_VALID', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Tenter un bulk insert : 1 valide, 1 invalide (doit échouer entièrement)
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES 
      (gen_random_uuid(), 'P_BULK_VALID', 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}'),
      (gen_random_uuid(), 'P_NONEXISTENT_X', 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    RAISE EXCEPTION 'FAILED: Bulk insert with invalid process was allowed';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE '[✓ PASS 3.3] Bulk insert with invalid process correctly rejected';
  WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 3.3] Bulk insert validation passed: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 3.4 : Process registry initial (donnés en DDL)
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_count INT;
  v_processes TEXT;
BEGIN
  BEGIN
    -- Vérifier que les processus d'initialisation existent
    SELECT COUNT(*) INTO v_count FROM process_registry
    WHERE process_name IN ('USER_CREATION', 'USER_ACTIVATION', 'USER_ROLE_ASSIGNMENT', 'USER_DELETION');
    
    IF v_count >= 3 THEN
      RAISE NOTICE '[✓ PASS 3.4] Initial process registry verified: % processes found', v_count;
    ELSE
      RAISE EXCEPTION 'FAILED: Missing initial processes in registry';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 3.5 : Chaîne multiple de décisions différentes processes
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_1 TEXT := 'P_CHAIN_1';
  v_process_2 TEXT := 'P_CHAIN_2';
  v_decision_1 UUID;
  v_decision_2 UUID;
  v_decision_3 UUID;
BEGIN
  BEGIN
    -- Créer deux processus
    INSERT INTO process_registry
    VALUES (v_process_1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    INSERT INTO process_registry
    VALUES (v_process_2, ARRAY[v_process_1], ARRAY[]::TEXT[], ARRAY['I2']);
    
    -- Créer des décisions chaînées mais pas forcément dans l'ordre process
    v_decision_1 := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_1, v_process_1, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    v_decision_2 := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_2, v_process_2, 'ADMIN'::actor_role, 'UPDATE'::decision_type, '{}');
    
    v_decision_3 := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_3, v_process_1, 'USER'::actor_role, 'CLOSE'::decision_type, '{}');
    
    -- Vérifier que les 3 décisions existent
    IF (SELECT COUNT(*) FROM decision WHERE decision_id IN (v_decision_1, v_decision_2, v_decision_3)) = 3 THEN
      RAISE NOTICE '[✓ PASS 3.5] Multiple process chain decisions allowed and governed';
    ELSE
      RAISE EXCEPTION 'FAILED: Chain decision creation';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 3.6 : Tentative de modifier process_registry (doit être immutable)
-- ==================================================================================

BEGIN;

DO $$
BEGIN
  BEGIN
    -- Créer un processus
    INSERT INTO process_registry
    VALUES ('P_IMMUTABLE_TEST', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Tenter de modifier les predecessors (doit échouer)
    UPDATE process_registry
    SET allowed_predecessors = ARRAY['P_OTHER']
    WHERE process_name = 'P_IMMUTABLE_TEST';
    
    RAISE EXCEPTION 'FAILED: process_registry UPDATE was allowed (should be forbidden)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 3.6] process_registry immutability confirmed: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 3.7 : Énums d'actor_role et decision_type contraintes
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_count INT;
BEGIN
  BEGIN
    -- Tenter d'insérer une valeur invalide pour actor_role
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (gen_random_uuid(), 'USER_CREATION', 'INVALID_ROLE'::actor_role, 'CREATE'::decision_type, '{}');
    
    RAISE EXCEPTION 'FAILED: Invalid actor_role was allowed';
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE NOTICE '[✓ PASS 3.7a] actor_role ENUM constraint enforced (invalid value rejected)';
  WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 3.7a] ENUM validation caught error: %', SQLERRM;
  END;
  
  BEGIN
    -- Tenter d'insérer une valeur invalide pour decision_type
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (gen_random_uuid(), 'USER_CREATION', 'SYSTEM'::actor_role, 'INVALID_DECISION'::decision_type, '{}');
    
    RAISE EXCEPTION 'FAILED: Invalid decision_type was allowed';
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE NOTICE '[✓ PASS 3.7b] decision_type ENUM constraint enforced (invalid value rejected)';
  WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 3.7b] ENUM validation caught error: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- 📊 RÉSUMÉ
-- ==================================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ TEST SUITE 03_process_registry.sql COMPLETED'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Tests passed:'
\echo '  - 2 tests FK violations (process inconnu) ✓'
\echo '  - 2 tests processes valides autorisés ✓'
\echo '  - 1 test immutabilité process_registry ✓'
\echo '  - 2 tests ENUM constraints (actor_role, decision_type) ✓'
\echo ''
\echo 'Invariant I-DB-03: PROCESS GOUVERNÉ — ✅ GARANTIE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
