"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierAuditProjection = void 0;
class TierAuditProjection {
    constructor() {
        this.store = [];
    }
    apply(event) {
        this.store.push({
            tenantId: event.tenantId,
            tierId: event.tierId,
            eventType: event.type,
            actorId: event.actorId,
            timestamp: event.timestamp,
            summary: event.type
        });
    }
    getByTier(tenantId, tierId) {
        return this.store.filter(e => e.tenantId === tenantId && e.tierId === tierId);
    }
}
exports.TierAuditProjection = TierAuditProjection;
//# sourceMappingURL=TierAuditProjection.js.map