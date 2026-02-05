/**
 * Test Context — Integration Tests Harness
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Fournit un contexte réel pour les tests d'intégration:
 * - Guardian réel (pas de mock)
 * - Repositories in-memory (pour isolation)
 * - TransactionManager complet
 */

import { CostStructureGuardian } from '../../../domain/guardian/cost-structure.guardian.js';
import { 
  CostStructureTransactionManager,
  type CommandHandler,
} from '../../../application/transaction/cost-structure.transaction-manager.js';

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
} from '../../../application/commands/index.js';

// Handlers
import { CreateEconomicProjectHandler } from '../../../application/handlers/create-economic-project.handler.js';
import { CreateCostStructureHandler } from '../../../application/handlers/create-cost-structure.handler.js';
import { AddCostLineHandler } from '../../../application/handlers/add-cost-line.handler.js';
import { UpdateAssumptionsHandler } from '../../../application/handlers/update-assumptions.handler.js';
import { RunSimulationHandler } from '../../../application/handlers/run-simulation.handler.js';
import { FreezeCostStructureHandler } from '../../../application/handlers/freeze-cost-structure.handler.js';
import { ValidateProjectHandler } from '../../../application/handlers/validate-project.handler.js';
import { RejectProjectHandler } from '../../../application/handlers/reject-project.handler.js';

// Repositories (In-Memory for tests)
import { InMemoryEconomicProjectRepository } from '../../../infrastructure/persistence/economic-project.repository.js';
import { InMemoryCostStructureRepository } from '../../../infrastructure/persistence/cost-structure.repository.js';
import { InMemoryDecisionRecordRepository } from '../../../infrastructure/persistence/decision-record.repository.js';

// Events
import type { CostStructureEvent } from '../../../domain/events/index.js';

// ─────────────────────────────────────────────────────────────
// Test Context Interface
// ─────────────────────────────────────────────────────────────

export interface TestContext {
  tm: CostStructureTransactionManager;
  guardian: CostStructureGuardian;
  repos: {
    projectRepo: InMemoryEconomicProjectRepository;
    costStructureRepo: InMemoryCostStructureRepository;
    decisionRepo: InMemoryDecisionRecordRepository;
  };
  handlers: {
    createProject: CreateEconomicProjectHandler;
    createCostStructure: CreateCostStructureHandler;
    addCostLine: AddCostLineHandler;
    updateAssumptions: UpdateAssumptionsHandler;
    runSimulation: RunSimulationHandler;
    freezeStructure: FreezeCostStructureHandler;
    validateProject: ValidateProjectHandler;
    rejectProject: RejectProjectHandler;
  };
  execute: <TCommand extends import('../../../application/commands/index.js').CostStructureCommand>(
    command: TCommand,
    handler: CommandHandler<TCommand>,
  ) => Promise<CostStructureEvent[]>;
  clear: () => void;
}

// ─────────────────────────────────────────────────────────────
// Test Context Factory
// ─────────────────────────────────────────────────────────────

export async function createTestContext(): Promise<TestContext> {
  // Guardian réel — PAS DE MOCK
  const guardian = new CostStructureGuardian();

  // Repositories in-memory (isolation des tests)
  const projectRepo = new InMemoryEconomicProjectRepository();
  const costStructureRepo = new InMemoryCostStructureRepository();
  const decisionRepo = new InMemoryDecisionRecordRepository();

  // Transaction Manager avec Guardian réel
  const tm = new CostStructureTransactionManager(guardian);

  // Handlers avec repositories injectés
  const handlers = {
    createProject: new CreateEconomicProjectHandler(projectRepo),
    createCostStructure: new CreateCostStructureHandler(projectRepo, costStructureRepo),
    addCostLine: new AddCostLineHandler(costStructureRepo),
    updateAssumptions: new UpdateAssumptionsHandler(costStructureRepo),
    runSimulation: new RunSimulationHandler(costStructureRepo),
    freezeStructure: new FreezeCostStructureHandler(costStructureRepo, projectRepo),
    validateProject: new ValidateProjectHandler(projectRepo, decisionRepo),
    rejectProject: new RejectProjectHandler(projectRepo, decisionRepo),
  };

  // Helper pour exécuter les commandes
  const execute = async <TCommand extends import('../../../application/commands/index.js').CostStructureCommand>(
    command: TCommand,
    handler: CommandHandler<TCommand>,
  ): Promise<CostStructureEvent[]> => {
    const result = await tm.execute(command, handler, {
      correlationId: crypto.randomUUID(),
      actorId: 'test-actor',
      timestamp: new Date(),
    });
    return result.events;
  };

  // Helper pour nettoyer entre les tests
  const clear = () => {
    projectRepo.clear();
    costStructureRepo.clear();
    decisionRepo.clear();
  };

  return {
    tm,
    guardian,
    repos: {
      projectRepo,
      costStructureRepo,
      decisionRepo,
    },
    handlers,
    execute,
    clear,
  };
}

// ─────────────────────────────────────────────────────────────
// Test Data Builders
// ─────────────────────────────────────────────────────────────

export const TestData = {
  tenantId: 'tenant-test',
  projectId: 'project-001',
  actorId: 'user-123',

  /**
   * Crée un projet économique de test
   */
  createProjectCommand(overrides?: Partial<{
    tenantId: string;
    projectId: string;
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    actorId: string;
  }>) {
    return new CreateEconomicProjectCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      overrides?.name ?? 'Produit Test',
      overrides?.type ?? 'PRODUCT',
      overrides?.actorId ?? this.actorId,
    );
  },

  /**
   * Crée une structure de coûts de test
   */
  createCostStructureCommand(version = 1, overrides?: Partial<{
    tenantId: string;
    projectId: string;
    actorId: string;
  }>) {
    return new CreateCostStructureCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      version,
      overrides?.actorId ?? this.actorId,
    );
  },

  /**
   * Ajoute une ligne de coût valide
   */
  addCostLineCommand(
    category: 'VARIABLE' | 'FIXED' | 'INDIRECT',
    amount: number,
    version = 1,
    overrides?: Partial<{
      tenantId: string;
      projectId: string;
      label: string;
      currency: string;
      actorId: string;
    }>,
  ) {
    return new AddCostLineCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      version,
      category,
      overrides?.label ?? `Cost ${category}`,
      amount,
      overrides?.currency ?? 'EUR',
      undefined,
      overrides?.actorId ?? this.actorId,
    );
  },

  /**
   * Met à jour les hypothèses pour simulation
   */
  updateAssumptionsCommand(version = 1, overrides?: Partial<{
    tenantId: string;
    projectId: string;
    priceTarget: number;
    expectedVolume: number;
    capacityMax: number;
    scenarios: { pessimistic: number; realistic: number; optimistic: number };
    actorId: string;
  }>) {
    return new UpdateAssumptionsCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      version,
      overrides?.priceTarget ?? 100,
      overrides?.expectedVolume ?? 1000,
      overrides?.capacityMax ?? 2000,
      overrides?.scenarios ?? { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 },
      overrides?.actorId ?? this.actorId,
    );
  },

  /**
   * Lance une simulation
   */
  runSimulationCommand(version = 1, overrides?: Partial<{
    tenantId: string;
    projectId: string;
    actorId: string;
  }>) {
    return new RunSimulationCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      version,
      overrides?.actorId ?? this.actorId,
    );
  },

  /**
   * Gèle une structure de coûts
   */
  freezeCommand(version = 1, overrides?: Partial<{
    tenantId: string;
    projectId: string;
    actorId: string;
  }>) {
    return new FreezeCostStructureCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      version,
      overrides?.actorId ?? this.actorId,
    );
  },

  /**
   * Valide un projet
   */
  validateProjectCommand(overrides?: Partial<{
    tenantId: string;
    projectId: string;
    actorId: string;
    justification: string;
  }>) {
    return new ValidateProjectCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      overrides?.actorId ?? this.actorId,
      overrides?.justification ?? 'ROI validé par comité',
    );
  },

  /**
   * Rejette un projet
   */
  rejectProjectCommand(overrides?: Partial<{
    tenantId: string;
    projectId: string;
    actorId: string;
    reason: string;
  }>) {
    return new RejectProjectCommand(
      overrides?.tenantId ?? this.tenantId,
      overrides?.projectId ?? this.projectId,
      overrides?.actorId ?? this.actorId,
      overrides?.reason ?? 'Marge insuffisante',
    );
  },
};

// ─────────────────────────────────────────────────────────────
// Scenario Builders
// ─────────────────────────────────────────────────────────────

export const Scenarios = {
  /**
   * Setup complet jusqu'à DRAFT cost structure avec cost lines
   */
  async setupDraftWithCosts(ctx: TestContext, options?: {
    variableAmount?: number;
    fixedAmount?: number;
  }) {
    const { variableAmount = 5000, fixedAmount = 5000 } = options ?? {};

    await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
    await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
    await ctx.execute(
      TestData.addCostLineCommand('VARIABLE', variableAmount),
      ctx.handlers.addCostLine,
    );
    await ctx.execute(
      TestData.addCostLineCommand('FIXED', fixedAmount),
      ctx.handlers.addCostLine,
    );
    await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);
  },

  /**
   * Setup complet jusqu'à SIMULATED
   */
  async setupSimulated(ctx: TestContext, options?: {
    variableAmount?: number;
    fixedAmount?: number;
  }) {
    await this.setupDraftWithCosts(ctx, options);
    await ctx.execute(TestData.runSimulationCommand(), ctx.handlers.runSimulation);
  },

  /**
   * Setup complet jusqu'à FROZEN
   */
  async setupFrozen(ctx: TestContext, options?: {
    variableAmount?: number;
    fixedAmount?: number;
  }) {
    await this.setupSimulated(ctx, options);
    await ctx.execute(TestData.freezeCommand(), ctx.handlers.freezeStructure);
  },

  /**
   * Setup avec ratio variable > 70% (INVALIDE pour COUT-01)
   */
  async setupInvalidRatio(ctx: TestContext) {
    await ctx.execute(TestData.createProjectCommand(), ctx.handlers.createProject);
    await ctx.execute(TestData.createCostStructureCommand(), ctx.handlers.createCostStructure);
    // 80% variable = INVALID
    await ctx.execute(
      TestData.addCostLineCommand('VARIABLE', 8000),
      ctx.handlers.addCostLine,
    );
    await ctx.execute(
      TestData.addCostLineCommand('FIXED', 2000),
      ctx.handlers.addCostLine,
    );
    await ctx.execute(TestData.updateAssumptionsCommand(), ctx.handlers.updateAssumptions);
  },
};
