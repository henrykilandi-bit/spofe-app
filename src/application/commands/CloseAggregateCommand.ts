/**
 * 🔒 CloseAggregateCommand
 *
 * Ferme définitivement un agrégat.
 * Domain-first: validation → Domain Objects → TransactionManager
 *
 * Contrat:
 * ✅ Un agrégat CREATE → UPDATE... → CLOSE (cycle complet)
 * ✅ Pas de UPDATE après CLOSE (Guardian enforce)
 * ✅ Pas de double CLOSE (Guardian enforce)
 * ✅ Append-only: event + fact, jamais DELETE
 *
 * Flux d'exécution:
 * 1. Validation Value Objects (AggregateId, ActorRole)
 * 2. Création Domain Event (AggregateClosed)
 * 3. Création Domain Fact (AggregateClosed - terminal)
 * 4. Mappage vers TransactionManager
 * 5. Guardian validation (processName = CLOSE_AGGREGATE)
 */

import { randomUUID } from 'crypto';

// Domain Layer
import {
  AggregateId,
  ActorRole,
  DomainError,
} from '../../../domain';
import { Timestamp, createTimestamp } from '../../domain/value-objects/Timestamp';
import { AggregateClosed as AggregateClosedEvent } from '../../domain/events/AggregateClosed';
import { AggregateClosed as AggregateClosedFact } from '../../domain/facts/AggregateClosed';

/**
 * Input DTO pour fermeture d'agrégat
 */
export interface CloseAggregateInput {
  aggregateId: string;
  actorRole: 'SYSTEM' | 'ADMIN' | 'USER';
}

/**
 * Command: CloseAggregateCommand
 *
 * Responsabilité:
 * 1. Valider les Value Objects
 * 2. Créer l'Event de clôture
 * 3. Créer le Fact terminal
 * 4. Orchestrer la persistance via TransactionManager
 */
export class CloseAggregateCommand {
  /**
   * Injection de dépendance
   * @param transactionManager - Service de persistance
   */
  constructor(private readonly transactionManager: any) {}

  /**
   * Exécute la fermeture d'un agrégat
   *
   * Étapes:
   * 1. Validation AggregateId (UUID v4, lowercase)
   * 2. Validation ActorRole (SYSTEM|ADMIN|USER)
   * 3. Timestamp UTC courant
   * 4. Création AggregateClosed Event
   * 5. Création AggregateClosed Fact (terminal)
   * 6. Mappage à Decision payload
   * 7. executeDecision() → Guardian validation
   *
   * @param input - CloseAggregateInput
   * @throws DomainError si validation échoue
   * @returns Promise<void>
   */
  async execute(input: CloseAggregateInput): Promise<void> {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Domain Value Objects Validation
    // ─────────────────────────────────────────────────────────────

    let aggregateId: AggregateId;
    try {
      aggregateId = AggregateId.create(input.aggregateId);
    } catch (error) {
      throw new DomainError(
        `Invalid aggregateId: ${(error as Error).message}`
      );
    }

    let actorRole: ActorRole;
    try {
      actorRole = ActorRole.create(input.actorRole);
    } catch (error) {
      throw new DomainError(
        `Invalid actorRole: ${(error as Error).message}`
      );
    }

    const now = createTimestamp();

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Domain Event - AggregateClosed
    // ─────────────────────────────────────────────────────────────

    const closedEvent = new AggregateClosedEvent(aggregateId, now);

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Domain Fact - AggregateClosed (Terminal)
    // ─────────────────────────────────────────────────────────────

    const closedFact = new AggregateClosedFact(aggregateId, now);

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Map to TransactionManager Decision
    // ─────────────────────────────────────────────────────────────

    const decisionId = randomUUID();
    const eventId = randomUUID();
    const closedFactId = randomUUID();

    const decision = {
      decisionId,
      processName: 'CLOSE_AGGREGATE',
      decisionType: 'CLOSE',
      actorRole: actorRole.value,

      payload: {
        aggregateId: aggregateId.value,
      },

      events: [
        {
          eventId,
          eventType: 'CLOSED',
          payload: {
            type: closedEvent.type,
            aggregateId: aggregateId.value,
            occurredAt: closedEvent.occurredAt.iso,
          },
        },
      ],

      facts: [
        {
          factId: closedFactId,
          aggregateId: aggregateId.value,
          factType: 'CLOSED',
          payload: {
            type: closedFact.type,
            aggregateId: aggregateId.value,
            validFrom: closedFact.validFrom.iso,
          },
          causedByEvent: eventId,
        },
      ],

      context: {
        aggregateId: aggregateId.value,
        event: closedEvent.type,
        timestamp: now.iso,
      },
    };

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Execute via TransactionManager
    // ─────────────────────────────────────────────────────────────

    await this.transactionManager.executeDecision(decision);

    // ✅ Success: Decision persisted, Guardian validated
  }
}
