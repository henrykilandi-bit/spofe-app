/**
 * Integration Tests — Cost-Structure Write-Side
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Valide le pipeline COMPLET:
 *   Command → TransactionManager → Guardian → Handler → Events → DB
 * 
 * ❌ AUCUN MOCK MÉTIER
 * ✅ Guardian RÉEL
 * ✅ Table-driven
 * ✅ CI-blocking
 */

import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { createTestContext, TestData, Scenarios, type TestContext } from './fixtures/test-context.js';
import { InvariantViolationError } from '../../domain/guardian/cost-structure.guardian.js';
import type {
  CostLineAddedPayload,
  AssumptionsUpdatedPayload,
  CostStructureSimulatedPayload,
} from '../../domain/events/index.js';

describe('INTEGRATION — Cost-Structure Write-Side Pipeline', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  beforeEach(() => {
    ctx.clear();
  });

  // ═══════════════════════════════════════════════════════════════
  // 1️⃣ HAPPY PATH — Full Lifecycle
  // ═══════════════════════════════════════════════════════════════

  describe('Happy Path — Complete Project Lifecycle', () => {
    it('creates an economic project', async () => {
      const cmd = TestData.createProjectCommand();
      const events = await ctx.execute(cmd, ctx.handlers.createProject);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('EconomicProjectCreated');

      const stored = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(stored?.status).toBe('DRAFT');
      expect(stored?.name).toBe('Produit Test');
    });

    it('creates a cost structure version', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      
      const cmd = TestData.createCostStructureCommand(1);
      const events = await ctx.execute(cmd, ctx.handlers.createCostStructure);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('CostStructureCreated');
    });

    it('adds cost lines to structure', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);

      const cmd = TestData.addCostLineCommand('VARIABLE', 5000);
      const events = await ctx.execute(cmd, ctx.handlers.addCostLine);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('CostLineAdded');
      const payload = events[0].payload as CostLineAddedPayload;
      expect(payload.category).toBe('VARIABLE');
      expect(payload.amount).toBe(5000);
    });

    it('updates assumptions for simulation', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);

      const cmd = TestData.updateAssumptionsCommand();
      const events = await ctx.execute(cmd, ctx.handlers.updateAssumptions);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('AssumptionsUpdated');
      const payload = events[0].payload as AssumptionsUpdatedPayload;
      expect(payload.priceTarget).toBe(100);
    });

    it('runs a valid simulation (ratio ≤ 70%)', async () => {
      await Scenarios.setupDraftWithCosts(ctx, { variableAmount: 5000, fixedAmount: 5000 });

      const cmd = TestData.runSimulationCommand();
      const events = await ctx.execute(cmd, ctx.handlers.runSimulation);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('CostStructureSimulated');
      const simPayload = events[0].payload as CostStructureSimulatedPayload;
      expect(simPayload.variableCostRatio).toBe(0.5); // 50%
      expect(simPayload.totalCost).toBe(10000);
    });

    it('freezes a simulated cost structure', async () => {
      await Scenarios.setupSimulated(ctx);

      const cmd = TestData.freezeCommand();
      const events = await ctx.execute(cmd, ctx.handlers.freezeStructure);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('CostStructureFrozen');
    });

    it('validates project when all invariants pass', async () => {
      await Scenarios.setupFrozen(ctx);

      const cmd = TestData.validateProjectCommand();
      const events = await ctx.execute(cmd, ctx.handlers.validateProject);

      expect(events).toHaveLength(2);
      expect(events.map(e => e.eventType)).toContain('ProjectValidated');
      expect(events.map(e => e.eventType)).toContain('DecisionRecorded');

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('APPROVED');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 2️⃣ GUARDIAN BLOCKING — Invariant Violations
  // ═══════════════════════════════════════════════════════════════

  describe('Guardian Blocking — Invariant COUT-01 (Variable ratio ≤ 70%)', () => {
    it('rejects simulation if variable cost ratio > 70%', async () => {
      // Setup with 80% variable costs = INVALID
      await Scenarios.setupInvalidRatio(ctx);

      const cmd = TestData.runSimulationCommand();

      await expect(ctx.execute(cmd, ctx.handlers.runSimulation))
        .rejects
        .toThrow(InvariantViolationError);

      await expect(ctx.execute(cmd, ctx.handlers.runSimulation))
        .rejects
        .toThrow(/COUT-01/);
    });

    it('passes simulation at exactly 70%', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      
      // 70% variable = VALID (limite)
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', 7000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', 3000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);

      const cmd = TestData.runSimulationCommand();
      const events = await ctx.execute(cmd, ctx.handlers.runSimulation);

      expect(events[0].eventType).toBe('CostStructureSimulated');
      const payload70 = events[0].payload as CostStructureSimulatedPayload;
      expect(payload70.variableCostRatio).toBe(0.7);
    });

    it('rejects at 71%', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      
      // 71% variable = INVALID
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', 7100), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', 2900), ctx.handlers.addCostLine);
      await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);

      await expect(ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation))
        .rejects
        .toThrow(/COUT-01/);
    });
  });

  describe('Guardian Blocking — Invariant COUT-EP-01 (Unique name per tenant)', () => {
    it('rejects duplicate project name in same tenant', async () => {
      await ctx.execute(TestData.createProjectCommand({ name: 'Produit Alpha' }), ctx.handlers.createProject);

      await expect(
        ctx.execute(
          TestData.createProjectCommand({ projectId: 'project-002', name: 'Produit Alpha' }),
          ctx.handlers.createProject,
        ),
      ).rejects.toThrow(/COUT-EP-01/);
    });

    it('allows same name in different tenant', async () => {
      await ctx.execute(TestData.createProjectCommand({ name: 'Produit Alpha' }), ctx.handlers.createProject);

      const events = await ctx.execute(
        TestData.createProjectCommand({
          tenantId: 'tenant-other',
          projectId: 'project-002',
          name: 'Produit Alpha',
        }),
        ctx.handlers.createProject,
      );

      expect(events[0].eventType).toBe('EconomicProjectCreated');
    });
  });

  describe('Guardian Blocking — Invariant COUT-CS-03 (No modification after freeze)', () => {
    it('rejects adding cost line to frozen structure', async () => {
      await Scenarios.setupFrozen(ctx);

      await expect(
        ctx.execute(
          TestData.addCostLineCommand('VARIABLE', 1000),
          ctx.handlers.addCostLine,
        ),
      ).rejects.toThrow(/COUT-CS-03/);
    });

    it('rejects updating assumptions on frozen structure', async () => {
      await Scenarios.setupFrozen(ctx);

      await expect(
        ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions),
      ).rejects.toThrow(/COUT-CS-03/);
    });
  });

  describe('Guardian Blocking — Invariant COUT-CS-04 (Assumptions required)', () => {
    it('rejects simulation without assumptions', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', 5000), ctx.handlers.addCostLine);
      // NO assumptions!

      await expect(
        ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation),
      ).rejects.toThrow(/COUT-CS-04/);
    });
  });

  describe('Guardian Blocking — Invariant COUT-SIM-02 (Only SIMULATED can freeze)', () => {
    it('rejects freeze on DRAFT structure', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);

      await expect(
        ctx.execute(TestData.freezeCommand(), ctx.handlers.freezeStructure),
      ).rejects.toThrow(/COUT-SIM-02/);
    });
  });

  describe('Guardian Blocking — Invariant COUT-DEC-01 (Only FROZEN can validate)', () => {
    it('rejects validation on non-frozen project', async () => {
      await Scenarios.setupSimulated(ctx);
      // NOT frozen!

      await expect(
        ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject),
      ).rejects.toThrow(/COUT-DEC-01/);
    });
  });

  describe('Guardian Blocking — Invariant COUT-DEC-02 (Decision is terminal)', () => {
    it('rejects second validation', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      await expect(
        ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject),
      ).rejects.toThrow(/COUT-DEC-02/);
    });

    it('rejects rejection after validation', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      await expect(
        ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject),
      ).rejects.toThrow(/COUT-DEC-02/);
    });

    it('rejects validation after rejection', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);

      await expect(
        ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject),
      ).rejects.toThrow(/COUT-DEC-02/);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 3️⃣ EVENT PERSISTENCE — Verify Events Are Stored
  // ═══════════════════════════════════════════════════════════════

  describe('Event Persistence — Events correctly stored', () => {
    it('persists all events in sequence', async () => {
      await Scenarios.setupFrozen(ctx);
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);

      // Verify all events are persisted
      const projectEvents = ctx.repos.projectRepo.getEvents();
      const csEvents = ctx.repos.costStructureRepo.getEvents();
      const decisionEvents = ctx.repos.decisionRepo.getEvents();

      // Project events: Created, Validated
      expect(projectEvents.map(e => e.eventType)).toContain('EconomicProjectCreated');

      // Cost structure events: Created, LineAdded x2, AssumptionsUpdated, Simulated, Frozen
      expect(csEvents.map(e => e.eventType)).toContain('CostStructureCreated');
      expect(csEvents.filter(e => e.eventType === 'CostLineAdded')).toHaveLength(2);
      expect(csEvents.map(e => e.eventType)).toContain('AssumptionsUpdated');
      expect(csEvents.map(e => e.eventType)).toContain('CostStructureSimulated');
      expect(csEvents.map(e => e.eventType)).toContain('CostStructureFrozen');

      // Decision events
      expect(decisionEvents.map(e => e.eventType)).toContain('DecisionRecorded');
    });

    it('events contain correct tenant isolation', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);

      const events = ctx.repos.projectRepo.getEvents();
      expect(events[0].tenantId).toBe(TestData.tenantId);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 4️⃣ STATE TRANSITIONS — Verify Correct Status Changes
  // ═══════════════════════════════════════════════════════════════

  describe('State Transitions — Correct status progression', () => {
    it('project: DRAFT → FROZEN → APPROVED', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      let project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('DRAFT');

      // Complete the flow to FROZEN
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', 5000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', 5000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);
      await ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);
      await ctx.execute(TestData.freezeCommand(), ctx.handlers.freezeStructure);

      project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('FROZEN');

      // Validate
      await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);
      project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('APPROVED');
    });

    it('project: DRAFT → FROZEN → REJECTED', async () => {
      await Scenarios.setupFrozen(ctx);

      await ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);

      const project = await ctx.repos.projectRepo.load(TestData.tenantId, TestData.projectId);
      expect(project?.status).toBe('REJECTED');
    });

    it('cost structure: DRAFT → SIMULATED → FROZEN', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);

      let cs = await ctx.repos.costStructureRepo.loadAggregate(TestData.tenantId, TestData.projectId, 1);
      expect(cs?.status).toBe('DRAFT');

      await ctx.execute(TestData.addCostLineCommand('VARIABLE', 5000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', 5000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);
      await ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);

      cs = await ctx.repos.costStructureRepo.loadAggregate(TestData.tenantId, TestData.projectId, 1);
      expect(cs?.status).toBe('SIMULATED');

      await ctx.execute(TestData.freezeCommand(), ctx.handlers.freezeStructure);

      cs = await ctx.repos.costStructureRepo.loadAggregate(TestData.tenantId, TestData.projectId, 1);
      expect(cs?.status).toBe('FROZEN');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 5️⃣ SIMULATION CALCULATIONS — Verify Guardian Calculates Correctly
  // ═══════════════════════════════════════════════════════════════

  describe('Simulation Calculations — Guardian computes correctly', () => {
    it('calculates correct break-even point', async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      
      // Variable: 6000, Fixed: 4000, Total: 10000
      // Unit variable cost = 6000 / 1000 = 6
      // Contribution margin = 100 - 6 = 94
      // Break-even = 4000 / 94 = 42.55 → 43
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', 6000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', 4000), ctx.handlers.addCostLine);
      await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);

      const events = await ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);

      const bePayload = events[0].payload as CostStructureSimulatedPayload;
      expect(bePayload.breakEvenPoint).toBe(43);
    });

    it('calculates scenario results', async () => {
      await Scenarios.setupDraftWithCosts(ctx);

      const events = await ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);

      const scenPayload = events[0].payload as CostStructureSimulatedPayload;
      const scenarios = scenPayload.scenarioResults;
      expect(scenarios).toBeDefined();
      expect(scenarios.pessimistic).toBeDefined();
      expect(scenarios.realistic).toBeDefined();
      expect(scenarios.optimistic).toBeDefined();

      // Pessimistic margin should be less than optimistic
      expect(scenarios.pessimistic.margin).toBeLessThan(scenarios.optimistic.margin);
    });
  });
});
