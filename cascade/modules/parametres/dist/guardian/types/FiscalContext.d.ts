/**
 * 📅 FiscalContext - Exercices & Périodes
 *
 * Aucun calcul de durée ou de chevauchement automatique.
 */
export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';
export interface FiscalPeriod {
    /** Identifiant unique de la période */
    periodId: string;
    /** Date de début */
    startDate: Date;
    /** Date de fin */
    endDate: Date;
    /** Statut de la période */
    status: PeriodStatus;
}
export type AllowedFrequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export interface FiscalContext {
    /** Années fiscales déclarées */
    fiscalYears: FiscalPeriod[];
    /** Fréquences autorisées */
    allowedFrequencies: AllowedFrequency[];
}
//# sourceMappingURL=FiscalContext.d.ts.map