/**
 * Immobilisation Guardian - Invariants & Règles Métier
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Guardian = Autorité unique de validation
 *
 * Ce fichier définit tous les invariants métier du module Immobilisation.
 * Chaque invariant est nommé, stable et testable.
 */
import { AssetStatus } from '../domain/value-objects';
export declare const INVARIANT_CODES: {
    readonly IMM_SEC_01: "IMM-SEC-01";
    readonly IMM_SEC_02: "IMM-SEC-02";
    readonly IMM_ASS_01: "IMM-ASS-01";
    readonly IMM_ASS_02: "IMM-ASS-02";
    readonly IMM_ASS_03: "IMM-ASS-03";
    readonly IMM_ASS_04: "IMM-ASS-04";
    readonly IMM_ASS_05: "IMM-ASS-05";
    readonly IMM_ASS_06: "IMM-ASS-06";
    readonly IMM_ASS_07: "IMM-ASS-07";
    readonly IMM_REN_01: "IMM-REN-01";
    readonly IMM_REN_02: "IMM-REN-02";
    readonly IMM_DEP_01: "IMM-DEP-01";
    readonly IMM_DEP_02: "IMM-DEP-02";
    readonly IMM_DEP_03: "IMM-DEP-03";
    readonly IMM_DEP_04: "IMM-DEP-04";
    readonly IMM_DEP_05: "IMM-DEP-05";
    readonly IMM_ALL_01: "IMM-ALL-01";
    readonly IMM_ALL_02: "IMM-ALL-02";
    readonly IMM_ALL_03: "IMM-ALL-03";
    readonly IMM_ALL_04: "IMM-ALL-04";
    readonly IMM_ALL_05: "IMM-ALL-05";
    readonly IMM_MNT_01: "IMM-MNT-01";
    readonly IMM_MNT_02: "IMM-MNT-02";
    readonly IMM_MNT_03: "IMM-MNT-03";
    readonly IMM_DIS_01: "IMM-DIS-01";
    readonly IMM_DIS_02: "IMM-DIS-02";
    readonly IMM_DIS_03: "IMM-DIS-03";
    readonly IMM_DIS_04: "IMM-DIS-04";
    readonly IMM_CMD_01: "IMM-CMD-01";
};
export type InvariantCode = (typeof INVARIANT_CODES)[keyof typeof INVARIANT_CODES];
export interface GuardianVerdict {
    ok: boolean;
    violationCode?: InvariantCode;
    message?: string;
    metadata?: Record<string, unknown>;
}
export declare function pass(): GuardianVerdict;
export declare function fail(code: InvariantCode, message: string, metadata?: Record<string, unknown>): GuardianVerdict;
export declare function validateTenantRequired(tenantId: string | undefined | null): GuardianVerdict;
export declare function validateSameTenant(commandTenantId: string, stateTenantId: string): GuardianVerdict;
export declare function validateAcquisitionCostPositive(amount: number): GuardianVerdict;
export declare function validateUsefulLifePositive(months: number): GuardianVerdict;
export declare function validateResidualValueNonNegative(amount: number): GuardianVerdict;
export declare function validateAcquisitionDatePast(acquisitionDate: Date, now: Date): GuardianVerdict;
export declare function validateResidualWithinCost(residualValue: number, acquisitionCost: number): GuardianVerdict;
export declare function validateAssetNotDisposed(status: AssetStatus): GuardianVerdict;
export declare function validateAssetInService(status: AssetStatus): GuardianVerdict;
export declare function validateRenewalDateAfterAcquisition(renewalDate: Date, acquisitionDate: Date): GuardianVerdict;
export declare function validateReplacementCostNonNegative(amount: number): GuardianVerdict;
export declare function validateDepreciationAmountNonNegative(amount: number): GuardianVerdict;
export declare function validateAccumulatedWithinCost(accumulated: number, acquisitionCost: number): GuardianVerdict;
export declare function validateNetBookValueFormula(netBookValue: number, acquisitionCost: number, accumulated: number): GuardianVerdict;
export declare function validateNetBookValueAboveResidual(netBookValue: number, residualValue: number): GuardianVerdict;
export declare function validatePeriodNotAlreadyDepreciated(period: string, existingPeriods: string[]): GuardianVerdict;
export declare function validatePercentageValid(percentage: number): GuardianVerdict;
export declare function validateAllocationSum100(allocations: Array<{
    percentage: number;
}>, tolerance?: number): GuardianVerdict;
export declare function validateDateRangeValid(effectiveFrom: Date, effectiveTo: Date | undefined): GuardianVerdict;
export declare function validateNoAllocationOverlap(newFrom: Date, newTo: Date | undefined, existingRanges: Array<{
    from: Date;
    to?: Date;
}>): GuardianVerdict;
export declare function validateAllocationNotOnDisposed(status: AssetStatus): GuardianVerdict;
export declare function validateMaintenanceCostNonNegative(cost: number): GuardianVerdict;
export declare function validateMaintenanceDatePast(date: Date, now: Date): GuardianVerdict;
export declare function validateMaintenanceAssetInService(status: AssetStatus): GuardianVerdict;
export declare function validateDisposalDateAfterAcquisition(disposalDate: Date, acquisitionDate: Date): GuardianVerdict;
export declare function validateDisposalAssetInService(status: AssetStatus): GuardianVerdict;
export declare function validateGainLossFormula(gainOrLoss: number, disposalValue: number, netBookValue: number): GuardianVerdict;
//# sourceMappingURL=immobilisation.invariants.d.ts.map