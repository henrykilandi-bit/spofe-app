// tests/system/budget.e2e.spec.ts

import { describe, it, expect, beforeEach } from '@jest/globals';

import { BudgetGuardian } from '../../src/guardian/BudgetGuardian';

import { CreateBudgetHandler } from '../../src/application/handlers/CreateBudgetHandler';
import { ValidateBudgetHandler } from '../../src/application/handlers/ValidateBudgetHandler';

import { BudgetProjection } from '../../src/read-models/projections/BudgetProjection';
import { InMemoryBudgetReadRepository } from '../../src/read-models/repositories/InMemoryBudgetReadRepository';
import { BudgetReadController } from '../../src/api/BudgetReadController';

describe('SYSTEM E2E — budget', () => {
  let controller: BudgetReadController;

  beforeEach(() => {
    const guardian = new BudgetGuardian();

    const createHandler = new CreateBudgetHandler(guardian);
    const validateHandler = new ValidateBudgetHandler(guardian);

    const projection = new BudgetProjection();

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

    projection.apply(createdEvent as any);

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

    projection.apply(validatedEvent as any);

    // ------------------
    // PROJECTION DATA
    // ------------------
    const repo = new InMemoryBudgetReadRepository(
      projection.snapshotObjectives(),
      projection.snapshotCashflows(),
      projection.snapshotVariances(),
      projection.snapshotTimelines(),
      projection.snapshotAlerts()
    );

    controller = new BudgetReadController(repo);
  });

  it('GET /budget/objectives — returns budget objectives', async () => {
    const res = await controller.getObjectives({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].budgetId).toBe('BUDGET_2026');
    expect(res.body[0].targetId).toBe('P1');
    expect(res.body[0].amount).toBe(50000);
  });

  it('GET /budget/timeline — exposes projections', async () => {
    const res = await controller.getTimeline({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].projectedAmount).toBe(50000);
  });

  it('GET /budget/alerts — empty when no alert raised', async () => {
    const res = await controller.getAlerts({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it('SYSTEM — tenant isolation enforced', async () => {
    const res = await controller.getObjectives({
      tenantId: 'TENANT_X',
    });

    expect(res.body.length).toBe(0);
  });

  it('SYSTEM — no forbidden fields exposed', async () => {
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
      expect((res.body[0] as any)[field]).toBeUndefined();
    });
  });

  it('SYSTEM — defense-in-depth filters malformed read rows', async () => {
    const hardenedRepo = new InMemoryBudgetReadRepository(
      [
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_OK',
          targetType: 'PRODUCT',
          targetId: 'P_OK',
          period: '2026-01',
          amount: 1200,
        },
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_BAD_TARGET',
          targetType: 'CATEGORY' as any,
          targetId: 'CAT_1',
          period: '2026-01',
          amount: 1000,
        },
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_BAD_PERIOD',
          targetType: 'PRODUCT',
          targetId: 'P_2',
          period: '2026-13',
          amount: 500,
        },
      ],
      [
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_OK',
          period: '2026-01',
          inflow: 900,
          outflow: 300,
          net: 1, // volontairement incohérent: doit être normalisé à 600
        },
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_BAD_CASHFLOW',
          period: '2026-01',
          inflow: Number.NaN,
          outflow: 100,
          net: 0,
        },
      ],
      [
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_OK',
          period: '2026-01',
          variance: 15,
        },
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_BAD_VARIANCE',
          period: '2026-00',
          variance: 20,
        },
      ],
      [
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_OK',
          period: '2026-01',
          projectedAmount: 1200,
        },
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_BAD_TIMELINE',
          period: 'BAD-PERIOD',
          projectedAmount: 100,
        },
      ],
      [
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_OK',
          period: '2026-01',
          level: 'WARNING',
          message: 'Monitoring alert',
        },
        {
          tenantId: 'TENANT_1',
          budgetId: 'BUDGET_BAD_ALERT',
          period: '2026-01',
          level: 'INVALID' as any,
          message: '',
        },
      ]
    );

    const hardenedController = new BudgetReadController(hardenedRepo);

    const objectives = await hardenedController.getObjectives({
      tenantId: 'TENANT_1',
    });
    expect(objectives.body).toHaveLength(1);
    expect(objectives.body[0].budgetId).toBe('BUDGET_OK');

    const cashflows = await hardenedController.getCashflows({
      tenantId: 'TENANT_1',
    });
    expect(cashflows.body).toHaveLength(1);
    expect(cashflows.body[0].net).toBe(600);

    const variances = await hardenedController.getVariances({
      tenantId: 'TENANT_1',
    });
    expect(variances.body).toHaveLength(1);

    const timeline = await hardenedController.getTimeline({
      tenantId: 'TENANT_1',
    });
    expect(timeline.body).toHaveLength(1);

    const alerts = await hardenedController.getAlerts({
      tenantId: 'TENANT_1',
    });
    expect(alerts.body).toHaveLength(1);
  });
});
