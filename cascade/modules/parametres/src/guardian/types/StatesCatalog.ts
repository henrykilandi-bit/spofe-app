import { PeriodStatus } from './FiscalContext.js';

/**
 * 🔄 StatesCatalog - États & Statuts Normés
 * 
 * Tout état spécialisé doit mapper vers un état générique.
 */

export type GenericState = 'DRAFT' | 'VALIDATED' | 'CLOSED' | 'LOCKED';

export interface DocumentState {
  code: string;
  mappedGenericState: GenericState;
}

export interface PeriodState {
  code: PeriodStatus;
}

export interface StatesCatalog {
  /** États génériques */
  genericStates: GenericState[];
  
  /** États de documents */
  documentStates: DocumentState[];
  
  /** États de périodes */
  periodStates: PeriodState[];
}
