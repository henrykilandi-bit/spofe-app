import { describe, test, expect } from '@jest/globals';
import { InvestisseursGuardian } from "../../src/guardian/InvestisseursGuardian";

describe("InvestisseursGuardian", () => {
  const guardian = new InvestisseursGuardian<any>();

  test("should validate a fully compliant command", () => {
    const command = {
      tenantId: "t1",
      actorRole: "COACH",
      documentStatus: "VALIDATED",
    };

    expect(() => guardian.validate(command)).not.toThrow();
  });

  test("should reject command with forbidden financial field", () => {
    const command = {
      tenantId: "t1",
      actorRole: "COACH",
      valuation: 5000000,
    };

    expect(() => guardian.validate(command)).toThrow(/financial computation field 'valuation'/);
  });

  test("should reject command without tenantId", () => {
    const command = {
      actorRole: "ENTREPRENEUR",
    };

    expect(() => guardian.validate(command)).toThrow(/tenantId is mandatory/);
  });

  test("should reject command with invalid role", () => {
    const command = {
      tenantId: "t1",
      actorRole: "INVESTOR",
    };

    expect(() => guardian.validate(command)).toThrow(/role 'INVESTOR' not allowed/);
  });

  test("should reject non validated document", () => {
    const command = {
      tenantId: "t1",
      actorRole: "COACH",
      documentStatus: "DRAFT",
    };

    expect(() => guardian.validate(command)).toThrow(/must be VALIDATED before exposure/);
  });

  test("should reject command with multiple violations", () => {
    const command = {
      actorRole: "INVESTOR",
      valuation: 1000000,
      documentStatus: "DRAFT",
    };

    // Should fail on first violation (financial computation check)
    expect(() => guardian.validate(command)).toThrow(/financial computation field 'valuation'/);
  });

  test("should allow complex valid command", () => {
    const command = {
      tenantId: "company-001",
      actorRole: "ENTREPRENEUR",
      documentStatus: "VALIDATED",
      shareholderId: "shareholder-123",
      shares: 1000,
      percentage: 10.5,
      metadata: {
        source: "manual",
        approved: true
      }
    };

    expect(() => guardian.validate(command)).not.toThrow();
  });

  test("should reject command with all forbidden financial fields", () => {
    const forbiddenFields = ["valuation", "irr", "moic", "dividend", "discountRate", "cashFlow", "projection"];
    
    forbiddenFields.forEach(field => {
      const command = {
        tenantId: "t1",
        actorRole: "ENTREPRENEUR",
        [field]: 100
      };
      expect(() => guardian.validate(command)).toThrow(/financial computation field/);
    });
  });

  test("should reject command with all invalid roles", () => {
    const invalidRoles = ["INVESTOR", "ADMIN", "MANAGER", "VIEWER", "HACKER"];
    
    invalidRoles.forEach(role => {
      const command = {
        tenantId: "t1",
        actorRole: role
      };
      expect(() => guardian.validate(command)).toThrow(/not allowed/);
    });
  });

  test("should allow command with all valid roles", () => {
    const validRoles = ["ENTREPRENEUR", "COACH", "SYSTEM"];
    
    validRoles.forEach(role => {
      const command = {
        tenantId: "t1",
        actorRole: role
      };
      expect(() => guardian.validate(command)).not.toThrow();
    });
  });
});
