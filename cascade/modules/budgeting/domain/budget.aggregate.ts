/**
 * Aggregate Root - BudgetObjectif
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */

import { Period } from './value-objects';
import { BudgetObjectiveItem, SalesCapacityObjective, CostStructure, PaymentTermsSet } from './entities';

export type BudgetStatus = 'DRAFT' | 'VALIDATED' | 'CLOSED';

export interface BudgetObjectif {
  id: string;
  tenantId: string;
  period: Period;
  status: BudgetStatus;
  objectives: BudgetObjectiveItem[];
  salesCapacities: SalesCapacityObjective[];
  costStructures: CostStructure[];
  paymentTerms: PaymentTermsSet | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export class BudgetObjectifAggregate {
  private constructor(private state: BudgetObjectif) {}

  static create(params: {
    id: string;
    tenantId: string;
    period: Period;
    objectives: BudgetObjectiveItem[];
    createdBy: string;
  }): BudgetObjectifAggregate {
    const now = new Date();
    const state: BudgetObjectif = {
      id: params.id,
      tenantId: params.tenantId,
      period: params.period,
      status: 'DRAFT',
      objectives: params.objectives,
      salesCapacities: [],
      costStructures: [],
      paymentTerms: null,
      createdAt: now,
      updatedAt: now,
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
      version: 1,
    };
    return new BudgetObjectifAggregate(state);
  }

  static fromState(state: BudgetObjectif): BudgetObjectifAggregate {
    return new BudgetObjectifAggregate(state);
  }

  getState(): BudgetObjectif {
    return { ...this.state };
  }

  updateObjectives(objectives: BudgetObjectiveItem[], updatedBy: string): void {
    if (this.state.status !== 'DRAFT') {
      throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
    }
    this.state.objectives = objectives;
    this.state.updatedBy = updatedBy;
    this.state.updatedAt = new Date();
    this.state.version += 1;
  }

  attachCostStructure(costStructures: CostStructure[], attachedBy: string): void {
    if (this.state.status !== 'DRAFT') {
      throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
    }
    this.state.costStructures = costStructures;
    this.state.updatedBy = attachedBy;
    this.state.updatedAt = new Date();
    this.state.version += 1;
  }

  defineSalesCapacity(salesCapacities: SalesCapacityObjective[], definedBy: string): void {
    if (this.state.status !== 'DRAFT') {
      throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
    }
    this.state.salesCapacities = salesCapacities;
    this.state.updatedBy = definedBy;
    this.state.updatedAt = new Date();
    this.state.version += 1;
  }

  definePaymentTerms(paymentTerms: PaymentTermsSet, definedBy: string): void {
    if (this.state.status !== 'DRAFT') {
      throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
    }
    this.state.paymentTerms = paymentTerms;
    this.state.updatedBy = definedBy;
    this.state.updatedAt = new Date();
    this.state.version += 1;
  }

  validate(validatedBy: string): void {
    if (this.state.status !== 'DRAFT') {
      throw new Error('INVALID_STATE_TRANSITION');
    }
    this.state.status = 'VALIDATED';
    this.state.updatedBy = validatedBy;
    this.state.updatedAt = new Date();
    this.state.version += 1;
  }

  close(closedBy: string): void {
    if (this.state.status !== 'VALIDATED') {
      throw new Error('INVALID_STATE_TRANSITION');
    }
    this.state.status = 'CLOSED';
    this.state.updatedBy = closedBy;
    this.state.updatedAt = new Date();
    this.state.version += 1;
  }
}
