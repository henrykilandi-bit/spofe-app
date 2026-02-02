/**
 * 🔐 Domain Fact: AggregateClosed
 *
 * Fait domaine déclarant qu'un agrégat est terminal.
 * C'est le signal qui rend un agrégat immutable pour Guardian.
 *
 * Propriétés:
 * ✅ Terminal = pas de modificationultérieure possible
 * ✅ Versionnée = timestamp exact
 * ✅ Traçable = causalement liée à AggregateClosed event
 *
 * Impact métier:
 * 👉 Guardian refuse tout UPDATE_AGGREGATE après ce Fact
 * 👉 Read-models le détectent pour afficher "fermé"
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export class AggregateClosed {
  /**
   * Type discriminant
   * @readonly
   * @type {'AggregateClosed'}
   */
  readonly type = 'AggregateClosed' as const;

  /**
   * Constructeur
   * @param aggregateId - Identifiant terminal
   * @param validFrom - Date de fermeture (UTC)
   */
  constructor(
    readonly aggregateId: AggregateId,
    readonly validFrom: Timestamp
  ) {
    // Immutable freeze for extra safety
    Object.freeze(this);
  }

  /**
   * Sérialisation JSON pour fact store
   * @returns Objet sérialisable
   */
  toJSON(): {
    type: 'AggregateClosed';
    aggregateId: string;
    validFrom: string;
  } {
    return {
      type: this.type,
      aggregateId: this.aggregateId.value,
      validFrom: this.validFrom.iso,
    };
  }

  /**
   * Désérialisation depuis fact store
   * @param json - Données sérialisées
   * @returns Instance AggregateClosed
   */
  static fromJSON(json: {
    aggregateId: string;
    validFrom: string;
  }): AggregateClosed {
    return new AggregateClosed(
      AggregateId.create(json.aggregateId),
      Timestamp.fromISO(json.validFrom)
    );
  }
}

/**
 * Type pour discriminated unions
 */
export type TerminalFact = AggregateClosed;
