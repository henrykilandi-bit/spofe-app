/**
 * 📋 USER DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité User
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 * 
 * Spécification: SILC v1.0 - Mapping pur, pas de logique métier
 * Conforme: SPOFE v2.2 + conventions camelCase
 */

/**
 * Transform User Sequelize instance to standard API DTO
 * @param {Object} user - Sequelize User instance
 * @returns {Object|null} - User DTO or null if falsy
 */
export const userDto = (user) => {
  if (!user) return null;

  return {
    // Primary Identity
    id: user.id,
    username: user.username,
    email: user.email,

    // Profile
    firstName: user.prenom || null,
    lastName: user.nom || null,
    telephone: user.telephone || null,
    siret: user.siret || null,

    // Company & Role
    companyId: user.company_id || null,
    roleId: user.role_id || null,

    // Status & Permissions
    isActive: user.is_active !== false,
    isLocked: user.is_locked || false,
    canGrantPermissions: user.can_grant_permissions || false,
    hierarchyLevel: user.hierarchy_level || 99,

    // Consultant fields (optional)
    specialities: user.specialites || null,
    hourlyRate: user.tarif_horaire || null,
    experienceYears: user.experience_years || null,

    // Timestamps (ISO-8601)
    createdAt: user.created_at ? user.created_at.toISOString() : null,
    updatedAt: user.updated_at ? user.updated_at.toISOString() : null

    // 🔒 FORBIDDEN (never expose):
    // password: user.password,              // Security: never expose
    // twoFactorSecret: user.two_factor_secret // Security: never expose
  };
};

/**
 * Transform array of Users to DTOs
 * @param {Array} users - Array of Sequelize User instances
 * @returns {Array} - Array of User DTOs
 */
export const userDtoArray = (users) => {
  return Array.isArray(users) 
    ? users.map(userDto).filter(Boolean)
    : [];
};

/**
 * Minimal User DTO (for lists, reduced data, faster transfers)
 */
export const userDtoMinimal = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    companyId: user.company_id || null,
    isActive: user.is_active !== false
  };
};

/**
 * Admin User DTO (includes additional sensitive fields for admin dashboard)
 */
export const userDtoAdmin = (user) => {
  if (!user) return null;

  const base = userDto(user);
  return {
    ...base,
    isLocked: user.is_locked || false,
    hierarchyLevel: user.hierarchy_level || 99,
    canGrantPermissions: user.can_grant_permissions || false
  };
};
