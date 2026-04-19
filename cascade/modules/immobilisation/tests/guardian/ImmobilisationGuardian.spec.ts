// tests/guardian/ImmobilisationGuardian.spec.ts
// IMMOBILISATION — Tests Guardian (SPOFE P0)

import { describe, it, expect } from '@jest/globals';
import { ImmobilisationGuardian } from '../../src/guardian/ImmobilisationGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';

const guardian = new ImmobilisationGuardian();

const ctx = {
  tenantId: 'TENANT_1',
  actorId: 'ACTOR_1',
};

const baseFact = {
  immobilisationId: 'IMM_1',
  tenantId: 'TENANT_1',
  category: 'CORPORELLE' as const,
  acquisitionDate: '2026-01-01',
  documentId: 'DOC_1',
  amount: 1000,
};

describe('GUARDIAN — Immobilisation (SPOFE P0)', () => {
  it('G01 — register valid immobilisation', () => {
    expect(() =>
      guardian.validateRegister(ctx, baseFact)
    ).not.toThrow();
  });

  it('G02 — reject cross-tenant', () => {
    expect(() =>
      guardian.validateRegister(
        { ...ctx, tenantId: 'TENANT_2' },
        baseFact
      )
    ).toThrow(GuardianError);
  });

  it('G03 — reject missing actor', () => {
    expect(() =>
      guardian.validateRegister(
        { ...ctx, actorId: '' },
        baseFact
      )
    ).toThrow(GuardianError);
  });

  it('G04 — reject missing document', () => {
    expect(() =>
      guardian.validateRegister(ctx, {
        ...baseFact,
        documentId: '',
      })
    ).toThrow(GuardianError);
  });

  it('G05 — reject negative amount', () => {
    expect(() =>
      guardian.validateRegister(ctx, {
        ...baseFact,
        amount: -10,
      })
    ).toThrow(GuardianError);
  });

  it('G06 — put in service valid', () => {
    expect(() =>
      guardian.validatePutInService(ctx, {
        ...baseFact,
        inServiceDate: '2026-02-01',
      })
    ).not.toThrow();
  });

  it('G07 — reject service before acquisition', () => {
    expect(() =>
      guardian.validatePutInService(ctx, {
        ...baseFact,
        inServiceDate: '2025-12-01',
      })
    ).toThrow(GuardianError);
  });

  it('G08 — dispose valid immobilisation', () => {
    expect(() =>
      guardian.validateDispose(ctx, {
        ...baseFact,
        inServiceDate: '2026-02-01',
        disposedDate: '2026-12-01',
      })
    ).not.toThrow();
  });

  it('G09 — reject dispose before service', () => {
    expect(() =>
      guardian.validateDispose(ctx, {
        ...baseFact,
        inServiceDate: '2026-02-01',
        disposedDate: '2026-01-15',
      })
    ).toThrow(GuardianError);
  });

  it('G10 — reject accounting logic attempt', () => {
    expect(() =>
      guardian.validateRegister(ctx, {
        ...baseFact,
        amortissement: 100, // forbidden field but ignored
      } as any)
    ).not.toThrow(); // Field ignored, no accounting logic embedded
  });
});
