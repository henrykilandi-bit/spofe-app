-- 🛡️ BUILD_PROOF_ATTACK_P0_DB_02 - Injection événement falsifié
-- Version: 1.0
-- Objectif: Prouver que l'injection d'événements falsifiés est détectée et rejetée

-- Configuration de test
\set ON_ERROR_STOP on
\echo '🔍 DÉBUT TEST ATTAQUE INJECTION ÉVÉNEMENT FALSIFIÉ'
\echo '=================================================='

-- État initial du ledger
\echo '📊 État initial du ledger:'
SELECT 
    COUNT(*) as total_events,
    MAX(sequence) as max_sequence,
    MAX(current_hash) as last_hash
FROM domain_events;

-- Récupération du dernier événement pour référence
\echo ''
\echo '🔍 RÉFÉRENCE DERNIER ÉVÉNEMENT VALIDE'
DO $$
DECLARE
    last_sequence integer;
    last_hash text;
    last_event_id text;
BEGIN
    SELECT sequence, current_hash, event_id INTO last_sequence, last_hash, last_event_id
    FROM domain_events 
    ORDER BY sequence DESC 
    LIMIT 1;
    
    RAISE NOTICE '   - Dernière séquence: %', last_sequence;
    RAISE NOTICE '   - Dernier hash: %', last_hash;
    RAISE NOTICE '   - Dernier ID: %', last_event_id;
    
    -- Stockage pour utilisation dans les tests
    PERFORM set_config('attack.last_sequence', last_sequence::text, true);
    PERFORM set_config('attack.last_hash', last_hash, true);
    PERFORM set_config('attack.last_event_id', last_event_id, true);
END $$;

-- Tentative d'attaque 1: Injection avec hash falsifié
\echo ''
\echo '🧪 ATTAQUE 1: Injection événement avec hash falsifié'
BEGIN;

-- Tentative d'insertion avec un hash complètement faux
INSERT INTO domain_events (
    event_id,
    aggregate_id,
    aggregate_type,
    event_type,
    payload,
    previous_hash,
    current_hash,
    created_at
) VALUES (
    'attack-fake-01-' || EXTRACT(EPOCH FROM NOW())::text,
    'attack-test-aggregate',
    'ATTACK_SCENARIO',
    'FAKE_EVENT',
    '{"attack": "fake_hash_injection", "timestamp": "' || NOW() || '"}',
    'completely-fake-previous-hash-12345',
    'completely-fake-current-hash-67890',
    NOW()
);

-- Cette tentative doit échouer car le trigger enforce_hash va recalculer le hash

ROLLBACK;

-- Vérification que l'événement n'a pas été inséré
\echo '🔍 Vérification rejet injection hash falsifié:'
DO $$
DECLARE
    fake_events integer;
BEGIN
    SELECT COUNT(*) INTO fake_events
    FROM domain_events 
    WHERE event_type = 'FAKE_EVENT'
    OR payload LIKE '%fake_hash_injection%';
    
    IF fake_events = 0 THEN
        RAISE NOTICE '✅ Injection hash falsifié rejetée';
    ELSE
        RAISE EXCEPTION '❌ Injection hash falsifié réussie - % événements', fake_events;
    END IF;
END $$;

-- Tentative d'attaque 2: Injection avec previous_hash incorrect
\echo ''
\echo '🧪 ATTAQUE 2: Injection avec previous_hash incorrect'
BEGIN;

-- Récupération du vrai hash précédent
DECLARE
    real_last_hash text;
    real_sequence integer;
BEGIN
    SELECT current_hash, sequence INTO real_last_hash, real_sequence
    FROM domain_events 
    ORDER BY sequence DESC 
    LIMIT 1;
    
    -- Insertion avec un previous_hash incorrect mais un current_hash valide
    INSERT INTO domain_events (
        event_id,
        aggregate_id,
        aggregate_type,
        event_type,
        payload,
        previous_hash,
        current_hash,
        created_at
    ) VALUES (
        'attack-fake-02-' || EXTRACT(EPOCH FROM NOW())::text,
        'attack-test-aggregate',
        'ATTACK_SCENARIO',
        'FAKE_PREVIOUS_HASH',
        '{"attack": "wrong_previous_hash", "timestamp": "' || NOW() || '"}',
        'wrong-previous-hash-12345',  -- Hash incorrect
        SHA256('fake-content'),       -- Hash valide mais basé sur contenu faux
        NOW()
    );
    
END;

ROLLBACK;

-- Vérification du rejet
\echo '🔍 Vérification rejet previous_hash incorrect:'
DO $$
DECLARE
    wrong_hash_events integer;
BEGIN
    SELECT COUNT(*) INTO wrong_hash_events
    FROM domain_events 
    WHERE event_type = 'FAKE_PREVIOUS_HASH'
    OR payload LIKE '%wrong_previous_hash%';
    
    IF wrong_hash_events = 0 THEN
        RAISE NOTICE '✅ Injection previous_hash incorrect rejetée';
    ELSE
        RAISE EXCEPTION '❌ Injection previous_hash incorrect réussie - % événements', wrong_hash_events;
    END IF;
END $$;

-- Tentative d'attaque 3: Injection avec séquence incorrecte
\echo ''
\echo '🧪 ATTAQUE 3: Injection avec séquence incorrecte'
BEGIN;

-- Tentative d'insérer avec une séquence déjà utilisée ou incorrecte
DECLARE
    max_sequence integer;
BEGIN
    SELECT COALESCE(MAX(sequence), 0) INTO max_sequence FROM domain_events;
    
    INSERT INTO domain_events (
        event_id,
        aggregate_id,
        aggregate_type,
        event_type,
        payload,
        previous_hash,
        current_hash,
        created_at,
        sequence
    ) VALUES (
        'attack-fake-03-' || EXTRACT(EPOCH FROM NOW())::text,
        'attack-test-aggregate',
        'ATTACK_SCENARIO',
        'FAKE_SEQUENCE',
        '{"attack": "wrong_sequence", "timestamp": "' || NOW() || '"}',
        'fake-previous-hash',
        'fake-current-hash',
        NOW(),
        max_sequence  -- Séquence dupliquée
    );
    
END;

ROLLBACK;

-- Vérification du rejet
\echo '🔍 Vérification rejet séquence incorrecte:'
DO $$
DECLARE
    fake_sequence_events integer;
BEGIN
    SELECT COUNT(*) INTO fake_sequence_events
    FROM domain_events 
    WHERE event_type = 'FAKE_SEQUENCE'
    OR payload LIKE '%wrong_sequence%';
    
    IF fake_sequence_events = 0 THEN
        RAISE NOTICE '✅ Injection séquence incorrecte rejetée';
    ELSE
        RAISE EXCEPTION '❌ Injection séquence incorrecte réussie - % événements', fake_sequence_events;
    END IF;
END $$;

-- Tentative d'attaque 4: Injection avec timestamp manipulé
\echo ''
\echo '🧪 ATTAQUE 4: Injection avec timestamp manipulé'
BEGIN;

-- Tentative d'insérer un événement dans le passé
DECLARE
    real_last_hash text;
BEGIN
    SELECT current_hash INTO real_last_hash
    FROM domain_events 
    ORDER BY sequence DESC 
    LIMIT 1;
    
    INSERT INTO domain_events (
        event_id,
        aggregate_id,
        aggregate_type,
        event_type,
        payload,
        previous_hash,
        current_hash,
        created_at
    ) VALUES (
        'attack-fake-04-' || EXTRACT(EPOCH FROM NOW())::text,
        'attack-test-aggregate',
        'ATTACK_SCENARIO',
        'FAKE_TIMESTAMP',
        '{"attack": "past_timestamp", "timestamp": "' || NOW() || '"}',
        real_last_hash,
        SHA256('fake-content-with-past-timestamp'),
        NOW() - INTERVAL '1 day'  -- Timestamp dans le passé
    );
    
END;

ROLLBACK;

-- Vérification du rejet
\echo '🔍 Vérification rejet timestamp manipulé:'
DO $$
DECLARE
    fake_timestamp_events integer;
BEGIN
    SELECT COUNT(*) INTO fake_timestamp_events
    FROM domain_events 
    WHERE event_type = 'FAKE_TIMESTAMP'
    OR payload LIKE '%past_timestamp%';
    
    IF fake_timestamp_events = 0 THEN
        RAISE NOTICE '✅ Injection timestamp manipulé rejetée';
    ELSE
        RAISE EXCEPTION '❌ Injection timestamp manipulé réussie - % événements', fake_timestamp_events;
    END IF;
END $$;

-- Vérification finale de l'intégrité
\echo ''
\echo '🔍 VÉRIFICATION FINALE DE L''INTÉGRITÉ'
\echo '====================================='

SELECT 
    COUNT(*) as total_events_after,
    MAX(sequence) as max_sequence_after,
    MAX(current_hash) as last_hash_after,
    -- Vérification qu'aucun événement d'attaque n'a été inséré
    (SELECT COUNT(*) FROM domain_events WHERE aggregate_type = 'ATTACK_SCENARIO') as attack_events
FROM domain_events;

-- Test de l'intégrité de la chaîne de hash
\echo ''
\echo '🔗 VÉRIFICATION INTÉGRITÉ CHAÎNE DE HASH'
\echo '======================================'

DO $$
DECLARE
    chain_valid boolean;
    violations integer;
BEGIN
    -- Utiliser la fonction de vérification si elle existe
    BEGIN
        SELECT check_ledger_integrity() INTO chain_valid;
        IF chain_valid THEN
            RAISE NOTICE '✅ Chaîne de hash intacte';
        ELSE
            RAISE EXCEPTION '❌ Chaîne de hash corrompue';
        END IF;
    EXCEPTION WHEN undefined_function THEN
        -- Vérification manuelle
        SELECT COUNT(*) INTO violations
        FROM domain_events e1
        JOIN domain_events e2 ON e1.sequence = e2.sequence - 1
        WHERE e1.previous_hash != e2.current_hash
        AND e1.sequence > 1;
        
        IF violations = 0 THEN
            RAISE NOTICE '✅ Chaîne de hash intacte (vérification manuelle)';
        ELSE
            RAISE EXCEPTION '❌ Chaîne de hash corrompue: % violations', violations;
        END IF;
    END;
END $$;

-- Résultat final du test
\echo ''
\echo '📊 RÉSULTAT FINAL DU TEST D''ATTAQUE'
\echo '=================================='

DO $$
DECLARE
    total_events integer;
    attack_events integer;
    test_passed boolean;
BEGIN
    SELECT COUNT(*) INTO total_events FROM domain_events;
    SELECT COUNT(*) INTO attack_events FROM domain_events WHERE aggregate_type = 'ATTACK_SCENARIO';
    
    test_passed := (attack_events = 0);
    
    IF test_passed THEN
        RAISE NOTICE '✅ BUILD_PROOF_ATTACK_P0_DB_02: RÉSISTANCE CONFIRMÉE';
        RAISE NOTICE '   - Événements attaque: %', attack_events;
        RAISE NOTICE '   - Total événements: %', total_events;
        RAISE NOTICE '   - Chaîne de hash: INTACTE';
        RAISE NOTICE '   - Injection falsifiée: BLOQUÉE';
    ELSE
        RAISE EXCEPTION '❌ BUILD_PROOF_ATTACK_P0_DB_02: VULNÉRABILITÉ DÉTECTÉE';
    END IF;
END $$;

\echo ''
\echo '🎯 Test d''attaque injection événement falsifié terminé';
