/**
 * Invariants Guardian - Module Budget
 * 8 invariants contractuels (MODULE_BUDGET_CONTRACT.md Section 4)
 */

import { BudgetObjectif, BudgetStatus } from '../domain/budget.aggregate';
import { Period } from '../domain/value-objects';

export interface GuardianViolation {
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface GuardianResult {
  ok: boolean;
  violations: GuardianViolation[];
}

export class BudgetInvariants {
  /**
   * INV-BO-01: Unicité période
   * Un seul budget actif par période et par tenant
   */
  static invariantSingleActiveBudgetPerPeriod(
    newBudget: BudgetObjectif,
    existingBudgets: BudgetObjectif[]
  ): GuardianResult {
    const overlapping = existingBudgets.filter(
      (b) =>
        b.tenantId === newBudget.tenantId &&
        b.status !== 'CLOSED' &&
        b.id !== newBudget.id &&
        this.periodsOverlap(b.period, newBudget.period)
    );

    if (overlapping.length > 0) {
      return {
        ok: false,
        violations: [
          {
            code: 'INV-BO-01',
            message: `Budget already exists for overlapping period: ${overlapping[0].id}`,
            severity: 'ERROR',
          },
        ],
      };
    }

    return { ok: true, violations: [] };
  }

  /**
   * INV-BO-03: Transitions état autorisées
   * DRAFT → VALIDATED → CLOSED
   */
  static invariantAllowedStateTransitions(
    currentStatus: BudgetStatus,
    newStatus: BudgetStatus
  ): GuardianResult {
    const allowedTransitions: Record<BudgetStatus, BudgetStatus[]> = {
      DRAFT: ['VALIDATED'],
      VALIDATED: ['CLOSED'],
      CLOSED: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return {
        ok: false,
        violations: [
          {
            code: 'INV-BO-03',
            message: `Invalid state transition: ${currentStatus} → ${newStatus}`,
            severity: 'ERROR',
          },
        ],
      };
    }

    return { ok: true, violations: [] };
  }

  /**
   * INV-BO-04: Immutabilité après validation
   * Aucune modification après VALIDATED sauf transition vers CLOSED
   */
  static invariantImmutableAfterValidation(budget: BudgetObjectif): GuardianResult {
    if (budget.status === 'VALIDATED' || budget.status === 'CLOSED') {
      return {
        ok: false,
        violations: [
          {
            code: 'INV-BO-04',
            message: `Cannot modify budget in ${budget.status} status`,
            severity: 'ERROR',
          },
        ],
      };
    }

    return { ok: true, violations: [] };
  }

  /**
   * INV-BO-06: Objectifs quantifiables
   * Toutes les quantités doivent être >= 0
   */
  static invariantObjectivesQuantifiable(budget: BudgetObjectif): GuardianResult {
    const violations: GuardianViolation[] = [];

    budget.objectives.forEach((obj, index) => {
      if (obj.targetQuantity.value < 0) {
        violations.push({
          code: 'INV-BO-06',
          message: `Objective ${index} has negative quantity: ${obj.targetQuantity.value}`,
          severity: 'ERROR',
        });
      }
      if (obj.unitPrice.amount < 0) {
        violations.push({
          code: 'INV-BO-06',
          message: `Objective ${index} has negative unit price: ${obj.unitPrice.amount}`,
          severity: 'ERROR',
        });
      }
    });

    return {
      ok: violations.length === 0,
      violations,
    };
  }

  /**
   * INV-BO-09: Capacité non dépassée
   * Objectif <= capacité disponible
   */
  static invariantCapacityNotExceeded(budget: BudgetObjectif): GuardianResult {
    const violations: GuardianViolation[] = [];

    budget.objectives.forEach((obj) => {
      const capacity = budget.salesCapacities.find((c) => c.productId === obj.productId);
      if (capacity && obj.targetQuantity.value > capacity.availableCapacity.value) {
        violations.push({
          code: 'INV-BO-09',
          message: `Objective for ${obj.productId} exceeds available capacity: ${obj.targetQuantity.value} > ${capacity.availableCapacity.value}`,
          severity: 'ERROR',
        });
      }
    });

    return {
      ok: violations.length === 0,
      violations,
    };
  }

  /**
   * INV-BO-11: Capacité définie
   * Chaque objectif doit avoir une capacité définie avant validation
   */
  static invariantObjectivesHaveCapacity(budget: BudgetObjectif): GuardianResult {
    if (budget.status === 'DRAFT') {
      return { ok: true, violations: [] };
    }

    const violations: GuardianViolation[] = [];

    budget.objectives.forEach((obj) => {
      const hasCapacity = budget.salesCapacities.some((c) => c.productId === obj.productId);
      if (!hasCapacity) {
        violations.push({
          code: 'INV-BO-11',
          message: `Objective for ${obj.productId} has no capacity defined`,
          severity: 'ERROR',
        });
      }
    });

    return {
      ok: violations.length === 0,
      violations,
    };
  }

  /**
   * INV-BO-12: Structure coûts définie
   * Chaque objectif doit avoir une structure de coûts avant validation
   */
  static invariantObjectivesHaveCostStructure(budget: BudgetObjectif): GuardianResult {
    if (budget.status === 'DRAFT') {
      return { ok: true, violations: [] };
    }

    const violations: GuardianViolation[] = [];

    budget.objectives.forEach((obj) => {
      const hasCostStructure = budget.costStructures.some((c) => c.productId === obj.productId);
      if (!hasCostStructure) {
        violations.push({
          code: 'INV-BO-12',
          message: `Objective for ${obj.productId} has no cost structure defined`,
          severity: 'ERROR',
        });
      }
    });

    return {
      ok: violations.length === 0,
      violations,
    };
  }

  /**
   * INV-BO-15: Termes paiement requis
   * Les termes de paiement doivent être définis avant validation
   */
  static invariantPaymentTermsDefined(budget: BudgetObjectif): GuardianResult {
    if (budget.status === 'DRAFT') {
      return { ok: true, violations: [] };
    }

    if (!budget.paymentTerms) {
      return {
        ok: false,
        violations: [
          {
            code: 'INV-BO-15',
            message: 'Payment terms must be defined before validation',
            severity: 'ERROR',
          },
        ],
      };
    }

    return { ok: true, violations: [] };
  }

  private static periodsOverlap(p1: Period, p2: Period): boolean {
    return p1.startDate < p2.endDate && p2.startDate < p1.endDate;
  }

  /**
   * Valide tous les invariants pour un budget
   */
  static validateAll(
    budget: BudgetObjectif,
    existingBudgets: BudgetObjectif[] = []
  ): GuardianResult {
    const results = [
      this.invariantSingleActiveBudgetPerPeriod(budget, existingBudgets),
      this.invariantObjectivesQuantifiable(budget),
      this.invariantCapacityNotExceeded(budget),
      this.invariantObjectivesHaveCapacity(budget),
      this.invariantObjectivesHaveCostStructure(budget),
      this.invariantPaymentTermsDefined(budget),
    ];

    const allViolations = results.flatMap((r) => r.violations);

    return {
      ok: allViolations.length === 0,
      violations: allViolations,
    };
  }
}
