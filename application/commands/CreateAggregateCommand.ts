/**
 * ⚙️ CreateAggregateCommand - Créer un nouvel agrégat
 *
 * REFACTOR: Domain-first (Version typée)
 *
 * Responsabilité:
 * - Orchestrer la création d'un agrégat
 * - Construire les Value Objects du Domain
 * - Émettre l'événement de création
 * - Mapper Domain → TransactionManager
 *
 * Flux:
 * HTTP Input (any) → DTO → Value Objects → Domain Event → TransactionManager
 *                                        → Domain Facts   ↓
 *                                                    Guardian (validation)
 *                                                    DB (persistence)
 *                                                    Commit
 *
 * Propriétés:
 * ✅ Domain-first (Value Objects typés)
 * ✅ Guardian-compatible (TransactionManager)
 * ✅ SILC-compliant (append-only)
 * ✅ Testable (injection de TransactionManager)
 * ✅ Zéro logique métier (orchestration seulement)
 */

// Standard library
import { randomUUID } from 'crypto';

// Domain
import {
  AggregateId,
  ActorRole,
  Timestamp,
  AggregateCreated,
  AggregateExists,
  AggregateSnapshot,
} from '../../domain';

// Application
import type { ExecuteDecisionInput } from '../../src/application/transaction/TransactionManager';

interface DecisionExecutor {
  executeDecision(input: ExecuteDecisionInput): Promise<unknown>;
}

/**
 * Input DTO - Données brutes depuis HTTP
 *
 * Aucune validation ici (elle se fait à la création des Value Objects).
 */
export interface CreateAggregateInput {
  /**
   * UUID de l'agrégat à créer.
   * Sera validé lors de AggregateId.create()
   */
  aggregateId: string;

  /**
   * Données initiales de l'agrégat.
   * Typées Record<string, unknown> (pas de restriction)
   */
  initialData: Record<string, unknown>;

  /**
   * Rôle de l'acteur qui demande la création.
   * Valeurs: 'SYSTEM', 'ADMIN', 'USER'
   */
  actorRole: 'SYSTEM' | 'ADMIN' | 'USER';
}

/**
 * CreateAggregateCommand - Cas d'usage pour création d'agrégat
 *
 * Pattern CQRS simplifié:
 * - Command = demand d'action
 * - execute() = handler
 * - Retour: void (side effect = persistence)
 */
export class CreateAggregateCommand {
  /**
   * Construis une commande de création.
   *
   * @param transactionManager - Gérant les transactions (injection)
   */
  constructor(private readonly transactionManager: DecisionExecutor) {}

  /**
   * Exécute la création d'un nouvel agrégat.
   *
   * Flux:
   * 1. Valider les entrées (création Value Objects)
   * 2. Construire Domain Event
   * 3. Dériver Domain Facts
   * 4. Mapper Domain → TransactionManager
   * 5. Retourner control à Guardian / DB
   *
   * @param input - Les données HTTP
   * @throws DomainError si une valeur est invalide
   * @throws Error si TransactionManager échoue
   */
  async execute(input: CreateAggregateInput): Promise<void> {
    // ─────────────────────────────────────────────
    // Étape 1: Créer Value Objects (validation)
    // ─────────────────────────────────────────────
    // Les constructeurs vont lever DomainError si invalide.
    // C'est déterministe: même input = même résultat.

    const aggregateId = AggregateId.create(input.aggregateId);
    const actorRole = ActorRole.create(input.actorRole);
    const now = Timestamp.now();

    // ─────────────────────────────────────────────
    // Étape 2: Construire Domain Event
    // ─────────────────────────────────────────────
    // L'événement capture "ce qui s'est passé" au moment de la création.
    // Il est immutable et sérialisable.

    const createdEvent = new AggregateCreated(aggregateId, now);

    // ─────────────────────────────────────────────
    // Étape 3: Dériver Domain Facts
    // ─────────────────────────────────────────────
    // Les faits découlent logiquement de l'événement.
    // - Si AggregateCreated, alors AggregateExists
    // - Si Création, alors il y a une première Snapshot

    const existsFact = new AggregateExists(aggregateId, now);

    const snapshotFact = new AggregateSnapshot(
      aggregateId,
      input.initialData,
      now
    );

    // ─────────────────────────────────────────────
    // Étape 4: Mapper Domain → TransactionManager
    // ─────────────────────────────────────────────
    // TransactionManager ne connaît pas le Domain.
    // Nous convertissons en sa langue (IDs, payloads, etc).

    const decisionId = randomUUID();
    const eventId = randomUUID();
    const existsFactId = randomUUID();
    const snapshotFactId = randomUUID();

    await this.transactionManager.executeDecision({
      // Identité de la décision
      decisionId,

      // Process SILC correspondant
      processName: 'CREATE_AGGREGATE',

      // Type de décision
      decisionType: 'CREATE',

      // Qui a demandé
      actorRole: actorRole.value,

      // Payload principal (résumé compréhensible)
      payload: {
        aggregateId: aggregateId.value,
      },

      // Événements générés
      events: [
        {
          eventId,
          eventType: 'CREATED',
          payload: {
            // Sérialisation complète de l'événement
            type: createdEvent.type,
            aggregateId: aggregateId.value,
            occurredAt: createdEvent.occurredAt.toISO(),
          },
        },
      ],

      // Facts générées par cet événement
      facts: [
        {
          factId: existsFactId,
          aggregateId: aggregateId.value,
          factType: 'EXISTENCE',
          payload: {
            type: existsFact.type,
            aggregateId: aggregateId.value,
            validFrom: existsFact.validFrom.toISO(),
          },
          causedByEvent: eventId,
        },
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
        event: createdEvent.type,
        timestamp: now.toISO(),
      },
    });
  }
}
