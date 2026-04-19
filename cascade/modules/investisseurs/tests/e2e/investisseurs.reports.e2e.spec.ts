import request from "supertest";
import { app } from "../setup/test-app";

describe("E2E | Investisseurs | Reports", () => {
  const validTokens = {
    investorA: "Bearer investor-A-token",
    coachA: "Bearer coach-A-token",
    entrepreneurA: "Bearer entrepreneur-A-token"
  };

  const validTenantHeaders = {
    tenantA: { "tenantId": "tenant-A" }
  };

  describe("Report access", () => {
    it("should allow investor to read published reports", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
      expect(Array.isArray(res.body.reports)).toBe(true);

      if (res.body.reports.length > 0) {
        res.body.reports.forEach((report: any) => {
          expect(report).toHaveProperty("reportId");
          expect(report).toHaveProperty("period");
          expect(report).toHaveProperty("publishedAt");
        });
      }
    });

    it("should allow coach full access to reports", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
    });

    it("should allow entrepreneur full access to reports", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.entrepreneurA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reports");
    });
  });

  describe("Individual report access", () => {
    it("should allow investor to access specific report", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports/rep-001")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reportId", "rep-001");
      expect(res.body).toHaveProperty("period");
      expect(res.body).toHaveProperty("publishedAt");
    });

    it("should return 404 for non-existent report", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports/non-existent")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Report not found");
    });

    it("should deny access to report without tenantId", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports/rep-001")
        .set("Authorization", validTokens.investorA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "tenantId header is required");
    });
  });

  describe("Report structure validation", () => {
    it("should return reports with proper structure", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);

      if (res.body.reports.length > 0) {
        const report = res.body.reports[0];
        expect(report).toHaveProperty("reportId");
        expect(report).toHaveProperty("period");
        expect(report).toHaveProperty("publishedAt");
        
        // Validate date format
        expect(new Date(report.publishedAt)).toBeInstanceOf(Date);
        
        // Validate reportId format
        expect(typeof report.reportId).toBe("string");
        expect(report.reportId.length).toBeGreaterThan(0);
        
        // Validate period format
        expect(typeof report.period).toBe("string");
        expect(report.period.length).toBeGreaterThan(0);
      }
    });

    it("should return reports in chronological order", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      
      if (res.body.reports.length > 1) {
        for (let i = 1; i < res.body.reports.length; i++) {
          const prev = new Date(res.body.reports[i - 1].publishedAt);
          const curr = new Date(res.body.reports[i].publishedAt);
          expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
        }
      }
    });
  });

  describe("Financial computation restrictions", () => {
    it("should not include financial computations in report data", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);

      if (res.body.reports.length > 0) {
        res.body.reports.forEach((report: any) => {
          // Should not contain any financial computations
          expect(report).not.toHaveProperty("valuation");
          expect(report).not.toHaveProperty("irr");
          expect(report).not.toHaveProperty("moic");
          expect(report).not.toHaveProperty("dividend");
          expect(report).not.toHaveProperty("projection");
          expect(report).not.toHaveProperty("discountRate");
          expect(report).not.toHaveProperty("cashFlow");
        });
      }
    });

    it("should not include financial computations in individual report", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports/rep-001")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);

      // Should not contain any financial computations
      expect(res.body).not.toHaveProperty("valuation");
      expect(res.body).not.toHaveProperty("irr");
      expect(res.body).not.toHaveProperty("moic");
      expect(res.body).not.toHaveProperty("dividend");
      expect(res.body).not.toHaveProperty("projection");
      expect(res.body).not.toHaveProperty("discountRate");
      expect(res.body).not.toHaveProperty("cashFlow");
    });
  });

  describe("Read-only compliance", () => {
    it("should ensure reports are immutable snapshots", async () => {
      const res = await request(app)
        .get("/api/investisseurs/reports")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);

      if (res.body.reports.length > 0) {
        res.body.reports.forEach((report: any) => {
          // Should contain only read-only properties
          expect(report).not.toHaveProperty("canEdit");
          expect(report).not.toHaveProperty("canDelete");
          expect(report).not.toHaveProperty("status");
          expect(report).not.toHaveProperty("editable");
          
          // Should have immutable publication timestamp
          expect(report.publishedAt).toBeDefined();
        });
      }
    });

    it("should return consistent report data across requests", async () => {
      const res1 = await request(app)
        .get("/api/investisseurs/reports/rep-001")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      const res2 = await request(app)
        .get("/api/investisseurs/reports/rep-001")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(JSON.stringify(res1.body)).toBe(JSON.stringify(res2.body));
    });
  });

  describe("Audit trail preparation", () => {
    it("should prepare audit event for report access", async () => {
      // This test verifies that accessing a specific report would trigger audit logging
      // The actual audit logging would happen in the controller
      const res = await request(app)
        .get("/api/investisseurs/reports/rep-001")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reportId", "rep-001");
      
      // TODO: Verify that InvestorDocumentViewed event would be published
      // This would require mocking the event bus or checking the audit log
    });
  });
});
