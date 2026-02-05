/**
 * Integration Tests — Budget Contract Verification
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0, COUT-BUD-01
 * 
 * Ces tests vérifient que le module Cost-Structure
 * respecte son contrat avec le module Budget.
 * 
 * ⚠️ BLOQUANT CI — Sans ces tests, l'intégration Budget est à risque.
 */

import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { createTestContext, TestData, Scenarios, type TestContext } from './fixtures/test-context.js';

describe('INTEGRATION — Budget Contract (COUT-BUD-01)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  beforeEach(() => {
    ctx.clear();
  });

  // ═══════════════════════════════════════════════════════════════
  // Contract: Only APPROVED projects can be consumed by Budget
  // ═══════════════════════════════════════════════════════════════

  describe('COUT-BUD-01: Budget can only consume APPROVED projects', () => {
    it('DRAFT project is NOT ready for Budget', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      
      expect(project?.status).toBe('DRAFT');
      expect(isBudgetReady(project?.status)).toBe(false);
    });

    it('SIMULATED project is NOT ready for Budget', async () => {
      await Scenarios.setupSimulated(ctx);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      
      expect(project?.status).not.toBe('APPROVED');
      expect(isBudgetReady(project?.status)).toBe(false);
    });

    it('FROZEN project is NOT ready for Budget', async () => {
      await Scenarios.setupFrozen(ctx);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      
      expect(project?.status).toBe('FROZEN');
      expect(isBudgetReady(project?.status)).toBe(false);
    });

    it('REJECTED project is NOT ready for Budget', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      
      expect(project?.status).toBe('REJECTED');
      expect(isBudgetReady(project?.status)).toBe(false);
    });

    it('APPROVED project IS ready for Budget', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      
      expect(project?.status).toBe('APPROVED');
      expect(isBudgetReady(project?.status)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Contract: Data Integrity for Budget Consumption
  // ═══════════════════════════════════════════════════════════════

  describe('Data Integrity for Budget', () => {
    it('APPROVED project has all required data for Budget', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      const costStructure = await ctx.repos.costStructureRepo.loadAggregate(
        TestData.tenantId,
        TestData.projectId,
        1,
      );

      // Verify all data Budget needs is present
      expect(project).toBeDefined();
      expect(project?.projectId).toBe(TestData.projectId);
      expect(project?.tenantId).toBe(TestData.tenantId);
      expect(project?.status).toBe('APPROVED');

      expect(costStructure).toBeDefined();
      expect(costStructure?.simulation).toBeDefined();
      expect(costStructure?.simulation?.totalCost).toBeGreaterThan(0);
      expect(costStructure?.simulation?.variableCostRatio).toBeLessThanOrEqual(0.7);
    });

    it('frozen structure has immutable cost data', async () => {
      await Scenarios.setupFrozen(ctx);

      const csBefore = await ctx.repos.costStructureRepo.loadAggregate(
        TestData.tenantId,
        TestData.projectId,
        1,
      );

      // Try to modify (should fail)
      await expect(
        ctx.execute(TestData.addCostLineCommand('VARIABLE', 999), ctx.handlers.addCostLine),
      ).rejects.toThrow();

      const csAfter = await ctx.repos.costStructureRepo.loadAggregate(
        TestData.tenantId,
        TestData.projectId,
        1,
      );

      // Data should be unchanged
      expect(csAfter?.costLines.length).toBe(csBefore?.costLines.length);
      expect(csAfter?.simulation?.totalCost).toBe(csBefore?.simulation?.totalCost);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Contract: Event Stream for Budget Integration
  // ═══════════════════════════════════════════════════════════════

  describe('Event Stream for Budget Integration', () => {
    it('emits ProjectValidated event when approved', async () => {
      await Scenarios.setupFrozen(ctx);
      
      const events = await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      const validatedEvent = events.find(e => e.eventType === 'ProjectValidated');
      expect(validatedEvent).toBeDefined();
      expect(validatedEvent?.tenantId).toBe(TestData.tenantId);
      expect(validatedEvent?.payload.projectId).toBe(TestData.projectId);
    });

    it('ProjectValidated event contains justification', async () => {
      await Scenarios.setupFrozen(ctx);
      
      const events = await ctx.execute(
        TestData.validateProjectCommand({ justification: 'ROI > 15% approuvé' }),
        ctx.handlers.validateProject,
      );

      const validatedEvent = events.find(e => e.eventType === 'ProjectValidated');
      expect(validatedEvent?.payload.justification).toBe('ROI > 15% approuvé');
    });

    it('DecisionRecorded event tracks audit trail', async () => {
      await Scenarios.setupFrozen(ctx);
      
      const events = await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      const decisionEvent = events.find(e => e.eventType === 'DecisionRecorded');
      expect(decisionEvent).toBeDefined();
      expect(decisionEvent?.payload.decision).toBe('VALIDATE');
      expect(decisionEvent?.payload.decidedBy).toBe(TestData.actorId);
      expect(decisionEvent?.payload.decidedAt).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Contract: Simulation Data Guarantees
  // ═══════════════════════════════════════════════════════════════

  describe('Simulation Data Guarantees for Budget', () => {
    it('simulation results are within contract bounds', async () => {
      await Scenarios.setupFrozen(ctx);

      const costStructure = await ctx.repos.costStructureRepo.loadAggregate(
        TestData.tenantId,
        TestData.projectId,
        1,
      );

      const sim = costStructure?.simulation;
      expect(sim).toBeDefined();

      // COUT-01: Variable ratio ≤ 70%
      expect(sim?.variableCostRatio).toBeLessThanOrEqual(0.7);

      // Total cost is positive
      expect(sim?.totalCost).toBeGreaterThan(0);

      // Break-even is finite and positive
      expect(sim?.breakEvenPoint).toBeGreaterThan(0);
      expect(sim?.breakEvenPoint).toBeLessThan(Infinity);

      // Scenarios are ordered correctly
      expect(sim?.scenarioResults.pessimistic.margin)
        .toBeLessThanOrEqual(sim?.scenarioResults.realistic.margin ?? 0);
      expect(sim?.scenarioResults.realistic.margin)
        .toBeLessThanOrEqual(sim?.scenarioResults.optimistic.margin ?? 0);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * Vérifie si un projet est prêt à être consommé par Budget
 * Seuls les projets APPROVED peuvent l'être.
 */
function isBudgetReady(status: string | undefined): boolean {
  return status === 'APPROVED';
}
