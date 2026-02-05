/**
 * Domain Events - Module Immobilisation v1.0.0
 * 
 * Ces events représentent les faits métier immuables
 * du cycle de vie d'une immobilisation.
 */

// ═══════════════════════════════════════════════════════════════════════════
// BASE EVENT
// ═══════════════════════════════════════════════════════════════════════════

export interface EventMetadata {
  readonly eventId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly actorId: string;
  readonly timestamp: Date;
  readonly version: number;
}

export abstract class DomainEvent {
  abstract readonly eventType: string;
  
  constructor(
    public readonly payload: unknown,
    public readonly metadata: EventMetadata,
  ) {}
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export class AssetCreated extends DomainEvent {
  readonly eventType = 'AssetCreated' as const;
  
  constructor(
    payload: {
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
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

export class AssetRenewalInfoUpdated extends DomainEvent {
  readonly eventType = 'AssetRenewalInfoUpdated' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      renewalDate: Date | null;
      replacementCost: number | null;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export class AssetAllocated extends DomainEvent {
  readonly eventType = 'AssetAllocated' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      allocationId: string;
      targetType: 'PRODUCT' | 'PROJECT' | 'ACTIVITY';
      targetId: string;
      percentage: number;
      effectiveFrom: Date;
      effectiveTo: Date | null;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

export class AllocationEnded extends DomainEvent {
  readonly eventType = 'AllocationEnded' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      allocationId: string;
      endDate: Date;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

export class AssetReallocated extends DomainEvent {
  readonly eventType = 'AssetReallocated' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      allocations: Array<{
        targetType: 'PRODUCT' | 'PROJECT' | 'ACTIVITY';
        targetId: string;
        percentage: number;
      }>;
      effectiveFrom: Date;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export class DepreciationRecorded extends DomainEvent {
  readonly eventType = 'DepreciationRecorded' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      period: string; // YYYY-MM
      depreciationAmount: number;
      accumulatedDepreciation: number;
      netBookValue: number;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

export class DepreciationsCalculated extends DomainEvent {
  readonly eventType = 'DepreciationsCalculated' as const;
  
  constructor(
    payload: {
      tenantId: string;
      period: string;
      assetCount: number;
      totalDepreciationAmount: number;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export class MaintenanceRecorded extends DomainEvent {
  readonly eventType = 'MaintenanceRecorded' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      maintenanceId: string;
      date: Date;
      cost: number;
      description: string;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export class AssetDisposed extends DomainEvent {
  readonly eventType = 'AssetDisposed' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      disposalDate: Date;
      disposalValue: number;
      netBookValue: number;
      gainOrLoss: number;
      resultType: 'GAIN' | 'LOSS' | 'NEUTRAL';
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

export class AssetDecommissioned extends DomainEvent {
  readonly eventType = 'AssetDecommissioned' as const;
  
  constructor(
    payload: {
      tenantId: string;
      assetId: string;
      decommissionDate: Date;
      reason: string;
      finalNetBookValue: number;
    },
    metadata: EventMetadata,
  ) {
    super(payload, metadata);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type ImmobilisationEvent =
  | AssetCreated
  | AssetRenewalInfoUpdated
  | AssetAllocated
  | AllocationEnded
  | AssetReallocated
  | DepreciationRecorded
  | DepreciationsCalculated
  | MaintenanceRecorded
  | AssetDisposed
  | AssetDecommissioned;
