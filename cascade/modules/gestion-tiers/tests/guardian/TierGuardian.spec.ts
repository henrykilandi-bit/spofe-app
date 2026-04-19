import { describe, it, expect } from '@jest/globals';
import { TierGuardian } from '../../src/domain/guardian/TierGuardian';
import { baseContext, validTier, validDocument } from './helpers';
import { GuardianError } from '../../src/domain/guardian/GuardianError';

describe('TierGuardian - Integration Tests', () => {
  const guardian = new TierGuardian();

  describe('Complete validation flow', () => {
    it('PASS with completely valid context', () => {
      const ctx = baseContext();
      
      expect(() => guardian.validate(ctx)).not.toThrow();
    });

    it('FAIL when multiple invariants violated', () => {
      const ctx = baseContext({
        actorId: undefined, // G09 violation
        commandType: 'DELETE', // G07 violation
        document: validDocument({ state: 'draft' }) // G05 violation
      });

      expect(() => guardian.validate(ctx)).toThrow(GuardianError);
    });

    it('PASS for new tier creation', () => {
      const ctx = baseContext({
        commandType: 'CreateTier',
        currentTier: undefined,
        document: validDocument({
          payload: {
            name: 'New Company',
            roles: ['CLIENT', 'FOURNISSEUR'],
            legalIdentifiers: ['SIRET123456']
          }
        })
      });

      expect(() => guardian.validate(ctx)).not.toThrow();
    });

    it('PASS for tier update with different legal IDs', () => {
      const ctx = baseContext({
        commandType: 'UpdateTier',
        currentTier: validTier({ legalIdentifiers: ['ICE999'] }),
        document: validDocument({
          payload: {
            name: 'Updated Company',
            roles: ['FOURNISSEUR'],
            legalIdentifiers: ['ICE123'] // Different from current tier
          }
        })
      });

      expect(() => guardian.validate(ctx)).not.toThrow();
    });

    it('FAIL for cross-tenant modification attempt', () => {
      const ctx = baseContext({
        tenantId: 'tenant-A',
        currentTier: validTier({ 
          tenantId: 'tenant-B',
          legalIdentifiers: ['ICE999'] // Different to avoid G01
        }),
        commandType: 'UpdateTier'
      });

      expect(() => guardian.validate(ctx)).toThrow(expect.objectContaining({ code: 'G08_CROSS_TENANT' }));
    });
  });

  describe('Error handling', () => {
    it('should throw GuardianError with proper code', () => {
      const ctx = baseContext({
        document: validDocument({
          payload: { 
            name: 'ACME',
            roles: ['CLIENT'],
            amount: 100 // Financial field + valid business data
          }
        })
      });

      try {
        guardian.validate(ctx);
        fail('Expected GuardianError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GuardianError);
        expect((error as GuardianError).code).toBe('G10_FINANCIAL_FIELD_DETECTED');
      }
    });

    it('should stop on first invariant violation (orchestration test)', () => {
      // Context violating multiple invariants in order:
      // G09 (no actor), G05 (document not validated), G03 (no roles)
      const ctx = baseContext({
        actorId: undefined, // G09 violation - will be checked after G05 and G03
        document: validDocument({ 
          state: 'draft', // G05 violation
          payload: {} // G02 and G03 violations
        })
      });

      try {
        guardian.validate(ctx);
        fail('Expected GuardianError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GuardianError);
        // Should fail on first invariant that actually triggers (G02)
        expect((error as GuardianError).code).toBe('G02_MISSING_LEGAL_IDENTITY');
      }
    });
  });
});
