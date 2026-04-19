/**
 * 🧱 Types Guardian - AccountingEntry
 * 
 * Types concrets pour les écritures comptables.
 */

import { AccountingLine } from './AccountingLine';

export interface AccountingEntry {
  entryId: string;
  journalCode: string;
  periodId: string;
  entryDate: string;

  lines: AccountingLine[];

  source: {
    module: string;
    sourceId: string;
  };

  documentRef: string;

  createdAt: string;
  createdBy: string;
}
