import { describe, test, expect } from '@jest/globals';
import { ValidDocumentRule } from "../../src/guardian/rules/ValidDocumentRule";

describe("ValidDocumentRule", () => {
  const rule = new ValidDocumentRule();

  test("should allow validated document", () => {
    expect(() =>
      rule.validate({ documentStatus: "VALIDATED" })
    ).not.toThrow();
  });

  test("should reject draft document", () => {
    expect(() =>
      rule.validate({ documentStatus: "DRAFT" })
    ).toThrow(/must be VALIDATED before exposure/);
  });

  test("should reject cancelled document", () => {
    expect(() =>
      rule.validate({ documentStatus: "CANCELLED" })
    ).toThrow(/must be VALIDATED before exposure/);
  });

  test("should reject pending document", () => {
    expect(() =>
      rule.validate({ documentStatus: "PENDING" })
    ).toThrow(/must be VALIDATED before exposure/);
  });

  test("should reject archived document", () => {
    expect(() =>
      rule.validate({ documentStatus: "ARCHIVED" })
    ).toThrow(/must be VALIDATED before exposure/);
  });

  test("should allow command without document status", () => {
    expect(() =>
      rule.validate({})
    ).not.toThrow();
  });

  test("should allow command with null document status", () => {
    expect(() =>
      rule.validate({ documentStatus: null })
    ).not.toThrow();
  });

  test("should allow command with undefined document status", () => {
    expect(() =>
      rule.validate({ documentStatus: undefined })
    ).not.toThrow();
  });

  test("should allow command with empty string document status", () => {
    expect(() =>
      rule.validate({ documentStatus: "" })
    ).not.toThrow();
  });

  test("should allow validated document with other fields", () => {
    expect(() =>
      rule.validate({ 
        documentStatus: "VALIDATED",
        tenantId: "tenant-1",
        actorRole: "ENTREPRENEUR"
      })
    ).not.toThrow();
  });
});
