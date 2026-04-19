import request from "supertest";
import { app } from "../setup/test-app";

describe("E2E | Investisseurs | Write protection", () => {
  const validTokens = {
    investorA: "Bearer investor-A-token",
    coachA: "Bearer coach-A-token",
    entrepreneurA: "Bearer entrepreneur-A-token"
  };

  const validTenantHeaders = {
    tenantA: { "tenantId": "tenant-A" }
  };

  const forbiddenMethods = ["POST", "PUT", "DELETE", "PATCH"];
  const endpoints = [
    "/api/investisseurs/cap-table",
    "/api/investisseurs/cap-table/history",
    "/api/investisseurs/shareholders",
    "/api/investisseurs/assemblies",
    "/api/investisseurs/documents",
    "/api/investisseurs/reports",
    "/api/investisseurs/access-rights",
    "/api/investisseurs/access-log"
  ];

  describe("Write method blocking", () => {
    forbiddenMethods.forEach(method => {
      endpoints.forEach(endpoint => {
        it(`should reject ${method} ${endpoint}`, async () => {
          let res: any;
          
          switch (method) {
            case "POST":
              res = await request(app)
                .post(endpoint)
                .send({ test: "data" })
                .set("Authorization", validTokens.entrepreneurA)
                .set(validTenantHeaders.tenantA);
              break;
            case "PUT":
              res = await request(app)
                .put(endpoint)
                .send({ test: "data" })
                .set("Authorization", validTokens.entrepreneurA)
                .set(validTenantHeaders.tenantA);
              break;
            case "DELETE":
              res = await request(app)
                .delete(endpoint)
                .set("Authorization", validTokens.entrepreneurA)
                .set(validTenantHeaders.tenantA);
              break;
            case "PATCH":
              res = await request(app)
                .patch(endpoint)
                .send({ test: "data" })
                .set("Authorization", validTokens.entrepreneurA)
                .set(validTenantHeaders.tenantA);
              break;
          }

          expect(res.status).toBe(403);
          expect(res.body).toHaveProperty("error", "Method not allowed. Investisseurs API is read-only.");
          expect(res.body).toHaveProperty("violation", "FORBIDDEN_WRITE_OPERATION");
        });
      });
    });
  });

  it("should include security headers on GET requests", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set("Authorization", validTokens.investorA)
      .set(validTenantHeaders.tenantA);

    expect(res.status).toBe(200);
    expect(res.headers["x-api-read-only"]).toBe("true");
    expect(res.headers["x-api-version"]).toBe("1.0.0");
    expect(res.headers["x-spofe-compliant"]).toBe("true");
  });

  it("should reject financial computation attempts in query parameters", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table?valuation=1000000&irr=0.25")
      .set("Authorization", validTokens.investorA)
      .set(validTenantHeaders.tenantA);

    // Should still work (read-only doesn't block query params), but no financial data returned
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("capTable");
    
    // Verify no financial computations in response
    if (res.body.capTable.length > 0) {
      const entry = res.body.capTable[0];
      expect(entry).not.toHaveProperty("valuation");
      expect(entry).not.toHaveProperty("irr");
      expect(entry).not.toHaveProperty("moic");
      expect(entry).not.toHaveProperty("projection");
    }
  });
});
