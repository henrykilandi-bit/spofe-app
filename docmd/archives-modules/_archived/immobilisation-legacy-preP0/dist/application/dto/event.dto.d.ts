/**
 * Immobilisation Module - Event DTOs (Contractuels)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 *
 * Ces DTOs sont les interfaces contractuelles pour les events.
 * Ils utilisent des strings ISO 8601 pour les dates (sérialisation JSON).
 */
import { AllocationTargetTypeDTO, MaintenanceTypeDTO, DepreciationMethodDTO } from './command.dto';
/**
 * Base DTO pour tous les events
 */
export interface BaseEventDTO {
    eventId: string;
    tenantId: string;
    occurredAt: string;
}
/**
 * AssetCreatedEvent DTO
 */
export interface AssetCreatedEventDTO extends BaseEventDTO {
    type: 'AssetCreated';
    assetId: string;
    acquisitionCost: number;
    currency: string;
    acquisitionDate: string;
    usefulLifeMonths: number;
    depreciationMethod: DepreciationMethodDTO;
    residualValue: number;
    renewalDate?: string;
    replacementCost?: number;
    createdBy: string;
}
/**
 * RenewalInfoUpdatedEvent DTO
 */
export interface RenewalInfoUpdatedEventDTO extends BaseEventDTO {
    type: 'RenewalInfoUpdated';
    assetId: string;
    renewalDate: string;
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
    disposalDate: string;
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
    decommissionDate: string;
    reason: string;
    netBookValue: number;
    currency: string;
    decommissionedBy: string;
}
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
    effectiveFrom: string;
    allocatedBy: string;
}
/**
 * AllocationEndedEvent DTO
 */
export interface AllocationEndedEventDTO extends BaseEventDTO {
    type: 'AllocationEnded';
    assetId: string;
    allocationId: string;
    endDate: string;
    reason: string;
    endedBy: string;
}
/**
 * DepreciationRecordedEvent DTO
 */
export interface DepreciationRecordedEventDTO extends BaseEventDTO {
    type: 'DepreciationRecorded';
    assetId: string;
    scheduleId: string;
    period: string;
    depreciationAmount: number;
    accumulatedDepreciation: number;
    netBookValue: number;
    currency: string;
    calculatedBy: string;
}
/**
 * MaintenanceRecordedEvent DTO
 */
export interface MaintenanceRecordedEventDTO extends BaseEventDTO {
    type: 'MaintenanceRecorded';
    maintenanceId: string;
    assetId: string;
    maintenanceType: MaintenanceTypeDTO;
    date: string;
    description: string;
    cost: number;
    currency: string;
    performedBy: string;
    recordedBy: string;
}
export type ImmobilisationEventDTO = AssetCreatedEventDTO | RenewalInfoUpdatedEventDTO | AssetDisposedEventDTO | AssetDecommissionedEventDTO | AssetAllocatedEventDTO | AllocationEndedEventDTO | DepreciationRecordedEventDTO | MaintenanceRecordedEventDTO;
export declare function isAssetCreatedEvent(event: ImmobilisationEventDTO): event is AssetCreatedEventDTO;
export declare function isRenewalInfoUpdatedEvent(event: ImmobilisationEventDTO): event is RenewalInfoUpdatedEventDTO;
export declare function isAssetDisposedEvent(event: ImmobilisationEventDTO): event is AssetDisposedEventDTO;
export declare function isAssetDecommissionedEvent(event: ImmobilisationEventDTO): event is AssetDecommissionedEventDTO;
export declare function isAssetAllocatedEvent(event: ImmobilisationEventDTO): event is AssetAllocatedEventDTO;
export declare function isAllocationEndedEvent(event: ImmobilisationEventDTO): event is AllocationEndedEventDTO;
export declare function isDepreciationRecordedEvent(event: ImmobilisationEventDTO): event is DepreciationRecordedEventDTO;
export declare function isMaintenanceRecordedEvent(event: ImmobilisationEventDTO): event is MaintenanceRecordedEventDTO;
//# sourceMappingURL=event.dto.d.ts.map