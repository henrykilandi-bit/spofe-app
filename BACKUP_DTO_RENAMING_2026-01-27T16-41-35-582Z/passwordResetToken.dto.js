/**
 * 📋 PASSWORD_RESET_TOKEN DTO — SILC v1.0
 */
export const passwordResetTokenDto = (token) => {
  if (!token) return null;
  return {
    id: token.id,
    userId: token.user_id,
    resetType: token.reset_type || 'EMAIL',
    expiresAt: token.expires_at ? token.expires_at.toISOString() : null,
    usedAt: token.used_at ? token.used_at.toISOString() : null,
    isUsed: token.is_used || false,
    isValid: token.is_valid !== false,
    verificationAttempts: token.verification_attempts || 0,
    ipAddress: token.ip_address || null,
    createdAt: token.created_at ? token.created_at.toISOString() : null
  };
};

export const passwordResetTokenDtoArray = (tokens) => {
  if (!Array.isArray(tokens)) return [];
  return tokens.map(passwordResetTokenDto);
};

export const passwordResetTokenDtoMinimal = (token) => {
  if (!token) return null;
  return {
    id: token.id,
    userId: token.user_id,
    isUsed: token.is_used,
    expiresAt: token.expires_at ? token.expires_at.toISOString() : null
  };
};

export default passwordResetTokenDto;
