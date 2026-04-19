// Read-Models Investisseurs v1.0.0
// Principes : Lecture seule, tenant-scoped, dérivés des events uniquement

// Export des chemins vers les read-models SQL
export const READ_MODELS = {
  SHAREHOLDERS: './shareholders.sql',
  CAPITAL_OPERATIONS: './capital_operations.sql',
  CAP_TABLE_HISTORY: './cap_table_history.sql',
  CAP_TABLE_CURRENT: './cap_table_current.sql',
  GOVERNANCE_ASSEMBLIES: './governance_assemblies.sql',
  GOVERNANCE_DOCUMENTS: './governance_documents.sql',
  INVESTOR_REPORTS: './investor_reports.sql',
  INVESTOR_ACCESS_RIGHTS: './investor_access_rights.sql',
  INVESTOR_ACCESS_LOG: './investor_access_log.sql',
} as const;

// Garanties contractuelles
export const READ_MODEL_GUARANTEES = {
  ZERO_FINANCIAL_CALCULATION: true,
  ZERO_PROJECTION: true,
  ZERO_WRITE: true,
  HUNDRED_PERCENT_TRACEABLE: true,
  HUNDRED_PERCENT_API_COMPATIBLE: true,
  AUDIT_READY: true,
} as const;
