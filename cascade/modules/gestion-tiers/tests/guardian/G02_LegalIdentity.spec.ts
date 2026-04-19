import { describe, it, expect } from '@jest/globals';
import { G02_LegalIdentity } from '../../src/domain/guardian/invariants/G02_LegalIdentity';
import { baseContext } from './helpers';

describe('G02_LegalIdentity', () => {
  const invariant = new G02_LegalIdentity();

  it('PASS when name exists', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL when name and legalIdentifiers missing', () => {
    const ctx = baseContext({
      document: {
        id: 'doc',
        type: 'TierRecord',
        state: 'validated',
        payload: {}
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G02_MISSING_LEGAL_IDENTITY' }));
  });

  it('PASS when only legalIdentifiers exist', () => {
    const ctx = baseContext({
      document: {
        id: 'doc',
        type: 'TierRecord',
        state: 'validated',
        payload: { legalIdentifiers: ['ICE123'] }
      }
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('FAIL when legalIdentifiers is empty array', () => {
    const ctx = baseContext({
      document: {
        id: 'doc',
        type: 'TierRecord',
        state: 'validated',
        payload: { legalIdentifiers: [] }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G02_MISSING_LEGAL_IDENTITY' }));
  });
});
