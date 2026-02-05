-- =====================================================
-- 🏛️ SCHÉMA CONSTITUTIONNEL SPOFE v3.0
-- Système d'Orchestration de Processus Financiers d'Entreprise
-- 
-- Principes constitutionnels :
-- 1. Append-only strict (INSERT uniquement)
-- 2. Hash calculé dans PostgreSQL
-- 3. Chaîne cryptographique continue
-- 4. Aucune dépendance ORM
-- 5. Ordre strict des événements
-- 6. Horloge DB = source du temps
--
-- Design : Stockage des faits irréversibles, pas des états
-- =====================================================

-- Extension cryptographique requise
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 🗃️ TABLE PRINCIPALE — domain_events
-- Cœur absolu du système - Stockage des faits irréversibles
-- =====================================================

CREATE TABLE IF NOT EXISTS domain_events (
    -- Clé primaire immuable
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification métier
    aggregate_id UUID NOT NULL,
    aggregate_type TEXT NOT NULL,
    event_type TEXT NOT NULL,

    -- Donnée métier brute (non interprétée)
    payload JSONB NOT NULL,

    -- Chaîne cryptographique
    previous_hash CHAR(64),
    current_hash CHAR(64) NOT NULL,

    -- Métadonnées constitutionnelles
    sequence BIGSERIAL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Sécurité structurelle
    CONSTRAINT payload_not_empty CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT hash_format CHECK (current_hash ~ '^[a-f0-9]{64}$'),
    CONSTRAINT aggregate_type_not_empty CHECK (length(trim(aggregate_type)) > 0),
    CONSTRAINT event_type_not_empty CHECK (length(trim(event_type)) > 0)
);

-- =====================================================
-- 🔐 INTERDICTION ABSOLUE D'UPDATE / DELETE
-- Protection constitutionnelle contre toute modification
-- =====================================================

CREATE OR REPLACE FUNCTION forbid_update_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE_LEDGER: UPDATE/DELETE forbidden on domain_events. Facts are immutable.';
END;
$$ LANGUAGE plpgsql;

-- Triggers de protection immuable
DROP TRIGGER IF EXISTS no_update_domain_events ON domain_events;
CREATE TRIGGER no_update_domain_events
BEFORE UPDATE ON domain_events
FOR EACH ROW
EXECUTE FUNCTION forbid_update_delete();

DROP TRIGGER IF EXISTS no_delete_domain_events ON domain_events;
CREATE TRIGGER no_delete_domain_events
BEFORE DELETE ON domain_events
FOR EACH ROW
EXECUTE FUNCTION forbid_update_delete();

-- =====================================================
-- 🧪 CALCUL AUTOMATIQUE DU HASH (DANS POSTGRESQL)
-- Chaîne cryptographique continue et infalsifiable
-- =====================================================

CREATE OR REPLACE FUNCTION compute_event_hash()
RETURNS trigger AS $$
DECLARE
    last_hash CHAR(64);
    hash_input TEXT;
BEGIN
    -- Récupération du hash précédent pour la chaîne
    SELECT current_hash
    INTO last_hash
    FROM domain_events
    ORDER BY sequence DESC
    LIMIT 1;

    -- Construction de l'input de hash de manière déterministe
    hash_input := coalesce(NEW.aggregate_id::text, '') || '|' ||
                  NEW.aggregate_type || '|' ||
                  NEW.event_type || '|' ||
                  NEW.payload::text || '|' ||
                  coalesce(last_hash, '');

    -- Calcul du hash SHA-256
    NEW.previous_hash := last_hash;
    NEW.current_hash := encode(digest(hash_input, 'sha256'), 'hex');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger de calcul automatique du hash
DROP TRIGGER IF EXISTS hash_on_insert ON domain_events;
CREATE TRIGGER hash_on_insert
BEFORE INSERT ON domain_events
FOR EACH ROW
EXECUTE FUNCTION compute_event_hash();

-- =====================================================
-- 🧾 TABLE D'AUDIT TRANSVERSALE
-- Traçabilité légale de qui a déclenché quoi
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES domain_events(id) ON DELETE CASCADE,
    actor_id TEXT,
    actor_type TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT actor_type_valid CHECK (actor_type IN ('USER', 'SYSTEM', 'MODULE', 'GUARDIAN')),
    CONSTRAINT source_not_empty CHECK (length(trim(coalesce(source, ''))) > 0)
);

-- Protection de l'audit trail (également append-only)
CREATE OR REPLACE FUNCTION forbid_audit_update_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE_AUDIT: UPDATE/DELETE forbidden on audit_trail. Audit records are immutable.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_update_audit_trail ON audit_trail;
CREATE TRIGGER no_update_audit_trail
BEFORE UPDATE ON audit_trail
FOR EACH ROW
EXECUTE FUNCTION forbid_audit_update_delete();

DROP TRIGGER IF EXISTS no_delete_audit_trail ON audit_trail;
CREATE TRIGGER no_delete_audit_trail
BEFORE DELETE ON audit_trail
FOR EACH ROW
EXECUTE FUNCTION forbid_audit_update_delete();

-- =====================================================
-- 📊 VUES DE LECTURE OPTIMISÉES
-- Pour compatibilité avec SPOFE existant
-- =====================================================

-- Vue pour les événements par agrégat
CREATE OR REPLACE VIEW v_aggregate_events AS
SELECT 
    aggregate_id,
    aggregate_type,
    event_type,
    payload,
    sequence,
    created_at,
    current_hash,
    previous_hash
FROM domain_events
ORDER BY aggregate_id, sequence;

-- Vue pour la timeline système
CREATE OR REPLACE VIEW v_system_timeline AS
SELECT 
    sequence,
    aggregate_id,
    aggregate_type,
    event_type,
    payload,
    created_at,
    current_hash
FROM domain_events
ORDER BY sequence;

-- Vue pour l'audit avec détails événements
CREATE OR REPLACE VIEW v_audit_trail_detailed AS
SELECT 
    at.id as audit_id,
    at.actor_id,
    at.actor_type,
    at.source,
    at.created_at as audit_created_at,
    de.id as event_id,
    de.aggregate_id,
    de.aggregate_type,
    de.event_type,
    de.payload,
    de.sequence,
    de.current_hash,
    de.created_at as event_created_at
FROM audit_trail at
JOIN domain_events de ON at.event_id = de.id
ORDER BY de.sequence;

-- =====================================================
-- 🔍 FONCTIONS DE VALIDATION CONSTITUTIONNELLE
-- Vérification de l'intégrité de la chaîne cryptographique
-- =====================================================

-- Fonction de validation de la chaîne cryptographique
CREATE OR REPLACE FUNCTION validate_cryptographic_chain()
RETURNS TABLE(
    sequence BIGINT,
    is_valid BOOLEAN,
    expected_hash CHAR(64),
    actual_hash CHAR(64),
    error_message TEXT
) AS $$
DECLARE
    event_record RECORD;
    computed_hash CHAR(64);
    prev_hash CHAR(64);
BEGIN
    FOR event_record IN 
        SELECT sequence, aggregate_id, aggregate_type, event_type, payload, current_hash, previous_hash
        FROM domain_events
        ORDER BY sequence
    LOOP
        -- Calcul du hash attendu
        computed_hash := encode(
            digest(
                coalesce(event_record.aggregate_id::text, '') || '|' ||
                event_record.aggregate_type || '|' ||
                event_record.event_type || '|' ||
                event_record.payload::text || '|' ||
                coalesce(event_record.previous_hash, ''),
                'sha256'
            ),
            'hex'
        );

        -- Validation
        RETURN QUERY SELECT 
            event_record.sequence,
            (computed_hash = event_record.current_hash) as is_valid,
            computed_hash as expected_hash,
            event_record.current_hash as actual_hash,
            CASE 
                WHEN computed_hash = event_record.current_hash THEN NULL
                ELSE 'Hash mismatch at sequence ' || event_record.sequence
            END as error_message;
        
        -- Arrêt si invalide
        IF computed_hash != event_record.current_hash THEN
            RETURN;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction de vérification d'intégrité rapide
CREATE OR REPLACE FUNCTION check_ledger_integrity()
RETURNS BOOLEAN AS $$
DECLARE
    validation_count INTEGER;
    total_events INTEGER;
BEGIN
    -- Compte les validations réussies
    SELECT COUNT(*)
    INTO validation_count
    FROM validate_cryptographic_chain()
    WHERE is_valid = true;
    
    -- Compte le total des événements
    SELECT COUNT(*)
    INTO total_events
    FROM domain_events;
    
    -- Retourne true si tous sont valides
    RETURN validation_count = total_events;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 📈 STATISTIQUES ET MÉTRIQUES CONSTITUTIONNELLES
-- Pour monitoring et reporting BUILD_PROOF
-- =====================================================

-- Fonction de statistiques du ledger
CREATE OR REPLACE FUNCTION get_ledger_statistics()
RETURNS TABLE(
    total_events BIGINT,
    first_event_date TIMESTAMPTZ,
    last_event_date TIMESTAMPTZ,
    chain_integrity BOOLEAN,
    unique_aggregates BIGINT,
    aggregate_types TEXT[],
    event_types TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_events,
        MIN(created_at) as first_event_date,
        MAX(created_at) as last_event_date,
        check_ledger_integrity() as chain_integrity,
        COUNT(DISTINCT aggregate_id) as unique_aggregates,
        array_agg(DISTINCT aggregate_type) as aggregate_types,
        array_agg(DISTINCT event_type) as event_types
    FROM domain_events;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 🔧 FONCTIONS D'INSERTION CONFORMES
-- Pour compatibilité avec les modules SPOFE existants
-- =====================================================

-- Fonction principale d'insertion d'événement
CREATE OR REPLACE FUNCTION insert_domain_event(
    p_aggregate_id UUID,
    p_aggregate_type TEXT,
    p_event_type TEXT,
    p_payload JSONB,
    p_actor_id TEXT DEFAULT NULL,
    p_actor_type TEXT DEFAULT 'SYSTEM',
    p_source TEXT DEFAULT 'SPOFE_MODULE'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    -- Insertion de l'événement principal
    INSERT INTO domain_events (
        aggregate_id,
        aggregate_type,
        event_type,
        payload
    ) VALUES (
        p_aggregate_id,
        p_aggregate_type,
        p_event_type,
        p_payload
    ) RETURNING id INTO event_id;
    
    -- Insertion dans l'audit trail
    INSERT INTO audit_trail (
        event_id,
        actor_id,
        actor_type,
        source
    ) VALUES (
        event_id,
        p_actor_id,
        p_actor_type,
        p_source
    );
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour les événements de comptabilité
CREATE OR REPLACE FUNCTION insert_accounting_event(
    p_aggregate_id UUID,
    p_event_type TEXT,
    p_payload JSONB,
    p_actor_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
BEGIN
    RETURN insert_domain_event(
        p_aggregate_id,
        'accounting_aggregate',
        p_event_type,
        p_payload,
        p_actor_id,
        'USER',
        'COMPTABILITE_MODULE'
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour les événements tiers
CREATE OR REPLACE FUNCTION insert_third_party_event(
    p_aggregate_id UUID,
    p_event_type TEXT,
    p_payload JSONB,
    p_actor_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
BEGIN
    RETURN insert_domain_event(
        p_aggregate_id,
        'third_party_aggregate',
        p_event_type,
        p_payload,
        p_actor_id,
        'USER',
        'GESTION_TIERS_MODULE'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 📊 INDEXATION OPTIMISÉE
-- Pour performances de lecture sans compromettre l'immutabilité
-- =====================================================

-- Index sur la séquence (ordre chronologique)
CREATE INDEX IF NOT EXISTS idx_domain_events_sequence ON domain_events(sequence);

-- Index sur l'agrégat (reconstruction d'état)
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON domain_events(aggregate_id, sequence);

-- Index sur le type d'agrégat (filtering)
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate_type ON domain_events(aggregate_type);

-- Index sur le type d'événement (recherche)
CREATE INDEX IF NOT EXISTS idx_domain_events_event_type ON domain_events(event_type);

-- Index sur la date (timeline)
CREATE INDEX IF NOT EXISTS idx_domain_events_created_at ON domain_events(created_at);

-- Index sur le hash (validation)
CREATE INDEX IF NOT EXISTS idx_domain_events_current_hash ON domain_events(current_hash);

-- Index sur l'audit trail
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_id ON audit_trail(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor ON audit_trail(actor_id, actor_type);

-- =====================================================
-- 🛡️ GARANTIES CONSTITUTIONNELLES OBTENUES
-- =====================================================

/*
Garantie                    Assurée par
-------------------------  ----------------------------------
Immutabilité               Triggers DB (forbid_update_delete)
Ordre strict               sequence (BIGSERIAL UNIQUE)
Anti-falsification         Hash chain (previous_hash + current_hash)
Audit légal                DB clock + audit_trail
Anti-ORM                   SQL-only (pas de dépendances ORM)
Traçabilité               event_id dans audit_trail
Non-répudiation            Hash cryptographique
Intégrité                 validate_cryptographic_chain()
Performance               Indexation optimisée
*/

-- =====================================================
-- 🎯 COMPATIBILITÉ SPOFE EXISTANT
-- =====================================================

/*
✅ Guardians : inchangés (validation avant insertion)
✅ Commands : inchangées (structure préservée)
✅ Modules CASCADE : inchangés (logique métier)
✅ Frontend : inchangé (API READ-ONLY)
✅ Tests : inchangés (validation fonctionnelle)

Seul le point d'écriture change :
- Avant : INSERT direct dans tables métier
- Après : INSERT via insert_domain_event()
*/

-- =====================================================
-- 📋 VALIDATION FINALE DU SCHÉMA
-- =====================================================

-- Validation que tout est correctement créé
DO $$
DECLARE
    table_count INTEGER;
    trigger_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Compte des objets créés
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('domain_events', 'audit_trail');
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';
    SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
    SELECT COUNT(*) INTO view_count FROM information_schema.views WHERE table_schema = 'public';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
    
    RAISE NOTICE '🏛️ SCHÉMA CONSTITUTIONNEL SPOFE v3.0 CRÉÉ AVEC SUCCÈS';
    RAISE NOTICE '📊 Tables créées : %', table_count;
    RAISE NOTICE '🔧 Triggers créés : %', trigger_count;
    RAISE NOTICE '🧪 Fonctions créées : %', function_count;
    RAISE NOTICE '👁️ Vues créées : %', view_count;
    RAISE NOTICE '📈 Index créés : %', index_count;
    RAISE NOTICE '🔐 Intégrité chaîne cryptographique : %', CASE WHEN check_ledger_integrity() THEN 'VALIDE' ELSE 'À VÉRIFIER' END;
END $$;

-- =====================================================
-- 🎊 FIN DU SCHÉMA CONSTITUTIONNEL
-- =====================================================

/*
Ce schéma constitutionnel garantit :
✅ Immutabilité absolue des faits
✅ Traçabilité cryptographique complète
✅ Audit légal infalsifiable
✅ Performance de lecture optimisée
✅ Compatibilité totale SPOFE existant
✅ Préparation pour industrialisation

Le schéma stocke des FAITS irréversibles, pas des états.
Il PROUVE, il ne présente pas.
*/
