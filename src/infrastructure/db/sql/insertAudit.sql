-- ==================================================================================
-- SPOFE SQL Queries — insertAudit.sql
-- Insère une entrée d'audit dans la table audit_log
-- ==================================================================================
-- Utilisé par PostgresDbClient.insertAudit()
-- Appelé EN DERNIER dans la transaction (doit réussir pour valider la transaction)
-- ==================================================================================

INSERT INTO audit_log (
  audit_id,
  decision_id,
  invariant_version,
  checksum,
  created_at
) VALUES (
  $1,  -- audit_id (UUID)
  $2,  -- decision_id (UUID)
  $3,  -- invariant_version (TEXT)
  $4,  -- checksum (TEXT, HMAC-SHA256)
  now()
);

-- ==================================================================================
-- Notes:
-- ─────────────────────────────────────────────────────────────────────────────────
-- • audit_id doit être UUID valide
-- • decision_id doit référencer une décision existante (FK enforced by DB)
-- • invariant_version est la version des invariants appliqués (ex: "2.1.0")
-- • checksum est la signature HMAC-SHA256 générée par Guardian
-- • created_at est défini automatiquement à now() si omis
--
-- Erreurs possibles:
-- • FK violation: decision_id inexistant
-- • Unique violation: audit_id en double
--
-- Relation:
--   audit_log(decision_id) → decision(decision_id)
--   Une décision peut avoir plusieurs audits (re-validation, escalade, etc.)
--
-- Invariant SILC I-DB-04 (Audit obligatoire):
--   Si cet INSERT échoue, toute la transaction est ROLLBACK
--   Aucune donnée partielle ne persiste
--   C'est une barrière de cohérence métier
--
-- Checksum:
--   Signature HMAC-SHA256 générée par Guardian v4
--   Permet la vérification d'intégrité ultérieure
--   Non réversible (hash, pas chiffrement)
-- ==================================================================================
