-- cap_table_current
-- Finalité : Dernier état connu par actionnaire (snapshot logique)
-- Principes : Lecture seule, tenant-scoped, projection technique

CREATE VIEW cap_table_current AS
SELECT DISTINCT ON (tenant_id, shareholder_id)
  tenant_id,
  shareholder_id,
  shares,
  percentage,
  occurred_at AS last_updated_at
FROM events_shareholder_registered
ORDER BY tenant_id, shareholder_id, occurred_at DESC;

-- ✔️ projection technique
-- ✔️ aucune logique métier
