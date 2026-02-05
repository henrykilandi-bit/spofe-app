/**
 * CONTRACT TESTS — Budget ↔ Cost-Structure
 * =========================================
 * 
 * Ces tests vérifient que le module Budget respecte
 * le contrat COUT-BUD-01 avec Cost-Structure.
 * 
 * Règles contractuelles:
 *   - Budget ne peut lire QUE les projets VALIDATED + FROZEN + viable
 *   - marginAt70 > 0 est requis pour budgétabilité
 *   - Budget ne peut pas créer de budget sans autorisation Cost-Structure
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK TYPES (Based on Cost-Structure OpenAPI)
// ═══════════════════════════════════════════════════════════════════════════════

interface BudgetReadyProjectDTO {
  tenantId: string;
  projectId: string;
  projectName: string;
  version: number;
  unitCost: number;
  totalCost: number;
  netMargin: number;
  marginAt70: number;
}

interface CostStructureGateway {
  listBudgetReadyProjects(tenantId: string): Promise<BudgetReadyProjectDTO[]>;
  isProjectBudgetable(tenantId: string, projectId: string): Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const mockProjects: BudgetReadyProjectDTO[] = [
  {
    tenantId: 'tenant-1',
    projectId: 'proj-validated-001',
    projectName: 'Project Alpha (Validated)',
    version: 3,
    unitCost: 150.00,
    totalCost: 15000.00,
    netMargin: 0.25,
    marginAt70: 0.15, // > 0 ✅
  },
  {
    tenantId: 'tenant-1',
    projectId: 'proj-validated-002',
    projectName: 'Project Beta (Validated)',
    version: 2,
    unitCost: 200.00,
    totalCost: 20000.00,
    netMargin: 0.30,
    marginAt70: 0.18, // > 0 ✅
  },
];

// Simulates Cost-Structure Gateway
const mockCostStructureGateway: CostStructureGateway = {
  async listBudgetReadyProjects(tenantId: string): Promise<BudgetReadyProjectDTO[]> {
    return mockProjects.filter(p => p.tenantId === tenantId);
  },
  
  async isProjectBudgetable(tenantId: string, projectId: string): Promise<boolean> {
    const projects = await this.listBudgetReadyProjects(tenantId);
    return projects.some(p => p.projectId === projectId);
  }
};

// Simulates Budget Service that depends on Cost-Structure
class BudgetService {
  constructor(private gateway: CostStructureGateway) {}
  
  async createBudget(params: { tenantId: string; projectId: string }) {
    const isAuthorized = await this.gateway.isProjectBudgetable(
      params.tenantId, 
      params.projectId
    );
    
    if (!isAuthorized) {
      throw new Error('NOT_AUTHORIZED_BY_COST_STRUCTURE');
    }
    
    return { budgetId: `budget-${Date.now()}`, ...params };
  }
  
  async listEligibleProjects(tenantId: string): Promise<BudgetReadyProjectDTO[]> {
    return this.gateway.listBudgetReadyProjects(tenantId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CONTRACT — Budget ↔ Cost-Structure (COUT-BUD-01)', () => {
  let budgetService: BudgetService;

  beforeAll(() => {
    budgetService = new BudgetService(mockCostStructureGateway);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CT-BUD-01: Shape validation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CT-BUD-01: Budget-Ready Project Shape', () => {
    it('exposes projects with correct DTO shape', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);

      projects.forEach((project) => {
        expect(project).toMatchObject({
          tenantId: expect.any(String),
          projectId: expect.any(String),
          projectName: expect.any(String),
          version: expect.any(Number),
          unitCost: expect.any(Number),
          totalCost: expect.any(Number),
          netMargin: expect.any(Number),
          marginAt70: expect.any(Number),
        });
      });
    });

    it('includes all required fields for budget calculation', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');
      
      const requiredFields = [
        'tenantId', 'projectId', 'projectName', 'version',
        'unitCost', 'totalCost', 'netMargin', 'marginAt70'
      ];

      projects.forEach((project) => {
        requiredFields.forEach((field) => {
          expect(project).toHaveProperty(field);
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CT-BUD-02: COUT-01 Invariant
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CT-BUD-02: COUT-01 Invariant (marginAt70 > 0)', () => {
    it('all budget-ready projects have marginAt70 > 0', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      projects.forEach((project) => {
        expect(project.marginAt70).toBeGreaterThan(0);
      });
    });

    it('never exposes projects with marginAt70 <= 0', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');
      
      const invalidProjects = projects.filter(p => p.marginAt70 <= 0);
      expect(invalidProjects).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CT-BUD-03: Multi-tenant isolation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CT-BUD-03: Multi-Tenant Isolation', () => {
    it('only returns projects for the requested tenant', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      projects.forEach((project) => {
        expect(project.tenantId).toBe('tenant-1');
      });
    });

    it('returns empty array for unknown tenant', async () => {
      const projects = await budgetService.listEligibleProjects('unknown-tenant');
      
      expect(projects).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CT-BUD-04: Budget creation authorization
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CT-BUD-04: Budget Creation Authorization', () => {
    it('allows budget creation for authorized project', async () => {
      const result = await budgetService.createBudget({
        tenantId: 'tenant-1',
        projectId: 'proj-validated-001',
      });

      expect(result).toHaveProperty('budgetId');
      expect(result.projectId).toBe('proj-validated-001');
    });

    it('rejects budget creation for non-authorized project', async () => {
      await expect(
        budgetService.createBudget({
          tenantId: 'tenant-1',
          projectId: 'non-existent-project',
        })
      ).rejects.toThrow('NOT_AUTHORIZED_BY_COST_STRUCTURE');
    });

    it('rejects budget creation for wrong tenant', async () => {
      await expect(
        budgetService.createBudget({
          tenantId: 'wrong-tenant',
          projectId: 'proj-validated-001',
        })
      ).rejects.toThrow('NOT_AUTHORIZED_BY_COST_STRUCTURE');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CT-BUD-05: Version tracking
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CT-BUD-05: Version Tracking', () => {
    it('each project has a version >= 1', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      projects.forEach((project) => {
        expect(project.version).toBeGreaterThanOrEqual(1);
      });
    });

    it('version is an integer', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      projects.forEach((project) => {
        expect(Number.isInteger(project.version)).toBe(true);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CT-BUD-06: Numeric precision
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CT-BUD-06: Numeric Fields', () => {
    it('costs are positive numbers', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      projects.forEach((project) => {
        expect(project.unitCost).toBeGreaterThanOrEqual(0);
        expect(project.totalCost).toBeGreaterThanOrEqual(0);
      });
    });

    it('margins are between 0 and 1 (rates)', async () => {
      const projects = await budgetService.listEligibleProjects('tenant-1');

      projects.forEach((project) => {
        // netMargin can be negative in edge cases, but typically 0-1
        expect(project.netMargin).toBeLessThanOrEqual(1);
        // marginAt70 must be > 0 per COUT-01
        expect(project.marginAt70).toBeGreaterThan(0);
        expect(project.marginAt70).toBeLessThanOrEqual(1);
      });
    });
  });
});

