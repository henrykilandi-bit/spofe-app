/**
 * 📋 TWO_FACTOR_AUTH DTO — SILC v1.0
 */
export const twoFactorAuthDto = (auth) => {
  if (!auth) return null;
  return {
    id: auth.id,
    userId: auth.user_id,
    isVerified: auth.is_verified || false,
    isActive: auth.is_active || false,
    enabledAt: auth.enabled_at ? auth.enabled_at.toISOString() : null,
    lastUsedAt: auth.last_used_at ? auth.last_used_at.toISOString() : null,
    backupCodesCount: auth.backup_codes ? (auth.backup_codes.length || 0) : 0,
    createdAt: auth.created_at ? auth.created_at.toISOString() : null,
    updatedAt: auth.updated_at ? auth.updated_at.toISOString() : null
  };
};

export const twoFactorAuthDtoArray = (auths) => {
  if (!Array.isArray(auths)) return [];
  return auths.map(twoFactorAuthDto);
};

export const twoFactorAuthDtoMinimal = (auth) => {
  if (!auth) return null;
  return {
    id: auth.id,
    userId: auth.user_id,
    isVerified: auth.is_verified,
    isActive: auth.is_active
  };
};

export default twoFactorAuthDto;
