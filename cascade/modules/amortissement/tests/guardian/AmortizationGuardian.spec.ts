// tests/guardian/AmortizationGuardian.spec.ts

import { describe, it, expect } from '@jest/globals';
import { AmortizationGuardian } from '../../src/guardian/AmortizationGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';
import {
  GuardianContext,
  AmortizationPlanCommand,
} from '../../src/guardian/types';

const guardian = new AmortizationGuardian();

const ctx: GuardianContext = {
  tenantId: 'TENANT_1',
  actorId: 'ACTOR_1',
};

const baseCommand: AmortizationPlanCommand = {
  commandId: 'CMD_1',
  commandType: 'CREATE_PLAN',
  tenantId: 'TENANT_1',
  effectiveDate: '2026-01-01',
  method: 'LINEAR',
  asset: {
    assetId: 'ASSET_1',
    tenantId: 'TENANT_1',
    acquisitionValue: 12000,
    inServiceDate: '2026-01-01',
    usefulLifeMonths: 60,
    residualValue: 0,
  },
};

describe('GUARDIAN — amortissement', () => {
  // AM-01
  it('AM-01 — reject cross-tenant command', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, tenantId: 'TENANT_2' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  it('AM-01 — reject missing actorId', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, actorId: '' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  // AM-02
  it('AM-02 — reject missing asset source', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        asset: undefined as any,
      })
    ).toThrow(GuardianError);
  });

  // AM-03
  it('AM-03 — reject missing amortization method', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        method: undefined as any,
      })
    ).toThrow(GuardianError);
  });

  // AM-04
  it('AM-04 — reject non-positive useful life', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        asset: {
          ...baseCommand.asset,
          usefulLifeMonths: 0,
        },
      })
    ).toThrow(GuardianError);
  });

  // AM-05
  it('AM-05 — reject acquisition value <= 0', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        asset: {
          ...baseCommand.asset,
          acquisitionValue: 0,
        },
      })
    ).toThrow(GuardianError);
  });

  // AM-06
  it('AM-06 — reject negative residual value', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        asset: {
          ...baseCommand.asset,
          residualValue: -1,
        },
      })
    ).toThrow(GuardianError);
  });

  // AM-07 / AM-08
  it('AM-07/08 — reject negative dotation result', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        asset: {
          ...baseCommand.asset,
          acquisitionValue: 1000,
          residualValue: 2000,
        },
      })
    ).toThrow(GuardianError);
  });

  // AM-09
  it('AM-09 — reject revise command without revision payload', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'REVISE_PLAN',
        revision: undefined,
      })
    ).toThrow(GuardianError);
  });

  // AM-10 / 11 / 12
  it('AM-10/11/12 — reject forbidden fiscal or decision fields', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        taxImpact: true,
      })
    ).toThrow(GuardianError);
  });

  // HAPPY PATH
  it('HAPPY PATH — valid amortization plan is accepted', () => {
    expect(() =>
      guardian.validate(ctx, baseCommand)
    ).not.toThrow();
  });

  it('HAPPY PATH — valid revision is accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'REVISE_PLAN',
        revision: {
          usefulLifeMonths: 72,
        },
      })
    ).not.toThrow();
  });

  it('HAPPY PATH — stop plan is accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'STOP_PLAN',
      })
    ).not.toThrow();
  });
});
