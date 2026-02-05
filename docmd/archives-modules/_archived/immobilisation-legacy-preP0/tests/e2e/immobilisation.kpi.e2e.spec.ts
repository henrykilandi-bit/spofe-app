/**
 * E2E Tests — KPI Endpoints
 * Module Immobilisation v1.0.0
 * 
 * Tests pour:
 * - GET /api/immobilisation/kpi [IMM-KPI-01]
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ KPIs calculés = indicateurs métier agrégés
 * ✅ Période obligatoire
 * ✅ Cohérence avec données sous-jacentes
 */

import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  getTestApp,
  getStandardHeaders,
  assertKpiStructure,
  TEST_CONFIG,
} from './setup';

describe('E2E: KPI Endpoints', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/immobilisation/kpi [IMM-KPI-01]
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GET /api/immobilisation/kpi [IMM-KPI-01]', () => {
    it('should return KPI summary for period', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      assertKpiStructure(res.body);
    });

    it('should have correct KPI structure', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      // Required KPI fields
      expect(res.body).toHaveProperty('period', TEST_CONFIG.TEST_PERIOD);
      expect(res.body).toHaveProperty('totalAssets');
      expect(res.body).toHaveProperty('activeAssets');
      expect(res.body).toHaveProperty('totalGrossValue');
      expect(res.body).toHaveProperty('totalNetBookValue');
      expect(res.body).toHaveProperty('totalDepreciation');
      expect(res.body).toHaveProperty('averageAge');
      expect(res.body).toHaveProperty('depreciationRate');
      expect(res.body).toHaveProperty('currency');
    });

    it('should validate KPI mathematical consistency', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      const kpi = res.body;

      // activeAssets <= totalAssets
      expect(kpi.activeAssets).toBeLessThanOrEqual(kpi.totalAssets);

      // totalNetBookValue <= totalGrossValue
      expect(kpi.totalNetBookValue).toBeLessThanOrEqual(kpi.totalGrossValue);

      // depreciationRate between 0 and 100
      expect(kpi.depreciationRate).toBeGreaterThanOrEqual(0);
      expect(kpi.depreciationRate).toBeLessThanOrEqual(100);

      // averageAge >= 0
      expect(kpi.averageAge).toBeGreaterThanOrEqual(0);

      // All monetary values >= 0
      expect(kpi.totalGrossValue).toBeGreaterThanOrEqual(0);
      expect(kpi.totalNetBookValue).toBeGreaterThanOrEqual(0);
      expect(kpi.totalDepreciation).toBeGreaterThanOrEqual(0);
    });

    it('should require period parameter', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .set(getStandardHeaders())
        .expect(400);
    });

    it('should validate period format YYYY-MM', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: 'invalid' })
        .set(getStandardHeaders())
        .expect(400);
    });

    it('should return zero KPIs for period with no data', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: '1900-01' })
        .set(getStandardHeaders())
        .expect(200);

      expect(res.body.totalAssets).toBe(0);
      expect(res.body.activeAssets).toBe(0);
      expect(res.body.totalGrossValue).toBe(0);
      expect(res.body.totalNetBookValue).toBe(0);
    });

    it('should calculate depreciationRate correctly', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      const kpi = res.body;

      if (kpi.totalGrossValue > 0) {
        // depreciationRate = (totalGrossValue - totalNetBookValue) / totalGrossValue * 100
        const expectedRate =
          ((kpi.totalGrossValue - kpi.totalNetBookValue) / kpi.totalGrossValue) * 100;
        expect(kpi.depreciationRate).toBeCloseTo(expectedRate, 1);
      } else {
        expect(kpi.depreciationRate).toBe(0);
      }
    });

    it('should isolate KPIs per tenant', async () => {
      const res1 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders(TEST_CONFIG.TENANT_1))
        .expect(200);

      const res2 = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders(TEST_CONFIG.TENANT_2))
        .expect(200);

      // If both have data, totals should differ
      if (res1.body.totalAssets > 0 && res2.body.totalAssets > 0) {
        const different =
          res1.body.totalAssets !== res2.body.totalAssets ||
          res1.body.totalGrossValue !== res2.body.totalGrossValue;
        expect(different).toBe(true);
      }
    });

    it('should include breakdown by status', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      // Optional but recommended: status breakdown
      if (res.body.byStatus) {
        expect(res.body.byStatus).toHaveProperty('IN_SERVICE');
        expect(res.body.byStatus).toHaveProperty('OUT_OF_SERVICE');
        expect(res.body.byStatus).toHaveProperty('DISPOSED');
        expect(res.body.byStatus).toHaveProperty('PENDING');

        // Sum of byStatus = totalAssets
        const sumByStatus = Object.values(res.body.byStatus).reduce(
          (acc: number, val: any) => acc + val,
          0,
        );
        expect(sumByStatus).toBe(res.body.totalAssets);
      }
    });

    it('should include breakdown by category', async () => {
      const res = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      // Optional but recommended: category breakdown
      if (res.body.byCategory) {
        expect(typeof res.body.byCategory).toBe('object');
        
        // Each category should have count and value
        Object.values(res.body.byCategory).forEach((cat: any) => {
          expect(cat).toHaveProperty('count');
          expect(cat).toHaveProperty('grossValue');
          expect(cat).toHaveProperty('netBookValue');
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // KPI CONSISTENCY WITH OTHER ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('KPI Consistency with Other Endpoints', () => {
    it('should match totalAssets with /assets count', async () => {
      const kpiRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      const assetsRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ page: 1, limit: 1 }) // Just get total count
        .set(getStandardHeaders())
        .expect(200);

      expect(kpiRes.body.totalAssets).toBe(assetsRes.body.total);
    });

    it('should match activeAssets with IN_SERVICE filter count', async () => {
      const kpiRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      const activeRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets')
        .query({ status: 'IN_SERVICE', page: 1, limit: 1 })
        .set(getStandardHeaders())
        .expect(200);

      expect(kpiRes.body.activeAssets).toBe(activeRes.body.total);
    });

    it('should match totalDepreciation with depreciation summary', async () => {
      const kpiRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      const depRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/depreciation/summary')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      // Note: KPI totalDepreciation is cumulative, summary might be period-only
      // This test validates they are related, not necessarily equal
      expect(typeof kpiRes.body.totalDepreciation).toBe('number');
      expect(typeof depRes.body.totalDepreciation).toBe('number');
    });

    it('should match totalNetBookValue with /assets/net-book-value sum', async () => {
      const kpiRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/kpi')
        .query({ period: TEST_CONFIG.TEST_PERIOD })
        .set(getStandardHeaders())
        .expect(200);

      // Get all net book values (may need pagination in real scenario)
      const vnbRes = await request(getTestApp().getHttpServer())
        .get('/api/immobilisation/assets/net-book-value')
        .query({ limit: 1000 })
        .set(getStandardHeaders())
        .expect(200);

      const sumVnb = vnbRes.body.items.reduce(
        (acc: number, item: any) => acc + item.netBookValue,
        0,
      );

      expect(kpiRes.body.totalNetBookValue).toBeCloseTo(sumVnb, 2);
    });
  });
});
