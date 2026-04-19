"use strict";
// tests/system/budget.e2e.spec.ts
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const BudgetGuardian_1 = require("../../src/guardian/BudgetGuardian");
const CreateBudgetHandler_1 = require("../../src/application/handlers/CreateBudgetHandler");
const ValidateBudgetHandler_1 = require("../../src/application/handlers/ValidateBudgetHandler");
const BudgetProjection_1 = require("../../src/read-models/projections/BudgetProjection");
const InMemoryBudgetReadRepository_1 = require("../../src/read-models/repositories/InMemoryBudgetReadRepository");
const BudgetReadController_1 = require("../../src/api/BudgetReadController");
(0, vitest_1.describe)('SYSTEM E2E — budget', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        const guardian = new BudgetGuardian_1.BudgetGuardian();
        const createHandler = new CreateBudgetHandler_1.CreateBudgetHandler(guardian);
        const validateHandler = new ValidateBudgetHandler_1.ValidateBudgetHandler(guardian);
        const projection = new BudgetProjection_1.BudgetProjection();
        // ------------------
        // COMMAND : CREATE
        // ------------------
        const createdEvent = createHandler.handle({
            commandId: 'CMD_CREATE',
            tenantId: 'TENANT_1',
            actorId: 'ACTOR_1',
            budgetId: 'BUDGET_2026',
            budgetType: 'OBJECTIVE',
            periodFrom: '2026-01',
            periodTo: '2026-12',
            hypotheses: [
                {
                    key: 'volume_forecast',
                    description: 'Prévision volumes',
                    value: 1200,
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
        });
        projection.apply(createdEvent);
        // ------------------
        // COMMAND : VALIDATE
        // ------------------
        const validatedEvent = validateHandler.handle({
            commandId: 'CMD_VALIDATE',
            tenantId: 'TENANT_1',
            actorId: 'ACTOR_1',
            budgetId: 'BUDGET_2026',
            currentStatus: 'DRAFT',
        });
        projection.apply(validatedEvent);
        // ------------------
        // PROJECTION DATA
        // ------------------
        const repo = new InMemoryBudgetReadRepository_1.InMemoryBudgetReadRepository(projection.snapshotObjectives(), projection.snapshotCashflows(), projection.snapshotVariances(), projection.snapshotTimelines(), projection.snapshotAlerts());
        controller = new BudgetReadController_1.BudgetReadController(repo);
    });
    (0, vitest_1.it)('GET /budget/objectives — returns budget objectives', async () => {
        const res = await controller.getObjectives({
            tenantId: 'TENANT_1',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.length).toBe(1);
        (0, vitest_1.expect)(res.body[0].budgetId).toBe('BUDGET_2026');
        (0, vitest_1.expect)(res.body[0].targetId).toBe('P1');
        (0, vitest_1.expect)(res.body[0].amount).toBe(50000);
    });
    (0, vitest_1.it)('GET /budget/timeline — exposes projections', async () => {
        const res = await controller.getTimeline({
            tenantId: 'TENANT_1',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.length).toBe(1);
        (0, vitest_1.expect)(res.body[0].projectedAmount).toBe(50000);
    });
    (0, vitest_1.it)('GET /budget/alerts — empty when no alert raised', async () => {
        const res = await controller.getAlerts({
            tenantId: 'TENANT_1',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.length).toBe(0);
    });
    (0, vitest_1.it)('SYSTEM — tenant isolation enforced', async () => {
        const res = await controller.getObjectives({
            tenantId: 'TENANT_X',
        });
        (0, vitest_1.expect)(res.body.length).toBe(0);
    });
    (0, vitest_1.it)('SYSTEM — no forbidden fields exposed', async () => {
        const res = await controller.getObjectives({
            tenantId: 'TENANT_1',
        });
        const forbiddenFields = [
            'unitCost',
            'quantity',
            'accountingEntry',
            'taxImpact',
            'decision',
            'arbitration',
            'margin',
            'price',
        ];
        forbiddenFields.forEach(field => {
            (0, vitest_1.expect)(res.body[0][field]).toBeUndefined();
        });
    });
});
//# sourceMappingURL=budget.e2e.spec.js.map