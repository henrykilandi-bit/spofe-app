"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const TierGuardian_1 = require("../../src/domain/guardian/TierGuardian");
const helpers_1 = require("./helpers");
const GuardianError_1 = require("../../src/domain/guardian/GuardianError");
(0, vitest_1.describe)('TierGuardian - Integration Tests', () => {
    const guardian = new TierGuardian_1.TierGuardian();
    (0, vitest_1.describe)('Complete validation flow', () => {
        (0, vitest_1.it)('PASS with completely valid context', () => {
            const ctx = (0, helpers_1.baseContext)();
            (0, vitest_1.expect)(() => guardian.validate(ctx)).not.toThrow();
        });
        (0, vitest_1.it)('FAIL when multiple invariants violated', () => {
            const ctx = (0, helpers_1.baseContext)({
                actorId: undefined, // G09 violation
                commandType: 'DELETE', // G07 violation
                document: (0, helpers_1.validDocument)({ state: 'draft' }) // G05 violation
            });
            (0, vitest_1.expect)(() => guardian.validate(ctx)).toThrow(GuardianError_1.GuardianError);
        });
        (0, vitest_1.it)('PASS for new tier creation', () => {
            const ctx = (0, helpers_1.baseContext)({
                commandType: 'CreateTier',
                currentTier: undefined,
                document: (0, helpers_1.validDocument)({
                    payload: {
                        name: 'New Company',
                        roles: ['CLIENT', 'FOURNISSEUR'],
                        legalIdentifiers: ['SIRET123456']
                    }
                })
            });
            (0, vitest_1.expect)(() => guardian.validate(ctx)).not.toThrow();
        });
        (0, vitest_1.it)('PASS for tier update with different legal IDs', () => {
            const ctx = (0, helpers_1.baseContext)({
                commandType: 'UpdateTier',
                currentTier: (0, helpers_1.validTier)({ legalIdentifiers: ['ICE999'] }),
                document: (0, helpers_1.validDocument)({
                    payload: {
                        name: 'Updated Company',
                        roles: ['FOURNISSEUR'],
                        legalIdentifiers: ['ICE123'] // Different from current tier
                    }
                })
            });
            (0, vitest_1.expect)(() => guardian.validate(ctx)).not.toThrow();
        });
        (0, vitest_1.it)('FAIL for cross-tenant modification attempt', () => {
            const ctx = (0, helpers_1.baseContext)({
                tenantId: 'tenant-A',
                currentTier: (0, helpers_1.validTier)({
                    tenantId: 'tenant-B',
                    legalIdentifiers: ['ICE999'] // Different to avoid G01
                }),
                commandType: 'UpdateTier'
            });
            (0, vitest_1.expect)(() => guardian.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G08_CROSS_TENANT' }));
        });
    });
    (0, vitest_1.describe)('Error handling', () => {
        (0, vitest_1.it)('should throw GuardianError with proper code', () => {
            const ctx = (0, helpers_1.baseContext)({
                document: (0, helpers_1.validDocument)({
                    payload: {
                        name: 'ACME',
                        roles: ['CLIENT'],
                        amount: 100 // Financial field + valid business data
                    }
                })
            });
            try {
                guardian.validate(ctx);
                fail('Expected GuardianError to be thrown');
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(GuardianError_1.GuardianError);
                (0, vitest_1.expect)(error.code).toBe('G10_FINANCIAL_FIELD_DETECTED');
            }
        });
        (0, vitest_1.it)('should stop on first invariant violation (orchestration test)', () => {
            // Context violating multiple invariants in order:
            // G09 (no actor), G05 (document not validated), G03 (no roles)
            const ctx = (0, helpers_1.baseContext)({
                actorId: undefined, // G09 violation - will be checked after G05 and G03
                document: (0, helpers_1.validDocument)({
                    state: 'draft', // G05 violation
                    payload: {} // G02 and G03 violations
                })
            });
            try {
                guardian.validate(ctx);
                fail('Expected GuardianError to be thrown');
            }
            catch (error) {
                (0, vitest_1.expect)(error).toBeInstanceOf(GuardianError_1.GuardianError);
                // Should fail on first invariant that actually triggers (G02)
                (0, vitest_1.expect)(error.code).toBe('G02_MISSING_LEGAL_IDENTITY');
            }
        });
    });
});
//# sourceMappingURL=TierGuardian.spec.js.map