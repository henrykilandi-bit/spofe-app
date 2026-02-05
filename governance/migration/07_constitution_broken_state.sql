-- 🚨 MIGRATION 07 - MODE CONSTITUTION BROKEN
-- Le système sait qu'il n'a plus le droit d'exister normalement
-- Mode: "le système sait qu'il n'a plus le droit d'exister normalement" activé

-- Dernier mécanisme de maturité constitutionnelle

-- ========================================
-- 1. TABLE DES ÉVÉNEMENTS DE GOUVERNANCE
-- ========================================

CREATE TABLE IF NOT EXISTS governance_events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    event_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    constitutional_level VARCHAR(50) NOT NULL DEFAULT 'P0',
    system_state_before VARCHAR(50),
    system_state_after VARCHAR(50),
    guardian VARCHAR(100) NOT NULL DEFAULT 'constitution_broken_monitor',
    irreversible BOOLEAN NOT NULL DEFAULT true,
    ledger_entry BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'CONSTITUTION_BROKEN_ENTERED',
        'CONSTITUTION_RESTORED',
        'BUILD_PROOF_VALIDATION_FAILED',
        'CHAIN_CONTINUITY_BROKEN',
        'SIGNATURE_VALIDATION_FAILED',
        'CI_REPORT_ILLLEGITIMATE',
        'TEMPORAL_VIOLATION_DETECTED'
    )),
    CONSTRAINT chk_constitutional_level CHECK (constitutional_level IN ('P0', 'P1', 'P2')),
    CONSTRAINT chk_system_state CHECK (system_state_before IN ('LEGITIMATE', 'CONSTITUTION_BROKEN') OR system_state_before IS NULL),
    CONSTRAINT chk_system_state_after CHECK (system_state_after IN ('LEGITIMATE', 'CONSTITUTION_BROKEN') OR system_state_after IS NULL)
);

-- Index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_governance_events_timestamp ON governance_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_governance_events_type ON governance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_governance_events_hash ON governance_events(event_hash);

-- ========================================
-- 2. TABLE D'ÉTAT SYSTÈME CONSTITUTIONNEL
-- ========================================

CREATE TABLE IF NOT EXISTS constitution_system_state (
    id SERIAL PRIMARY KEY,
    system_state VARCHAR(50) NOT NULL,
    reason TEXT,
    evidence TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    guardian VARCHAR(100) NOT NULL DEFAULT 'constitution_broken_monitor',
    event_id VARCHAR(255) REFERENCES governance_events(event_id),
    
    -- Contraintes
    CONSTRAINT chk_system_state_value CHECK (system_state IN ('LEGITIMATE', 'CONSTITUTION_BROKEN')),
    CONSTRAINT uk_current_state UNIQUE (system_state, timestamp) -- Assure l'unicité temporelle
);

-- Index pour la récupération de l'état actuel
CREATE INDEX IF NOT EXISTS idx_constitution_system_state_timestamp ON constitution_system_state(timestamp DESC);

-- Vue pour l'état système actuel
CREATE OR REPLACE VIEW current_system_state AS
SELECT 
    system_state,
    reason,
    evidence,
    timestamp,
    guardian,
    event_id
FROM constitution_system_state 
ORDER BY timestamp DESC 
LIMIT 1;

-- ========================================
-- 3. TABLE DES VIOLATIONS CONSTITUTIONNELLES
-- ========================================

CREATE TABLE IF NOT EXISTS constitutional_violations (
    id SERIAL PRIMARY KEY,
    violation_type VARCHAR(100) NOT NULL,
    violation_severity VARCHAR(20) NOT NULL DEFAULT 'P0',
    description TEXT NOT NULL,
    evidence TEXT,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    event_id VARCHAR(255) REFERENCES governance_events(event_id),
    
    -- Contraintes
    CONSTRAINT chk_violation_severity CHECK (violation_severity IN ('P0', 'P1', 'P2')),
    CONSTRAINT chk_violation_status CHECK (status IN ('ACTIVE', 'RESOLVED', 'IGNORED'))
);

-- Index pour le suivi des violations
CREATE INDEX IF NOT EXISTS idx_constitutional_violations_type ON constitutional_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_constitutional_violations_status ON constitutional_violations(status);
CREATE INDEX IF NOT EXISTS idx_constitutional_violations_detected_at ON constitutional_violations(detected_at DESC);

-- ========================================
-- 4. TRIGGER POUR VALIDATION DES ACTIONS
-- ========================================

-- Fonction pour vérifier si une action est autorisée
CREATE OR REPLACE FUNCTION is_action_allowed(
    p_action VARCHAR(100),
    p_environment VARCHAR(50) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_state VARCHAR(50);
    v_broken_actions TEXT[] := ARRAY['deploy', 'migration', 'infra_switch', 'critical_config_change', 'manual_override'];
    v_readonly_actions TEXT[] := ARRAY['read_only', 'report_generation', 'audit', 'guided_remediation'];
BEGIN
    -- Récupérer l'état système actuel
    SELECT system_state INTO v_current_state FROM current_system_state;
    
    -- Si pas d'état, considérer comme légitime
    IF v_current_state IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Si en mode légitime, tout est autorisé
    IF v_current_state = 'LEGITIMATE' THEN
        RETURN TRUE;
    END IF;
    
    -- Si en mode CONSTITUTION BROKEN
    IF v_current_state = 'CONSTITUTION BROKEN' THEN
        -- Actions interdites
        IF p_action = ANY(v_broken_actions) THEN
            RETURN FALSE;
        END IF;
        
        -- Actions autorisées (read-only)
        IF p_action = ANY(v_readonly_actions) THEN
            RETURN TRUE;
        END IF;
        
        -- Par défaut, refuser
        RETURN FALSE;
    END IF;
    
    -- État inconnu, refuser par sécurité
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. FONCTIONS DE GESTION D'ÉTAT
-- ========================================

-- Fonction pour entrer en mode CONSTITUTION BROKEN
CREATE OR REPLACE FUNCTION enter_constitution_broken_mode(
    p_reason TEXT,
    p_evidence TEXT,
    p_guardian VARCHAR(100) DEFAULT 'constitution_broken_monitor'
) RETURNS VARCHAR(255) AS $$
DECLARE
    v_event_id VARCHAR(255);
    v_event_hash VARCHAR(64);
    v_event_data JSONB;
    v_previous_state VARCHAR(50);
BEGIN
    -- Vérifier si déjà en mode BROKEN
    SELECT system_state INTO v_previous_state FROM current_system_state;
    
    IF v_previous_state = 'CONSTITUTION BROKEN' THEN
        RAISE EXCEPTION 'System already in CONSTITUTION BROKEN mode';
    END IF;
    
    -- Générer l'ID d'événement
    v_event_id := 'CONSTITUTION_EVENT_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
    
    -- Créer les données de l'événement
    v_event_data := jsonb_build_object(
        'governance_event', jsonb_build_object(
            'event_id', v_event_id,
            'event_type', 'CONSTITUTION_BROKEN_ENTERED',
            'timestamp', NOW(),
            'system_state', 'CONSTITUTION BROKEN',
            'reason', p_reason,
            'evidence', p_evidence,
            'guardian', p_guardian,
            'constitutional_level', 'P0',
            'irreversible', true,
            'ledger_entry', true
        )
    );
    
    -- Calculer le hash
    v_event_hash := encode(sha256(convert_to(v_event_data::text, 'UTF8')), 'hex');
    
    -- Insérer l'événement
    INSERT INTO governance_events (
        event_id,
        event_type,
        event_data,
        event_hash,
        timestamp,
        constitutional_level,
        system_state_before,
        system_state_after,
        guardian,
        irreversible,
        ledger_entry
    ) VALUES (
        v_event_id,
        'CONSTITUTION_BROKEN_ENTERED',
        v_event_data,
        v_event_hash,
        NOW(),
        'P0',
        v_previous_state,
        'CONSTITUTION BROKEN',
        p_guardian,
        true,
        true
    );
    
    -- Mettre à jour l'état système
    INSERT INTO constitution_system_state (
        system_state,
        reason,
        evidence,
        guardian,
        event_id
    ) VALUES (
        'CONSTITUTION BROKEN',
        p_reason,
        p_evidence,
        p_guardian,
        v_event_id
    );
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour sortir du mode CONSTITUTION BROKEN
CREATE OR REPLACE FUNCTION restore_constitutional_state(
    p_reason TEXT,
    p_evidence TEXT,
    p_guardian VARCHAR(100) DEFAULT 'constitution_broken_monitor'
) RETURNS VARCHAR(255) AS $$
DECLARE
    v_event_id VARCHAR(255);
    v_event_hash VARCHAR(64);
    v_event_data JSONB;
    v_previous_state VARCHAR(50);
BEGIN
    -- Vérifier si en mode BROKEN
    SELECT system_state INTO v_previous_state FROM current_system_state;
    
    IF v_previous_state != 'CONSTITUTION BROKEN' THEN
        RAISE EXCEPTION 'System not in CONSTITUTION BROKEN mode';
    END IF;
    
    -- Générer l'ID d'événement
    v_event_id := 'CONSTITUTION_EVENT_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
    
    -- Créer les données de l'événement
    v_event_data := jsonb_build_object(
        'governance_event', jsonb_build_object(
            'event_id', v_event_id,
            'event_type', 'CONSTITUTION_RESTORED',
            'timestamp', NOW(),
            'system_state', 'LEGITIMATE',
            'reason', p_reason,
            'evidence', p_evidence,
            'guardian', p_guardian,
            'constitutional_level', 'P0',
            'irreversible', true,
            'ledger_entry', true
        )
    );
    
    -- Calculer le hash
    v_event_hash := encode(sha256(convert_to(v_event_data::text, 'UTF8')), 'hex');
    
    -- Insérer l'événement
    INSERT INTO governance_events (
        event_id,
        event_type,
        event_data,
        event_hash,
        timestamp,
        constitutional_level,
        system_state_before,
        system_state_after,
        guardian,
        irreversible,
        ledger_entry
    ) VALUES (
        v_event_id,
        'CONSTITUTION_RESTORED',
        v_event_data,
        v_event_hash,
        NOW(),
        'P0',
        'CONSTITUTION BROKEN',
        'LEGITIMATE',
        p_guardian,
        true,
        true
    );
    
    -- Mettre à jour l'état système
    INSERT INTO constitution_system_state (
        system_state,
        reason,
        evidence,
        guardian,
        event_id
    ) VALUES (
        'LEGITIMATE',
        p_reason,
        p_evidence,
        p_guardian,
        v_event_id
    );
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. FONCTIONS DE VALIDATION AUTOMATIQUE
-- ========================================

-- Fonction pour valider les BUILD_PROOF P0
CREATE OR REPLACE FUNCTION validate_build_proof_p0() 
RETURNS TABLE(violation_type TEXT, description TEXT, evidence TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'BUILD_PROOF_P0_INVALID'::TEXT,
        'BUILD_PROOF P0 invalide: ' || bp.build_proof_id::TEXT,
        'status:' || COALESCE(bp.status, 'MISSING')::TEXT
    FROM build_proof_anchors bp
    WHERE bp.level = 'P0_CONSTITUTIONAL' 
    AND (bp.status != 'CERTIFIED' OR bp.status IS NULL);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider les signatures
CREATE OR REPLACE FUNCTION validate_proof_signatures()
RETURNS TABLE(violation_type TEXT, description TEXT, evidence TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'PROOF_SIGNATURES_INVALID'::TEXT,
        'Signature manquante pour: ' || bp.build_proof_id::TEXT,
        'signature_file_missing'::TEXT
    FROM build_proof_anchors bp
    WHERE bp.level = 'P0_CONSTITUTIONAL' 
    AND bp.signature_hash IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider la continuité des chaînes
CREATE OR REPLACE FUNCTION validate_chain_continuity()
RETURNS TABLE(violation_type TEXT, description TEXT, evidence TEXT) AS $$
BEGIN
    -- Vérification de la continuité du ledger
    RETURN QUERY
    SELECT 
        'CHAIN_CONTINUITY_BROKEN'::TEXT,
        'Rupture dans la chaîne du ledger entre les séquences ' || prev_seq::TEXT || ' et ' || current_seq::TEXT,
        'sequence_gap_detected'::TEXT
    FROM (
        SELECT 
            sequence as current_seq,
            LAG(sequence) OVER (ORDER BY sequence) as prev_seq
        FROM domain_events
    ) t 
    WHERE prev_seq IS NOT NULL 
    AND sequence != prev_seq + 1
    LIMIT 1;
    
    -- Vérification de la continuité des ancrages BUILD_PROOF
    RETURN QUERY
    SELECT 
        'CHAIN_CONTINUITY_BROKEN'::TEXT,
        'Rupture dans la chaîne BUILD_PROOF entre les séquences ' || prev_seq::TEXT || ' et ' || current_seq::TEXT,
        'anchor_gap_detected'::TEXT
    FROM (
        SELECT 
            sequence as current_seq,
            LAG(sequence) OVER (ORDER BY sequence) as prev_seq
        FROM build_proof_anchors
    ) t 
    WHERE prev_seq IS NOT NULL 
    AND sequence != prev_seq + 1
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. PROCÉDURE DE MONITORING AUTOMATIQUE
-- ========================================

-- Procédure principale de monitoring constitutionnel
CREATE OR REPLACE FUNCTION monitor_constitutional_state()
RETURNS TABLE(system_state TEXT, violations_detected INTEGER, action_required TEXT) AS $$
DECLARE
    v_current_state TEXT;
    v_violation_count INTEGER := 0;
    v_action_required TEXT := 'NONE';
    v_event_id VARCHAR(255);
BEGIN
    -- Obtenir l'état actuel
    SELECT system_state INTO v_current_state FROM current_system_state;
    
    -- Si pas d'état, considérer comme légitime
    IF v_current_state IS NULL THEN
        v_current_state := 'LEGITIMATE';
    END IF;
    
    -- Si déjà en mode BROKEN, vérifier si on peut sortir
    IF v_current_state = 'CONSTITUTION BROKEN' THEN
        -- Compter les violations actuelles
        SELECT COUNT(*) INTO v_violation_count FROM (
            SELECT * FROM validate_build_proof_p0()
            UNION ALL
            SELECT * FROM validate_proof_signatures()
            UNION ALL
            SELECT * FROM validate_chain_continuity()
        ) violations;
        
        -- Si plus de violations, tenter la restauration
        IF v_violation_count = 0 THEN
            -- Générer un nouvel audit (simulation)
            v_action_required := 'RESTORE_POSSIBLE';
        ELSE
            v_action_required := 'MAINTAIN_BROKEN';
        END IF;
    ELSE
        -- Vérifier s'il y a des violations
        SELECT COUNT(*) INTO v_violation_count FROM (
            SELECT * FROM validate_build_proof_p0()
            UNION ALL
            SELECT * FROM validate_proof_signatures()
            UNION ALL
            SELECT * FROM validate_chain_continuity()
        ) violations;
        
        -- Si des violations détectées, entrer en mode BROKEN
        IF v_violation_count > 0 THEN
            v_event_id := enter_constitution_broken_mode(
                'Constitutional violations detected: ' || v_violation_count || ' violations',
                'automated_monitoring_detection',
                'constitution_broken_monitor'
            );
            v_current_state := 'CONSTITUTION BROKEN';
            v_action_required := 'ENTER_BROKEN_MODE';
        END IF;
    END IF;
    
    RETURN QUERY SELECT v_current_state, v_violation_count, v_action_required;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. VUES DE SURVEILLANCE
-- ========================================

-- Vue des violations actives
CREATE OR REPLACE VIEW active_constitutional_violations AS
SELECT 
    cv.violation_type,
    cv.violation_severity,
    cv.description,
    cv.evidence,
    cv.detected_at,
    cv.status,
    ge.event_id
FROM constitutional_violations cv
LEFT JOIN governance_events ge ON cv.event_id = ge.event_id
WHERE cv.status = 'ACTIVE'
ORDER BY cv.detected_at DESC;

-- Vue de l'historique des états constitutionnels
CREATE OR REPLACE VIEW constitutional_state_history AS
SELECT 
    css.system_state,
    css.reason,
    css.evidence,
    css.timestamp,
    css.guardian,
    css.event_id,
    ge.event_type
FROM constitution_system_state css
LEFT JOIN governance_events ge ON css.event_id = ge.event_id
ORDER BY css.timestamp DESC;

-- Vue des événements de gouvernance récents
CREATE OR REPLACE VIEW recent_governance_events AS
SELECT 
    ge.event_id,
    ge.event_type,
    ge.timestamp,
    ge.system_state_before,
    ge.system_state_after,
    ge.guardian,
    ge.event_data->'governance_event'->>'reason' as reason
FROM governance_events ge
ORDER BY ge.timestamp DESC
LIMIT 100;

-- ========================================
-- 9. DROITS ET PERMISSIONS
-- ========================================

-- Créer un rôle pour le monitoring constitutionnel
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'constitution_monitor') THEN
        CREATE ROLE constitution_monitor;
    END IF;
END
$$;

-- Accès en lecture seule pour le monitoring
GRANT SELECT ON governance_events TO constitution_monitor;
GRANT SELECT ON constitution_system_state TO constitution_monitor;
GRANT SELECT ON constitutional_violations TO constitution_monitor;
GRANT SELECT ON current_system_state TO constitution_monitor;
GRANT SELECT ON active_constitutional_violations TO constitution_monitor;
GRANT SELECT ON constitutional_state_history TO constitution_monitor;
GRANT SELECT ON recent_governance_events TO constitution_monitor;

GRANT EXECUTE ON FUNCTION is_action_allowed TO constitution_monitor;
GRANT EXECUTE ON FUNCTION monitor_constitutional_state TO constitution_monitor;

-- ========================================
-- 10. INSPECTION FINALE
-- ========================================

-- Affichage des tables créées
DO $$
DECLARE
    table_name TEXT;
BEGIN
    RAISE NOTICE '🚨 MIGRATION 07 - MODE CONSTITUTION BROKEN TERMINÉE';
    RAISE NOTICE '=======================================';
    
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('governance_events', 'constitution_system_state', 'constitutional_violations')
    LOOP
        RAISE NOTICE 'Table créée: %', table_name;
    END LOOP;
    
    FOR table_name IN 
        SELECT viewname FROM pg_views WHERE schemaname = 'public' 
        AND viewname IN ('current_system_state', 'active_constitutional_violations', 'constitutional_state_history', 'recent_governance_events')
    LOOP
        RAISE NOTICE 'Vue créée: %', table_name;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Fonctions disponibles:';
    RAISE NOTICE '  - is_action_allowed(action, environment)';
    RAISE NOTICE '  - enter_constitution_broken_mode(reason, evidence, guardian)';
    RAISE NOTICE '  - restore_constitutional_state(reason, evidence, guardian)';
    RAISE NOTICE '  - monitor_constitutional_state()';
    RAISE NOTICE '';
    RAISE NOTICE 'Mode CONSTITUTION BROKEN activé - Le système sait quand il n''a plus le droit d''exister normalement';
END
$$;
