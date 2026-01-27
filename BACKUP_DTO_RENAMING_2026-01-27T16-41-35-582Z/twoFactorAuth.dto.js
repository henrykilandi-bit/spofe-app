/**
 * 📋 TOKEN_BLACKLIST DTO — SILC v1.0
 */
export const tokenBlacklistDto = (token) => {
  if (!token) return null;
  return {
    id: token.id,
    userId: token.user_id,
    tokenJti: token.token_jti,
    tokenType: token.token_type || 'ACCESS',
    revocationReason: token.revocation_reason || 'LOGOUT',
    expiresAt: token.expires_at ? token.expires_at.toISOString() : null,
    revokedAt: token.revoked_at ? token.revoked_at.toISOString() : null,
    ipAddress: token.ip_address || null,
    userAgent: token.user_agent || null,
    createdAt: token.created_at ? token.created_at.toISOString() : null
  };
};

export const tokenBlacklistDtoArray = (tokens) => {
  if (!Array.isArray(tokens)) return [];
  return tokens.map(tokenBlacklistDto);
};

export const tokenBlacklistDtoMinimal = (token) => {
  if (!token) return null;
  return {
    id: token.id,
    userId: token.user_id,
    tokenType: token.token_type,
    revokedAt: token.revoked_at ? token.revoked_at.toISOString() : null
  };
};

export default tokenBlacklistDto;
