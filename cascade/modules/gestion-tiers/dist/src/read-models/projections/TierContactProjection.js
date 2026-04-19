"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierContactProjection = void 0;
class TierContactProjection {
    constructor() {
        this.store = new Map();
    }
    apply(event) {
        if (event.type !== 'TierCreated')
            return;
        this.store.set(`${event.tenantId}:${event.tierId}`, {
            tenantId: event.tenantId,
            tierId: event.tierId
        });
    }
    getByTier(tenantId, tierId) {
        return this.store.get(`${tenantId}:${tierId}`);
    }
}
exports.TierContactProjection = TierContactProjection;
//# sourceMappingURL=TierContactProjection.js.map