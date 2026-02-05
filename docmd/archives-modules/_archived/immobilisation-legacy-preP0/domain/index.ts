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
  // Types
  AssetStatus,
  DepreciationMethod,
  MaintenanceType,
  DisposalType,
  AllocationTargetType,
  // Value Objects
  Money,
  UsefulLife,
  Percentage,
  Period,
  AssetId,
  TenantId,
  AllocationTarget,
  DateRange,
  Description,
} from './value-objects';

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATES
// ═══════════════════════════════════════════════════════════════════════════

export { Asset, AssetProps } from './asset.aggregate';

export {
  DepreciationSchedule,
  DepreciationScheduleProps,
  LinearDepreciationCalculator,
} from './depreciation-schedule.aggregate';

export {
  AssetAllocation,
  AssetAllocationProps,
  AllocationValidator,
} from './asset-allocation.aggregate';

export {
  MaintenanceRecord,
  MaintenanceRecordProps,
  MaintenanceAggregator,
} from './maintenance-record.aggregate';

export {
  AssetDisposal,
  AssetDisposalProps,
  DisposalCalculator,
} from './asset-disposal.aggregate';

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Base
  BaseEvent,
  createEventId,
  createBaseEvent,
  // Asset Events
  AssetCreatedEvent,
  AssetRenewalUpdatedEvent,
  AssetDisposedEvent,
  AssetDecommissionedEvent,
  // Depreciation Events
  DepreciationRecordedEvent,
  // Allocation Events
  AllocationCreatedEvent,
  AllocationEndedEvent,
  // Maintenance Events
  MaintenanceRecordedEvent,
  // Union Type
  ImmobilisationEvent,
} from './events';

// ═══════════════════════════════════════════════════════════════════════════
// INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  InvariantCodes,
  InvariantViolation,
  AssetInvariants,
  DepreciationInvariants,
  AllocationInvariants,
  MaintenanceInvariants,
  DisposalInvariants,
  SecurityInvariants,
} from './invariants';
