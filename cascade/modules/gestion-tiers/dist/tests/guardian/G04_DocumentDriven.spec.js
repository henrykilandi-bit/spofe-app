"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G04_DocumentDriven_1 = require("../../src/domain/guardian/invariants/G04_DocumentDriven");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G04_DocumentDriven', () => {
    const invariant = new G04_DocumentDriven_1.G04_DocumentDriven();
    (0, vitest_1.it)('PASS when document exists', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when document missing', () => {
        (0, vitest_1.expect)(() => invariant.validate({ ...(0, helpers_1.baseContext)(), document: undefined })).toThrow(vitest_1.expect.objectContaining({ code: 'G04_NO_DOCUMENT' }));
    });
    (0, vitest_1.it)('PASS when document has all required fields', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                id: 'doc-2',
                type: 'TierUpdate',
                state: 'validated',
                payload: { name: 'Updated Name', roles: ['FOURNISSEUR'] }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
});
//# sourceMappingURL=G04_DocumentDriven.spec.js.map