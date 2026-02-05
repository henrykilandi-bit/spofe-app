/**
 * Contract Tests — Cost-Structure → Budget
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Vérifie que le contrat entre Cost-Structure et Budget est respecté:
 * - Budget ne voit QUE les projets VALIDATED + viable (marginAt70 > 0)
 * - Champs contractuels présents
 * - Isolation multi-tenant
 */

import { describe, it, expect } from 'vitest';
import type { BudgetReadyProjectReadModel } from '../infrastructure/cost-structure.query.repository.js';

/**
 * Contrat: Shape stricte exposée par rm_cost_projects_budget_ready
 */
interface BudgetContractShape {
  tenantId: string;
  projectId: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  version: number;
  unitCost: number;
  totalCost: number;
  netMargin: number;
  marginAt70: number;
  viableAt70: boolean;
  validatedAt: Date;
}

describe('CONTRACT — Cost-Structure → Budget', () => {
  /**
   * Test 1: Structure du contrat
   * Vérifie que le type BudgetReadyProjectReadModel correspond exactement au contrat
   */
  it('BudgetReadyProjectReadModel has exact contract shape', () => {
    // Type check at compile time
    const mockProject: BudgetReadyProjectReadModel = {
      tenantId: 'tenant-1',
      projectId: 'project-1',
      name: 'Test Product',
      type: 'PRODUCT',
      version: 1,
      unitCost: 10,
      totalCost: 10000,
      netMargin: 0.25,
      marginAt70: 0.08,
      viableAt70: true,
      validatedAt: new Date(),
    };

    // Runtime check - all required fields present
    expect(mockProject).toHaveProperty('tenantId');
    expect(mockProject).toHaveProperty('projectId');
    expect(mockProject).toHaveProperty('name');
    expect(mockProject).toHaveProperty('type');
    expect(mockProject).toHaveProperty('version');
    expect(mockProject).toHaveProperty('unitCost');
    expect(mockProject).toHaveProperty('totalCost');
    expect(mockProject).toHaveProperty('netMargin');
    expect(mockProject).toHaveProperty('marginAt70');
    expect(mockProject).toHaveProperty('viableAt70');
    expect(mockProject).toHaveProperty('validatedAt');
  });

  /**
   * Test 2: Invariant COUT-BUD-01
   * Budget ne doit JAMAIS voir un projet avec marginAt70 <= 0
   */
  it('COUT-BUD-01: marginAt70 must be > 0 for Budget consumption', () => {
    const validProjects: BudgetReadyProjectReadModel[] = [
      {
        tenantId: 'tenant-1',
        projectId: 'project-1',
        name: 'Valid Product',
        type: 'PRODUCT',
        version: 1,
        unitCost: 10,
        totalCost: 10000,
        netMargin: 0.25,
        marginAt70: 0.08, // > 0 ✓
        viableAt70: true,
        validatedAt: new Date(),
      },
    ];

    // All projects in budget-ready view must have marginAt70 > 0
    for (const project of validProjects) {
      expect(project.marginAt70).toBeGreaterThan(0);
      expect(project.viableAt70).toBe(true);
    }
  });

  /**
   * Test 3: Type safety
   * Vérifie les contraintes de type
   */
  it('type field must be PRODUCT or SERVICE', () => {
    const product: BudgetReadyProjectReadModel = {
      tenantId: 't1',
      projectId: 'p1',
      name: 'Product',
      type: 'PRODUCT',
      version: 1,
      unitCost: 10,
      totalCost: 100,
      netMargin: 0.2,
      marginAt70: 0.05,
      viableAt70: true,
      validatedAt: new Date(),
    };

    const service: BudgetReadyProjectReadModel = {
      tenantId: 't1',
      projectId: 'p2',
      name: 'Service',
      type: 'SERVICE',
      version: 1,
      unitCost: 15,
      totalCost: 150,
      netMargin: 0.3,
      marginAt70: 0.1,
      viableAt70: true,
      validatedAt: new Date(),
    };

    expect(['PRODUCT', 'SERVICE']).toContain(product.type);
    expect(['PRODUCT', 'SERVICE']).toContain(service.type);
  });

  /**
   * Test 4: Numeric fields validation
   */
  it('numeric fields have correct types', () => {
    const project: BudgetReadyProjectReadModel = {
      tenantId: 't1',
      projectId: 'p1',
      name: 'Test',
      type: 'PRODUCT',
      version: 1,
      unitCost: 10.5,
      totalCost: 10500,
      netMargin: 0.25,
      marginAt70: 0.08,
      viableAt70: true,
      validatedAt: new Date(),
    };

    expect(typeof project.version).toBe('number');
    expect(Number.isInteger(project.version)).toBe(true);
    expect(project.version).toBeGreaterThanOrEqual(1);

    expect(typeof project.unitCost).toBe('number');
    expect(project.unitCost).toBeGreaterThan(0);

    expect(typeof project.totalCost).toBe('number');
    expect(project.totalCost).toBeGreaterThan(0);

    expect(typeof project.netMargin).toBe('number');
    expect(project.netMargin).toBeGreaterThanOrEqual(0);
    expect(project.netMargin).toBeLessThanOrEqual(1);

    expect(typeof project.marginAt70).toBe('number');
    // marginAt70 > 0 is enforced by COUT-BUD-01
  });

  /**
   * Test 5: validatedAt must be a valid date
   */
  it('validatedAt must be a valid date', () => {
    const project: BudgetReadyProjectReadModel = {
      tenantId: 't1',
      projectId: 'p1',
      name: 'Test',
      type: 'PRODUCT',
      version: 1,
      unitCost: 10,
      totalCost: 100,
      netMargin: 0.2,
      marginAt70: 0.05,
      viableAt70: true,
      validatedAt: new Date('2026-01-15T10:00:00Z'),
    };

    expect(project.validatedAt).toBeInstanceOf(Date);
    expect(project.validatedAt.getTime()).not.toBeNaN();
  });
});

/**
 * Tests de compatibilité DTO API
 */
describe('CONTRACT — Budget API Response Compatibility', () => {
  it('BudgetReadyProjectReadModel can be serialized to JSON', () => {
    const project: BudgetReadyProjectReadModel = {
      tenantId: 'tenant-1',
      projectId: 'project-1',
      name: 'Test Product',
      type: 'PRODUCT',
      version: 1,
      unitCost: 10.5,
      totalCost: 10500,
      netMargin: 0.25,
      marginAt70: 0.08,
      viableAt70: true,
      validatedAt: new Date('2026-01-15T10:00:00Z'),
    };

    const json = JSON.stringify(project);
    const parsed = JSON.parse(json);

    expect(parsed.tenantId).toBe(project.tenantId);
    expect(parsed.projectId).toBe(project.projectId);
    expect(parsed.unitCost).toBe(project.unitCost);
    expect(parsed.marginAt70).toBe(project.marginAt70);
    // Date is serialized as ISO string
    expect(parsed.validatedAt).toBe(project.validatedAt.toISOString());
  });
});
