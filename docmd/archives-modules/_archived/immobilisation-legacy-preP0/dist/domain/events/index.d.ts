/**
 * Domain Events - Module Immobilisation v1.0.0
 *
 * Ces events représentent les faits métier immuables
 * du cycle de vie d'une immobilisation.
 */
export interface EventMetadata {
    readonly eventId: string;
    readonly correlationId: string;
    readonly causationId?: string;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly version: number;
}
export declare abstract class DomainEvent {
    readonly payload: unknown;
    readonly metadata: EventMetadata;
    abstract readonly eventType: string;
    constructor(payload: unknown, metadata: EventMetadata);
}
export declare class AssetCreated extends DomainEvent {
    readonly eventType: "AssetCreated";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        designation: string;
        description: string | null;
        category: string;
        acquisitionCost: number;
        currency: string;
        acquisitionDate: Date;
        serviceStartDate: Date;
        usefulLifeMonths: number;
        depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE';
        residualValue: number;
        renewalDate: Date | null;
        replacementCost: number | null;
        initialNetBookValue: number;
    }, metadata: EventMetadata);
}
export declare class AssetRenewalInfoUpdated extends DomainEvent {
    readonly eventType: "AssetRenewalInfoUpdated";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        renewalDate: Date | null;
        replacementCost: number | null;
    }, metadata: EventMetadata);
}
export declare class AssetAllocated extends DomainEvent {
    readonly eventType: "AssetAllocated";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        allocationId: string;
        targetType: 'PRODUCT' | 'PROJECT' | 'ACTIVITY';
        targetId: string;
        percentage: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    }, metadata: EventMetadata);
}
export declare class AllocationEnded extends DomainEvent {
    readonly eventType: "AllocationEnded";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        allocationId: string;
        endDate: Date;
    }, metadata: EventMetadata);
}
export declare class AssetReallocated extends DomainEvent {
    readonly eventType: "AssetReallocated";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        allocations: Array<{
            targetType: 'PRODUCT' | 'PROJECT' | 'ACTIVITY';
            targetId: string;
            percentage: number;
        }>;
        effectiveFrom: Date;
    }, metadata: EventMetadata);
}
export declare class DepreciationRecorded extends DomainEvent {
    readonly eventType: "DepreciationRecorded";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        period: string;
        depreciationAmount: number;
        accumulatedDepreciation: number;
        netBookValue: number;
    }, metadata: EventMetadata);
}
export declare class DepreciationsCalculated extends DomainEvent {
    readonly eventType: "DepreciationsCalculated";
    constructor(payload: {
        tenantId: string;
        period: string;
        assetCount: number;
        totalDepreciationAmount: number;
    }, metadata: EventMetadata);
}
export declare class MaintenanceRecorded extends DomainEvent {
    readonly eventType: "MaintenanceRecorded";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        maintenanceId: string;
        date: Date;
        cost: number;
        description: string;
    }, metadata: EventMetadata);
}
export declare class AssetDisposed extends DomainEvent {
    readonly eventType: "AssetDisposed";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        disposalDate: Date;
        disposalValue: number;
        netBookValue: number;
        gainOrLoss: number;
        resultType: 'GAIN' | 'LOSS' | 'NEUTRAL';
    }, metadata: EventMetadata);
}
export declare class AssetDecommissioned extends DomainEvent {
    readonly eventType: "AssetDecommissioned";
    constructor(payload: {
        tenantId: string;
        assetId: string;
        decommissionDate: Date;
        reason: string;
        finalNetBookValue: number;
    }, metadata: EventMetadata);
}
export type ImmobilisationEvent = AssetCreated | AssetRenewalInfoUpdated | AssetAllocated | AllocationEnded | AssetReallocated | DepreciationRecorded | DepreciationsCalculated | MaintenanceRecorded | AssetDisposed | AssetDecommissioned;
//# sourceMappingURL=index.d.ts.map