/**
 * Cost-Structure Read-Models E2E Tests
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Test runner: Jest
 */

import { Pool } from 'pg';
import { CostStructureQueryRepository } from '../../infrastructure/cost-structure.query.repository';

describe('Cost-Structure Read-Models E2E', () => {
  let db: Pool;
  let queryRepo: CostStructureQueryRepository;

  const TENANT_1 = '11111111-1111-1111-1111-111111111111';
  const TENANT_2 = '22222222-2222-2222-2222-222222222222';
  const PROJECT_1 = '33333333-3333-3333-3333-333333333333';
  const PROJECT_2 = '44444444-4444-4444-4444-444444444444';

  beforeAll(async () => {
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'spofe_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    queryRepo = new CostStructureQueryRepository(db);

    // Clean up
    await db.query('DELETE FROM decision_records');
    await db.query('DELETE FROM cost_lines');
    await db.query('DELETE FROM cost_structure_versions');
    await db.query('DELETE FROM economic_projects');

    // Insert test data
    await seedTestData();
  });

  afterAll(async () => {
    await db.end();
  });

  /**
   * Seed test data
   */
  async function seedTestData() {
    // Tenant 1 - Project 1 (VALIDATED, viable)
    await db.query(`
      INSERT INTO economic_projects (project_id, tenant_id, name, type, status, current_version, created_by, created_at, validated_at)
      VALUES ($1, $2, 'Savon Premium', 'PRODUCT', 'VALIDATED', 1, 'user-1', NOW(), NOW())
    `, [PROJECT_1, TENANT_1]);

    await db.query(`
      INSERT INTO cost_structure_versions (
        project_id, version, status, created_at, frozen_at, frozen_by,
        price_target, expected_volume, capacity_max,
        scenario_pessimistic, scenario_realistic, scenario_optimistic,
        unit_cost, total_cost, gross_margin, net_margin, margin_at_70, viable_at_70, simulated_at
      ) VALUES ($1, 1, 'FROZEN', NOW(), NOW(), 'user-1', 1500, 1000, 1500, 800, 1000, 1200, 80, 8000, 60, 20, 10, true, NOW())
    `, [PROJECT_1]);

    await db.query(`
      INSERT INTO cost_lines (project_id, version, category, label, amount, currency, created_at)
      VALUES 
        ($1, 1, 'VARIABLE', 'Matière première', 5000, 'XAF', NOW()),
        ($1, 1, 'FIXED', 'Salaires', 2000, 'XAF', NOW()),
        ($1, 1, 'INDIRECT', 'Overhead', 1000, 'XAF', NOW())
    `, [PROJECT_1]);

    await db.query(`
      INSERT INTO decision_records (project_id, version, decision, decided_by, decided_at, justification)
      VALUES ($1, 1, 'VALIDATED', 'user-1', NOW(), 'Test 70% OK')
    `, [PROJECT_1]);

    // Tenant 2 - Project 2 (SIMULATED, not viable)
    await db.query(`
      INSERT INTO economic_projects (project_id, tenant_id, name, type, status, current_version, created_by, created_at)
      VALUES ($1, $2, 'Service Consulting', 'SERVICE', 'SIMULATED', 1, 'user-2', NOW())
    `, [PROJECT_2, TENANT_2]);

    await db.query(`
      INSERT INTO cost_structure_versions (
        project_id, version, status, created_at,
        price_target, expected_volume, capacity_max,
        scenario_pessimistic, scenario_realistic, scenario_optimistic,
        unit_cost, total_cost, gross_margin, net_margin, margin_at_70, viable_at_70, simulated_at
      ) VALUES ($1, 1, 'DRAFT', NOW(), 2000, 500, 800, 400, 500, 600, 150, 7500, 40, 10, -5, false, NOW())
    `, [PROJECT_2]);

    await db.query(`
      INSERT INTO cost_lines (project_id, version, category, label, amount, currency, created_at)
      VALUES ($1, 1, 'FIXED', 'Salaires consultants', 7000, 'XAF', NOW())
    `, [PROJECT_2]);
  }

  /**
   * Test Suite 1: rm_cost_projects
   */
  describe('rm_cost_projects - Liste des projets', () => {
    it('should list projects for tenant 1', async () => {
      const projects = await queryRepo.findAllProjects(TENANT_1);

      expect(projects).toHaveLength(1);
      expect(projects[0].projectId).toBe(PROJECT_1);
      expect(projects[0].name).toBe('Savon Premium');
      expect(projects[0].status).toBe('VALIDATED');
      expect(projects[0].currentVersion).toBe(1);
    });

    it('should list projects for tenant 2', async () => {
      const projects = await queryRepo.findAllProjects(TENANT_2);

      expect(projects).toHaveLength(1);
      expect(projects[0].projectId).toBe(PROJECT_2);
      expect(projects[0].name).toBe('Service Consulting');
      expect(projects[0].status).toBe('SIMULATED');
    });

    it('should enforce tenant isolation (RLS)', async () => {
      const projects = await queryRepo.findAllProjects(TENANT_1);

      // Tenant 1 should NOT see Tenant 2 projects
      const tenant2Project = projects.find((p) => p.projectId === PROJECT_2);
      expect(tenant2Project).toBeUndefined();
    });

    it('should find project by ID', async () => {
      const project = await queryRepo.findProjectById(TENANT_1, PROJECT_1);

      expect(project).not.toBeNull();
      expect(project!.name).toBe('Savon Premium');
      expect(project!.validatedAt).toBeDefined();
    });

    it('should return null for non-existent project', async () => {
      const project = await queryRepo.findProjectById(TENANT_1, 'non-existent');

      expect(project).toBeNull();
    });
  });

  /**
   * Test Suite 2: rm_cost_structure_current
   */
  describe('rm_cost_structure_current - Structure FROZEN courante', () => {
    it('should return FROZEN structure for project 1', async () => {
      const structure = await queryRepo.findCurrentCostStructure(TENANT_1, PROJECT_1);

      expect(structure).not.toBeNull();
      expect(structure!.version).toBe(1);
      expect(structure!.status).toBe('FROZEN');
      expect(structure!.frozenAt).toBeDefined();
      expect(structure!.frozenBy).toBe('user-1');
    });

    it('should return null for DRAFT structure (project 2)', async () => {
      const structure = await queryRepo.findCurrentCostStructure(TENANT_2, PROJECT_2);

      // Project 2 has DRAFT structure, not FROZEN
      expect(structure).toBeNull();
    });
  });

  /**
   * Test Suite 3: rm_cost_lines
   */
  describe('rm_cost_lines - Lignes de coût', () => {
    it('should return cost lines for project 1 version 1', async () => {
      const costLines = await queryRepo.findCostLines(TENANT_1, PROJECT_1, 1);

      expect(costLines).toHaveLength(3);
      expect(costLines[0].category).toBe('VARIABLE');
      expect(costLines[0].label).toBe('Matière première');
      expect(costLines[0].amount).toBe(5000);
      expect(costLines[1].category).toBe('FIXED');
      expect(costLines[2].category).toBe('INDIRECT');
    });

    it('should return cost lines for project 2 version 1', async () => {
      const costLines = await queryRepo.findCostLines(TENANT_2, PROJECT_2, 1);

      expect(costLines).toHaveLength(1);
      expect(costLines[0].category).toBe('FIXED');
      expect(costLines[0].label).toBe('Salaires consultants');
    });

    it('should enforce tenant isolation on cost lines', async () => {
      // Tenant 1 should NOT see Tenant 2 cost lines
      const costLines = await queryRepo.findCostLines(TENANT_1, PROJECT_2, 1);

      expect(costLines).toHaveLength(0);
    });
  });

  /**
   * Test Suite 4: rm_cost_simulation_results
   */
  describe('rm_cost_simulation_results - Résultats de simulation', () => {
    it('should return simulation results for project 1', async () => {
      const results = await queryRepo.findSimulationResults(TENANT_1, PROJECT_1, 1);

      expect(results).not.toBeNull();
      expect(results!.unitCost).toBe(80);
      expect(results!.totalCost).toBe(8000);
      expect(results!.grossMargin).toBe(60);
      expect(results!.netMargin).toBe(20);
      expect(results!.marginAt70).toBe(10);
      expect(results!.viableAt70).toBe(true);
      expect(results!.simulatedAt).toBeDefined();
    });

    it('should return simulation results for project 2 (not viable)', async () => {
      const results = await queryRepo.findSimulationResults(TENANT_2, PROJECT_2, 1);

      expect(results).not.toBeNull();
      expect(results!.marginAt70).toBe(-5);
      expect(results!.viableAt70).toBe(false);
    });

    it('should NOT return results for non-simulated version', async () => {
      // Insert a version without simulation
      await db.query(`
        INSERT INTO cost_structure_versions (project_id, version, status, created_at)
        VALUES ($1, 2, 'DRAFT', NOW())
      `, [PROJECT_1]);

      const results = await queryRepo.findSimulationResults(TENANT_1, PROJECT_1, 2);

      expect(results).toBeNull();

      // Cleanup
      await db.query('DELETE FROM cost_structure_versions WHERE project_id = $1 AND version = 2', [PROJECT_1]);
    });
  });

  /**
   * Test Suite 5: rm_cost_decisions
   */
  describe('rm_cost_decisions - Décisions finales', () => {
    it('should return decisions for project 1', async () => {
      const decisions = await queryRepo.findDecisions(TENANT_1, PROJECT_1);

      expect(decisions).toHaveLength(1);
      expect(decisions[0].decision).toBe('VALIDATED');
      expect(decisions[0].decidedBy).toBe('user-1');
      expect(decisions[0].justification).toBe('Test 70% OK');
    });

    it('should return empty array for project without decisions', async () => {
      const decisions = await queryRepo.findDecisions(TENANT_2, PROJECT_2);

      expect(decisions).toHaveLength(0);
    });
  });

  /**
   * Test Suite 6: rm_cost_projects_budget_ready (CONTRACTUEL)
   */
  describe('rm_cost_projects_budget_ready - Contrat Budget', () => {
    it('should return only VALIDATED projects with viable_at_70 = true', async () => {
      const budgetReady = await queryRepo.findBudgetReadyProjects(TENANT_1);

      expect(budgetReady).toHaveLength(1);
      expect(budgetReady[0].projectId).toBe(PROJECT_1);
      expect(budgetReady[0].name).toBe('Savon Premium');
      expect(budgetReady[0].viableAt70).toBe(true);
      expect(budgetReady[0].marginAt70).toBe(10);
      expect(budgetReady[0].validatedAt).toBeDefined();
    });

    it('should NOT return SIMULATED projects', async () => {
      const budgetReady = await queryRepo.findBudgetReadyProjects(TENANT_2);

      // Project 2 is SIMULATED, not VALIDATED
      expect(budgetReady).toHaveLength(0);
    });

    it('should NOT return projects with viable_at_70 = false', async () => {
      // Update project 2 to VALIDATED but keep viable_at_70 = false
      await db.query(`
        UPDATE economic_projects
        SET status = 'VALIDATED', validated_at = NOW()
        WHERE project_id = $1
      `, [PROJECT_2]);

      await db.query(`
        UPDATE cost_structure_versions
        SET status = 'FROZEN', frozen_at = NOW(), frozen_by = 'user-2'
        WHERE project_id = $1 AND version = 1
      `, [PROJECT_2]);

      const budgetReady = await queryRepo.findBudgetReadyProjects(TENANT_2);

      // Project 2 has viable_at_70 = false, should NOT appear
      expect(budgetReady).toHaveLength(0);

      // Cleanup
      await db.query(`UPDATE economic_projects SET status = 'SIMULATED', validated_at = NULL WHERE project_id = $1`, [PROJECT_2]);
      await db.query(`UPDATE cost_structure_versions SET status = 'DRAFT', frozen_at = NULL, frozen_by = NULL WHERE project_id = $1`, [PROJECT_2]);
    });

    it('should enforce tenant isolation on budget-ready projects', async () => {
      const budgetReady = await queryRepo.findBudgetReadyProjects(TENANT_1);

      // Tenant 1 should NOT see Tenant 2 projects
      const tenant2Project = budgetReady.find((p) => p.projectId === PROJECT_2);
      expect(tenant2Project).toBeUndefined();
    });
  });

  /**
   * Test Suite 7: rm_cost_structure_summary
   */
  describe('rm_cost_structure_summary - Résumé agrégé', () => {
    it('should return aggregated summary for project 1', async () => {
      const summary = await queryRepo.findCostStructureSummary(TENANT_1, PROJECT_1, 1);

      expect(summary).not.toBeNull();
      expect(summary!.costLinesCount).toBe(3);
      expect(summary!.totalVariableCost).toBe(5000);
      expect(summary!.totalFixedCost).toBe(2000);
      expect(summary!.totalIndirectCost).toBe(1000);
      expect(summary!.totalCostSum).toBe(8000);
      expect(summary!.status).toBe('FROZEN');
    });

    it('should return aggregated summary for project 2', async () => {
      const summary = await queryRepo.findCostStructureSummary(TENANT_2, PROJECT_2, 1);

      expect(summary).not.toBeNull();
      expect(summary!.costLinesCount).toBe(1);
      expect(summary!.totalFixedCost).toBe(7000);
      expect(summary!.totalVariableCost).toBe(0);
      expect(summary!.totalIndirectCost).toBe(0);
    });
  });

  /**
   * Test Suite 8: Multi-tenant RLS validation
   */
  describe('Multi-tenant RLS validation', () => {
    it('should enforce RLS across all read-models', async () => {
      // Tenant 1 queries should NOT return Tenant 2 data
      const projects = await queryRepo.findAllProjects(TENANT_1);
      const costLines = await queryRepo.findCostLines(TENANT_1, PROJECT_2, 1);
      const budgetReady = await queryRepo.findBudgetReadyProjects(TENANT_1);

      expect(projects.every((p) => p.tenantId === TENANT_1)).toBe(true);
      expect(costLines).toHaveLength(0);
      expect(budgetReady.every((p) => p.tenantId === TENANT_1)).toBe(true);
    });

    it('should allow each tenant to see only their own data', async () => {
      const tenant1Projects = await queryRepo.findAllProjects(TENANT_1);
      const tenant2Projects = await queryRepo.findAllProjects(TENANT_2);

      expect(tenant1Projects).toHaveLength(1);
      expect(tenant2Projects).toHaveLength(1);
      expect(tenant1Projects[0].projectId).not.toBe(tenant2Projects[0].projectId);
    });
  });
});
