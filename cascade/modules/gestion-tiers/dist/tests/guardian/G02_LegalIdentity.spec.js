"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G02_LegalIdentity_1 = require("../../src/domain/guardian/invariants/G02_LegalIdentity");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G02_LegalIdentity', () => {
    const invariant = new G02_LegalIdentity_1.G02_LegalIdentity();
    (0, vitest_1.it)('PASS when name exists', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when name and legalIdentifiers missing', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                id: 'doc',
                type: 'TierRecord',
                state: 'validated',
                payload: {}
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G02_MISSING_LEGAL_IDENTITY' }));
    });
    (0, vitest_1.it)('PASS when only legalIdentifiers exist', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                id: 'doc',
                type: 'TierRecord',
                state: 'validated',
                payload: { legalIdentifiers: ['ICE123'] }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when legalIdentifiers is empty array', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                id: 'doc',
                type: 'TierRecord',
                state: 'validated',
                payload: { legalIdentifiers: [] }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G02_MISSING_LEGAL_IDENTITY' }));
    });
});
//# sourceMappingURL=G02_LegalIdentity.spec.js.map