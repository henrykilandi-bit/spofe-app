/**
 * Cost-Structure Module — Write-Side Facade
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Point d'entrée unique pour toutes les commandes du module.
 * Budget et autres modules consomment via cette façade.
 */

import { CostStructureGuardian } from './domain/guardian/cost-structure.guardian.js';
import { CostStructureTransactionManager, type TransactionContext, type EventPublisher } from './application/transaction/cost-structure.transaction-manager.js';

// Commands
import {
  CreateEconomicProjectCommand,
  CreateCostStructureCommand,
  AddCostLineCommand,
  UpdateAssumptionsCommand,
  RunSimulationCommand,
  FreezeCostStructureCommand,
  ValidateProjectCommand,
  RejectProjectCommand,
  type CostCategory,
  type ScenarioSet,
} from './application/commands/index.js';

// Handlers
import {
  CreateEconomicProjectHandler,
  CreateCostStructureHandler,
  AddCostLineHandler,
  UpdateAssumptionsHandler,
  RunSimulationHandler,
  FreezeCostStructureHandler,
  ValidateProjectHandler,
  RejectProjectHandler,
} from './application/handlers/index.js';

// Repositories
import type { EconomicProjectRepository } from './infrastructure/persistence/economic-project.repository.js';
import type { CostStructureRepository } from './infrastructure/persistence/cost-structure.repository.js';
import type { DecisionRecordRepository } from './infrastructure/persistence/decision-record.repository.js';

// ─────────────────────────────────────────────────────────────
// Module Configuration
// ─────────────────────────────────────────────────────────────

export interface CostStructureModuleConfig {
  projectRepository: EconomicProjectRepository;
  costStructureRepository: CostStructureRepository;
  decisionRepository: DecisionRecordRepository;
  eventPublisher?: EventPublisher;
}

// ─────────────────────────────────────────────────────────────
// Write-Side Facade
// ─────────────────────────────────────────────────────────────

export class CostStructureWriteSide {
  private readonly guardian: CostStructureGuardian;
  private readonly transactionManager: CostStructureTransactionManager;
  
  // Handlers
  private readonly createProjectHandler: CreateEconomicProjectHandler;
  private readonly createCostStructureHandler: CreateCostStructureHandler;
  private readonly addCostLineHandler: AddCostLineHandler;
  private readonly updateAssumptionsHandler: UpdateAssumptionsHandler;
  private readonly runSimulationHandler: RunSimulationHandler;
  private readonly freezeCostStructureHandler: FreezeCostStructureHandler;
  private readonly validateProjectHandler: ValidateProjectHandler;
  private readonly rejectProjectHandler: RejectProjectHandler;

  constructor(config: CostStructureModuleConfig) {
    // Guardian — Point unique de validation
    this.guardian = new CostStructureGuardian();
    
    // Transaction Manager
    this.transactionManager = new CostStructureTransactionManager(
      this.guardian,
      config.eventPublisher,
    );

    // Initialize handlers with repositories
    this.createProjectHandler = new CreateEconomicProjectHandler(
      config.projectRepository,
    );
    this.createCostStructureHandler = new CreateCostStructureHandler(
      config.projectRepository,
      config.costStructureRepository,
    );
    this.addCostLineHandler = new AddCostLineHandler(
      config.costStructureRepository,
    );
    this.updateAssumptionsHandler = new UpdateAssumptionsHandler(
      config.costStructureRepository,
    );
    this.runSimulationHandler = new RunSimulationHandler(
      config.costStructureRepository,
    );
    this.freezeCostStructureHandler = new FreezeCostStructureHandler(
      config.costStructureRepository,
      config.projectRepository,
    );
    this.validateProjectHandler = new ValidateProjectHandler(
      config.projectRepository,
      config.decisionRepository,
    );
    this.rejectProjectHandler = new RejectProjectHandler(
      config.projectRepository,
      config.decisionRepository,
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Command Methods
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new economic project
   * Invariant: COUT-EP-01 (unique name per tenant)
   */
  async createEconomicProject(
    tenantId: string,
    projectId: string,
    name: string,
    type: 'PRODUCT' | 'SERVICE',
    actorId: string,
  ) {
    const command = new CreateEconomicProjectCommand(
      tenantId,
      projectId,
      name,
      type,
      actorId,
    );

    return this.transactionManager.execute(
      command,
      this.createProjectHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Create a new cost structure version
   * Invariant: COUT-CS-01 (version strictly increasing)
   */
  async createCostStructure(
    tenantId: string,
    projectId: string,
    version: number,
    actorId: string,
  ) {
    const command = new CreateCostStructureCommand(
      tenantId,
      projectId,
      version,
      actorId,
    );

    return this.transactionManager.execute(
      command,
      this.createCostStructureHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Add a cost line to a cost structure
   * Invariants: COUT-CS-02, COUT-CS-03
   */
  async addCostLine(
    tenantId: string,
    projectId: string,
    version: number,
    category: CostCategory,
    label: string,
    amount: number,
    currency: string,
    actorId: string,
    allocationRule?: string,
  ) {
    const command = new AddCostLineCommand(
      tenantId,
      projectId,
      version,
      category,
      label,
      amount,
      currency,
      allocationRule,
      actorId,
    );

    return this.transactionManager.execute(
      command,
      this.addCostLineHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Update assumptions for simulation
   * Invariants: COUT-CS-03, COUT-CS-04
   */
  async updateAssumptions(
    tenantId: string,
    projectId: string,
    version: number,
    priceTarget: number,
    expectedVolume: number,
    capacityMax: number,
    scenarios: ScenarioSet,
    actorId: string,
  ) {
    const command = new UpdateAssumptionsCommand(
      tenantId,
      projectId,
      version,
      priceTarget,
      expectedVolume,
      capacityMax,
      scenarios,
      actorId,
    );

    return this.transactionManager.execute(
      command,
      this.updateAssumptionsHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Run cost structure simulation
   * Invariants: COUT-01, COUT-CS-04, COUT-SIM-01
   */
  async runSimulation(
    tenantId: string,
    projectId: string,
    version: number,
    actorId: string,
  ) {
    const command = new RunSimulationCommand(
      tenantId,
      projectId,
      version,
      actorId,
    );

    return this.transactionManager.execute(
      command,
      this.runSimulationHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Freeze a simulated cost structure
   * Invariants: COUT-01, COUT-SIM-02
   */
  async freezeCostStructure(
    tenantId: string,
    projectId: string,
    version: number,
    actorId: string,
  ) {
    const command = new FreezeCostStructureCommand(
      tenantId,
      projectId,
      version,
      actorId,
    );

    return this.transactionManager.execute(
      command,
      this.freezeCostStructureHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Validate a project (terminal decision)
   * Invariants: COUT-DEC-01, COUT-DEC-02, COUT-BUD-01
   */
  async validateProject(
    tenantId: string,
    projectId: string,
    actorId: string,
    justification: string,
  ) {
    const command = new ValidateProjectCommand(
      tenantId,
      projectId,
      actorId,
      justification,
    );

    return this.transactionManager.execute(
      command,
      this.validateProjectHandler,
      this.createContext(actorId),
    );
  }

  /**
   * Reject a project (terminal decision)
   * Invariants: COUT-DEC-01, COUT-DEC-02
   */
  async rejectProject(
    tenantId: string,
    projectId: string,
    actorId: string,
    reason: string,
  ) {
    const command = new RejectProjectCommand(
      tenantId,
      projectId,
      actorId,
      reason,
    );

    return this.transactionManager.execute(
      command,
      this.rejectProjectHandler,
      this.createContext(actorId),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Helper
  // ─────────────────────────────────────────────────────────────

  private createContext(actorId: string): TransactionContext {
    return {
      correlationId: crypto.randomUUID(),
      actorId,
      timestamp: new Date(),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────────────────────

// Commands & Handlers
export * from './application/commands/index.js';
export * from './application/handlers/index.js';
export * from './domain/events/index.js';
export * from './domain/guardian/cost-structure.guardian.js';
export * from './infrastructure/persistence/index.js';
export { CostStructureTransactionManager, type TransactionContext, type EventPublisher } from './application/transaction/cost-structure.transaction-manager.js';

// Query Repository (Read-Side)
export { CostStructureQueryRepository } from './infrastructure/cost-structure.query.repository.js';
export type {
  CostProjectReadModel,
  CostStructureCurrentReadModel,
  CostLineReadModel,
  SimulationResultReadModel,
  CostDecisionReadModel,
  BudgetReadyProjectReadModel,
  CostStructureSummaryReadModel,
} from './infrastructure/cost-structure.query.repository.js';

// NestJS Module
export {
  CostStructureModule,
  type CostStructureModuleOptions,
  COST_STRUCTURE_DB_POOL,
  ECONOMIC_PROJECT_REPOSITORY,
  COST_STRUCTURE_REPOSITORY,
  DECISION_RECORD_REPOSITORY,
} from './cost-structure.module.js';

// DTOs (API)
export * from './api/http/dto/index.js';

