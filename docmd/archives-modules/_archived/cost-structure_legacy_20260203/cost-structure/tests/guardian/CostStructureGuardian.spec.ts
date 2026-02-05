// tests/guardian/CostStructureGuardian.spec.ts

import { describe, it, expect } from 'vitest';
import { CostStructureGuardian } from '../../src/guardian/CostStructureGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';
import {
  GuardianContext,
  BuildCostStructureCommand,
} from '../../src/guardian/types';

const guardian = new CostStructureGuardian();

const ctx: GuardianContext = {
  tenantId: 'TENANT_1',
  actorId: 'ACTOR_1',
};

const baseCommand: BuildCostStructureCommand = {
  commandId: 'CMD_1',
  commandType: 'BUILD',
  tenantId: 'TENANT_1',
  level: 'N1',
  period: '2026-01',
  sources: [
    {
      sourceType: 'STOCK',
      sourceId: 'S1',
      quantity: 10,
      unitCost: 50,
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
};

describe('GUARDIAN — cost-structure', () => {
  // CS-01
  it('CS-01 — reject cross-tenant command', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, tenantId: 'TENANT_2' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  it('CS-01 — reject missing actorId', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, actorId: '' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  // CS-02
  it('CS-02 — reject empty sources', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        sources: [],
      })
    ).toThrow(GuardianError);
  });

  it('CS-02 — reject invalid source type', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        sources: [
          {
            sourceType: 'INVALID' as any,
            sourceId: 'X',
            amount: 100,
          },
        ],
      })
    ).toThrow(GuardianError);
  });

  // CS-04
  it('CS-04 — reject price dependency', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        price: 999,
      })
    ).toThrow(GuardianError);
  });

  // CS-05
  it('CS-05 — reject incomplete source', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        sources: [
          {
            sourceType: 'STOCK',
            sourceId: 'S1',
            quantity: 10,
          },
        ],
      })
    ).toThrow(GuardianError);
  });

  // CS-06 / CS-07
  it('CS-06 — reject invalid allocation ratio', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        allocations: [
          { targetType: 'PRODUCT', targetId: 'P1', ratio: 1.2 },
        ],
      })
    ).toThrow(GuardianError);
  });

  it('CS-07 — reject allocation ratios not summing to 1', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        allocations: [
          { targetType: 'PRODUCT', targetId: 'P1', ratio: 0.5 },
          { targetType: 'PRODUCT', targetId: 'P2', ratio: 0.4 },
        ],
      })
    ).toThrow(GuardianError);
  });

  // CS-08 / 09 / 10
  it('CS-08/09/10 — reject forbidden logic fields', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        taxImpact: true,
      })
    ).toThrow(GuardianError);
  });

  // CS-11
  it('CS-11 — reject revise without append-only intent', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'REVISE',
        commandId: '',
      })
    ).toThrow(GuardianError);
  });

  // CS-12
  it('CS-12 — reject missing cost level', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        level: undefined as any,
      })
    ).toThrow(GuardianError);
  });

  // HAPPY PATH
  it('HAPPY PATH — valid cost structure is accepted', () => {
    expect(() =>
      guardian.validate(ctx, baseCommand)
    ).not.toThrow();
  });

  it('HAPPY PATH — valid revision is accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'REVISE',
        commandId: 'CMD_2',
      })
    ).not.toThrow();
  });
});
