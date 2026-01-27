/**
 * 📋 COMPANY DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité Compagnie
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 * 
 * Spécification: SILC v1.0 - Mapping pur, pas de logique métier
 * Conforme: SPOFE v2.2 + conventions camelCase
 */

/**
 * Transform Company Sequelize instance to standard API DTO
 * @param {Object} company - Sequelize Company instance
 * @returns {Object|null} - Company DTO or null if falsy
 */
export const companyDto = (company) => {
  if (!company) return null;

  return {
    // Identity
    id: company.id,
    groupId: company.groupe_id || null,
    code: company.code || null,
    name: company.nom || null,
    abbreviation: company.sigle || null,

    // Company Info
    registryNumber: company.numero_registre_commerce || null,
    address: company.adresse || null,
    telephone: company.telephone || null,
    email: company.email || null,

    // Location & Currency
    country: company.country || 'BJ',
    currency: company.devise || 'XOF',

    // Status
    isActive: company.is_active !== false,

    // Timestamps (ISO-8601)
    createdAt: company.created_at ? company.created_at.toISOString() : null,
    updatedAt: company.updated_at ? company.updated_at.toISOString() : null
  };
};

/**
 * Transform array of Companies to DTOs
 * @param {Array} companies - Array of Sequelize Company instances
 * @returns {Array} - Array of Company DTOs
 */
export const companyDtoArray = (companies) => {
  return Array.isArray(companies)
    ? companies.map(companyDto).filter(Boolean)
    : [];
};

/**
 * Minimal Company DTO (for dropdowns, reduced data)
 */
export const companyDtoMinimal = (company) => {
  if (!company) return null;

  return {
    id: company.id,
    code: company.code,
    name: company.nom,
    isActive: company.is_active !== false
  };
};
