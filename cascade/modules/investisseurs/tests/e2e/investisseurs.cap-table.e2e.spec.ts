import request from "supertest";
import { app } from "../setup/test-app";

describe("E2E | Investisseurs | Cap Table", () => {
  const validTokens = {
    investorA: "Bearer investor-A-token",
    coachA: "Bearer coach-A-token",
    entrepreneurA: "Bearer entrepreneur-A-token"
  };

  const validTenantHeaders = {
    tenantA: { "tenantId": "tenant-A" },
    tenantB: { "tenantId": "tenant-B" }
  };

  it("should allow authorized investor to read cap table", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set("Authorization", validTokens.investorA)
      .set(validTenantHeaders.tenantA);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tenantId");
    expect(res.body).toHaveProperty("capTable");
    expect(Array.isArray(res.body.capTable)).toBe(true);
    
    // Verify structure of cap table entries
    if (res.body.capTable.length > 0) {
      const entry = res.body.capTable[0];
      expect(entry).toHaveProperty("shareholderId");
      expect(entry).toHaveProperty("shares");
      expect(entry).toHaveProperty("percentage");
      expect(entry).toHaveProperty("lastUpdatedAt");
    }
  });

  it("should allow coach to read cap table", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set("Authorization", validTokens.coachA)
      .set(validTenantHeaders.tenantA);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("capTable");
  });

  it("should allow entrepreneur to read cap table", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set("Authorization", validTokens.entrepreneurA)
      .set(validTenantHeaders.tenantA);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("capTable");
  });

  it("should reject cap table access without tenantId", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set("Authorization", validTokens.investorA);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "tenantId header is required");
  });

  it("should reject cap table access without authentication", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set(validTenantHeaders.tenantA);

    expect(res.status).toBe(401);
  });

  it("should return cap table history", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table/history")
      .set("Authorization", validTokens.investorA)
      .set(validTenantHeaders.tenantA);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tenantId");
    expect(res.body).toHaveProperty("history");
    expect(Array.isArray(res.body.history)).toBe(true);

    // Verify chronological order
    if (res.body.history.length > 1) {
      for (let i = 1; i < res.body.history.length; i++) {
        const prev = new Date(res.body.history[i - 1].occurredAt);
        const curr = new Date(res.body.history[i].occurredAt);
        expect(prev.getTime()).toBeLessThanOrEqual(curr.getTime());
      }
    }
  });
});
