/**
 * 🔧 Shared - Errors
 * 
 * Types d'erreurs partagés du module comptabilité.
 */

export class AccountingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AccountingError';
  }
}

export class ValidationError extends AccountingError {
  constructor(message: string, public invariantCode?: string) {
    super(message, 'VALIDATION_ERROR', { invariantCode });
    this.name = 'ValidationError';
  }
}

export class PeriodNotFoundError extends AccountingError {
  constructor(periodId: string) {
    super(`Période ${periodId} non trouvée`, 'PERIOD_NOT_FOUND', { periodId });
    this.name = 'PeriodNotFoundError';
  }
}

export class EntryNotFoundError extends AccountingError {
  constructor(entryId: string) {
    super(`Écriture ${entryId} non trouvée`, 'ENTRY_NOT_FOUND', { entryId });
    this.name = 'EntryNotFoundError';
  }
}

export class JournalNotFoundError extends AccountingError {
  constructor(journalCode: string) {
    super(`Journal ${journalCode} non trouvé`, 'JOURNAL_NOT_FOUND', { journalCode });
    this.name = 'JournalNotFoundError';
  }
}

export class InvariantViolationError extends ValidationError {
  constructor(invariantCode: string, message: string) {
    super(`Violation invariant ${invariantCode}: ${message}`, invariantCode);
    this.name = 'InvariantViolationError';
  }
}

/**
 * 🛡️ GuardianViolation - Erreur standard du Guardian
 */
export class GuardianViolation extends Error {
  constructor(code: string, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'GuardianViolation';
  }
}
