# Table: `password_reset_tokens`

**Domaine**: 🇬🇧 Identité & Sécurité | **Criticité**: 🔴 HAUTE

## 🎯 Rôle Métier
Tokens de réinitialisation password (single-use, 1h expiry). Sécurité: Hashés en BD.

## 📋 Structure
```sql
CREATE TABLE password_reset_tokens (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,
  token           VARCHAR(255) NOT NULL UNIQUE,
  token_hash      VARCHAR(255) NOT NULL,
  is_used         BOOLEAN DEFAULT FALSE,
  used_at         TIMESTAMP NULL,
  expires_at      TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  
  CONSTRAINT fk_password_reset_tokens_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_password_reset_tokens_user (user_id),
  INDEX idx_password_reset_tokens_token_hash (token_hash),
  INDEX idx_password_reset_tokens_expires_at (expires_at)
);

ALTER TABLE password_reset_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Single-use: is_used devient TRUE après utilisation
- ✅ Expiry: 1 heure (expires_at)
- ✅ Token: Hashé en BD (JAMAIS plain text)
- ✅ Cascade delete: Token supprimé si user supprimé

## 📊 Hooks

```javascript
PasswordResetToken.beforeCreate(async (token) => {
  // Hasher le token
  token.tokenHash = await bcrypt.hash(token.token, 10);
  token.expiresAt = new Date(Date.now() + 3600000); // 1h
});

PasswordResetToken.beforeUpdate(async (token) => {
  if (token.isUsed) {
    token.usedAt = new Date();
  }
});
```

---

**Status**: ⏳ Model à créer (Phase 2) | **Last Updated**: 25 Janvier 2026
