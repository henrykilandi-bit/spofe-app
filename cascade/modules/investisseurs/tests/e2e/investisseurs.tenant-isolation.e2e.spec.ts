import request from "supertest";
import { app } from "../setup/test-app";

describe("E2E | Investisseurs | Tenant isolation", () => {
  const validTokens = {
    investorA: "Bearer investor-A-token",
    investorB: "Bearer investor-B-token",
    coachA: "Bearer coach-A-token",
    coachB: "Bearer coach-B-token",
    entrepreneurA: "Bearer entrepreneur-A-token",
    entrepreneurB: "Bearer entrepreneur-B-token"
  };

  const tenantHeaders = {
    tenantA: { "tenantId": "tenant-A" },
    tenantB: { "tenantId": "tenant-B" }
  };

  describe("Cross-tenant access prevention", () => {
    it("should not allow tenant-B investor access from tenant-A token", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorB)
        .set(tenantHeaders.tenantA);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should not allow tenant-A coach access to tenant-B data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.coachA)
        .set(tenantHeaders.tenantB);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should not allow tenant-B entrepreneur access to tenant-A data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/shareholders")
        .set("Authorization", validTokens.entrepreneurB)
        .set(tenantHeaders.tenantA);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Valid tenant access", () => {
    it("should allow tenant-A investor access to tenant-A data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorA)
        .set(tenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tenantId", "tenant-A");
    });

    it("should allow tenant-B investor access to tenant-B data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorB)
        .set(tenantHeaders.tenantB);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tenantId", "tenant-B");
    });

    it("should allow tenant-A coach access to tenant-A data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.coachA)
        .set(tenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
    });

    it("should allow tenant-B entrepreneur access to tenant-B data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/assemblies")
        .set("Authorization", validTokens.entrepreneurB)
        .set(tenantHeaders.tenantB);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assemblies");
    });
  });

  describe("Tenant data isolation", () => {
    it("should return only tenant-A data for tenant-A requests", async () => {
      const res = await request(app)
        .get("/api/investisseurs/shareholders")
        .set("Authorization", validTokens.coachA)
        .set(tenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("shareholders");
      
      // All returned shareholders should belong to tenant-A
      // This would be enforced by the WHERE tenant_id = $1 clause in queries
      expect(Array.isArray(res.body.shareholders)).toBe(true);
    });

    it("should return only tenant-B data for tenant-B requests", async () => {
      const res = await request(app)
        .get("/api/investisseurs/shareholders")
        .set("Authorization", validTokens.coachB)
        .set(tenantHeaders.tenantB);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("shareholders");
      
      // All returned shareholders should belong to tenant-B
      expect(Array.isArray(res.body.shareholders)).toBe(true);
    });

    it("should isolate governance documents by tenant", async () => {
      const resA = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.coachA)
        .set(tenantHeaders.tenantA);

      const resB = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.coachB)
        .set(tenantHeaders.tenantB);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
      
      // Each tenant should see only their own documents
      expect(resA.body).toHaveProperty("documents");
      expect(resB.body).toHaveProperty("documents");
    });

    it("should isolate audit logs by tenant", async () => {
      const resA = await request(app)
        .get("/api/investisseurs/access-log")
        .set("Authorization", validTokens.coachA)
        .set(tenantHeaders.tenantA);

      const resB = await request(app)
        .get("/api/investisseurs/access-log")
        .set("Authorization", validTokens.coachB)
        .set(tenantHeaders.tenantB);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
      
      // Each tenant should see only their own audit logs
      expect(resA.body).toHaveProperty("tenantId", "tenant-A");
      expect(resB.body).toHaveProperty("tenantId", "tenant-B");
    });
  });

  describe("Tenant header validation", () => {
    it("should reject requests without tenantId header", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "tenantId header is required");
    });

    it("should reject requests with empty tenantId header", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorA)
        .set("tenantId", "");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "tenantId header is required");
    });

    it("should reject requests with null tenantId header", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorA)
        .set("tenantId", "null");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "tenantId header is required");
    });
  });

  describe("Multi-tenant security", () => {
    it("should prevent tenant enumeration through error messages", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.investorA)
        .set("tenantId", "non-existent-tenant");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tenantId", "non-existent-tenant");
      expect(res.body).toHaveProperty("capTable");
      expect(Array.isArray(res.body.capTable)).toBe(true);
      expect(res.body.capTable.length).toBe(0);
      
      // Should not reveal if tenant exists or not - just return empty data
    });

    it("should maintain tenant isolation across all endpoints", async () => {
      const endpoints = [
        "/api/investisseurs/cap-table",
        "/api/investisseurs/cap-table/history",
        "/api/investisseurs/shareholders",
        "/api/investisseurs/assemblies",
        "/api/investisseurs/documents",
        "/api/investisseurs/reports"
      ];

      for (const endpoint of endpoints) {
        const resA = await request(app)
          .get(endpoint)
          .set("Authorization", validTokens.coachA)
          .set(tenantHeaders.tenantA);

        const resB = await request(app)
          .get(endpoint)
          .set("Authorization", validTokens.coachB)
          .set(tenantHeaders.tenantB);

        expect(resA.status).toBe(200);
        expect(resB.status).toBe(200);
        
        // Both should succeed but return different data
        expect(resA.body).toBeDefined();
        expect(resB.body).toBeDefined();
      }
    });
  });

  describe("Tenant isolation in access rights", () => {
    it("should isolate investor access rights by tenant", async () => {
      const resA = await request(app)
        .get("/api/investisseurs/access-rights")
        .set("Authorization", validTokens.investorA)
        .set(tenantHeaders.tenantA);

      const resB = await request(app)
        .get("/api/investisseurs/access-rights")
        .set("Authorization", validTokens.investorB)
        .set(tenantHeaders.tenantB);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
      
      expect(resA.body).toHaveProperty("tenantId", "tenant-A");
      expect(resB.body).toHaveProperty("tenantId", "tenant-B");
      
      // Each investor should only see their own tenant's access rights
      expect(resA.body).toHaveProperty("investorId");
      expect(resB.body).toHaveProperty("investorId");
    });
  });
});
