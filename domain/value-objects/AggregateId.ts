/**
 * 🆔 AggregateId - Identité unique et immuable
 *
 * Représente l'identité d'un agrégat dans SPOFE.
 * - Une UUID v4 valide (RFC 4122)
 * - Immuable après création
 * - Comparable par valeur
 * - Sérialisable
 *
 * Propriétés garanties:
 * ✅ Validée au créateur
 * ✅ Immutable (private constructor)
 * ✅ Type-safe (pas de string brut)
 * ✅ Comparable (value equality)
 */

import { DomainError } from './DomainError';

export class AggregateId {
  private constructor(public readonly value: string) {
    // Immutable après construction
    Object.freeze(this);
  }

  /**
   * Crée une nouvelle AggregateId après validation.
   *
   * Règles:
   * - Non vide
   * - Format UUID valide (RFC 4122)
   *
   * @param value - La valeur UUID candidate
   * @returns AggregateId valide
   * @throws DomainError si validation échoue
   */
  static create(value: string): AggregateId {
    if (!value || typeof value !== 'string') {
      throw new DomainError('AggregateId cannot be empty');
    }

    const trimmed = value.trim();

    if (!trimmed) {
      throw new DomainError('AggregateId cannot be empty after trimming');
    }

    // RFC 4122 UUID validation pattern
    // Format: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
    // où M est 1-5 (version) et N est 8-b (variant)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(trimmed)) {
      throw new DomainError(
        `AggregateId must be a valid UUID (RFC 4122), received: ${value}`
      );
    }

    // Normaliser en minuscules pour cohérence
    return new AggregateId(trimmed.toLowerCase());
  }

  /**
   * Compare deux AggregateId par valeur.
   *
   * @param other - L'AggregateId à comparer
   * @returns true si les valeurs sont identiques
   */
  equals(other: AggregateId): boolean {
    if (!other || !(other instanceof AggregateId)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Retourne la représentation string pour usage externe.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Sérialisation JSON.
   */
  toJSON(): string {
    return this.value;
  }
}
