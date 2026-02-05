/**
 * Immobilisation Module - Domain Index
 * Conformité: CONTRACT.md v1.0.0
 *
 * Export centralisé du domaine Immobilisation
 */
// ═══════════════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════════════
export { 
// Value Objects
Money, UsefulLife, Percentage, Period, AssetId, TenantId, AllocationTarget, DateRange, Description, } from './value-objects';
// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATES
// ═══════════════════════════════════════════════════════════════════════════
export { Asset } from './asset.aggregate';
export { DepreciationSchedule, LinearDepreciationCalculator, } from './depreciation-schedule.aggregate';
export { AssetAllocation, AllocationValidator, } from './asset-allocation.aggregate';
export { MaintenanceRecord, MaintenanceAggregator, } from './maintenance-record.aggregate';
export { AssetDisposal, DisposalCalculator, } from './asset-disposal.aggregate';
// ═══════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════
export { 
// Base
BaseEvent, createEventId, createBaseEvent, 
// Asset Events
AssetCreatedEvent, AssetRenewalUpdatedEvent, AssetDisposedEvent, AssetDecommissionedEvent, 
// Depreciation Events
DepreciationRecordedEvent, 
// Allocation Events
AllocationCreatedEvent, AllocationEndedEvent, 
// Maintenance Events
MaintenanceRecordedEvent, } from './events';
// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export { InvariantCodes, InvariantViolation, AssetInvariants, DepreciationInvariants, AllocationInvariants, MaintenanceInvariants, DisposalInvariants, SecurityInvariants, } from './invariants';
//# sourceMappingURL=index.js.map