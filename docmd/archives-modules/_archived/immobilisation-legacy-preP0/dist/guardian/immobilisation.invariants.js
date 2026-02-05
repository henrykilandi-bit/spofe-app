/**
 * Immobilisation Guardian - Invariants & Règles Métier
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Guardian = Autorité unique de validation
 *
 * Ce fichier définit tous les invariants métier du module Immobilisation.
 * Chaque invariant est nommé, stable et testable.
 */
// ═══════════════════════════════════════════════════════════════════════════
// CODES D'INVARIANTS CONTRACTUELS
// ═══════════════════════════════════════════════════════════════════════════
export const INVARIANT_CODES = {
    // Sécurité & Tenant
    IMM_SEC_01: 'IMM-SEC-01', // TenantId requis
    IMM_SEC_02: 'IMM-SEC-02', // Pas de cross-tenant
    // Asset (Création & Modification)
    IMM_ASS_01: 'IMM-ASS-01', // acquisitionCost > 0
    IMM_ASS_02: 'IMM-ASS-02', // usefulLife > 0
    IMM_ASS_03: 'IMM-ASS-03', // residualValue >= 0
    IMM_ASS_04: 'IMM-ASS-04', // acquisitionDate <= now
    IMM_ASS_05: 'IMM-ASS-05', // asset cédé = immutable
    IMM_ASS_06: 'IMM-ASS-06', // pas d'amortissement si pas IN_SERVICE
    IMM_ASS_07: 'IMM-ASS-07', // residualValue <= acquisitionCost
    // Renewal
    IMM_REN_01: 'IMM-REN-01', // renewalDate > acquisitionDate
    IMM_REN_02: 'IMM-REN-02', // replacementCost >= 0
    // Depreciation
    IMM_DEP_01: 'IMM-DEP-01', // dotation >= 0
    IMM_DEP_02: 'IMM-DEP-02', // cumul <= acquisitionCost
    IMM_DEP_03: 'IMM-DEP-03', // VNC = cost - cumul
    IMM_DEP_04: 'IMM-DEP-04', // VNC >= residualValue
    IMM_DEP_05: 'IMM-DEP-05', // période unique
    // Allocation
    IMM_ALL_01: 'IMM-ALL-01', // 0 < percentage <= 100
    IMM_ALL_02: 'IMM-ALL-02', // somme = 100%
    IMM_ALL_03: 'IMM-ALL-03', // effectiveFrom <= effectiveTo
    IMM_ALL_04: 'IMM-ALL-04', // pas de chevauchement
    IMM_ALL_05: 'IMM-ALL-05', // pas d'allocation si cédé
    // Maintenance
    IMM_MNT_01: 'IMM-MNT-01', // cost >= 0
    IMM_MNT_02: 'IMM-MNT-02', // date <= now
    IMM_MNT_03: 'IMM-MNT-03', // asset IN_SERVICE
    // Disposal
    IMM_DIS_01: 'IMM-DIS-01', // disposalDate >= acquisitionDate
    IMM_DIS_02: 'IMM-DIS-02', // asset IN_SERVICE avant disposal
    IMM_DIS_03: 'IMM-DIS-03', // gainOrLoss = disposal - VNC
    IMM_DIS_04: 'IMM-DIS-04', // disposal est final
    // Commandes
    IMM_CMD_01: 'IMM-CMD-01', // Commande inconnue
};
export function pass() {
    return { ok: true };
}
export function fail(code, message, metadata) {
    return { ok: false, violationCode: code, message, metadata };
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS DE SÉCURITÉ
// ═══════════════════════════════════════════════════════════════════════════
export function validateTenantRequired(tenantId) {
    if (!tenantId || tenantId.trim().length === 0) {
        return fail(INVARIANT_CODES.IMM_SEC_01, 'TenantId is required for multi-tenant isolation');
    }
    return pass();
}
export function validateSameTenant(commandTenantId, stateTenantId) {
    if (commandTenantId !== stateTenantId) {
        return fail(INVARIANT_CODES.IMM_SEC_02, `Tenant mismatch: command=${commandTenantId}, state=${stateTenantId}`, { commandTenantId, stateTenantId });
    }
    return pass();
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS DE CRÉATION D'ASSET
// ═══════════════════════════════════════════════════════════════════════════
export function validateAcquisitionCostPositive(amount) {
    if (amount <= 0) {
        return fail(INVARIANT_CODES.IMM_ASS_01, `Acquisition cost must be > 0, got ${amount}`, { amount });
    }
    return pass();
}
export function validateUsefulLifePositive(months) {
    if (!Number.isInteger(months) || months <= 0) {
        return fail(INVARIANT_CODES.IMM_ASS_02, `Useful life must be a positive integer (months), got ${months}`, { months });
    }
    return pass();
}
export function validateResidualValueNonNegative(amount) {
    if (amount < 0) {
        return fail(INVARIANT_CODES.IMM_ASS_03, `Residual value must be >= 0, got ${amount}`, { amount });
    }
    return pass();
}
export function validateAcquisitionDatePast(acquisitionDate, now) {
    if (acquisitionDate > now) {
        return fail(INVARIANT_CODES.IMM_ASS_04, `Acquisition date cannot be in the future`, { acquisitionDate: acquisitionDate.toISOString(), now: now.toISOString() });
    }
    return pass();
}
export function validateResidualWithinCost(residualValue, acquisitionCost) {
    if (residualValue > acquisitionCost) {
        return fail(INVARIANT_CODES.IMM_ASS_07, `Residual value (${residualValue}) cannot exceed acquisition cost (${acquisitionCost})`, { residualValue, acquisitionCost });
    }
    return pass();
}
export function validateAssetNotDisposed(status) {
    if (status === 'DISPOSED' || status === 'DECOMMISSIONED') {
        return fail(INVARIANT_CODES.IMM_ASS_05, `Asset is ${status} and cannot be modified`, { status });
    }
    return pass();
}
export function validateAssetInService(status) {
    if (status !== 'IN_SERVICE') {
        return fail(INVARIANT_CODES.IMM_ASS_06, `Asset must be IN_SERVICE, current status: ${status}`, { status });
    }
    return pass();
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS DE RENOUVELLEMENT
// ═══════════════════════════════════════════════════════════════════════════
export function validateRenewalDateAfterAcquisition(renewalDate, acquisitionDate) {
    if (renewalDate <= acquisitionDate) {
        return fail(INVARIANT_CODES.IMM_REN_01, `Renewal date must be after acquisition date`, {
            renewalDate: renewalDate.toISOString(),
            acquisitionDate: acquisitionDate.toISOString()
        });
    }
    return pass();
}
export function validateReplacementCostNonNegative(amount) {
    if (amount < 0) {
        return fail(INVARIANT_CODES.IMM_REN_02, `Replacement cost must be >= 0, got ${amount}`, { amount });
    }
    return pass();
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS D'AMORTISSEMENT
// ═══════════════════════════════════════════════════════════════════════════
export function validateDepreciationAmountNonNegative(amount) {
    if (amount < 0) {
        return fail(INVARIANT_CODES.IMM_DEP_01, `Depreciation amount must be >= 0, got ${amount}`, { amount });
    }
    return pass();
}
export function validateAccumulatedWithinCost(accumulated, acquisitionCost) {
    if (accumulated > acquisitionCost + 0.01) {
        return fail(INVARIANT_CODES.IMM_DEP_02, `Accumulated depreciation (${accumulated}) cannot exceed acquisition cost (${acquisitionCost})`, { accumulated, acquisitionCost });
    }
    return pass();
}
export function validateNetBookValueFormula(netBookValue, acquisitionCost, accumulated) {
    const expected = acquisitionCost - accumulated;
    if (Math.abs(netBookValue - expected) > 0.01) {
        return fail(INVARIANT_CODES.IMM_DEP_03, `Net book value (${netBookValue}) must equal acquisition cost - accumulated (${expected})`, { netBookValue, acquisitionCost, accumulated, expected });
    }
    return pass();
}
export function validateNetBookValueAboveResidual(netBookValue, residualValue) {
    if (netBookValue < residualValue - 0.01) {
        return fail(INVARIANT_CODES.IMM_DEP_04, `Net book value (${netBookValue}) cannot fall below residual value (${residualValue})`, { netBookValue, residualValue });
    }
    return pass();
}
export function validatePeriodNotAlreadyDepreciated(period, existingPeriods) {
    if (existingPeriods.includes(period)) {
        return fail(INVARIANT_CODES.IMM_DEP_05, `Period ${period} has already been depreciated`, { period, existingPeriods });
    }
    return pass();
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS D'ALLOCATION
// ═══════════════════════════════════════════════════════════════════════════
export function validatePercentageValid(percentage) {
    if (percentage <= 0 || percentage > 100) {
        return fail(INVARIANT_CODES.IMM_ALL_01, `Percentage must be > 0 and <= 100, got ${percentage}`, { percentage });
    }
    return pass();
}
export function validateAllocationSum100(allocations, tolerance = 0.001) {
    const sum = allocations.reduce((acc, a) => acc + a.percentage, 0);
    if (Math.abs(sum - 100) > tolerance) {
        return fail(INVARIANT_CODES.IMM_ALL_02, `Total allocation must equal 100%, got ${sum}%`, { sum, allocations: allocations.map(a => a.percentage) });
    }
    return pass();
}
export function validateDateRangeValid(effectiveFrom, effectiveTo) {
    if (effectiveTo && effectiveFrom > effectiveTo) {
        return fail(INVARIANT_CODES.IMM_ALL_03, `effectiveFrom must be <= effectiveTo`, { effectiveFrom: effectiveFrom.toISOString(), effectiveTo: effectiveTo.toISOString() });
    }
    return pass();
}
export function validateNoAllocationOverlap(newFrom, newTo, existingRanges) {
    const newEnd = newTo ?? new Date('9999-12-31');
    for (const existing of existingRanges) {
        const existingEnd = existing.to ?? new Date('9999-12-31');
        // Overlap if: newFrom <= existingEnd AND existingFrom <= newEnd
        if (newFrom <= existingEnd && existing.from <= newEnd) {
            return fail(INVARIANT_CODES.IMM_ALL_04, `Allocation period overlaps with existing allocation`, {
                newFrom: newFrom.toISOString(),
                newTo: newTo?.toISOString(),
                existingFrom: existing.from.toISOString(),
                existingTo: existing.to?.toISOString()
            });
        }
    }
    return pass();
}
export function validateAllocationNotOnDisposed(status) {
    if (status === 'DISPOSED' || status === 'DECOMMISSIONED') {
        return fail(INVARIANT_CODES.IMM_ALL_05, `Cannot allocate a disposed or decommissioned asset`, { status });
    }
    return pass();
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS DE MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════
export function validateMaintenanceCostNonNegative(cost) {
    if (cost < 0) {
        return fail(INVARIANT_CODES.IMM_MNT_01, `Maintenance cost must be >= 0, got ${cost}`, { cost });
    }
    return pass();
}
export function validateMaintenanceDatePast(date, now) {
    if (date > now) {
        return fail(INVARIANT_CODES.IMM_MNT_02, `Maintenance date cannot be in the future`, { date: date.toISOString(), now: now.toISOString() });
    }
    return pass();
}
export function validateMaintenanceAssetInService(status) {
    if (status !== 'IN_SERVICE') {
        return fail(INVARIANT_CODES.IMM_MNT_03, `Maintenance can only be recorded on assets IN_SERVICE, current status: ${status}`, { status });
    }
    return pass();
}
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS DE CESSION
// ═══════════════════════════════════════════════════════════════════════════
export function validateDisposalDateAfterAcquisition(disposalDate, acquisitionDate) {
    if (disposalDate < acquisitionDate) {
        return fail(INVARIANT_CODES.IMM_DIS_01, `Disposal date must be >= acquisition date`, {
            disposalDate: disposalDate.toISOString(),
            acquisitionDate: acquisitionDate.toISOString()
        });
    }
    return pass();
}
export function validateDisposalAssetInService(status) {
    if (status !== 'IN_SERVICE') {
        return fail(INVARIANT_CODES.IMM_DIS_02, `Only assets IN_SERVICE can be disposed, current status: ${status}`, { status });
    }
    return pass();
}
export function validateGainLossFormula(gainOrLoss, disposalValue, netBookValue) {
    const expected = disposalValue - netBookValue;
    if (Math.abs(gainOrLoss - expected) > 0.01) {
        return fail(INVARIANT_CODES.IMM_DIS_03, `Gain/Loss (${gainOrLoss}) must equal disposal value - NBV (${expected})`, { gainOrLoss, disposalValue, netBookValue, expected });
    }
    return pass();
}
//# sourceMappingURL=immobilisation.invariants.js.map