// tests/guardian/BudgetGuardian.spec.ts

import { describe, it, expect } from '@jest/globals';
import { BudgetGuardian } from '../../src/guardian/BudgetGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';
import {
  GuardianContext,
  BudgetCommand,
} from '../../src/guardian/types';

const guardian = new BudgetGuardian();

const ctx: GuardianContext = {
  tenantId: 'TENANT_1',
  actorId: 'ACTOR_1',
};

const baseCommand: BudgetCommand = {
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

describe('GUARDIAN — budget', () => {
  // B-01
  it('B-01 — reject cross-tenant command', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, tenantId: 'TENANT_X' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  // B-02
  it('B-02 — reject missing actorId', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, actorId: '' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  // B-12
  it('B-12 — reject invalid period range', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        periodFrom: '2026-12',
        periodTo: '2026-01',
      })
    ).toThrow(GuardianError);
  });

  // B-03
  it('B-03 — reject incomplete budget (no hypotheses)', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        hypotheses: [],
      })
    ).toThrow(GuardianError);
  });

  it('B-03 — reject incomplete budget (no lines)', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        lines: [],
      })
    ).toThrow(GuardianError);
  });

  // B-04
  it('B-04 — reject invalid hypothesis', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        hypotheses: [
          {
            key: '',
            description: 'invalide',
            value: 0,
          },
        ],
      })
    ).toThrow(GuardianError);
  });

  // B-05
  it('B-05 — reject append-only violation', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'UPDATE',
        commandId: '',
      })
    ).toThrow(GuardianError);
  });

  // B-06
  it('B-06 — reject invalid status transition (validate)', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'VALIDATE',
        status: 'VALIDATED',
      })
    ).toThrow(GuardianError);
  });

  it('B-06 — reject invalid status transition (close)', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'CLOSE',
        status: 'DRAFT',
      })
    ).toThrow(GuardianError);
  });

  // B-07
  it('B-07 — reject non-certified hypothesis source', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        hypotheses: [
          {
            key: 'x',
            description: 'bad source',
            value: 10,
            sourceModule: 'UNKNOWN' as any,
          },
        ],
      })
    ).toThrow(GuardianError);
  });

  // B-08..B-11
  it('B-08..B-11 — reject forbidden fields (cost, quantity, decision)', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        unitCost: 10,
      })
    ).toThrow(GuardianError);
  });

  it('B-03 — reject negative budget line amount', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        lines: [
          {
            targetType: 'PRODUCT',
            targetId: 'P1',
            period: '2026-01',
            amount: -100,
          },
        ],
      })
    ).toThrow(GuardianError);
  });

  // HAPPY PATHS
  it('HAPPY PATH — create budget accepted', () => {
    expect(() =>
      guardian.validate(ctx, baseCommand)
    ).not.toThrow();
  });

  it('HAPPY PATH — validate budget accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'VALIDATE',
        status: 'DRAFT',
        commandId: 'CMD_2',
      })
    ).not.toThrow();
  });

  it('HAPPY PATH — close budget accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'CLOSE',
        status: 'VALIDATED',
        commandId: 'CMD_3',
      })
    ).not.toThrow();
  });
});
