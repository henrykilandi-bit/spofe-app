/**
 * ⚙️ UpdateAggregateCommand - Mettre à jour un agrégat existant
 *
 * Domain-first (Version typée)
 *
 * Responsabilité:
 * - Orchestrer la mise à jour d'un agrégat existant
 * - Construire les Value Objects du Domain
 * - Émettre l'événement de mise à jour
 * - Créer une nouvelle Snapshot
 * - Mapper Domain → TransactionManager
 *
 * Principe Append-Only:
 * ❌ pas d'UPDATE SQL (mutation)
 * ✅ 1 événement + 1 nouvelle snapshot
 * ✅ L'historique reste intact
 * ✅ Auditabilité complète
 *
 * Flux:
 * HTTP Input → DTO → Value Objects → Domain Event → TransactionManager
 *                                  → Domain Fact   ↓
 *                                          Guardian (validation)
 *                                          DB (append)
 *                                          Commit
 *
 * Propriétés:
 * ✅ Domain-first
 * ✅ Guardian-compatible
 * ✅ SILC-compliant (append-only)
 * ✅ Testable
 * ✅ Zéro mutation
 */

// Standard library
import { randomUUID } from 'crypto';

// Domain
import {
  AggregateId,
  ActorRole,
  Timestamp,
  AggregateSnapshot,
} from '../../domain';
import { AggregateUpdated } from '../../domain/events/AggregateUpdated';

// Application
import type { ExecuteDecisionInput } from '../../src/application/transaction/TransactionManager';

interface DecisionExecutor {
  executeDecision(input: ExecuteDecisionInput): Promise<unknown>;
}

/**
 * Input DTO - Données brutes depuis HTTP
 */
export interface UpdateAggregateInput {
  /**
   * UUID de l'agrégat à mettre à jour.
   * Sera validé lors de AggregateId.create()
   */
  aggregateId: string;

  /**
   * Les données modifiées (mise à jour complète ou partielle).
   *
   * Note: Sémantique dépend de l'application:
   * - Patch: seulement les champs modifiés
   * - Replace: nouvel état complet
   *
   * Ici: on traite comme "nouvel état complet" pour la Snapshot.
   */
  changes: Record<string, unknown>;

  /**
   * Rôle de l'acteur qui demande la mise à jour.
   */
  actorRole: 'SYSTEM' | 'ADMIN' | 'USER';
}

/**
 * UpdateAggregateCommand - Cas d'usage pour mise à jour d'agrégat
 *
 * Différence avec Create:
 * - Create: émet AggregateCreated + AggregateExists
 * - Update: émet AggregateUpdated + nouvelle AggregateSnapshot
 *
 * L'agrégat doit exister (Guardian validera).
 */
export class UpdateAggregateCommand {
  /**
   * Construis une commande de mise à jour.
   *
   * @param transactionManager - Gérant les transactions (injection)
   */
  constructor(private readonly transactionManager: DecisionExecutor) {}

  /**
   * Exécute la mise à jour d'un agrégat existant.
   *
   * Flux:
   * 1. Valider les entrées (création Value Objects)
   * 2. Construire Domain Event
   * 3. Dériver Domain Fact (nouvelle Snapshot)
   * 4. Mapper Domain → TransactionManager
   * 5. Retourner control à Guardian / DB
   *
   * @param input - Les données HTTP
   * @throws DomainError si une valeur est invalide
   * @throws Error si TransactionManager échoue
   */
  async execute(input: UpdateAggregateInput): Promise<void> {
    // ─────────────────────────────────────────────
    // Étape 1: Créer Value Objects (validation)
    // ─────────────────────────────────────────────

    const aggregateId = AggregateId.create(input.aggregateId);
    const actorRole = ActorRole.create(input.actorRole);
    const now = Timestamp.now();

    // ─────────────────────────────────────────────
    // Étape 2: Construire Domain Event
    // ─────────────────────────────────────────────
    // L'événement capture "ce qui a changé" et "quand".
    // Immutable et sérialisable.

    const updatedEvent = new AggregateUpdated(
      aggregateId,
      input.changes,
      now
    );

    // ─────────────────────────────────────────────
    // Étape 3: Dériver Domain Fact
    // ─────────────────────────────────────────────
    // Si AggregateUpdated, il y a une nouvelle vérité (Snapshot).
    // Cette Snapshot remplace la précédente.

    const snapshotFact = new AggregateSnapshot(
      aggregateId,
      input.changes, // Les changes deviennent le nouvel état
      now
    );

    // ─────────────────────────────────────────────
    // Étape 4: Mapper Domain → TransactionManager
    // ─────────────────────────────────────────────

    const decisionId = randomUUID();
    const eventId = randomUUID();
    const snapshotFactId = randomUUID();

    await this.transactionManager.executeDecision({
      // Identité de la décision
      decisionId,

      // Process SILC correspondant
      processName: 'UPDATE_AGGREGATE',

      // Type de décision
      decisionType: 'UPDATE',

      // Qui a demandé
      actorRole: actorRole.value,

      // Payload principal
      payload: {
        aggregateId: aggregateId.value,
        changes: input.changes,
      },

      // Événements générés
      events: [
        {
          eventId,
          eventType: 'UPDATED',
          payload: {
            // Sérialisation complète de l'événement
            type: updatedEvent.type,
            aggregateId: aggregateId.value,
            changes: updatedEvent.changes,
            occurredAt: updatedEvent.occurredAt.toISO(),
          },
        },
      ],

      // Facts générées par cet événement
      facts: [
        {
          factId: snapshotFactId,
          aggregateId: aggregateId.value,
          factType: 'SNAPSHOT',
          payload: {
            type: snapshotFact.type,
            aggregateId: aggregateId.value,
            data: snapshotFact.data,
            validFrom: snapshotFact.validFrom.toISO(),
          },
          causedByEvent: eventId,
        },
      ],

      // Context pour Guardian (audit, logging)
      context: {
        aggregateId: aggregateId.value,
        event: updatedEvent.type,
        timestamp: now.toISO(),
      },
    });
  }
}
