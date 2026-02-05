/**
 * System Tests — Cost-Structure Budget Integration
 * Contract Tests: COUT-BUD-01
 * 
 * Tests validating Cost-Structure contract compliance for Budget module.
 * These tests verify that only properly validated cost structures are 
 * available for Budget consumption.
 */

import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { createTestContext, TestData, Scenarios, type TestContext } from '../test/integration/fixtures/test-context.js';

describe('SYSTEM — Cost-Structure Budget Integration (COUT-BUD-01)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  beforeEach(() => {
    ctx.resetForTest();
  });

  // ═══════════════════════════════════════════════════════════════
  // BUDGET READINESS — COUT-BUD-01
  // ═══════════════════════════════════════════════════════════════

  describe('Budget Readiness — COUT-BUD-01', () => {
    it('only APPROVED projects can be consumed by Budget', async () => {
      await Scenarios.setupFrozen(ctx);
      
      // Before validation — NOT ready for Budget
      let project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).not.toBe('APPROVED');

      // After validation — Ready for Budget
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);
      
      project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('APPROVED');
    });

    it('REJECTED projects cannot be consumed by Budget', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('REJECTED');
      expect(project?.status).not.toBe('APPROVED');
    });
  });
});