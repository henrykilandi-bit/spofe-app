/**
 * 🧱 Types Guardian - AccountingLine
 * 
 * Types concrets pour les lignes d'écritures comptables.
 */

export interface AccountingLine {
  accountCode: string;
  debit: number;
  credit: number;
  tierId?: string;
  documentRef?: string;
}
