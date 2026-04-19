import { describe, it, expect } from '@jest/globals';
import { G07_AppendOnly } from '../../src/domain/guardian/invariants/G07_AppendOnly';
import { baseContext } from './helpers';

describe('G07_AppendOnly', () => {
  const invariant = new G07_AppendOnly();

  it('PASS when command is not DELETE', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL when commandType is DELETE', () => {
    const ctx = baseContext({ commandType: 'DELETE' });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G07_DELETE_FORBIDDEN' }));
  });

  it('PASS when commandType is CREATE', () => {
    const ctx = baseContext({ commandType: 'CREATE' });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('PASS when commandType is UPDATE', () => {
    const ctx = baseContext({ commandType: 'UPDATE' });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });
});
