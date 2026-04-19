"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G10_NoFinancialLogic_1 = require("../../src/domain/guardian/invariants/G10_NoFinancialLogic");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G10_NoFinancialLogic', () => {
    const invariant = new G10_NoFinancialLogic_1.G10_NoFinancialLogic();
    (0, vitest_1.it)('PASS when no financial field', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when financial field detected - amount', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: { amount: 100 }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G10_FINANCIAL_FIELD_DETECTED' }));
    });
    (0, vitest_1.it)('FAIL when financial field detected - balance', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: { balance: 500 }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G10_FINANCIAL_FIELD_DETECTED' }));
    });
    (0, vitest_1.it)('FAIL when financial field detected - credit', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: { credit: 1000 }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G10_FINANCIAL_FIELD_DETECTED' }));
    });
    (0, vitest_1.it)('PASS when only business fields present', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: {
                    name: 'ACME Corp',
                    address: '123 Main St',
                    email: 'contact@acme.com',
                    roles: ['CLIENT']
                }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
});
//# sourceMappingURL=G10_NoFinancialLogic.spec.js.map