-- shareholders
-- Finalité : Lister les actionnaires connus et leurs attributs constatés
-- Principes : Lecture seule, tenant-scoped, dérivé des events uniquement

CREATE VIEW shareholders AS
SELECT
  tenant_id,
  shareholder_id,
  name,
  created_at
FROM events_shareholder_registered;

-- ✔️ pas de pourcentage recalculé
-- ✔️ pas de consolidation
