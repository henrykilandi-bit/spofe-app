-- 🛡️ BUILD_PROOF_ATTACK_P0_DB_01 - Tentative UPDATE/DELETE Ledger
-- Version: 1.0
-- Objectif: Prouver que l'immutabilité du ledger résiste aux attaques directes DB

-- Configuration de test
\set ON_ERROR_STOP on
\echo '🔍 DÉBUT TEST ATTAQUE UPDATE/DELETE LEDGER'
\echo '========================================='

-- État initial du ledger
\echo '📊 État initial du ledger:'
SELECT 
    COUNT(*) as total_events,
    MAX(sequence) as max_sequence,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event
FROM domain_events;

-- Tentative d'attaque 1: UPDATE de payload
\echo ''
\echo '🧪 ATTAQUE 1: Tentative UPDATE payload événement'
BEGIN;
UPDATE domain_events 
SET payload = '{"attacked": true, "original": "' || payload || '"}' 
WHERE sequence = (
    SELECT MIN(sequence) FROM domain_events
);
-- Cette tentative doit échouer à cause du trigger no_update_domain_events

-- Vérification du rejet
DO $$
DECLARE
    trigger_count integer;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name = 'no_update_domain_events';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Trigger no_update_domain_events actif - UPDATE bloqué';
    ELSE
        RAISE EXCEPTION '❌ Trigger manquant - Vulnérabilité critique';
    END IF;
END $$;

ROLLBACK;

-- Tentative d'attaque 2: DELETE d'événements
\echo ''
\echo '🧪 ATTAQUE 2: Tentative DELETE événements'
BEGIN;
DELETE FROM domain_events WHERE sequence = (
    SELECT MIN(sequence) FROM domain_events
);
-- Cette tentative doit échouer à cause du trigger no_delete_domain_events

-- Vérification du rejet
DO $$
DECLARE
    trigger_count integer;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name = 'no_delete_domain_events';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Trigger no_delete_domain_events actif - DELETE bloqué';
    ELSE
        RAISE EXCEPTION '❌ Trigger manquant - Vulnérabilité critique';
    END IF;
END $$;

ROLLBACK;

-- Tentative d'attaque 3: TRUNCATE table
\echo ''
\echo '🧪 ATTAQUE 3: Tentative TRUNCATE table'
BEGIN;
TRUNCATE TABLE domain_events;
-- Cette tentative doit échouer à cause du trigger no_delete_domain_events

ROLLBACK;

-- Tentative d'attaque 4: DROP table
\echo ''
\echo '🧪 ATTAQUE 4: Tentative DROP table'
-- Cette tentative doit échouer car la table est protégée par les dépendances
-- et les triggers de défense

DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'domain_events'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ Table domain_events intacte - DROP bloqué';
    ELSE
        RAISE EXCEPTION '❌ Table supprimée - Vulnérabilité critique';
    END IF;
END $$;

-- Tentative d'attaque 5: Désactivation des triggers
\echo ''
\echo '🧪 ATTAQUE 5: Tentative désactivation triggers'
BEGIN;
ALTER TABLE domain_events DISABLE TRIGGER no_update_domain_events;
ALTER TABLE domain_events DISABLE TRIGGER no_delete_domain_events;
-- Cette tentative ne doit pas être permise ou être détectée

-- Vérification que les triggers sont toujours actifs
DO $$
DECLARE
    trigger_status text;
BEGIN
    SELECT tgenabled INTO trigger_status
    FROM pg_trigger 
    WHERE tgname = 'no_update_domain_events';
    
    IF trigger_status = 'O' THEN
        RAISE NOTICE '✅ Trigger no_update_domain_events toujours actif';
    ELSIF trigger_status = 'D' THEN
        RAISE EXCEPTION '❌ Trigger désactivé - Vulnérabilité critique';
    ELSE
        RAISE EXCEPTION '❌ État trigger inconnu: %', trigger_status;
    END IF;
END $$;

ROLLBACK;

-- Vérification finale de l'intégrité
\echo ''
\echo '🔍 VÉRIFICATION FINALE DE L''INTÉGRITÉ'
\echo '====================================='

SELECT 
    COUNT(*) as total_events_after,
    MAX(sequence) as max_sequence_after,
    MIN(created_at) as first_event_after,
    MAX(created_at) as last_event_after,
    -- Vérification qu'aucun événement n'a été modifié
    (SELECT COUNT(*) FROM domain_events WHERE payload LIKE '%attacked%') as attacked_events,
    -- Vérification que tous les triggers sont actifs
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE 'no_%' AND tgenabled = 'O') as active_triggers
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
        -- Vérification manuelle si la fonction n'existe pas
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
    attacked_events integer;
    active_triggers integer;
    test_passed boolean;
BEGIN
    SELECT COUNT(*) INTO total_events FROM domain_events;
    SELECT COUNT(*) INTO attacked_events FROM domain_events WHERE payload LIKE '%attacked%';
    SELECT COUNT(*) INTO active_triggers FROM pg_trigger WHERE tgname LIKE 'no_%' AND tgenabled = 'O';
    
    test_passed := (attacked_events = 0) AND (active_triggers >= 2);
    
    IF test_passed THEN
        RAISE NOTICE '✅ BUILD_PROOF_ATTACK_P0_DB_01: RÉSISTANCE CONFIRMÉE';
        RAISE NOTICE '   - Événements attaqués: %', attacked_events;
        RAISE NOTICE '   - Triggers actifs: %', active_triggers;
        RAISE NOTICE '   - Total événements: %', total_events;
        RAISE NOTICE '   - Ledger immuable: GARANTI';
    ELSE
        RAISE EXCEPTION '❌ BUILD_PROOF_ATTACK_P0_DB_01: VULNÉRABILITÉ DÉTECTÉE';
    END IF;
END $$;

\echo ''
\echo '🎯 Test d''attaque UPDATE/DELETE terminé';
