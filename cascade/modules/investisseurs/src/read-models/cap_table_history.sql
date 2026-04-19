-- cap_table_history
-- Finalité : Vision chronologique de la cap table telle qu'enregistrée
-- Principes : Lecture seule, tenant-scoped, historique append-only

CREATE VIEW cap_table_history AS
SELECT
  tenant_id,
  shareholder_id,
  shares,
  percentage,
  occurred_at
FROM events_shareholder_registered
ORDER BY occurred_at ASC;

-- ⚠️ pas de recalcul de dilution
-- ⚠️ pas de pré / post money
