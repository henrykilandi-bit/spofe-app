/**
 * 🌐 API - Types
 * 
 * Types pour les endpoints de l'API comptable.
 * DTO = copie stricte du read-model, aucune interprétation.
 */

export interface AccountingEntryDTO {
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

export interface AccountingPeriodDTO {
  periodId: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  entries: AccountingEntryDTO[];
}
