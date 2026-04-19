"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G08_TenantIsolation = void 0;
const GuardianError_1 = require("../GuardianError");
class G08_TenantIsolation {
    validate(ctx) {
        if (ctx.currentTier &&
            ctx.currentTier.tenantId !== ctx.tenantId) {
            throw new GuardianError_1.GuardianError('G08_CROSS_TENANT', 'Cross-tenant access is forbidden');
        }
    }
}
exports.G08_TenantIsolation = G08_TenantIsolation;
//# sourceMappingURL=G08_TenantIsolation.js.map