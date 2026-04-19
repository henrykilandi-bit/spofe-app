/**
 * 🧱 Types Guardian - Journal
 * 
 * Types spécifiques au Guardian pour la validation des journaux comptables.
 */

export interface JournalValidation {
  journalCode: string;
  periodId: string;
  operationType: string;
  isAuthorized: boolean;
}

export interface JournalValidationContext {
  authorizedJournals: Record<string, string[]>;
  journalPeriods: Record<string, string>;
}
