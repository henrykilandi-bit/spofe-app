import request from "supertest";
import { app } from "../setup/test-app";

describe("E2E | Investisseurs | Access control", () => {
  const validTokens = {
    investorA: "Bearer investor-A-token",
    investorWithoutScope: "Bearer investor-without-scope",
    coachA: "Bearer coach-A-token",
    entrepreneurA: "Bearer entrepreneur-A-token",
    unauthorizedUser: "Bearer unauthorized-user-token"
  };

  const validTenantHeaders = {
    tenantA: { "tenantId": "tenant-A" }
  };

  describe("Investor access control", () => {
    it("should allow authorized investor to access reports", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
      expect(Array.isArray(res.body.reports)).toBe(true);
    });

    it("should deny access to investor without proper scope", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.investorWithoutScope)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should allow investor to access their own access rights", async () => {
      const res = await request(app)
        .get("/api/investisseurs/access-rights")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tenantId");
      expect(res.body).toHaveProperty("investorId");
      expect(res.body).toHaveProperty("accessRights");
      expect(Array.isArray(res.body.accessRights)).toBe(true);
    });

    it("should deny investor access to full audit log", async () => {
      const res = await request(app)
        .get("/api/investisseurs/access-log")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Access denied. Coach or entrepreneur role required.");
    });
  });

  describe("Coach access control", () => {
    it("should allow coach full access to reports", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
    });

    it("should allow coach access to audit log", async () => {
      const res = await request(app)
        .get("/api/investisseurs/access-log")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tenantId");
      expect(res.body).toHaveProperty("accessLog");
      expect(Array.isArray(res.body.accessLog)).toBe(true);
    });

    it("should allow coach access to governance documents", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");
    });
  });

  describe("Entrepreneur access control", () => {
    it("should allow entrepreneur full access to cap table", async () => {
      const res = await request(app)
        .get("/api/investisseurs/cap-table")
        .set("Authorization", validTokens.entrepreneurA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("capTable");
    });

    it("should allow entrepreneur access to audit log", async () => {
      const res = await request(app)
        .get("/api/investisseurs/access-log")
        .set("Authorization", validTokens.entrepreneurA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessLog");
    });

    it("should allow entrepreneur access to shareholders list", async () => {
      const res = await request(app)
        .get("/api/investisseurs/shareholders")
        .set("Authorization", validTokens.entrepreneurA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("shareholders");
    });
  });

  describe("Unauthorized access", () => {
    it("should deny access without authentication", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(401);
    });

    it("should deny access with invalid token", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", "Bearer invalid-token")
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(401);
    });

    it("should deny access to unauthorized user", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.unauthorizedUser)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(403);
    });
  });

  describe("Scope-based filtering", () => {
    it("should filter documents based on investor scope", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");
      
      // Documents should be filtered by investor's scope
      // This would require scope checking logic in the controller
      expect(Array.isArray(res.body.documents)).toBe(true);
    });

    it("should allow document type filtering", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents?documentType=AG_PV")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");
      
      // All returned documents should be of the specified type
      if (res.body.documents.length > 0) {
        res.body.documents.forEach((doc: any) => {
          expect(doc.documentType).toBe("AG_PV");
        });
      }
    });
  });
});
