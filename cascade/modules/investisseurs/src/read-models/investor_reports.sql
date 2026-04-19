-- investor_reports
-- Finalité : Rapports publiés à destination des investisseurs
-- Principes : Lecture seule, tenant-scoped, contenu figé

CREATE VIEW investor_reports AS
SELECT
  tenant_id,
  report_id,
  period,
  published_at
FROM events_investor_report_published;

-- ✔️ contenu figé
-- ✔️ aucune modification possible
