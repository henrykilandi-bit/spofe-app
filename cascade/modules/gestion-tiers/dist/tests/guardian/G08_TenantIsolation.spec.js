"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G08_TenantIsolation_1 = require("../../src/domain/guardian/invariants/G08_TenantIsolation");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G08_TenantIsolation', () => {
    const invariant = new G08_TenantIsolation_1.G08_TenantIsolation();
    (0, vitest_1.it)('PASS when same tenant', () => {
        const ctx = (0, helpers_1.baseContext)({
            tenantId: 'tenant-1',
            currentTier: (0, helpers_1.validTier)({ tenantId: 'tenant-1' })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when cross-tenant access', () => {
        const ctx = (0, helpers_1.baseContext)({
            tenantId: 'tenant-1',
            currentTier: (0, helpers_1.validTier)({ tenantId: 'tenant-2' })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G08_CROSS_TENANT' }));
    });
    (0, vitest_1.it)('PASS when no currentTier', () => {
        const ctx = (0, helpers_1.baseContext)({
            tenantId: 'tenant-1',
            currentTier: undefined
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
});
//# sourceMappingURL=G08_TenantIsolation.spec.js.map