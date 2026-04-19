import { describe, it, expect } from '@jest/globals';
import { G10_NoFinancialLogic } from '../../src/domain/guardian/invariants/G10_NoFinancialLogic';
import { baseContext } from './helpers';

describe('G10_NoFinancialLogic', () => {
  const invariant = new G10_NoFinancialLogic();

  it('PASS when no financial field', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL when financial field detected - amount', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { amount: 100 }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G10_FINANCIAL_FIELD_DETECTED' }));
  });

  it('FAIL when financial field detected - balance', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { balance: 500 }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G10_FINANCIAL_FIELD_DETECTED' }));
  });

  it('FAIL when financial field detected - credit', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { credit: 1000 }
      }
    });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G10_FINANCIAL_FIELD_DETECTED' }));
  });

  it('PASS when only business fields present', () => {
    const ctx = baseContext({
      document: {
        ...baseContext().document,
        payload: { 
          name: 'ACME Corp',
          address: '123 Main St',
          email: 'contact@acme.com',
          roles: ['CLIENT']
        }
      }
    });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });
});
