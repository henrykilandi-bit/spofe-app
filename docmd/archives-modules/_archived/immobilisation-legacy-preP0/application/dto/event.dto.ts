/**
 * Immobilisation Module - Event DTOs (Contractuels)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 * 
 * Ces DTOs sont les interfaces contractuelles pour les events.
 * Ils utilisent des strings ISO 8601 pour les dates (sérialisation JSON).
 */

import { AllocationTargetTypeDTO, MaintenanceTypeDTO, DepreciationMethodDTO } from './command.dto';

// ═══════════════════════════════════════════════════════════════════════════
// BASE EVENT DTO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base DTO pour tous les events
 */
export interface BaseEventDTO {
  eventId: string;
  tenantId: string;
  occurredAt: string;               // ISO 8601
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET EVENT DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AssetCreatedEvent DTO
 */
export interface AssetCreatedEventDTO extends BaseEventDTO {
  type: 'AssetCreated';

  assetId: string;

  acquisitionCost: number;
  currency: string;
  acquisitionDate: string;          // ISO 8601
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethodDTO;
  residualValue: number;

  renewalDate?: string;             // ISO 8601
  replacementCost?: number;

  createdBy: string;
}

/**
 * RenewalInfoUpdatedEvent DTO
 */
export interface RenewalInfoUpdatedEventDTO extends BaseEventDTO {
  type: 'RenewalInfoUpdated';

  assetId: string;

  renewalDate: string;              // ISO 8601
  replacementCost?: number;
  currency?: string;

  updatedBy: string;
}

/**
 * AssetDisposedEvent DTO
 */
export interface AssetDisposedEventDTO extends BaseEventDTO {
  type: 'AssetDisposed';

  assetId: string;

  disposalDate: string;             // ISO 8601
  disposalType: 'SALE';
  disposalValue: number;
  currency: string;

  netBookValue: number;
  gainOrLoss: number;

  disposedBy: string;
}

/**
 * AssetDecommissionedEvent DTO
 */
export interface AssetDecommissionedEventDTO extends BaseEventDTO {
  type: 'AssetDecommissioned';

  assetId: string;

  decommissionDate: string;         // ISO 8601
  reason: string;

  netBookValue: number;
  currency: string;

  decommissionedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION EVENT DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Allocation item dans un event
 */
export interface AllocationItemEventDTO {
  allocationId: string;
  targetType: AllocationTargetTypeDTO;
  targetId: string;
  percentage: number;
}

/**
 * AssetAllocatedEvent DTO
 */
export interface AssetAllocatedEventDTO extends BaseEventDTO {
  type: 'AssetAllocated';

  assetId: string;

  allocations: AllocationItemEventDTO[];

  effectiveFrom: string;            // ISO 8601

  allocatedBy: string;
}

/**
 * AllocationEndedEvent DTO
 */
export interface AllocationEndedEventDTO extends BaseEventDTO {
  type: 'AllocationEnded';

  assetId: string;
  allocationId: string;

  endDate: string;                  // ISO 8601
  reason: string;

  endedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION EVENT DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DepreciationRecordedEvent DTO
 */
export interface DepreciationRecordedEventDTO extends BaseEventDTO {
  type: 'DepreciationRecorded';

  assetId: string;
  scheduleId: string;

  period: string;                   // YYYY-MM
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  currency: string;

  calculatedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE EVENT DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MaintenanceRecordedEvent DTO
 */
export interface MaintenanceRecordedEventDTO extends BaseEventDTO {
  type: 'MaintenanceRecorded';

  maintenanceId: string;
  assetId: string;

  maintenanceType: MaintenanceTypeDTO;
  date: string;                     // ISO 8601
  description: string;
  cost: number;
  currency: string;
  performedBy: string;

  recordedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type ImmobilisationEventDTO =
  | AssetCreatedEventDTO
  | RenewalInfoUpdatedEventDTO
  | AssetDisposedEventDTO
  | AssetDecommissionedEventDTO
  | AssetAllocatedEventDTO
  | AllocationEndedEventDTO
  | DepreciationRecordedEventDTO
  | MaintenanceRecordedEventDTO;

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

export function isAssetCreatedEvent(event: ImmobilisationEventDTO): event is AssetCreatedEventDTO {
  return event.type === 'AssetCreated';
}

export function isRenewalInfoUpdatedEvent(event: ImmobilisationEventDTO): event is RenewalInfoUpdatedEventDTO {
  return event.type === 'RenewalInfoUpdated';
}

export function isAssetDisposedEvent(event: ImmobilisationEventDTO): event is AssetDisposedEventDTO {
  return event.type === 'AssetDisposed';
}

export function isAssetDecommissionedEvent(event: ImmobilisationEventDTO): event is AssetDecommissionedEventDTO {
  return event.type === 'AssetDecommissioned';
}

export function isAssetAllocatedEvent(event: ImmobilisationEventDTO): event is AssetAllocatedEventDTO {
  return event.type === 'AssetAllocated';
}

export function isAllocationEndedEvent(event: ImmobilisationEventDTO): event is AllocationEndedEventDTO {
  return event.type === 'AllocationEnded';
}

export function isDepreciationRecordedEvent(event: ImmobilisationEventDTO): event is DepreciationRecordedEventDTO {
  return event.type === 'DepreciationRecorded';
}

export function isMaintenanceRecordedEvent(event: ImmobilisationEventDTO): event is MaintenanceRecordedEventDTO {
  return event.type === 'MaintenanceRecorded';
}
