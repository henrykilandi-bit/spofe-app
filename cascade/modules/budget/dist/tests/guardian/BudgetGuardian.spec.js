"use strict";
// tests/guardian/BudgetGuardian.spec.ts
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const BudgetGuardian_1 = require("../../src/guardian/BudgetGuardian");
const GuardianError_1 = require("../../src/guardian/GuardianError");
const guardian = new BudgetGuardian_1.BudgetGuardian();
const ctx = {
    tenantId: 'TENANT_1',
    actorId: 'ACTOR_1',
};
const baseCommand = {
    commandId: 'CMD_1',
    commandType: 'CREATE',
    tenantId: 'TENANT_1',
    budgetId: 'BUDGET_2026',
    budgetType: 'OBJECTIVE',
    status: 'DRAFT',
    periodFrom: '2026-01',
    periodTo: '2026-12',
    hypotheses: [
        {
            key: 'volume_forecast',
            description: 'Prévision volumes',
            value: 1000,
            sourceModule: 'COST_STRUCTURE',
        },
    ],
    lines: [
        {
            targetType: 'PRODUCT',
            targetId: 'P1',
            period: '2026-01',
            amount: 50000,
        },
    ],
};
(0, vitest_1.describe)('GUARDIAN — budget', () => {
    // B-01
    (0, vitest_1.it)('B-01 — reject cross-tenant command', () => {
        (0, vitest_1.expect)(() => guardian.validate({ ...ctx, tenantId: 'TENANT_X' }, baseCommand)).toThrow(GuardianError_1.GuardianError);
    });
    // B-02
    (0, vitest_1.it)('B-02 — reject missing actorId', () => {
        (0, vitest_1.expect)(() => guardian.validate({ ...ctx, actorId: '' }, baseCommand)).toThrow(GuardianError_1.GuardianError);
    });
    // B-12
    (0, vitest_1.it)('B-12 — reject invalid period range', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            periodFrom: '2026-12',
            periodTo: '2026-01',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // B-03
    (0, vitest_1.it)('B-03 — reject incomplete budget (no hypotheses)', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            hypotheses: [],
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('B-03 — reject incomplete budget (no lines)', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            lines: [],
        })).toThrow(GuardianError_1.GuardianError);
    });
    // B-04
    (0, vitest_1.it)('B-04 — reject invalid hypothesis', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            hypotheses: [
                {
                    key: '',
                    description: 'invalide',
                    value: 0,
                },
            ],
        })).toThrow(GuardianError_1.GuardianError);
    });
    // B-05
    (0, vitest_1.it)('B-05 — reject append-only violation', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'UPDATE',
            commandId: '',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // B-06
    (0, vitest_1.it)('B-06 — reject invalid status transition (validate)', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'VALIDATE',
            status: 'VALIDATED',
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('B-06 — reject invalid status transition (close)', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'CLOSE',
            status: 'DRAFT',
        })).toThrow(GuardianError_1.GuardianError);
    });
    // B-07
    (0, vitest_1.it)('B-07 — reject non-certified hypothesis source', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            hypotheses: [
                {
                    key: 'x',
                    description: 'bad source',
                    value: 10,
                    sourceModule: 'UNKNOWN',
                },
            ],
        })).toThrow(GuardianError_1.GuardianError);
    });
    // B-08..B-11
    (0, vitest_1.it)('B-08..B-11 — reject forbidden fields (cost, quantity, decision)', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            unitCost: 10,
        })).toThrow(GuardianError_1.GuardianError);
    });
    (0, vitest_1.it)('B-03 — reject negative budget line amount', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            lines: [
                {
                    targetType: 'PRODUCT',
                    targetId: 'P1',
                    period: '2026-01',
                    amount: -100,
                },
            ],
        })).toThrow(GuardianError_1.GuardianError);
    });
    // HAPPY PATHS
    (0, vitest_1.it)('HAPPY PATH — create budget accepted', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, baseCommand)).not.toThrow();
    });
    (0, vitest_1.it)('HAPPY PATH — validate budget accepted', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'VALIDATE',
            status: 'DRAFT',
            commandId: 'CMD_2',
        })).not.toThrow();
    });
    (0, vitest_1.it)('HAPPY PATH — close budget accepted', () => {
        (0, vitest_1.expect)(() => guardian.validate(ctx, {
            ...baseCommand,
            commandType: 'CLOSE',
            status: 'VALIDATED',
            commandId: 'CMD_3',
        })).not.toThrow();
    });
});
//# sourceMappingURL=BudgetGuardian.spec.js.map