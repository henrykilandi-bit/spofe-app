/**
 * Immobilisation Guardian - Index
 * Conformité: CONTRACT.md v1.0.0
 */
export { ImmobilisationGuardian, immobilisationGuardian, } from './immobilisation.guardian';
export { INVARIANT_CODES, pass, fail, 
// Asset invariants
validateTenantRequired, validateSameTenant, validateAcquisitionCostPositive, validateUsefulLifePositive, validateResidualValueNonNegative, validateAcquisitionDatePast, validateResidualWithinCost, validateAssetNotDisposed, validateAssetInService, 
// Renewal invariants
validateRenewalDateAfterAcquisition, validateReplacementCostNonNegative, 
// Depreciation invariants
validateDepreciationAmountNonNegative, validateAccumulatedWithinCost, validateNetBookValueFormula, validateNetBookValueAboveResidual, validatePeriodNotAlreadyDepreciated, 
// Allocation invariants
validatePercentageValid, validateAllocationSum100, validateDateRangeValid, validateNoAllocationOverlap, validateAllocationNotOnDisposed, 
// Maintenance invariants
validateMaintenanceCostNonNegative, validateMaintenanceDatePast, validateMaintenanceAssetInService, 
// Disposal invariants
validateDisposalDateAfterAcquisition, validateDisposalAssetInService, validateGainLossFormula, } from './immobilisation.invariants';
//# sourceMappingURL=index.js.map