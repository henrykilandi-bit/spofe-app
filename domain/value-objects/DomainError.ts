/**
 * 🔐 DomainError - Fondation du langage métier SPOFE
 *
 * Représente une violation des règles métier du Domain.
 * - Pas de codes d'erreur (langage clair)
 * - Pas de HTTP status codes (Domain ne connaît pas HTTP)
 * - Pas de Guardian codes (Guardian s'appuiera dessus, pas l'inverse)
 *
 * Propriétés garanties:
 * ✅ Pure TypeScript
 * ✅ Immutable
 * ✅ Sérialisable
 * ✅ Stack trace complète
 */

export class DomainError extends Error {
  readonly name = 'DomainError';

  constructor(message: string) {
    super(message);

    // Maintenir la chaîne de prototypes pour instanceof
    Object.setPrototypeOf(this, DomainError.prototype);

    // Capturer la pile d'appel si disponible
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Sérialisation pour logging/transport
   */
  toJSON(): {
    name: string;
    message: string;
  } {
    return {
      name: this.name,
      message: this.message,
    };
  }
}
