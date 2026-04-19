import { describe, it, expect } from '@jest/globals';
import { G03_ValidRoles } from '../../src/domain/guardian/invariants/G03_ValidRoles';
import { baseContext } from './helpers';

describe('G03_ValidRoles', () => {
  const invariant = new G03_ValidRoles();

  it('PASS with valid role CLIENT', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL with invalid role', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { 
          name: 'ACME',
          roles: ['HACKER'] 
        }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G03_INVALID_ROLE' }));
  });

  it('PASS with all valid roles', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { 
          roles: ['CLIENT', 'FOURNISSEUR', 'SALARIE', 'ORGANISME_SOCIAL', 'AUTRE'] 
        }
      }
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('FAIL with no roles', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { roles: [] }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G03_NO_ROLE' }));
  });

  it('FAIL when roles is undefined', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { name: 'ACME' }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G03_NO_ROLE' }));
  });
});
