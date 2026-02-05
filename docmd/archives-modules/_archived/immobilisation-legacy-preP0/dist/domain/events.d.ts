/**
 * Immobilisation Module - Domain Events SPOFE v2.1
 * Conformité: DomainEvent standard canonique
 * Principe: Événements métier avec metadata complètes
 */
import { DepreciationMethod, DisposalType } from './value-objects';
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
export declare function createDomainEvent<TPayload>(params: {
    eventType: string;
    aggregateId: string;
    tenantId: string;
    actorId?: string;
    correlationId?: string;
    causationId?: string;
    payload: TPayload;
}): DomainEvent<TPayload>;
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
    tenantId: string;
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
export declare const createAssetCreatedEvent: (params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: AssetCreatedPayload;
}) => DomainEvent<AssetCreatedPayload>;
export declare const createDepreciationRecordedEvent: (params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: DepreciationRecordedPayload;
}) => DomainEvent<DepreciationRecordedPayload>;
export declare const createAssetDisposedEvent: (params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: AssetDisposedPayload;
}) => DomainEvent<AssetDisposedPayload>;
export type ImmobilisationEvent = DomainEvent<AssetCreatedPayload> | DomainEvent<DepreciationRecordedPayload> | DomainEvent<AssetDisposedPayload>;
export type AssetCreated = DomainEvent<AssetCreatedPayload>;
export type DepreciationRecorded = DomainEvent<DepreciationRecordedPayload>;
export type AssetDisposed = DomainEvent<AssetDisposedPayload>;
//# sourceMappingURL=events.d.ts.map