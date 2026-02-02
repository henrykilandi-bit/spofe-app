-- ==================================================================================
-- SPOFE SQL Queries — insertEvent.sql
-- Insère un événement dans la table event
-- ==================================================================================
-- Utilisé par PostgresDbClient.insertEvents()
-- ==================================================================================

INSERT INTO event (
  event_id,
  decision_id,
  event_type,
  payload,
  occurred_at
) VALUES (
  $1,  -- event_id (UUID)
  $2,  -- decision_id (UUID)
  $3,  -- event_type (event_type ENUM)
  $4,  -- payload (JSONB)
  now()
);

-- ==================================================================================
-- Notes:
-- ─────────────────────────────────────────────────────────────────────────────────
-- • event_id doit être UUID valide
-- • decision_id doit référencer une décision existante (FK enforced by DB)
-- • event_type doit être une valeur ENUM valide: CREATED | UPDATED | CLOSED | TRANSFERRED
-- • payload est JSONB (peut être vide {})
-- • occurred_at est défini automatiquement à now() si omis
--
-- Erreurs possibles:
-- • FK violation: decision_id inexistant
-- • ENUM violation: event_type invalide
-- • Unique violation: event_id en double
--
-- Relation:
--   event(decision_id) → decision(decision_id)
--   Une decision peut avoir plusieurs events
-- ==================================================================================
