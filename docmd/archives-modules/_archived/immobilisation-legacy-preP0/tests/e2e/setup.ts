/**
 * E2E Tests Setup — Module Immobilisation v1.0.0
 * 
 * Configuration commune pour tous les tests E2E API (GET).
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ PostgreSQL réel (pas de mock)
 * ✅ Multi-tenant testé
 * ✅ Read-only uniquement
 * ❌ Aucun test write-side ici
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ImmobilisationReadModule } from '../../api/immobilisation.module';
import { Pool } from 'pg';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const TEST_CONFIG = {
  // Tenants de test (correspondent au seed.sql)
  TENANT_1: 'tenant-e2e-001',
  TENANT_2: 'tenant-e2e-002',
  
  // Auth token de test
  AUTH_TOKEN: 'Bearer test-token-e2e',
  
  // Assets de test (correspondent au seed.sql)
  ASSET_ID_1: 'asset-e2e-001-001',
  ASSET_ID_2: 'asset-e2e-001-002',
  ASSET_ID_TENANT_2: 'asset-e2e-002-001',
  
  // Périodes de test (correspondent au seed.sql)
  TEST_PERIOD: '2024-06',
  TEST_PERIOD_FROM: '2024-01',
  TEST_PERIOD_TO: '2024-12',
  
  // Années de test
  TEST_YEAR: 2024,
  TEST_YEAR_FROM: 2024,
  TEST_YEAR_TO: 2030,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://spofe:spofe@localhost:5432/spofe_test',
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST APP FACTORY
// ═══════════════════════════════════════════════════════════════════════════

let app: INestApplication | null = null;
let pool: Pool | null = null;

/**
 * Create and initialize the test application
 */
export async function createTestApp(): Promise<INestApplication> {
  if (app) return app;

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [ImmobilisationReadModule],
  })
    .overrideProvider('DATABASE_POOL')
    .useFactory({
      factory: () => {
        pool = new Pool({ connectionString: TEST_CONFIG.DATABASE_URL });
        return pool;
      },
    })
    .compile();

  app = moduleRef.createNestApplication();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  
  await app.init();
  return app;
}

/**
 * Close the test application
 */
export async function closeTestApp(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (app) {
    await app.close();
    app = null;
  }
}

/**
 * Get the test application instance
 */
export function getTestApp(): INestApplication {
  if (!app) {
    throw new Error('Test app not initialized. Call createTestApp() first.');
  }
  return app;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard headers for authenticated tenant requests
 */
export function getStandardHeaders(tenantId: string = TEST_CONFIG.TENANT_1) {
  return {
    'Authorization': TEST_CONFIG.AUTH_TOKEN,
    'X-Tenant-Id': tenantId,
  };
}

/**
 * Assert paginated response structure
 */
export function assertPaginatedResponse(body: any) {
  expect(body).toHaveProperty('items');
  expect(body).toHaveProperty('page');
  expect(body).toHaveProperty('limit');
  expect(body).toHaveProperty('total');
  expect(body).toHaveProperty('hasMore');
  expect(Array.isArray(body.items)).toBe(true);
  expect(typeof body.page).toBe('number');
  expect(typeof body.limit).toBe('number');
  expect(typeof body.total).toBe('number');
  expect(typeof body.hasMore).toBe('boolean');
}

/**
 * Assert asset structure
 */
export function assertAssetStructure(asset: any) {
  expect(asset).toHaveProperty('assetId');
  expect(asset).toHaveProperty('acquisitionCost');
  expect(asset).toHaveProperty('currency');
  expect(asset).toHaveProperty('acquisitionDate');
  expect(asset).toHaveProperty('usefulLifeMonths');
  expect(asset).toHaveProperty('depreciationMethod');
  expect(asset).toHaveProperty('residualValue');
  expect(asset).toHaveProperty('status');
  expect(asset).toHaveProperty('createdAt');
  expect(['IN_SERVICE', 'DISPOSED', 'SCRAPPED']).toContain(asset.status);
}

/**
 * Assert depreciation history item structure
 */
export function assertDepreciationHistoryItem(item: any) {
  expect(item).toHaveProperty('scheduleId');
  expect(item).toHaveProperty('period');
  expect(item).toHaveProperty('depreciationAmount');
  expect(item).toHaveProperty('accumulatedDepreciation');
  expect(item).toHaveProperty('netBookValue');
  expect(item).toHaveProperty('currency');
  expect(item).toHaveProperty('calculatedAt');
}

/**
 * Assert maintenance history item structure
 */
export function assertMaintenanceHistoryItem(item: any) {
  expect(item).toHaveProperty('maintenanceId');
  expect(item).toHaveProperty('assetId');
  expect(item).toHaveProperty('maintenanceType');
  expect(item).toHaveProperty('maintenanceDate');
  expect(item).toHaveProperty('description');
  expect(item).toHaveProperty('cost');
  expect(item).toHaveProperty('currency');
  expect(item).toHaveProperty('performedBy');
  expect(item).toHaveProperty('recordedAt');
}

/**
 * Assert allocation item structure
 */
export function assertAllocationItem(item: any) {
  expect(item).toHaveProperty('allocationId');
  expect(item).toHaveProperty('assetId');
  expect(item).toHaveProperty('targetType');
  expect(item).toHaveProperty('targetId');
  expect(item).toHaveProperty('percentage');
  expect(item).toHaveProperty('effectiveFrom');
  expect(['PRODUCT', 'SERVICE', 'PROJECT']).toContain(item.targetType);
}

/**
 * Assert renewal projection structure
 */
export function assertRenewalProjection(item: any) {
  expect(item).toHaveProperty('assetId');
  expect(item).toHaveProperty('acquisitionCost');
  expect(item).toHaveProperty('renewalDate');
  expect(item).toHaveProperty('renewalYear');
  expect(item).toHaveProperty('renewalMonth');
  expect(item).toHaveProperty('currency');
}

/**
 * Assert disposal history item structure
 */
export function assertDisposalHistoryItem(item: any) {
  expect(item).toHaveProperty('disposalId');
  expect(item).toHaveProperty('assetId');
  expect(item).toHaveProperty('disposalDate');
  expect(item).toHaveProperty('disposalType');
  expect(item).toHaveProperty('disposalValue');
  expect(item).toHaveProperty('netBookValue');
  expect(item).toHaveProperty('gainOrLoss');
  expect(item).toHaveProperty('currency');
  expect(item).toHaveProperty('disposedAt');
  expect(['SALE', 'SCRAP']).toContain(item.disposalType);
}

/**
 * Assert KPI structure
 */
export function assertKpiStructure(kpi: any) {
  expect(kpi).toHaveProperty('assetsInService');
  expect(kpi).toHaveProperty('assetsDisposed');
  expect(kpi).toHaveProperty('assetsScrapped');
  expect(kpi).toHaveProperty('totalAssets');
  expect(kpi).toHaveProperty('currency');
  expect(typeof kpi.assetsInService).toBe('number');
  expect(typeof kpi.assetsDisposed).toBe('number');
  expect(typeof kpi.assetsScrapped).toBe('number');
  expect(typeof kpi.totalAssets).toBe('number');
}
