// tests/guardian/StockGuardian.spec.ts

import { describe, it, expect } from '@jest/globals';
import { StockGuardian } from '../../src/guardian/StockGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';
import {
  GuardianContext,
  StockMovementFact,
} from '../../src/guardian/types';

const guardian = new StockGuardian();

const ctx: GuardianContext = {
  tenantId: 'TENANT_1',
  actorId: 'ACTOR_1',
};

const baseFact: StockMovementFact = {
  movementId: 'MOV_1',
  tenantId: 'TENANT_1',
  productId: 'PROD_1',
  category: 'MARCHANDISES',
  quantity: 10,
  depotId: 'DEPOT_A',
  movementType: 'ENTRY',
  documentId: 'DOC_1',
  documentStatus: 'VALIDATED',
  resultingStock: 100,
};

describe('GUARDIAN — gestion-stocks', () => {
  // GS-01
  it('GS-01 — reject cross-tenant movement', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, tenantId: 'TENANT_2' },
        baseFact
      )
    ).toThrow(GuardianError);
  });

  // GS-02
  it('GS-02 — reject non-validated document', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        documentStatus: 'DRAFT' as any,
      })
    ).toThrow(GuardianError);
  });

  it('GS-02 — reject missing documentId', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        documentId: '',
      })
    ).toThrow(GuardianError);
  });

  // GS-03
  it('GS-03 — reject missing actorId', () => {
    expect(() =>
      guardian.validate(
        { ...ctx, actorId: '' },
        baseFact
      )
    ).toThrow(GuardianError);
  });

  // GS-04
  it('GS-04 — reject zero quantity', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        quantity: 0,
      })
    ).toThrow(GuardianError);
  });

  // GS-05
  it('GS-05 — reject negative resulting stock', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        resultingStock: -1,
      })
    ).toThrow(GuardianError);
  });

  // GS-06
  it('GS-06 — reject missing productId', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        productId: '',
      })
    ).toThrow(GuardianError);
  });

  // GS-07
  it('GS-07 — reject missing depotId', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        depotId: '',
      })
    ).toThrow(GuardianError);
  });

  // GS-08
  it('GS-08 — reject empty lots array when provided', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        lots: [],
      })
    ).toThrow(GuardianError);
  });

  it('GS-08 — accept absence of lots', () => {
    expect(() =>
      guardian.validate(ctx, baseFact)
    ).not.toThrow();
  });

  // GS-09
  it('GS-09 — reject transfer without targetDepotId', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        movementType: 'TRANSFER',
      })
    ).toThrow(GuardianError);
  });

  it('GS-09 — reject transfer with same source and target depot', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        movementType: 'TRANSFER',
        targetDepotId: 'DEPOT_A',
      })
    ).toThrow(GuardianError);
  });

  it('GS-09 — accept valid transfer', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...baseFact,
        movementType: 'TRANSFER',
        targetDepotId: 'DEPOT_B',
      })
    ).not.toThrow();
  });

  // GS-11 / GS-12
  it('GS-11/12 — reject financial fields', () => {
    expect(() =>
      guardian.validate(ctx, {
        ...(baseFact as any),
        unitCost: 10,
      })
    ).toThrow(GuardianError);
  });

  // HAPPY PATH
  it('HAPPY PATH — valid stock entry passes', () => {
    expect(() =>
      guardian.validate(ctx, baseFact)
    ).not.toThrow();
  });
});
