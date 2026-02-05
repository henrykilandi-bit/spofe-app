/**
 * Immobilisation Module - Aggregate: DepreciationSchedule
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Amortissement historisé, append-only
 */
import { Money } from './value-objects';
import { createBaseEvent } from './events';
import { DepreciationInvariants, SecurityInvariants } from './invariants';
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
export class DepreciationSchedule {
    scheduleId;
    assetId;
    tenantId;
    period;
    depreciationAmount;
    accumulatedDepreciation;
    netBookValue;
    calculatedAt;
    calculatedBy;
    constructor(scheduleId, assetId, tenantId, period, depreciationAmount, accumulatedDepreciation, netBookValue, calculatedAt, calculatedBy) {
        this.scheduleId = scheduleId;
        this.assetId = assetId;
        this.tenantId = tenantId;
        this.period = period;
        this.depreciationAmount = depreciationAmount;
        this.accumulatedDepreciation = accumulatedDepreciation;
        this.netBookValue = netBookValue;
        this.calculatedAt = calculatedAt;
        this.calculatedBy = calculatedBy;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FACTORY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Enregistrer une nouvelle dotation d'amortissement
     * Appelé uniquement par Guardian Immobilisation
     */
    static record(params) {
        // Validation des invariants
        SecurityInvariants.validateTenantIdPresent(params.tenantId);
        DepreciationInvariants.validateDepreciationAmountNonNegative(params.depreciationAmount);
        DepreciationInvariants.validateAccumulatedWithinCost(params.accumulatedDepreciation, params.acquisitionCost);
        DepreciationInvariants.validateNetBookValueFormula(params.netBookValue, params.acquisitionCost, params.accumulatedDepreciation);
        DepreciationInvariants.validateNetBookValueAboveResidual(params.netBookValue, params.residualValue);
        const now = new Date();
        const aggregate = new DepreciationSchedule(params.scheduleId, params.assetId, params.tenantId, params.period, params.depreciationAmount, params.accumulatedDepreciation, params.netBookValue, now, params.actorId);
        const event = {
            ...createBaseEvent(params.tenantId, params.actorId),
            type: 'DepreciationRecorded',
            assetId: params.assetId,
            period: params.period.toString(),
            depreciationAmount: params.depreciationAmount.amount,
            accumulatedDepreciation: params.accumulatedDepreciation.amount,
            netBookValue: params.netBookValue.amount,
            currency: params.depreciationAmount.currency,
        };
        return { aggregate, events: [event] };
    }
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props) {
        return new DepreciationSchedule(props.scheduleId, props.assetId, props.tenantId, props.period, props.depreciationAmount, props.accumulatedDepreciation, props.netBookValue, props.calculatedAt, props.calculatedBy);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    toState() {
        return {
            scheduleId: this.scheduleId,
            assetId: this.assetId,
            tenantId: this.tenantId,
            period: this.period,
            depreciationAmount: this.depreciationAmount,
            accumulatedDepreciation: this.accumulatedDepreciation,
            netBookValue: this.netBookValue,
            calculatedAt: this.calculatedAt,
            calculatedBy: this.calculatedBy,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION CALCULATOR (GUARDIAN USE ONLY)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Calcul linéaire de l'amortissement
 * Utilisé exclusivement par Guardian Immobilisation
 */
export class LinearDepreciationCalculator {
    /**
     * Calculer la dotation mensuelle
     */
    static calculateMonthlyDepreciation(acquisitionCost, residualValue, usefulLifeMonths) {
        const depreciableAmount = acquisitionCost.subtract(residualValue);
        return depreciableAmount.multiply(1 / usefulLifeMonths);
    }
    /**
     * Calculer la dotation pour une période donnée
     * Gère le cas de la dernière période (ne pas descendre sous la valeur résiduelle)
     */
    static calculatePeriodDepreciation(params) {
        const { acquisitionCost, residualValue, usefulLifeMonths, currentAccumulated } = params;
        const monthlyDepreciation = this.calculateMonthlyDepreciation(acquisitionCost, residualValue, usefulLifeMonths);
        const currentNBV = acquisitionCost.subtract(currentAccumulated);
        const minNBV = residualValue;
        // Si la dotation standard ferait descendre la VNC sous la valeur résiduelle,
        // on ajuste pour atteindre exactement la valeur résiduelle
        const maxAllowedDepreciation = currentNBV.subtract(minNBV);
        if (monthlyDepreciation.amount > maxAllowedDepreciation.amount) {
            return Money.nonNegative(Math.max(0, maxAllowedDepreciation.amount), acquisitionCost.currency);
        }
        return monthlyDepreciation;
    }
    /**
     * Calculer la VNC après amortissement
     */
    static calculateNetBookValue(acquisitionCost, accumulatedDepreciation) {
        return acquisitionCost.subtract(accumulatedDepreciation);
    }
}
//# sourceMappingURL=depreciation-schedule.aggregate.js.map