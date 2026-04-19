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

// API - Couche d'exposition READ-ONLY
export * from './api/index.js';

// Guardian - Constitution métier
export * from './guardian/index.js';

// Read Models - Modèles de consultation
export * from './read-models/index.js';

// Shared - Éléments communs
export * from './shared/errors.js';
export * from './shared/identifiers.js';

// Module metadata
export const PARAMETRES_MODULE = {
  name: 'parametres',
  version: '1.0.0',
  governance: 'SPOFE P0 - Constitutional',
  type: 'Socle normatif transverse',
  mode: 'READ_ONLY_PROVIDER',
  status: 'READY_FOR_CERTIFICATION'
} as const;