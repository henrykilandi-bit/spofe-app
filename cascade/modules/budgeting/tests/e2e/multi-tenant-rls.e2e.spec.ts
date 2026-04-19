/**
 * Tests E2E Multi-Tenant - Module Budget
 * Validation RLS et isolation des tenants
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { BudgetModule } from '../../index';
import { DatabaseModule } from '../../../shared/database/database.module';

describe('Budget E2E - Multi-Tenant RLS', () => {
  let app: INestApplication;
  let connection: any;

  // Test tenants
  const TENANT_A = 'tenant-a-test-001';
  const TENANT_B = 'tenant-b-test-002';
  const ADMIN_TENANT = 'admin-tenant-test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BudgetModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    connection = getConnection();
    
    // Setup test data with proper RLS context
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await connection.close();
    await app.close();
  });

  describe('RLS Policy Enforcement', () => {
    it('should isolate budget data between tenants', async () => {
      // Tenant A creates budget
      const budgetA = await request(app.getHttpServer())
        .post('/api/budget/objectives')
        .set('X-Tenant-ID', TENANT_A)
        .send({
          period: { year: 2026, quarter: 'Q1' },
          objectives: [{
            category: 'SALES',
            amount: 100000,
            currency: 'EUR'
          }]
        })
        .expect(201);

      // Tenant B should not see Tenant A's budget
      await request(app.getHttpServer())
        .get(`/api/budget/objectives/${budgetA.body.id}`)
        .set('X-Tenant-ID', TENANT_B)
        .expect(404);

      // Tenant A should see own budget
      await request(app.getHttpServer())
        .get(`/api/budget/objectives/${budgetA.body.id}`)
        .set('X-Tenant-ID', TENANT_A)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(budgetA.body.id);
          expect(res.body.tenantId).toBe(TENANT_A);
        });
    });

    it('should prevent cross-tenant budget modifications', async () => {
      // Tenant A creates budget
      const budget = await createBudgetForTenant(TENANT_A);
      
      // Tenant B attempts to modify Tenant A's budget
      await request(app.getHttpServer())
        .put(`/api/budget/objectives/${budget.id}`)
        .set('X-Tenant-ID', TENANT_B)
        .send({
          status: 'VALIDATED'
        })
        .expect(403);
    });

    it('should enforce RLS in read-models', async () => {
      // Create budgets for both tenants
      await createBudgetForTenant(TENANT_A);
      await createBudgetForTenant(TENANT_B);
      
      // Tenant A queries should only return own data
      const responseA = await request(app.getHttpServer())
        .get('/api/budget/projections')
        .set('X-Tenant-ID', TENANT_A)
        .expect(200);
        
      expect(responseA.body.every(item => item.tenantId === TENANT_A)).toBe(true);
      
      // Tenant B queries should only return own data
      const responseB = await request(app.getHttpServer())
        .get('/api/budget/projections')
        .set('X-Tenant-ID', TENANT_B)
        .expect(200);
        
      expect(responseB.body.every(item => item.tenantId === TENANT_B)).toBe(true);
    });

    it('should validate Guardian invariants per tenant', async () => {
      // Tenant A creates valid budget
      const validBudget = await request(app.getHttpServer())
        .post('/api/budget/objectives')
        .set('X-Tenant-ID', TENANT_A)
        .send({
          period: { year: 2026, quarter: 'Q2' },
          objectives: [{
            category: 'SALES',
            amount: 50000,
            currency: 'EUR'
          }],
          paymentTerms: {
            daysToPayment: 30,
            discountRate: 0.02
          }
        })
        .expect(201);
        
      // Same tenant tries to create duplicate (should fail)
      await request(app.getHttpServer())
        .post('/api/budget/objectives')
        .set('X-Tenant-ID', TENANT_A)
        .send({
          period: { year: 2026, quarter: 'Q2' }, // Same period
          objectives: [{
            category: 'SALES',
            amount: 75000,
            currency: 'EUR'
          }]
        })
        .expect(400)
        .expect(res => {
          expect(res.body.error).toContain('INV-BO-01');
        });
        
      // Different tenant can create budget for same period
      await request(app.getHttpServer())
        .post('/api/budget/objectives')
        .set('X-Tenant-ID', TENANT_B)
        .send({
          period: { year: 2026, quarter: 'Q2' },
          objectives: [{
            category: 'SALES',
            amount: 60000,
            currency: 'EUR'
          }],
          paymentTerms: {
            daysToPayment: 45,
            discountRate: 0.01
          }
        })
        .expect(201);
    });
  });

  describe('Performance & Metrics', () => {
    it('should track metrics per tenant', async () => {
      const metricsEndpoint = '/metrics';
      
      // Generate some activity
      await createBudgetForTenant(TENANT_A);
      await createBudgetForTenant(TENANT_B);
      
      // Check metrics contain tenant labels
      const metrics = await request(app.getHttpServer())
        .get(metricsEndpoint)
        .expect(200);
        
      expect(metrics.text).toContain(`tenant_id="${TENANT_A}"`);
      expect(metrics.text).toContain(`tenant_id="${TENANT_B}"`);
      expect(metrics.text).toContain('budget_commands_total');
    });

    it('should detect RLS violations', async () => {
      // Attempt to bypass RLS (this should be logged)
      try {
        await connection.query(`
          SET LOCAL rls.bypass_rls = on;
          SELECT * FROM budget_objectives WHERE tenant_id != $1;
        `, [TENANT_A]);
      } catch (error) {
        // Expected - RLS should prevent this
      }
      
      // Check that violation was recorded in metrics
      const metrics = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);
        
      // Should contain RLS violation counter
      expect(metrics.text).toMatch(/budget_rls_violations_total.*\d+/);
    });
  });

  // Helper functions
  async function createBudgetForTenant(tenantId: string) {
    const response = await request(app.getHttpServer())
      .post('/api/budget/objectives')
      .set('X-Tenant-ID', tenantId)
      .send({
        period: { year: 2026, quarter: 'Q3' },
        objectives: [{
          category: 'SALES',
          amount: Math.floor(Math.random() * 100000) + 10000,
          currency: 'EUR'
        }],
        paymentTerms: {
          daysToPayment: 30,
          discountRate: 0.02
        }
      })
      .expect(201);
      
    return response.body;
  }

  async function setupTestData() {
    // Enable RLS for test
    await connection.query('SET row_security = on;');
    
    // Create test tenant contexts
    await connection.query(`
      INSERT INTO tenants (id, name, created_at) VALUES 
      ($1, 'Test Tenant A', NOW()),
      ($2, 'Test Tenant B', NOW()),
      ($3, 'Admin Tenant', NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_A, TENANT_B, ADMIN_TENANT]);
  }

  async function cleanupTestData() {
    // Clean up test data
    await connection.query(`
      DELETE FROM budget_objectives 
      WHERE tenant_id IN ($1, $2, $3);
    `, [TENANT_A, TENANT_B, ADMIN_TENANT]);
    
    await connection.query(`
      DELETE FROM tenants 
      WHERE id IN ($1, $2, $3);
    `, [TENANT_A, TENANT_B, ADMIN_TENANT]);
  }
});
