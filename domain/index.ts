/**
 * 📦 Domain Layer - Export canonique
 *
 * Ce fichier exporte le langage métier complet et officiel de SPOFE.
 *
 * Ce qui est ici = ce qui est dans la langue de l'entreprise
 * Ce qui n'est pas ici = implémentation technique (DB, HTTP, Guardian, etc)
 *
 * Propriétés garanties par ce Domain:
 * ✅ Immutabilité (readonly partout)
 * ✅ Type-safety fort (pas de string brut)
 * ✅ Langage métier stable (signature sémantique)
 * ✅ Testabilité (zéro dépendances)
 * ✅ Zéro I/O (pure functions)
 * ✅ Zéro dépendances infrastructure (DB, HTTP, Guardian, etc)
 * ✅ Extensibilité légale (contrats de version majeure)
 */

// =============================================================================
// VALUE OBJECTS - Fondation du langage métier
// =============================================================================

export { DomainError } from './value-objects/DomainError';

/**
 * AggregateId - Identité unique d'un agrégat SPOFE
 *
 * UUID v4 valide et normalisé.
 * Immuable, comparable par valeur.
 */
export { AggregateId } from './value-objects/AggregateId';

/**
 * ActorRole - Les 3 rôles reconnus dans SPOFE
 *
 * - SYSTEM: Services internes
 * - ADMIN: Administration
 * - USER: Utilisateurs métier
 *
 * Énumération fermée, type-safe.
 */
export { ActorRole } from './value-objects/ActorRole';
export type { ActorRoleType } from './value-objects/ActorRole';

/**
 * Timestamp - Instant immuable en UTC
 *
 * Toujours en UTC, jamais de timezone locale.
 * Comparable, sérialisable ISO 8601.
 */
export { Timestamp, createTimestamp } from './value-objects/Timestamp';

// =============================================================================
// DOMAIN EVENTS - Ce qui s'est produit (passé, immutable)
// =============================================================================

/**
 * AggregateCreated - Événement: un agrégat a été créé
 *
 * Émis quand une nouvelle AggregateId commence à exister.
 * Utilisé pour event sourcing et auditing.
 */
export { AggregateCreated } from './events/AggregateCreated';

/**
 * AggregateUpdated - Événement: un agrégat a été mis à jour
 *
 * Émis quand un agrégat existant reçoit des mises à jour.
 * Append-only: capture le nouvel état sans mutation.
 */
export { AggregateUpdated } from './events/AggregateUpdated';

/**
 * AggregateClosed - Événement: un agrégat a été fermé
 *
 * Émis quand un agrégat atteint la fin de son cycle de vie.
 * Signal terminal: aucune modification ultérieure autorisée.
 * Guardian refuse tout UPDATE après ce fait.
 */
export { AggregateClosed } from './events/AggregateClosed';

// =============================================================================
// DOMAIN FACTS - Ce qui est vrai (présent, peut être révoqué)
// =============================================================================

/**
 * AggregateExists - Fait: un agrégat existe
 *
 * Affirme qu'une AggregateId est valide et accessible.
 * Peut être révoqué (création d'un AggregateNotExists implicite).
 */
export { AggregateExists } from './facts/AggregateExists';

/**
 * AggregateSnapshot - Snapshot d'état d'un agrégat
 *
 * Capture l'état complet à un instant donné.
 * Générique sur le type de données.
 * Utilisé pour optimisation (event sourcing partial).
 */
export { AggregateSnapshot } from './facts/AggregateSnapshot';

/**
 * AggregateClosed - Fait: un agrégat est fermé (terminal)
 *
 * Affirme qu'une AggregateId a atteint la fin de son cycle.
 * Terminal: pas de révocation possible.
 * Signal pour Guardian (bloque UPDATE_AGGREGATE).
 * Signal pour read-models (affiche "fermé").
 */
export { AggregateClosed as AggregateClosedFact } from './facts/AggregateClosed';

// =============================================================================
// NOTES ARCHITECTURALES
// =============================================================================

/**
 * Division des responsabilités:
 *
 * DOMAIN (ici)
 * └─ Langage métier pur, immuable, type-safe
 *    - Pas de validation d'invariants globaux (=> Guardian)
 *    - Pas de logique décisionnelle (=> Guardian)
 *    - Pas de persistence (=> Infrastructure)
 *    - Pas de dépendances (=> pure TypeScript)
 *
 * GUARDIAN (cf. src/guardian/)
 * └─ Validator & decision maker
 *    - Vérifie les invariants globaux (SILC)
 *    - Valide les transitions (contracts)
 *    - Émet des violations (codes G4-*)
 *    - Utilise le Domain pour typage/context
 *
 * APPLICATION (cf. src/)
 * └─ Orchestration
 *    - Appelle Guardian pour validation
 *    - Persiste via DB/ORM
 *    - Expose via HTTP
 *    - Utilise Domain pour logique métier
 *
 * Invariant: Domain ne connaît rien d'autre que lui-même.
 */
