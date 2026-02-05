/**
 * Immobilisation Module - Invariants
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Règles métier non négociables, validées par Guardian
 */
import { Percentage } from './value-objects';
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANT CODES
// ═══════════════════════════════════════════════════════════════════════════
export const InvariantCodes = {
    // Asset Invariants
    ASSET_ACQUISITION_COST_POSITIVE: 'IMM-ASS-01',
    ASSET_USEFUL_LIFE_POSITIVE: 'IMM-ASS-02',
    ASSET_RESIDUAL_VALUE_NON_NEGATIVE: 'IMM-ASS-03',
    ASSET_ACQUISITION_DATE_PAST: 'IMM-ASS-04',
    ASSET_DISPOSED_IMMUTABLE: 'IMM-ASS-05',
    ASSET_NO_DEPRECIATION_IF_NOT_IN_SERVICE: 'IMM-ASS-06',
    ASSET_RESIDUAL_VALUE_LESS_THAN_COST: 'IMM-ASS-07',
    // Depreciation Invariants
    DEPRECIATION_AMOUNT_NON_NEGATIVE: 'IMM-DEP-01',
    DEPRECIATION_ACCUMULATED_WITHIN_COST: 'IMM-DEP-02',
    DEPRECIATION_NBV_EQUALS_FORMULA: 'IMM-DEP-03',
    DEPRECIATION_NBV_ABOVE_RESIDUAL: 'IMM-DEP-04',
    DEPRECIATION_PERIOD_UNIQUE: 'IMM-DEP-05',
    // Allocation Invariants
    ALLOCATION_PERCENTAGE_VALID: 'IMM-ALL-01',
    ALLOCATION_SUM_100: 'IMM-ALL-02',
    ALLOCATION_DATE_RANGE_VALID: 'IMM-ALL-03',
    ALLOCATION_NO_OVERLAP: 'IMM-ALL-04',
    ALLOCATION_FORBIDDEN_IF_DISPOSED: 'IMM-ALL-05',
    // Maintenance Invariants
    MAINTENANCE_COST_NON_NEGATIVE: 'IMM-MNT-01',
    MAINTENANCE_DATE_PAST: 'IMM-MNT-02',
    MAINTENANCE_ASSET_IN_SERVICE: 'IMM-MNT-03',
    MAINTENANCE_IMMUTABLE: 'IMM-MNT-04',
    // Disposal Invariants
    DISPOSAL_DATE_AFTER_ACQUISITION: 'IMM-DIS-01',
    DISPOSAL_ASSET_IN_SERVICE: 'IMM-DIS-02',
    DISPOSAL_GAIN_LOSS_FORMULA: 'IMM-DIS-03',
    DISPOSAL_FINAL: 'IMM-DIS-04',
    // Security Invariants
    TENANT_ID_REQUIRED: 'IMM-SEC-01',
    NO_CROSS_TENANT: 'IMM-SEC-02',
    AUDIT_TRAIL: 'IMM-SEC-03',
};
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANT VIOLATION
// ═══════════════════════════════════════════════════════════════════════════
export class InvariantViolation extends Error {
    code;
    message;
    context;
    constructor(code, message, context) {
        super(`[${code}] ${message}`);
        this.code = code;
        this.message = message;
        this.context = context;
        this.name = 'InvariantViolation';
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// ASSET INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const AssetInvariants = {
    /**
     * IMM-ASS-01: acquisitionCost > 0
     */
    validateAcquisitionCostPositive(cost) {
        if (cost.amount <= 0) {
            throw new InvariantViolation(InvariantCodes.ASSET_ACQUISITION_COST_POSITIVE, 'Acquisition cost must be strictly positive', { amount: cost.amount });
        }
    },
    /**
     * IMM-ASS-02: usefulLife > 0
     */
    validateUsefulLifePositive(usefulLife) {
        // Already validated in UsefulLife constructor
    },
    /**
     * IMM-ASS-03: residualValue >= 0
     */
    validateResidualValueNonNegative(residualValue) {
        if (residualValue.amount < 0) {
            throw new InvariantViolation(InvariantCodes.ASSET_RESIDUAL_VALUE_NON_NEGATIVE, 'Residual value must be non-negative', { amount: residualValue.amount });
        }
    },
    /**
     * IMM-ASS-04: acquisitionDate <= now
     */
    validateAcquisitionDatePast(acquisitionDate) {
        const now = new Date();
        if (acquisitionDate > now) {
            throw new InvariantViolation(InvariantCodes.ASSET_ACQUISITION_DATE_PAST, 'Acquisition date cannot be in the future', { acquisitionDate: acquisitionDate.toISOString(), now: now.toISOString() });
        }
    },
    /**
     * IMM-ASS-05: status = DISPOSED ⇒ asset immutable
     */
    validateNotDisposed(status) {
        if (status === 'DISPOSED' || status === 'DECOMMISSIONED') {
            throw new InvariantViolation(InvariantCodes.ASSET_DISPOSED_IMMUTABLE, 'Cannot modify a disposed or decommissioned asset', { status });
        }
    },
    /**
     * IMM-ASS-06: status ≠ IN_SERVICE ⇒ no depreciation
     */
    validateInServiceForDepreciation(status) {
        if (status !== 'IN_SERVICE') {
            throw new InvariantViolation(InvariantCodes.ASSET_NO_DEPRECIATION_IF_NOT_IN_SERVICE, 'Depreciation can only be recorded for assets in service', { status });
        }
    },
    /**
     * IMM-ASS-07: residualValue <= acquisitionCost
     */
    validateResidualValueWithinCost(residualValue, acquisitionCost) {
        if (residualValue.isGreaterThan(acquisitionCost)) {
            throw new InvariantViolation(InvariantCodes.ASSET_RESIDUAL_VALUE_LESS_THAN_COST, 'Residual value cannot exceed acquisition cost', { residualValue: residualValue.amount, acquisitionCost: acquisitionCost.amount });
        }
    },
};
// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const DepreciationInvariants = {
    /**
     * IMM-DEP-01: depreciationAmount >= 0
     */
    validateDepreciationAmountNonNegative(amount) {
        if (amount.amount < 0) {
            throw new InvariantViolation(InvariantCodes.DEPRECIATION_AMOUNT_NON_NEGATIVE, 'Depreciation amount must be non-negative', { amount: amount.amount });
        }
    },
    /**
     * IMM-DEP-02: accumulatedDepreciation <= acquisitionCost
     */
    validateAccumulatedWithinCost(accumulated, acquisitionCost) {
        if (accumulated.isGreaterThan(acquisitionCost)) {
            throw new InvariantViolation(InvariantCodes.DEPRECIATION_ACCUMULATED_WITHIN_COST, 'Accumulated depreciation cannot exceed acquisition cost', { accumulated: accumulated.amount, acquisitionCost: acquisitionCost.amount });
        }
    },
    /**
     * IMM-DEP-03: netBookValue = acquisitionCost - accumulatedDepreciation
     */
    validateNetBookValueFormula(netBookValue, acquisitionCost, accumulated) {
        const expected = acquisitionCost.subtract(accumulated);
        if (Math.abs(netBookValue.amount - expected.amount) > 0.01) {
            throw new InvariantViolation(InvariantCodes.DEPRECIATION_NBV_EQUALS_FORMULA, 'Net book value must equal acquisition cost minus accumulated depreciation', {
                netBookValue: netBookValue.amount,
                expected: expected.amount,
                acquisitionCost: acquisitionCost.amount,
                accumulated: accumulated.amount
            });
        }
    },
    /**
     * IMM-DEP-04: netBookValue >= residualValue
     */
    validateNetBookValueAboveResidual(netBookValue, residualValue) {
        if (netBookValue.amount < residualValue.amount - 0.01) {
            throw new InvariantViolation(InvariantCodes.DEPRECIATION_NBV_ABOVE_RESIDUAL, 'Net book value cannot fall below residual value', { netBookValue: netBookValue.amount, residualValue: residualValue.amount });
        }
    },
};
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const AllocationInvariants = {
    /**
     * IMM-ALL-01: 0 < percentage <= 100
     */
    validatePercentageValid(percentage) {
        // Already validated in Percentage constructor
    },
    /**
     * IMM-ALL-02: Σ percentages = 100% (par période)
     */
    validateAllocationSum100(percentages) {
        if (!Percentage.isComplete(percentages)) {
            throw new InvariantViolation(InvariantCodes.ALLOCATION_SUM_100, 'Total allocation percentages must equal 100%', { sum: Percentage.sum(percentages) });
        }
    },
    /**
     * IMM-ALL-03: effectiveFrom <= effectiveTo
     */
    validateDateRangeValid(dateRange) {
        // Already validated in DateRange constructor
    },
    /**
     * IMM-ALL-04: no overlap for same asset + target
     */
    validateNoOverlap(newRange, existingRanges) {
        for (const existing of existingRanges) {
            if (newRange.overlaps(existing)) {
                throw new InvariantViolation(InvariantCodes.ALLOCATION_NO_OVERLAP, 'Allocation periods cannot overlap for the same asset and target', {
                    newFrom: newRange.from.toISOString(),
                    newTo: newRange.to?.toISOString(),
                    existingFrom: existing.from.toISOString(),
                    existingTo: existing.to?.toISOString()
                });
            }
        }
    },
    /**
     * IMM-ALL-05: allocation forbidden if asset DISPOSED
     */
    validateAssetNotDisposed(status) {
        if (status === 'DISPOSED' || status === 'DECOMMISSIONED') {
            throw new InvariantViolation(InvariantCodes.ALLOCATION_FORBIDDEN_IF_DISPOSED, 'Cannot allocate a disposed or decommissioned asset', { status });
        }
    },
};
// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const MaintenanceInvariants = {
    /**
     * IMM-MNT-01: cost >= 0
     */
    validateCostNonNegative(cost) {
        if (cost.amount < 0) {
            throw new InvariantViolation(InvariantCodes.MAINTENANCE_COST_NON_NEGATIVE, 'Maintenance cost must be non-negative', { cost: cost.amount });
        }
    },
    /**
     * IMM-MNT-02: date <= now
     */
    validateDatePast(date) {
        const now = new Date();
        if (date > now) {
            throw new InvariantViolation(InvariantCodes.MAINTENANCE_DATE_PAST, 'Maintenance date cannot be in the future', { date: date.toISOString(), now: now.toISOString() });
        }
    },
    /**
     * IMM-MNT-03: asset.status = IN_SERVICE
     */
    validateAssetInService(status) {
        if (status !== 'IN_SERVICE') {
            throw new InvariantViolation(InvariantCodes.MAINTENANCE_ASSET_IN_SERVICE, 'Maintenance can only be recorded for assets in service', { status });
        }
    },
};
// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const DisposalInvariants = {
    /**
     * IMM-DIS-01: disposalDate >= acquisitionDate
     */
    validateDisposalDateAfterAcquisition(disposalDate, acquisitionDate) {
        if (disposalDate < acquisitionDate) {
            throw new InvariantViolation(InvariantCodes.DISPOSAL_DATE_AFTER_ACQUISITION, 'Disposal date must be on or after acquisition date', {
                disposalDate: disposalDate.toISOString(),
                acquisitionDate: acquisitionDate.toISOString()
            });
        }
    },
    /**
     * IMM-DIS-02: asset.status must be IN_SERVICE
     */
    validateAssetInService(status) {
        if (status !== 'IN_SERVICE') {
            throw new InvariantViolation(InvariantCodes.DISPOSAL_ASSET_IN_SERVICE, 'Only assets in service can be disposed', { status });
        }
    },
    /**
     * IMM-DIS-03: gainOrLoss = disposalValue - netBookValue
     */
    validateGainLossFormula(gainOrLoss, disposalValue, netBookValue) {
        const expected = disposalValue.subtract(netBookValue);
        if (Math.abs(gainOrLoss.amount - expected.amount) > 0.01) {
            throw new InvariantViolation(InvariantCodes.DISPOSAL_GAIN_LOSS_FORMULA, 'Gain/Loss must equal disposal value minus net book value', {
                gainOrLoss: gainOrLoss.amount,
                expected: expected.amount,
                disposalValue: disposalValue.amount,
                netBookValue: netBookValue.amount
            });
        }
    },
};
// ═══════════════════════════════════════════════════════════════════════════
// SECURITY INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const SecurityInvariants = {
    /**
     * IMM-SEC-01: Toute commande porte tenantId
     */
    validateTenantIdPresent(tenantId) {
        if (!tenantId || tenantId.trim().length === 0) {
            throw new InvariantViolation(InvariantCodes.TENANT_ID_REQUIRED, 'Tenant ID is required for all operations', {});
        }
    },
    /**
     * IMM-SEC-02: Aucune lecture/écriture cross-tenant
     */
    validateSameTenant(expectedTenantId, actualTenantId) {
        if (expectedTenantId !== actualTenantId) {
            throw new InvariantViolation(InvariantCodes.NO_CROSS_TENANT, 'Cross-tenant operation is forbidden', { expectedTenantId, actualTenantId });
        }
    },
};
//# sourceMappingURL=invariants.js.map