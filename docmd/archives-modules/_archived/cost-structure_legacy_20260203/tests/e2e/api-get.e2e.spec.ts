/**
 * Cost-Structure Read API E2E Tests
 * Conformité: COUTFLEX API Contract v1.0.0
 * Test runner: Jest + Supertest
 */

import { Pool } from 'pg';
import request from 'supertest';

describe('Cost-Structure Read API E2E', () => {
  let db: Pool;
  const BASE_URL = process.env.API_URL || 'http://localhost:3000';
  const TENANT_1 = '11111111-1111-1111-1111-111111111111';
  const TENANT_2 = '22222222-2222-2222-2222-222222222222';
  const PROJECT_1 = '33333333-3333-3333-3333-333333333333';
  const PROJECT_2 = '44444444-4444-4444-4444-444444444444';
  const AUTH_TOKEN = 'Bearer test-token';

  beforeAll(async () => {
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'spofe_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await seedTestData();
  });

  afterAll(async () => {
    await db.end();
  });

  async function seedTestData() {
    await db.query('DELETE FROM decision_records');
    await db.query('DELETE FROM cost_lines');
    await db.query('DELETE FROM cost_structure_versions');
    await db.query('DELETE FROM economic_projects');

    // Project 1: VALIDATED + viable
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
      ) VALUES ($1, 1, 'FROZEN', NOW(), NOW(), 'user-1', 1500, 1000, 1500, 800, 1000, 1200, 80, 8000, 0.60, 0.20, 0.10, true, NOW())
    `, [PROJECT_1]);

    await db.query(`
      INSERT INTO cost_lines (project_id, version, category, label, amount, currency, created_at)
      VALUES 
        ($1, 1, 'VARIABLE', 'Matière première', 5000, 'XAF', NOW()),
        ($1, 1, 'FIXED', 'Salaires', 2000, 'XAF', NOW())
    `, [PROJECT_1]);

    await db.query(`
      INSERT INTO decision_records (project_id, version, decision, decided_by, decided_at, justification)
      VALUES ($1, 1, 'VALIDATED', 'user-1', NOW(), 'Test 70% OK')
    `, [PROJECT_1]);

    // Project 2: SIMULATED + not viable
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
      ) VALUES ($1, 1, 'DRAFT', NOW(), 2000, 500, 800, 400, 500, 600, 150, 7500, 0.40, 0.10, -0.05, false, NOW())
    `, [PROJECT_2]);
  }

  describe('GET /api/cost-structure/projects', () => {
    it('should return projects list for tenant 1', async () => {
      const response = await request(BASE_URL)
        .get('/api/cost-structure/projects')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].projectId).toBe(PROJECT_1);
      expect(response.body[0].name).toBe('Savon Premium');
      expect(response.body[0].status).toBe('VALIDATED');
    });

    it('should filter by status', async () => {
      const response = await request(BASE_URL)
        .get('/api/cost-structure/projects?status=VALIDATED')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body.every((p: any) => p.status === 'VALIDATED')).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(BASE_URL)
        .get('/api/cost-structure/projects?type=PRODUCT')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body.every((p: any) => p.type === 'PRODUCT')).toBe(true);
    });

    it('should return 400 without X-Tenant-Id header', async () => {
      await request(BASE_URL)
        .get('/api/cost-structure/projects')
        .set('Authorization', AUTH_TOKEN)
        .expect(400);
    });
  });

  describe('GET /api/cost-structure/projects/:projectId/structure', () => {
    it('should return FROZEN cost structure', async () => {
      const response = await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_1}/structure`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body.projectId).toBe(PROJECT_1);
      expect(response.body.version).toBe(1);
      expect(response.body.status).toBe('FROZEN');
      expect(response.body.frozenAt).toBeDefined();
      expect(response.body.frozenBy).toBe('user-1');
    });

    it('should return 404 for project without FROZEN structure', async () => {
      await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_2}/structure`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_2)
        .expect(404);
    });
  });

  describe('GET /api/cost-structure/projects/:projectId/structure/:version/lines', () => {
    it('should return cost lines', async () => {
      const response = await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_1}/structure/1/lines`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].category).toBe('VARIABLE');
      expect(response.body[0].label).toBe('Matière première');
      expect(response.body[0].amount).toBe(5000);
      expect(response.body[1].category).toBe('FIXED');
    });

    it('should enforce tenant isolation', async () => {
      const response = await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_2}/structure/1/lines`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/cost-structure/projects/:projectId/structure/:version/simulation', () => {
    it('should return simulation results', async () => {
      const response = await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_1}/structure/1/simulation`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body.unitCost).toBe(80);
      expect(response.body.totalCost).toBe(8000);
      expect(response.body.grossMargin).toBe(0.60);
      expect(response.body.netMargin).toBe(0.20);
      expect(response.body.marginAt70).toBe(0.10);
      expect(response.body.viableAt70).toBe(true);
      expect(response.body.simulatedAt).toBeDefined();
    });

    it('should return 404 for non-simulated version', async () => {
      await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_1}/structure/999/simulation`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(404);
    });
  });

  describe('GET /api/cost-structure/projects/:projectId/decision', () => {
    it('should return decision', async () => {
      const response = await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_1}/decision`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body.decision).toBe('VALIDATED');
      expect(response.body.version).toBe(1);
      expect(response.body.decidedBy).toBe('user-1');
      expect(response.body.justification).toBe('Test 70% OK');
    });

    it('should return 404 for project without decision', async () => {
      await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_2}/decision`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_2)
        .expect(404);
    });
  });

  describe('GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET)', () => {
    it('should return ONLY VALIDATED + FROZEN + viable projects', async () => {
      const response = await request(BASE_URL)
        .get('/api/cost-structure/budget-ready/projects')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].projectId).toBe(PROJECT_1);
      expect(response.body[0].viableAt70).toBe(true);
      expect(response.body[0].marginAt70).toBe(0.10);
    });

    it('should NOT return SIMULATED projects', async () => {
      const response = await request(BASE_URL)
        .get('/api/cost-structure/budget-ready/projects')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_2)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should enforce tenant isolation', async () => {
      const response = await request(BASE_URL)
        .get('/api/cost-structure/budget-ready/projects')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body.every((p: any) => p.projectId === PROJECT_1)).toBe(true);
    });
  });

  describe('GET /api/cost-structure/projects/:projectId/history', () => {
    it('should return project history', async () => {
      const response = await request(BASE_URL)
        .get(`/api/cost-structure/projects/${PROJECT_1}/history`)
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].decision).toBe('VALIDATED');
    });

    it('should return 404 for non-existent project', async () => {
      await request(BASE_URL)
        .get('/api/cost-structure/projects/non-existent/history')
        .set('Authorization', AUTH_TOKEN)
        .set('X-Tenant-Id', TENANT_1)
        .expect(404);
    });
  });
});
