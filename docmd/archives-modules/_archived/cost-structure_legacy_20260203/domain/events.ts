/**
 * Cost-Structure Module - Events (Domain Events)
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Append-only, Immutables, Versionnés
 */

import { ProjectType, CostCategory, SimulationMetrics } from './value-objects';

export type CostStructureEvent =
  | EconomicProjectCreated
  | CostStructureCreated
  | CostLineAdded
  | AssumptionsUpdated
  | CostStructureSimulated
  | CostStructureFrozen
  | ProjectValidated
  | ProjectRejected;

/**
 * Event 1 - EconomicProjectCreated
 */
export interface EconomicProjectCreated {
  type: 'EconomicProjectCreated';
  projectId: string;
  tenantId: string;
  name: string;
  projectType: ProjectType;
  createdBy: string;
  createdAt: Date;
}

/**
 * Event 2 - CostStructureCreated
 */
export interface CostStructureCreated {
  type: 'CostStructureCreated';
  projectId: string;
  version: number;
  createdBy: string;
  createdAt: Date;
}

/**
 * Event 3 - CostLineAdded
 */
export interface CostLineAdded {
  type: 'CostLineAdded';
  projectId: string;
  version: number;
  category: CostCategory;
  label: string;
  amount: number;
  currency: string;
  allocationRule?: string;
  addedBy: string;
  addedAt: Date;
}

/**
 * Event 4 - AssumptionsUpdated
 */
export interface AssumptionsUpdated {
  type: 'AssumptionsUpdated';
  projectId: string;
  version: number;
  priceTarget: number;
  expectedVolume: number;
  capacityMax: number;
  scenarios: {
    pessimistic: number;
    realistic: number;
    optimistic: number;
  };
  updatedBy: string;
  updatedAt: Date;
}

/**
 * Event 5 - CostStructureSimulated
 */
export interface CostStructureSimulated {
  type: 'CostStructureSimulated';
  projectId: string;
  version: number;
  metrics: {
    unitCost: number;
    totalCost: number;
    grossMargin: number;
    netMargin: number;
    marginAt70: number;
  };
  viableAt70: boolean;
  simulatedBy: string;
  simulatedAt: Date;
}

/**
 * Event 6 - CostStructureFrozen
 */
export interface CostStructureFrozen {
  type: 'CostStructureFrozen';
  projectId: string;
  version: number;
  frozenBy: string;
  frozenAt: Date;
}

/**
 * Event 7 - ProjectValidated
 * ⚠️ Événement écouté par le module Budget
 */
export interface ProjectValidated {
  type: 'ProjectValidated';
  projectId: string;
  tenantId: string;
  validatedBy: string;
  validatedAt: Date;
}

/**
 * Event 8 - ProjectRejected
 */
export interface ProjectRejected {
  type: 'ProjectRejected';
  projectId: string;
  tenantId: string;
  reason: string;
  rejectedBy: string;
  rejectedAt: Date;
}
