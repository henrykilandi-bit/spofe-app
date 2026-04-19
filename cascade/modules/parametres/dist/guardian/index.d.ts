/**
 * Guardian - Module Paramètres
 *
 * Constitution métier et invariants P0
 * Ces règles sont non négociables et vérifiées automatiquement.
 */
/**
 * 📋 Guardian - Point d'Entrée
 */
export { ParametersGuardian } from './ParametersGuardian.js';
export * from './types/index.js';
export * from './invariants/index.js';
/**
 * G01 - Passivité absolue
 * Le module ne déclenche aucun effet, calcul ou action
 */
export declare function validatePassivity(): boolean;
/**
 * G02 - Déclaratif uniquement
 * Toutes les données sont déclaratives, non dérivées
 */
export declare function validateDeclarativeOnly(): boolean;
/**
 * G04 - Read-only inter-modules
 * Aucune écriture externe autorisée
 */
export declare function validateReadOnlyAccess(): boolean;
/**
 * G05 - Append-only
 * Historisation totale, aucune modification destructive
 */
export declare function validateAppendOnly(): boolean;
/**
 * Guardian principal - Exécute tous les invariants
 */
export declare function validateParametresGuardian(): {
    valid: boolean;
    violations: string[];
};
//# sourceMappingURL=index.d.ts.map