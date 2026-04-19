"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierSummaryProjection = void 0;
class TierSummaryProjection {
    constructor() {
        this.store = new Map();
    }
    apply(event) {
        const key = `${event.tenantId}:${event.tierId}`;
        const now = event.timestamp;
        if (event.type === 'TierCreated') {
            this.store.set(key, {
                tenantId: event.tenantId,
                tierId: event.tierId,
                status: 'ACTIVE',
                roles: [],
                createdAt: now,
                updatedAt: now
            });
        }
        const current = this.store.get(key);
        if (!current)
            return;
        if (event.type === 'TierUpdated') {
            current.updatedAt = now;
        }
        if (event.type === 'TierSuspended') {
            current.status = 'SUSPENDED';
            current.updatedAt = now;
        }
        if (event.type === 'TierArchived') {
            current.status = 'ARCHIVED';
            current.updatedAt = now;
        }
    }
    getAll() {
        return Array.from(this.store.values());
    }
    getById(tenantId, tierId) {
        return this.store.get(`${tenantId}:${tierId}`);
    }
}
exports.TierSummaryProjection = TierSummaryProjection;
