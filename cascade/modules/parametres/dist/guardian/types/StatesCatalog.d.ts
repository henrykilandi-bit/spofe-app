import { PeriodStatus } from './FiscalContext.js';
/**
 * 🔄 StatesCatalog - États & Statuts Normés
 *
 * Tout état spécialisé doit mapper vers un état générique.
 */
export interface GenericState {
    code: string;
    label?: string;
}
export interface DocumentState {
    code: string;
    mappedGenericState: string;
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
//# sourceMappingURL=StatesCatalog.d.ts.map