/**
 * Integration Tests — Table-Driven Invariant Tests
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Tests paramétrés pour validation exhaustive des invariants.
 * Format table-driven pour maintenabilité et lisibilité.
 */

import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { createTestContext, TestData, Scenarios, type TestContext } from './fixtures/test-context.js';
import type { CostStructureSimulatedPayload } from '../../domain/events/index.js';

describe('INTEGRATION — Table-Driven Invariant Tests', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  beforeEach(() => {
    ctx.clear();
  });

  // ═══════════════════════════════════════════════════════════════
  // COUT-01: Variable Cost Ratio Boundary Tests
  // ═══════════════════════════════════════════════════════════════

  describe.each([
    { variable: 5000, fixed: 5000, ratio: 0.50, shouldPass: true, description: '50% variable' },
    { variable: 6000, fixed: 4000, ratio: 0.60, shouldPass: true, description: '60% variable' },
    { variable: 6500, fixed: 3500, ratio: 0.65, shouldPass: true, description: '65% variable' },
    { variable: 7000, fixed: 3000, ratio: 0.70, shouldPass: true, description: '70% variable (limite)' },
    { variable: 7001, fixed: 2999, ratio: 0.7001, shouldPass: false, description: '70.01% variable' },
    { variable: 7100, fixed: 2900, ratio: 0.71, shouldPass: false, description: '71% variable' },
    { variable: 7500, fixed: 2500, ratio: 0.75, shouldPass: false, description: '75% variable' },
    { variable: 8000, fixed: 2000, ratio: 0.80, shouldPass: false, description: '80% variable' },
    { variable: 9000, fixed: 1000, ratio: 0.90, shouldPass: false, description: '90% variable' },
  ])('COUT-01: $description', ({ variable, fixed, shouldPass }) => {
    it(`should ${shouldPass ? 'PASS' : 'REJECT'} simulation`, async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', variable), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', fixed), ctx.handlers.addCostLine);
      await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);

      const cmd = TestData.runSimulationCommand();

      if (shouldPass) {
        const events = await ctx.execute(cmd, ctx.handlers.runSimulation);
        expect(events[0].eventType).toBe('CostStructureSimulated');
      } else {
        await expect(ctx.execute(cmd, ctx.handlers.runSimulation)).rejects.toThrow(/COUT-01/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // COUT-CS-02: Cost Category Validation
  // ═══════════════════════════════════════════════════════════════

  describe.each([
    { category: 'VARIABLE', shouldPass: true },
    { category: 'FIXED', shouldPass: true },
    { category: 'INDIRECT', shouldPass: true },
  ])('COUT-CS-02: Category $category', ({ category, shouldPass }) => {
    it(`should ${shouldPass ? 'accept' : 'reject'} ${category} category`, async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);

      const cmd = TestData.addCostLineCommand(category as 'VARIABLE' | 'FIXED' | 'INDIRECT', 1000);

      if (shouldPass) {
        const events = await ctx.execute(cmd, ctx.handlers.addCostLine);
        expect(events[0].eventType).toBe('CostLineAdded');
      } else {
        await expect(ctx.execute(cmd, ctx.handlers.addCostLine)).rejects.toThrow(/COUT-CS-02/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // State Machine Tests
  // ═══════════════════════════════════════════════════════════════

  describe.each([
    { from: 'DRAFT', action: 'freeze', shouldPass: false, invariant: 'COUT-SIM-02' },
    { from: 'DRAFT', action: 'simulate', shouldPass: true, invariant: null },
    { from: 'SIMULATED', action: 'freeze', shouldPass: true, invariant: null },
    { from: 'SIMULATED', action: 'validate', shouldPass: false, invariant: 'COUT-DEC-01' },
    { from: 'FROZEN', action: 'validate', shouldPass: true, invariant: null },
    { from: 'FROZEN', action: 'reject', shouldPass: true, invariant: null },
    { from: 'FROZEN', action: 'addCostLine', shouldPass: false, invariant: 'COUT-CS-03' },
  ])('State Machine: $from → $action', ({ from, action, shouldPass, invariant }) => {
    it(`should ${shouldPass ? 'ALLOW' : 'BLOCK'} ${action} from ${from}`, async () => {
      // Setup to target state
      if (from === 'DRAFT') {
        await Scenarios.setupDraftWithCosts(ctx);
      } else if (from === 'SIMULATED') {
        await Scenarios.setupSimulated(ctx);
      } else if (from === 'FROZEN') {
        await Scenarios.setupFrozen(ctx);
      }

      // Execute action
      let promise: Promise<any>;
      switch (action) {
        case 'simulate':
          promise = ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);
          break;
        case 'freeze':
          promise = ctx.execute(TestData.freezeCommand(), ctx.handlers.freezeStructure);
          break;
        case 'validate':
          promise = ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);
          break;
        case 'reject':
          promise = ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);
          break;
        case 'addCostLine':
          promise = ctx.execute(TestData.addCostLineCommand('VARIABLE', 1000), ctx.handlers.addCostLine);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (shouldPass) {
        await expect(promise).resolves.toBeDefined();
      } else {
        await expect(promise).rejects.toThrow(new RegExp(invariant!));
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Decision Finality Tests
  // ═══════════════════════════════════════════════════════════════

  describe.each([
    { first: 'validate', second: 'validate', shouldPass: false },
    { first: 'validate', second: 'reject', shouldPass: false },
    { first: 'reject', second: 'validate', shouldPass: false },
    { first: 'reject', second: 'reject', shouldPass: false },
  ])('COUT-DEC-02: $first then $second', ({ first, second, shouldPass }) => {
    it(`should ${shouldPass ? 'ALLOW' : 'BLOCK'} ${second} after ${first}`, async () => {
      await Scenarios.setupFrozen(ctx);

      // First decision
      if (first === 'validate') {
        await ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject);
      } else {
        await ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);
      }

      // Second decision
      const promise = second === 'validate'
        ? ctx.execute(TestData.validateProjectCommand(), ctx.handlers.validateProject)
        : ctx.execute(TestData.rejectProjectCommand(), ctx.handlers.rejectProject);

      if (shouldPass) {
        await expect(promise).resolves.toBeDefined();
      } else {
        await expect(promise).rejects.toThrow(/COUT-DEC-02/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Break-Even Calculation Tests
  // ═══════════════════════════════════════════════════════════════

  describe.each([
    { variable: 6000, fixed: 4000, price: 100, volume: 1000, expectedBE: 43 },
    { variable: 5000, fixed: 5000, price: 100, volume: 1000, expectedBE: 53 },
    { variable: 3000, fixed: 7000, price: 100, volume: 1000, expectedBE: 73 },
    { variable: 2000, fixed: 8000, price: 100, volume: 1000, expectedBE: 82 },
  ])('Break-Even: variable=$variable, fixed=$fixed', ({ variable, fixed, price, volume, expectedBE }) => {
    it(`should calculate break-even as ${expectedBE}`, async () => {
      await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
      await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
      await ctx.execute(TestData.addCostLineCommand('VARIABLE', variable), ctx.handlers.addCostLine);
      await ctx.execute(TestData.addCostLineCommand('FIXED', fixed), ctx.handlers.addCostLine);
      await ctx.execute(
        TestData.updateAssumptionsCommand(1, { priceTarget: price, expectedVolume: volume }),
        ctx.handlers.updateAssumptions,
      );

      const events = await ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);

      const simPayload = events[0].payload as CostStructureSimulatedPayload;
      expect(simPayload.breakEvenPoint).toBe(expectedBE);
    });
  });
});
