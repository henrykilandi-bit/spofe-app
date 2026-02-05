/**
 * Cost-Structure Guardian - Invariants
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Guardian = Autorité unique de validation
 */

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
import { ProjectStatus, VersionStatus } from '../domain/value-objects';

/**
 * Codes d'invariants contractuels
 */
export const INVARIANT_CODES = {
  // Sécurité
  COUT_SEC_01: 'COUT-SEC-01',
  
  // Projets
  COUT_PROJ_01: 'COUT-PROJ-01',
  COUT_PROJ_02: 'COUT-PROJ-02',
  
  // Structures de coûts
  COUT_CS_01: 'COUT-CS-01',
  COUT_CS_02: 'COUT-CS-02',
  COUT_CS_03: 'COUT-CS-03',
  COUT_CS_04: 'COUT-CS-04',
  
  // Test 70%
  COUT_01: 'COUT-01',
} as const;

export interface GuardianVerdict {
  ok: boolean;
  violationCode?: string;
  message?: string;
  metadata?: any;
}

/**
 * Context nécessaire pour validation Guardian
 */
export interface CostStructureContext {
  existingProjects?: Array<{ projectId: string; name: string; tenantId: string; status: ProjectStatus }>;
  projectDetails?: {
    projectId: string;
    tenantId: string;
    status: ProjectStatus;
    versions: Array<{
      version: number;
      status: VersionStatus;
      costLines: any[];
      assumptions?: any;
      simulationMetrics?: any;
    }>;
  };
}

/**
 * INVARIANT COUT-SEC-01: Isolation multi-tenant
 */
function validateTenantIsolation(tenantId: string, context: CostStructureContext): GuardianVerdict {
  if (!tenantId || tenantId.trim().length === 0) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_SEC_01,
      message: 'TenantId is required for multi-tenant isolation',
    };
  }
  return { ok: true };
}

/**
 * INVARIANT COUT-PROJ-01: Unicité du nom de projet par tenant
 */
function validateProjectUniqueness(
  command: CreateEconomicProjectCommand,
  context: CostStructureContext
): GuardianVerdict {
  const existing = context.existingProjects?.find(
    (p) => p.name === command.name && p.tenantId === command.tenantId
  );

  if (existing) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_PROJ_01,
      message: `Project with name "${command.name}" already exists for tenant ${command.tenantId}`,
    };
  }

  return { ok: true };
}

/**
 * INVARIANT COUT-CS-01: Dernière version FROZEN avant nouvelle version
 */
function validateLastVersionFrozen(
  command: CreateCostStructureCommand,
  context: CostStructureContext
): GuardianVerdict {
  const project = context.projectDetails;
  if (!project) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_PROJ_02,
      message: 'Project not found',
    };
  }

  if (project.versions.length > 0) {
    const lastVersion = project.versions[project.versions.length - 1];
    if (lastVersion.status !== 'FROZEN') {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_CS_01,
        message: `Last version ${lastVersion.version} must be FROZEN before creating new version`,
      };
    }
  }

  return { ok: true };
}

/**
 * INVARIANT COUT-CS-02: Montant > 0
 */
function validatePositiveAmount(command: AddCostLineCommand): GuardianVerdict {
  if (command.costLine.amount.amount <= 0) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_CS_02,
      message: 'Cost line amount must be > 0',
    };
  }
  return { ok: true };
}

/**
 * INVARIANT COUT-CS-03: Version non FROZEN
 */
function validateVersionNotFrozen(
  version: number,
  context: CostStructureContext
): GuardianVerdict {
  const project = context.projectDetails;
  if (!project) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_PROJ_02,
      message: 'Project not found',
    };
  }

  const targetVersion = project.versions.find((v) => v.version === version);
  if (!targetVersion) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_CS_03,
      message: `Version ${version} not found`,
    };
  }

  if (targetVersion.status === 'FROZEN') {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_CS_03,
      message: `Version ${version} is FROZEN and cannot be modified`,
    };
  }

  return { ok: true };
}

/**
 * INVARIANT COUT-CS-04: Hypothèses complètes (scénarios)
 */
function validateCompleteAssumptions(context: CostStructureContext, version: number): GuardianVerdict {
  const project = context.projectDetails;
  const targetVersion = project?.versions.find((v) => v.version === version);

  if (!targetVersion?.assumptions) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_CS_04,
      message: 'Assumptions must be defined before simulation',
    };
  }

  return { ok: true };
}

/**
 * INVARIANT COUT-01: Test 70% - Marge positive à 70% de capacité
 */
function validateMarginAt70(simulationMetrics: any): GuardianVerdict {
  if (!simulationMetrics || simulationMetrics.marginAt70 === undefined) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_01,
      message: 'Simulation metrics missing marginAt70',
    };
  }

  if (simulationMetrics.marginAt70 <= 0) {
    return {
      ok: false,
      violationCode: INVARIANT_CODES.COUT_01,
      message: `Margin at 70% capacity is ${simulationMetrics.marginAt70.toFixed(2)}% (must be > 0)`,
      metadata: { marginAt70: simulationMetrics.marginAt70 },
    };
  }

  return { ok: true };
}

/**
 * Calcul des métriques de simulation
 */
function computeSimulationMetrics(
  costLines: any[],
  assumptions: any
): any {
  const totalVariableCost = costLines
    .filter((c) => c.category === 'VARIABLE')
    .reduce((sum, c) => sum + c.amount.amount, 0);

  const totalFixedCost = costLines
    .filter((c) => c.category === 'FIXED')
    .reduce((sum, c) => sum + c.amount.amount, 0);

  const totalIndirectCost = costLines
    .filter((c) => c.category === 'INDIRECT')
    .reduce((sum, c) => sum + c.amount.amount, 0);

  const totalCost = totalVariableCost + totalFixedCost + totalIndirectCost;
  const unitCost = totalCost / assumptions.expectedVolume.value;

  const revenue = assumptions.priceTarget.amount * assumptions.expectedVolume.value;
  const grossMargin = ((revenue - totalCost) / revenue) * 100;
  const netMargin = grossMargin; // Simplifié

  // Test 70%
  const volumeAt70 = assumptions.capacityMax.value * 0.7;
  const revenueAt70 = assumptions.priceTarget.amount * volumeAt70;
  const costAt70 = totalVariableCost * (volumeAt70 / assumptions.expectedVolume.value) + totalFixedCost + totalIndirectCost;
  const marginAt70 = ((revenueAt70 - costAt70) / revenueAt70) * 100;

  return {
    unitCost,
    totalCost,
    grossMargin,
    netMargin,
    marginAt70,
    viableAt70: marginAt70 > 0,
  };
}

/**
 * Guardian Validator - Point d'entrée unique
 */
export class CostStructureGuardian {
  validate(command: CostStructureCommand, context: CostStructureContext): GuardianVerdict {
    switch (command.type) {
      case 'CreateEconomicProject':
        return this.validateCreateProject(command, context);

      case 'CreateCostStructure':
        return this.validateCreateCostStructure(command, context);

      case 'AddCostLine':
        return this.validateAddCostLine(command, context);

      case 'UpdateAssumptions':
        return this.validateUpdateAssumptions(command, context);

      case 'RunSimulation':
        return this.validateRunSimulation(command, context);

      case 'FreezeCostStructure':
        return this.validateFreezeCostStructure(command, context);

      case 'ValidateProject':
        return this.validateValidateProject(command, context);

      case 'RejectProject':
        return this.validateRejectProject(command, context);

      default:
        return {
          ok: false,
          violationCode: 'UNKNOWN_COMMAND',
          message: 'Unknown command type',
        };
    }
  }

  private validateCreateProject(
    command: CreateEconomicProjectCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    verdict = validateProjectUniqueness(command, context);
    if (!verdict.ok) return verdict;

    if (!command.name || command.name.trim().length === 0) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_PROJ_01,
        message: 'Project name cannot be empty',
      };
    }

    return { ok: true };
  }

  private validateCreateCostStructure(
    command: CreateCostStructureCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    verdict = validateLastVersionFrozen(command, context);
    if (!verdict.ok) return verdict;

    const project = context.projectDetails;
    if (project && (project.status === 'VALIDATED' || project.status === 'REJECTED')) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_PROJ_02,
        message: `Project is ${project.status} and cannot be modified`,
      };
    }

    return { ok: true };
  }

  private validateAddCostLine(
    command: AddCostLineCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    verdict = validatePositiveAmount(command);
    if (!verdict.ok) return verdict;

    verdict = validateVersionNotFrozen(command.version, context);
    if (!verdict.ok) return verdict;

    return { ok: true };
  }

  private validateUpdateAssumptions(
    command: UpdateAssumptionsCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    verdict = validateVersionNotFrozen(command.version, context);
    if (!verdict.ok) return verdict;

    return { ok: true };
  }

  private validateRunSimulation(
    command: RunSimulationCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    verdict = validateCompleteAssumptions(context, command.version);
    if (!verdict.ok) return verdict;

    const project = context.projectDetails;
    const targetVersion = project?.versions.find((v) => v.version === command.version);

    if (!targetVersion?.costLines || targetVersion.costLines.length === 0) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_CS_04,
        message: 'Cost lines must be defined before simulation',
      };
    }

    verdict = validateVersionNotFrozen(command.version, context);
    if (!verdict.ok) return verdict;

    // Compute metrics
    const metrics = computeSimulationMetrics(targetVersion.costLines, targetVersion.assumptions);

    return {
      ok: true,
      metadata: { simulationMetrics: metrics },
    };
  }

  private validateFreezeCostStructure(
    command: FreezeCostStructureCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    const project = context.projectDetails;
    const targetVersion = project?.versions.find((v) => v.version === command.version);

    if (!targetVersion?.simulationMetrics) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_CS_04,
        message: 'Simulation must be run before freezing',
      };
    }

    verdict = validateMarginAt70(targetVersion.simulationMetrics);
    if (!verdict.ok) return verdict;

    if (targetVersion.status === 'FROZEN') {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_CS_03,
        message: 'Version is already FROZEN',
      };
    }

    return { ok: true };
  }

  private validateValidateProject(
    command: ValidateProjectCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    const project = context.projectDetails;
    if (!project) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_PROJ_02,
        message: 'Project not found',
      };
    }

    if (project.status !== 'SIMULATED') {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_PROJ_02,
        message: `Project must be in SIMULATED status (current: ${project.status})`,
      };
    }

    const hasFrozenVersion = project.versions.some((v) => v.status === 'FROZEN');
    if (!hasFrozenVersion) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_CS_01,
        message: 'Project must have at least one FROZEN cost structure',
      };
    }

    const frozenVersion = project.versions.find((v) => v.status === 'FROZEN');
    verdict = validateMarginAt70(frozenVersion?.simulationMetrics);
    if (!verdict.ok) return verdict;

    return { ok: true };
  }

  private validateRejectProject(
    command: RejectProjectCommand,
    context: CostStructureContext
  ): GuardianVerdict {
    let verdict = validateTenantIsolation(command.tenantId, context);
    if (!verdict.ok) return verdict;

    const project = context.projectDetails;
    if (project?.status === 'VALIDATED') {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_PROJ_02,
        message: 'Cannot reject a VALIDATED project',
      };
    }

    if (!command.reason || command.reason.trim().length === 0) {
      return {
        ok: false,
        violationCode: INVARIANT_CODES.COUT_PROJ_02,
        message: 'Rejection reason is required',
      };
    }

    return { ok: true };
  }
}
