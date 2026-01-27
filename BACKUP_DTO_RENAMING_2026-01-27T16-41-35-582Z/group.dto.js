/**
 * 📋 GROUP DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité GroupeEntreprise
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 * 
 * Spécification: SILC v1.0 - Mapping pur, pas de logique métier
 * Conforme: SPOFE v2.2 + conventions camelCase
 */

/**
 * Transform GroupeEntreprise Sequelize instance to standard API DTO
 * @param {Object} group - Sequelize GroupeEntreprise instance
 * @returns {Object|null} - Group DTO or null if falsy
 */
export const groupDto = (group) => {
  if (!group) return null;

  return {
    // Identity
    id: group.id,
    code: group.code || null,
    name: group.name || group.nom || null,

    // Details
    description: group.description || null,

    // Location & Currency
    country: group.country || group.pays || 'BJ',
    currency: group.currency || group.devise || 'XOF',

    // Fiscal Configuration
    fiscalYearEnd: group.fiscal_year_end || 31,

    // Timestamps (ISO-8601)
    createdAt: group.created_at ? group.created_at.toISOString() : null,
    updatedAt: group.updated_at ? group.updated_at.toISOString() : null
  };
};

/**
 * Transform array of Groups to DTOs
 * @param {Array} groups - Array of Sequelize GroupeEntreprise instances
 * @returns {Array} - Array of Group DTOs
 */
export const groupDtoArray = (groups) => {
  return Array.isArray(groups)
    ? groups.map(groupDto).filter(Boolean)
    : [];
};

/**
 * Minimal Group DTO (for dropdowns)
 */
export const groupDtoMinimal = (group) => {
  if (!group) return null;

  return {
    id: group.id,
    code: group.code,
    name: group.name || group.nom
  };
};
