-- ==================================================================================
-- SPOFE SQL Queries — insertFact.sql
-- Insère un fait dans la table fact
-- ==================================================================================
-- Utilisé par PostgresDbClient.insertFacts()
-- ==================================================================================

INSERT INTO fact (
  fact_id,
  aggregate_id,
  fact_type,
  payload,
  caused_by_event,
  valid_from
) VALUES (
  $1,  -- fact_id (UUID)
  $2,  -- aggregate_id (UUID)
  $3,  -- fact_type (fact_type ENUM)
  $4,  -- payload (JSONB)
  $5,  -- caused_by_event (UUID)
  now()
);

-- ==================================================================================
-- Notes:
-- ─────────────────────────────────────────────────────────────────────────────────
-- • fact_id doit être UUID valide
-- • aggregate_id est l'agrégat auquel ce fait se rapporte (ex: user_id, order_id)
-- • fact_type doit être une valeur ENUM valide: SNAPSHOT
-- • payload est JSONB (contient l'état dérivé)
-- • caused_by_event doit référencer un événement existant (FK enforced by DB)
-- • valid_from est défini automatiquement à now() si omis
--
-- Erreurs possibles:
-- • FK violation: caused_by_event inexistant
-- • ENUM violation: fact_type invalide
-- • Unique violation: fact_id en double
--
-- Relation:
--   fact(caused_by_event) → event(event_id)
--   Un événement peut causer plusieurs faits
--   Un agrégat peut avoir plusieurs faits (snapshots)
--
-- État dérivé:
--   Les faits représentent l'état actuel d'un agrégat
--   Utilisés par la vue v_current_fact pour reconstruire l'état
-- ==================================================================================
