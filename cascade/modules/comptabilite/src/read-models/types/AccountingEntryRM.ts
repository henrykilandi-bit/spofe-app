/**
 * 📊 Read-Models - Types AccountingEntryRM
 * 
 * Types pour les modèles de lecture des écritures comptables.
 * 1 ligne comptable = 1 ligne projetée (simplifie grand livre / balances)
 */

export interface AccountingEntryRM {
  entryId: string;
  periodId: string;
  journalCode: string;
  entryDate: string;

  accountCode: string;
  debit: number;
  credit: number;

  tierId?: string;
  documentRef: string;

  sourceModule: string;
  sourceId: string;

  createdAt: string;
}
