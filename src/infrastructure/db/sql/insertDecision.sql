-- ==================================================================================
-- SPOFE SQL Queries — insertDecision.sql
-- Insère une décision dans la table decision
-- ==================================================================================
-- Utilisé par PostgresDbClient.insertDecision()
-- ==================================================================================

INSERT INTO decision (
  decision_id,
  process_name,
  actor_role,
  decision_type,
  payload,
  created_at
) VALUES (
  $1,  -- decision_id (UUID)
  $2,  -- process_name (TEXT)
  $3,  -- actor_role (actor_role ENUM)
  $4,  -- decision_type (decision_type ENUM)
  $5,  -- payload (JSONB)
  now()
)
ON CONFLICT DO NOTHING;

-- ==================================================================================
-- Notes:
-- ─────────────────────────────────────────────────────────────────────────────────
-- • decision_id doit être UUID valide
-- • process_name doit exister dans process_registry (FK enforced by DB)
-- • actor_role doit être une valeur ENUM valide: SYSTEM | ADMIN | USER
-- • decision_type doit être une valeur ENUM valide: CREATE | UPDATE | CLOSE | TRANSFER
-- • payload est JSONB (peut être vide {})
-- • created_at est défini automatiquement à now() si omis
-- • ON CONFLICT DO NOTHING évite les doublons (idempotent)
--
-- Erreurs possibles:
-- • FK violation: process_name inexistant
-- • ENUM violation: actor_role ou decision_type invalide
-- • Constraint violation: decision_id en double (idempotent via ON CONFLICT)
-- ==================================================================================
