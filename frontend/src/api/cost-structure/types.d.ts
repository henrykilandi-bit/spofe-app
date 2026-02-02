/**
 * Cost-Structure API Types
 * 
 * ⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY
 * Source: cascade/modules/cost-structure/openapi/cost-structure.openapi.json
 * Version: 1.0.0
 * Generated: 2026-02-01
 * 
 * These types can be imported in TypeScript projects or used with JSDoc.
 */

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export type ProjectType = 'PRODUCT' | 'SERVICE' | 'PROJECT';

export type ProjectStatus = 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';

export type StructureStatus = 'DRAFT' | 'SIMULATED' | 'FROZEN';

export type CostCategory = 'RAW_MATERIAL' | 'LABOR' | 'SUBCONTRACTING' | 'OVERHEAD';

export type DecisionType = 'VALIDATED' | 'REJECTED';

// ─────────────────────────────────────────────────────────────
// DTOs (Data Transfer Objects)
// ─────────────────────────────────────────────────────────────

/**
 * Budget-ready project for Budget module consumption (COUT-BUD-01)
 */
export interface BudgetReadyProjectDTO {
  /** Tenant ID (isolation multi-tenant) */
  tenantId: string;
  /** Project unique identifier */
  projectId: string;
  /** Project display name */
  projectName: string;
  /** Cost structure version (>= 1) */
  version: number;
  /** Unit cost validated */
  unitCost: number;
  /** Total cost validated */
  totalCost: number;
  /** Net margin rate (0-1) */
  netMargin: number;
  /** Margin at 70% sales (must be > 0 per COUT-01) */
  marginAt70: number;
}

/**
 * Economic project summary
 */
export interface CostProjectDTO {
  /** Tenant ID */
  tenantId: string;
  /** Project unique identifier */
  projectId: string;
  /** Project name */
  name: string;
  /** Project type */
  type: ProjectType;
  /** Project status */
  status: ProjectStatus;
  /** Current version number */
  currentVersion: number;
  /** Project created at (ISO 8601) */
  createdAt: string;
  /** Project validated at (null if not validated) */
  validatedAt: string | null;
  /** Created by user */
  createdBy: string;
  /** Current unit cost (from latest version) */
  currentUnitCost: number | null;
  /** Current total cost (from latest version) */
  currentTotalCost: number | null;
}

/**
 * Cost structure version details
 */
export interface CostStructureDTO {
  /** Tenant ID */
  tenantId: string;
  /** Project ID */
  projectId: string;
  /** Version number */
  version: number;
  /** Structure status */
  status: StructureStatus;
  /** Unit cost */
  unitCost: number;
  /** Total cost */
  totalCost: number;
  /** Net margin rate */
  netMargin: number;
  /** Margin at 70% sales */
  marginAt70: number;
  /** Viability at 70% (true if marginAt70 > 0) */
  viableAt70: boolean;
  /** Created by user */
  createdBy: string;
  /** Created at timestamp (ISO 8601) */
  createdAt: string;
  /** Frozen at timestamp (null if not frozen) */
  frozenAt: string | null;
}

/**
 * Cost line item
 */
export interface CostLineDTO {
  /** Line unique identifier */
  lineId: string;
  /** Tenant ID */
  tenantId: string;
  /** Project ID */
  projectId: string;
  /** Version number */
  version: number;
  /** Cost category */
  category: CostCategory;
  /** Line description */
  description: string;
  /** Unit of measure */
  unit: string;
  /** Quantity */
  quantity: number;
  /** Unit price */
  unitPrice: number;
  /** Total line amount */
  totalAmount: number;
  /** Created at timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Simulation results
 */
export interface CostSimulationDTO {
  /** Simulation ID */
  simulationId: string;
  /** Tenant ID */
  tenantId: string;
  /** Project ID */
  projectId: string;
  /** Version number */
  version: number;
  /** Sales volume used for simulation */
  salesVolume: number;
  /** Unit cost at this volume */
  unitCost: number;
  /** Total cost at this volume */
  totalCost: number;
  /** Net margin at this volume */
  netMargin: number;
  /** Margin at 70% of sales volume */
  marginAt70: number;
  /** Is viable at 70% (marginAt70 > 0) */
  viableAt70: boolean;
  /** Break-even point in units */
  breakEvenPoint: number;
  /** Created at timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Cost breakdown by category
 */
export interface CostBreakdownDTO {
  /** Total variable costs */
  variable: number;
  /** Total fixed costs */
  fixed: number;
  /** Total indirect costs */
  indirect: number;
  /** Total sum of all costs */
  total: number;
}

/**
 * Cost structure summary for Budget integration
 */
export interface CostStructureSummaryDTO {
  /** Tenant ID (isolation multi-tenant) */
  tenantId: string;
  /** Project unique identifier */
  projectId: string;
  /** Cost structure version */
  version: number;
  /** Cost breakdown by category */
  costBreakdown: CostBreakdownDTO;
  /** Number of cost lines */
  costLinesCount: number;
  /** Structure status */
  status: 'DRAFT' | 'FROZEN';
  /** Frozen at timestamp (null if not frozen) */
  frozenAt: string | null;
}

/**
 * Validation decision record
 */
export interface CostDecisionDTO {
  /** Tenant ID */
  tenantId: string;
  /** Project ID */
  projectId: string;
  /** Version number */
  version: number;
  /** Decision type */
  decision: DecisionType;
  /** User who made the decision */
  decidedBy: string;
  /** Decision timestamp (ISO 8601) */
  decidedAt: string;
  /** Decision justification */
  justification: string | null;
}

// ─────────────────────────────────────────────────────────────
// SERVICE INTERFACES
// ─────────────────────────────────────────────────────────────

export interface BudgetReadyService {
  listProjects(): Promise<BudgetReadyProjectDTO[]>;
  getProject(projectId: string): Promise<BudgetReadyProjectDTO>;
  getCostSummary(projectId: string, version: number): Promise<CostStructureSummaryDTO>;
}

export interface CostProjectsService {
  listProjects(filters?: {
    status?: ProjectStatus;
    type?: ProjectType;
  }): Promise<CostProjectDTO[]>;
}

export interface CostStructureService {
  getCurrentStructure(projectId: string): Promise<CostStructureDTO>;
  getCostLines(projectId: string, version: number): Promise<CostLineDTO[]>;
  getSimulation(projectId: string, version: number): Promise<CostSimulationDTO>;
  getDecision(projectId: string): Promise<CostDecisionDTO>;
}

// ─────────────────────────────────────────────────────────────
// API CLIENT INTERFACE
// ─────────────────────────────────────────────────────────────

export interface CostStructureApiClient {
  OpenAPI: {
    BASE: string;
    VERSION: string;
    TOKEN: () => string | null;
    TENANT_ID: () => string | null;
  };
  BudgetReadyService: BudgetReadyService;
  CostProjectsService: CostProjectsService;
  CostStructureService: CostStructureService;
}
