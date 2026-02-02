/**
 * 📝 AggregateUpdated - Événement domaine: un agrégat a été mis à jour
 *
 * Propriétés:
 * - Type: string littéral "AggregateUpdated" (immutable, discriminant)
 * - aggregateId: L'identité de l'agrégat mis à jour
 * - changes: Les données modifiées (nouveau contenu)
 * - occurredAt: L'instant où cette mise à jour s'est produite
 *
 * Sémantique:
 * - Cet événement est émis quand un agrégat existant reçoit des mises à jour
 * - Ne remplace pas l'événement de création (append-only)
 * - Capture la nouvelle vérité (nouvelle snapshot) au moment de l'update
 * - L'événement est immutable: ce qui s'est passé ne change pas
 *
 * Différence avec AggregateCreated:
 * - AggregateCreated: marque le début d'existence (1x par agrégat)
 * - AggregateUpdated: chaque changement significatif (1+ par agrégat)
 *
 * Usage:
 * - Stocker dans event store
 * - Reconstructeur d'état via event sourcing (rejouer les updates)
 * - Auditer les modifications
 * - Déclencher réactions (side effects)
 *
 * Propriétés garanties:
 * ✅ Immutable (readonly partout)
 * ✅ Déterministe
 * ✅ Sérialisable
 * ✅ Type-safe
 * ✅ Append-only (jamais de suppression)
 * ✅ Zéro logique
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export class AggregateUpdated {
  /**
   * Type d'événement = discriminant pour dispatching.
   *
   * Utilisé par event handlers et state reconstructors.
   * Littéral string pour union discriminée TypeScript.
   */
  readonly type = 'AggregateUpdated' as const;

  /**
   * Construis un événement AggregateUpdated.
   *
   * @param aggregateId - L'identité de l'agrégat mis à jour
   * @param changes - Les données modifiées (ce qui a changé)
   * @param occurredAt - L'instant de mise à jour
   */
  constructor(
    public readonly aggregateId: AggregateId,
    public readonly changes: Readonly<Record<string, unknown>>,
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
    type: 'AggregateUpdated';
    aggregateId: string;
    changes: Record<string, unknown>;
    occurredAt: string;
  } {
    return {
      type: this.type,
      aggregateId: this.aggregateId.toJSON(),
      changes: this.changes,
      occurredAt: this.occurredAt.toJSON(),
    };
  }

  /**
   * Reconstruit un AggregateUpdated à partir de données sérialisées.
   *
   * Utile pour charger des événements depuis un event store.
   *
   * @param data - Objet avec type, aggregateId, changes, occurredAt
   * @returns Nouvelle instance d'AggregateUpdated
   * @throws Error si données invalides
   */
  static fromJSON(data: {
    type: string;
    aggregateId: string;
    changes: Record<string, unknown>;
    occurredAt: string;
  }): AggregateUpdated {
    if (data.type !== 'AggregateUpdated') {
      throw new Error(`Expected type "AggregateUpdated", got "${data.type}"`);
    }

    const aggregateId = AggregateId.create(data.aggregateId);
    const occurredAt = Timestamp.fromISO(data.occurredAt);

    return new AggregateUpdated(aggregateId, data.changes, occurredAt);
  }
}
