/**
 * 🔧 Shared - Identifiers
 * 
 * Types et validateurs pour les identifiants du module comptabilité.
 */

export type PeriodId = string;
export type EntryId = string;
export type JournalCode = string;
export type AccountCode = string;
export type TierId = string;
export type DocumentRef = string;

/**
 * Valide le format d'un ID de période
 */
export function isValidPeriodId(id: string): boolean {
  // Format attendu: PERIOD_YYYY_MM
  const pattern = /^PERIOD_\d{4}_\d{2}$/;
  return pattern.test(id);
}

/**
 * Valide le format d'un ID d'écriture
 */
export function isValidEntryId(id: string): boolean {
  // Format attendu: ENTRY_YYYYMMDD_XXX
  const pattern = /^ENTRY_\d{8}_\d{3}$/;
  return pattern.test(id);
}

/**
 * Valide le format d'un code de journal
 */
export function isValidJournalCode(code: string): boolean {
  // Format attendu: 3-10 lettres majuscules
  const pattern = /^[A-Z]{3,10}$/;
  return pattern.test(code);
}

/**
 * Valide le format d'un code de compte
 */
export function isValidAccountCode(code: string): boolean {
  // Format attendu: 6 chiffres minimum
  const pattern = /^\d{6,}$/;
  return pattern.test(code);
}

/**
 * Valide le format d'un ID de tiers
 */
export function isValidTierId(id: string): boolean {
  // Format attendu: TIER_TYPE_XXX
  const pattern = /^TIER_[A-Z]+_\d{3}$/;
  return pattern.test(id);
}
