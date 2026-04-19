"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G05_DocumentState_1 = require("../../src/domain/guardian/invariants/G05_DocumentState");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G05_DocumentState', () => {
    const invariant = new G05_DocumentState_1.G05_DocumentState();
    (0, vitest_1.it)('PASS when document validated', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when document not validated', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: { ...(0, helpers_1.baseContext)().document, state: 'draft' }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G05_DOCUMENT_NOT_VALIDATED' }));
    });
    (0, vitest_1.it)('FAIL when document state is cancelled', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: { ...(0, helpers_1.baseContext)().document, state: 'cancelled' }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G05_DOCUMENT_NOT_VALIDATED' }));
    });
});
//# sourceMappingURL=G05_DocumentState.spec.js.map