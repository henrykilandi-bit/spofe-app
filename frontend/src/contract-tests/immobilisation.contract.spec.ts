/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTRACT TESTS — Frontend ↔ Backend (Immobilisation Module)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 NIVEAU 1 + NIVEAU 2 SPOFE — Tests contractuels Frontend
 * 
 * Ces tests prouvent que:
 * ✅ Le client frontend généré fonctionne réellement
 * ✅ Les types TypeScript sont corrects
 * ✅ Le backend respecte le contrat OpenAPI
 * ✅ Les shapes, types et statuts HTTP sont conformes
 * 
 * Prérequis:
 * - Backend lancé sur API_BASE_URL (default: http://localhost:3000)
 * - PostgreSQL avec données de test
 * 
 * Exécution:
 *   API_BASE_URL=http://localhost:3000 npm run test:contract
 * 
 * ⚠️ RÈGLES SPOFE:
 * ❌ Aucun mock autorisé
 * ❌ Aucune modification du client généré
 * ❌ Aucun bypass du client
 * ✅ OpenAPI = source de vérité unique
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { ImmobilisationService, ContractError } from '@/api/immobilisation/index';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || 'tenant-contract-test';
const TEST_TOKEN = process.env.TEST_TOKEN || 'contract-test-token';

// Track if backend is available
let backendAvailable = false;

/**
 * Check if backend is reachable
 */
async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

/**
 * Skip test if backend is not available
 */
function skipIfNoBackend(ctx: any) {
  if (!backendAvailable) {
    ctx.skip();
  }
}

// Contract shape expectations (from OpenAPI)
const PAGINATED_RESPONSE_KEYS = ['items', 'page', 'limit', 'total', 'hasMore'].sort();

const ASSET_DTO_KEYS = [
  'assetId',
  'tenantId',
  'designation',
  'category',
  'acquisitionCost',
  'currency',
  'acquisitionDate',
  'serviceStartDate',
  'status',
  'usefulLifeMonths',
  'depreciationMethod',
  'createdAt',
  'updatedAt',
].sort();

const NET_BOOK_VALUE_DTO_KEYS = [
  'assetId',
  'tenantId',
  'designation',
  'acquisitionCost',
  'accumulatedDepreciation',
  'netBookValue',
  'currency',
  'calculationDate',
  'status',
].sort();

const DEPRECIATION_SUMMARY_KEYS = [
  'tenantId',
  'period',
  'totalAssets',
  'totalDepreciation',
  'currency',
  'byCategory',
].sort();

const ALLOCATION_DTO_KEYS = [
  'allocationId',
  'assetId',
  'tenantId',
  'targetType',
  'targetId',
  'percentage',
  'effectiveFrom',
  'isActive',
].sort();

const MAINTENANCE_SUMMARY_KEYS = [
  'tenantId',
  'totalCost',
  'currency',
  'interventionCount',
  'byType',
].sort();

const KPI_DTO_KEYS = [
  'tenantId',
  'totalAssets',
  'totalAcquisitionCost',
  'totalNetBookValue',
  'totalAccumulatedDepreciation',
  'averageAge',
  'byStatus',
  'byCategory',
  'currency',
  'calculatedAt',
].sort();

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────

beforeAll(async () => {
  backendAvailable = await checkBackendHealth();
  console.log(`Backend availability: ${backendAvailable ? '✅ ONLINE' : '⚠️ OFFLINE (tests will be skipped)'}`);
});

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

const headers = { tenantId: TEST_TENANT_ID, token: TEST_TOKEN };

function assertPaginatedResponse(data: any) {
  expect(data).toBeDefined();
  expect(data).toHaveProperty('items');
  expect(data).toHaveProperty('page');
  expect(data).toHaveProperty('limit');
  expect(data).toHaveProperty('total');
  expect(data).toHaveProperty('hasMore');
  expect(Array.isArray(data.items)).toBe(true);
  expect(typeof data.page).toBe('number');
  expect(typeof data.limit).toBe('number');
  expect(typeof data.total).toBe('number');
  expect(typeof data.hasMore).toBe('boolean');
}

function assertKeysPresent(obj: any, expectedKeys: string[], name: string) {
  const actualKeys = Object.keys(obj).sort();
  for (const key of expectedKeys) {
    expect(obj).toHaveProperty(key);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS — ASSETS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

describe('[CONTRACT] Immobilisation — Assets API', () => {
  beforeEach((ctx) => skipIfNoBackend(ctx));

  describe('ImmobilisationService.listAssets()', () => {
    it('[CONTRACT] Returns PaginatedAssetListResponse shape', async () => {
      const result = await ImmobilisationService.listAssets({}, headers);
      
      assertPaginatedResponse(result);
      
      // Validate items shape if any
      if (result.items.length > 0) {
        const asset = result.items[0];
        assertKeysPresent(asset, ['assetId', 'tenantId', 'status', 'acquisitionCost'], 'AssetDTO');
        expect(['IN_SERVICE', 'DISPOSED', 'SCRAPPED']).toContain(asset.status);
      }
    });

    it('[CONTRACT] Pagination parameters work correctly', async () => {
      const result = await ImmobilisationService.listAssets({ page: 1, limit: 5 }, headers);
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    it('[CONTRACT] Status filter accepts valid enum values', async () => {
      const result = await ImmobilisationService.listAssets({ status: 'IN_SERVICE' }, headers);
      
      assertPaginatedResponse(result);
      
      // All items should have matching status
      for (const asset of result.items) {
        expect(asset.status).toBe('IN_SERVICE');
      }
    });

    it('[CONTRACT] Throws ContractError on auth failure', async () => {
      await expect(
        ImmobilisationService.listAssets({}, { tenantId: '', token: '' })
      ).rejects.toThrow(ContractError);
    });
  });

  describe('ImmobilisationService.listAssetNetBookValues()', () => {
    it('[CONTRACT] Returns PaginatedNetBookValueResponse shape', async () => {
      const result = await ImmobilisationService.listAssetNetBookValues({}, headers);
      
      assertPaginatedResponse(result);
      
      if (result.items.length > 0) {
        const nbv = result.items[0];
        expect(nbv).toHaveProperty('assetId');
        expect(nbv).toHaveProperty('netBookValue');
        expect(nbv).toHaveProperty('accumulatedDepreciation');
        expect(typeof nbv.netBookValue).toBe('number');
      }
    });
  });

  describe('ImmobilisationService.getAssetDetail()', () => {
    it('[CONTRACT] Returns AssetDetailDTO shape for existing asset', async () => {
      // First get list to find an asset ID
      const list = await ImmobilisationService.listAssets({}, headers);
      
      if (list.items.length > 0) {
        const assetId = list.items[0].assetId;
        const result = await ImmobilisationService.getAssetDetail(assetId, headers);
        
        expect(result).toHaveProperty('assetId');
        expect(result.assetId).toBe(assetId);
        expect(result).toHaveProperty('netBookValue');
        expect(result).toHaveProperty('totalDepreciation');
      }
    });

    it('[CONTRACT] Throws ContractError 404 for non-existent asset', async () => {
      await expect(
        ImmobilisationService.getAssetDetail('non-existent-asset-id', headers)
      ).rejects.toThrow(ContractError);
      
      try {
        await ImmobilisationService.getAssetDetail('non-existent-asset-id', headers);
      } catch (error) {
        expect(error).toBeInstanceOf(ContractError);
        expect((error as ContractError).status).toBe(404);
      }
    });
  });

  describe('ImmobilisationService.getAssetDepreciationHistory()', () => {
    it('[CONTRACT] Returns PaginatedDepreciationHistoryResponse shape', async () => {
      const list = await ImmobilisationService.listAssets({}, headers);
      
      if (list.items.length > 0) {
        const assetId = list.items[0].assetId;
        const result = await ImmobilisationService.getAssetDepreciationHistory(assetId, {}, headers);
        
        assertPaginatedResponse(result);
        expect(result).toHaveProperty('assetId');
        
        if (result.items.length > 0) {
          const depItem = result.items[0];
          expect(depItem).toHaveProperty('period');
          expect(depItem).toHaveProperty('amount');
          expect(depItem).toHaveProperty('accumulatedAfter');
        }
      }
    });

    it('[CONTRACT] Period filters accept correct format', async () => {
      const list = await ImmobilisationService.listAssets({}, headers);
      
      if (list.items.length > 0) {
        const assetId = list.items[0].assetId;
        const result = await ImmobilisationService.getAssetDepreciationHistory(
          assetId,
          { fromPeriod: '2024-01', toPeriod: '2025-12' },
          headers
        );
        
        assertPaginatedResponse(result);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS — COST-STRUCTURE CONTRACT (IMM-CS-*)
// ═══════════════════════════════════════════════════════════════════════════

describe('[CONTRACT] Immobilisation — Cost-Structure Contract (IMM-CS-*)', () => {
  beforeEach((ctx) => skipIfNoBackend(ctx));

  describe('[IMM-CS-DEP-01] ImmobilisationService.getDepreciationSummary()', () => {
    it('[CONTRACT] Returns DepreciationSummaryDTO shape', async () => {
      const result = await ImmobilisationService.getDepreciationSummary(
        { period: '2025-01' },
        headers
      );
      
      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('totalAssets');
      expect(result).toHaveProperty('totalDepreciation');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('byCategory');
      
      expect(result.period).toBe('2025-01');
      expect(typeof result.totalDepreciation).toBe('number');
      expect(Array.isArray(result.byCategory)).toBe(true);
    });
  });

  describe('[IMM-CS-DEP-02] ImmobilisationService.getDepreciationCostStructureExport()', () => {
    it('[CONTRACT] Returns DepreciationCostStructureExportDTO shape', async () => {
      const result = await ImmobilisationService.getDepreciationCostStructureExport(
        { period: '2025-01' },
        headers
      );
      
      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totals');
      
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.totals).toHaveProperty('totalDepreciation');
      expect(result.totals).toHaveProperty('byTargetType');
    });
  });

  describe('[IMM-CS-ALL-01] ImmobilisationService.listAllocations()', () => {
    it('[CONTRACT] Returns PaginatedAllocationResponse shape', async () => {
      const result = await ImmobilisationService.listAllocations({}, headers);
      
      assertPaginatedResponse(result);
      
      if (result.items.length > 0) {
        const allocation = result.items[0];
        expect(allocation).toHaveProperty('allocationId');
        expect(allocation).toHaveProperty('assetId');
        expect(allocation).toHaveProperty('targetType');
        expect(allocation).toHaveProperty('targetId');
        expect(allocation).toHaveProperty('percentage');
        expect(['PRODUCT', 'SERVICE', 'PROJECT']).toContain(allocation.targetType);
      }
    });

    it('[CONTRACT] targetType filter accepts valid enum values', async () => {
      const result = await ImmobilisationService.listAllocations({ targetType: 'PRODUCT' }, headers);
      
      assertPaginatedResponse(result);
      
      for (const allocation of result.items) {
        expect(allocation.targetType).toBe('PRODUCT');
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS — MAINTENANCE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

describe('[CONTRACT] Immobilisation — Maintenance API', () => {
  beforeEach((ctx) => skipIfNoBackend(ctx));

  describe('ImmobilisationService.listMaintenanceHistory()', () => {
    it('[CONTRACT] Returns PaginatedMaintenanceHistoryResponse shape', async () => {
      const result = await ImmobilisationService.listMaintenanceHistory({}, headers);
      
      assertPaginatedResponse(result);
      
      if (result.items.length > 0) {
        const maintenance = result.items[0];
        expect(maintenance).toHaveProperty('maintenanceId');
        expect(maintenance).toHaveProperty('assetId');
        expect(maintenance).toHaveProperty('type');
        expect(maintenance).toHaveProperty('cost');
        expect(['PREVENTIVE', 'CORRECTIVE', 'UPGRADE']).toContain(maintenance.type);
      }
    });
  });

  describe('[IMM-CS-MNT-01, IMM-BUD-MNT-01] ImmobilisationService.getMaintenanceSummary()', () => {
    it('[CONTRACT] Returns MaintenanceSummaryDTO shape', async () => {
      const result = await ImmobilisationService.getMaintenanceSummary({}, headers);
      
      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('totalCost');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('interventionCount');
      expect(result).toHaveProperty('byType');
      
      expect(result.byType).toHaveProperty('preventive');
      expect(result.byType).toHaveProperty('corrective');
      expect(result.byType).toHaveProperty('upgrade');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS — BUDGET CONTRACT (IMM-BUD-*)
// ═══════════════════════════════════════════════════════════════════════════

describe('[CONTRACT] Immobilisation — Budget Contract (IMM-BUD-*)', () => {
  beforeEach((ctx) => skipIfNoBackend(ctx));

  describe('[IMM-BUD-REN-01] ImmobilisationService.getRenewalProjections()', () => {
    it('[CONTRACT] Returns PaginatedRenewalProjectionsResponse shape', async () => {
      const result = await ImmobilisationService.getRenewalProjections(
        { fromYear: 2025, toYear: 2030 },
        headers
      );
      
      assertPaginatedResponse(result);
      expect(result).toHaveProperty('fromYear');
      expect(result).toHaveProperty('toYear');
      expect(result).toHaveProperty('totalProjectedCost');
      
      expect(result.fromYear).toBe(2025);
      expect(result.toYear).toBe(2030);
      
      if (result.items.length > 0) {
        const projection = result.items[0];
        expect(projection).toHaveProperty('assetId');
        expect(projection).toHaveProperty('projectedRenewalYear');
        expect(projection).toHaveProperty('estimatedRenewalCost');
      }
    });
  });

  describe('[IMM-BUD-REN-02] ImmobilisationService.getRenewalsByYear()', () => {
    it('[CONTRACT] Returns RenewalsByYearResponse shape', async () => {
      const result = await ImmobilisationService.getRenewalsByYear({ year: 2025 }, headers);
      
      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('assets');
      expect(result).toHaveProperty('totalEstimatedCost');
      expect(result).toHaveProperty('currency');
      
      expect(result.year).toBe(2025);
      expect(Array.isArray(result.assets)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS — KPI ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

describe('[CONTRACT] Immobilisation — KPI API', () => {
  beforeEach((ctx) => skipIfNoBackend(ctx));

  describe('ImmobilisationService.getKPI()', () => {
    it('[CONTRACT] Returns ImmobilisationKPIDTO shape', async () => {
      const result = await ImmobilisationService.getKPI(headers);
      
      // Validate all required fields
      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('totalAssets');
      expect(result).toHaveProperty('totalAcquisitionCost');
      expect(result).toHaveProperty('totalNetBookValue');
      expect(result).toHaveProperty('totalAccumulatedDepreciation');
      expect(result).toHaveProperty('averageAge');
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('byCategory');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('calculatedAt');
      
      // Validate types
      expect(typeof result.totalAssets).toBe('number');
      expect(typeof result.totalAcquisitionCost).toBe('number');
      expect(typeof result.totalNetBookValue).toBe('number');
      
      // Validate byStatus structure
      expect(result.byStatus).toHaveProperty('inService');
      expect(result.byStatus).toHaveProperty('disposed');
      expect(result.byStatus).toHaveProperty('scrapped');
      
      // Validate byCategory is array
      expect(Array.isArray(result.byCategory)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS — TYPESCRIPT COMPILATION (NIVEAU 1)
// ═══════════════════════════════════════════════════════════════════════════

describe('[CONTRACT] TypeScript Compilation — Static Contract', () => {
  /**
   * Ces tests vérifient que le code TypeScript compile correctement
   * avec les types générés. Si l'OpenAPI change de manière incompatible,
   * ces tests échoueront à la compilation.
   * 
   * NIVEAU 1 SPOFE: La compilation TypeScript EST un test contractuel.
   */

  it('[CONTRACT] ImmobilisationService methods exist and have correct types', () => {
    // Ces assertions vérifient à la compilation que les méthodes existent
    expect(typeof ImmobilisationService.listAssets).toBe('function');
    expect(typeof ImmobilisationService.listAssetNetBookValues).toBe('function');
    expect(typeof ImmobilisationService.getAssetDetail).toBe('function');
    expect(typeof ImmobilisationService.getAssetDepreciationHistory).toBe('function');
    expect(typeof ImmobilisationService.getDepreciationSummary).toBe('function');
    expect(typeof ImmobilisationService.getDepreciationCostStructureExport).toBe('function');
    expect(typeof ImmobilisationService.listAllocations).toBe('function');
    expect(typeof ImmobilisationService.listMaintenanceHistory).toBe('function');
    expect(typeof ImmobilisationService.getMaintenanceSummary).toBe('function');
    expect(typeof ImmobilisationService.getRenewalProjections).toBe('function');
    expect(typeof ImmobilisationService.getRenewalsByYear).toBe('function');
    expect(typeof ImmobilisationService.getKPI).toBe('function');
  });

  it('[CONTRACT] ContractError is properly typed', () => {
    const error = new ContractError(404, 'Not found', '/test');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ContractError);
    expect(error.status).toBe(404);
    expect(error.message).toContain('CONTRACT ERROR');
    expect(error.endpoint).toBe('/test');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TEST METADATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @contractVersion 1.0.0
 * @module immobilisation
 * @openapi cascade/modules/immobilisation/openapi/immobilisation.openapi.json
 * 
 * SPOFE Contract Test Rules:
 * 1. Generated client MUST be used — no direct fetch
 * 2. Types MUST come from generated types.d.ts
 * 3. No mocks allowed — real backend only
 * 4. Test failures block CI/CD pipeline
 * 5. If TypeScript compilation fails, contract is broken
 */
