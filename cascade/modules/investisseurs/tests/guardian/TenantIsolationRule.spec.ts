import { describe, test, expect } from '@jest/globals';
import { TenantIsolationRule } from "../../src/guardian/rules/TenantIsolationRule";

describe("TenantIsolationRule", () => {
  const rule = new TenantIsolationRule();

  test("should allow command with tenantId", () => {
    expect(() =>
      rule.validate({ tenantId: "tenant-123" })
    ).not.toThrow();
  });

  test("should allow command with numeric tenantId", () => {
    expect(() =>
      rule.validate({ tenantId: 123 })
    ).not.toThrow();
  });

  test("should allow command with complex tenantId", () => {
    expect(() =>
      rule.validate({ tenantId: "company-division-001" })
    ).not.toThrow();
  });

  test("should reject command without tenantId", () => {
    expect(() =>
      rule.validate({} as any)
    ).toThrow(/tenantId is mandatory/);
  });

  test("should reject command with empty tenantId", () => {
    expect(() =>
      rule.validate({ tenantId: "" })
    ).toThrow(/tenantId is mandatory/);
  });

  test("should reject command with null tenantId", () => {
    expect(() =>
      rule.validate({ tenantId: null })
    ).toThrow(/tenantId is mandatory/);
  });

  test("should reject command with undefined tenantId", () => {
    expect(() =>
      rule.validate({ tenantId: undefined })
    ).toThrow(/tenantId is mandatory/);
  });

  test("should allow command with tenantId and other fields", () => {
    expect(() =>
      rule.validate({ 
        tenantId: "tenant-1",
        actorRole: "ENTREPRENEUR",
        shares: 1000 
      })
    ).not.toThrow();
  });
});
