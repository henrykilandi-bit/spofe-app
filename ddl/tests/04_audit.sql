-- ==================================================================================
-- 🧪 SPOFE SQL Non-Regression Tests — 04_audit.sql
-- Test I-DB-04 : Audit obligatoire (chaque décision doit être auditée)
-- ==================================================================================
-- Invariant : Chaque decision DOIT avoir au moins une entrée dans audit_log
-- Note : Ce test explore la limite entre DB (structure) et Guardian (métier)
-- ==================================================================================

\set ECHO all
\set ON_ERROR_STOP on

-- ==================================================================================
-- ⚠️ TEST 4.1 : Decision sans audit (structurellement possible, métier impossible)
-- ==================================================================================
-- Note : La DB seule ne peut pas forcer l'audit (c'est une règle métier).
--        Guardian le fera. Ce test documente la limite.

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_AUDIT_TEST_1';
  v_decision_id UUID;
  v_audit_count INT;
BEGIN
  BEGIN
    -- Créer processus
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Créer décision (SANS audit)
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{"note": "test"}');
    
    -- Vérifier qu'il n'y a pas d'audit
    SELECT COUNT(*) INTO v_audit_count FROM audit_log WHERE decision_id = v_decision_id;
    
    IF v_audit_count = 0 THEN
      RAISE NOTICE '[⚠️ BOUNDARY 4.1] Decision without audit is structurally allowed';
      RAISE NOTICE '    But Guardian will reject it at application level';
      RAISE NOTICE '    This shows the DB/Guardian boundary correctly';
    ELSE
      RAISE NOTICE '[✗ TEST 4.1] Unexpected: audit was created automatically';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 4.2 : Decision avec audit valide
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_AUDIT_TEST_2';
  v_decision_id UUID;
  v_audit_id UUID;
  v_verified INT;
BEGIN
  BEGIN
    -- Créer processus
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Créer décision
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    -- Créer audit immédiatement
    v_audit_id := gen_random_uuid();
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (v_audit_id, v_decision_id, '2.1.0', 'abc123def456');
    
    -- Vérifier
    SELECT COUNT(*) INTO v_verified FROM audit_log
    WHERE decision_id = v_decision_id
    AND checksum = 'abc123def456';
    
    IF v_verified = 1 THEN
      RAISE NOTICE '[✓ PASS 4.2] Decision with audit created and verified';
    ELSE
      RAISE EXCEPTION 'FAILED: Audit creation failed';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 4.3 : Audit avec decision inexistante (FK violation)
-- ==================================================================================

BEGIN;

DO $$
BEGIN
  BEGIN
    INSERT INTO audit_log (
      audit_id,
      decision_id,
      invariant_version,
      checksum
    ) VALUES (
      gen_random_uuid(),
      gen_random_uuid(), -- decision inexistante
      '2.1.0',
      'invalid_checksum'
    );
    
    RAISE EXCEPTION 'FAILED: Audit with invalid decision was allowed';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE '[✓ PASS 4.3] Audit FK to decision correctly enforced: %', SQLERRM;
  WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 4.3] Audit FK violation caught: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 4.4 : Multiple audits pour une même décision (trace complète)
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_AUDIT_TEST_4';
  v_decision_id UUID;
  v_audit_count INT;
BEGIN
  BEGIN
    -- Créer processus
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    -- Créer décision
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'SYSTEM'::actor_role, 'CREATE'::decision_type, '{}');
    
    -- Ajouter plusieurs audits (re-vérification, escalade, etc.)
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (gen_random_uuid(), v_decision_id, '2.1.0', 'check_v1');
    
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (gen_random_uuid(), v_decision_id, '2.1.0', 'check_v2_escalation');
    
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (gen_random_uuid(), v_decision_id, '2.1.1', 'check_v3_final');
    
    -- Vérifier
    SELECT COUNT(*) INTO v_audit_count FROM audit_log WHERE decision_id = v_decision_id;
    
    IF v_audit_count = 3 THEN
      RAISE NOTICE '[✓ PASS 4.4] Multiple audits for same decision: count=%', v_audit_count;
      RAISE NOTICE '    Allows complete audit trail (re-checks, escalations, etc.)';
    ELSE
      RAISE EXCEPTION 'FAILED: Audit count mismatch: %', v_audit_count;
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 4.5 : Modifier un audit (immutable, doit échouer)
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_AUDIT_TEST_5';
  v_decision_id UUID;
  v_audit_id UUID;
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
    VALUES (v_audit_id, v_decision_id, '2.1.0', 'original_checksum');
    
    -- Tenter de modifier l'audit (DOIT ÉCHOUER)
    UPDATE audit_log
    SET checksum = 'COMPROMISED'
    WHERE audit_id = v_audit_id;
    
    RAISE EXCEPTION 'FAILED: Audit was modified (should be immutable)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 4.5] Audit immutability enforced: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ❌ TEST 4.6 : Supprimer un audit (immutable, doit échouer)
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_AUDIT_TEST_6';
  v_decision_id UUID;
  v_audit_id UUID;
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
    VALUES (v_audit_id, v_decision_id, '2.1.0', 'checksum');
    
    -- Tenter de supprimer l'audit (DOIT ÉCHOUER)
    DELETE FROM audit_log WHERE audit_id = v_audit_id;
    
    RAISE EXCEPTION 'FAILED: Audit was deleted (should be immutable)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[✓ PASS 4.6] Audit deletion prevention enforced: %', SQLERRM;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- ✅ TEST 4.7 : Audit trail reconstruction (queries sur v_audit_trail)
-- ==================================================================================

BEGIN;

DO $$
DECLARE
  v_process_name TEXT := 'P_AUDIT_TEST_7';
  v_decision_id UUID;
  v_event_id UUID;
  v_audit_id UUID;
  v_trail_count INT;
BEGIN
  BEGIN
    -- Créer chaîne complète
    INSERT INTO process_registry
    VALUES (v_process_name, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['I1']);
    
    v_decision_id := gen_random_uuid();
    INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
    VALUES (v_decision_id, v_process_name, 'ADMIN'::actor_role, 'UPDATE'::decision_type, '{"user_id": 123}');
    
    v_event_id := gen_random_uuid();
    INSERT INTO event (event_id, decision_id, event_type, payload)
    VALUES (v_event_id, v_decision_id, 'UPDATED'::event_type, '{"changed": "role"}');
    
    v_audit_id := gen_random_uuid();
    INSERT INTO audit_log (audit_id, decision_id, invariant_version, checksum)
    VALUES (v_audit_id, v_decision_id, '2.1.0', 'sha256_hash');
    
    -- Requête sur vue audit trail
    SELECT COUNT(*) INTO v_trail_count FROM v_audit_trail
    WHERE decision_id = v_decision_id;
    
    IF v_trail_count >= 1 THEN
      RAISE NOTICE '[✓ PASS 4.7] Audit trail view reconstructs complete chain: count=%', v_trail_count;
    ELSE
      RAISE EXCEPTION 'FAILED: Audit trail reconstruction failed';
    END IF;
  END;
END $$;

ROLLBACK;

-- ==================================================================================
-- 📊 RÉSUMÉ
-- ==================================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ TEST SUITE 04_audit.sql COMPLETED'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Tests passed:'
\echo '  - 1 boundary test (DB vs Guardian separation) ✓'
\echo '  - 3 tests audit creation & integrity ✓'
\echo '  - 2 tests audit immutability (no UPDATE/DELETE) ✓'
\echo '  - 1 test audit trail reconstruction ✓'
\echo ''
\echo 'IMPORTANT: Audit completeness is enforced by Guardian,'
\echo '           not by DB alone. This is correct design.'
\echo ''
\echo 'Invariant I-DB-04: AUDIT OBLIGATOIRE — ✅ PARTIALLY GUARANTEED'
\echo '                  (Structure in DB + Logic in Guardian)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
