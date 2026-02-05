/**
 * Guardian Unit Tests
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Tests unitaires du Guardian isolé
 */

import { describe, it, expect } from '@jest/globals';
import { 
  CostStructureGuardian, 
  InvariantViolationError,
  type GuardianContext,
} from '../domain/guardian/cost-structure.guardian';
import { RunSimulationCommand } from '../application/commands/run-simulation.command';

describe('CostStructureGuardian', () => {
  const guardian = new CostStructureGuardian();

  describe('COUT-01: Variable cost ratio calculation', () => {
    it('should calculate correct ratio and pass at 60%', () => {
      const command = new RunSimulationCommand('tenant-001', 'project-001', 1, 'user-001');
      
      const state: GuardianContext = {
        costStructure: {
          projectId: 'project-001',
          tenantId: 'tenant-001',
          version: 1,
          status: 'DRAFT',
          costLines: [
            { lineId: '1', category: 'VARIABLE', label: 'A', amount: 6000, currency: 'EUR' },
            { lineId: '2', category: 'FIXED', label: 'B', amount: 4000, currency: 'EUR' },
          ],
          assumptions: {
            priceTarget: 100,
            expectedVolume: 1000,
            capacityMax: 2000,
            scenarios: { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
          },
        },
      };

      const result = guardian.validate(command, state);

      expect(result.costStructure?.simulation).toBeDefined();
      expect(result.costStructure?.simulation?.variableCostRatio).toBe(0.6);
      expect(result.costStructure?.simulation?.totalCost).toBe(10000);
    });

    it('should reject at 75%', () => {
      const command = new RunSimulationCommand('tenant-001', 'project-001', 1, 'user-001');
      
      const state: GuardianContext = {
        costStructure: {
          projectId: 'project-001',
          tenantId: 'tenant-001',
          version: 1,
          status: 'DRAFT',
          costLines: [
            { lineId: '1', category: 'VARIABLE', label: 'A', amount: 7500, currency: 'EUR' },
            { lineId: '2', category: 'FIXED', label: 'B', amount: 2500, currency: 'EUR' },
          ],
          assumptions: {
            priceTarget: 100,
            expectedVolume: 1000,
            capacityMax: 2000,
            scenarios: { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
          },
        },
      };

      expect(() => guardian.validate(command, state)).toThrow(InvariantViolationError);
      expect(() => guardian.validate(command, state)).toThrow(/COUT-01/);
    });

    it('should pass at exactly 70%', () => {
      const command = new RunSimulationCommand('tenant-001', 'project-001', 1, 'user-001');
      
      const state: GuardianContext = {
        costStructure: {
          projectId: 'project-001',
          tenantId: 'tenant-001',
          version: 1,
          status: 'DRAFT',
          costLines: [
            { lineId: '1', category: 'VARIABLE', label: 'A', amount: 7000, currency: 'EUR' },
            { lineId: '2', category: 'FIXED', label: 'B', amount: 3000, currency: 'EUR' },
          ],
          assumptions: {
            priceTarget: 100,
            expectedVolume: 1000,
            capacityMax: 2000,
            scenarios: { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
          },
        },
      };

      const result = guardian.validate(command, state);
      expect(result.costStructure?.simulation?.variableCostRatio).toBe(0.7);
    });
  });

  describe('Break-even calculation', () => {
    it('should calculate correct break-even point', () => {
      const command = new RunSimulationCommand('tenant-001', 'project-001', 1, 'user-001');
      
      // Unit variable cost = 6000 / 1000 = 6
      // Contribution margin = 100 - 6 = 94
      // Break-even = 4000 / 94 = 42.55 → 43 units
      const state: GuardianContext = {
        costStructure: {
          projectId: 'project-001',
          tenantId: 'tenant-001',
          version: 1,
          status: 'DRAFT',
          costLines: [
            { lineId: '1', category: 'VARIABLE', label: 'A', amount: 6000, currency: 'EUR' },
            { lineId: '2', category: 'FIXED', label: 'B', amount: 4000, currency: 'EUR' },
          ],
          assumptions: {
            priceTarget: 100,
            expectedVolume: 1000,
            capacityMax: 2000,
            scenarios: { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
          },
        },
      };

      const result = guardian.validate(command, state);

      expect(result.costStructure?.simulation?.breakEvenPoint).toBe(43);
    });
  });

  describe('Scenario calculations', () => {
    it('should calculate scenario results', () => {
      const command = new RunSimulationCommand('tenant-001', 'project-001', 1, 'user-001');
      
      const state: GuardianContext = {
        costStructure: {
          projectId: 'project-001',
          tenantId: 'tenant-001',
          version: 1,
          status: 'DRAFT',
          costLines: [
            { lineId: '1', category: 'VARIABLE', label: 'A', amount: 5000, currency: 'EUR' },
            { lineId: '2', category: 'FIXED', label: 'B', amount: 5000, currency: 'EUR' },
          ],
          assumptions: {
            priceTarget: 100,
            expectedVolume: 1000,
            capacityMax: 2000,
            scenarios: { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
          },
        },
      };

      const result = guardian.validate(command, state);
      const scenarios = result.costStructure?.simulation?.scenarioResults;

      expect(scenarios).toBeDefined();
      expect(scenarios?.pessimistic).toBeDefined();
      expect(scenarios?.realistic).toBeDefined();
      expect(scenarios?.optimistic).toBeDefined();

      // Pessimistic should have lower margin than optimistic
      expect(scenarios?.pessimistic.margin).toBeLessThan(scenarios?.optimistic.margin!);
    });
  });
});
