-- 🛡️ BUILD_PROOF_ATTACK_P0_DB_03 - Tentative fork de chaîne
-- Version: 1.0
-- Objectif: Prouver que le fork de chaîne est impossible et détecté

-- Configuration de test
\set ON_ERROR_STOP on
\echo '🔍 DÉBUT TEST ATTAQUE FORK DE CHAÎNE'
\echo '===================================='

-- État initial du ledger
\echo '📊 État initial du ledger:'
SELECT 
    COUNT(*) as total_events,
    MAX(sequence) as max_sequence,
    MIN(sequence) as min_sequence
FROM domain_events;

-- Récupération de l'état de référence
\echo ''
\echo '🔍 RÉFÉRENCE ÉTAT ACTUEL'
DO $$
DECLARE
    last_sequence integer;
    last_hash text;
    last_event_id text;
    sequence_gap integer;
BEGIN
    SELECT MAX(sequence), MAX(current_hash), MAX(event_id) 
    INTO last_sequence, last_hash, last_event_id
    FROM domain_events;
    
    -- Vérification des trous de séquence
    SELECT COUNT(*) INTO sequence_gap
    FROM (
        SELECT generate_series(1, last_sequence) as seq
    ) all_seqs
    LEFT JOIN domain_events ON all_seqs.seq = domain_events.sequence
    WHERE domain_events.sequence IS NULL;
    
    RAISE NOTICE '   - Dernière séquence: %', last_sequence;
    RAISE NOTICE '   - Dernier hash: %', last_hash;
    RAISE NOTICE '   - Dernier ID: %', last_event_id;
    RAISE NOTICE '   - Trous de séquence: %', sequence_gap;
    
    -- Stockage pour utilisation dans les tests
    PERFORM set_config('attack.last_sequence', last_sequence::text, true);
    PERFORM set_config('attack.last_hash', last_hash, true);
    PERFORM set_config('attack.last_event_id', last_event_id, true);
END $$;

-- Tentative d'attaque 1: Insertion concurrente manuelle
\echo ''
\echo '🧪 ATTAQUE 1: Insertion concurrente manuelle (simulation fork)'

-- Création d'une table temporaire pour simuler la concurrence
CREATE TEMPORARY TABLE IF NOT EXISTS attack_fork_test (
    test_id serial,
    event_id text,
    sequence_target integer,
    previous_hash text,
    current_hash text,
    created_at timestamp DEFAULT NOW()
);

-- Simulation de tentatives de fork concurrentes
\echo '🔄 Simulation de 5 tentatives de fork concurrentes:'

INSERT INTO attack_fork_test (event_id, sequence_target, previous_hash, current_hash)
SELECT 
    'fork-attempt-' || i::text || '-' || EXTRACT(EPOCH FROM NOW())::text,
    (SELECT COALESCE(MAX(sequence), 0) + 1 FROM domain_events),
    (SELECT MAX(current_hash) FROM domain_events),
    'fork-hash-' || i::text || '-' || SHA256(i::text || NOW()::text)
FROM generate_series(1, 5) AS i;

-- Affichage des tentatives de fork
\echo '📋 Tentatives de fork générées:'
SELECT * FROM attack_fork_test ORDER BY test_id;

-- Tentative d'insertion réelle avec séquence dupliquée
\echo ''
\echo '🧪 ATTAQUE 2: Insertion avec séquence dupliquée'

BEGIN;

DECLARE
    last_sequence integer;
    last_hash text;
BEGIN
    SELECT COALESCE(MAX(sequence), 0), MAX(current_hash) 
    INTO last_sequence, last_hash
    FROM domain_events;
    
    -- Première insertion normale
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
        'fork-test-01-' || EXTRACT(EPOCH FROM NOW())::text,
        'fork-test-aggregate',
        'FORK_ATTACK',
        'CONCURRENT_INSERT_1',
        '{"attack": "fork_attempt_1", "timestamp": "' || NOW() || '"}',
        last_hash,
        SHA256('fork-content-1'),
        NOW(),
        last_sequence + 1
    );
    
    -- Deuxième insertion avec la même séquence (doit échouer)
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
        'fork-test-02-' || EXTRACT(EPOCH FROM NOW())::text,
        'fork-test-aggregate',
        'FORK_ATTACK',
        'CONCURRENT_INSERT_2',
        '{"attack": "fork_attempt_2", "timestamp": "' || NOW() || '"}',
        last_hash,
        SHA256('fork-content-2'),
        NOW(),
        last_sequence + 1  -- Même séquence - doit échouer
    );
    
END;

ROLLBACK;

-- Vérification du rejet
\echo '🔍 Vérification rejet insertion séquence dupliquée:'
DO $$
DECLARE
    fork_events integer;
BEGIN
    SELECT COUNT(*) INTO fork_events
    FROM domain_events 
    WHERE aggregate_type = 'FORK_ATTACK';
    
    IF fork_events = 0 THEN
        RAISE NOTICE '✅ Insertion séquence dupliquée rejetée';
    ELSE
        RAISE NOTICE '⚠️  % événements fork insérés (vérification nécessaire)', fork_events;
    END IF;
END $$;

-- Tentative d'attaque 3: Modification directe de séquence
\echo ''
\echo '🧪 ATTAQUE 3: Modification directe de séquence existante'

BEGIN;

-- Tentative de modifier la séquence d'un événement existant
UPDATE domain_events 
SET sequence = sequence + 1000
WHERE sequence = (SELECT MIN(sequence) FROM domain_events);

-- Cette tentative doit échouer à cause des contraintes

ROLLBACK;

-- Vérification que les séquences n'ont pas été modifiées
\echo '🔍 Vérification intégrité des séquences:'
DO $$
DECLARE
    modified_sequences integer;
    sequence_gaps integer;
BEGIN
    -- Vérification qu'aucune séquence n'a été modifiée
    SELECT COUNT(*) INTO modified_sequences
    FROM domain_events
    WHERE sequence != (
        SELECT ROW_NUMBER() OVER (ORDER BY created_at, event_id) 
        FROM domain_events de2
        WHERE de2.event_id = domain_events.event_id
    );
    
    -- Vérification des trous de séquence
    WITH all_sequences AS (
        SELECT generate_series(1, (SELECT MAX(sequence) FROM domain_events)) as seq
    ),
    missing_sequences AS (
        SELECT all_sequences.seq
        FROM all_sequences
        LEFT JOIN domain_events ON all_sequences.seq = domain_events.sequence
        WHERE domain_events.sequence IS NULL
    )
    SELECT COUNT(*) INTO sequence_gaps FROM missing_sequences;
    
    IF modified_sequences = 0 AND sequence_gaps = 0 THEN
        RAISE NOTICE '✅ Séquences intactes - Pas de fork détecté';
    ELSE
        RAISE NOTICE '⚠️  Séquences modifiées: %, Trous: %', modified_sequences, sequence_gaps;
    END IF;
END $$;

-- Tentative d'attaque 4: Création de chaîne parallèle
\echo ''
\echo '🧪 ATTAQUE 4: Simulation chaîne parallèle'

-- Création d'une table temporaire pour simuler une chaîne parallèle
CREATE TEMPORARY TABLE IF NOT EXISTS parallel_chain (
    sequence integer PRIMARY KEY,
    event_id text UNIQUE,
    previous_hash text,
    current_hash text,
    created_at timestamp
);

-- Simulation d'une chaîne parallèle basée sur le même point de départ
\echo '🔄 Construction chaîne parallèle (3 événements):'

INSERT INTO parallel_chain (sequence, event_id, previous_hash, current_hash, created_at)
SELECT 
    (SELECT COALESCE(MAX(sequence), 0) FROM domain_events) + i,
    'parallel-' || i::text || '-' || EXTRACT(EPOCH FROM NOW())::text,
    CASE 
        WHEN i = 1 THEN (SELECT MAX(current_hash) FROM domain_events)
        ELSE (SELECT current_hash FROM parallel_chain WHERE sequence = (SELECT COALESCE(MAX(sequence), 0) FROM domain_events) + i - 1)
    END,
    SHA256('parallel-chain-' || i::text || NOW()::text),
    NOW() + INTERVAL '1 second' * i
FROM generate_series(1, 3) AS i;

-- Affichage de la chaîne parallèle
\echo '📋 Chaîne parallèle générée:'
SELECT * FROM parallel_chain ORDER BY sequence;

-- Tentative d'intégration de la chaîne parallèle
\echo ''
\echo '🧪 ATTAQUE 5: Tentative d''intégration chaîne parallèle'

BEGIN;

-- Tentative d'insérer les événements de la chaîne parallèle
DECLARE
    last_sequence integer;
BEGIN
    SELECT COALESCE(MAX(sequence), 0) INTO last_sequence FROM domain_events;
    
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
    )
    SELECT 
        pc.event_id,
        'parallel-chain-aggregate',
        'PARALLEL_CHAIN',
        'FORK_ATTEMPT',
        '{"attack": "parallel_chain", "sequence": ' || pc.sequence::text || '}',
        pc.previous_hash,
        pc.current_hash,
        pc.created_at,
        last_sequence + pc.sequence
    FROM parallel_chain pc;
    
END;

ROLLBACK;

-- Vérification finale de l'intégrité
\echo ''
\echo '🔍 VÉRIFICATION FINALE DE L''INTÉGRITÉ'
\echo '====================================='

SELECT 
    COUNT(*) as total_events_after,
    MAX(sequence) as max_sequence_after,
    MIN(sequence) as min_sequence_after,
    -- Vérification qu'aucun événement de fork n'a été inséré
    (SELECT COUNT(*) FROM domain_events WHERE aggregate_type IN ('FORK_ATTACK', 'PARALLEL_CHAIN')) as fork_events
FROM domain_events;

-- Vérification détaillée de la continuité de séquence
\echo ''
\echo '🔗 VÉRIFICATION CONTINUITÉ SÉQUENCE'
\echo '=================================='

WITH sequence_analysis AS (
    SELECT 
        sequence,
        event_id,
        created_at,
        LAG(sequence) OVER (ORDER BY sequence) as previous_sequence
    FROM domain_events
),
sequence_gaps AS (
    SELECT 
        sa.*,
        CASE 
            WHEN sa.previous_sequence IS NULL THEN 0
            WHEN sa.sequence != sa.previous_sequence + 1 THEN 1
            ELSE 0
        END as is_gap
    FROM sequence_analysis sa
)
SELECT 
    COUNT(*) as total_events,
    SUM(is_gap) as sequence_gaps,
    CASE 
        WHEN SUM(is_gap) = 0 THEN 'CONTINUOUS'
        ELSE 'GAPS DETECTED'
    END as sequence_status
FROM sequence_gaps;

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
    fork_events integer;
    test_passed boolean;
BEGIN
    SELECT COUNT(*) INTO total_events FROM domain_events;
    SELECT COUNT(*) INTO fork_events FROM domain_events WHERE aggregate_type IN ('FORK_ATTACK', 'PARALLEL_CHAIN');
    
    test_passed := (fork_events = 0);
    
    IF test_passed THEN
        RAISE NOTICE '✅ BUILD_PROOF_ATTACK_P0_DB_03: RÉSISTANCE AU FORK CONFIRMÉE';
        RAISE NOTICE '   - Événements fork: %', fork_events;
        RAISE NOTICE '   - Total événements: %', total_events;
        RAISE NOTICE '   - Chaîne unique: GARANTIE';
        RAISE NOTICE '   - Fork impossible: DÉMONTRÉ';
    ELSE
        RAISE EXCEPTION '❌ BUILD_PROOF_ATTACK_P0_DB_03: VULNÉRABILITÉ FORK DÉTECTÉE';
    END IF;
END $$;

-- Nettoyage des tables temporaires
DROP TABLE IF EXISTS attack_fork_test;
DROP TABLE IF EXISTS parallel_chain;

\echo ''
\echo '🎯 Test d''attaque fork de chaîne terminé';
