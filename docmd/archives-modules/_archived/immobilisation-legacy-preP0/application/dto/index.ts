/**
 * Immobilisation Module - DTO Index
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 */

// Commands DTOs
export {
  BaseCommandDTO,
  DepreciationMethodDTO,
  AllocationTargetTypeDTO,
  MaintenanceTypeDTO,
  DisposalTypeDTO,
  CreateAssetCommandDTO,
  UpdateRenewalInfoCommandDTO,
  AllocateAssetCommandDTO,
  AllocationItemDTO,
  RecordDepreciationCommandDTO,
  CalculateDepreciationsCommandDTO,
  RecordMaintenanceCommandDTO,
  DisposeAssetCommandDTO,
  DecommissionAssetCommandDTO,
  ImmobilisationCommandDTO,
} from './command.dto';

// Events DTOs
export {
  BaseEventDTO,
  AssetCreatedEventDTO,
  RenewalInfoUpdatedEventDTO,
  AssetDisposedEventDTO,
  AssetDecommissionedEventDTO,
  AssetAllocatedEventDTO,
  AllocationEndedEventDTO,
  AllocationItemEventDTO,
  DepreciationRecordedEventDTO,
  MaintenanceRecordedEventDTO,
  ImmobilisationEventDTO,
  // Type guards
  isAssetCreatedEvent,
  isRenewalInfoUpdatedEvent,
  isAssetDisposedEvent,
  isAssetDecommissionedEvent,
  isAssetAllocatedEvent,
  isAllocationEndedEvent,
  isDepreciationRecordedEvent,
  isMaintenanceRecordedEvent,
} from './event.dto';

// Mappers
export {
  // ID Generators
  generateAssetId,
  generateAllocationId,
  generateScheduleId,
  generateMaintenanceId,
  generateDisposalId,
  // Command DTO → Domain Command
  toCreateAssetCommand,
  toUpdateRenewalInfoCommand,
  toAllocateAssetCommand,
  toRecordDepreciationCommand,
  toCalculateDepreciationsCommand,
  toRecordMaintenanceCommand,
  toDisposeAssetCommand,
  toDecommissionAssetCommand,
  // Domain Event → Event DTO
  toAssetCreatedEventDTO,
  toRenewalInfoUpdatedEventDTO,
  toAssetDisposedEventDTO,
  toAssetDecommissionedEventDTO,
  toDepreciationRecordedEventDTO,
  toMaintenanceRecordedEventDTO,
} from './mapper';
