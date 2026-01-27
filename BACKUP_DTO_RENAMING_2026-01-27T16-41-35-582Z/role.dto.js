/**
 * 📋 ROLE DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité Role
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 * 
 * Spécification: SILC v1.0 - Mapping pur, pas de logique métier
 * Conforme: SPOFE v2.2 + conventions camelCase
 */

/**
 * Transform Role Sequelize instance to standard API DTO
 * @param {Object} role - Sequelize Role instance
 * @returns {Object|null} - Role DTO or null if falsy
 */
export const roleDto = (role) => {
  if (!role) return null;

  return {
    // Identity
    id: role.id,
    name: role.nom || null,

    // Details
    description: role.description || null,
    permissions: role.permissions || {},
    isSystem: role.is_system || false,

    // Timestamps (ISO-8601)
    createdAt: role.created_at ? role.created_at.toISOString() : null,
    updatedAt: role.updated_at ? role.updated_at.toISOString() : null
  };
};

/**
 * Transform array of Roles to DTOs
 * @param {Array} roles - Array of Sequelize Role instances
 * @returns {Array} - Array of Role DTOs
 */
export const roleDtoArray = (roles) => {
  return Array.isArray(roles)
    ? roles.map(roleDto).filter(Boolean)
    : [];
};

/**
 * Minimal Role DTO (for dropdowns)
 */
export const roleDtoMinimal = (role) => {
  if (!role) return null;

  return {
    id: role.id,
    name: role.nom
  };
};
