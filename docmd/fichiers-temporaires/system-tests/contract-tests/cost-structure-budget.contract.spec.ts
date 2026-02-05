/**
 * Contract Tests — Cost-Structure → Budget (Provider Side)
 * Version: v1.0.0
 * 
 * Objectif: Garantir que COUTFLEX n'expose jamais un projet invalide
 * via la vue rm_cost_projects_budget_ready
 */

import { Pool } from 'pg';
import { INVARIANT_CODES } from '../../domain/invariants';

// Test configuration
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/spofe_test';

describe('Contract Tests — Cost-Structure → Budget (Provider)', () => {
  let db: Pool;

  beforeAll(async () => {
    db = new Pool({ connectionString: TEST_DB_URL });
  });

  afterAll(async () => {
    await db.end();
  });

  beforeEach(async () => {
    // Clean test data
    await db.query('DELETE FROM cost_lines WHERE tenant_id = $1', ['test-tenant']);
    await db.query('DELETE FROM cost_structure_versions WHERE tenant_id = $1', ['test-tenant']);
    await db.query('DELETE FROM decision_records WHERE tenant_id = $1', ['test-tenant']);
    await db.query('DELETE FROM economic_projects WHERE tenant_id = $1', ['test-tenant']);
  });

  /**
   * Provider Contract Test 1: Vue budget_ready n'expose jamais COUT-01 en échec
   */
  it('PCT-01: rm_cost_projects_budget_ready never exposes projects failing COUT-01', async () => {
    // Create project that SHOULD NOT appear (marginAt70 <= 0)
    await seedProjectWithSimulation(db, {
      projectId: 'proj-failing-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: -0.05,
      viableAt70: false
    });

    // Create project that SHOULD appear (marginAt70 > 0)
    await seedProjectWithSimulation(db, {
      projectId: 'proj-passing-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.06,
      viableAt70: true
    });

    // Query the contract view
    const result = await db.query(`
      SELECT project_id, margin_at_70, viable_at_70 
      FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1
    `, ['test-tenant']);

    // Verify failing project is NOT exposed
    const failingProject = result.rows.find(r => r.project_id === 'proj-failing-001');
    expect(failingProject).toBeUndefined();

    // Verify passing project IS exposed
    const passingProject = result.rows.find(r => r.project_id === 'proj-passing-001');
    expect(passingProject).toBeDefined();
    expect(parseFloat(passingProject.margin_at_70)).toBeGreaterThan(0);
    expect(passingProject.viable_at_70).toBe(true);
  });

  /**
   * Provider Contract Test 2: Vue expose uniquement FROZEN
   */
  it('PCT-02: rm_cost_projects_budget_ready exposes only FROZEN cost structures', async () => {
    // Create DRAFT structure
    await seedProjectWithSimulation(db, {
      projectId: 'proj-draft-cs-001',
      status: 'VALIDATED',
      structureStatus: 'DRAFT',
      marginAt70: 0.10,
      viableAt70: true
    });

    // Create SIMULATED structure
    await seedProjectWithSimulation(db, {
      projectId: 'proj-simulated-cs-001',
      status: 'VALIDATED',
      structureStatus: 'SIMULATED',
      marginAt70: 0.10,
      viableAt70: true
    });

    // Create FROZEN structure
    await seedProjectWithSimulation(db, {
      projectId: 'proj-frozen-cs-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    });

    const result = await db.query(`
      SELECT project_id FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1
    `, ['test-tenant']);

    const exposedIds = result.rows.map(r => r.project_id);

    // Draft and simulated should NOT be exposed
    expect(exposedIds).not.toContain('proj-draft-cs-001');
    expect(exposedIds).not.toContain('proj-simulated-cs-001');

    // Frozen SHOULD be exposed
    expect(exposedIds).toContain('proj-frozen-cs-001');
  });

  /**
   * Provider Contract Test 3: Vue n'expose que VALIDATED projects
   */
  it('PCT-03: rm_cost_projects_budget_ready exposes only VALIDATED projects', async () => {
    // Create DRAFT project
    await seedProjectWithSimulation(db, {
      projectId: 'proj-draft-pj-001',
      status: 'DRAFT',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    });

    // Create REJECTED project
    await seedProjectWithSimulation(db, {
      projectId: 'proj-rejected-pj-001',
      status: 'REJECTED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    });

    // Create VALIDATED project
    await seedProjectWithSimulation(db, {
      projectId: 'proj-validated-pj-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    });

    const result = await db.query(`
      SELECT project_id FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1
    `, ['test-tenant']);

    const exposedIds = result.rows.map(r => r.project_id);

    // Draft and rejected should NOT be exposed
    expect(exposedIds).not.toContain('proj-draft-pj-001');
    expect(exposedIds).not.toContain('proj-rejected-pj-001');

    // Validated SHOULD be exposed
    expect(exposedIds).toContain('proj-validated-pj-001');
  });

  /**
   * Provider Contract Test 4: Vue avec version > 0
   */
  it('PCT-04: rm_cost_projects_budget_ready exposes only versioned structures', async () => {
    await seedProjectWithSimulation(db, {
      projectId: 'proj-versioned-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      version: 1,
      marginAt70: 0.10,
      viableAt70: true
    });

    const result = await db.query(`
      SELECT project_id, version FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1
    `, ['test-tenant']);

    expect(result.rows.length).toBeGreaterThan(0);
    result.rows.forEach(row => {
      expect(row.version).toBeGreaterThan(0);
    });
  });

  /**
   * Provider Contract Test 5: Multi-tenant isolation
   */
  it('PCT-05: rm_cost_projects_budget_ready respects tenant isolation', async () => {
    // Create project for tenant-1
    await seedProjectWithSimulation(db, {
      projectId: 'proj-tenant1-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    }, 'tenant-1');

    // Create project for tenant-2
    await seedProjectWithSimulation(db, {
      projectId: 'proj-tenant2-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    }, 'tenant-2');

    // Query as tenant-1
    const resultTenant1 = await db.query(`
      SELECT project_id FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1
    `, ['tenant-1']);

    // Query as tenant-2
    const resultTenant2 = await db.query(`
      SELECT project_id FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1
    `, ['tenant-2']);

    const tenant1Ids = resultTenant1.rows.map(r => r.project_id);
    const tenant2Ids = resultTenant2.rows.map(r => r.project_id);

    // Tenant 1 sees only its project
    expect(tenant1Ids).toContain('proj-tenant1-001');
    expect(tenant1Ids).not.toContain('proj-tenant2-001');

    // Tenant 2 sees only its project
    expect(tenant2Ids).toContain('proj-tenant2-001');
    expect(tenant2Ids).not.toContain('proj-tenant1-001');
  });

  /**
   * Provider Contract Test 6: Contract shape compliance
   */
  it('PCT-06: rm_cost_projects_budget_ready exposes all contract fields', async () => {
    await seedProjectWithSimulation(db, {
      projectId: 'proj-complete-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    });

    const result = await db.query(`
      SELECT * FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1 AND project_id = $2
    `, ['test-tenant', 'proj-complete-001']);

    expect(result.rows.length).toBe(1);
    const row = result.rows[0];

    // All contract fields must be present
    expect(row.tenant_id).toBeDefined();
    expect(row.project_id).toBeDefined();
    expect(row.name).toBeDefined();
    expect(row.type).toBeDefined();
    expect(row.version).toBeDefined();
    expect(row.unit_cost).toBeDefined();
    expect(row.total_cost).toBeDefined();
    expect(row.net_margin).toBeDefined();
    expect(row.margin_at_70).toBeDefined();
    expect(row.viable_at_70).toBeDefined();
    expect(row.validated_at).toBeDefined();
  });

  /**
   * Provider Contract Test 7: Data immutability
   */
  it('PCT-07: exposed data is immutable (read-only)', async () => {
    await seedProjectWithSimulation(db, {
      projectId: 'proj-immutable-001',
      status: 'VALIDATED',
      structureStatus: 'FROZEN',
      marginAt70: 0.10,
      viableAt70: true
    });

    const result = await db.query(`
      SELECT margin_at_70, net_margin FROM rm_cost_projects_budget_ready 
      WHERE tenant_id = $1 AND project_id = $2
    `, ['test-tenant', 'proj-immutable-001']);

    expect(result.rows.length).toBe(1);
    
    // Verify we cannot update through the view
    await expect(db.query(`
      UPDATE rm_cost_projects_budget_ready 
      SET margin_at_70 = 0.99 
      WHERE project_id = $1
    `, ['proj-immutable-001'])).rejects.toThrow();
  });
});

// ============================================================================
// Test Helpers
// ============================================================================

interface SeedProjectOptions {
  projectId: string;
  status: 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';
  structureStatus: 'DRAFT' | 'SIMULATED' | 'FROZEN';
  version?: number;
  marginAt70: number;
  viableAt70: boolean;
}

async function seedProjectWithSimulation(
  db: Pool, 
  options: SeedProjectOptions,
  tenantId: string = 'test-tenant'
): Promise<void> {
  const version = options.version || 1;

  // Insert EconomicProject
  await db.query(`
    INSERT INTO economic_projects (
      project_id, tenant_id, name, type, status, current_version, created_by, validated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (project_id) DO UPDATE SET status = $5, current_version = $6
  `, [
    options.projectId,
    tenantId,
    'Test Project',
    'PRODUCT',
    options.status,
    version,
    'test-user',
    options.status === 'VALIDATED' ? new Date() : null
  ]);

  // Insert CostStructure with simulation results
  await db.query(`
    INSERT INTO cost_structure_versions (
      project_id, tenant_id, version, status, 
      unit_cost, total_cost, net_margin, margin_at_70, viable_at_70,
      created_by, frozen_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    options.projectId,
    tenantId,
    version,
    options.structureStatus,
    7.8,
    7800,
    0.18,
    options.marginAt70,
    options.viableAt70,
    'test-user',
    options.structureStatus === 'FROZEN' ? new Date() : null
  ]);

  // If validated, insert decision record
  if (options.status === 'VALIDATED') {
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
      'Contract test validation'
    ]);
  }
}
