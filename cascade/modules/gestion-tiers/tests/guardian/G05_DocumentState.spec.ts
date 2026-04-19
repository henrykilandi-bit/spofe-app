import { describe, it, expect } from '@jest/globals';
import { G05_DocumentState } from '../../src/domain/guardian/invariants/G05_DocumentState';
import { baseContext } from './helpers';

describe('G05_DocumentState', () => {
  const invariant = new G05_DocumentState();

  it('PASS when document validated', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL when document not validated', () => {
    const ctx = baseContext({
      document: { ...baseContext().document, state: 'draft' }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G05_DOCUMENT_NOT_VALIDATED' }));
  });

  it('FAIL when document state is cancelled', () => {
    const ctx = baseContext({
      document: { ...baseContext().document, state: 'cancelled' }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G05_DOCUMENT_NOT_VALIDATED' }));
  });
});
