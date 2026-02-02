/**
 * ✅ AggregateExists - Fait domaine: un agrégat existe
 *
 * Propriétés:
 * - Type: string littéral "AggregateExists" (immutable)
 * - aggregateId: L'identité de l'agrégat
 * - validFrom: L'instant à partir duquel ce fait est vrai
 *
 * Sémantique:
 * - Cet objet affirme qu'une AggregateId a commencé à exister
 * - Le fait était vrai depuis validFrom jusqu'à maintenant (ou révocation)
 * - Un fait peut être révoqué (suppression logique), créant un AggregateNotExists
 *
 * Usage:
 * - Déterminer si un agrégat est accessible
 * - Auditer les cycles de vie
 * - Reconstructeur d'état par snapshots
 *
 * Propriétés garanties:
 * ✅ Immutable
 * ✅ Déterministe
 * ✅ Sérialisable
 * ✅ Type-safe
 * ✅ Zéro logique
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export class AggregateExists {
  /**
   * Type de fait = discriminant pour dispatching.
   */
  readonly type = 'AggregateExists' as const;

  /**
   * Construis un fait AggregateExists.
   *
   * @param aggregateId - L'identité de l'agrégat qui existe
   * @param validFrom - L'instant à partir duquel ce fait est vrai
   */
  constructor(
    public readonly aggregateId: AggregateId,
    public readonly validFrom: Timestamp
  ) {
    // Immutable après construction
    Object.freeze(this);
  }

  /**
   * Sérialisation pour transport/persistence.
   */
  toJSON(): {
    type: 'AggregateExists';
    aggregateId: string;
    validFrom: string;
  } {
    return {
      type: this.type,
      aggregateId: this.aggregateId.toJSON(),
      validFrom: this.validFrom.toJSON(),
    };
  }

  /**
   * Reconstruit un AggregateExists à partir de données sérialisées.
   *
   * @param data - Objet avec type, aggregateId, validFrom
   * @returns Nouvelle instance d'AggregateExists
   * @throws Error si données invalides
   */
  static fromJSON(data: {
    type: string;
    aggregateId: string;
    validFrom: string;
  }): AggregateExists {
    if (data.type !== 'AggregateExists') {
      throw new Error(`Expected type "AggregateExists", got "${data.type}"`);
    }

    const aggregateId = AggregateId.create(data.aggregateId);
    const validFrom = Timestamp.fromISO(data.validFrom);

    return new AggregateExists(aggregateId, validFrom);
  }
}
