/**
 * 📝 AggregateCreated - Événement domaine: un agrégat a été créé
 *
 * Propriétés:
 * - Type: string littéral "AggregateCreated" (immutable, utilisé pour dispatching)
 * - aggregateId: L'identité de l'agrégat créé
 * - occurredAt: L'instant où cet événement s'est produit
 *
 * Sémantique:
 * - Cet événement est émis quand une AggregateId commence à exister
 * - L'événement capture le moment exact de création
 * - L'événement est immutable: ce qui s'est passé ne change pas
 *
 * Usage:
 * - Stocker dans un event store
 * - Reconstructeur d'état via event sourcing
 * - Auditer les créations
 *
 * Propriétés garanties:
 * ✅ Immutable (readonly partout)
 * ✅ Déterministe (pas d'état aléatoire)
 * ✅ Sérialisable (valeur-objects uniquement)
 * ✅ Type-safe (pas de string brut)
 * ✅ Zéro logique (contient juste le fait)
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export class AggregateCreated {
  /**
   * Type d'événement = discriminant pour dispatching.
   *
   * Utilisé par event handlers pour reconnaître le type d'événement.
   * Littéral string pour que TypeScript puisse en faire une union discriminée.
   */
  readonly type = 'AggregateCreated' as const;

  /**
   * Construis un événement AggregateCreated.
   *
   * @param aggregateId - L'identité de l'agrégat créé
   * @param occurredAt - L'instant de création
   */
  constructor(
    public readonly aggregateId: AggregateId,
    public readonly occurredAt: Timestamp
  ) {
    // Immutable après construction
    Object.freeze(this);
  }

  /**
   * Sérialisation pour transport/persistence.
   *
   * Retourne un objet plain qui peut être JSON.stringify()
   */
  toJSON(): {
    type: 'AggregateCreated';
    aggregateId: string;
    occurredAt: string;
  } {
    return {
      type: this.type,
      aggregateId: this.aggregateId.toJSON(),
      occurredAt: this.occurredAt.toJSON(),
    };
  }

  /**
   * Reconstruit un AggregateCreated à partir de données sérialisées.
   *
   * Utile pour charger des événements depuis un event store.
   *
   * @param data - Objet avec type, aggregateId, occurredAt
   * @returns Nouvelle instance d'AggregateCreated
   * @throws DomainError si données invalides
   */
  static fromJSON(data: {
    type: string;
    aggregateId: string;
    occurredAt: string;
  }): AggregateCreated {
    if (data.type !== 'AggregateCreated') {
      throw new Error(`Expected type "AggregateCreated", got "${data.type}"`);
    }

    const aggregateId = AggregateId.create(data.aggregateId);
    const occurredAt = Timestamp.fromISO(data.occurredAt);

    return new AggregateCreated(aggregateId, occurredAt);
  }
}
