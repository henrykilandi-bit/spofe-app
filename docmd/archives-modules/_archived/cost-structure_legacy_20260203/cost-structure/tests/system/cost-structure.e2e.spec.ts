// tests/system/cost-structure.e2e.spec.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { CostStructureGuardian } from '../../src/guardian/CostStructureGuardian';
import { BuildCostStructureHandler } from '../../src/application/handlers/BuildCostStructureHandler';
import { CostStructureProjection } from '../../src/read-models/projections/CostStructureProjection';
import { InMemoryCostStructureReadRepository } from '../../src/read-models/repositories/InMemoryCostStructureReadRepository';
import { CostStructureReadController } from '../../src/api/CostStructureReadController';

describe('SYSTEM E2E — cost-structure', () => {
  let controller: CostStructureReadController;

  beforeEach(() => {
    const guardian = new CostStructureGuardian();
    const handler = new BuildCostStructureHandler(guardian);
    const projection = new CostStructureProjection();

    // --- COMMAND ---
    const events = handler.handle({
      commandId: 'CMD_1',
      tenantId: 'TENANT_1',
      actorId: 'ACTOR_1',
      level: 'N1',
      period: '2026-01',
      sources: [
        {
          sourceType: 'STOCK',
          sourceId: 'S1',
          quantity: 10,
          unitCost: 50, // analytique, pas prix de vente
        },
        {
          sourceType: 'AMORTIZATION',
          sourceId: 'A1',
          amount: 500,
        },
      ],
      allocations: [
        { targetType: 'PRODUCT', targetId: 'P1', ratio: 1 },
      ],
    });

    // --- PROJECTION ---
    events.forEach(e => projection.apply(e as any));

    // --- REPOSITORY ---
    const repo = new InMemoryCostStructureReadRepository(
      projection.snapshotByProduct(),
      projection.snapshotByActivity(),
      projection.snapshotByPeriod(),
      projection.snapshotBreakdown(),
      projection.snapshotScenarios()
    );

    controller = new CostStructureReadController(repo);
  });

  it('GET /costs/by-product — returns cost per product', async () => {
    const res = await controller.getCostsByProduct({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].productId).toBe('P1');
    expect(res.body[0].amount).toBe(1000); // (10×50)+500
  });

  it('GET /costs/by-period — aggregates total cost', async () => {
    const res = await controller.getCostsByPeriod({
      tenantId: 'TENANT_1',
    });

    expect(res.body.length).toBe(1);
    expect(res.body[0].totalAmount).toBe(1000);
  });

  it('GET /costs/scenarios — exposes analytical scenarios', async () => {
    const res = await controller.getCostScenarios({
      tenantId: 'TENANT_1',
    });

    const s70 = res.body.find(s => s.scenario === 'S70');
    const s100 = res.body.find(s => s.scenario === 'S100');
    const s130 = res.body.find(s => s.scenario === 'S130');

    expect(s70?.amount).toBe(700);
    expect(s100?.amount).toBe(1000);
    expect(s130?.amount).toBe(1300);
  });

  it('SYSTEM — tenant isolation enforced', async () => {
    const res = await controller.getCostsByProduct({
      tenantId: 'TENANT_X',
    });

    expect(res.body.length).toBe(0);
  });

  it('SYSTEM — no forbidden fields exposed', async () => {
    const res = await controller.getCostsByProduct({
      tenantId: 'TENANT_1',
    });

    const forbidden = [
      'price',
      'salePrice',
      'margin',
      'taxImpact',
      'decision',
      'recommendation',
      'accountingEntry',
    ];

    forbidden.forEach(field => {
      expect((res.body[0] as any)[field]).toBeUndefined();
    });
  });
});
