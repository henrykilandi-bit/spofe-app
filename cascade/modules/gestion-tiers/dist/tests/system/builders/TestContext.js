"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTestContext = void 0;
const crypto_1 = require("crypto");
const TierTestBuilder_1 = require("./TierTestBuilder");
class SystemTestContext {
    constructor() {
        this.context = {
            tenantId: `tenant-${(0, crypto_1.randomUUID)().substring(0, 8)}`,
            actorId: `actor-${(0, crypto_1.randomUUID)().substring(0, 8)}`
        };
        this.tierBuilder = new TierTestBuilder_1.TierTestBuilder(this.context);
    }
    // Contextes prédéfinis pour différents scénarios
    static forBasicScenario() {
        return new SystemTestContext();
    }
    static forMultiTenantScenario() {
        return new SystemTestContext();
    }
    // Helper pour validation Guardian
    ensureGuardianCompliance() {
        if (!this.context.tenantId || !this.context.actorId) {
            throw new Error('Guardian compliance requires tenantId and actorId');
        }
    }
}
exports.SystemTestContext = SystemTestContext;
//# sourceMappingURL=TestContext.js.map