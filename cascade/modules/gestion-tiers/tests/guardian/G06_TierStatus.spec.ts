import { describe, it, expect } from '@jest/globals';
import { G06_TierStatus } from '../../src/domain/guardian/invariants/G06_TierStatus';
import { baseContext, validTier } from './helpers';

describe('G06_TierStatus', () => {
  const invariant = new G06_TierStatus();

  it('PASS when tier is active', () => {
    const ctx = baseContext({
      currentTier: validTier({ status: 'ACTIVE' })
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('FAIL when tier is archived', () => {
    const ctx = baseContext({
      currentTier: validTier({ status: 'ARCHIVED' })
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G06_TIER_ARCHIVED_IMMUTABLE' }));
  });

  it('PASS when tier is suspended', () => {
    const ctx = baseContext({
      currentTier: validTier({ status: 'SUSPENDED' })
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('PASS when no currentTier', () => {
    const ctx = baseContext({ currentTier: undefined });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });
});
