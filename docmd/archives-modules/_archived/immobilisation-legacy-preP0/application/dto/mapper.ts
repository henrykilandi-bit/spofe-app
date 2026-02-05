/**
 * Immobilisation Module - DTO Mappers
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 * 
 * Convertit entre les DTOs (API layer) et les domain objects (Guardian layer).
 */

import {
  CreateAssetCommandDTO,
  UpdateRenewalInfoCommandDTO,
  AllocateAssetCommandDTO,
  RecordDepreciationCommandDTO,
  CalculateDepreciationsCommandDTO,
  RecordMaintenanceCommandDTO,
  DisposeAssetCommandDTO,
  DecommissionAssetCommandDTO,
} from './command.dto';

import {
  AssetCreatedEventDTO,
  RenewalInfoUpdatedEventDTO,
  AssetDisposedEventDTO,
  AssetDecommissionedEventDTO,
  AssetAllocatedEventDTO,
  AllocationEndedEventDTO,
  DepreciationRecordedEventDTO,
  MaintenanceRecordedEventDTO,
} from './event.dto';

import {
  CreateAssetCommand,
  UpdateRenewalInfoCommand,
  ReallocateAssetCommand,
  RecordDepreciationCommand,
  CalculateDepreciationsCommand,
  RecordMaintenanceCommand,
  DisposeAssetCommand,
  DecommissionAssetCommand,
  createBaseCommand,
} from '../../domain/commands';

import {
  AssetCreatedEvent,
  AssetRenewalUpdatedEvent,
  AssetDisposedEvent,
  AssetDecommissionedEvent,
  DepreciationRecordedEvent,
  MaintenanceRecordedEvent,
} from '../../domain/events';

// ═══════════════════════════════════════════════════════════════════════════
// ID GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

export function generateAssetId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAllocationId(): string {
  return `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateScheduleId(): string {
  return `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMaintenanceId(): string {
  return `mnt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateDisposalId(): string {
  return `disp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND DTO → DOMAIN COMMAND
// ═══════════════════════════════════════════════════════════════════════════

export function toCreateAssetCommand(dto: CreateAssetCommandDTO): CreateAssetCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'CreateAsset',
    assetId: dto.assetId || generateAssetId(),
    acquisitionCost: dto.acquisitionCost,
    currency: dto.currency,
    acquisitionDate: new Date(dto.acquisitionDate),
    usefulLifeMonths: dto.usefulLife,
    residualValue: dto.residualValue,
  };
}

export function toUpdateRenewalInfoCommand(dto: UpdateRenewalInfoCommandDTO): UpdateRenewalInfoCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'UpdateRenewalInfo',
    assetId: dto.assetId,
    renewalDate: new Date(dto.renewalDate),
    replacementCost: dto.replacementCost,
    currency: dto.currency,
  };
}

export function toAllocateAssetCommand(dto: AllocateAssetCommandDTO): ReallocateAssetCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'ReallocateAsset',
    assetId: dto.assetId,
    effectiveDate: new Date(dto.effectiveFrom),
    allocations: dto.allocations.map(a => ({
      allocationId: a.allocationId || generateAllocationId(),
      targetType: a.targetType,
      targetId: a.targetId,
      percentage: a.percentage,
    })),
  };
}

export function toRecordDepreciationCommand(dto: RecordDepreciationCommandDTO): RecordDepreciationCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'RecordDepreciation',
    scheduleId: dto.scheduleId || generateScheduleId(),
    assetId: dto.assetId,
    period: dto.period,
  };
}

export function toCalculateDepreciationsCommand(dto: CalculateDepreciationsCommandDTO): CalculateDepreciationsCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'CalculateDepreciations',
    period: dto.period,
    assetIds: dto.assetIds,
  };
}

export function toRecordMaintenanceCommand(dto: RecordMaintenanceCommandDTO): RecordMaintenanceCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'RecordMaintenance',
    maintenanceId: dto.maintenanceId || generateMaintenanceId(),
    assetId: dto.assetId,
    maintenanceType: dto.type,
    date: new Date(dto.date),
    description: dto.description,
    cost: dto.cost,
    currency: dto.currency,
    performedBy: dto.performedBy,
  };
}

export function toDisposeAssetCommand(dto: DisposeAssetCommandDTO): DisposeAssetCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'DisposeAsset',
    disposalId: dto.disposalId || generateDisposalId(),
    assetId: dto.assetId,
    disposalDate: new Date(dto.disposalDate),
    disposalValue: dto.disposalValue,
    currency: dto.currency,
  };
}

export function toDecommissionAssetCommand(dto: DecommissionAssetCommandDTO): DecommissionAssetCommand {
  const base = createBaseCommand(dto.tenantId, dto.actorId);
  return {
    ...base,
    type: 'DecommissionAsset',
    disposalId: dto.disposalId || generateDisposalId(),
    assetId: dto.assetId,
    decommissionDate: new Date(dto.decommissionDate),
    reason: dto.reason,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN EVENT → EVENT DTO
// ═══════════════════════════════════════════════════════════════════════════

export function toAssetCreatedEventDTO(event: AssetCreatedEvent): AssetCreatedEventDTO {
  return {
    eventId: event.eventId,
    type: 'AssetCreated',
    tenantId: event.tenantId,
    occurredAt: event.occurredAt.toISOString(),
    assetId: event.assetId,
    acquisitionCost: event.acquisitionCost,
    currency: event.currency,
    acquisitionDate: event.acquisitionDate.toISOString(),
    usefulLifeMonths: event.usefulLifeMonths,
    depreciationMethod: event.depreciationMethod,
    residualValue: event.residualValue,
    createdBy: event.actorId,
  };
}

export function toRenewalInfoUpdatedEventDTO(event: AssetRenewalUpdatedEvent): RenewalInfoUpdatedEventDTO {
  return {
    eventId: event.eventId,
    type: 'RenewalInfoUpdated',
    tenantId: event.tenantId,
    occurredAt: event.occurredAt.toISOString(),
    assetId: event.assetId,
    renewalDate: event.renewalDate?.toISOString() || '',
    replacementCost: event.replacementCost,
    currency: event.currency,
    updatedBy: event.actorId,
  };
}

export function toAssetDisposedEventDTO(event: AssetDisposedEvent): AssetDisposedEventDTO {
  return {
    eventId: event.eventId,
    type: 'AssetDisposed',
    tenantId: event.tenantId,
    occurredAt: event.occurredAt.toISOString(),
    assetId: event.assetId,
    disposalDate: event.disposalDate.toISOString(),
    disposalType: 'SALE',
    disposalValue: event.disposalValue,
    currency: event.currency,
    netBookValue: event.netBookValue,
    gainOrLoss: event.gainOrLoss,
    disposedBy: event.actorId,
  };
}

export function toAssetDecommissionedEventDTO(event: AssetDecommissionedEvent): AssetDecommissionedEventDTO {
  return {
    eventId: event.eventId,
    type: 'AssetDecommissioned',
    tenantId: event.tenantId,
    occurredAt: event.occurredAt.toISOString(),
    assetId: event.assetId,
    decommissionDate: event.decommissionDate.toISOString(),
    reason: event.reason,
    netBookValue: event.netBookValue,
    currency: event.currency,
    decommissionedBy: event.actorId,
  };
}

export function toDepreciationRecordedEventDTO(event: DepreciationRecordedEvent): DepreciationRecordedEventDTO {
  return {
    eventId: event.eventId,
    type: 'DepreciationRecorded',
    tenantId: event.tenantId,
    occurredAt: event.occurredAt.toISOString(),
    assetId: event.assetId,
    scheduleId: event.eventId, // Use eventId as scheduleId for now
    period: event.period,
    depreciationAmount: event.depreciationAmount,
    accumulatedDepreciation: event.accumulatedDepreciation,
    netBookValue: event.netBookValue,
    currency: event.currency,
    calculatedBy: event.actorId,
  };
}

export function toMaintenanceRecordedEventDTO(event: MaintenanceRecordedEvent): MaintenanceRecordedEventDTO {
  return {
    eventId: event.eventId,
    type: 'MaintenanceRecorded',
    tenantId: event.tenantId,
    occurredAt: event.occurredAt.toISOString(),
    maintenanceId: event.maintenanceId,
    assetId: event.assetId,
    maintenanceType: event.maintenanceType,
    date: event.date.toISOString(),
    description: event.description,
    cost: event.cost,
    currency: event.currency,
    performedBy: event.performedBy,
    recordedBy: event.actorId,
  };
}
