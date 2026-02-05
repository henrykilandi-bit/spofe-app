/**
 * Cost-Structure Guardian
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Guardian = Autorité unique de validation
 */

import { GuardianError } from '../../../shared/GuardianError';
import {
  CostStructureCommand,
  CreateEconomicProjectCommand,
  CreateCostStructureCommand,
  AddCostLineCommand,
  UpdateAssumptionsCommand,
  RunSimulationCommand,
  FreezeCostStructureCommand,
  ValidateProjectCommand,
  RejectProjectCommand,
} from '../domain/commands';

/**
 * Codes d'invariants contractuels
 */
export const INVARIANT_CODES = {
  COUT_SEC_01: 'COUT-SEC-01',
  COUT_PROJ_01: 'COUT-PROJ-01',
  COUT_PROJ_02: 'COUT-PROJ-02',
  COUT_CS_01: 'COUT-CS-01',
  COUT_CS_02: 'COUT-CS-02',
  COUT_CS_03: 'COUT-CS-03',
  COUT_CS_04: 'COUT-CS-04',
  COUT_01: 'COUT-01',
} as const;

/**
 * State structure for Guardian validation
 */
export interface CostStructureState {
  tenantId: string;
  existingProjects?: Array<{
    id: string;
    name: string;
    tenantId: string;
    status: string;
  }>;
  project?: {
    id: string;
    tenantId?: string;
    status: string;
    versions?: Array<{
      version: number;
      status: string;
      costLines: Array<{ amount: number; category?: string; label?: string }>;
      assumptions?: {
        priceTarget: number;
        expectedVolume: number;
        capacityMax: number;
        scenarios: {
          pessimistic: number;
          realistic: number;
          optimistic: number;
        };
      };
      simulation?: {
        unitCost?: number;
        totalCost?: number;
        grossMargin?: number;
        netMargin: number;
        marginAt70: number;
      };
    }>;
  };
  costStructure?: {
    version: number;
    status: string;
    costLines: Array<{ amount: number; category?: string; label?: string }>;
    assumptions?: {
      priceTarget: number;
      expectedVolume: number;
      capacityMax: number;
      scenarios: {
        pessimistic: number;
        realistic: number;
        optimistic: number;
      };
    };
    simulation?: {
      unitCost?: number;
      totalCost?: number;
      grossMargin?: number;
      netMargin: number;
      marginAt70: number;
    };
  };
}

/**
 * Guardian Validator - Point d'entrée unique
 */
export class CostStructureGuardian {
  /**
   * Validate command against current state
   * Throws GuardianError if validation fails
   */
  validate(command: CostStructureCommand, state: CostStructureState): void {
    // COUT-SEC-01: Tenant isolation (always check first)
    this.validateTenantIsolation(command, state);

    switch (command.type) {
      case 'CreateEconomicProject':
        this.validateCreateProject(command, state);
        break;

      case 'CreateCostStructure':
        this.validateCreateCostStructure(command, state);
        break;

      case 'AddCostLine':
        this.validateAddCostLine(command, state);
        break;

      case 'UpdateAssumptions':
        this.validateUpdateAssumptions(command, state);
        break;

      case 'RunSimulation':
        this.validateRunSimulation(command, state);
        break;

      case 'FreezeCostStructure':
        this.validateFreezeCostStructure(command, state);
        break;

      case 'ValidateProject':
        this.validateValidateProject(command, state);
        break;

      case 'RejectProject':
        this.validateRejectProject(command, state);
        break;

      default:
        throw new GuardianError('UNKNOWN_COMMAND', 'Unknown command type');
    }
  }

  /**
   * COUT-SEC-01: Tenant isolation
   */
  private validateTenantIsolation(command: CostStructureCommand, state: CostStructureState): void {
    if (!command.tenantId || command.tenantId.trim().length === 0) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_SEC_01,
        'TenantId is required for multi-tenant isolation'
      );
    }

    // Check tenant matches state
    if (state.tenantId && command.tenantId !== state.tenantId) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_SEC_01,
        `Tenant mismatch: command=${command.tenantId}, state=${state.tenantId}`
      );
    }

    // Check project tenant if exists
    if (state.project?.tenantId && command.tenantId !== state.project.tenantId) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_SEC_01,
        `Tenant mismatch with project: command=${command.tenantId}, project=${state.project.tenantId}`
      );
    }
  }

  /**
   * COUT-PROJ-01: Project name uniqueness per tenant
   */
  private validateCreateProject(command: CreateEconomicProjectCommand, state: CostStructureState): void {
    if (!command.name || command.name.trim().length === 0) {
      throw new GuardianError(INVARIANT_CODES.COUT_PROJ_01, 'Project name cannot be empty');
    }

    const existing = state.existingProjects?.find(
      (p) => p.name === command.name && p.tenantId === command.tenantId
    );

    if (existing) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_PROJ_01,
        `Project with name "${command.name}" already exists for tenant ${command.tenantId}`
      );
    }
  }

  /**
   * COUT-CS-01: Last version must be FROZEN before creating new version
   */
  private validateCreateCostStructure(command: CreateCostStructureCommand, state: CostStructureState): void {
    if (!state.project) {
      throw new GuardianError(INVARIANT_CODES.COUT_PROJ_02, 'Project not found');
    }

    if (state.project.status === 'VALIDATED' || state.project.status === 'REJECTED') {
      throw new GuardianError(
        INVARIANT_CODES.COUT_PROJ_02,
        `Project is ${state.project.status} and cannot be modified`
      );
    }

    if (state.project.versions && state.project.versions.length > 0) {
      const lastVersion = state.project.versions[state.project.versions.length - 1];
      if (lastVersion.status !== 'FROZEN') {
        throw new GuardianError(
          INVARIANT_CODES.COUT_CS_01,
          `Last version ${lastVersion.version} must be FROZEN before creating new version`
        );
      }
    }
  }

  /**
   * COUT-CS-02: Cost line amount must be > 0
   * COUT-CS-03: Version must not be FROZEN
   */
  private validateAddCostLine(command: AddCostLineCommand, state: CostStructureState): void {
    // COUT-CS-02: Amount validation
    if (command.costLine.amount.amount <= 0) {
      throw new GuardianError(INVARIANT_CODES.COUT_CS_02, 'Cost line amount must be > 0');
    }

    // COUT-CS-03: Version not frozen
    if (state.costStructure && state.costStructure.status === 'FROZEN') {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_03,
        `Version ${command.version} is FROZEN and cannot be modified`
      );
    }
  }

  /**
   * COUT-CS-03: Version must not be FROZEN
   */
  private validateUpdateAssumptions(command: UpdateAssumptionsCommand, state: CostStructureState): void {
    if (state.costStructure && state.costStructure.status === 'FROZEN') {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_03,
        `Version ${command.version} is FROZEN and cannot be modified`
      );
    }
  }

  /**
   * COUT-CS-04: Assumptions and cost lines must be complete
   * COUT-CS-02: Cost lines must have positive amounts
   */
  private validateRunSimulation(command: RunSimulationCommand, state: CostStructureState): void {
    if (!state.costStructure) {
      throw new GuardianError(INVARIANT_CODES.COUT_CS_04, 'Cost structure not found');
    }

    // COUT-CS-04: Assumptions required
    if (!state.costStructure.assumptions) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_04,
        'Assumptions must be defined before simulation'
      );
    }

    // COUT-CS-04: Cost lines required
    if (!state.costStructure.costLines || state.costStructure.costLines.length === 0) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_04,
        'Cost lines must be defined before simulation'
      );
    }

    // COUT-CS-02: Validate all cost line amounts
    const negativeCostLine = state.costStructure.costLines.find((line) => line.amount <= 0);
    if (negativeCostLine) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_02,
        `Cost line has invalid amount: ${negativeCostLine.amount}`
      );
    }
  }

  /**
   * COUT-01: Margin at 70% capacity must be > 0
   * COUT-CS-04: Simulation must be completed
   */
  private validateFreezeCostStructure(command: FreezeCostStructureCommand, state: CostStructureState): void {
    if (!state.costStructure) {
      throw new GuardianError(INVARIANT_CODES.COUT_CS_04, 'Cost structure not found');
    }

    // COUT-CS-04: Simulation required
    if (!state.costStructure.simulation) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_04,
        'Simulation must be run before freezing'
      );
    }

    // COUT-01: Test 70% - margin must be positive
    if (state.costStructure.simulation.marginAt70 <= 0) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_01,
        `Margin at 70% capacity is ${state.costStructure.simulation.marginAt70.toFixed(2)}% (must be > 0)`,
        { marginAt70: state.costStructure.simulation.marginAt70 }
      );
    }

    // COUT-CS-03: Already frozen check
    if (state.costStructure.status === 'FROZEN') {
      throw new GuardianError(INVARIANT_CODES.COUT_CS_03, 'Version is already FROZEN');
    }
  }

  /**
   * COUT-PROJ-02: Project must be in SIMULATED status
   * COUT-CS-01: At least one FROZEN version required
   * COUT-01: Frozen version must pass 70% test
   */
  private validateValidateProject(command: ValidateProjectCommand, state: CostStructureState): void {
    if (!state.project) {
      throw new GuardianError(INVARIANT_CODES.COUT_PROJ_02, 'Project not found');
    }

    // COUT-PROJ-02: Must be simulated
    if (state.project.status !== 'SIMULATED') {
      throw new GuardianError(
        INVARIANT_CODES.COUT_PROJ_02,
        `Project must be in SIMULATED status (current: ${state.project.status})`
      );
    }

    // COUT-CS-01: Must have frozen version
    const hasFrozenVersion = state.project.versions?.some((v) => v.status === 'FROZEN');
    if (!hasFrozenVersion) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_CS_01,
        'Project must have at least one FROZEN cost structure'
      );
    }

    // COUT-01: Frozen version must pass 70% test
    const frozenVersion = state.project.versions?.find((v) => v.status === 'FROZEN');
    if (frozenVersion?.simulation && frozenVersion.simulation.marginAt70 <= 0) {
      throw new GuardianError(
        INVARIANT_CODES.COUT_01,
        `Frozen version margin at 70% is ${frozenVersion.simulation.marginAt70.toFixed(2)}% (must be > 0)`
      );
    }
  }

  /**
   * COUT-PROJ-02: Cannot reject VALIDATED project
   */
  private validateRejectProject(command: RejectProjectCommand, state: CostStructureState): void {
    if (state.project?.status === 'VALIDATED') {
      throw new GuardianError(
        INVARIANT_CODES.COUT_PROJ_02,
        'Cannot reject a VALIDATED project'
      );
    }

    if (!command.reason || command.reason.trim().length === 0) {
      throw new GuardianError(INVARIANT_CODES.COUT_PROJ_02, 'Rejection reason is required');
    }
  }
}
