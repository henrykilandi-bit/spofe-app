-- 📊 VUE CONSTITUTIONNELLE POUR AUDIT AUTOMATIQUE
-- Mode "audit = fait prouvé, traçable, opposable" activé
-- Vue SQL optimisée pour la génération de rapports d'audit

-- ========================================
-- 1. VUE PRINCIPALE D'AUDIT CONSTITUTIONNEL
-- ========================================

-- Vue des faits critiques avec leurs preuves P0
CREATE OR REPLACE VIEW constitutional_audit_facts AS
SELECT 
    e.id AS domain_event_id,
    e.event_type,
    e.sequence,
    e.timestamp AS event_timestamp,
    e.current_hash AS event_hash,
    e.source AS event_source,
    
    -- Preuves associées
    b.id AS proof_anchor_id,
    b.build_proof_id,
    b.build_proof_type,
    b.level AS proof_level,
    b.current_anchor_hash,
    b.timestamp AS proof_timestamp,
    b.source AS proof_source,
    
    -- Statut de légitimité
    CASE 
        WHEN b.id IS NOT NULL AND b.level = 'P0_CONSTITUTIONAL' THEN 'PROVEN'
        WHEN b.id IS NOT NULL AND b.level != 'P0_CONSTITUTIONAL' THEN 'INSUFFICIENT_PROOF'
        ELSE 'UNPROVEN'
    END AS legitimacy_status,
    
    -- Métriques de timing
    EXTRACT(EPOCH FROM (b.timestamp - e.timestamp)) AS proof_delay_seconds,
    CASE 
        WHEN b.sequence = e.sequence THEN 'IMMEDIATE'
        WHEN b.sequence = e.sequence + 1 THEN 'CONSECUTIVE'
        ELSE 'DELAYED'
    END AS proof_timing,
    
    -- Classe de criticité
    CASE 
        WHEN e.event_type IN ('DEPLOYMENT_REQUESTED', 'MIGRATION_STARTED', 'MIGRATION_COMPLETED') THEN 'CRITICAL_OPERATIONS'
        WHEN e.event_type IN ('CONFIG_CHANGE_REQUESTED', 'CONFIG_CHANGE_COMPLETED') THEN 'CRITICAL_CONFIGURATION'
        WHEN e.event_type IN ('CONSTITUTION_BROKEN_ENTERED', 'CONSTITUTION_RESTORED') THEN 'CRITICAL_GOVERNANCE'
        WHEN e.event_type IN ('BUILD_PROOF_VALIDATION_FAILED', 'SECURITY_BREACH_DETECTED') THEN 'CRITICAL_SECURITY'
        ELSE 'STANDARD'
    END AS criticality_class
    
FROM domain_events e
LEFT JOIN build_proof_anchors b 
    ON b.domain_event_id = e.id
    AND b.level = 'P0_CONSTITUTIONAL'
WHERE e.event_type IN (
    -- Faits critiques nécessitant une preuve P0
    'DEPLOYMENT_REQUESTED',
    'DEPLOYMENT_COMPLETED',
    'MIGRATION_STARTED',
    'MIGRATION_COMPLETED',
    'CONFIG_CHANGE_REQUESTED',
    'CONFIG_CHANGE_COMPLETED',
    'CONSTITUTION_BROKEN_ENTERED',
    'CONSTITUTION_RESTORED',
    'BUILD_PROOF_VALIDATION_FAILED',
    'SECURITY_BREACH_DETECTED',
    'DATA_BREACH_DETECTED',
    'UNAUTHORIZED_ACCESS_ATTEMPTED',
    'SYSTEM_COMPROMISED',
    'EMERGENCY_MODE_ACTIVATED',
    'DISASTER_RECOVERY_INITIATED'
)
ORDER BY e.sequence;

-- ========================================
-- 2. VUE DE SYNTHÈSE POUR RAPPORT D'AUDIT
-- ========================================

-- Vue résumée pour la génération de rapports
CREATE OR REPLACE VIEW constitutional_audit_summary AS
SELECT 
    -- Période d'audit
    MIN(e.sequence) AS audit_from_sequence,
    MAX(e.sequence) AS audit_to_sequence,
    MIN(e.timestamp) AS audit_from_timestamp,
    MAX(e.timestamp) AS audit_to_timestamp,
    COUNT(*) AS total_critical_events,
    
    -- Statistiques de preuves
    COUNT(CASE WHEN legitimacy_status = 'PROVEN' THEN 1 END) AS proven_events,
    COUNT(CASE WHEN legitimacy_status = 'UNPROVEN' THEN 1 END) AS unproven_events,
    COUNT(CASE WHEN legitimacy_status = 'INSUFFICIENT_PROOF' THEN 1 END) AS insufficient_proof_events,
    
    -- Score de légitimité
    CASE 
        WHEN COUNT(*) = 0 THEN 100.0
        ELSE (COUNT(CASE WHEN legitimacy_status = 'PROVEN' THEN 1 END) * 100.0 / COUNT(*))
    END AS legitimacy_score,
    
    -- Métriques de timing
    AVG(proof_delay_seconds) AS avg_proof_delay_seconds,
    MAX(proof_delay_seconds) AS max_proof_delay_seconds,
    MIN(proof_delay_seconds) AS min_proof_delay_seconds,
    
    -- Conclusion binaire (règle P0)
    CASE 
        WHEN COUNT(CASE WHEN legitimacy_status = 'UNPROVEN' THEN 1 END) > 0 THEN 'ILLEGITIMATE'
        WHEN COUNT(CASE WHEN legitimacy_status = 'INSUFFICIENT_PROOF' THEN 1 END) > 0 THEN 'ILLEGITIMATE'
        ELSE 'LEGITIMATE'
    END AS audit_conclusion,
    
    -- Timestamp de l'audit
    NOW() AS audit_timestamp,
    
    -- Métadonnées
    'SYSTEM_LEGITIMACY_REPORT' AS audit_type,
    'P0' AS constitution_level,
    TRUE AS linked_to_domain_events,
    TRUE AS verifiable,
    TRUE AS reproducible
    
FROM constitutional_audit_facts;

-- ========================================
-- 3. VUE DES VIOLATIONS CONSTITUTIONNELLES
-- ========================================

-- Vue des événements critiques sans preuves valides
CREATE OR REPLACE VIEW constitutional_violations AS
SELECT 
    domain_event_id,
    event_type,
    sequence,
    event_timestamp,
    event_hash,
    criticality_class,
    legitimacy_status,
    
    -- Description de la violation
    CASE 
        WHEN legitimacy_status = 'UNPROVEN' THEN 'OPS-P0-AUDIT-01: Critical event without P0 proof'
        WHEN legitimacy_status = 'INSUFFICIENT_PROOF' THEN 'OPS-P0-AUDIT-01: Critical event with insufficient proof level'
        ELSE 'UNKNOWN'
    END AS violation_type,
    
    -- Impact sur la légitimité
    CASE 
        WHEN criticality_class IN ('CRITICAL_OPERATIONS', 'CRITICAL_SECURITY', 'CRITICAL_GOVERNANCE') THEN 'HIGH'
        WHEN criticality_class = 'CRITICAL_CONFIGURATION' THEN 'MEDIUM'
        ELSE 'LOW'
    END AS impact_level,
    
    -- Actions requises
    CASE 
        WHEN legitimacy_status = 'UNPROVEN' THEN 'GENERATE_P0_PROOF_IMMEDIATELY'
        WHEN legitimacy_status = 'INSUFFICIENT_PROOF' THEN 'UPGRADE_TO_P0_PROOF'
        ELSE 'NO_ACTION'
    END AS required_action,
    
    -- Délai depuis l'événement
    EXTRACT(EPOCH FROM (NOW() - event_timestamp)) / 3600 AS hours_since_event
    
FROM constitutional_audit_facts
WHERE legitimacy_status IN ('UNPROVEN', 'INSUFFICIENT_PROOF')
ORDER BY 
    impact_level DESC,
    hours_since_event DESC;

-- ========================================
-- 4. VUE D'HISTORIQUE D'AUDIT
-- ========================================

-- Vue pour suivre l'évolution de la légitimité dans le temps
CREATE OR REPLACE VIEW constitutional_audit_history AS
SELECT 
    -- Période analysée
    DATE_TRUNC('hour', event_timestamp) AS audit_hour,
    DATE_TRUNC('day', event_timestamp) AS audit_day,
    
    -- Statistiques par période
    COUNT(*) AS total_events,
    COUNT(CASE WHEN legitimacy_status = 'PROVEN' THEN 1 END) AS proven_events,
    COUNT(CASE WHEN legitimacy_status = 'UNPROVEN' THEN 1 END) AS unproven_events,
    
    -- Score de légitimité par période
    CASE 
        WHEN COUNT(*) = 0 THEN 100.0
        ELSE (COUNT(CASE WHEN legitimacy_status = 'PROVEN' THEN 1 END) * 100.0 / COUNT(*))
    END AS legitimacy_score,
    
    -- Types d'événements par période
    COUNT(CASE WHEN criticality_class = 'CRITICAL_OPERATIONS' THEN 1 END) AS critical_operations,
    COUNT(CASE WHEN criticality_class = 'CRITICAL_SECURITY' THEN 1 END) AS critical_security,
    COUNT(CASE WHEN criticality_class = 'CRITICAL_GOVERNANCE' THEN 1 END) AS critical_governance,
    COUNT(CASE WHEN criticality_class = 'CRITICAL_CONFIGURATION' THEN 1 END) AS critical_configuration,
    
    -- Timing moyen des preuves
    AVG(proof_delay_seconds) AS avg_proof_delay
    
FROM constitutional_audit_facts
GROUP BY 
    DATE_TRUNC('hour', event_timestamp),
    DATE_TRUNC('day', event_timestamp)
ORDER BY audit_hour DESC;

-- ========================================
-- 5. FONCTIONS D'AUDIT AVANCÉES
-- ========================================

-- Fonction pour générer le rapport d'audit au format JSON
CREATE OR REPLACE FUNCTION generate_constitutional_audit_json()
RETURNS JSONB AS $$
DECLARE
    audit_result JSONB;
    audit_summary RECORD;
    audit_facts JSONB := '[]'::JSONB;
BEGIN
    -- Récupérer le résumé d'audit
    SELECT * INTO audit_summary FROM constitutional_audit_summary;
    
    -- Récupérer les faits audités
    SELECT jsonb_agg(
        jsonb_build_object(
            'domain_event_id', domain_event_id,
            'event_type', event_type,
            'sequence', sequence,
            'event_timestamp', event_timestamp,
            'event_hash', event_hash,
            'proof', CASE 
                WHEN legitimacy_status = 'PROVEN' THEN jsonb_build_object(
                    'build_proof_id', build_proof_id,
                    'proof_level', proof_level,
                    'anchor_hash', current_anchor_hash,
                    'proof_timestamp', proof_timestamp
                )
                ELSE NULL::JSONB
            END,
            'legitimacy_status', legitimacy_status,
            'criticality_class', criticality_class,
            'proof_delay_seconds', proof_delay_seconds,
            'proof_timing', proof_timing
        )
    ) INTO audit_facts
    FROM constitutional_audit_facts;
    
    -- Construire le rapport JSON complet
    audit_result := jsonb_build_object(
        'audit_type', audit_summary.audit_type,
        'generated_at_db', audit_summary.audit_timestamp,
        'report_id', 'AUDIT_' || to_char(NOW(), 'YYYYMMDD_HH24MISS'),
        
        'scope', jsonb_build_object(
            'domain_events_from_sequence', audit_summary.audit_from_sequence,
            'domain_events_to_sequence', audit_summary.audit_to_sequence,
            'audit_from_timestamp', audit_summary.audit_from_timestamp,
            'audit_to_timestamp', audit_summary.audit_to_timestamp,
            'total_critical_events', audit_summary.total_critical_events
        ),
        
        'facts_audited', audit_facts,
        
        'summary', jsonb_build_object(
            'facts_checked', audit_summary.total_critical_events,
            'facts_without_proof', audit_summary.unproven_events,
            'facts_with_insufficient_proof', audit_summary.insufficient_proof_events,
            'legitimacy_score', ROUND(audit_summary.legitimacy_score, 2),
            'avg_proof_delay_seconds', ROUND(audit_summary.avg_proof_delay_seconds, 2)
        ),
        
        'conclusion', jsonb_build_object(
            'status', audit_summary.audit_conclusion,
            'rule', 'OPS-P0-AUDIT-01: Binary legitimacy assessment',
            'threshold', 'All critical facts must have P0 proofs',
            'violations_count', audit_summary.unproven_events + audit_summary.insufficient_proof_events
        ),
        
        'metadata', jsonb_build_object(
            'generated_by', 'generate_constitutional_audit_json()',
            'constitution_level', audit_summary.constitution_level,
            'linked_to_domain_events', audit_summary.linked_to_domain_events,
            'verifiable', audit_summary.verifiable,
            'reproducible', audit_summary.reproducible
        )
    );
    
    RETURN audit_result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider la légitimité à un instant T
CREATE OR REPLACE FUNCTION validate_legitimacy_at_time(
    target_timestamp TIMESTAMP WITH TIME ZONE
) RETURNS TABLE(
    is_legitimate BOOLEAN,
    legitimacy_score NUMERIC,
    violations_count INTEGER,
    audit_details JSONB
) AS $$
DECLARE
    audit_result JSONB;
    violations_count INTEGER;
BEGIN
    -- Générer le rapport d'audit pour l'instant spécifié
    SELECT jsonb_build_object(
        'target_timestamp', target_timestamp,
        'facts_at_time', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'domain_event_id', domain_event_id,
                    'event_type', event_type,
                    'sequence', sequence,
                    'legitimacy_status', legitimacy_status,
                    'criticality_class', criticality_class
                )
            )
            FROM constitutional_audit_facts
            WHERE event_timestamp <= target_timestamp
        ),
        'summary_at_time', (
            SELECT jsonb_build_object(
                'total_events', COUNT(*),
                'proven_events', COUNT(CASE WHEN legitimacy_status = 'PROVEN' THEN 1 END),
                'unproven_events', COUNT(CASE WHEN legitimacy_status = 'UNPROVEN' THEN 1 END),
                'legitimacy_score', CASE 
                    WHEN COUNT(*) = 0 THEN 100.0
                    ELSE (COUNT(CASE WHEN legitimacy_status = 'PROVEN' THEN 1 END) * 100.0 / COUNT(*))
                END
            )
            FROM constitutional_audit_facts
            WHERE event_timestamp <= target_timestamp
        )
    ) INTO audit_result;
    
    -- Extraire le nombre de violations
    violations_count := (audit_result->'summary_at_time'->>'unproven_events')::INTEGER;
    
    -- Retourner les résultats
    RETURN QUERY SELECT 
        (violations_count = 0) AS is_legitimate,
        (audit_result->'summary_at_time'->>'legitimacy_score')::NUMERIC AS legitimacy_score,
        violations_count,
        audit_result AS audit_details;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour détecter les régressions de légitimité
CREATE OR REPLACE FUNCTION detect_legitimacy_regressions(
    hours_back INTEGER DEFAULT 24
) RETURNS TABLE(
    regression_detected BOOLEAN,
    previous_score NUMERIC,
    current_score NUMERIC,
    score_change NUMERIC,
    regression_details JSONB
) AS $$
DECLARE
    current_score NUMERIC;
    previous_score NUMERIC;
    regression_details JSONB;
BEGIN
    -- Score actuel
    SELECT legitimacy_score INTO current_score 
    FROM constitutional_audit_summary;
    
    -- Score il y a N heures
    SELECT legitimacy_score INTO previous_score
    FROM constitutional_audit_history 
    WHERE audit_hour >= NOW() - INTERVAL '1 hour' * hours_back
    ORDER BY audit_hour ASC 
    LIMIT 1;
    
    -- Détecter la régression
    IF previous_score IS NOT NULL THEN
        regression_details := jsonb_build_object(
            'current_score', current_score,
            'previous_score', previous_score,
            'score_change', current_score - previous_score,
            'regression_threshold', -5.0,
            'hours_analyzed', hours_back,
            'analysis_timestamp', NOW()
        );
        
        RETURN QUERY SELECT 
            (current_score - previous_score < -5.0) AS regression_detected,
            previous_score,
            current_score,
            current_score - previous_score,
            regression_details;
    ELSE
        regression_details := jsonb_build_object(
            'error', 'Insufficient historical data',
            'hours_analyzed', hours_back,
            'analysis_timestamp', NOW()
        );
        
        RETURN QUERY SELECT 
            FALSE AS regression_detected,
            NULL::NUMERIC,
            current_score,
            NULL::NUMERIC,
            regression_details;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. PROCÉDURE D'AUDIT AUTOMATIQUE
-- ========================================

-- Procédure pour exécuter un audit complet et stocker les résultats
CREATE OR REPLACE FUNCTION run_constitutional_audit(
    store_results BOOLEAN DEFAULT TRUE
) RETURNS TABLE(
    audit_id UUID,
    audit_timestamp TIMESTAMP WITH TIME ZONE,
    conclusion TEXT,
    legitimacy_score NUMERIC,
    violations_count INTEGER,
    audit_report JSONB
) AS $$
DECLARE
    audit_id UUID := gen_random_uuid();
    audit_timestamp TIMESTAMP WITH TIME ZONE := NOW();
    audit_report JSONB;
    conclusion TEXT;
    legitimacy_score NUMERIC;
    violations_count INTEGER;
BEGIN
    -- Générer le rapport d'audit
    audit_report := generate_constitutional_audit_json();
    
    -- Extraire les informations clés
    conclusion := audit_report->'conclusion'->>'status';
    legitimacy_score := (audit_report->'summary'->>'legitimacy_score')::NUMERIC;
    violations_count := (audit_report->'conclusion'->>'violations_count')::INTEGER;
    
    -- Stocker les résultats si demandé
    IF store_results THEN
        INSERT INTO audit_reports (
            id,
            audit_timestamp,
            conclusion,
            legitimacy_score,
            violations_count,
            audit_report,
            constitution_level
        ) VALUES (
            audit_id,
            audit_timestamp,
            conclusion,
            legitimacy_score,
            violations_count,
            audit_report,
            'P0'
        );
    END IF;
    
    -- Retourner les résultats
    RETURN QUERY SELECT 
        audit_id,
        audit_timestamp,
        conclusion,
        legitimacy_score,
        violations_count,
        audit_report;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. INSPECTION FINALE
-- ========================================

-- Affichage des vues créées
DO $$
DECLARE
    view_name TEXT;
BEGIN
    RAISE NOTICE '📊 VUE CONSTITUTIONNELLE POUR AUDIT AUTOMATIQUE CRÉÉE';
    RAISE NOTICE '================================================';
    
    FOR view_name IN 
        SELECT viewname FROM pg_views WHERE schemaname = 'public' 
        AND viewname IN ('constitutional_audit_facts', 'constitutional_audit_summary', 'constitutional_violations', 'constitutional_audit_history')
    LOOP
        RAISE NOTICE 'Vue créée: %', view_name;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Fonctions disponibles:';
    RAISE NOTICE '  - generate_constitutional_audit_json()';
    RAISE NOTICE '  - validate_legitimacy_at_time(timestamp)';
    RAISE NOTICE '  - detect_legitimacy_regressions(hours)';
    RAISE NOTICE '  - run_constitutional_audit(store_results)';
    RAISE NOTICE '';
    RAISE NOTICE 'Mode "audit = fait prouvé, traçable, opposable" activé';
    RAISE NOTICE 'Les rapports d''audit sont:';
    RAISE NOTICE '  - Déterministes';
    RAISE NOTICE '  - Reproductibles';
    RAISE NOTICE '  - Liés à des faits précis';
    RAISE NOTICE '  - Ancrés dans le ledger';
    RAISE NOTICE '  - Lui-même auditable';
END
$$;
