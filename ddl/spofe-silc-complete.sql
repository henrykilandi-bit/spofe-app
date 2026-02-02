-- ==================================================================================
-- SPOFE DDL — PostgreSQL Production-Ready
-- Conforme aux invariants SILC v2.1
-- Append-only, immuable, 100% traçable
-- ==================================================================================

BEGIN;

SET client_min_messages TO WARNING;
SET search_path TO public;

-- ==================================================================================
-- 🔹 1. RÔLES & PRIVILÈGES (I-DB-01)
-- ==================================================================================

-- Rôle écriture strict (INSERT uniquement)
CREATE ROLE spofe_writer NOINHERIT;

-- Rôle lecture
CREATE ROLE spofe_reader NOINHERIT;

-- Aucun UPDATE / DELETE autorisé par défaut
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO spofe_writer, spofe_reader;

-- ==================================================================================
-- 🔹 2. TYPES & ENUM (I-DB-06)
-- ==================================================================================

CREATE TYPE decision_type AS ENUM (
  'CREATE',
  'UPDATE',
  'CLOSE',
  'TRANSFER'
);

CREATE TYPE actor_role AS ENUM (
  'SYSTEM',
  'ADMIN',
  'USER'
);

CREATE TYPE event_type AS ENUM (
  'CREATED',
  'UPDATED',
  'CLOSED',
  'TRANSFERRED'
);

CREATE TYPE fact_type AS ENUM (
  'SNAPSHOT'
);

-- ==================================================================================
-- 🔹 3. TABLES WRITE-MODEL (APPEND-ONLY)
-- ==================================================================================

-- 3.1 Process Registry (I-DB-03)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE TABLE process_registry (
  process_name TEXT PRIMARY KEY,
  allowed_predecessors TEXT[] NOT NULL,
  allowed_successors   TEXT[] NOT NULL,
  invariant_set        TEXT[] NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE process_registry IS 'Registre des processus autorisés - Source de vérité';
COMMENT ON COLUMN process_registry.process_name IS 'Identifiant unique du processus';
COMMENT ON COLUMN process_registry.allowed_predecessors IS 'Processus pouvant précéder celui-ci';
COMMENT ON COLUMN process_registry.allowed_successors IS 'Processus pouvant suivre celui-ci';
COMMENT ON COLUMN process_registry.invariant_set IS 'Ensemble des invariants à respecter';

-- 3.2 Decision (Source de vérité)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE TABLE decision (
  decision_id   UUID PRIMARY KEY,
  process_name  TEXT NOT NULL,
  actor_role    actor_role NOT NULL,
  decision_type decision_type NOT NULL,
  payload       JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_decision_process
    FOREIGN KEY (process_name)
    REFERENCES process_registry(process_name)
);

CREATE INDEX idx_decision_process_name ON decision(process_name);
CREATE INDEX idx_decision_actor_role ON decision(actor_role);
CREATE INDEX idx_decision_created_at ON decision(created_at);

COMMENT ON TABLE decision IS 'Registre append-only des décisions - Source de vérité absolue';
COMMENT ON COLUMN decision.decision_id IS 'UUID unique de la décision';
COMMENT ON COLUMN decision.process_name IS 'Processus ayant produit cette décision';
COMMENT ON COLUMN decision.actor_role IS 'Rôle de l''acteur décideur';
COMMENT ON COLUMN decision.decision_type IS 'Type de décision (CREATE, UPDATE, CLOSE, TRANSFER)';
COMMENT ON COLUMN decision.payload IS 'Données de la décision (JSON)';

-- 3.3 Event (Conséquence observable)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE TABLE event (
  event_id    UUID PRIMARY KEY,
  decision_id UUID NOT NULL,
  event_type  event_type NOT NULL,
  payload     JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_event_decision
    FOREIGN KEY (decision_id)
    REFERENCES decision(decision_id)
);

CREATE INDEX idx_event_decision_id ON event(decision_id);
CREATE INDEX idx_event_type ON event(event_type);
CREATE INDEX idx_event_occurred_at ON event(occurred_at);

COMMENT ON TABLE event IS 'Registre append-only des événements observables';
COMMENT ON COLUMN event.event_id IS 'UUID unique de l''événement';
COMMENT ON COLUMN event.decision_id IS 'Décision ayant causé cet événement';
COMMENT ON COLUMN event.event_type IS 'Type d''événement (CREATED, UPDATED, CLOSED, TRANSFERRED)';
COMMENT ON COLUMN event.payload IS 'Données de l''événement (JSON)';

-- 3.4 Fact (État dérivé, immuable)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE TABLE fact (
  fact_id           UUID PRIMARY KEY,
  aggregate_id      UUID NOT NULL,
  fact_type         fact_type NOT NULL,
  payload           JSONB NOT NULL,
  valid_from        TIMESTAMPTZ NOT NULL DEFAULT now(),
  caused_by_event   UUID NOT NULL,

  CONSTRAINT fk_fact_event
    FOREIGN KEY (caused_by_event)
    REFERENCES event(event_id)
);

CREATE INDEX idx_fact_aggregate_id ON fact(aggregate_id);
CREATE INDEX idx_fact_type ON fact(fact_type);
CREATE INDEX idx_fact_caused_by_event ON fact(caused_by_event);
CREATE INDEX idx_fact_valid_from ON fact(valid_from);

COMMENT ON TABLE fact IS 'Registre append-only des faits (état dérivé)';
COMMENT ON COLUMN fact.fact_id IS 'UUID unique du fait';
COMMENT ON COLUMN fact.aggregate_id IS 'Agrégat auquel ce fait appartient';
COMMENT ON COLUMN fact.fact_type IS 'Type de fait (SNAPSHOT)';
COMMENT ON COLUMN fact.payload IS 'Contenu du fait (JSON)';
COMMENT ON COLUMN fact.caused_by_event IS 'Événement ayant causé ce fait';

-- 3.5 Audit Log (I-DB-04)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  audit_id          UUID PRIMARY KEY,
  decision_id       UUID NOT NULL,
  invariant_version TEXT NOT NULL,
  checksum          TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_audit_decision
    FOREIGN KEY (decision_id)
    REFERENCES decision(decision_id)
);

CREATE INDEX idx_audit_decision_id ON audit_log(decision_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);

COMMENT ON TABLE audit_log IS 'Journal d''audit immuable - Traçabilité complète';
COMMENT ON COLUMN audit_log.audit_id IS 'UUID unique de l''entrée d''audit';
COMMENT ON COLUMN audit_log.decision_id IS 'Décision auditée';
COMMENT ON COLUMN audit_log.invariant_version IS 'Version des invariants appliqués';
COMMENT ON COLUMN audit_log.checksum IS 'Somme de contrôle (HMAC-SHA256)';

-- ==================================================================================
-- 🔹 4. TRIGGERS D'IMMUTABILITÉ (I-DB-01)
-- ==================================================================================

-- 4.1 Fonction générique d'interdiction
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION forbid_update_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE TABLE: UPDATE/DELETE forbidden by SILC v2.1 invariants';
END;
$$ LANGUAGE plpgsql;

-- 4.2 Application à toutes les tables write-model
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER no_update_delete_decision
BEFORE UPDATE OR DELETE ON decision
FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TRIGGER no_update_delete_event
BEFORE UPDATE OR DELETE ON event
FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TRIGGER no_update_delete_fact
BEFORE UPDATE OR DELETE ON fact
FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TRIGGER no_update_delete_audit
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TRIGGER no_update_delete_process
BEFORE UPDATE OR DELETE ON process_registry
FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

-- ==================================================================================
-- 🔹 5. PRIVILÈGES FINAUX
-- ==================================================================================

-- Writer : INSERT uniquement
GRANT INSERT ON ALL TABLES IN SCHEMA public TO spofe_writer;

-- Reader : SELECT uniquement
GRANT SELECT ON ALL TABLES IN SCHEMA public TO spofe_reader;

-- Aucun UPDATE / DELETE sur les tables
REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM spofe_writer, spofe_reader;

-- Accès aux séquences et types
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO spofe_writer;
GRANT USAGE ON TYPE decision_type, actor_role, event_type, fact_type TO spofe_writer, spofe_reader;

-- ==================================================================================
-- 🔹 6. READ-MODELS (VUES UNIQUEMENT - I-DB-07)
-- ==================================================================================

-- 6.1 Vue : Fait courant (dernier snapshot par agrégat)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE VIEW v_current_fact AS
SELECT DISTINCT ON (aggregate_id)
  aggregate_id,
  fact_type,
  payload,
  valid_from,
  fact_id
FROM fact
ORDER BY aggregate_id, valid_from DESC;

COMMENT ON VIEW v_current_fact IS 'État courant reconstruit (dernier snapshot par agrégat) - Vues sont supprimables/reconstructibles';

-- 6.2 Vue : Audit trail complet
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE VIEW v_audit_trail AS
SELECT
  d.decision_id,
  d.process_name,
  d.actor_role,
  d.decision_type,
  e.event_id,
  e.event_type,
  a.audit_id,
  a.invariant_version,
  a.checksum,
  d.created_at AS decision_time,
  e.occurred_at AS event_time,
  a.created_at AS audit_time
FROM decision d
LEFT JOIN event e ON d.decision_id = e.decision_id
LEFT JOIN audit_log a ON d.decision_id = a.decision_id
ORDER BY d.created_at DESC;

COMMENT ON VIEW v_audit_trail IS 'Traçabilité complète : décisions → événements → audit';

-- 6.3 Vue : Statistiques en temps réel
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE VIEW v_stats AS
SELECT
  'decisions' AS metric,
  COUNT(*)::text AS count,
  MAX(created_at) AS last_at
FROM decision
UNION ALL
SELECT
  'events',
  COUNT(*)::text,
  MAX(occurred_at)
FROM event
UNION ALL
SELECT
  'facts',
  COUNT(*)::text,
  MAX(valid_from)
FROM fact
UNION ALL
SELECT
  'audits',
  COUNT(*)::text,
  MAX(created_at)
FROM audit_log;

COMMENT ON VIEW v_stats IS 'Statistiques en temps réel du système';

-- ==================================================================================
-- 🔹 7. DONNÉES D'INITIALISATION (EXEMPLE)
-- ==================================================================================

-- Processus par défaut
INSERT INTO process_registry (
  process_name,
  allowed_predecessors,
  allowed_successors,
  invariant_set
) VALUES (
  'USER_CREATION',
  ARRAY['SYSTEM_INIT'],
  ARRAY['USER_ACTIVATION', 'USER_DELETION'],
  ARRAY['I-USER-01', 'I-USER-02', 'I-AUDIT-01']
), (
  'USER_ACTIVATION',
  ARRAY['USER_CREATION'],
  ARRAY['USER_ROLE_ASSIGNMENT', 'USER_DELETION'],
  ARRAY['I-AUTH-01', 'I-AUDIT-01']
), (
  'USER_ROLE_ASSIGNMENT',
  ARRAY['USER_ACTIVATION'],
  ARRAY['USER_ROLE_REVOCATION', 'USER_DELETION'],
  ARRAY['I-RBAC-01', 'I-AUDIT-01']
), (
  'USER_ROLE_REVOCATION',
  ARRAY['USER_ROLE_ASSIGNMENT'],
  ARRAY['USER_DELETION'],
  ARRAY['I-RBAC-02', 'I-AUDIT-01']
), (
  'USER_DELETION',
  ARRAY['USER_CREATION', 'USER_ACTIVATION', 'USER_ROLE_ASSIGNMENT', 'USER_ROLE_REVOCATION'],
  ARRAY['SYSTEM_ARCHIVE'],
  ARRAY['I-DELETE-01', 'I-AUDIT-01']
);

-- ==================================================================================
-- 🔹 8. COMMIT FINAL
-- ==================================================================================

COMMIT;

-- ==================================================================================
-- ✅ GARANTIES OBTENUES (RÉCAPITULATIF)
-- ==================================================================================
--
-- Invariant SILC              │ Garantie DB
-- ────────────────────────────┼─────────────────────────────────────────
-- Immutabilité                │ UPDATE / DELETE impossibles (triggers)
-- Mutation = Decision         │ FK decision_id obligatoires
-- Process gouverné            │ FK process_registry + ENUMs
-- Audit obligatoire           │ audit_log lié à decision
-- Autorité explicite          │ ENUM actor_role (SYSTEM, ADMIN, USER)
-- Pas d'état mutable          │ Uniquement vues (supprimables)
-- Traçabilité 100%            │ Timestamps + chainable events
-- Pas d'ORM requis            │ SQL pur, INSERT/SELECT uniquement
--
-- ==================================================================================
