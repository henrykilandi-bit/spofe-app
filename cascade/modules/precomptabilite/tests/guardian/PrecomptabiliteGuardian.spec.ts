// tests/guardian/PrecomptabiliteGuardian.spec.ts

import { describe, it, expect } from '@jest/globals';
import { PrecomptabiliteGuardian } from '../../src/guardian/PrecomptabiliteGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';
import {
  GuardianContext,
  PrecomptabiliteCommand,
} from '../../src/guardian/types';

const guardian = new PrecomptabiliteGuardian();

const ctx: GuardianContext = {
  tenantId: 'TENANT_1',
  actorId: 'ACTOR_1',
};

const baseCommand: PrecomptabiliteCommand = {
  commandId: 'CMD_1',
  commandType: 'CREATE_DOCUMENT',
  tenantId: 'TENANT_1',
  documentId: 'DOC_1',
  documentType: 'SUPPLIER_INVOICE',
};

describe('GUARDIAN — precomptabilite', () => {
  // P-01
  it('P-01 — reject cross-tenant command', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, tenantId: 'TENANT_X' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  // P-02
  it('P-02 — reject missing actorId', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, actorId: '' },
        baseCommand
      )
    ).toThrow(GuardianError);
  });

  // P-03
  it('P-03 — reject missing documentId', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        documentId: '',
      })
    ).toThrow(GuardianError);
  });

  it('P-03 — reject missing documentType on creation', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        documentType: undefined,
      })
    ).toThrow(GuardianError);
  });

  // P-04
  it('P-04 — reject missing commandId (append-only)', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandId: '',
      })
    ).toThrow(GuardianError);
  });

  // P-06 workflow
  it('P-06 — reject submit if not DRAFT', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'SUBMIT_FOR_VALIDATION',
        status: 'VALIDATED',
      })
    ).toThrow(GuardianError);
  });

  it('P-06 — reject validate if not SUBMITTED', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'VALIDATE_DOCUMENT',
        status: 'DRAFT',
      })
    ).toThrow(GuardianError);
  });

  it('P-06 — reject reject if not SUBMITTED', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'REJECT_DOCUMENT',
        status: 'DRAFT',
      })
    ).toThrow(GuardianError);
  });

  it('P-06 — reject suspend if already VALIDATED', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'SUSPEND_DOCUMENT',
        status: 'VALIDATED',
      })
    ).toThrow(GuardianError);
  });

  // P-07
  it('P-07 — reject negative amount', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'UPDATE_METADATA',
        metadata: {
          amount: -100,
        },
      })
    ).toThrow(GuardianError);
  });

  // P-08..P-10
  it('P-08..P-10 — reject forbidden accounting field', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        accountingEntry: '401',
      })
    ).toThrow(GuardianError);
  });

  it('P-08..P-10 — reject forbidden tax logic', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        taxCalculation: true,
      })
    ).toThrow(GuardianError);
  });

  it('P-08..P-10 — reject decision logic', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        decision: 'PAY_NOW',
      })
    ).toThrow(GuardianError);
  });

  // P-11
  it('P-11 — reject missing commandType', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseCommand as any),
        commandType: undefined,
      })
    ).toThrow(GuardianError);
  });

  // HAPPY PATHS
  it('HAPPY PATH — create document accepted', () => {
    expect(() =>
      guardian.validate(ctx, baseCommand)
    ).not.toThrow();
  });

  it('HAPPY PATH — submit document accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'SUBMIT_FOR_VALIDATION',
        status: 'DRAFT',
      })
    ).not.toThrow();
  });

  it('HAPPY PATH — validate document accepted', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseCommand,
        commandType: 'VALIDATE_DOCUMENT',
        status: 'SUBMITTED',
      })
    ).not.toThrow();
  });
});
