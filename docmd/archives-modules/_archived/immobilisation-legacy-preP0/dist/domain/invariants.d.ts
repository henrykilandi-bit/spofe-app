/**
 * Immobilisation Module - Invariants
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Règles métier non négociables, validées par Guardian
 */
import { Money, UsefulLife, Percentage, DateRange, AssetStatus } from './value-objects';
export declare const InvariantCodes: {
    readonly ASSET_ACQUISITION_COST_POSITIVE: "IMM-ASS-01";
    readonly ASSET_USEFUL_LIFE_POSITIVE: "IMM-ASS-02";
    readonly ASSET_RESIDUAL_VALUE_NON_NEGATIVE: "IMM-ASS-03";
    readonly ASSET_ACQUISITION_DATE_PAST: "IMM-ASS-04";
    readonly ASSET_DISPOSED_IMMUTABLE: "IMM-ASS-05";
    readonly ASSET_NO_DEPRECIATION_IF_NOT_IN_SERVICE: "IMM-ASS-06";
    readonly ASSET_RESIDUAL_VALUE_LESS_THAN_COST: "IMM-ASS-07";
    readonly DEPRECIATION_AMOUNT_NON_NEGATIVE: "IMM-DEP-01";
    readonly DEPRECIATION_ACCUMULATED_WITHIN_COST: "IMM-DEP-02";
    readonly DEPRECIATION_NBV_EQUALS_FORMULA: "IMM-DEP-03";
    readonly DEPRECIATION_NBV_ABOVE_RESIDUAL: "IMM-DEP-04";
    readonly DEPRECIATION_PERIOD_UNIQUE: "IMM-DEP-05";
    readonly ALLOCATION_PERCENTAGE_VALID: "IMM-ALL-01";
    readonly ALLOCATION_SUM_100: "IMM-ALL-02";
    readonly ALLOCATION_DATE_RANGE_VALID: "IMM-ALL-03";
    readonly ALLOCATION_NO_OVERLAP: "IMM-ALL-04";
    readonly ALLOCATION_FORBIDDEN_IF_DISPOSED: "IMM-ALL-05";
    readonly MAINTENANCE_COST_NON_NEGATIVE: "IMM-MNT-01";
    readonly MAINTENANCE_DATE_PAST: "IMM-MNT-02";
    readonly MAINTENANCE_ASSET_IN_SERVICE: "IMM-MNT-03";
    readonly MAINTENANCE_IMMUTABLE: "IMM-MNT-04";
    readonly DISPOSAL_DATE_AFTER_ACQUISITION: "IMM-DIS-01";
    readonly DISPOSAL_ASSET_IN_SERVICE: "IMM-DIS-02";
    readonly DISPOSAL_GAIN_LOSS_FORMULA: "IMM-DIS-03";
    readonly DISPOSAL_FINAL: "IMM-DIS-04";
    readonly TENANT_ID_REQUIRED: "IMM-SEC-01";
    readonly NO_CROSS_TENANT: "IMM-SEC-02";
    readonly AUDIT_TRAIL: "IMM-SEC-03";
};
export declare class InvariantViolation extends Error {
    readonly code: string;
    readonly message: string;
    readonly context?: Record<string, unknown> | undefined;
    constructor(code: string, message: string, context?: Record<string, unknown> | undefined);
}
export declare const AssetInvariants: {
    /**
     * IMM-ASS-01: acquisitionCost > 0
     */
    validateAcquisitionCostPositive(cost: Money): void;
    /**
     * IMM-ASS-02: usefulLife > 0
     */
    validateUsefulLifePositive(usefulLife: UsefulLife): void;
    /**
     * IMM-ASS-03: residualValue >= 0
     */
    validateResidualValueNonNegative(residualValue: Money): void;
    /**
     * IMM-ASS-04: acquisitionDate <= now
     */
    validateAcquisitionDatePast(acquisitionDate: Date): void;
    /**
     * IMM-ASS-05: status = DISPOSED ⇒ asset immutable
     */
    validateNotDisposed(status: AssetStatus): void;
    /**
     * IMM-ASS-06: status ≠ IN_SERVICE ⇒ no depreciation
     */
    validateInServiceForDepreciation(status: AssetStatus): void;
    /**
     * IMM-ASS-07: residualValue <= acquisitionCost
     */
    validateResidualValueWithinCost(residualValue: Money, acquisitionCost: Money): void;
};
export declare const DepreciationInvariants: {
    /**
     * IMM-DEP-01: depreciationAmount >= 0
     */
    validateDepreciationAmountNonNegative(amount: Money): void;
    /**
     * IMM-DEP-02: accumulatedDepreciation <= acquisitionCost
     */
    validateAccumulatedWithinCost(accumulated: Money, acquisitionCost: Money): void;
    /**
     * IMM-DEP-03: netBookValue = acquisitionCost - accumulatedDepreciation
     */
    validateNetBookValueFormula(netBookValue: Money, acquisitionCost: Money, accumulated: Money): void;
    /**
     * IMM-DEP-04: netBookValue >= residualValue
     */
    validateNetBookValueAboveResidual(netBookValue: Money, residualValue: Money): void;
};
export declare const AllocationInvariants: {
    /**
     * IMM-ALL-01: 0 < percentage <= 100
     */
    validatePercentageValid(percentage: Percentage): void;
    /**
     * IMM-ALL-02: Σ percentages = 100% (par période)
     */
    validateAllocationSum100(percentages: Percentage[]): void;
    /**
     * IMM-ALL-03: effectiveFrom <= effectiveTo
     */
    validateDateRangeValid(dateRange: DateRange): void;
    /**
     * IMM-ALL-04: no overlap for same asset + target
     */
    validateNoOverlap(newRange: DateRange, existingRanges: DateRange[]): void;
    /**
     * IMM-ALL-05: allocation forbidden if asset DISPOSED
     */
    validateAssetNotDisposed(status: AssetStatus): void;
};
export declare const MaintenanceInvariants: {
    /**
     * IMM-MNT-01: cost >= 0
     */
    validateCostNonNegative(cost: Money): void;
    /**
     * IMM-MNT-02: date <= now
     */
    validateDatePast(date: Date): void;
    /**
     * IMM-MNT-03: asset.status = IN_SERVICE
     */
    validateAssetInService(status: AssetStatus): void;
};
export declare const DisposalInvariants: {
    /**
     * IMM-DIS-01: disposalDate >= acquisitionDate
     */
    validateDisposalDateAfterAcquisition(disposalDate: Date, acquisitionDate: Date): void;
    /**
     * IMM-DIS-02: asset.status must be IN_SERVICE
     */
    validateAssetInService(status: AssetStatus): void;
    /**
     * IMM-DIS-03: gainOrLoss = disposalValue - netBookValue
     */
    validateGainLossFormula(gainOrLoss: Money, disposalValue: Money, netBookValue: Money): void;
};
export declare const SecurityInvariants: {
    /**
     * IMM-SEC-01: Toute commande porte tenantId
     */
    validateTenantIdPresent(tenantId: string | undefined | null): void;
    /**
     * IMM-SEC-02: Aucune lecture/écriture cross-tenant
     */
    validateSameTenant(expectedTenantId: string, actualTenantId: string): void;
};
//# sourceMappingURL=invariants.d.ts.map