/**
 * Immobilisation Module - Domain Index
 * Conformité: CONTRACT.md v1.0.0
 *
 * Export centralisé du domaine Immobilisation
 */
export { AssetStatus, DepreciationMethod, MaintenanceType, DisposalType, AllocationTargetType, Money, UsefulLife, Percentage, Period, AssetId, TenantId, AllocationTarget, DateRange, Description, } from './value-objects';
export { Asset, AssetProps } from './asset.aggregate';
export { DepreciationSchedule, DepreciationScheduleProps, LinearDepreciationCalculator, } from './depreciation-schedule.aggregate';
export { AssetAllocation, AssetAllocationProps, AllocationValidator, } from './asset-allocation.aggregate';
export { MaintenanceRecord, MaintenanceRecordProps, MaintenanceAggregator, } from './maintenance-record.aggregate';
export { AssetDisposal, AssetDisposalProps, DisposalCalculator, } from './asset-disposal.aggregate';
export { BaseEvent, createEventId, createBaseEvent, AssetCreatedEvent, AssetRenewalUpdatedEvent, AssetDisposedEvent, AssetDecommissionedEvent, DepreciationRecordedEvent, AllocationCreatedEvent, AllocationEndedEvent, MaintenanceRecordedEvent, ImmobilisationEvent, } from './events';
export { InvariantCodes, InvariantViolation, AssetInvariants, DepreciationInvariants, AllocationInvariants, MaintenanceInvariants, DisposalInvariants, SecurityInvariants, } from './invariants';
//# sourceMappingURL=index.d.ts.map