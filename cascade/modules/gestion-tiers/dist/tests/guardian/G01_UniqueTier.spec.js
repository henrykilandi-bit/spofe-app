"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G01_UniqueTier_1 = require("../../src/domain/guardian/invariants/G01_UniqueTier");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G01_UniqueTier', () => {
    const invariant = new G01_UniqueTier_1.G01_UniqueTier();
    (0, vitest_1.it)('PASS when no duplicate legal identifier', () => {
        const ctx = (0, helpers_1.baseContext)({
            currentTier: (0, helpers_1.validTier)({ legalIdentifiers: ['ICE999'] })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when duplicate legal identifier detected', () => {
        const ctx = (0, helpers_1.baseContext)({
            currentTier: (0, helpers_1.validTier)({ legalIdentifiers: ['ICE123'] })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G01_DUPLICATE_LEGAL_ID' }));
    });
    (0, vitest_1.it)('PASS when currentTier is undefined', () => {
        const ctx = (0, helpers_1.baseContext)({ currentTier: undefined });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('PASS when no legalIdentifiers in document', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                id: 'doc-1',
                type: 'TierRecord',
                state: 'validated',
                payload: { name: 'ACME', roles: ['CLIENT'] }
            },
            currentTier: (0, helpers_1.validTier)({ legalIdentifiers: ['ICE123'] })
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
});
//# sourceMappingURL=G01_UniqueTier.spec.js.map