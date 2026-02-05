/**
 * Cost-Structure Module (NestJS)
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Module NestJS pour le domaine Cost-Structure (COUTFLEX).
 * Expose les APIs Read/Write et le contrat Budget.
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    CostStructureModule                      │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Controllers                                                │
 * │  ├── CostStructureReadController (GET - read-models)        │
 * │  ├── CostStructureQueryController (GET - queries)           │
 * │  ├── CostStructureController (POST/PUT - commands)          │
 * │  └── BudgetReadyController (GET - Budget integration)       │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Providers                                                  │
 * │  ├── CostStructureQueryRepository (SQL Views → DTOs)        │
 * │  ├── Write-side repositories (Event Sourcing)               │
 * │  └── Handlers (Command Handlers)                            │
 * └─────────────────────────────────────────────────────────────┘
 */

import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

// ─────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────
import { CostStructureReadController } from './api/cost-structure-read.controller.js';
import { CostStructureQueryController } from './api/cost-structure.query.controller.js';
import { CostStructureController } from './api/cost-structure.controller.js';
import { BudgetReadyController } from './api/http/controllers/budget-ready.controller.js';

// ─────────────────────────────────────────────────────────────
// Query Repository (Read-Side)
// ─────────────────────────────────────────────────────────────
import { CostStructureQueryRepository } from './infrastructure/cost-structure.query.repository.js';

// ─────────────────────────────────────────────────────────────
// Write-Side Repositories
// ─────────────────────────────────────────────────────────────
import { 
  PostgresEconomicProjectRepository,
  type EconomicProjectRepository,
} from './infrastructure/persistence/economic-project.repository.js';
import { 
  PostgresCostStructureRepository,
  type CostStructureRepository,
} from './infrastructure/persistence/cost-structure.repository.js';
import { 
  PostgresDecisionRecordRepository,
  type DecisionRecordRepository,
} from './infrastructure/persistence/decision-record.repository.js';

// ─────────────────────────────────────────────────────────────
// Guardian & Transaction Manager
// ─────────────────────────────────────────────────────────────
import { CostStructureGuardian } from './domain/guardian/cost-structure.guardian.js';
import { CostStructureTransactionManager } from './application/transaction/cost-structure.transaction-manager.js';

// ─────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────
import { CreateEconomicProjectHandler } from './application/handlers/create-economic-project.handler.js';
import { CreateCostStructureHandler } from './application/handlers/create-cost-structure.handler.js';
import { AddCostLineHandler } from './application/handlers/add-cost-line.handler.js';
import { UpdateAssumptionsHandler } from './application/handlers/update-assumptions.handler.js';
import { RunSimulationHandler } from './application/handlers/run-simulation.handler.js';
import { FreezeCostStructureHandler } from './application/handlers/freeze-cost-structure.handler.js';
import { ValidateProjectHandler } from './application/handlers/validate-project.handler.js';
import { RejectProjectHandler } from './application/handlers/reject-project.handler.js';

// ─────────────────────────────────────────────────────────────
// Injection Tokens
// ─────────────────────────────────────────────────────────────
export const COST_STRUCTURE_DB_POOL = 'COST_STRUCTURE_DB_POOL';
export const ECONOMIC_PROJECT_REPOSITORY = 'ECONOMIC_PROJECT_REPOSITORY';
export const COST_STRUCTURE_REPOSITORY = 'COST_STRUCTURE_REPOSITORY';
export const DECISION_RECORD_REPOSITORY = 'DECISION_RECORD_REPOSITORY';

/**
 * Configuration du module
 */
export interface CostStructureModuleOptions {
  /** URL de connexion PostgreSQL (DATABASE_URL) */
  databaseUrl: string;
  /** Nombre max de connexions dans le pool */
  poolMax?: number;
  /** Timeout connexion (ms) */
  connectionTimeout?: number;
}

@Global()
@Module({})
export class CostStructureModule {
  /**
   * Méthode factory pour configuration dynamique
   * 
   * Usage:
   * ```ts
   * CostStructureModule.forRoot({
   *   databaseUrl: process.env.DATABASE_URL!,
   *   poolMax: 20,
   * })
   * ```
   */
  static forRoot(options: CostStructureModuleOptions) {
    const poolProvider = {
      provide: COST_STRUCTURE_DB_POOL,
      useFactory: () => {
        return new Pool({
          connectionString: options.databaseUrl,
          max: options.poolMax ?? 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: options.connectionTimeout ?? 5000,
        });
      },
    };

    return {
      module: CostStructureModule,
      controllers: [
        CostStructureReadController,
        CostStructureQueryController,
        CostStructureController,
        BudgetReadyController,
      ],
      providers: [
        // ─────────────────────────────────────────────────────────
        // Database Pool
        // ─────────────────────────────────────────────────────────
        poolProvider,

        // ─────────────────────────────────────────────────────────
        // Query Repository (Read-Side) — SQL Views → DTOs
        // ─────────────────────────────────────────────────────────
        {
          provide: CostStructureQueryRepository,
          useFactory: (pool: Pool) => new CostStructureQueryRepository(pool),
          inject: [COST_STRUCTURE_DB_POOL],
        },

        // ─────────────────────────────────────────────────────────
        // Write-Side Repositories (Event Sourcing)
        // ─────────────────────────────────────────────────────────
        {
          provide: ECONOMIC_PROJECT_REPOSITORY,
          useFactory: (pool: Pool) => new PostgresEconomicProjectRepository(pool),
          inject: [COST_STRUCTURE_DB_POOL],
        },
        {
          provide: COST_STRUCTURE_REPOSITORY,
          useFactory: (pool: Pool) => new PostgresCostStructureRepository(pool),
          inject: [COST_STRUCTURE_DB_POOL],
        },
        {
          provide: DECISION_RECORD_REPOSITORY,
          useFactory: (pool: Pool) => new PostgresDecisionRecordRepository(pool),
          inject: [COST_STRUCTURE_DB_POOL],
        },

        // ─────────────────────────────────────────────────────────
        // Guardian (Domain Logic) — Singleton
        // ─────────────────────────────────────────────────────────
        CostStructureGuardian,

        // ─────────────────────────────────────────────────────────
        // Transaction Manager
        // ─────────────────────────────────────────────────────────
        {
          provide: CostStructureTransactionManager,
          useFactory: (guardian: CostStructureGuardian) => 
            new CostStructureTransactionManager(guardian),
          inject: [CostStructureGuardian],
        },

        // ─────────────────────────────────────────────────────────
        // Command Handlers
        // ─────────────────────────────────────────────────────────
        {
          provide: CreateEconomicProjectHandler,
          useFactory: (repo: EconomicProjectRepository) => 
            new CreateEconomicProjectHandler(repo),
          inject: [ECONOMIC_PROJECT_REPOSITORY],
        },
        {
          provide: CreateCostStructureHandler,
          useFactory: (projectRepo: EconomicProjectRepository, csRepo: CostStructureRepository) =>
            new CreateCostStructureHandler(projectRepo, csRepo),
          inject: [ECONOMIC_PROJECT_REPOSITORY, COST_STRUCTURE_REPOSITORY],
        },
        {
          provide: AddCostLineHandler,
          useFactory: (repo: CostStructureRepository) => new AddCostLineHandler(repo),
          inject: [COST_STRUCTURE_REPOSITORY],
        },
        {
          provide: UpdateAssumptionsHandler,
          useFactory: (repo: CostStructureRepository) => new UpdateAssumptionsHandler(repo),
          inject: [COST_STRUCTURE_REPOSITORY],
        },
        {
          provide: RunSimulationHandler,
          useFactory: (repo: CostStructureRepository) => new RunSimulationHandler(repo),
          inject: [COST_STRUCTURE_REPOSITORY],
        },
        {
          provide: FreezeCostStructureHandler,
          useFactory: (csRepo: CostStructureRepository, projectRepo: EconomicProjectRepository) =>
            new FreezeCostStructureHandler(csRepo, projectRepo),
          inject: [COST_STRUCTURE_REPOSITORY, ECONOMIC_PROJECT_REPOSITORY],
        },
        {
          provide: ValidateProjectHandler,
          useFactory: (projectRepo: EconomicProjectRepository, decisionRepo: DecisionRecordRepository) =>
            new ValidateProjectHandler(projectRepo, decisionRepo),
          inject: [ECONOMIC_PROJECT_REPOSITORY, DECISION_RECORD_REPOSITORY],
        },
        {
          provide: RejectProjectHandler,
          useFactory: (projectRepo: EconomicProjectRepository, decisionRepo: DecisionRecordRepository) =>
            new RejectProjectHandler(projectRepo, decisionRepo),
          inject: [ECONOMIC_PROJECT_REPOSITORY, DECISION_RECORD_REPOSITORY],
        },
      ],
      exports: [
        // Export pour consommation par autres modules (ex: Budget)
        CostStructureQueryRepository,
        COST_STRUCTURE_DB_POOL,
      ],
    };
  }
}
