import { describe, it, expect } from '@jest/globals';
import { G08_TenantIsolation } from '../../src/domain/guardian/invariants/G08_TenantIsolation';
import { baseContext, validTier } from './helpers';

describe('G08_TenantIsolation', () => {
  const invariant = new G08_TenantIsolation();

  it('PASS when same tenant', () => {
    const ctx = baseContext({
      tenantId: 'tenant-1',
      currentTier: validTier({ tenantId: 'tenant-1' })
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('FAIL when cross-tenant access', () => {
    const ctx = baseContext({
      tenantId: 'tenant-1',
      currentTier: validTier({ tenantId: 'tenant-2' })
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G08_CROSS_TENANT' }));
  });

  it('PASS when no currentTier', () => {
    const ctx = baseContext({ 
      tenantId: 'tenant-1',
      currentTier: undefined 
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });
});
