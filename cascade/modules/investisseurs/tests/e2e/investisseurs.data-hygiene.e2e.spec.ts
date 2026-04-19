import express from "express";
import request from "supertest";
import { createInvestisseursApi } from "../../src/api";

function createDataHygieneApp() {
  const db = {
    query: jest.fn().mockImplementation(async (query: string) => {
      if (query.includes("FROM cap_table_current")) {
        return {
          rows: [
            {
              shareholder_id: "sh-1",
              shares: 1000,
              percentage: 40,
              last_updated_at: "2026-01-10T10:00:00.000Z",
            },
            {
              shareholder_id: "",
              shares: 500,
              percentage: 20,
              last_updated_at: "2026-01-10T10:00:00.000Z",
            },
          ],
        };
      }

      if (query.includes("FROM governance_documents")) {
        return {
          rows: [
            {
              document_id: "doc-1",
              document_type: "AG_PV",
              linked_assembly_id: null,
              created_at: "2026-01-12T08:00:00.000Z",
            },
            {
              document_id: "doc-2",
              document_type: "",
              linked_assembly_id: null,
              created_at: "2026-01-12T08:00:00.000Z",
            },
          ],
        };
      }

      if (query.includes("FROM investor_reports")) {
        return {
          rows: [
            {
              report_id: "rep-1",
              period: "2025-Q4",
              published_at: "2026-01-15T10:00:00.000Z",
            },
            {
              report_id: "rep-2",
              period: "INVALID",
              published_at: "2026-01-15T10:00:00.000Z",
            },
          ],
        };
      }

      if (query.includes("FROM investor_access_rights")) {
        return {
          rows: [
            {
              scope: "REPORTS_READ",
              granted_at: "2026-01-18T10:00:00.000Z",
            },
            {
              scope: "",
              granted_at: "2026-01-18T10:00:00.000Z",
            },
          ],
        };
      }

      if (query.includes("FROM investor_access_log")) {
        return {
          rows: [
            {
              investor_id: "investor-A",
              resource: "/reports/rep-1",
              accessed_at: "2026-01-19T10:00:00.000Z",
            },
            {
              investor_id: "investor-A",
              resource: "",
              accessed_at: "2026-01-19T10:00:00.000Z",
            },
          ],
        };
      }

      return { rows: [] };
    }),
  };

  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.slice(7);
    if (token.includes("coach")) {
      (req as any).user = { role: "COACH", tenantId: "tenant-A" };
      return next();
    }
    if (token.includes("investor")) {
      (req as any).user = {
        role: "INVESTOR",
        investorId: "investor-A",
        tenantId: "tenant-A",
        scopes: ["REPORTS_READ"],
      };
      return next();
    }

    return res.status(401).json({ error: "Invalid token" });
  });

  app.use(createInvestisseursApi({ db }));
  return app;
}

describe("E2E | Investisseurs | Data hygiene", () => {
  const app = createDataHygieneApp();

  it("filters malformed cap-table rows before API exposure", async () => {
    const res = await request(app)
      .get("/api/investisseurs/cap-table")
      .set("Authorization", "Bearer coach-token")
      .set("tenantId", "tenant-A");

    expect(res.status).toBe(200);
    expect(res.body.capTable).toHaveLength(1);
    expect(res.body.capTable[0].shareholderId).toBe("sh-1");
  });

  it("filters malformed governance documents before API exposure", async () => {
    const res = await request(app)
      .get("/api/investisseurs/documents")
      .set("Authorization", "Bearer coach-token")
      .set("tenantId", "tenant-A");

    expect(res.status).toBe(200);
    expect(res.body.documents).toHaveLength(1);
    expect(res.body.documents[0].documentId).toBe("doc-1");
  });

  it("filters malformed reports before API exposure", async () => {
    const res = await request(app)
      .get("/api/investisseurs/reports")
      .set("Authorization", "Bearer investor-token")
      .set("tenantId", "tenant-A");

    expect(res.status).toBe(200);
    expect(res.body.reports).toHaveLength(1);
    expect(res.body.reports[0].reportId).toBe("rep-1");
  });

  it("filters malformed access-right rows before API exposure", async () => {
    const res = await request(app)
      .get("/api/investisseurs/access-rights")
      .set("Authorization", "Bearer investor-token")
      .set("tenantId", "tenant-A");

    expect(res.status).toBe(200);
    expect(res.body.accessRights).toHaveLength(1);
    expect(res.body.accessRights[0].scope).toBe("REPORTS_READ");
  });

  it("filters malformed access-log rows before API exposure", async () => {
    const res = await request(app)
      .get("/api/investisseurs/access-log")
      .set("Authorization", "Bearer coach-token")
      .set("tenantId", "tenant-A");

    expect(res.status).toBe(200);
    expect(res.body.accessLog).toHaveLength(1);
    expect(res.body.accessLog[0].resource).toBe("/reports/rep-1");
  });
});
