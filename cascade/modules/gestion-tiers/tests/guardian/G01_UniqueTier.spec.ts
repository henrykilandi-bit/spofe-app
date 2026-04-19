import { describe, it, expect } from '@jest/globals';
import { G01_UniqueTier } from '../../src/domain/guardian/invariants/G01_UniqueTier';
import { baseContext, validTier } from './helpers';

describe('G01_UniqueTier', () => {
  const invariant = new G01_UniqueTier();

  it('PASS when no duplicate legal identifier', () => {
    const ctx = baseContext({
      currentTier: validTier({ legalIdentifiers: ['ICE999'] })
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('FAIL when duplicate legal identifier detected', () => {
    const ctx = baseContext({
      currentTier: validTier({ legalIdentifiers: ['ICE123'] })
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G01_DUPLICATE_LEGAL_ID' }));
  });

  it('PASS when currentTier is undefined', () => {
    const ctx = baseContext({ currentTier: undefined });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('PASS when no legalIdentifiers in document', () => {
    const ctx = baseContext({
      document: {
        id: 'doc-1',
        type: 'TierRecord',
        state: 'validated',
        payload: { name: 'ACME', roles: ['CLIENT'] }
      },
      currentTier: validTier({ legalIdentifiers: ['ICE123'] })
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });
});
