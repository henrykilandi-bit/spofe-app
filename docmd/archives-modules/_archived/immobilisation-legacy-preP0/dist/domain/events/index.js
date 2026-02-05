/**
 * Domain Events - Module Immobilisation v1.0.0
 *
 * Ces events représentent les faits métier immuables
 * du cycle de vie d'une immobilisation.
 */
export class DomainEvent {
    payload;
    metadata;
    constructor(payload, metadata) {
        this.payload = payload;
        this.metadata = metadata;
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// ASSET EVENTS
// ═══════════════════════════════════════════════════════════════════════════
export class AssetCreated extends DomainEvent {
    eventType = 'AssetCreated';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
export class AssetRenewalInfoUpdated extends DomainEvent {
    eventType = 'AssetRenewalInfoUpdated';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════
export class AssetAllocated extends DomainEvent {
    eventType = 'AssetAllocated';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
export class AllocationEnded extends DomainEvent {
    eventType = 'AllocationEnded';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
export class AssetReallocated extends DomainEvent {
    eventType = 'AssetReallocated';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════
export class DepreciationRecorded extends DomainEvent {
    eventType = 'DepreciationRecorded';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
export class DepreciationsCalculated extends DomainEvent {
    eventType = 'DepreciationsCalculated';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE EVENTS
// ═══════════════════════════════════════════════════════════════════════════
export class MaintenanceRecorded extends DomainEvent {
    eventType = 'MaintenanceRecorded';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL EVENTS
// ═══════════════════════════════════════════════════════════════════════════
export class AssetDisposed extends DomainEvent {
    eventType = 'AssetDisposed';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
export class AssetDecommissioned extends DomainEvent {
    eventType = 'AssetDecommissioned';
    constructor(payload, metadata) {
        super(payload, metadata);
    }
}
//# sourceMappingURL=index.js.map