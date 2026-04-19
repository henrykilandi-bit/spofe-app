"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierByStatusProjection = void 0;
class TierByStatusProjection {
    constructor() {
        this.store = new Map();
    }
    apply(event) {
        const key = `${event.tenantId}:${event.tierId}`;
        if (event.type === 'TierCreated') {
            this.store.set(key, {
                tenantId: event.tenantId,
                tierId: event.tierId,
                status: 'ACTIVE',
                roles: []
            });
        }
        const current = this.store.get(key);
        if (!current)
            return;
        if (event.type === 'TierSuspended')
            current.status = 'SUSPENDED';
        if (event.type === 'TierArchived')
            current.status = 'ARCHIVED';
    }
    getAll() {
        return Array.from(this.store.values());
    }
}
exports.TierByStatusProjection = TierByStatusProjection;
//# sourceMappingURL=TierByStatusProjection.js.map