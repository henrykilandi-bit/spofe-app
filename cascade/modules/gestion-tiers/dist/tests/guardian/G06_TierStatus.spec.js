"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G06_TierStatus_1 = require("../../src/domain/guardian/invariants/G06_TierStatus");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G06_TierStatus', () => {
    const invariant = new G06_TierStatus_1.G06_TierStatus();
    (0, vitest_1.it)('PASS when tier is active', () => {
        const ctx = (0, helpers_1.baseContext)({
            currentTier: (0, helpers_1.validTier)({ status: 'ACTIVE' })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when tier is archived', () => {
        const ctx = (0, helpers_1.baseContext)({
            currentTier: (0, helpers_1.validTier)({ status: 'ARCHIVED' })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G06_TIER_ARCHIVED_IMMUTABLE' }));
    });
    (0, vitest_1.it)('PASS when tier is suspended', () => {
        const ctx = (0, helpers_1.baseContext)({
            currentTier: (0, helpers_1.validTier)({ status: 'SUSPENDED' })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('PASS when no currentTier', () => {
        const ctx = (0, helpers_1.baseContext)({ currentTier: undefined });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
});
//# sourceMappingURL=G06_TierStatus.spec.js.map