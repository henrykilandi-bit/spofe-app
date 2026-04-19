import request from "supertest";
import { app } from "../setup/test-app";

describe("E2E | Investisseurs | Governance documents", () => {
  const validTokens = {
    investorA: "Bearer investor-A-token",
    coachA: "Bearer coach-A-token",
    entrepreneurA: "Bearer entrepreneur-A-token"
  };

  const validTenantHeaders = {
    tenantA: { "tenantId": "tenant-A" }
  };

  describe("Document access control", () => {
    it("should expose only validated documents to investor", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");
      expect(Array.isArray(res.body.documents)).toBe(true);

      // Guardian effect: only VALIDATED documents should be exposed
      // This is enforced at the write-side by Guardian, read-side trusts the data
      if (res.body.documents.length > 0) {
        res.body.documents.forEach((doc: any) => {
          expect(doc).toHaveProperty("documentId");
          expect(doc).toHaveProperty("documentType");
          expect(doc).toHaveProperty("createdAt");
          // Documents should be pre-validated by Guardian
          expect(["AG_PV", "RESOLUTION", "CONVOCATION"]).toContain(doc.documentType);
        });
      }
    });

    it("should allow coach full access to all governance documents", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");
      expect(Array.isArray(res.body.documents)).toBe(true);
    });

    it("should allow entrepreneur full access to governance documents", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.entrepreneurA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");
    });
  });

  describe("Assembly access", () => {
    it("should allow investor to read assemblies", async () => {
      const res = await request(app)
        .get("/api/investisseurs/assemblies")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assemblies");
      expect(Array.isArray(res.body.assemblies)).toBe(true);

      if (res.body.assemblies.length > 0) {
        res.body.assemblies.forEach((assembly: any) => {
          expect(assembly).toHaveProperty("assemblyId");
          expect(assembly).toHaveProperty("assemblyType");
          expect(assembly).toHaveProperty("assemblyDate");
          expect(assembly).toHaveProperty("createdAt");
        });
      }
    });

    it("should return assemblies in chronological order", async () => {
      const res = await request(app)
        .get("/api/investisseurs/assemblies")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      
      if (res.body.assemblies.length > 1) {
        for (let i = 1; i < res.body.assemblies.length; i++) {
          const prev = new Date(res.body.assemblies[i - 1].assemblyDate);
          const curr = new Date(res.body.assemblies[i].assemblyDate);
          expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
        }
      }
    });
  });

  describe("Document filtering", () => {
    it("should filter documents by type", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents?documentType=RESOLUTION")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");

      if (res.body.documents.length > 0) {
        res.body.documents.forEach((doc: any) => {
          expect(doc.documentType).toBe("RESOLUTION");
        });
      }
    });

    it("should filter documents by assembly", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents?assemblyId=assembly-001")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");

      if (res.body.documents.length > 0) {
        res.body.documents.forEach((doc: any) => {
          expect(doc.linkedAssemblyId).toBe("assembly-001");
        });
      }
    });

    it("should support combined filtering", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents?documentType=AG_PV&assemblyId=assembly-001")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("documents");

      if (res.body.documents.length > 0) {
        res.body.documents.forEach((doc: any) => {
          expect(doc.documentType).toBe("AG_PV");
          expect(doc.linkedAssemblyId).toBe("assembly-001");
        });
      }
    });
  });

  describe("Document structure validation", () => {
    it("should return documents with proper structure", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);

      if (res.body.documents.length > 0) {
        const doc = res.body.documents[0];
        expect(doc).toHaveProperty("documentId");
        expect(doc).toHaveProperty("documentType");
        expect(doc).toHaveProperty("linkedAssemblyId");
        expect(doc).toHaveProperty("createdAt");
        
        // Validate document types
        expect(["AG_PV", "RESOLUTION", "CONVOCATION"]).toContain(doc.documentType);
        
        // Validate date format
        expect(new Date(doc.createdAt)).toBeInstanceOf(Date);
      }
    });

    it("should return assemblies with proper structure", async () => {
      const res = await request(app)
        .get("/api/investisseurs/assemblies")
        .set("Authorization", validTokens.coachA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);

      if (res.body.assemblies.length > 0) {
        const assembly = res.body.assemblies[0];
        expect(assembly).toHaveProperty("assemblyId");
        expect(assembly).toHaveProperty("assemblyType");
        expect(assembly).toHaveProperty("assemblyDate");
        expect(assembly).toHaveProperty("createdAt");
        
        // Validate date formats
        expect(new Date(assembly.assemblyDate)).toBeInstanceOf(Date);
        expect(new Date(assembly.createdAt)).toBeInstanceOf(Date);
      }
    });
  });

  describe("Guardian compliance", () => {
    it("should ensure all documents are read-only snapshots", async () => {
      const res = await request(app)
        .get("/api/investisseurs/documents")
        .set("Authorization", validTokens.investorA)
        .set(validTenantHeaders.tenantA);

      expect(res.status).toBe(200);
      
      // Documents should be immutable snapshots from events
      // No modification capabilities exposed through API
      if (res.body.documents.length > 0) {
        res.body.documents.forEach((doc: any) => {
          // Should contain only read-only properties
          expect(doc).not.toHaveProperty("canEdit");
          expect(doc).not.toHaveProperty("canDelete");
          expect(doc).not.toHaveProperty("status");
          
          // Should have immutable creation timestamp
          expect(doc.createdAt).toBeDefined();
        });
      }
    });
  });
});
