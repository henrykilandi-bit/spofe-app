/**
 * 📋 Module Paramètres - Point d'Entrée Principal
 *
 * Module constitutionnel SPOFE fournissant les cadres normatifs
 * pour tous les autres modules métier.
 *
 * Version : 1.0.0
 * Gouvernance : SPOFE P0 - Constitutional
 * Type : Socle normatif transverse
 * Mode : READ_ONLY_PROVIDER
 */
export * from './api/index.js';
export * from './guardian/index.js';
export * from './read-models/index.js';
export * from './shared/errors.js';
export * from './shared/identifiers.js';
export declare const PARAMETRES_MODULE: {
    readonly name: "parametres";
    readonly version: "1.0.0";
    readonly governance: "SPOFE P0 - Constitutional";
    readonly type: "Socle normatif transverse";
    readonly mode: "READ_ONLY_PROVIDER";
    readonly status: "READY_FOR_CERTIFICATION";
};
//# sourceMappingURL=index.d.ts.map