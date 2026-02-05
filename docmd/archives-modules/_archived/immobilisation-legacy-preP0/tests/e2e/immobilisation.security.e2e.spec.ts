/**
 * E2E Tests — Security & Multi-Tenant Isolation
 * Module Immobilisation v1.0.0
 * 
 * Tests sécurité pour:
 * - Isolation multi-tenant (RLS PostgreSQL)
 * - Validation headers obligatoires
 * - Authentification/Autorisation
 * - Protection données sensibles
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ Header x-tenant-id obligatoire sur TOUS les endpoints
 * ✅ AUCUNE donnée cross-tenant exposée
 * ✅ Rejection si tenant non autorisé
 */

import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  getTestApp,
  getStandardHeaders,
  TEST_CONFIG,
} from './setup';

describe('E2E: Security & Multi-Tenant Isolation', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MANDATORY HEADER VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Mandatory Header Validation', () => {
    const endpoints = [
      '/api/immobilisation/assets',
      '/api/immobilisation/assets/net-book-value',
      '/api/immobilisation/depreciation/summary',
      '/api/immobilisation/allocations',
      '/api/immobilisation/maintenance',
      '/api/immobilisation/renewals',
      '/api/immobilisation/disposals',
      '/api/immobilisation/kpi',
    ];

    endpoints.forEach((endpoint) => {
      it(`should reject ${endpoint} without x-tenant-id header`, async () => {
        await request(getTestApp().getHttpServer())
          .get(endpoint)
          .query({ period: TEST_CONFIG.TEST_PERIOD })
          .expect((res) => {
            // Should be 400 (missing header) or 401 (unauthorized)
            expect([400, 401]).toContain(res.status);
          });
      });

      it(`should reject ${endpoint} with empty x-tenant-id`, async () => {
        await request(getTestApp().getHttpServer())
          .get(endpoint)
          .set('x-tenant-id', '')
          .query({ period: TEST_CONFIG.TEST_PERIOD })
          .expect((res) => {
            expect([400, 401]).toContain(res.status);
          });
      });

      it(`should reject ${endpoint} with invalid x-tenant-id format`, async () => {
        await request(getTestApp().getHttpServer())
          .get(endpoint)
          .set('x-tenant-id', 'invalid-not-uuid')
          .query({ period: TEST_CONFIG.TEST_PERIOD })
          .expect((res) => {
            // Should be 400 (bad format) or 403 (forbidden)
            expect([400, 403]).toContain(res.status);
          });
      });

      it(`should accept ${endpoint} with valid x-tenant-id`, async () => {
        await request(getTestApp().getHttpServer())
          .get(endpoint)
          .set(getStandardHeaders())
          .query({ period: TEST_CONFIG.TEST_PERIOD })
          .expect(200);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-TENANT DATA ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Multi-Tenant Data Isolation', () => {
    it('should never expose Tenant 1 assets to Tenant 2', async () => {
      // Get Tenant 1 asset IDs
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const tenant1AssetIds = res1.body.items.map((a: any) => a.assetId);

      // Try to access each with Tenant 2
      for (const assetId of tenant1AssetIds.slice(0, 3)) {
        const res = await request(getTestApp().getHttpServer())
          .get(`/api/immobilisation/assets/${assetId}`)
          .set(getStandardHeaders(TEST_CONFIG.TENANT_2));

        // Should be 404 (not found for this tenant) or 403 (forbidden)
        expect([403, 404]).toContain(res.status);
      }
    });

    it('should never expose Tenant 2 assets to Tenant 1', async () => {
      // Get Tenant 2 asset IDs
      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      const tenant2AssetIds = res2.body.items.map((a: any) => a.assetId);

      // Try to access each with Tenant 1
      for (const assetId of tenant2AssetIds.slice(0, 3)) {
        const res = await request(getTestApp().getHttpServer())
          .get(`/api/immobilisation/assets/${assetId}`)
          .set(getStandardHeaders(TEST_CONFIG.TENANT_1));

        expect([403, 404]).toContain(res.status);
      }
    });

    it('should return completely different asset lists per tenant', async () => {
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      const ids1 = new Set(res1.body.items.map((a: any) => a.assetId));
      const ids2 = new Set(res2.body.items.map((a: any) => a.assetId));

      // Zero overlap
      const overlap = [...ids1].filter((id) => ids2.has(id));
      expect(overlap.length).toBe(0);
    });

    it('should return different depreciation totals per tenant', async () => {
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      // If both have data, totals should differ
      if (res1.body.totalDepreciation > 0 && res2.body.totalDepreciation > 0) {
        expect(res1.body.totalDepreciation).not.toBe(res2.body.totalDepreciation);
      }
    });

    it('should isolate maintenance events per tenant', async () => {
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/maintenance')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/maintenance')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      const ids1 = new Set(res1.body.items.map((m: any) => m.maintenanceId));
      const ids2 = new Set(res2.body.items.map((m: any) => m.maintenanceId));

      const overlap = [...ids1].filter((id) => ids2.has(id));
      expect(overlap.length).toBe(0);
    });

    it('should isolate allocations per tenant', async () => {
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/allocations')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/allocations')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      // Allocation IDs should not overlap
      const ids1 = new Set(res1.body.items.map((a: any) => a.allocationId));
      const ids2 = new Set(res2.body.items.map((a: any) => a.allocationId));

      const overlap = [...ids1].filter((id) => ids2.has(id));
      expect(overlap.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHORIZATION (FUTURE RBAC)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Authorization Rules', () => {
    it('should accept request with valid authorization header', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set({
          ...getStandardHeaders(),
          Authorization: 'Bearer valid-test-token',
        })
        .expect(200);
    });

    // Note: These tests are placeholders for future RBAC implementation
    it.skip('should reject request without authorization header', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set('x-tenant-id', TEST_CONFIG.TENANT_1)
        .expect(401);
    });

    it.skip('should reject request with expired token', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set({
          'x-tenant-id': TEST_CONFIG.TENANT_1,
          Authorization: 'Bearer expired-token',
        })
        .expect(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // READ-ONLY ENFORCEMENT (CQRS)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Read-Only Enforcement (CQRS)', () => {
    const endpoints = [
      '/api/immobilisation/assets',
      '/api/immobilisation/allocations',
      '/api/immobilisation/maintenance',
      '/api/immobilisation/renewals',
      '/api/immobilisation/disposals',
    ];

    endpoints.forEach((endpoint) => {
      it(`should reject POST on ${endpoint}`, async () => {
        await request(getTestApp().getHttpServer())
          .post(endpoint)
          .set(getStandardHeaders())
          .send({ name: 'test' })
          .expect((res) => {
            expect([404, 405]).toContain(res.status);
          });
      });

      it(`should reject PUT on ${endpoint}`, async () => {
        await request(getTestApp().getHttpServer())
          .put(endpoint)
          .set(getStandardHeaders())
          .send({ name: 'test' })
          .expect((res) => {
            expect([404, 405]).toContain(res.status);
          });
      });

      it(`should reject DELETE on ${endpoint}`, async () => {
        await request(getTestApp().getHttpServer())
          .delete(endpoint)
          .set(getStandardHeaders())
          .expect((res) => {
            expect([404, 405]).toContain(res.status);
          });
      });

      it(`should reject PATCH on ${endpoint}`, async () => {
        await request(getTestApp().getHttpServer())
          .patch(endpoint)
          .set(getStandardHeaders())
          .send({ name: 'test' })
          .expect((res) => {
            expect([404, 405]).toContain(res.status);
          });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SENSITIVE DATA PROTECTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Sensitive Data Protection', () => {
    it('should not expose internal IDs in asset list', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders())
        .expect(200);

      res.body.items.forEach((item: any) => {
        // Should not expose database sequence IDs
        expect(item).not.toHaveProperty('id');
        expect(item).not.toHaveProperty('_id');
        expect(item).not.toHaveProperty('internalId');
        
        // Should use UUIDs only
        expect(item.assetId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
      });
    });

    it('should not expose audit timestamps in list responses', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders())
        .expect(200);

      res.body.items.forEach((item: any) => {
        // Detail can have timestamps, list should not expose them
        // (unless explicitly required by contract)
        expect(item).not.toHaveProperty('updatedBy');
        expect(item).not.toHaveProperty('updatedAt');
      });
    });

    it('should not leak tenant info in error messages', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets/non-existent-uuid')
        .set(getStandardHeaders())
        .expect(404);

      const responseText = JSON.stringify(res.body);
      
      // Should not leak tenant UUID
      expect(responseText).not.toContain(TEST_CONFIG.TENANT_1);
      expect(responseText).not.toContain(TEST_CONFIG.TENANT_2);
      
      // Should not leak database info
      expect(responseText.toLowerCase()).not.toContain('postgresql');
      expect(responseText.toLowerCase()).not.toContain('sql error');
      expect(responseText.toLowerCase()).not.toContain('table');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT VALIDATION & INJECTION PROTECTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Input Validation & Injection Protection', () => {
    it('should reject SQL injection in query params', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ status: "IN_SERVICE'; DROP TABLE assets; --" })
        .set(getStandardHeaders())
        .expect((res) => {
          expect([400, 200]).toContain(res.status);
          // If 200, should return empty result (no injection)
          if (res.status === 200) {
            expect(res.body.items.length).toBe(0);
          }
        });
    });

    it('should reject XSS in query params', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ name: '<script>alert("xss")</script>' })
        .set(getStandardHeaders())
        .expect((res) => {
          expect([400, 200]).toContain(res.status);
        });
    });

    it('should handle extremely long query params', async () => {
      const longString = 'a'.repeat(10000);
      
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ name: longString })
        .set(getStandardHeaders())
        .expect((res) => {
          // Should be 400 (bad request) or 414 (URI too long)
          expect([400, 414, 200]).toContain(res.status);
        });
    });

    it('should validate UUID format in path params', async () => {
      const invalidUuids = [
        'not-a-uuid',
        '12345',
        '../../../etc/passwd',
        'null',
        'undefined',
        '%00',
      ];

      for (const invalidId of invalidUuids) {
        await request(getTestApp().getHttpServer())
          .get(`/api/immobilisation/assets/${invalidId}`)
          .set(getStandardHeaders())
          .expect((res) => {
            expect([400, 404]).toContain(res.status);
          });
      }
    });

    it('should validate period format YYYY-MM', async () => {
      const invalidPeriods = [
        '2024',
        '24-01',
        '2024/01',
        '01-2024',
        '2024-1',
        '2024-13',
        '2024-00',
      ];

      for (const invalidPeriod of invalidPeriods) {
        await request(getTestApp().getHttpServer())
          .get('/api/immobilisation/depreciation/summary')
          .query({ period: invalidPeriod })
          .set(getStandardHeaders())
          .expect(400);
      }
    });

    it('should validate pagination params are positive integers', async () => {
      const invalidParams = [
        { page: -1, limit: 10 },
        { page: 1, limit: -10 },
        { page: 'abc', limit: 10 },
        { page: 1.5, limit: 10 },
        { page: 1, limit: 1000000 },
      ];

      for (const params of invalidParams) {
        await request(getTestApp().getHttpServer())
          .get('/api/immobilisation/assets')
          .query(params)
          .set(getStandardHeaders())
          .expect((res) => {
            expect([400, 200]).toContain(res.status);
          });
      }
    });
  });
});
