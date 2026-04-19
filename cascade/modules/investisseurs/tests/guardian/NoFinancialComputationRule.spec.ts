import { describe, test, expect } from '@jest/globals';
import { NoFinancialComputationRule } from "../../src/guardian/rules/NoFinancialComputationRule";

describe("NoFinancialComputationRule", () => {
  const rule = new NoFinancialComputationRule();

  test("should allow command without financial fields", () => {
    expect(() =>
      rule.validate({ tenantId: "t1", actorId: "a1" })
    ).not.toThrow();
  });

  test("should reject valuation field", () => {
    expect(() =>
      rule.validate({ valuation: 1000000 })
    ).toThrow(/financial computation field 'valuation'/);
  });

  test("should reject IRR field", () => {
    expect(() =>
      rule.validate({ irr: 0.25 })
    ).toThrow(/financial computation field 'irr'/);
  });

  test("should reject MOIC field", () => {
    expect(() =>
      rule.validate({ moic: 3.5 })
    ).toThrow(/financial computation field 'moic'/);
  });

  test("should reject dividend field", () => {
    expect(() =>
      rule.validate({ dividend: 5000 })
    ).toThrow(/financial computation field 'dividend'/);
  });

  test("should reject discountRate field", () => {
    expect(() =>
      rule.validate({ discountRate: 0.08 })
    ).toThrow(/financial computation field 'discountRate'/);
  });

  test("should reject cashFlow field", () => {
    expect(() =>
      rule.validate({ cashFlow: 100000 })
    ).toThrow(/financial computation field 'cashFlow'/);
  });

  test("should reject projection field", () => {
    expect(() =>
      rule.validate({ projection: "optimistic" })
    ).toThrow(/financial computation field 'projection'/);
  });

  test("should reject command with multiple forbidden fields", () => {
    expect(() =>
      rule.validate({ valuation: 1000000, irr: 0.25, dividend: 5000 })
    ).toThrow(/financial computation field 'valuation'/);
  });

  test("should allow command with financial-like but allowed fields", () => {
    expect(() =>
      rule.validate({ 
        shares: 1000, 
        percentage: 10.5, 
        amount: 50000, 
        price: 50 
      })
    ).not.toThrow();
  });
});
