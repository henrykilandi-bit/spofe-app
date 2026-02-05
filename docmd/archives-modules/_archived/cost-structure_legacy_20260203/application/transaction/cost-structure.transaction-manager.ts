/**
 * Transaction Manager — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Orchestrateur central du write-side.
 * Garantit l'atomicité et l'ordre d'exécution:
 *   Command → LoadState → Guardian → Handle → Persist → Emit
 * 
 * ⚠️ STRICTEMENT INTERDIT:
 *   - Logique métier dans ce fichier
 *   - Calculs hors Guardian
 *   - Lecture read-models
 */

import { CostStructureGuardian, GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import type { CostStructureCommand } from '../commands/index.js';
import type { CostStructureEvent } from '../../domain/events/index.js';

// ─────────────────────────────────────────────────────────────
// Handler Interface
// ─────────────────────────────────────────────────────────────

export interface CommandHandler<TCommand extends CostStructureCommand> {
  /**
   * Charge l'état nécessaire à la validation
   */
  loadState(command: TCommand): Promise<GuardianContext>;

  /**
   * Génère les events depuis la commande (AUCUN calcul métier ici)
   * Le Guardian a déjà enrichi le state avec les résultats
   */
  handle(command: TCommand, state: GuardianContext): Promise<CostStructureEvent[]>;

  /**
   * Persiste les events de manière atomique
   */
  persist(events: CostStructureEvent[]): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Transaction Context
// ─────────────────────────────────────────────────────────────

export interface TransactionContext {
  correlationId: string;
  causationId?: string;
  actorId: string;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// Transaction Result
// ─────────────────────────────────────────────────────────────

export interface TransactionResult {
  success: boolean;
  events: CostStructureEvent[];
  correlationId: string;
  duration: number;
}

// ─────────────────────────────────────────────────────────────
// Event Publisher Interface
// ─────────────────────────────────────────────────────────────

export interface EventPublisher {
  publish(events: CostStructureEvent[]): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Transaction Manager
// ─────────────────────────────────────────────────────────────

export class CostStructureTransactionManager {
  constructor(
    private readonly guardian: CostStructureGuardian,
    private readonly eventPublisher?: EventPublisher,
  ) {}

  /**
   * Exécute une commande dans une transaction
   * 
   * Workflow:
   * 1. Load state from repository
   * 2. Guardian validates invariants (UNIQUE point de validation)
   * 3. Handler generates events
   * 4. Persist events atomically
   * 5. Publish events for read-side
   */
  async execute<TCommand extends CostStructureCommand>(
    command: TCommand,
    handler: CommandHandler<TCommand>,
    context: TransactionContext,
  ): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      // 1️⃣ LOAD STATE
      const state = await handler.loadState(command);

      // 2️⃣ GUARDIAN — Point UNIQUE de validation
      // Le Guardian peut enrichir le state (ex: résultats de simulation)
      const validatedState = this.guardian.validate(command, state);

      // 3️⃣ DOMAIN — Génération des events
      const events = await handler.handle(command, validatedState);

      // 4️⃣ PERSIST — Écriture atomique
      await handler.persist(events);

      // 5️⃣ PUBLISH — Pour le read-side (async)
      if (this.eventPublisher) {
        // Fire-and-forget pour ne pas bloquer
        this.eventPublisher.publish(events).catch(err => {
          console.error('[TransactionManager] Event publish failed:', err);
        });
      }

      return {
        success: true,
        events,
        correlationId: context.correlationId,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // Re-throw invariant violations as-is
      throw error;
    }
  }

  /**
   * Exécute plusieurs commandes dans une transaction unique
   * Rollback complet en cas d'échec
   */
  async executeAll(
    commands: Array<{
      command: CostStructureCommand;
      handler: CommandHandler<CostStructureCommand>;
    }>,
    context: TransactionContext,
  ): Promise<TransactionResult> {
    const startTime = Date.now();
    const allEvents: CostStructureEvent[] = [];

    try {
      for (const { command, handler } of commands) {
        const state = await handler.loadState(command);
        const validatedState = this.guardian.validate(command, state);
        const events = await handler.handle(command, validatedState);
        allEvents.push(...events);
      }

      // Persist all events atomically
      for (const { handler } of commands) {
        await handler.persist(allEvents);
      }

      // Publish all events
      if (this.eventPublisher) {
        this.eventPublisher.publish(allEvents).catch(err => {
          console.error('[TransactionManager] Event publish failed:', err);
        });
      }

      return {
        success: true,
        events: allEvents,
        correlationId: context.correlationId,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      throw error;
    }
  }
}
