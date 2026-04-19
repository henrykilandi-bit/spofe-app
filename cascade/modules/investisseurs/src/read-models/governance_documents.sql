-- governance_documents
-- Finalité : Documents de gouvernance exposables aux investisseurs
-- Principes : Lecture seule, tenant-scoped, contrôle Guardian

CREATE VIEW governance_documents AS
SELECT
  tenant_id,
  document_id,
  document_type,
  linked_assembly_id,
  created_at
FROM events_governance_document_attached;

-- ✔️ uniquement documents VALIDATED
-- ✔️ contrôle déjà fait par Guardian
