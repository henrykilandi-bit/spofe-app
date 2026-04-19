/**
 * 🏢 IdentityContext - Identité & Contexte de l'Entité
 * 
 * Valeurs atomiques, aucune dérivation.
 */

export interface IdentityContext {
  /** Raison sociale */
  legalName: string;
  
  /** Forme juridique */
  legalForm: string;
  
  /** Code pays (ISO) */
  countryCode: string;
  
  /** Devise par défaut (ISO) */
  defaultCurrency: string;
  
  /** Fuseau horaire */
  timezone: string;
  
  /** Langue par défaut */
  defaultLanguage: string;
}
