/**
 * 🔒 Domain Event: AggregateClosed
 *
 * Événement domaine déclarant la fin définitive d'un agrégat.
 * Immuable, sérialisable, append-only.
 *
 * Garanties:
 * ✅ Passé irréversible
 * ✅ Aucune modification ultérieure
 * ✅ Source de vérité pour Guardian
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export class AggregateClosed {
  /**
   * Type discriminant pour Union types
   * @readonly
   * @type {'AggregateClosed'}
   */
  readonly type = 'AggregateClosed' as const;

  /**
   * Constructeur
   * @param aggregateId - Identifiant de l'agrégat fermé
   * @param occurredAt - Moment exact de la fermeture (UTC)
   */
  constructor(
    readonly aggregateId: AggregateId,
    readonly occurredAt: Timestamp
  ) {}

  /**
   * Sérialisation JSON pour event store
   * @returns Objet sérialisable
   */
  toJSON(): {
    type: 'AggregateClosed';
    aggregateId: string;
    occurredAt: string;
  } {
    return {
      type: this.type,
      aggregateId: this.aggregateId.value,
      occurredAt: this.occurredAt.iso,
    };
  }

  /**
   * Désérialisation depuis event store
   * @param json - Données sérialisées
   * @returns Instance AggregateClosed
   */
  static fromJSON(json: {
    aggregateId: string;
    occurredAt: string;
  }): AggregateClosed {
    return new AggregateClosed(
      AggregateId.create(json.aggregateId),
      Timestamp.fromISO(json.occurredAt)
    );
  }
}

/**
 * Type pour discriminated unions
 */
export type DomainEvent = AggregateClosed;
