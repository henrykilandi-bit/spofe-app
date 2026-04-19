/**
 * Tests Guardian - Invariants Budget
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 3
 * Principe: 1 invariant = 1 test
 */

import { describe, it, expect } from '@jest/globals';
import { BudgetInvariants } from '../../guardian/budget.invariants';
import { BudgetObjectif, BudgetObjectifAggregate } from '../../domain/budget.aggregate';
import { Period, Quantity, Money, PaymentTerm } from '../../domain/value-objects';

describe('Budget Guardian Invariants', () => {
  
  it('INV-BO-01 should reject duplicate budget for same period', () => {
    const period = new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY');
    
    const newBudget: BudgetObjectif = {
      id: 'budget_2',
      tenantId: 'TENANT_A',
      period,
      status: 'DRAFT',
      objectives: [],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const existingBudgets: BudgetObjectif[] = [{
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period,
      status: 'VALIDATED',
      objectives: [],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    }];

    const result = BudgetInvariants.invariantSingleActiveBudgetPerPeriod(newBudget, existingBudgets);
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-01');
  });

  it('INV-BO-03 should reject invalid state transition', () => {
    const result = BudgetInvariants.invariantAllowedStateTransitions('CLOSED', 'DRAFT');
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-03');
  });

  it('INV-BO-03 should allow valid state transition DRAFT -> VALIDATED', () => {
    const result = BudgetInvariants.invariantAllowedStateTransitions('DRAFT', 'VALIDATED');
    
    expect(result.ok).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('INV-BO-04 should reject modification of validated budget', () => {
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'VALIDATED',
      objectives: [],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const result = BudgetInvariants.invariantImmutableAfterValidation(budget);
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-04');
  });

  it('INV-BO-06 should reject negative quantities', () => {
    // Test that negative quantities are rejected at Value Object level
    expect(() => new Quantity(-10)).toThrow('INVALID_QUANTITY');
    
    // Test with valid budget to ensure Guardian works correctly  
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'DRAFT',
      objectives: [
        {
          productId: 'P1',
          productName: 'Product 1',
          targetQuantity: new Quantity(10), // Valid positive quantity
          unitPrice: new Money(100),
          totalAmount: new Money(1000),
          category: 'SALES',
        },
      ],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    // Test that Guardian accepts valid positive quantities
    const result = BudgetInvariants.invariantObjectivesQuantifiable(budget);
    expect(result.ok).toBe(true);
  });

  it('INV-BO-09 should reject objective exceeding capacity', () => {
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'DRAFT',
      objectives: [
        {
          productId: 'P1',
          productName: 'Product 1',
          targetQuantity: new Quantity(100),
          unitPrice: new Money(100),
          totalAmount: new Money(10000),
          category: 'SALES',
        },
      ],
      salesCapacities: [
        {
          productId: 'P1',
          maxCapacity: new Quantity(50),
          currentUtilization: new Quantity(0),
          availableCapacity: new Quantity(50),
        },
      ],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const result = BudgetInvariants.invariantCapacityNotExceeded(budget);
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-09');
  });

  it('INV-BO-11 should reject budget without capacity defined', () => {
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'VALIDATED',
      objectives: [
        {
          productId: 'P1',
          productName: 'Product 1',
          targetQuantity: new Quantity(100),
          unitPrice: new Money(100),
          totalAmount: new Money(10000),
          category: 'SALES',
        },
      ],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const result = BudgetInvariants.invariantObjectivesHaveCapacity(budget);
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-11');
  });

  it('INV-BO-12 should reject budget without cost structure', () => {
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'VALIDATED',
      objectives: [
        {
          productId: 'P1',
          productName: 'Product 1',
          targetQuantity: new Quantity(100),
          unitPrice: new Money(100),
          totalAmount: new Money(10000),
          category: 'SALES',
        },
      ],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const result = BudgetInvariants.invariantObjectivesHaveCostStructure(budget);
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-12');
  });

  it('INV-BO-15 should reject budget without payment terms', () => {
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'VALIDATED',
      objectives: [],
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const result = BudgetInvariants.invariantPaymentTermsDefined(budget);
    
    expect(result.ok).toBe(false);
    expect(result.violations[0].code).toBe('INV-BO-15');
  });

  it('should validate all invariants for complete budget', () => {
    const budget: BudgetObjectif = {
      id: 'budget_1',
      tenantId: 'TENANT_A',
      period: new Period(new Date('2026-01-01'), new Date('2026-12-31'), 'MONTHLY'),
      status: 'VALIDATED',
      objectives: [
        {
          productId: 'P1',
          productName: 'Product 1',
          targetQuantity: new Quantity(50),
          unitPrice: new Money(100),
          totalAmount: new Money(5000),
          category: 'SALES',
        },
      ],
      salesCapacities: [
        {
          productId: 'P1',
          maxCapacity: new Quantity(100),
          currentUtilization: new Quantity(0),
          availableCapacity: new Quantity(100),
        },
      ],
      costStructures: [
        {
          productId: 'P1',
          fixedCosts: new Money(1000),
          variableCostPerUnit: new Money(20),
          totalEstimatedCost: new Money(2000),
        },
      ],
      paymentTerms: {
        customerPaymentTerm: new PaymentTerm(30),
        supplierPaymentTerm: new PaymentTerm(60),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
      version: 1,
    };

    const result = BudgetInvariants.validateAll(budget, []);
    
    expect(result.ok).toBe(true);
    expect(result.violations.length).toBe(0);
  });
});
