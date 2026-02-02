/**
 * 📸 AggregateSnapshot - Snapshot d'état d'un agrégat à un moment T
 *
 * Propriétés:
 * - Type: string littéral "AggregateSnapshot" (immutable)
 * - aggregateId: L'identité de l'agrégat snapshoppé
 * - data: L'état complet de l'agrégat (données quelconques)
 * - validFrom: L'instant où cet état est devenu vrai
 *
 * Générique:
 * - TData: Type des données capturées (extends Record<string, unknown>)
 * - Permet de typer fortement le contenu du snapshot
 *
 * Sémantique:
 * - Capte l'état complet d'un agrégat à un instant T
 * - Utilisé pour l'optimisation: event sourcing partial (non re-replay complet)
 * - Plusieurs snapshots pour le même agrégat = history d'état
 *
 * Usage:
 * - Stocker l'état actuel sans rejouer tous les événements
 * - Sérialiser/désérialiser depuis la DB
 * - Tester avec données spécifiques
 *
 * Propriétés garanties:
 * ✅ Immutable
 * ✅ Déterministe
 * ✅ Type-safe (generics sur TData)
 * ✅ Sérialisable
 * ✅ Extensible par TData
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

/**
 * Snapshot générique d'état d'agrégat.
 *
 * @template TData - Type des données snapshoppées
 */
export class AggregateSnapshot<TData extends Record<string, unknown>> {
  /**
   * Type de fait = discriminant pour dispatching.
   */
  readonly type = 'AggregateSnapshot' as const;

  /**
   * Construis un snapshot d'agrégat.
   *
   * @param aggregateId - L'identité de l'agrégat
   * @param data - L'état capturé
   * @param validFrom - L'instant où cet état était/est valide
   */
  constructor(
    public readonly aggregateId: AggregateId,
    public readonly data: Readonly<TData>,
    public readonly validFrom: Timestamp
  ) {
    // Immutable après construction
    Object.freeze(this);
  }

  /**
   * Sérialisation pour transport/persistence.
   *
   * Retourne un objet plain JSON-serializable.
   */
  toJSON(): {
    type: 'AggregateSnapshot';
    aggregateId: string;
    data: TData;
    validFrom: string;
  } {
    return {
      type: this.type,
      aggregateId: this.aggregateId.toJSON(),
      data: this.data,
      validFrom: this.validFrom.toJSON(),
    };
  }

  /**
   * Reconstruit un AggregateSnapshot à partir de données sérialisées.
   *
   * Le type TData doit correspondre à la structure attendue.
   * Validation est minimale: seule la structure externe est vérifiée.
   *
   * @param data - Objet avec type, aggregateId, data, validFrom
   * @returns Nouvelle instance d'AggregateSnapshot<TData>
   * @throws Error si données invalides
   */
  static fromJSON<TData extends Record<string, unknown>>(data: {
    type: string;
    aggregateId: string;
    data: TData;
    validFrom: string;
  }): AggregateSnapshot<TData> {
    if (data.type !== 'AggregateSnapshot') {
      throw new Error(`Expected type "AggregateSnapshot", got "${data.type}"`);
    }

    const aggregateId = AggregateId.create(data.aggregateId);
    const validFrom = Timestamp.fromISO(data.validFrom);

    return new AggregateSnapshot<TData>(
      aggregateId,
      data.data,
      validFrom
    );
  }

  /**
   * Clone le snapshot avec données modifiées.
   *
   * Utile pour créer une version mise à jour sans mutation.
   *
   * @param newData - Données modifiées
   * @returns Nouveau snapshot avec les nouvelles données
   */
  withData(newData: TData): AggregateSnapshot<TData> {
    return new AggregateSnapshot<TData>(
      this.aggregateId,
      newData,
      this.validFrom
    );
  }

  /**
   * Clone le snapshot avec timestamp modifié.
   *
   * Utile pour fixer le timestamp d'un snapshot.
   *
   * @param newValidFrom - Nouveau timestamp
   * @returns Nouveau snapshot avec le nouveau timestamp
   */
  withValidFrom(newValidFrom: Timestamp): AggregateSnapshot<TData> {
    return new AggregateSnapshot<TData>(
      this.aggregateId,
      this.data,
      newValidFrom
    );
  }
}
