import { describe, it, expect } from '@jest/globals';
import { G04_DocumentDriven } from '../../src/domain/guardian/invariants/G04_DocumentDriven';
import { baseContext } from './helpers';

describe('G04_DocumentDriven', () => {
  const invariant = new G04_DocumentDriven();

  it('PASS when document exists', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL when document missing', () => {
    expect(() =>
      invariant.validate({ ...baseContext(), document: undefined as any })
    ).toThrow(expect.objectContaining({ code: 'G04_NO_DOCUMENT' }));
  });

  it('PASS when document has all required fields', () => {
    const ctx = baseContext({
      document: {
        id: 'doc-2',
        type: 'TierUpdate',
        state: 'validated',
        payload: { name: 'Updated Name', roles: ['FOURNISSEUR'] }
      }
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });
});
