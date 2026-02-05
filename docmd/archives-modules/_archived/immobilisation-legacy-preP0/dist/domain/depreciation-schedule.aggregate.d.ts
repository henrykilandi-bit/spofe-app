/**
 * Immobilisation Module - Aggregate: DepreciationSchedule
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Amortissement historisé, append-only
 */
import { Money, Period } from './value-objects';
import { ImmobilisationEvent } from './events';
export interface DepreciationScheduleProps {
    scheduleId: string;
    assetId: string;
    tenantId: string;
    period: Period;
    depreciationAmount: Money;
    accumulatedDepreciation: Money;
    netBookValue: Money;
    calculatedAt: Date;
    calculatedBy: string;
}
/**
 * DepreciationSchedule - Aggregate
 *
 * Trace l'amortissement réel et historisé d'une immobilisation.
 * Ce n'est pas un calcul dynamique, mais une suite d'événements validés.
 *
 * Invariants:
 * - IMM-DEP-01: depreciationAmount >= 0
 * - IMM-DEP-02: accumulatedDepreciation <= acquisitionCost
 * - IMM-DEP-03: netBookValue = acquisitionCost - accumulatedDepreciation
 * - IMM-DEP-04: netBookValue >= residualValue
 * - IMM-DEP-05: period unique par asset
 *
 * 📌 Append-only
 * 📌 Calculé uniquement par Guardian Immobilisation
 */
export declare class DepreciationSchedule {
    readonly scheduleId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly period: Period;
    readonly depreciationAmount: Money;
    readonly accumulatedDepreciation: Money;
    readonly netBookValue: Money;
    readonly calculatedAt: Date;
    readonly calculatedBy: string;
    private constructor();
    /**
     * Enregistrer une nouvelle dotation d'amortissement
     * Appelé uniquement par Guardian Immobilisation
     */
    static record(params: {
        scheduleId: string;
        assetId: string;
        tenantId: string;
        period: Period;
        depreciationAmount: Money;
        accumulatedDepreciation: Money;
        netBookValue: Money;
        acquisitionCost: Money;
        residualValue: Money;
        actorId: string;
    }): {
        aggregate: DepreciationSchedule;
        events: ImmobilisationEvent[];
    };
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props: DepreciationScheduleProps): DepreciationSchedule;
    toState(): DepreciationScheduleProps;
}
/**
 * Calcul linéaire de l'amortissement
 * Utilisé exclusivement par Guardian Immobilisation
 */
export declare class LinearDepreciationCalculator {
    /**
     * Calculer la dotation mensuelle
     */
    static calculateMonthlyDepreciation(acquisitionCost: Money, residualValue: Money, usefulLifeMonths: number): Money;
    /**
     * Calculer la dotation pour une période donnée
     * Gère le cas de la dernière période (ne pas descendre sous la valeur résiduelle)
     */
    static calculatePeriodDepreciation(params: {
        acquisitionCost: Money;
        residualValue: Money;
        usefulLifeMonths: number;
        currentAccumulated: Money;
    }): Money;
    /**
     * Calculer la VNC après amortissement
     */
    static calculateNetBookValue(acquisitionCost: Money, accumulatedDepreciation: Money): Money;
}
//# sourceMappingURL=depreciation-schedule.aggregate.d.ts.map