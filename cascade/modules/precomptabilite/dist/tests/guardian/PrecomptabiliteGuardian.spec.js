"use strict";
// tests/guardian/PrecomptabiliteGuardian.spec.ts
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const PrecomptabiliteGuardian_1 = require("../../src/guardian/PrecomptabiliteGuardian");
const GuardianError_1 = require("../../src/guardian/GuardianError");
const guardian = new PrecomptabiliteGuardian_1.PrecomptabiliteGuardian();
const ctx = {
    tenantId: 'TENANT_1',
    actorId: 'ACTOR_1',
};
const baseCommand = {
    commandId: 'CMD_1',
    commandType: 'CREATE_DOCUMENT',
    tenantId: 'TENANT_1',
    documentId: 'DOC_1',
    documentType: 'SUPPLIER_INVOICE',
};
(0, vitest_1.describe)('GUARDIAN — precomptabilite', () => {
    // P-01
    (0, vitest_1.it)('P-01 — reject cross-tenant command', () => {
        (0, vitest_1.expect)(() => guardian.validate({ ...ctx, tenantId: 'TENANT_X' }, baseCommand)).toThrow(GuardianError_1.GuardianError);
    });
    // P-02
    (0, vitest_1.it)('P-02 — reject missing actorId', () => {
        (0, vitest_1.expect)(() => guardian.validate({ ...ctx, actorId: '' }, baseCommand)).toThrow(GuardianError_1.GuardianError);
    });
    // P-03
    (0, vitest_1.it)('P-03 — reject missing documentId', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            documentId: '',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('P-03 — reject missing documentType on creation', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            documentType: undefined,
        })).toThrow(GuardianError_1.GuardianError);
    });
    // P-04
    (0, vitest_1.it)('P-04 — reject missing commandId (append-only)', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandId: '',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // P-06 workflow
    (0, vitest_1.it)('P-06 — reject submit if not DRAFT', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'SUBMIT_FOR_VALIDATION',
            status: 'VALIDATED',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('P-06 — reject validate if not SUBMITTED', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'VALIDATE_DOCUMENT',
            status: 'DRAFT',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('P-06 — reject reject if not SUBMITTED', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'REJECT_DOCUMENT',
            status: 'DRAFT',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('P-06 — reject suspend if already VALIDATED', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'SUSPEND_DOCUMENT',
            status: 'VALIDATED',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // P-07
    (0, vitest_1.it)('P-07 — reject negative amount', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'UPDATE_METADATA',
            metadata: {
                amount: -100,
            },
        })).toThrow(GuardianError_1.GuardianError);
    });
    // P-08..P-10
    (0, vitest_1.it)('P-08..P-10 — reject forbidden accounting field', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            accountingEntry: '401',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('P-08..P-10 — reject forbidden tax logic', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            taxCalculation: true,
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('P-08..P-10 — reject decision logic', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            decision: 'PAY_NOW',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // P-11
    (0, vitest_1.it)('P-11 — reject missing commandType', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: undefined,
        })).toThrow(GuardianError_1.GuardianError);
    });
    // HAPPY PATHS
    (0, vitest_1.it)('HAPPY PATH — create document accepted', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, baseCommand)).not.toThrow();
    });
    (0, vitest_1.it)('HAPPY PATH — submit document accepted', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'SUBMIT_FOR_VALIDATION',
            status: 'DRAFT',
        })).not.toThrow();
    });
    (0, vitest_1.it)('HAPPY PATH — validate document accepted', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'VALIDATE_DOCUMENT',
            status: 'SUBMITTED',
        })).not.toThrow();
    });
});
//# sourceMappingURL=PrecomptabiliteGuardian.spec.js.map