"use strict";
// tests/guardian/StockGuardian.spec.ts
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const StockGuardian_1 = require("../../src/guardian/StockGuardian");
const GuardianError_1 = require("../../src/guardian/GuardianError");
const guardian = new StockGuardian_1.StockGuardian();
const ctx = {
    tenantId: 'TENANT_1',
    actorId: 'ACTOR_1',
};
const baseFact = {
    movementId: 'MOV_1',
    tenantId: 'TENANT_1',
    productId: 'PROD_1',
    category: 'MARCHANDISES',
    quantity: 10,
    depotId: 'DEPOT_A',
    movementType: 'ENTRY',
    documentId: 'DOC_1',
    documentStatus: 'VALIDATED',
    resultingStock: 100,
};
(0, vitest_1.describe)('GUARDIAN — gestion-stocks', () => {
    // GS-01
    (0, vitest_1.it)('GS-01 — reject cross-tenant movement', () => {
        (0, vitest_1.expect)(() => guardian.validate({ ...ctx, tenantId: 'TENANT_2' }, baseFact)).toThrow(GuardianError_1.GuardianError);
    });
    // GS-02
    (0, vitest_1.it)('GS-02 — reject non-validated document', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            documentStatus: 'DRAFT',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('GS-02 — reject missing documentId', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            documentId: '',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // GS-03
    (0, vitest_1.it)('GS-03 — reject missing actorId', () => {
        (0, vitest_1.expect)(() => guardian.validate({ ...ctx, actorId: '' }, baseFact)).toThrow(GuardianError_1.GuardianError);
    });
    // GS-04
    (0, vitest_1.it)('GS-04 — reject zero quantity', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            quantity: 0,
        })).toThrow(GuardianError_1.GuardianError);
    });
    // GS-05
    (0, vitest_1.it)('GS-05 — reject negative resulting stock', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            resultingStock: -1,
        })).toThrow(GuardianError_1.GuardianError);
    });
    // GS-06
    (0, vitest_1.it)('GS-06 — reject missing productId', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            productId: '',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // GS-07
    (0, vitest_1.it)('GS-07 — reject missing depotId', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            depotId: '',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // GS-08
    (0, vitest_1.it)('GS-08 — reject empty lots array when provided', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            lots: [],
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('GS-08 — accept absence of lots', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, baseFact)).not.toThrow();
    });
    // GS-09
    (0, vitest_1.it)('GS-09 — reject transfer without targetDepotId', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            movementType: 'TRANSFER',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('GS-09 — reject transfer with same source and target depot', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            movementType: 'TRANSFER',
            targetDepotId: 'DEPOT_A',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('GS-09 — accept valid transfer', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            movementType: 'TRANSFER',
            targetDepotId: 'DEPOT_B',
        })).not.toThrow();
    });
    // GS-11 / GS-12
    (0, vitest_1.it)('GS-11/12 — reject financial fields', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseFact,
            unitCost: 10,
        })).toThrow(GuardianError_1.GuardianError);
    });
    // HAPPY PATH
    (0, vitest_1.it)('HAPPY PATH — valid stock entry passes', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, baseFact)).not.toThrow();
    });
});
//# sourceMappingURL=StockGuardian.spec.js.map