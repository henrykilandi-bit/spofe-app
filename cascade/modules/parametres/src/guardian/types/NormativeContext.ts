/**
 * 📊 NormativeContext - Cadres Comptables & Normatifs
 */

export type AccountingFramework = 'PCG' | 'IFRS' | 'OHADA' | 'CUSTOM';

export interface AccountReference {
  /** Code du compte */
  accountCode: string;
  
  /** Libellé */
  label: string;
  
  /** Cadre comptable */
  frameworkCode: AccountingFramework;
  
  /** Statut d'activation */
  active: boolean;
}

export interface JournalType {
  /** Code du journal */
  journalCode: string;
  
  /** Libellé */
  label: string;
  
  /** Type */
  type: string;
  
  /** Statut d'activation */
  active: boolean;
}

export interface NumberingFormat {
  /** Type de document */
  documentType: string;
  
  /** Format de numérotation */
  format: string;
  
  /** Masque */
  mask: string;
}

export interface NormativeContext {
  /** Cadre comptable de référence */
  accountingFramework: AccountingFramework;
  
  /** Comptes autorisés */
  accounts: AccountReference[];
  
  /** Types de journaux */
  journalTypes: JournalType[];
  
  /** Formats de numérotation */
  numberingFormats: NumberingFormat[];
}
