-- 🔗 MIGRATION 08 - LIER BUILD_PROOF ANCHOR À DOMAIN_EVENT
-- Mode: "preuve ↔ fait : indissociables" activé
-- Passage de "preuves à côté des faits" à "preuves attachées aux faits"

-- Dernière étape constitutionnelle : preuve = conséquence du fait

-- ========================================
-- 1. ÉVOLUTION SCHÉMA SQL - AJOUT RÉFÉRENCE AU FAIT
-- ========================================

-- Ajouter la référence au domain_event (OBLIGATOIRE)
ALTER TABLE build_proof_anchors 
ADD COLUMN IF NOT EXISTS domain_event_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Ajouter la contrainte de clé étrangère (preuve liée à un fait réel)
ALTER TABLE build_proof_anchors 
ADD CONSTRAINT IF NOT EXISTS fk_build_proof_domain_event 
FOREIGN KEY (domain_event_id) REFERENCES domain_events(id) ON DELETE RESTRICT;

-- Ajouter le hash du fait référencé (liaison cryptographique)
ALTER TABLE build_proof_anchors 
ADD COLUMN IF NOT EXISTS domain_event_hash CHAR(64) NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000';

-- Ajouter la contrainte de non-nullité pour le hash
ALTER TABLE build_proof_anchors 
ALTER COLUMN domain_event_hash SET NOT NULL;

-- Ajouter la contrainte de format pour le hash
ALTER TABLE build_proof_anchors 
ADD CONSTRAINT IF NOT EXISTS chk_domain_event_hash_format 
CHECK (domain_event_hash ~ '^[a-f0-9]{64}$');

-- Index pour la recherche rapide par événement
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_domain_event_id 
ON build_proof_anchors(domain_event_id);

CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_domain_event_hash 
ON build_proof_anchors(domain_event_hash);

-- Index composite pour l'audit
CREATE INDEX IF NOT EXISTS idx_build_proof_anchors_event_level 
ON build_proof_anchors(domain_event_id, level);

-- ========================================
-- 2. INVARIANT P0 — PREUVE SANS FAIT INTERDITE
-- ========================================

-- Fonction pour vérifier que le domain_event existe
CREATE OR REPLACE FUNCTION verify_domain_event_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que le domain_event existe
  IF NOT EXISTS (
    SELECT 1 FROM domain_events WHERE id = NEW.domain_event_id
  ) THEN
    RAISE EXCEPTION 
      'OPS-P0-LINK-01: BUILD_PROOF must reference an existing domain_event. Event ID: %', 
      NEW.domain_event_id;
  END IF;

  -- Vérifier que ce n'est pas l'UUID par défaut
  IF NEW.domain_event_id = '00000000-0000-0000-0000-000000000000'::UUID THEN
    RAISE EXCEPTION 
      'OPS-P0-LINK-01: BUILD_PROOF must reference a valid domain_event, not default UUID';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier l'existence du domaine_event
CREATE TRIGGER verify_anchor_domain_event
BEFORE INSERT OR UPDATE ON build_proof_anchors
FOR EACH ROW
EXECUTE FUNCTION verify_domain_event_exists();

-- ========================================
-- 3. VÉRIFICATION HASH ↔ ÉVÉNEMENT (LIASON CRYPTOGRAPHIQUE)
-- ========================================

-- Fonction pour vérifier la cohérence hash ↔ event
CREATE OR REPLACE FUNCTION verify_domain_event_hash()
RETURNS TRIGGER AS $$
DECLARE
  actual_hash CHAR(64);
  event_timestamp TIMESTAMP WITH TIME ZONE;
  anchor_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer le hash actuel du domain_event
  SELECT current_hash, timestamp 
  INTO actual_hash, event_timestamp
  FROM domain_events
  WHERE id = NEW.domain_event_id;

  -- Vérifier que le hash correspond
  IF actual_hash IS DISTINCT FROM NEW.domain_event_hash THEN
    RAISE EXCEPTION 
      'OPS-P0-LINK-01: Domain event hash mismatch for BUILD_PROOF anchor. Expected: %, Got: %', 
      actual_hash, NEW.domain_event_hash;
  END IF;

  -- Vérifier que l'ancre n'est pas antérieure à l'événement
  anchor_timestamp := COALESCE(NEW.timestamp, NOW());
  
  IF anchor_timestamp < event_timestamp THEN
    RAISE EXCEPTION 
      'OPS-P0-LINK-01: BUILD_PROOF anchor cannot be older than referenced domain_event. Event: %, Anchor: %', 
      event_timestamp, anchor_timestamp;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier la cohérence du hash
CREATE TRIGGER verify_anchor_event_hash
BEFORE INSERT OR UPDATE ON build_proof_anchors
FOR EACH ROW
EXECUTE FUNCTION verify_domain_event_hash();

-- ========================================
-- 4. INVARIANT P0 — UNICITÉ DE LA RELATION
-- ========================================

-- Fonction pour empêcher la réaffectation des preuves
CREATE OR REPLACE FUNCTION prevent_proof_reassignment()
RETURNS TRIGGER AS $$
DECLARE
  existing_event_id UUID;
BEGIN
  -- En UPDATE, vérifier que le domain_event_id ne change pas
  IF TG_OP = 'UPDATE' AND OLD.domain_event_id IS DISTINCT FROM NEW.domain_event_id THEN
    RAISE EXCEPTION 
      'OPS-P0-LINK-03: BUILD_PROOF anchor cannot be reassigned to different domain_event. Old: %, New: %', 
      OLD.domain_event_id, NEW.domain_event_id;
  END IF;

  -- Vérifier qu'un même BUILD_PROOF n'est pas déjà ancré à cet événement
  IF TG_OP = 'INSERT' THEN
    SELECT domain_event_id INTO existing_event_id
    FROM build_proof_anchors 
    WHERE build_proof_id = NEW.build_proof_id 
    AND domain_event_id = NEW.domain_event_id;
    
    IF existing_event_id IS NOT NULL THEN
      RAISE EXCEPTION 
        'OPS-P0-LINK-03: BUILD_PROOF % is already anchored to domain_event %', 
        NEW.build_proof_id, NEW.domain_event_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour empêcher la réaffectation
CREATE TRIGGER prevent_proof_reassignment_trigger
BEFORE INSERT OR UPDATE ON build_proof_anchors
FOR EACH ROW
EXECUTE FUNCTION prevent_proof_reassignment();

-- ========================================
-- 5. FONCTIONS D'ANCRAGE AMÉLIORÉES
-- ========================================

-- Fonction principale d'ancrage avec liaison événement
CREATE OR REPLACE FUNCTION anchor_build_proof_with_event(
  p_build_proof_id VARCHAR(255),
  p_build_proof_type VARCHAR(100),
  p_level VARCHAR(50),
  p_build_proof_hash CHAR(64),
  p_signature_hash CHAR(64),
  p_domain_event_id UUID,
  p_domain_event_hash CHAR(64),
  p_source VARCHAR(100) DEFAULT 'MANUAL'
) RETURNS VARCHAR(255) AS $$
DECLARE
  v_anchor_id UUID;
  v_current_hash CHAR(64);
  v_previous_hash CHAR(64);
  v_sequence INTEGER;
  v_timestamp TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Récupérer le hash précédent
  SELECT current_anchor_hash INTO v_previous_hash
  FROM build_proof_anchors 
  ORDER BY sequence DESC 
  LIMIT 1;

  -- Calculer le hash de l'ancre
  v_current_hash := encode(sha256(convert_to(
    p_build_proof_id || p_build_proof_type || p_level || 
    p_build_proof_hash || p_signature_hash || 
    p_domain_event_id::TEXT || p_domain_event_hash || 
    p_source || v_previous_hash || v_timestamp::TEXT, 
    'UTF8')), 'hex');

  -- Récupérer la séquence suivante
  SELECT COALESCE(MAX(sequence), 0) + 1 INTO v_sequence
  FROM build_proof_anchors;

  -- Générer l'ID de l'ancre
  v_anchor_id := gen_random_uuid();

  -- Insérer l'ancre avec liaison événement
  INSERT INTO build_proof_anchors (
    id,
    build_proof_id,
    build_proof_type,
    level,
    build_proof_hash,
    signature_hash,
    current_anchor_hash,
    previous_anchor_hash,
    domain_event_id,
    domain_event_hash,
    sequence,
    timestamp,
    source
  ) VALUES (
    v_anchor_id,
    p_build_proof_id,
    p_build_proof_type,
    p_level,
    p_build_proof_hash,
    p_signature_hash,
    v_current_hash,
    v_previous_hash,
    p_domain_event_id,
    p_domain_event_hash,
    v_sequence,
    v_timestamp,
    p_source
  );

  -- Journaliser l'événement d'ancrage
  INSERT INTO domain_events (
    id,
    event_type,
    event_data,
    sequence,
    timestamp,
    source
  ) VALUES (
    gen_random_uuid(),
    'BUILD_PROOF_ANCHORED',
    jsonb_build_object(
      'anchor_id', v_anchor_id,
      'build_proof_id', p_build_proof_id,
      'domain_event_id', p_domain_event_id,
      'anchor_hash', v_current_hash,
      'level', p_level
    ),
    v_sequence,
    v_timestamp,
    'BUILD_PROOF_ANCHORING'
  );

  RETURN v_anchor_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un événement et ancrer une preuve (transactionnelle)
CREATE OR REPLACE FUNCTION create_event_and_anchor_proof(
  p_event_type VARCHAR(100),
  p_event_data JSONB,
  p_build_proof_id VARCHAR(255),
  p_build_proof_type VARCHAR(100),
  p_level VARCHAR(50),
  p_build_proof_hash CHAR(64),
  p_signature_hash CHAR(64),
  p_source VARCHAR(100) DEFAULT 'MANUAL'
) RETURNS TABLE(event_id UUID, anchor_id VARCHAR(255)) AS $$
DECLARE
  v_event_id UUID;
  v_anchor_id UUID;
  v_event_hash CHAR(64);
  v_sequence INTEGER;
  v_timestamp TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Créer le domain_event
  v_event_id := gen_random_uuid();
  
  -- Calculer le hash de l'événement
  v_event_hash := encode(sha256(convert_to(
    p_event_type || p_event_data::TEXT || v_timestamp::TEXT, 
    'UTF8')), 'hex');

  -- Récupérer la séquence
  SELECT COALESCE(MAX(sequence), 0) + 1 INTO v_sequence
  FROM domain_events;

  -- Insérer l'événement
  INSERT INTO domain_events (
    id,
    event_type,
    event_data,
    current_hash,
    previous_hash,
    sequence,
    timestamp,
    source
  ) VALUES (
    v_event_id,
    p_event_type,
    p_event_data,
    v_event_hash,
    (SELECT current_hash FROM domain_events ORDER BY sequence DESC LIMIT 1),
    v_sequence,
    v_timestamp,
    p_source
  );

  -- Ancrer la preuve liée à cet événement
  v_anchor_id := anchor_build_proof_with_event(
    p_build_proof_id,
    p_build_proof_type,
    p_level,
    p_build_proof_hash,
    p_signature_hash,
    v_event_id,
    v_event_hash,
    p_source
  )::UUID;

  RETURN QUERY SELECT v_event_id, v_anchor_id::VARCHAR(255);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. VUES D'AUDIT AMÉLIORÉES
-- ========================================

-- Vue des faits avec leurs preuves
CREATE OR REPLACE VIEW domain_events_with_proofs AS
SELECT 
  e.id as event_id,
  e.sequence,
  e.event_type,
  e.timestamp as event_timestamp,
  e.current_hash as event_hash,
  e.source as event_source,
  b.id as anchor_id,
  b.build_proof_id,
  b.build_proof_type,
  b.level as proof_level,
  b.current_anchor_hash,
  b.timestamp as anchor_timestamp,
  b.source as anchor_source,
  CASE 
    WHEN b.id IS NOT NULL THEN 'PROVEN'
    ELSE 'UNPROVEN'
  END as legitimacy_status
FROM domain_events e
LEFT JOIN build_proof_anchors b ON b.domain_event_id = e.id
ORDER BY e.sequence;

-- Vue des événements critiques sans preuves
CREATE OR REPLACE VIEW unproven_critical_events AS
SELECT 
  e.id,
  e.sequence,
  e.event_type,
  e.timestamp,
  e.current_hash,
  e.source,
  'CRITICAL_UNPROVEN' as status,
  'OPS-P0-LINK-02: Critical event without BUILD_PROOF' as violation
FROM domain_events e
LEFT JOIN build_proof_anchors b ON b.domain_event_id = e.id
WHERE b.id IS NULL
AND e.event_type IN (
  'DEPLOYMENT_REQUESTED',
  'DEPLOYMENT_COMPLETED',
  'MIGRATION_STARTED',
  'MIGRATION_COMPLETED',
  'CONFIG_CHANGE_REQUESTED',
  'CONFIG_CHANGE_COMPLETED',
  'BUILD_PROOF_VALIDATION_FAILED',
  'CONSTITUTION_BROKEN_ENTERED',
  'CONSTITUTION_RESTORED'
)
ORDER BY e.sequence DESC;

-- Vue de la chaîne complète fait → preuve
CREATE OR REPLACE VIEW fact_to_proof_chain AS
SELECT 
  e.sequence as event_sequence,
  e.event_type,
  e.timestamp as event_time,
  b.sequence as anchor_sequence,
  b.build_proof_id,
  b.level as proof_level,
  b.timestamp as anchor_time,
  CASE 
    WHEN b.sequence = e.sequence THEN 'IMMEDIATE'
    WHEN b.sequence = e.sequence + 1 THEN 'CONSECUTIVE'
    ELSE 'DELAYED'
  END as anchoring_timing,
  EXTRACT(EPOCH FROM (b.timestamp - e.timestamp)) as delay_seconds
FROM domain_events e
INNER JOIN build_proof_anchors b ON b.domain_event_id = e.id
ORDER BY e.sequence, b.sequence;

-- ========================================
-- 7. FONCTIONS DE VALIDATION CONSTITUTIONNELLE
-- ========================================

-- Fonction pour valider que tous les événements critiques ont des preuves
CREATE OR REPLACE FUNCTION validate_critical_events_have_proofs()
RETURNS TABLE(event_id UUID, event_type VARCHAR(100), violation TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.event_type,
    'OPS-P0-LINK-02: Critical event without BUILD_PROOF'::TEXT
  FROM domain_events e
  LEFT JOIN build_proof_anchors b ON b.domain_event_id = e.id
  WHERE b.id IS NULL
  AND e.event_type IN (
    'DEPLOYMENT_REQUESTED',
    'DEPLOYMENT_COMPLETED',
    'MIGRATION_STARTED',
    'MIGRATION_COMPLETED',
    'CONFIG_CHANGE_REQUESTED',
    'CONFIG_CHANGE_COMPLETED',
    'BUILD_PROOF_VALIDATION_FAILED',
    'CONSTITUTION_BROKEN_ENTERED',
    'CONSTITUTION_RESTORED'
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider la cohérence des hashes
CREATE OR REPLACE FUNCTION validate_event_proof_hash_consistency()
RETURNS TABLE(anchor_id UUID, violation TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    'OPS-P0-LINK-01: Domain event hash mismatch'::TEXT
  FROM build_proof_anchors b
  INNER JOIN domain_events e ON e.id = b.domain_event_id
  WHERE e.current_hash != b.domain_event_hash;
END;
$$ LANGUAGE plpgsql;

-- Fonction de validation constitutionnelle complète
CREATE OR REPLACE FUNCTION validate_fact_proof_integrity()
RETURNS TABLE(
  total_events INTEGER,
  proven_events INTEGER,
  unproven_events INTEGER,
  critical_violations INTEGER,
  hash_violations INTEGER,
  legitimacy_score NUMERIC
) AS $$
DECLARE
  v_total_events INTEGER;
  v_proven_events INTEGER;
  v_unproven_events INTEGER;
  v_critical_violations INTEGER;
  v_hash_violations INTEGER;
BEGIN
  -- Compter les événements
  SELECT COUNT(*) INTO v_total_events FROM domain_events;
  
  -- Compter les événements prouvés
  SELECT COUNT(DISTINCT e.id) INTO v_proven_events 
  FROM domain_events e 
  INNER JOIN build_proof_anchors b ON b.domain_event_id = e.id;
  
  -- Événements non prouvés
  v_unproven_events := v_total_events - v_proven_events;
  
  -- Violations critiques
  SELECT COUNT(*) INTO v_critical_violations 
  FROM validate_critical_events_have_proofs();
  
  -- Violations de hash
  SELECT COUNT(*) INTO v_hash_violations 
  FROM validate_event_proof_hash_consistency();
  
  RETURN QUERY SELECT 
    v_total_events,
    v_proven_events,
    v_unproven_events,
    v_critical_violations,
    v_hash_violations,
    CASE 
      WHEN v_total_events = 0 THEN 100.0
      ELSE (v_proven_events::NUMERIC / v_total_events::NUMERIC) * 100
    END;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. PROCÉDURE DE MIGRATION DES ANCIENNES ANCHRES
-- ========================================

-- Procédure pour migrer les ancrages existants vers le nouveau modèle
CREATE OR REPLACE FUNCTION migrate_existing_anchors_to_event_linked()
RETURNS TABLE(migrated_count INTEGER, failed_count INTEGER) AS $$
DECLARE
  v_migrated INTEGER := 0;
  v_failed INTEGER := 0;
  anchor_record RECORD;
  v_default_event_id UUID;
BEGIN
  -- Créer un événement de migration par défaut pour les ancrages orphelins
  INSERT INTO domain_events (
    id,
    event_type,
    event_data,
    current_hash,
    sequence,
    timestamp,
    source
  ) VALUES (
    gen_random_uuid(),
    'LEGACY_ANCHOR_MIGRATION',
    jsonb_build_object('migration_timestamp', NOW()),
    encode(sha256(convert_to('LEGACY_ANCHOR_MIGRATION' || NOW()::TEXT, 'UTF8')), 'hex'),
    (SELECT COALESCE(MAX(sequence), 0) + 1 FROM domain_events),
    NOW(),
    'MIGRATION'
  ) RETURNING id INTO v_default_event_id;

  -- Traiter chaque ancre existante
  FOR anchor_record IN 
    SELECT id, build_proof_id, current_anchor_hash, timestamp
    FROM build_proof_anchors 
    WHERE domain_event_id = '00000000-0000-0000-0000-000000000000'::UUID
  LOOP
    BEGIN
      -- Mettre à jour l'ancre avec l'événement de migration
      UPDATE build_proof_anchors 
      SET 
        domain_event_id = v_default_event_id,
        domain_event_hash = (SELECT current_hash FROM domain_events WHERE id = v_default_event_id)
      WHERE id = anchor_record.id;
      
      v_migrated := v_migrated + 1;
    EXCEPTION
      WHEN OTHERS THEN
        v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_migrated, v_failed;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. INSPECTION FINALE
-- ========================================

-- Affichage des modifications apportées
DO $$
DECLARE
  table_name TEXT;
  column_name TEXT;
BEGIN
  RAISE NOTICE '🔗 MIGRATION 08 - LIER BUILD_PROOF ANCHOR À DOMAIN_EVENT TERMINÉE';
  RAISE NOTICE '=========================================================';
  
  -- Tables modifiées
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename = 'build_proof_anchors'
  LOOP
    RAISE NOTICE 'Table modifiée: %', table_name;
    
    -- Colonnes ajoutées
    FOR column_name IN 
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = table_name 
      AND column_name IN ('domain_event_id', 'domain_event_hash')
    LOOP
      RAISE NOTICE '  - Colonne ajoutée: %', column_name;
    END LOOP;
  END LOOP;
  
  -- Vues créées
  FOR table_name IN 
    SELECT viewname FROM pg_views WHERE schemaname = 'public' 
    AND viewname IN ('domain_events_with_proofs', 'unproven_critical_events', 'fact_to_proof_chain')
  LOOP
    RAISE NOTICE 'Vue créée: %', table_name;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Fonctions disponibles:';
  RAISE NOTICE '  - anchor_build_proof_with_event()';
  RAISE NOTICE '  - create_event_and_anchor_proof()';
  RAISE NOTICE '  - validate_fact_proof_integrity()';
  RAISE NOTICE '  - migrate_existing_anchors_to_event_linked()';
  RAISE NOTICE '';
  RAISE NOTICE 'Invariants P0 appliqués:';
  RAISE NOTICE '  - OPS-P0-LINK-01: Preuve sans fait interdite';
  RAISE NOTICE '  - OPS-P0-LINK-02: Événement critique sans preuve = illégitimité';
  RAISE NOTICE '  - OPS-P0-LINK-03: Preuve non réaffectable';
  RAISE NOTICE '';
  RAISE NOTICE 'Mode "preuve ↔ fait : indissociables" activé';
  RAISE NOTICE 'Preuve = conséquence du fait';
  RAISE NOTICE 'Fait = responsabilité prouvée';
END
$$;
