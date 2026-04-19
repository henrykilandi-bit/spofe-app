-- governance_assemblies
-- Finalité : Liste des assemblées et décisions officielles
-- Principes : Lecture seule, tenant-scoped, gouvernance documentaire

CREATE VIEW governance_assemblies AS
SELECT
  tenant_id,
  assembly_id,
  assembly_type,
  assembly_date,
  created_at
FROM events_governance_assembly_created;
