// Module Comptabilité Générale — entrypoint

// Domain types (types métier)
export * from './domain/index.js';

// Guardian (autorité de validation)
export { AccountingGuardian } from './guardian/AccountingGuardian.js';
export { GuardianViolation } from './shared/errors.js';
export { CloseAccountingPeriod } from './application/CloseAccountingPeriod.js';
export type { CloseAccountingPeriodCommand } from './application/CloseAccountingPeriod.js';

// Guardian types (concrets, évitent la confusion avec domain)
export type { AccountingPeriod as GuardianAccountingPeriod } from './guardian/types/AccountingPeriod.js';
export type { AccountingEntry as GuardianAccountingEntry } from './guardian/types/AccountingEntry.js';
export type { AccountingLine as GuardianAccountingLine } from './guardian/types/AccountingLine.js';

// Guardian invariants
export { invariantPeriodIsOpen } from './guardian/invariants/invariantPeriodStatus.js';
export { invariantDoubleEntry } from './guardian/invariants/invariantDoubleEntry.js';
export { invariantTraceability } from './guardian/invariants/invariantTraceability.js';

// Read-models
export * from './read-models/index.js';

// API
export * from './api/index.js';

// Shared utilities
export * from './shared/errors.js';
export * from './shared/identifiers.js';

// Export explicite pour éviter l'ambiguïté AuditTrail
export { AuditLogger } from './shared/audit.js';
export type { AuditEvent, AuditTrail } from './shared/audit.js';
