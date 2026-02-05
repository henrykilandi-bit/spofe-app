/**
 * Cost-Structure Write-Side Tests
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Tests des invariants via le Guardian
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CostStructureWriteSide, type CostStructureModuleConfig } from '../index';
import { InMemoryEconomicProjectRepository } from '../infrastructure/persistence/economic-project.repository';
import { InMemoryCostStructureRepository } from '../infrastructure/persistence/cost-structure.repository';
import { InMemoryDecisionRecordRepository } from '../infrastructure/persistence/decision-record.repository';
import { InvariantViolationError } from '../domain/guardian/cost-structure.guardian';

describe('Cost-Structure Write-Side', () => {
  let writeSide: CostStructureWriteSide;
  let projectRepo: InMemoryEconomicProjectRepository;
  let costStructureRepo: InMemoryCostStructureRepository;
  let decisionRepo: InMemoryDecisionRecordRepository;

  const TENANT_ID = 'tenant-001';
  const ACTOR_ID = 'user-001';

  beforeEach(() => {
    projectRepo = new InMemoryEconomicProjectRepository();
    costStructureRepo = new InMemoryCostStructureRepository();
    decisionRepo = new InMemoryDecisionRecordRepository();

    const config: CostStructureModuleConfig = {
      projectRepository: projectRepo,
      costStructureRepository: costStructureRepo,
      decisionRepository: decisionRepo,
    };

    writeSide = new CostStructureWriteSide(config);
  });

  describe('COUT-EP-01: Unique project name per tenant', () => {
    it('should create a new economic project', async () => {
      const result = await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'New Product Launch',
        'PRODUCT',
        ACTOR_ID,
      );

      expect(result.success).toBe(true);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventType).toBe('EconomicProjectCreated');
    });

    it('should reject duplicate project name in same tenant', async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'New Product Launch',
        'PRODUCT',
        ACTOR_ID,
      );

      await expect(
        writeSide.createEconomicProject(
          TENANT_ID,
          'project-002',
          'New Product Launch', // Same name
          'SERVICE',
          ACTOR_ID,
        ),
      ).rejects.toThrow(InvariantViolationError);
    });

    it('should allow same name in different tenant', async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'New Product Launch',
        'PRODUCT',
        ACTOR_ID,
      );

      const result = await writeSide.createEconomicProject(
        'tenant-002', // Different tenant
        'project-002',
        'New Product Launch',
        'SERVICE',
        ACTOR_ID,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('COUT-CS-02: Valid cost category', () => {
    beforeEach(async () => {
      // Setup project and cost structure
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'Test Project',
        'PRODUCT',
        ACTOR_ID,
      );
      await writeSide.createCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
    });

    it('should accept VARIABLE category', async () => {
      const result = await writeSide.addCostLine(
        TENANT_ID,
        'project-001',
        1,
        'VARIABLE',
        'Raw materials',
        1000,
        'EUR',
        ACTOR_ID,
      );

      expect(result.success).toBe(true);
    });

    it('should accept FIXED category', async () => {
      const result = await writeSide.addCostLine(
        TENANT_ID,
        'project-001',
        1,
        'FIXED',
        'Rent',
        5000,
        'EUR',
        ACTOR_ID,
      );

      expect(result.success).toBe(true);
    });

    it('should accept INDIRECT category', async () => {
      const result = await writeSide.addCostLine(
        TENANT_ID,
        'project-001',
        1,
        'INDIRECT',
        'Admin overhead',
        2000,
        'EUR',
        ACTOR_ID,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('COUT-01: Variable cost ratio ≤ 70%', () => {
    beforeEach(async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'Test Project',
        'PRODUCT',
        ACTOR_ID,
      );
      await writeSide.createCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
    });

    it('should pass simulation when ratio is under 70%', async () => {
      // Add costs: 60% variable, 40% fixed
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'Materials', 6000, 'EUR', ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'FIXED', 'Rent', 4000, 'EUR', ACTOR_ID);

      // Set assumptions
      await writeSide.updateAssumptions(
        TENANT_ID,
        'project-001',
        1,
        100, // priceTarget
        1000, // expectedVolume
        2000, // capacityMax
        { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
        ACTOR_ID,
      );

      // Run simulation
      const result = await writeSide.runSimulation(TENANT_ID, 'project-001', 1, ACTOR_ID);

      expect(result.success).toBe(true);
      expect(result.events[0].eventType).toBe('CostStructureSimulated');
    });

    it('should reject simulation when ratio exceeds 70%', async () => {
      // Add costs: 80% variable, 20% fixed
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'Materials', 8000, 'EUR', ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'FIXED', 'Rent', 2000, 'EUR', ACTOR_ID);

      // Set assumptions
      await writeSide.updateAssumptions(
        TENANT_ID,
        'project-001',
        1,
        100,
        1000,
        2000,
        { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
        ACTOR_ID,
      );

      // Run simulation should fail
      await expect(
        writeSide.runSimulation(TENANT_ID, 'project-001', 1, ACTOR_ID),
      ).rejects.toThrow(/COUT-01/);
    });
  });

  describe('COUT-CS-04: Assumptions required before simulation', () => {
    beforeEach(async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'Test Project',
        'PRODUCT',
        ACTOR_ID,
      );
      await writeSide.createCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'Materials', 5000, 'EUR', ACTOR_ID);
    });

    it('should reject simulation without assumptions', async () => {
      await expect(
        writeSide.runSimulation(TENANT_ID, 'project-001', 1, ACTOR_ID),
      ).rejects.toThrow(/COUT-CS-04/);
    });
  });

  describe('COUT-SIM-02: Only SIMULATED can be frozen', () => {
    beforeEach(async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'Test Project',
        'PRODUCT',
        ACTOR_ID,
      );
      await writeSide.createCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
    });

    it('should reject freeze on DRAFT cost structure', async () => {
      await expect(
        writeSide.freezeCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID),
      ).rejects.toThrow(/COUT-SIM-02/);
    });

    it('should allow freeze on SIMULATED cost structure', async () => {
      // Setup valid cost structure
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'Materials', 5000, 'EUR', ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'FIXED', 'Rent', 5000, 'EUR', ACTOR_ID);
      await writeSide.updateAssumptions(
        TENANT_ID,
        'project-001',
        1,
        100,
        1000,
        2000,
        { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
        ACTOR_ID,
      );
      await writeSide.runSimulation(TENANT_ID, 'project-001', 1, ACTOR_ID);

      // Now freeze should work
      const result = await writeSide.freezeCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);

      expect(result.success).toBe(true);
      expect(result.events[0].eventType).toBe('CostStructureFrozen');
    });
  });

  describe('COUT-CS-03: No modification after freeze', () => {
    beforeEach(async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'Test Project',
        'PRODUCT',
        ACTOR_ID,
      );
      await writeSide.createCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'Materials', 5000, 'EUR', ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'FIXED', 'Rent', 5000, 'EUR', ACTOR_ID);
      await writeSide.updateAssumptions(
        TENANT_ID,
        'project-001',
        1,
        100,
        1000,
        2000,
        { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
        ACTOR_ID,
      );
      await writeSide.runSimulation(TENANT_ID, 'project-001', 1, ACTOR_ID);
      await writeSide.freezeCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
    });

    it('should reject adding cost line to frozen structure', async () => {
      await expect(
        writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'More materials', 1000, 'EUR', ACTOR_ID),
      ).rejects.toThrow(/COUT-CS-03/);
    });

    it('should reject updating assumptions on frozen structure', async () => {
      await expect(
        writeSide.updateAssumptions(
          TENANT_ID,
          'project-001',
          1,
          200,
          2000,
          3000,
          { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
          ACTOR_ID,
        ),
      ).rejects.toThrow(/COUT-CS-03/);
    });
  });

  describe('COUT-DEC-02: Decision is terminal', () => {
    beforeEach(async () => {
      await writeSide.createEconomicProject(
        TENANT_ID,
        'project-001',
        'Test Project',
        'PRODUCT',
        ACTOR_ID,
      );
      await writeSide.createCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'VARIABLE', 'Materials', 5000, 'EUR', ACTOR_ID);
      await writeSide.addCostLine(TENANT_ID, 'project-001', 1, 'FIXED', 'Rent', 5000, 'EUR', ACTOR_ID);
      await writeSide.updateAssumptions(
        TENANT_ID,
        'project-001',
        1,
        100,
        1000,
        2000,
        { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
        ACTOR_ID,
      );
      await writeSide.runSimulation(TENANT_ID, 'project-001', 1, ACTOR_ID);
      await writeSide.freezeCostStructure(TENANT_ID, 'project-001', 1, ACTOR_ID);
    });

    it('should reject second validation', async () => {
      await writeSide.validateProject(TENANT_ID, 'project-001', ACTOR_ID, 'Good ROI');

      await expect(
        writeSide.validateProject(TENANT_ID, 'project-001', ACTOR_ID, 'Still good'),
      ).rejects.toThrow(/COUT-DEC-02/);
    });

    it('should reject rejection after validation', async () => {
      await writeSide.validateProject(TENANT_ID, 'project-001', ACTOR_ID, 'Good ROI');

      await expect(
        writeSide.rejectProject(TENANT_ID, 'project-001', ACTOR_ID, 'Changed mind'),
      ).rejects.toThrow(/COUT-DEC-02/);
    });
  });
});
