import { describe, test, expect } from '@jest/globals';
import { AppendOnlyRule } from "../../src/guardian/rules/AppendOnlyRule";

describe("AppendOnlyRule", () => {
  test("should always allow append-only commands", () => {
    const rule = new AppendOnlyRule<any>();

    expect(() => rule.validate({ any: "value" })).not.toThrow();
  });

  test("should allow empty command", () => {
    const rule = new AppendOnlyRule<any>();

    expect(() => rule.validate({})).not.toThrow();
  });

  test("should allow complex command", () => {
    const rule = new AppendOnlyRule<any>();
    const complexCommand = {
      tenantId: "tenant-1",
      actorId: "actor-1",
      data: { nested: "value" },
      timestamp: new Date().toISOString(),
    };

    expect(() => rule.validate(complexCommand)).not.toThrow();
  });
});
