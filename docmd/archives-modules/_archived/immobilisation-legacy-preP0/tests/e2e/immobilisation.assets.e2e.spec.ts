/**
 * E2E Tests — Assets Endpoints
 * Module Immobilisation v1.0.0
 * 
 * Tests contractuels pour:
 * - GET /api/immobilisation/assets
 * - GET /api/immobilisation/assets/net-book-value
 * - GET /api/immobilisation/assets/:assetId
 * - GET /api/immobilisation/assets/:assetId/depreciation
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ Valide routing HTTP
 * ✅ Valide structure payload
 * ✅ Valide isolation multi-tenant
 * ❌ Aucune logique métier testée
 */

import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  getTestApp,
  getStandardHeaders,
  assertPaginatedResponse,
  assertAssetStructure,
  assertDepreciationHistoryItem,
  TEST_CONFIG,
} from './setup';

describe('E2E: Assets Endpoints', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/immobilisation/assets
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/assets', () => {
    it('should return paginated list of assets for tenant', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      if (res.body.items.length > 0) {
        res.body.items.forEach((asset: any) => {
          assertAssetStructure(asset);
        });
      }
    });

    it('should respect pagination parameters', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ page: 1, limit: 5 })
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
      expect(res.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should filter by status IN_SERVICE', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ status: 'IN_SERVICE' })
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      res.body.items.forEach((asset: any) => {
        expect(asset.status).toBe('IN_SERVICE');
      });
    });

    it('should filter by status DISPOSED', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ status: 'DISPOSED' })
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      res.body.items.forEach((asset: any) => {
        expect(asset.status).toBe('DISPOSED');
      });
    });

    it('should return different results for different tenants', async () => {
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      // Assets should be different across tenants
      const ids1 = res1.body.items.map((a: any) => a.assetId);
      const ids2 = res2.body.items.map((a: any) => a.assetId);
      
      // No overlap expected
      const overlap = ids1.filter((id: string) => ids2.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/immobilisation/assets/net-book-value
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/assets/net-book-value', () => {
    it('should return paginated list of net book values', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets/net-book-value')
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      if (res.body.items.length > 0) {
        res.body.items.forEach((nbv: any) => {
          expect(nbv).toHaveProperty('assetId');
          expect(nbv).toHaveProperty('acquisitionCost');
          expect(nbv).toHaveProperty('residualValue');
          expect(nbv).toHaveProperty('accumulatedDepreciation');
          expect(nbv).toHaveProperty('netBookValue');
          expect(nbv).toHaveProperty('currency');
          expect(nbv).toHaveProperty('status');
        });
      }
    });

    it('should filter by specific assetId', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets/net-book-value')
        .query({ assetId: TEST_CONFIG.ASSET_ID_1 })
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      res.body.items.forEach((nbv: any) => {
        expect(nbv.assetId).toBe(TEST_CONFIG.ASSET_ID_1);
      });
    });

    it('should validate netBookValue = acquisitionCost - accumulatedDepreciation', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets/net-book-value')
        .set(getStandardHeaders())
        .expect(200);

      res.body.items.forEach((nbv: any) => {
        // VNC = Coût acquisition - Amortissements cumulés
        const expectedNbv = nbv.acquisitionCost - nbv.accumulatedDepreciation;
        expect(nbv.netBookValue).toBeCloseTo(expectedNbv, 2);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/immobilisation/assets/:assetId
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/assets/:assetId', () => {
    it('should return asset detail with all sub-resources', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${TEST_CONFIG.ASSET_ID_1}`)
        .set(getStandardHeaders())
        .expect(200);

      // Verify main asset
      expect(res.body).toHaveProperty('asset');
      assertAssetStructure(res.body.asset);
      expect(res.body.asset.assetId).toBe(TEST_CONFIG.ASSET_ID_1);

      // Verify net book value
      expect(res.body).toHaveProperty('netBookValue');
      expect(res.body.netBookValue).toHaveProperty('netBookValue');

      // Verify arrays
      expect(res.body).toHaveProperty('depreciationHistory');
      expect(Array.isArray(res.body.depreciationHistory)).toBe(true);

      expect(res.body).toHaveProperty('maintenanceHistory');
      expect(Array.isArray(res.body.maintenanceHistory)).toBe(true);

      expect(res.body).toHaveProperty('allocations');
      expect(Array.isArray(res.body.allocations)).toBe(true);
    });

    it('should return 404 for non-existent asset', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets/non-existent-asset-id')
        .set(getStandardHeaders())
        .expect(404);
    });

    it('should not return asset from different tenant', async () => {
      // Asset belongs to TENANT_1, requesting with TENANT_2
      await request(getTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${TEST_CONFIG.ASSET_ID_1}`)
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/immobilisation/assets/:assetId/depreciation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/assets/:assetId/depreciation', () => {
    it('should return paginated depreciation history', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${TEST_CONFIG.ASSET_ID_1}/depreciation`)
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      if (res.body.items.length > 0) {
        res.body.items.forEach((item: any) => {
          assertDepreciationHistoryItem(item);
        });
      }
    });

    it('should filter by period range', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${TEST_CONFIG.ASSET_ID_1}/depreciation`)
        .query({
          fromPeriod: TEST_CONFIG.TEST_PERIOD_FROM,
          toPeriod: TEST_CONFIG.TEST_PERIOD_TO,
        })
        .set(getStandardHeaders())
        .expect(200);

      assertPaginatedResponse(res.body);
      
      res.body.items.forEach((item: any) => {
        expect(item.period >= TEST_CONFIG.TEST_PERIOD_FROM).toBe(true);
        expect(item.period <= TEST_CONFIG.TEST_PERIOD_TO).toBe(true);
      });
    });

    it('should validate accumulated depreciation is monotonically increasing', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get(`/api/immobilisation/assets/${TEST_CONFIG.ASSET_ID_1}/depreciation`)
        .set(getStandardHeaders())
        .expect(200);

      const items = res.body.items.sort((a: any, b: any) => 
        a.period.localeCompare(b.period)
      );

      for (let i = 1; i < items.length; i++) {
        expect(items[i].accumulatedDepreciation)
          .toBeGreaterThanOrEqual(items[i - 1].accumulatedDepreciation);
      }
    });
  });
});
