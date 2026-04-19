"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G03_ValidRoles_1 = require("../../src/domain/guardian/invariants/G03_ValidRoles");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G03_ValidRoles', () => {
    const invariant = new G03_ValidRoles_1.G03_ValidRoles();
    (0, vitest_1.it)('PASS with valid role CLIENT', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL with invalid role', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: {
                    name: 'ACME',
                    roles: ['HACKER']
                }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G03_INVALID_ROLE' }));
    });
    (0, vitest_1.it)('PASS with all valid roles', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: {
                    roles: ['CLIENT', 'FOURNISSEUR', 'SALARIE', 'ORGANISME_SOCIAL', 'AUTRE']
                }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('FAIL with no roles', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: { roles: [] }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G03_NO_ROLE' }));
    });
    (0, vitest_1.it)('FAIL when roles is undefined', () => {
        const ctx = (0, helpers_1.baseContext)({
            document: {
                ...(0, helpers_1.baseContext)().document,
                payload: { name: 'ACME' }
            }
        });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G03_NO_ROLE' }));
    });
});
//# sourceMappingURL=G03_ValidRoles.spec.js.map