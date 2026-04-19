"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G07_AppendOnly_1 = require("../../src/domain/guardian/invariants/G07_AppendOnly");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G07_AppendOnly', () => {
    const invariant = new G07_AppendOnly_1.G07_AppendOnly();
    (0, vitest_1.it)('PASS when command is not DELETE', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when commandType is DELETE', () => {
        const ctx = (0, helpers_1.baseContext)({ commandType: 'DELETE' });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G07_DELETE_FORBIDDEN' }));
    });
    (0, vitest_1.it)('PASS when commandType is CREATE', () => {
        const ctx = (0, helpers_1.baseContext)({ commandType: 'CREATE' });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('PASS when commandType is UPDATE', () => {
        const ctx = (0, helpers_1.baseContext)({ commandType: 'UPDATE' });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
});
//# sourceMappingURL=G07_AppendOnly.spec.js.map