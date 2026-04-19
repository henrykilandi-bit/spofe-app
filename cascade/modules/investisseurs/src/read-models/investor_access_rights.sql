-- investor_access_rights
-- Finalité : Définir qui voit quoi
-- Principes : Lecture seule, tenant-scoped, ACL technique

CREATE VIEW investor_access_rights AS
SELECT
  tenant_id,
  investor_id,
  scope,
  granted_at
FROM events_investor_access_granted;

-- ✔️ lecture contrôlée
-- ✔️ utilisée par API Gateway / ACL
