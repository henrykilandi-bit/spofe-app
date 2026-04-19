import { describe, test, expect } from '@jest/globals';
import { RoleAccessRule } from "../../src/guardian/rules/RoleAccessRule";

describe("RoleAccessRule", () => {
  const rule = new RoleAccessRule();

  test("should allow ENTREPRENEUR role", () => {
    expect(() =>
      rule.validate({ actorRole: "ENTREPRENEUR" })
    ).not.toThrow();
  });

  test("should allow COACH role", () => {
    expect(() =>
      rule.validate({ actorRole: "COACH" })
    ).not.toThrow();
  });

  test("should allow SYSTEM role", () => {
    expect(() =>
      rule.validate({ actorRole: "SYSTEM" })
    ).not.toThrow();
  });

  test("should reject INVESTOR role", () => {
    expect(() =>
      rule.validate({ actorRole: "INVESTOR" })
    ).toThrow(/role 'INVESTOR' not allowed/);
  });

  test("should reject ADMIN role", () => {
    expect(() =>
      rule.validate({ actorRole: "ADMIN" })
    ).toThrow(/role 'ADMIN' not allowed/);
  });

  test("should reject unknown role", () => {
    expect(() =>
      rule.validate({ actorRole: "HACKER" })
    ).toThrow(/role 'HACKER' not allowed/);
  });

  test("should reject empty role", () => {
    expect(() =>
      rule.validate({ actorRole: "" })
    ).toThrow(/role '' not allowed/);
  });

  test("should reject undefined role", () => {
    expect(() =>
      rule.validate({ actorRole: undefined })
    ).toThrow(/role 'undefined' not allowed/);
  });

  test("should reject null role", () => {
    expect(() =>
      rule.validate({ actorRole: null })
    ).toThrow(/role 'null' not allowed/);
  });

  test("should allow command with other valid fields", () => {
    expect(() =>
      rule.validate({ 
        actorRole: "ENTREPRENEUR",
        tenantId: "tenant-1",
        shares: 1000 
      })
    ).not.toThrow();
  });
});
