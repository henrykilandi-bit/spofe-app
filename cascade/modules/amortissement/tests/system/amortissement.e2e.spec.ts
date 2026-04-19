// tests/system/amortissement.e2e.spec.ts

import { describe, it, expect, beforeEach } from '@jest/globals';
import { AmortizationProjection } from '../../src/read-models/projections/AmortizationProjection';
import { InMemoryAmortizationReadRepository } from '../../src/read-models/repositories/InMemoryAmortizationReadRepository';
import { AmortizationReadController } from '../../src/api/AmortizationReadController';

describe('SYSTEM E2E — amortissement', () => {
  let controller: AmortizationReadController;

  beforeEach(() => {
    const projection = new AmortizationProjection();

    // --- EVENTS ---
    projection.apply({
      type: 'AmortizationPlanCreated',
      payload: {
        tenantId: 'TENANT_1',
        assetId: 'ASSET_1',
        method: 'LINEAR',
        usefulLifeMonths: 60,
        residualValue: 0,
        startDate: '2026-01-01',
        occurredAt: '2026-01-01T00:00:00Z',
      },
    });

    projection.apply({
      type: 'AmortizationAccrued',
      payload: {
        tenantId: 'TENANT_1',
        assetId: 'ASSET_1',
        period: '2026-01',
        dotation: 200,
        occurredAt: '2026-01-31T23:59:59Z',
      },
    });

    projection.apply({
      type: 'AmortizationAccrued',
      payload: {
        tenantId: 'TENANT_1',
        assetId: 'ASSET_1',
        period: '2026-02',
        dotation: 200,
        occurredAt: '2026-02-28T23:59:59Z',
      },
    });

    projection.apply({
      type: 'AmortizationPlanCreated',
      payload: {
        tenantId: 'TENANT_2',
        assetId: 'ASSET_X',
        method: 'LINEAR',
        usefulLifeMonths: 36,
        residualValue: 0,
        startDate: '2026-01-01',
        occurredAt: '2026-01-01T00:00:00Z',
      },
    });

    // --- SNAPSHOTS ---
    const acquisitionValues = {
      'TENANT_1::ASSET_1': 12000,
      'TENANT_2::ASSET_X': 9000,
    };

    const repo = new InMemoryAmortizationReadRepository(
      projection.snapshotPlans(),
      projection.snapshotSchedules(),
      projection.snapshotAccumulated(),
      projection.snapshotNetValues(acquisitionValues),
      projection.snapshotHistory()
    );

    controller = new AmortizationReadController(repo);
  });

  it('GET /amortization/plans — returns tenant plans only', async () => {
    const res = await controller.getPlans({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].assetId).toBe('ASSET_1');
  });

  it('GET /amortization/schedule — returns correct schedule', async () => {
    const res = await controller.getSchedule({
      tenantId: 'TENANT_1',
    });

    expect(res.body.length).toBe(2);
    expect(res.body[0].dotation).toBe(200);
  });

  it('GET /amortization/accumulated — aggregates dotations mechanically', async () => {
    const res = await controller.getAccumulated({
      tenantId: 'TENANT_1',
    });

    expect(res.body.length).toBe(1);
    expect(res.body[0].accumulated).toBe(400);
  });

  it('GET /amortization/net-value — computes VNC mechanically', async () => {
    const res = await controller.getNetValues({
      tenantId: 'TENANT_1',
    });

    expect(res.body.length).toBe(1);
    expect(res.body[0].netValue).toBe(11600); // 12000 - 400
  });

  it('GET /amortization/history — exposes full event history', async () => {
    const res = await controller.getHistory({
      tenantId: 'TENANT_1',
    });

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(h => h.tenantId === 'TENANT_1')).toBe(true);
  });

  it('SYSTEM — no forbidden fields exposed', async () => {
    const res = await controller.getPlans({
      tenantId: 'TENANT_1',
    });

    const forbidden = [
      'taxImpact',
      'decision',
      'recommendation',
      'plusValue',
      'minusValue',
    ];

    forbidden.forEach(field => {
      expect((res.body[0] as any)[field]).toBeUndefined();
    });
  });
});
