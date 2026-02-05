/**
 * Contract Tests — Budget ↔ Cost-Structure (Consumer Side)
 * Version: v1.0.0
 * 
 * ❗ Budget ne teste PAS l'implémentation de COUTFLEX
 * ❗ Budget teste UNIQUEMENT le contrat exposé par COUTFLEX
 */

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';

import {
  VALID_BUDGET_READY_PROJECT,
  INVALID_PROJECTS,
  CONTRACT_SHAPE,
  CONTRACT_ERRORS,
  matchesContractShape,
  isValidBudgetReadyProject,
} from './fixtures/cost-structure.responses';

// Test configuration
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/spofe_test';
const COST_STRUCTURE_API_URL = process.env.COST_STRUCTURE_API_URL || 'http://localhost:3001';

describe('CONTRACT — Budget ↔ Cost-Structure (COUTFLEX)', () => {
  let app: INestApplication;
  let http: request.SuperTest<request.Test>;
  let db: Pool;

  beforeAll(async () => {
    db = new Pool({ connectionString: TEST_DB_URL });

    const moduleRef = await Test.createTestingModule({
      // Import Budget module
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
    await db.end();
  });

  beforeEach(async () => {
    await db.query('DELETE FROM cost_lines WHERE tenant_id = $1', ['tenant-1']);
    await db.query('DELETE FROM cost_structure_versions WHERE tenant_id = $1', ['tenant-1']);
    await db.query('DELETE FROM decision_records WHERE tenant_id = $1', ['tenant-1']);
    await db.query('DELETE FROM economic_projects WHERE tenant_id = $1', ['tenant-1']);
  });

  /**
   * CT-BUD-01
   * Budget ne lit QUE les projets autorisés par COUTFLEX
   */
  it('CT-BUD-01 — exposes only budget-ready projects', async () => {
    // Seed a valid project matching fixture
    await seedValidProject(db, {
      projectId: VALID_BUDGET_READY_PROJECT.projectId,
      name: VALID_BUDGET_READY_PROJECT.projectName,
      version: VALID_BUDGET_READY_PROJECT.version,
      unitCost: VALID_BUDGET_READY_PROJECT.unitCost,
      totalCost: VALID_BUDGET_READY_PROJECT.totalCost,
      netMargin: VALID_BUDGET_READY_PROJECT.netMargin,
      marginAt70: VALID_BUDGET_READY_PROJECT.marginAt70,
    });

    const res = await http
      .get('/api/cost-structure/budget-ready/projects')
      .set('X-Tenant-Id', 'tenant-1')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    res.body.forEach((project: any) => {
      // Strict shape validation with expect.any()
      expect(project).toStrictEqual({
        tenantId: expect.any(String),
        projectId: expect.any(String),
        projectName: expect.any(String),
        version: expect.any(Number),
        unitCost: expect.any(Number),
        totalCost: expect.any(Number),
        netMargin: expect.any(Number),
        marginAt70: expect.any(Number),
      });

      // Additional validations
      expect(project.marginAt70).toBeGreaterThan(0);
      expect(project.version).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * CT-BUD-02 / CT-BUD-03 / CT-BUD-04
   * Aucun projet invalide ne doit fuiter
   */
  it('CT-BUD-02 — never exposes non-viable projects', async () => {
    // Seed invalid projects using INVALID_PROJECTS fixtures
    await seedInvalidProject(db, {
      projectId: 'proj-failing-001',
      marginAt70: INVALID_PROJECTS.notViable.marginAt70, // -0.01
    });

    await seedInvalidProject(db, {
      projectId: 'proj-zero-margin',
      marginAt70: INVALID_PROJECTS.marginAtZero.marginAt70, // 0
    });

    const res = await http
      .get('/api/cost-structure/budget-ready/projects')
      .set('X-Tenant-Id', 'tenant-1')
      .expect(200);

    // Verify no project has marginAt70 <= 0
    res.body.forEach((project: any) => {
      expect(project.marginAt70).toBeGreaterThan(0);
    });

    // Verify failing projects are not exposed
    const ids = res.body.map((p: any) => p.projectId);
    expect(ids).not.toContain('proj-failing-001');
    expect(ids).not.toContain('proj-zero-margin');
  });

  /**
   * CT-BUD-03: CostStructure non FROZEN → non exposé
   */
  it('CT-BUD-03 — never exposes non-FROZEN cost structures', async () => {
    await seedInvalidProject(db, {
      projectId: 'proj-simulated-001',
      status: 'VALIDATED',
      structureStatus: 'SIMULATED', // Not frozen
      marginAt70: 0.06,
    });

    const res = await http
      .get('/api/cost-structure/budget-ready/projects')
      .set('X-Tenant-Id', 'tenant-1')
      .expect(200);

    const simulatedProject = res.body.find((p: any) => p.projectId === 'proj-simulated-001');
    expect(simulatedProject).toBeUndefined();
  });

  /**
   * CT-BUD-04: marginAt70 ≤ 0 → non exposé
   */
  it('CT-BUD-04 — never exposes projects with marginAt70 ≤ 0', async () => {
    await seedInvalidProject(db, {
      projectId: 'proj-failing-001',
      marginAt70: -0.05, // Failing 70% test
    });

    const res = await http
      .get('/api/cost-structure/budget-ready/projects')
      .set('X-Tenant-Id', 'tenant-1')
      .expect(200);

    const failingProject = res.body.find((p: any) => p.projectId === 'proj-failing-001');
    expect(failingProject).toBeUndefined();
  });

  /**
   * CT-BUD-05
   * Shape contractuel STRICT
   */
  it('CT-BUD-05 — respects strict contract shape', async () => {
    await seedValidProject(db, {
      projectId: 'project-shape-test',
      name: 'Shape Test',
      version: 1,
    });

    const res = await http
      .get('/api/cost-structure/budget-ready/projects')
      .set('X-Tenant-Id', 'tenant-1')
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    const project = res.body[0];

    // Strict shape validation using CONTRACT_SHAPE
    const actualKeys = Object.keys(project).sort();
    const expectedKeys = [...CONTRACT_SHAPE].sort();
    expect(actualKeys).toEqual(expectedKeys);

    // Verify with helper function
    expect(matchesContractShape(project)).toBe(true);
    expect(isValidBudgetReadyProject(project)).toBe(true);
  });

  /**
   * CT-BUD-06
   * Budget doit REFUSER toute création non autorisée
   */
  it('CT-BUD-06 — rejects budget creation without COUTFLEX approval', async () => {
    const budgetService = new BudgetServiceMock(db);

    await expect(
      budgetService.createBudget({
        tenantId: 'tenant-1',
        projectId: 'non-authorized-project',
      }),
    ).rejects.toThrow(CONTRACT_ERRORS.BUD_COUT_01.message);
  });

  /**
   * CT-BUD-06 bis
   * Budget accepte si projet autorisé
   */
  it('CT-BUD-06b — accepts budget creation with COUTFLEX approval', async () => {
    // Seed valid project first
    await seedValidProject(db, {
      projectId: 'authorized-project',
      name: 'Authorized Project',
      version: 1,
    });

    const budgetService = new BudgetServiceMock(db);

    // Budget creation should succeed
    await expect(
      budgetService.createBudget({
        tenantId: 'tenant-1',
        projectId: 'authorized-project',
      }),
    ).resolves.not.toThrow();
  });

  /**
   * CT-BUD-07
   * Version COUTFLEX changée après Budget
   */
  it('CT-BUD-07 — flags budget as at-risk when cost structure version changes', async () => {
    // Create initial valid project
    await seedValidProject(db, {
      projectId: 'proj-versioned-001',
      name: 'Versioned Project',
      version: 1,
      marginAt70: 0.06,
    });

    const budgetService = new BudgetServiceMock(db);

    // Budget created with version 1
    await budgetService.createBudget({
      tenantId: 'tenant-1',
      projectId: 'proj-versioned-001',
    });

    // Now version 2 exists
    await seedValidProject(db, {
      projectId: 'proj-versioned-001',
      name: 'Versioned Project',
      version: 2, // New version
      marginAt70: 0.08,
    });

    // Check if budget is flagged as at-risk
    const isAtRisk = await budgetService.isBudgetAtRisk('proj-versioned-001');
    expect(isAtRisk).toBe(true);
  });
});

// ============================================================================
// Test Helpers
// ============================================================================

interface SeedProjectOptions {
  projectId: string;
  name?: string;
  version?: number;
  unitCost?: number;
  totalCost?: number;
  netMargin?: number;
  marginAt70?: number;
}

async function seedValidProject(
  db: Pool,
  options: SeedProjectOptions,
  tenantId: string = 'tenant-1'
): Promise<void> {
  const version = options.version || 1;
  const name = options.name || 'Test Project';
  const unitCost = options.unitCost || 10;
  const totalCost = options.totalCost || 10000;
  const netMargin = options.netMargin || 0.25;
  const marginAt70 = options.marginAt70 || 0.08;

  // Insert EconomicProject (VALIDATED)
  await db.query(`
    INSERT INTO economic_projects (
      project_id, tenant_id, name, type, status, current_version, created_by, validated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (project_id) DO UPDATE SET
      status = $5,
      current_version = $6,
      validated_at = $8
  `, [
    options.projectId,
    tenantId,
    name,
    'PRODUCT',
    'VALIDATED',
    version,
    'test-user',
    new Date(),
  ]);

  // Insert CostStructure (FROZEN with viableAt70 = true)
  await db.query(`
    INSERT INTO cost_structure_versions (
      project_id, tenant_id, version, status,
      unit_cost, total_cost, net_margin, margin_at_70, viable_at_70,
      created_by, frozen_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (project_id, version) DO UPDATE SET
      status = $4,
      unit_cost = $5,
      total_cost = $6,
      net_margin = $7,
      margin_at_70 = $8,
      viable_at_70 = $9,
      frozen_at = $11
  `, [
    options.projectId,
    tenantId,
    version,
    'FROZEN',
    unitCost,
    totalCost,
    netMargin,
    marginAt70,
    marginAt70 > 0, // viableAt70
    'test-user',
    new Date(),
  ]);

  // Insert DecisionRecord
  await db.query(`
    INSERT INTO decision_records (
      id, tenant_id, project_id, version, decision, decided_by, decided_at, justification
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO NOTHING
  `, [
    `dec-${options.projectId}-${tenantId}`,
    tenantId,
    options.projectId,
    version,
    'VALIDATED',
    'test-user',
    new Date(),
    'Contract test validation',
  ]);
}

async function seedInvalidProject(
  db: Pool,
  options: { projectId: string; marginAt70: number; status?: string; structureStatus?: string },
  tenantId: string = 'tenant-1'
): Promise<void> {
  const status = options.status || 'VALIDATED';
  const structureStatus = options.structureStatus || 'FROZEN';

  // Insert EconomicProject
  await db.query(`
    INSERT INTO economic_projects (
      project_id, tenant_id, name, type, status, current_version, created_by, validated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    options.projectId,
    tenantId,
    'Invalid Project',
    'PRODUCT',
    status,
    1,
    'test-user',
    status === 'VALIDATED' ? new Date() : null,
  ]);

  // Insert CostStructure (may be non-viable)
  await db.query(`
    INSERT INTO cost_structure_versions (
      project_id, tenant_id, version, status,
      unit_cost, total_cost, net_margin, margin_at_70, viable_at_70,
      created_by, frozen_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    options.projectId,
    tenantId,
    1,
    structureStatus,
    10,
    10000,
    0.25,
    options.marginAt70,
    options.marginAt70 > 0,
    'test-user',
    structureStatus === 'FROZEN' ? new Date() : null,
  ]);

  // Insert DecisionRecord if validated
  if (status === 'VALIDATED') {
    await db.query(`
      INSERT INTO decision_records (
        id, tenant_id, project_id, version, decision, decided_by, decided_at, justification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      `dec-${options.projectId}-${tenantId}`,
      tenantId,
      options.projectId,
      1,
      'VALIDATED',
      'test-user',
      new Date(),
      'Contract test validation',
    ]);
  }
}

// ============================================================================
// Mock Budget Service for testing
// ============================================================================

class BudgetServiceMock {
  constructor(private db: Pool) {}

  async createBudget(input: { tenantId: string; projectId: string }): Promise<void> {
    // Verify project is in budget-ready view
    const result = await this.db.query(`
      SELECT * FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1 AND project_id = $2
    `, [input.tenantId, input.projectId]);

    if (result.rows.length === 0) {
      throw new Error('BUD-COUT-01: Budget creation rejected - Project not validated by COUTFLEX');
    }

    // Create budget record
    await this.db.query(`
      INSERT INTO budget_records (id, tenant_id, project_id, created_at, version_at_creation)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      `budget-${input.projectId}`,
      input.tenantId,
      input.projectId,
      new Date(),
      result.rows[0].version
    ]);
  }

  async isBudgetAtRisk(projectId: string): Promise<boolean> {
    // Get budget version at creation
    const budgetResult = await this.db.query(`
      SELECT version_at_creation FROM budget_records WHERE project_id = $1
    `, [projectId]);

    if (budgetResult.rows.length === 0) {
      return false;
    }

    const budgetVersion = budgetResult.rows[0].version_at_creation;

    // Get current version from COUTFLEX
    const currentResult = await this.db.query(`
      SELECT version FROM rm_cost_projects_budget_ready WHERE project_id = $1
    `, [projectId]);

    if (currentResult.rows.length === 0) {
      return true; // Project no longer budget-ready
    }

    const currentVersion = currentResult.rows[0].version;

    // Budget is at-risk if COUTFLEX has a newer version
    return currentVersion > budgetVersion;
  }
}
