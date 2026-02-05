"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostStructureTransactionManager = void 0;
// ─────────────────────────────────────────────────────────────
// Transaction Manager
// ─────────────────────────────────────────────────────────────
class CostStructureTransactionManager {
    constructor(guardian, eventPublisher) {
        this.guardian = guardian;
        this.eventPublisher = eventPublisher;
    }
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
    async execute(command, handler, context) {
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
        }
        catch (error) {
            // Re-throw invariant violations as-is
            throw error;
        }
    }
    /**
     * Exécute plusieurs commandes dans une transaction unique
     * Rollback complet en cas d'échec
     */
    async executeAll(commands, context) {
        const startTime = Date.now();
        const allEvents = [];
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
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CostStructureTransactionManager = CostStructureTransactionManager;
//# sourceMappingURL=cost-structure.transaction-manager.js.map