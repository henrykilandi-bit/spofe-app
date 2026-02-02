/**
 * ⏰ Timestamp - Instant immuable en UTC
 *
 * Représente un point dans le temps avec précision millisecondes.
 * - Toujours en UTC (jamais de timezone locale)
 * - Immuable après création
 * - Comparable
 * - Sérialisable ISO 8601
 *
 * Propriétés garanties:
 * ✅ UTC uniquement (pas de timezone)
 * ✅ Immutable
 * ✅ Comparable (before, after, equals)
 * ✅ Sérialisable en ISO 8601
 * ✅ Déterministe (testable avec now() = mock)
 */

import { DomainError } from './DomainError';

export class Timestamp {
  private constructor(private readonly date: Date) {
    // Immutable après construction
    Object.freeze(this);
  }

  /**
   * Crée un Timestamp du moment présent.
   *
   * Idéal pour:
   * - Événements qui viennent de se produire
   * - Snapshots actuels
   * - Horodatage de requêtes
   *
   * Note: Retourne la date actuelle en UTC.
   *
   * @returns Timestamp pour maintenant (UTC)
   */
  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  /**
   * Crée un Timestamp à partir d'une Date donnée.
   *
   * Utile pour:
   * - Reconstruire des Timestamps depuis la persistence
   * - Tester avec des dates spécifiques (injection)
   * - Convertir depuis d'autres formats
   *
   * Validation:
   * - La Date doit être valide (pas isNaN)
   * - La Date est convertie en ISO pour normalisation
   *
   * @param date - Une Date quelconque
   * @returns Timestamp normalisé en UTC
   * @throws DomainError si Date invalide
   */
  static from(date: Date): Timestamp {
    if (!(date instanceof Date)) {
      throw new DomainError(
        `Timestamp.from() requires a Date instance, received: ${typeof date}`
      );
    }

    if (isNaN(date.getTime())) {
      throw new DomainError('Timestamp.from() received an invalid Date');
    }

    // Normalisation: convertir en ISO string puis réparse
    // Cela élimine les variations de timezone et assure l'UTC
    const isoString = date.toISOString();
    const normalizedDate = new Date(isoString);

    return new Timestamp(normalizedDate);
  }

  /**
   * Crée un Timestamp à partir d'une string ISO 8601.
   *
   * Format attendu: YYYY-MM-DDTHH:mm:ss.sssZ
   *
   * @param isoString - String ISO 8601
   * @returns Timestamp
   * @throws DomainError si format invalide
   */
  static fromISO(isoString: string): Timestamp {
    if (typeof isoString !== 'string') {
      throw new DomainError(
        `Timestamp.fromISO() requires a string, received: ${typeof isoString}`
      );
    }

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      throw new DomainError(
        `Timestamp.fromISO() received an invalid ISO string: "${isoString}"`
      );
    }

    return Timestamp.from(date);
  }

  /**
   * Crée un Timestamp à partir d'un timestamp Unix (ms depuis époque).
   *
   * @param millisSinceEpoch - Millisecondes depuis 1970-01-01T00:00:00Z
   * @returns Timestamp
   * @throws DomainError si invalide
   */
  static fromUnixMs(millisSinceEpoch: number): Timestamp {
    if (typeof millisSinceEpoch !== 'number' || isNaN(millisSinceEpoch)) {
      throw new DomainError(
        `Timestamp.fromUnixMs() requires a valid number, received: ${millisSinceEpoch}`
      );
    }

    const date = new Date(millisSinceEpoch);

    if (isNaN(date.getTime())) {
      throw new DomainError(
        `Timestamp.fromUnixMs() produced an invalid date from: ${millisSinceEpoch}`
      );
    }

    return Timestamp.from(date);
  }

  /**
   * Retourne la valeur Date interne (copie défensive).
   *
   * Retourne une nouvelle Date pour éviter mutation externe.
   *
   * @returns Copy de la Date interne
   */
  toDate(): Date {
    return new Date(this.date.getTime());
  }

  /**
   * Retourne la représentation ISO 8601 (UTC).
   *
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   *
   * @returns String ISO 8601
   */
  toISO(): string {
    return this.date.toISOString();
  }

  /**
   * Retourne le timestamp Unix en millisecondes.
   *
   * Millisecondes depuis 1970-01-01T00:00:00Z
   *
   * @returns Nombre de ms
   */
  toUnixMs(): number {
    return this.date.getTime();
  }

  /**
   * Compare deux Timestamps.
   *
   * @param other - Le Timestamp à comparer
   * @returns true si les dates sont identiques
   */
  equals(other: Timestamp): boolean {
    if (!other || !(other instanceof Timestamp)) {
      return false;
    }
    return this.date.getTime() === other.date.getTime();
  }

  /**
   * Vérifie si ce Timestamp est avant un autre.
   *
   * @param other - Le Timestamp à comparer
   * @returns true si this < other
   */
  isBefore(other: Timestamp): boolean {
    if (!other || !(other instanceof Timestamp)) {
      throw new DomainError('Cannot compare with non-Timestamp');
    }
    return this.date.getTime() < other.date.getTime();
  }

  /**
   * Vérifie si ce Timestamp est après un autre.
   *
   * @param other - Le Timestamp à comparer
   * @returns true si this > other
   */
  isAfter(other: Timestamp): boolean {
    if (!other || !(other instanceof Timestamp)) {
      throw new DomainError('Cannot compare with non-Timestamp');
    }
    return this.date.getTime() > other.date.getTime();
  }

  /**
   * Calcule la différence en millisecondes entre deux Timestamps.
   *
   * @param other - Le Timestamp à comparer
   * @returns Différence en ms (peut être négatif)
   */
  diffMs(other: Timestamp): number {
    if (!other || !(other instanceof Timestamp)) {
      throw new DomainError('Cannot compare with non-Timestamp');
    }
    return this.date.getTime() - other.date.getTime();
  }

  /**
   * Retourne la représentation string pour usage externe.
   *
   * Format: ISO 8601
   */
  toString(): string {
    return this.toISO();
  }

  /**
   * Sérialisation JSON (ISO 8601).
   */
  toJSON(): string {
    return this.toISO();
  }
}

/**
 * Factory function pour créer un Timestamp
 * Compatible avec l'interface attendue par src/
 */
export function createTimestamp(date?: Date): Timestamp {
  return date ? Timestamp.from(date) : Timestamp.now();
}
