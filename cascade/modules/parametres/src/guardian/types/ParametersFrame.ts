import { IdentityContext } from './IdentityContext.js';
import { FiscalContext } from './FiscalContext.js';
import { MonetaryContext } from './MonetaryContext.js';
import { NormativeContext } from './NormativeContext.js';
import { StatesCatalog } from './StatesCatalog.js';
import { RolesCatalog } from './RolesCatalog.js';
import { DocumentsCatalog } from './DocumentsCatalog.js';

/**
 * 🧱 ParametersFrame - Agrégat Racine du Module Paramètres
 * 
 * C'est l'unité de vérité du module.
 * Tout est inclus dans un cadre versionné unique.
 * Aucune mutation partielle n'est autorisée.
 */

export type FrameStatus = 'ACTIVE' | 'DEPRECATED';

export interface ParametersFrame {
  /** Identifiant unique du cadre */
  frameId: string;
  
  /** Version du cadre (ex: v1.0.0) */
  version: string;
  
  /** Statut du cadre */
  status: FrameStatus;
  
  /** Date d'entrée en vigueur */
  effectiveFrom: string;
  
  /** Contexte d'identité de l'entité */
  identityContext: IdentityContext;
  
  /** Contexte fiscal et périodes */
  fiscalContext: FiscalContext;
  
  /** Contexte monétaire et taxes */
  monetaryContext: MonetaryContext;
  
  /** Contexte normatif et comptable */
  normativeContext: NormativeContext;
  
  /** Catalogue des états et statuts */
  statesCatalog: StatesCatalog;
  
  /** Catalogue des rôles et capacités */
  rolesCatalog: RolesCatalog;
  
  /** Catalogue des types de documents */
  documentsCatalog: DocumentsCatalog;
}
