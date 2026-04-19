"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierByRoleProjection = void 0;
class TierByRoleProjection {
    constructor() {
        this.store = [];
    }
    apply(event) {
        if (event.type !== 'TierCreated')
            return;
        // roles will be enriched later (v1.1+)
        // projection kept minimal on purpose
    }
    getAll() {
        return this.store;
    }
}
exports.TierByRoleProjection = TierByRoleProjection;
//# sourceMappingURL=TierByRoleProjection.js.map