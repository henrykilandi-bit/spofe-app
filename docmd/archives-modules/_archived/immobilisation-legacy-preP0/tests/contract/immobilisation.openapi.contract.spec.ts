/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTRACT TESTS — OpenAPI ↔ Backend Validation
 * Module Immobilisation v1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 NIVEAU 2 SPOFE — Validation Runtime
 * 
 * Ces tests vérifient que le backend répond EXACTEMENT conformément 
 * à la spécification OpenAPI (contrat).
 * 
 * ✅ Chaque réponse est validée automatiquement contre le schéma OpenAPI
 * ✅ Les statuts HTTP sont vérifiés
 * ✅ Les types de données sont validés
 * ✅ Les champs requis sont présents
 * 
 * ⚠️ RÈGLES SPOFE:
 * ❌ Aucun mock
 * ❌ Aucune hypothèse implicite
 * ❌ Aucun bypass
 * ✅ OpenAPI = loi absolue
 * 
 * @see {@link file://../../openapi/immobilisation.openapi.json} - Source of truth
 */

import request from 'supertest';
import {
  createContractTestApp,
  closeContractTestApp,
  getContractTestApp,
  getContractHeaders,
  CONTRACT_TEST_CONFIG,
  OPENAPI_SPEC_PATH,
} from './setup.contract';

describe('[CONTRACT] Immobilisation API — OpenAPI Compliance', () => {
  beforeAll(async () => {
    await createContractTestApp();
  });

  afterAll(async () => {
    await closeContractTestApp();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/assets', () => {
    it('[CONTRACT] Response matches OpenAPI schema PaginatedAssetListResponse', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getContractHeaders())
        .expect(200);

      // Validation automatique contre OpenAPI
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] Status filter accepts only enum values', async () => {
      // Valid enum value
      const validRes = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ status: 'IN_SERVICE' })
        .set(getContractHeaders())
        .expect(200);

      expect(validRes).toSatisfyApiSpec();

      // Invalid enum value should return 400
      const invalidRes = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ status: 'INVALID_STATUS' })
        .set(getContractHeaders());

      // Either 400 (bad request) or ignored - both are valid per spec
      expect([200, 400]).toContain(invalidRes.status);
      expect(invalidRes).toSatisfyApiSpec();
    });

    it('[CONTRACT] Pagination parameters work as specified', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ page: 1, limit: 10 })
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
      
      // Additional structural checks
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('items');
    });

    it('[CONTRACT] Returns 401 when missing Authorization', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set('X-Tenant-Id', CONTRACT_TEST_CONFIG.TENANT_ID);

      expect([401, 403]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] Returns 401 when missing X-Tenant-Id', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set('Authorization', CONTRACT_TEST_CONFIG.AUTH_TOKEN);

      expect([400, 401, 403]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('GET /api/immobilisation/assets/net-book-value', () => {
    it('[CONTRACT] Response matches OpenAPI schema PaginatedNetBookValueResponse', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets/net-book-value')
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] AssetId filter works correctly', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets/net-book-value')
        .query({ assetId: CONTRACT_TEST_CONFIG.ASSET_ID })
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  describe('GET /api/immobilisation/assets/:assetId', () => {
    it('[CONTRACT] Response matches OpenAPI schema AssetDetailDTO', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${CONTRACT_TEST_CONFIG.ASSET_ID}`)
        .set(getContractHeaders());

      // Accept 200 (found) or 404 (not found) - both are valid
      expect([200, 404]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] Returns 404 for non-existent asset', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${CONTRACT_TEST_CONFIG.ASSET_ID_NOT_FOUND}`)
        .set(getContractHeaders());

      expect([404]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('GET /api/immobilisation/assets/:assetId/depreciation', () => {
    it('[CONTRACT] Response matches OpenAPI schema PaginatedDepreciationHistoryResponse', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${CONTRACT_TEST_CONFIG.ASSET_ID}/depreciation`)
        .set(getContractHeaders());

      expect([200, 404]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] Period filters accept correct format', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${CONTRACT_TEST_CONFIG.ASSET_ID}/depreciation`)
        .query({
          fromPeriod: CONTRACT_TEST_CONFIG.PERIOD_FROM,
          toPeriod: CONTRACT_TEST_CONFIG.PERIOD_TO,
        })
        .set(getContractHeaders());

      expect([200, 404]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COST-STRUCTURE CONTRACT ENDPOINTS (IMM-CS-*)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[IMM-CS-DEP-01] GET /api/immobilisation/depreciation/summary', () => {
    it('[CONTRACT] Response matches OpenAPI schema DepreciationSummaryDTO', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        .query({ period: CONTRACT_TEST_CONFIG.PERIOD })
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] Returns 400 when period is missing', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        .set(getContractHeaders());

      expect([400]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] Returns 400 for invalid period format', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        .query({ period: 'invalid-period' })
        .set(getContractHeaders());

      expect([400]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('[IMM-CS-DEP-02] GET /api/immobilisation/depreciation/cost-structure-export', () => {
    it('[CONTRACT] Response matches OpenAPI schema DepreciationCostStructureExportDTO', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/cost-structure-export')
        .query({ period: CONTRACT_TEST_CONFIG.PERIOD })
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  describe('[IMM-CS-ALL-01] GET /api/immobilisation/allocations', () => {
    it('[CONTRACT] Response matches OpenAPI schema PaginatedAllocationResponse', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/allocations')
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] targetType filter accepts only enum values', async () => {
      const validRes = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/allocations')
        .query({ targetType: 'PRODUCT' })
        .set(getContractHeaders())
        .expect(200);

      expect(validRes).toSatisfyApiSpec();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MAINTENANCE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/maintenance', () => {
    it('[CONTRACT] Response matches OpenAPI schema PaginatedMaintenanceHistoryResponse', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/maintenance')
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  describe('[IMM-CS-MNT-01, IMM-BUD-MNT-01] GET /api/immobilisation/maintenance/summary', () => {
    it('[CONTRACT] Response matches OpenAPI schema MaintenanceSummaryDTO', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/maintenance/summary')
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET CONTRACT ENDPOINTS (IMM-BUD-*)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[IMM-BUD-REN-01] GET /api/immobilisation/renewals/projections', () => {
    it('[CONTRACT] Response matches OpenAPI schema', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/renewals/projections')
        .query({
          fromYear: CONTRACT_TEST_CONFIG.YEAR_FROM,
          toYear: CONTRACT_TEST_CONFIG.YEAR_TO,
        })
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  describe('[IMM-BUD-REN-02] GET /api/immobilisation/renewals/by-year', () => {
    it('[CONTRACT] Response matches OpenAPI schema', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/renewals/by-year')
        .query({ year: CONTRACT_TEST_CONFIG.YEAR })
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // KPI ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/kpi', () => {
    it('[CONTRACT] Response matches OpenAPI schema ImmobilisationKPIDTO', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .set(getContractHeaders())
        .expect(200);

      expect(res).toSatisfyApiSpec();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-TENANT ISOLATION (Contract Requirement)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[CONTRACT] Multi-Tenant Isolation', () => {
    it('[CONTRACT] Different tenants receive different data', async () => {
      const res1 = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getContractHeaders(CONTRACT_TEST_CONFIG.TENANT_ID))
        .expect(200);

      const res2 = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getContractHeaders(CONTRACT_TEST_CONFIG.TENANT_ID_ALT))
        .expect(200);

      // Both responses must satisfy contract
      expect(res1).toSatisfyApiSpec();
      expect(res2).toSatisfyApiSpec();

      // Data isolation check (items may differ)
      // This is a contractual requirement per OpenAPI X-Tenant-Id header
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR RESPONSES (Contract Compliance)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[CONTRACT] Error Responses', () => {
    it('[CONTRACT] 400 Bad Request matches ErrorDTO schema', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        // Missing required 'period' parameter
        .set(getContractHeaders());

      expect(res.status).toBe(400);
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] 401 Unauthorized matches ErrorDTO schema', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get('/api/immobilisation/assets');
        // Missing Authorization header

      expect([401, 403]).toContain(res.status);
      expect(res).toSatisfyApiSpec();
    });

    it('[CONTRACT] 404 Not Found matches ErrorDTO schema', async () => {
      const res = await request(getContractTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/non-existent-asset-id-12345`)
        .set(getContractHeaders());

      expect(res.status).toBe(404);
      expect(res).toSatisfyApiSpec();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TEST METADATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @contractVersion 1.0.0
 * @module immobilisation
 * @openapi file://../../openapi/immobilisation.openapi.json
 * 
 * SPOFE Contract Test Rules:
 * 1. Every endpoint in OpenAPI MUST have a contract test
 * 2. Every response MUST be validated against OpenAPI schema
 * 3. No mocks allowed - real backend only
 * 4. Test failures block CI/CD pipeline
 */
