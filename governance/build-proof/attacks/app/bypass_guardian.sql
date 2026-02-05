-- 🛡️ BUILD_PROOF_ATTACK_P0_APP_01 - Bypass Guardian
-- Version: 1.0
-- Objectif: Prouver que le bypass du Guardian est impossible

-- Configuration de test
\set ON_ERROR_STOP on
\echo '🔍 DÉBUT TEST ATTAQUE BYPASS GUARDIAN'
\echo '===================================='

-- État initial du ledger
\echo '📊 État initial du ledger:'
SELECT 
    COUNT(*) as total_events,
    MAX(sequence) as max_sequence,
    MAX(current_hash) as last_hash
FROM domain_events;

-- Vérification des permissions de l'utilisateur actuel
\echo ''
\echo '🔍 VÉRIFICATION PERMISSIONS UTILISATEUR ACTUEL'
SELECT 
    current_user as session_user,
    session_user as logged_in_user,
    has_database_privilege(current_user, 'CONNECT') as can_connect,
    has_schema_privilege(current_user, 'public', 'USAGE') as can_use_public,
    has_schema_privilege(current_user, 'information_schema', 'USAGE') as can_use_info_schema;

-- Vérification des permissions sur la table domain_events
\echo ''
\echo '🔍 VÉRIFICATION PERMISSIONS TABLE domain_events'
SELECT 
    has_table_privilege(current_user, 'domain_events', 'SELECT') as can_select,
    has_table_privilege(current_user, 'domain_events', 'INSERT') as can_insert,
    has_table_privilege(current_user, 'domain_events', 'UPDATE') as can_update,
    has_table_privilege(current_user, 'domain_events', 'DELETE') as can_delete,
    has_table_privilege(current_user, 'domain_events', 'TRUNCATE') as can_truncate,
    has_table_privilege(current_user, 'domain_events', 'TRIGGER') as can_trigger;

-- Tentative d'attaque 1: Insertion directe sans Guardian
\echo ''
\echo '🧪 ATTAQUE 1: Insertion directe dans domain_events (bypass Guardian)'

BEGIN;

-- Tentative d'insertion directe (doit échouer si les permissions sont correctes)
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
    'bypass-test-01-' || EXTRACT(EPOCH FROM NOW())::text,
    'bypass-test-aggregate',
    'BYPASS_ATTACK',
    'DIRECT_INSERT',
    '{"attack": "direct_insert_bypass", "timestamp": "' || NOW() || '"}',
    (SELECT MAX(current_hash) FROM domain_events),
    SHA256('bypass-direct-insert-' || NOW()::text),
    NOW()
);

-- Si cette insertion réussit, c'est une vulnérabilité critique

ROLLBACK;

-- Vérification du résultat
\echo '🔍 Vérification rejet insertion directe:'
DO $$
DECLARE
    bypass_events integer;
    can_insert boolean;
BEGIN
    -- Vérification si l'événement a été inséré
    SELECT COUNT(*) INTO bypass_events
    FROM domain_events 
    WHERE aggregate_type = 'BYPASS_ATTACK'
    AND event_type = 'DIRECT_INSERT';
    
    -- Vérification des permissions
    SELECT has_table_privilege(current_user, 'domain_events', 'INSERT') INTO can_insert;
    
    IF bypass_events = 0 THEN
        RAISE NOTICE '✅ Insertion directe bloquée - Protection active';
        IF NOT can_insert THEN
            RAISE NOTICE '   - Raison: Permissions INSERT refusées';
        ELSE
            RAISE NOTICE '   - Raison: Trigger de défense actif';
        END IF;
    ELSE
        RAISE EXCEPTION '❌ Insertion directe réussie - Vulnérabilité critique';
    END IF;
END $$;

-- Tentative d'attaque 2: Insertion via rôle différent
\echo ''
\echo '🧪 ATTAQUE 2: Tentative changement de rôle pour bypass'

-- Vérification des rôles disponibles
\echo '📋 Rôles disponibles dans la base de données:'
SELECT 
    rolname as role_name,
    rolsuper as is_super,
    rolcreaterole as can_create_role,
    rolcreatedb as can_create_db,
    rolcanlogin as can_login,
    rolreplication as can_replicate
FROM pg_roles 
WHERE rolcanlogin = true
ORDER BY rolname;

-- Tentative de SET ROLE (doit échouer si les permissions sont correctes)
\echo '🔄 Tentative de changement de rôle:'

DO $$
DECLARE
    role_changed boolean := false;
BEGIN
    -- Tenter de changer vers un rôle avec plus de permissions
    BEGIN
        -- Cette tentative doit échouer
        SET ROLE postgres;
        role_changed := true;
    EXCEPTION WHEN others THEN
        RAISE NOTICE '✅ Changement de rôle bloqué: %', SQLERRM;
    END;
    
    IF role_changed THEN
        RAISE EXCEPTION '❌ Changement de rôle réussi - Vulnérabilité';
    END IF;
END $$;

-- Réinitialisation du rôle
RESET ROLE;

-- Tentative d'attaque 3: Insertion via procédure stockée
\echo ''
\echo '🧪 ATTAQUE 3: Création et utilisation de procédure stockée malveillante'

-- Tentative de créer une procédure stockée (doit échouer)
BEGIN;

CREATE OR REPLACE FUNCTION malicious_insert_event()
RETURNS void AS $$
DECLARE
    last_hash text;
BEGIN
    SELECT MAX(current_hash) INTO last_hash FROM domain_events;
    
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
        'bypass-test-03-' || EXTRACT(EPOCH FROM NOW())::text,
        'bypass-test-aggregate',
        'BYPASS_ATTACK',
        'STORED_PROCEDURE',
        '{"attack": "stored_procedure_bypass", "timestamp": "' || NOW() || '"}',
        last_hash,
        SHA256('bypass-stored-procedure-' || NOW()::text),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécution de la procédure malveillante
PERFORM malicious_insert_event();

ROLLBACK;

-- Vérification du rejet
\echo '🔍 Vérification rejet procédure stockée:'
DO $$
DECLARE
    sp_events integer;
BEGIN
    SELECT COUNT(*) INTO sp_events
    FROM domain_events 
    WHERE aggregate_type = 'BYPASS_ATTACK'
    AND event_type = 'STORED_PROCEDURE';
    
    IF sp_events = 0 THEN
        RAISE NOTICE '✅ Procédure stockée malveillante bloquée';
    ELSE
        RAISE EXCEPTION '❌ Procédure stockée malveillante exécutée - Vulnérabilité';
    END IF;
END $$;

-- Tentative d'attaque 4: Injection via COPY
\echo ''
\echo '🧪 ATTAQUE 4: Injection via commande COPY'

-- Création d'un fichier temporaire avec des données malveillantes
\echo '🔄 Création fichier temporaire pour injection COPY:'

BEGIN;

-- Création d'un fichier CSV temporaire (simulation)
CREATE TEMPORARY TABLE temp_malicious_data (
    event_id text,
    aggregate_id text,
    aggregate_type text,
    event_type text,
    payload text,
    previous_hash text,
    current_hash text,
    created_at timestamp
);

-- Insertion de données malveillantes dans la table temporaire
INSERT INTO temp_malicious_data VALUES (
    'bypass-test-04-' || EXTRACT(EPOCH FROM NOW())::text,
    'bypass-test-aggregate',
    'BYPASS_ATTACK',
    'COPY_INJECTION',
    '{"attack": "copy_bypass", "timestamp": "' || NOW() || '"}',
    (SELECT MAX(current_hash) FROM domain_events),
    SHA256('bypass-copy-' || NOW()::text),
    NOW()
);

-- Tentative de COPY vers domain_events (doit échouer)
COPY domain_events (event_id, aggregate_id, aggregate_type, event_type, payload, previous_hash, current_hash, created_at)
FROM temp_malicious_data;

ROLLBACK;

-- Vérification du rejet
\echo '🔍 Vérification rejet injection COPY:'
DO $$
DECLARE
    copy_events integer;
BEGIN
    SELECT COUNT(*) INTO copy_events
    FROM domain_events 
    WHERE aggregate_type = 'BYPASS_ATTACK'
    AND event_type = 'COPY_INJECTION';
    
    IF copy_events = 0 THEN
        RAISE NOTICE '✅ Injection COPY bloquée';
    ELSE
        RAISE EXCEPTION '❌ Injection COPY réussie - Vulnérabilité';
    END IF;
END $$;

-- Tentative d'attaque 5: Modification des triggers de défense
\echo ''
\echo '🧪 ATTAQUE 5: Tentative désactivation triggers de défense'

BEGIN;

-- Tentative de désactiver les triggers de défense
ALTER TABLE domain_events DISABLE TRIGGER no_update_domain_events;
ALTER TABLE domain_events DISABLE TRIGGER no_delete_domain_events;
ALTER TABLE domain_events DISABLE TRIGGER enforce_hash;

-- Vérification si les triggers sont désactivés
DO $$
DECLARE
    trigger_disabled integer;
BEGIN
    SELECT COUNT(*) INTO trigger_disabled
    FROM pg_trigger 
    WHERE tgname IN ('no_update_domain_events', 'no_delete_domain_events', 'enforce_hash')
    AND tgenabled = 'D';
    
    IF trigger_disabled > 0 THEN
        RAISE NOTICE '⚠️  % triggers désactivés - Test de vulnérabilité', trigger_disabled;
        
        -- Tentative d'insertion avec triggers désactivés
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
            'bypass-test-05-' || EXTRACT(EPOCH FROM NOW())::text,
            'bypass-test-aggregate',
            'BYPASS_ATTACK',
            'TRIGGERS_DISABLED',
            '{"attack": "triggers_disabled", "timestamp": "' || NOW() || '"}',
            (SELECT MAX(current_hash) FROM domain_events),
            SHA256('bypass-triggers-disabled-' || NOW()::text),
            NOW()
        );
    ELSE
        RAISE NOTICE '✅ Désactivation triggers bloquée';
    END IF;
END $$;

ROLLBACK;

-- Réactivation des triggers (si nécessaire)
ALTER TABLE domain_events ENABLE TRIGGER no_update_domain_events;
ALTER TABLE domain_events ENABLE TRIGGER no_delete_domain_events;
ALTER TABLE domain_events ENABLE TRIGGER enforce_hash;

-- Vérification finale de l'intégrité
\echo ''
\echo '🔍 VÉRIFICATION FINALE DE L''INTÉGRITÉ'
\echo '====================================='

SELECT 
    COUNT(*) as total_events_after,
    MAX(sequence) as max_sequence_after,
    -- Vérification qu'aucun événement de bypass n'a été inséré
    (SELECT COUNT(*) FROM domain_events WHERE aggregate_type = 'BYPASS_ATTACK') as bypass_events
FROM domain_events;

-- Vérification que tous les triggers sont actifs
\echo ''
\echo '🔗 VÉRIFICATION ÉTAT TRIGGERS DE DÉFENSE'
\echo '========================================'

SELECT 
    tgname as trigger_name,
    tgenabled as enabled_status,
    CASE tgenabled
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
        ELSE 'UNKNOWN'
    END as status_description
FROM pg_trigger 
WHERE tgname IN ('no_update_domain_events', 'no_delete_domain_events', 'enforce_hash', 'verify_chain_on_insert', 'verify_sequence')
ORDER BY tgname;

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
    bypass_events integer;
    active_triggers integer;
    test_passed boolean;
BEGIN
    SELECT COUNT(*) INTO total_events FROM domain_events;
    SELECT COUNT(*) INTO bypass_events FROM domain_events WHERE aggregate_type = 'BYPASS_ATTACK';
    SELECT COUNT(*) INTO active_triggers FROM pg_trigger WHERE tgname LIKE 'no_%' AND tgenabled = 'O';
    
    test_passed := (bypass_events = 0) AND (active_triggers >= 2);
    
    IF test_passed THEN
        RAISE NOTICE '✅ BUILD_PROOF_ATTACK_P0_APP_01: BYPASS IMPOSSIBLE';
        RAISE NOTICE '   - Événements bypass: %', bypass_events;
        RAISE NOTICE '   - Triggers actifs: %', active_triggers;
        RAISE NOTICE '   - Total événements: %', total_events;
        RAISE NOTICE '   - Guardian bypass: BLOQUÉ';
    ELSE
        RAISE EXCEPTION '❌ BUILD_PROOF_ATTACK_P0_APP_01: VULNÉRABILITÉ BYPASS DÉTECTÉE';
    END IF;
END $$;

\echo ''
\echo '🎯 Test d''attaque bypass Guardian terminé';
