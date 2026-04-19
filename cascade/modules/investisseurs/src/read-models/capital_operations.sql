-- capital_operations
-- Finalité : Historique append-only des opérations sur capital
-- Principes : Lecture seule, tenant-scoped, traçabilité juridique

CREATE VIEW capital_operations AS
SELECT
  tenant_id,
  operation_id,
  operation_type,
  reference,
  occurred_at
FROM events_capital_operation_recorded;

-- ✔️ traçabilité juridique
-- ✔️ aucune interprétation
