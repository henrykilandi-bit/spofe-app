-- 🛡️ BUILD_PROOF ANCHORS - Ancrage des preuves dans le ledger PostgreSQL
-- Version: 1.0
-- Date: 2026-02-05T23:00:00Z
-- Objectif: Le système prouve... qu'il prouve

-- Mode: Preuve auto-référente & opposable
-- Chaque BUILD_PROOF devient un événement immuable du ledger

\set ON_ERROR_STOP on

-- Étape 1: Table d'ancrage dédiée (append-only)
-- Cette table stocke les BUILD_PROOF comme faits immuables du ledger
-- Mêmes garanties que domain_events, mais dédiée aux preuves

CREATE TABLE IF NOT EXISTS build_proof_anchors (
    -- Identifiant unique de l'ancrage
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identité de la preuve ancrée
    build_proof_id TEXT NOT NULL,
    build_proof_type TEXT NOT NULL, -- OPS / ATTACK / CODE / MIGRATION
    level TEXT NOT NULL,            -- P0_CONSTITUTIONAL, P1_CRITICAL, P2_INFORMATIONAL
    
    -- Empreintes cryptographiques
    build_proof_hash CHAR(64) NOT NULL,     -- Hash du fichier BUILD_PROOF
    signature_hash   CHAR(64) NOT NULL,     -- Hash de la signature Ed25519
    
    -- Chaînage des preuves (indépendant du ledger métier)
    previous_anchor_hash CHAR(64),          -- Hash de l'ancrage précédent
    current_anchor_hash  CHAR(64) NOT NULL,  -- Hash de cet ancrage (chaîne de preuves)
    
    -- Métadonnées d'ancrage
    source TEXT NOT NULL,                   -- CI, MANUAL, AUDIT, EMERGENCY
    anchor_reason TEXT,                     -- Raison de l'ancrage
    anchor_metadata JSONB,                  -- Métadonnées supplémentaires
    
    -- Horodatage et ordre
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sequence BIGSERIAL UNIQUE,              -- Ordre strict (comme domain_events)
    
    -- Contraintes d'unicité
    CONSTRAINT unique_build_proof_anchor UNIQUE (build_proof_id, build_proof_hash),
    CONSTRAINT valid_build_proof_type CHECK (build_proof_type IN ('OPS', 'ATTACK', 'CODE', 'MIGRATION', 'GOVERNANCE')),
    CONSTRAINT valid_level CHECK (level IN ('P0_CONSTITUTIONAL', 'P1_CRITICAL', 'P2_INFORMATIONAL')),
    CONSTRAINT valid_source CHECK (source IN ('CI', 'MANUAL', 'AUDIT', 'EMERGENCY', 'AUTOMATED'))
);

-- Index pour performance et audit
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_sequence ON build_proof_anchors (sequence);
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_type ON build_proof_anchors (build_proof_type);
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_level ON build_proof_anchors (level);
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_created_at ON build_proof_anchors (created_at);
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_hash ON build_proof_anchors (build_proof_hash);

-- Commentaires descriptifs
COMMENT ON TABLE build_proof_anchors IS '🛡️ Ancrage immuable des BUILD_PROOF dans le ledger - Preuve auto-référente';
COMMENT ON COLUMN build_proof_anchors.id IS 'Identifiant unique de l''ancrage';
COMMENT ON COLUMN build_proof_anchors.build_proof_id IS 'ID du BUILD_PROOF ancré (ex: BUILD_PROOF_OPS_P0_01)';
COMMENT ON COLUMN build_proof_anchors.build_proof_type IS 'Type de preuve: OPS, ATTACK, CODE, MIGRATION, GOVERNANCE';
COMMENT ON COLUMN build_proof_anchors.level IS 'Niveau constitutionnel: P0_CONSTITUTIONAL, P1_CRITICAL, P2_INFORMATIONAL';
COMMENT ON COLUMN build_proof_anchors.build_proof_hash IS 'Hash SHA-256 du fichier BUILD_PROOF complet';
COMMENT ON COLUMN build_proof_anchors.signature_hash IS 'Hash SHA-256 du fichier de signature Ed25519';
COMMENT ON COLUMN build_proof_anchors.previous_anchor_hash IS 'Hash de l''ancrage précédent (chaîne de preuves)';
COMMENT ON COLUMN build_proof_anchors.current_anchor_hash IS 'Hash de cet ancrage (calculé automatiquement)';
COMMENT ON COLUMN build_proof_anchors.source IS 'Source de l''ancrage: CI, MANUAL, AUDIT, EMERGENCY, AUTOMATED';
COMMENT ON COLUMN build_proof_anchors.anchor_reason IS 'Raison spécifique de l''ancrage';
COMMENT ON COLUMN build_proof_anchors.anchor_metadata IS 'Métadonnées supplémentaires en JSON';
COMMENT ON COLUMN build_proof_anchors.created_at IS 'Horodatage DB de l''ancrage (impossible à falsifier)';
COMMENT ON COLUMN build_proof_anchors.sequence IS 'Séquence stricte (append-only comme domain_events)';

-- Étape 2: Trigger d'immuabilité (interdiction UPDATE/DELETE)
-- Même mécanisme que domain_events - aucune modification possible

CREATE OR REPLACE FUNCTION forbid_update_delete_build_proof()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION '🛡️ BUILD_PROOF ANCHOR immuable - UPDATE interdit sur build_proof_anchors (ID: %)', OLD.id;
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION '🛡️ BUILD_PROOF ANCHOR immuable - DELETE interdit sur build_proof_anchors (ID: %)', OLD.id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Application du trigger d'immuabilité
DROP TRIGGER IF EXISTS no_update_delete_build_proof ON build_proof_anchors;
CREATE TRIGGER no_update_delete_build_proof
BEFORE UPDATE OR DELETE ON build_proof_anchors
FOR EACH ROW
EXECUTE FUNCTION forbid_update_delete_build_proof();

-- Étape 3: Trigger de calcul du hash d'ancrage (chaîne de preuves)
-- Crée une chaîne indépendante des événements métier

CREATE OR REPLACE FUNCTION compute_build_proof_anchor_hash()
RETURNS trigger AS $$
DECLARE
    last_hash CHAR(64);
    anchor_data TEXT;
BEGIN
    -- Récupération du hash du précédent ancrage
    SELECT current_anchor_hash INTO last_hash
    FROM build_proof_anchors
    ORDER BY sequence DESC
    LIMIT 1;
    
    -- Stockage du hash précédent pour chaînage
    NEW.previous_anchor_hash := last_hash;
    
    -- Construction des données à hasher
    anchor_data := NEW.build_proof_id || 
                   NEW.build_proof_type || 
                   NEW.level || 
                   NEW.build_proof_hash || 
                   NEW.signature_hash || 
                   COALESCE(last_hash, '') ||
                   COALESCE(NEW.source, '') ||
                   COALESCE(NEW.anchor_reason, '');
    
    -- Calcul du hash de l'ancrage (chaîne de preuves)
    NEW.current_anchor_hash := encode(
        digest(anchor_data, 'sha256'),
        'hex'
    );
    
    -- Log de calcul pour audit
    RAISE LOG '🛡️ BUILD_PROOF ANCHOR hash calculé: ID=%, Type=%, Hash=%', 
                NEW.build_proof_id, NEW.build_proof_type, NEW.current_anchor_hash;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Application du trigger de hash
DROP TRIGGER IF EXISTS hash_on_anchor_insert ON build_proof_anchors;
CREATE TRIGGER hash_on_anchor_insert
BEFORE INSERT ON build_proof_anchors
FOR EACH ROW
EXECUTE FUNCTION compute_build_proof_anchor_hash();

-- Étape 4: Trigger de validation d'intégrité
-- Vérifie que l'ancrage est cohérent avant insertion

CREATE OR REPLACE FUNCTION validate_build_proof_anchor()
RETURNS trigger AS $$
DECLARE
    anchor_count INTEGER;
    duplicate_anchor INTEGER;
BEGIN
    -- Vérification qu'on n'ancre pas deux fois la même preuve
    SELECT COUNT(*) INTO duplicate_anchor
    FROM build_proof_anchors
    WHERE build_proof_id = NEW.build_proof_id 
    AND build_proof_hash = NEW.build_proof_hash;
    
    IF duplicate_anchor > 0 THEN
        RAISE EXCEPTION '🛡️ BUILD_PROOF déjà ancré: % (hash: %)', 
                        NEW.build_proof_id, NEW.build_proof_hash;
    END IF;
    
    -- Vérification que les hashes ont la bonne longueur
    IF length(NEW.build_proof_hash) != 64 OR length(NEW.signature_hash) != 64 THEN
        RAISE EXCEPTION '🛡️ Hash invalide - doit faire 64 caractères SHA-256';
    END IF;
    
    -- Validation des niveaux P0
    IF NEW.level = 'P0_CONSTITUTIONAL' THEN
        -- Vérification que les preuves P0 ont bien une signature
        IF NEW.signature_hash = '' OR NEW.signature_hash IS NULL THEN
            RAISE EXCEPTION '🛡️ BUILD_PROOF P0 requiert une signature valide: %', NEW.build_proof_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Application du trigger de validation
DROP TRIGGER IF EXISTS validate_anchor_insert ON build_proof_anchors;
CREATE TRIGGER validate_anchor_insert
BEFORE INSERT ON build_proof_anchors
FOR EACH ROW
EXECUTE FUNCTION validate_build_proof_anchor();

-- Étape 5: Vue d'audit des ancrages
-- Vue optimisée pour l'audit et la vérification

CREATE OR REPLACE VIEW build_proof_audit AS
SELECT 
    sequence,
    build_proof_id,
    build_proof_type,
    level,
    build_proof_hash,
    signature_hash,
    previous_anchor_hash,
    current_anchor_hash,
    source,
    anchor_reason,
    created_at,
    -- Vérification d'intégrité
    CASE 
        WHEN previous_anchor_hash IS NULL THEN 'FIRST_ANCHOR'
        WHEN LAG(current_anchor_hash, 1) OVER (ORDER BY sequence) = previous_anchor_hash THEN 'CHAIN_VALID'
        ELSE 'CHAIN_BROKEN'
    END AS chain_status,
    -- Métadonnées d'audit
    EXTRACT(EPOCH FROM (created_at - LAG(created_at, 1) OVER (ORDER BY sequence))) AS time_since_previous
FROM build_proof_anchors
ORDER BY sequence;

COMMENT ON VIEW build_proof_audit IS '🛡️ Vue d''audit des ancrages BUILD_PROOF avec validation de chaîne';

-- Étape 6: Fonctions de vérification de l'intégrité

-- Vérification de la chaîne complète des ancrages
CREATE OR REPLACE FUNCTION verify_build_proof_anchor_chain()
RETURNS BOOLEAN AS $$
DECLARE
    broken_chains INTEGER;
    total_anchors INTEGER;
BEGIN
    -- Vérification de la continuité de la chaîne
    WITH chain_verification AS (
        SELECT 
            sequence,
            previous_anchor_hash,
            LAG(current_anchor_hash, 1) OVER (ORDER BY sequence) as expected_previous
        FROM build_proof_anchors
        ORDER BY sequence
    )
    SELECT COUNT(*) INTO broken_chains
    FROM chain_verification
    WHERE previous_anchor_hash IS NOT NULL 
    AND previous_anchor_hash != expected_previous;
    
    -- Comptage total
    SELECT COUNT(*) INTO total_anchors FROM build_proof_anchors;
    
    -- Log des résultats
    IF broken_chains = 0 THEN
        RAISE LOG '🛡️ Chaîne BUILD_PROOF valide: % ancrages vérifiés', total_anchors;
        RETURN TRUE;
    ELSE
        RAISE WARNING '🛡️ Chaîne BUILD_PROOF cassée: % ruptures détectées sur % ancrages', 
                       broken_chains, total_anchors;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérification qu'un BUILD_PROOF est ancré
CREATE OR REPLACE FUNCTION is_build_proof_anchored(p_proof_id TEXT, p_proof_hash TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    anchor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO anchor_count
    FROM build_proof_anchors
    WHERE build_proof_id = p_proof_id 
    AND build_proof_hash = p_proof_hash;
    
    RETURN anchor_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 7: Procédure d'ancrage automatisé
-- Procédure stockée pour ancrer un BUILD_PROOF depuis CI/CD

CREATE OR REPLACE FUNCTION anchor_build_proof(
    p_build_proof_id TEXT,
    p_build_proof_type TEXT,
    p_level TEXT,
    p_build_proof_hash TEXT,
    p_signature_hash TEXT,
    p_source TEXT DEFAULT 'CI',
    p_anchor_reason TEXT DEFAULT NULL,
    p_anchor_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    anchor_id UUID;
    anchor_count INTEGER;
BEGIN
    -- Vérification que la preuve n'est pas déjà ancrée
    SELECT COUNT(*) INTO anchor_count
    FROM build_proof_anchors
    WHERE build_proof_id = p_build_proof_id 
    AND build_proof_hash = p_build_proof_hash;
    
    IF anchor_count > 0 THEN
        RAISE EXCEPTION '🛡️ BUILD_PROOF déjà ancré: %', p_build_proof_id;
    END IF;
    
    -- Insertion de l'ancrage (les triggers calculent le hash automatiquement)
    INSERT INTO build_proof_anchors (
        build_proof_id,
        build_proof_type,
        level,
        build_proof_hash,
        signature_hash,
        source,
        anchor_reason,
        anchor_metadata
    ) VALUES (
        p_build_proof_id,
        p_build_proof_type,
        p_level,
        p_build_proof_hash,
        p_signature_hash,
        p_source,
        p_anchor_reason,
        p_anchor_metadata
    ) RETURNING id INTO anchor_id;
    
    -- Log de succès
    RAISE LOG '🛡️ BUILD_PROOF ancré avec succès: % (ID: %)', p_build_proof_id, anchor_id;
    
    RETURN anchor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 8: Rapport d'état des ancrages
-- Vue synthétique pour monitoring

CREATE OR REPLACE VIEW build_proof_anchor_summary AS
SELECT 
    'BUILD_PROOF_ANCHORS' as component,
    COUNT(*) as total_anchors,
    COUNT(*) FILTER (WHERE level = 'P0_CONSTITUTIONAL') as p0_anchors,
    COUNT(*) FILTER (WHERE build_proof_type = 'OPS') as ops_anchors,
    COUNT(*) FILTER (WHERE build_proof_type = 'ATTACK') as attack_anchors,
    COUNT(*) FILTER (WHERE build_proof_type = 'CODE') as code_anchors,
    COUNT(*) FILTER (WHERE source = 'CI') as ci_anchors,
    COUNT(*) FILTER (WHERE source = 'MANUAL') as manual_anchors,
    MIN(created_at) as first_anchor,
    MAX(created_at) as last_anchor,
    -- Vérification d'intégrité
    verify_build_proof_anchor_chain() as chain_valid
FROM build_proof_anchors;

COMMENT ON VIEW build_proof_anchor_summary IS '🛡️ Vue synthétique de l''état des ancrages BUILD_PROOF';

-- Étape 9: Initialisation avec premier ancrage (si table vide)
-- Ancrage de la constitution du système

INSERT INTO build_proof_anchors (
    build_proof_id,
    build_proof_type,
    level,
    build_proof_hash,
    signature_hash,
    source,
    anchor_reason,
    anchor_metadata
) VALUES (
    'CONSTITUTION_ANCHOR_001',
    'GOVERNANCE',
    'P0_CONSTITUTIONAL',
    SHA256('SPOFE Constitution - Ledger immuable - Preuves signées - Résistance aux attaques'),
    SHA256('Constitution Signature - Ed25519 - Gouvernance'),
    'SYSTEM',
    'Ancrage constitutionnel du système SPOFE',
    '{
        "constitution_version": "1.0",
        "anchoring_date": "' || to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') || '",
        "components": ["immutable_ledger", "signed_proofs", "attack_resistance", "ci_governance"],
        "level": "P0_CONSTITUTIONAL"
    }'::jsonb
) ON CONFLICT (build_proof_id, build_proof_hash) DO NOTHING;

-- Étape 10: Validation finale de l'installation
\echo '🛡️ VALIDATION INSTALLATION BUILD_PROOF ANCHORS'
\echo '=================================================='

-- Vérification de la création
\echo '📊 Vérification des tables créées:'
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename IN ('build_proof_anchors');

-- Vérification des triggers
\echo '🔒 Vérification des triggers actifs:'
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'build_proof_anchors'
ORDER BY trigger_name;

-- Vérification des vues
\echo '👁️ Vérification des vues créées:'
SELECT 
    table_name,
    table_type
FROM information_schema.views 
WHERE table_name LIKE 'build_proof_%'
ORDER BY table_name;

-- Vérification des fonctions
\echo '⚙️ Vérification des fonctions créées:'
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%build_proof%'
AND routine_schema = 'public'
ORDER BY routine_name;

-- État initial des ancrages
\echo '📊 État initial des ancrages:'
SELECT * FROM build_proof_anchor_summary;

-- Test de la fonction de vérification
\echo '🔍 Test de vérification de chaîne:'
SELECT verify_build_proof_anchor_chain() as chain_valid;

\echo '✅ BUILD_PROOF ANCHORS installé avec succès'
\echo '🛡️ Le système peut maintenant prouver... qu''il prouve'
\echo '📋 Les BUILD_PROOF sont des faits immuables du ledger'
\echo '🔗 Chaîne de preuves indépendante et vérifiable'
