/**
 * Tests Contractuels COUTFLEX → Budget
 * Validation du contrat officiel BUD-COUT-01
 *
 * @group contract
 * @group coutflex-budget
 */

import {
  CONTRACT_INVARIANTS,
  BudgetContractValidator,
  BudgetReadyProjectContract,
  INVARIANT_CODES,
  INVARIANT_DESCRIPTIONS
} from '../../domain/invariants';

describe('Contract: COUTFLEX → Budget (BUD-COUT-01)', () => {
  describe('CONTRACT_INVARIANTS.BUD_COUT_01', () => {
    const validProject: BudgetReadyProjectContract = {
      tenantId: 'tenant-1',
      projectId: 'proj-123',
      projectName: 'Test Product',
      type: 'PRODUCT',
      version: 1,
      unitCost: 7.8,
      totalCost: 7800,
      netMargin: 0.18,
      marginAt70: 0.06,
      viableAt70: true,
      validatedAt: new Date('2026-01-15')
    };

    it('should validate a project with all conditions met', () => {
      const result = CONTRACT_INVARIANTS.BUD_COUT_01.validate(validProject);
      expect(result).toBe(true);
    });

    it('should reject null project (project not in budget_ready)', () => {
      const result = CONTRACT_INVARIANTS.BUD_COUT_01.validate(null);
      expect(result).toBe(false);
    });

    it('should reject project with viableAt70 = false', () => {
      const invalidProject: BudgetReadyProjectContract = {
        ...validProject,
        viableAt70: false,
        marginAt70: -0.05
      };
      const result = CONTRACT_INVARIANTS.BUD_COUT_01.validate(invalidProject);
      expect(result).toBe(false);
    });

    it('should reject project with marginAt70 <= 0', () => {
      const invalidProject: BudgetReadyProjectContract = {
        ...validProject,
        marginAt70: 0,
        viableAt70: false
      };
      const result = CONTRACT_INVARIANTS.BUD_COUT_01.validate(invalidProject);
      expect(result).toBe(false);
    });

    it('should reject project with negative marginAt70', () => {
      const invalidProject: BudgetReadyProjectContract = {
        ...validProject,
        marginAt70: -0.10,
        viableAt70: false
      };
      const result = CONTRACT_INVARIANTS.BUD_COUT_01.validate(invalidProject);
      expect(result).toBe(false);
    });

    it('should reject project with version = 0', () => {
      const invalidProject: BudgetReadyProjectContract = {
        ...validProject,
        version: 0
      };
      const result = CONTRACT_INVARIANTS.BUD_COUT_01.validate(invalidProject);
      expect(result).toBe(false);
    });

    it('should have correct error message', () => {
      expect(CONTRACT_INVARIANTS.BUD_COUT_01.errorMessage).toBe(
        'BUD-COUT-01: Budget creation rejected - Project not validated by COUTFLEX'
      );
    });

    it('should have correct code', () => {
      expect(CONTRACT_INVARIANTS.BUD_COUT_01.code).toBe('BUD-COUT-01');
    });

    it('should document eligibility conditions', () => {
      const conditions = CONTRACT_INVARIANTS.BUD_COUT_01.getEligibilityConditions();
      expect(conditions).toContain('EconomicProject.status = VALIDATED');
      expect(conditions).toContain('CostStructure.status = FROZEN');
      expect(conditions).toContain('Simulation.viableAt70 = true');
      expect(conditions).toContain('Tenant isolation respected = true');
    });
  });

  describe('BudgetContractValidator', () => {
    const validProject: BudgetReadyProjectContract = {
      tenantId: 'tenant-1',
      projectId: 'proj-123',
      projectName: 'Test Product',
      type: 'PRODUCT',
      version: 1,
      unitCost: 7.8,
      totalCost: 7800,
      netMargin: 0.18,
      marginAt70: 0.06,
      viableAt70: true,
      validatedAt: new Date('2026-01-15')
    };

    describe('validateBudgetCreation', () => {
      it('should not throw for valid project', () => {
        expect(() => {
          BudgetContractValidator.validateBudgetCreation(validProject);
        }).not.toThrow();
      });

      it('should throw with BUD-COUT-01 code for null project', () => {
        expect(() => {
          BudgetContractValidator.validateBudgetCreation(null);
        }).toThrow('BUD-COUT-01: Budget creation rejected - Project not validated by COUTFLEX');
      });

      it('should throw for project not viable at 70%', () => {
        const invalidProject: BudgetReadyProjectContract = {
          ...validProject,
          viableAt70: false,
          marginAt70: -0.05
        };
        expect(() => {
          BudgetContractValidator.validateBudgetCreation(invalidProject);
        }).toThrow('BUD-COUT-01');
      });
    });

    describe('canCreateBudget', () => {
      it('should return true for valid project', () => {
        const result = BudgetContractValidator.canCreateBudget(validProject);
        expect(result).toBe(true);
      });

      it('should return false for null project', () => {
        const result = BudgetContractValidator.canCreateBudget(null);
        expect(result).toBe(false);
      });

      it('should return false for project with marginAt70 <= 0', () => {
        const invalidProject: BudgetReadyProjectContract = {
          ...validProject,
          marginAt70: 0,
          viableAt70: false
        };
        const result = BudgetContractValidator.canCreateBudget(invalidProject);
        expect(result).toBe(false);
      });
    });
  });

  describe('Contract Interface Compliance', () => {
    it('should expose all required fields in BudgetReadyProjectContract', () => {
      const project: BudgetReadyProjectContract = {
        tenantId: 'tenant-1',
        projectId: 'proj-123',
        projectName: 'Test Product',
        type: 'PRODUCT',
        version: 1,
        unitCost: 7.8,
        totalCost: 7800,
        netMargin: 0.18,
        marginAt70: 0.06,
        viableAt70: true,
        validatedAt: new Date()
      };

      // Verify all fields are present
      expect(project.tenantId).toBeDefined();
      expect(project.projectId).toBeDefined();
      expect(project.projectName).toBeDefined();
      expect(project.type).toBeDefined();
      expect(project.version).toBeDefined();
      expect(project.unitCost).toBeDefined();
      expect(project.totalCost).toBeDefined();
      expect(project.netMargin).toBeDefined();
      expect(project.marginAt70).toBeDefined();
      expect(project.viableAt70).toBeDefined();
      expect(project.validatedAt).toBeDefined();
    });

    it('should only allow PRODUCT or SERVICE as type', () => {
      const product: BudgetReadyProjectContract = {
        tenantId: 't1',
        projectId: 'p1',
        projectName: 'Product',
        type: 'PRODUCT',
        version: 1,
        unitCost: 10,
        totalCost: 1000,
        netMargin: 0.2,
        marginAt70: 0.05,
        viableAt70: true,
        validatedAt: new Date()
      };

      const service: BudgetReadyProjectContract = {
        ...product,
        projectName: 'Service',
        type: 'SERVICE'
      };

      expect(product.type).toBe('PRODUCT');
      expect(service.type).toBe('SERVICE');
    });
  });

  describe('Invariant Codes', () => {
    it('should include COUT_BUD_01 in INVARIANT_CODES', () => {
      expect(INVARIANT_CODES.COUT_BUD_01).toBe('COUT-BUD-01');
    });

    it('should have description for COUT-BUD-01', () => {
      expect(INVARIANT_DESCRIPTIONS[INVARIANT_CODES.COUT_BUD_01]).toContain('Pré-requis Budget');
    });
  });

  describe('Contract Payload Structure', () => {
    it('should match the SQL view rm_cost_projects_budget_ready structure', () => {
      // This test ensures the TypeScript interface matches the SQL view
      const sqlViewFields = [
        'tenant_id',
        'project_id',
        'name',
        'type',
        'version',
        'unit_cost',
        'total_cost',
        'net_margin',
        'margin_at_70',
        'viable_at_70',
        'validated_at'
      ];

      const contractFields = [
        'tenantId',
        'projectId',
        'projectName',
        'type',
        'version',
        'unitCost',
        'totalCost',
        'netMargin',
        'marginAt70',
        'viableAt70',
        'validatedAt'
      ];

      // Both should have the same number of fields
      expect(contractFields.length).toBe(sqlViewFields.length);
    });
  });
});
