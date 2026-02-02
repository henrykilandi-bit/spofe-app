/**
 * 👥 ActorRole - Énumération métier fermée des rôles
 *
 * Les 3 seuls rôles reconnus dans SPOFE:
 * - SYSTEM: Acteur système (Services internes)
 * - ADMIN: Acteur administrateur (Gestion)
 * - USER: Acteur utilisateur (Opérations métier)
 *
 * Propriétés garanties:
 * ✅ Énumération fermée
 * ✅ Type-safe (pas de string brut)
 * ✅ Immutable après création
 * ✅ Comparable par valeur
 * ✅ Extensible uniquement par changement de version majeure
 */

import { DomainError } from './DomainError';

/**
 * Type littéral qui énumère les rôles valides.
 * - Utilisé à la fois pour validation et typage.
 */
export type ActorRoleType = 'SYSTEM' | 'ADMIN' | 'USER';

/**
 * Ensemble des valeurs valides.
 * Source de vérité pour les rôles reconnus.
 */
const VALID_ROLES: Set<ActorRoleType> = new Set([
  'SYSTEM',
  'ADMIN',
  'USER',
]);

export class ActorRole {
  private constructor(public readonly value: ActorRoleType) {
    // Immutable après construction
    Object.freeze(this);
  }

  /**
   * Crée une nouvelle ActorRole après validation.
   *
   * Règles:
   * - La valeur doit être dans VALID_ROLES
   * - Sensible à la casse (SYSTEM, non system)
   *
   * @param value - La valeur candidate
   * @returns ActorRole valide
   * @throws DomainError si validation échoue
   */
  static create(value: string | unknown): ActorRole {
    if (typeof value !== 'string') {
      throw new DomainError(
        `ActorRole must be a string, received: ${typeof value}`
      );
    }

    const trimmed = value.trim();

    if (!VALID_ROLES.has(trimmed as ActorRoleType)) {
      throw new DomainError(
        `Invalid ActorRole: "${value}". Valid roles are: ${Array.from(VALID_ROLES).join(', ')}`
      );
    }

    return new ActorRole(trimmed as ActorRoleType);
  }

  /**
   * Vérifie si un rôle donné est valide.
   *
   * Utile pour validation déclarative avant appel à create().
   *
   * @param value - La valeur à vérifier
   * @returns true si la valeur est un rôle valide
   */
  static isValid(value: string | unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return VALID_ROLES.has(value.trim() as ActorRoleType);
  }

  /**
   * Obtient la liste de tous les rôles valides.
   *
   * Utile pour énumération ou UI.
   *
   * @returns Array des rôles valides
   */
  static all(): ActorRole[] {
    return Array.from(VALID_ROLES).map((role) => new ActorRole(role));
  }

  /**
   * Compare deux ActorRole par valeur.
   *
   * @param other - L'ActorRole à comparer
   * @returns true si les valeurs sont identiques
   */
  equals(other: ActorRole): boolean {
    if (!other || !(other instanceof ActorRole)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Vérifie si ce rôle est un rôle système.
   *
   * @returns true si this === SYSTEM
   */
  isSystem(): boolean {
    return this.value === 'SYSTEM';
  }

  /**
   * Vérifie si ce rôle est un rôle administrateur.
   *
   * @returns true si this === ADMIN
   */
  isAdmin(): boolean {
    return this.value === 'ADMIN';
  }

  /**
   * Vérifie si ce rôle est un rôle utilisateur.
   *
   * @returns true si this === USER
   */
  isUser(): boolean {
    return this.value === 'USER';
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
  toJSON(): ActorRoleType {
    return this.value;
  }
}
