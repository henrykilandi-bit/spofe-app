/**
 * Immobilisation Module - Domain Events SPOFE v2.1
 * Conformité: DomainEvent standard canonique
 * Principe: Événements métier avec metadata complètes
 */

import { v4 as uuid } from 'uuid';
import {
  AssetStatus,
  DepreciationMethod,
  MaintenanceType,
  DisposalType,
  AllocationTargetType,
} from './value-objects';

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN EVENT STANDARD SPOFE
// ═══════════════════════════════════════════════════════════════════════════

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;

  readonly metadata: {
    tenantId: string;
    actorId?: string;
    correlationId?: string;
    causationId?: string;
    version?: number;
  };

  readonly payload: TPayload;
}

export function createDomainEvent<TPayload>(params: {
  eventType: string;
  aggregateId: string;
  tenantId: string;
  actorId?: string;
  correlationId?: string;
  causationId?: string;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: uuid(),
    eventType: params.eventType,
    aggregateId: params.aggregateId,
    occurredAt: new Date(),
    metadata: {
      tenantId: params.tenantId,
      actorId: params.actorId,
      correlationId: params.correlationId,
      causationId: params.causationId,
      version: 1,
    },
    payload: params.payload,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYLOADS TYPÉES
// ═══════════════════════════════════════════════════════════════════════════

export interface AssetCreatedPayload {
  assetId: string;
  designation: string;
  description: string;
  category: string;
  acquisitionCost: number;
  currency: string;
  acquisitionDate: Date;
  serviceStartDate: Date;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  residualValue: number;
  renewalDate?: Date;
  replacementCost?: number;
  initialNetBookValue: number;
  tenantId: string;  // Pour compatibilité repository
}

export interface DepreciationRecordedPayload {
  assetId: string;
  period: string;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  currency: string;
  tenantId: string;
}

export interface AssetDisposedPayload {
  assetId: string;
  disposalType: DisposalType;
  disposalDate: Date;
  proceeds: number;
  currency: string;
  reason: string;
  tenantId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORIES CANONIQUES
// ═══════════════════════════════════════════════════════════════════════════

export const createAssetCreatedEvent = (
  params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: AssetCreatedPayload;
  }
): DomainEvent<AssetCreatedPayload> =>
  createDomainEvent({
    eventType: 'IMMOBILISATION_ASSET_CREATED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
  });

export const createDepreciationRecordedEvent = (
  params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: DepreciationRecordedPayload;
  }
): DomainEvent<DepreciationRecordedPayload> =>
  createDomainEvent({
    eventType: 'IMMOBILISATION_DEPRECIATION_RECORDED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
  });

export const createAssetDisposedEvent = (
  params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: AssetDisposedPayload;
  }
): DomainEvent<AssetDisposedPayload> =>
  createDomainEvent({
    eventType: 'IMMOBILISATION_ASSET_DISPOSED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
  });

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPE ET ALIASES
// ═══════════════════════════════════════════════════════════════════════════

export type ImmobilisationEvent =
  | DomainEvent<AssetCreatedPayload>
  | DomainEvent<DepreciationRecordedPayload>
  | DomainEvent<AssetDisposedPayload>;

// Aliases pour compatibilité
export type AssetCreated = DomainEvent<AssetCreatedPayload>;
export type DepreciationRecorded = DomainEvent<DepreciationRecordedPayload>;
export type AssetDisposed = DomainEvent<AssetDisposedPayload>;
