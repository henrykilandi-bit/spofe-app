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
export interface TransactionContext {
    correlationId: string;
    causationId?: string;
    actorId: string;
    timestamp: Date;
}
export interface TransactionResult {
    success: boolean;
    events: CostStructureEvent[];
    correlationId: string;
    duration: number;
}
export interface EventPublisher {
    publish(events: CostStructureEvent[]): Promise<void>;
}
export declare class CostStructureTransactionManager {
    private readonly guardian;
    private readonly eventPublisher?;
    constructor(guardian: CostStructureGuardian, eventPublisher?: EventPublisher | undefined);
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
    execute<TCommand extends CostStructureCommand>(command: TCommand, handler: CommandHandler<TCommand>, context: TransactionContext): Promise<TransactionResult>;
    /**
     * Exécute plusieurs commandes dans une transaction unique
     * Rollback complet en cas d'échec
     */
    executeAll(commands: Array<{
        command: CostStructureCommand;
        handler: CommandHandler<CostStructureCommand>;
    }>, context: TransactionContext): Promise<TransactionResult>;
}
//# sourceMappingURL=cost-structure.transaction-manager.d.ts.map