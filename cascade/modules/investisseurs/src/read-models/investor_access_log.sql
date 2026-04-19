-- investor_access_log
-- Finalité : Audit complet des accès investisseurs
-- Principes : Lecture seule, tenant-scoped, conformité légale

CREATE VIEW investor_access_log AS
SELECT
  tenant_id,
  investor_id,
  resource,
  accessed_at
FROM events_investor_document_viewed;

-- ✔️ conformité
-- ✔️ traçabilité légale
