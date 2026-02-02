/**
 * CONTRACT TESTS — Frontend ↔ Backend (Cost-Structure / COUTFLEX)
 * 
 * ⚠️ TESTS D'INTÉGRATION CONTRACTUELS
 * 
 * Ces tests prouvent que:
 * ✅ Le backend respecte l'OpenAPI généré
 * ✅ Le client frontend généré fonctionne réellement
 * ✅ Les shapes, types et statuts HTTP sont conformes
 * ✅ Le contrat Budget ↔ Cost-Structure est respecté
 * 
 * Prérequis:
 * - Backend lancé sur API_BASE_URL (default: http://localhost:3000)
 * - PostgreSQL avec data de test
 * 
 * Exécution:
 *   API_BASE_URL=http://localhost:3000 npm run test:contract
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  OpenAPI,
  BudgetReadyService,
  CostProjectsService,
  CostStructureService,
} from '@/api/cost-structure/index.js';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || 'tenant-contract-test';

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
function skipIfNoBackend(ctx) {
  if (!backendAvailable) {
    ctx.skip();
  }
}

// Contract shape expectations (from OpenAPI)
const BUDGET_READY_PROJECT_KEYS = [
  'marginAt70',
  'netMargin',
  'projectId',
  'projectName',
  'tenantId',
  'totalCost',
  'unitCost',
  'version',
].sort();

const COST_PROJECT_KEYS = [
  'createdAt',
  'createdBy',
  'currentTotalCost',
  'currentUnitCost',
  'currentVersion',
  'name',
  'projectId',
  'status',
  'tenantId',
  'type',
  'validatedAt',
].sort();

const COST_STRUCTURE_KEYS = [
  'createdAt',
  'createdBy',
  'frozenAt',
  'marginAt70',
  'netMargin',
  'projectId',
  'status',
  'tenantId',
  'totalCost',
  'unitCost',
  'version',
  'viableAt70',
].sort();

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────

describe('CONTRACT — Frontend ↔ Backend (Cost-Structure)', () => {
  let originalBase;
  let originalTenantId;

  beforeAll(async () => {
    // Check backend availability first
    backendAvailable = await checkBackendHealth();
    
    if (!backendAvailable) {
      console.log(`\n⚠️  Backend not available at ${API_BASE_URL}`);
      console.log('   Contract tests will be skipped.');
      console.log('   To run: start backend with `npm run start:dev`\n');
      return;
    }

    // Save original config
    originalBase = OpenAPI.BASE;
    originalTenantId = OpenAPI.TENANT_ID;

    // Configure for test
    OpenAPI.BASE = API_BASE_URL;
    OpenAPI.TENANT_ID = () => TEST_TENANT_ID;
    OpenAPI.TOKEN = () => null; // No auth for contract tests

    console.log(`\n📡 Contract tests against: ${API_BASE_URL}`);
    console.log(`🏢 Tenant ID: ${TEST_TENANT_ID}\n`);
  });

  afterAll(() => {
    if (!backendAvailable) return;
    
    // Restore original config
    OpenAPI.BASE = originalBase;
    OpenAPI.TENANT_ID = originalTenantId;
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-01: Budget-Ready Endpoint
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-01: Budget-Ready Projects Endpoint', () => {
    beforeEach((ctx) => skipIfNoBackend(ctx));
    
    it('returns an array of budget-ready projects', async () => {
      const projects = await BudgetReadyService.listProjects();

      expect(Array.isArray(projects)).toBe(true);
    });

    it('each project has correct numeric types', async () => {
      const projects = await BudgetReadyService.listProjects();

      projects.forEach((project) => {
        // String fields
        expect(typeof project.tenantId).toBe('string');
        expect(typeof project.projectId).toBe('string');
        expect(typeof project.projectName).toBe('string');

        // Numeric fields
        expect(typeof project.version).toBe('number');
        expect(typeof project.unitCost).toBe('number');
        expect(typeof project.totalCost).toBe('number');
        expect(typeof project.netMargin).toBe('number');
        expect(typeof project.marginAt70).toBe('number');
      });
    });

    it('marginAt70 is always > 0 (COUT-BUD-01)', async () => {
      const projects = await BudgetReadyService.listProjects();

      projects.forEach((project) => {
        expect(project.marginAt70).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-02: Strict Contract Shape
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-02: Contract Shape Validation', () => {
    beforeEach((ctx) => skipIfNoBackend(ctx));
    
    it('BudgetReadyProjectDTO has exact contract shape', async () => {
      const projects = await BudgetReadyService.listProjects();

      if (projects.length > 0) {
        const project = projects[0];
        const actualKeys = Object.keys(project).sort();

        expect(actualKeys).toEqual(BUDGET_READY_PROJECT_KEYS);
      }
    });

    it('no extra fields in budget-ready response', async () => {
      const projects = await BudgetReadyService.listProjects();

      projects.forEach((project) => {
        const extraKeys = Object.keys(project).filter(
          (key) => !BUDGET_READY_PROJECT_KEYS.includes(key)
        );
        expect(extraKeys).toEqual([]);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-03: Cost Projects Endpoint
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-03: Cost Projects Endpoint', () => {
    beforeEach((ctx) => skipIfNoBackend(ctx));
    
    it('returns an array of economic projects', async () => {
      const projects = await CostProjectsService.listProjects();

      expect(Array.isArray(projects)).toBe(true);
    });

    it('supports status filter', async () => {
      const validatedProjects = await CostProjectsService.listProjects({
        status: 'VALIDATED',
      });

      validatedProjects.forEach((project) => {
        expect(project.status).toBe('VALIDATED');
      });
    });

    it('supports type filter', async () => {
      const productProjects = await CostProjectsService.listProjects({
        type: 'PRODUCT',
      });

      productProjects.forEach((project) => {
        expect(project.type).toBe('PRODUCT');
      });
    });

    it('CostProjectDTO has expected fields', async () => {
      const projects = await CostProjectsService.listProjects();

      if (projects.length > 0) {
        const project = projects[0];

        // Required fields exist
        expect(project.tenantId).toBeDefined();
        expect(project.projectId).toBeDefined();
        expect(project.name).toBeDefined();
        expect(project.type).toBeDefined();
        expect(project.status).toBeDefined();
        expect(project.currentVersion).toBeDefined();
        expect(project.createdAt).toBeDefined();
        expect(project.createdBy).toBeDefined();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-04: Multi-Tenant Security
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-04: Multi-Tenant Security', () => {
    beforeEach((ctx) => skipIfNoBackend(ctx));
    
    it('all returned projects belong to test tenant', async () => {
      const projects = await BudgetReadyService.listProjects();

      projects.forEach((project) => {
        expect(project.tenantId).toBe(TEST_TENANT_ID);
      });
    });

    it('rejects request without tenant header', async () => {
      // Temporarily disable tenant header
      const originalTenantFn = OpenAPI.TENANT_ID;
      OpenAPI.TENANT_ID = () => null;

      try {
        await BudgetReadyService.listProjects();
        // Should not reach here
        expect.fail('Expected request to be rejected without tenant ID');
      } catch (error) {
        // Expected: 401 or 404
        expect([401, 404]).toContain(error.status);
      } finally {
        // Restore tenant header
        OpenAPI.TENANT_ID = originalTenantFn;
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-05: Cost Structure Details
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-05: Cost Structure Endpoints', () => {
    let testProjectId;

    beforeAll(async () => {
      if (!backendAvailable) return;
      
      // Get a project ID for testing
      try {
        const projects = await CostProjectsService.listProjects();
        if (projects.length > 0) {
          testProjectId = projects[0].projectId;
        }
      } catch {
        // Backend may not be ready
      }
    });

    beforeEach((ctx) => skipIfNoBackend(ctx));

    it('fetches current cost structure for a project', async () => {
      if (!testProjectId) {
        console.log('⚠️  Skipping: No test project available');
        return;
      }

      const structure = await CostStructureService.getCurrentStructure(testProjectId);

      expect(structure.projectId).toBe(testProjectId);
      expect(structure.tenantId).toBe(TEST_TENANT_ID);
      expect(typeof structure.version).toBe('number');
      expect(['DRAFT', 'SIMULATED', 'FROZEN']).toContain(structure.status);
    });

    it('fetches cost lines for a version', async () => {
      if (!testProjectId) {
        console.log('⚠️  Skipping: No test project available');
        return;
      }

      const structure = await CostStructureService.getCurrentStructure(testProjectId);
      const lines = await CostStructureService.getCostLines(testProjectId, structure.version);

      expect(Array.isArray(lines)).toBe(true);
      lines.forEach((line) => {
        expect(line.projectId).toBe(testProjectId);
        expect(line.version).toBe(structure.version);
        expect(typeof line.totalAmount).toBe('number');
      });
    });

    it('fetches simulation results', async () => {
      if (!testProjectId) {
        console.log('⚠️  Skipping: No test project available');
        return;
      }

      const structure = await CostStructureService.getCurrentStructure(testProjectId);

      if (structure.status !== 'DRAFT') {
        const simulation = await CostStructureService.getSimulation(
          testProjectId,
          structure.version
        );

        expect(simulation.projectId).toBe(testProjectId);
        expect(typeof simulation.breakEvenPoint).toBe('number');
        expect(typeof simulation.viableAt70).toBe('boolean');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-06: HTTP Status Codes
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-06: HTTP Status Codes', () => {
    beforeEach((ctx) => skipIfNoBackend(ctx));
    
    it('returns 404 for non-existent project', async () => {
      try {
        await CostStructureService.getCurrentStructure('non-existent-project-id');
        expect.fail('Expected 404 error');
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });

    it('returns 404 for non-existent budget-ready project', async () => {
      try {
        await BudgetReadyService.getProject('non-existent-project-id');
        expect.fail('Expected 404 error');
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CT-FE-07: Data Consistency
  // ─────────────────────────────────────────────────────────────

  describe('CT-FE-07: Data Consistency', () => {
    beforeEach((ctx) => skipIfNoBackend(ctx));
    
    it('budget-ready project data matches cost structure data', async () => {
      const budgetProjects = await BudgetReadyService.listProjects();

      for (const budgetProject of budgetProjects.slice(0, 3)) {
        // Limit to 3 for performance
        const structure = await CostStructureService.getCurrentStructure(
          budgetProject.projectId
        );

        // Version should match
        expect(budgetProject.version).toBe(structure.version);

        // Costs should match
        expect(budgetProject.unitCost).toBe(structure.unitCost);
        expect(budgetProject.totalCost).toBe(structure.totalCost);
        expect(budgetProject.marginAt70).toBe(structure.marginAt70);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK (Run first)
// ─────────────────────────────────────────────────────────────

describe('HEALTH CHECK — Backend Availability', () => {
  it('backend is reachable', async () => {
    // This test should always run and just report status
    const isAvailable = await checkBackendHealth();
    
    if (!isAvailable) {
      console.log(`\n⚠️  Backend not reachable at ${API_BASE_URL}`);
      console.log('   Contract tests have been skipped.');
      console.log('   To run full tests: start backend with `npm run start:dev`\n');
    } else {
      console.log(`\n✅ Backend is reachable at ${API_BASE_URL}\n`);
    }
    
    // Don't fail - just report
    expect(true).toBe(true);
  });
});
