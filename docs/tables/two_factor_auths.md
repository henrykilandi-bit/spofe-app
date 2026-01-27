# Table: `two_factor_auths`

**Domaine**: 🇬🇧 Identité & Sécurité | **Criticité**: 🔴 HAUTE

## 🎯 Rôle Métier
TOTP 2FA (Time-based One-Time Password). Secrets chiffrés, backup codes.

## 📋 Structure
```sql
CREATE TABLE two_factor_auths (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  user_id             INT NOT NULL UNIQUE,
  secret_key          VARCHAR(255) NOT NULL,
  backup_codes        JSON,
  is_enabled          BOOLEAN DEFAULT FALSE,
  enabled_at          TIMESTAMP NULL,
  backup_codes_generated_at TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP NULL,
  
  CONSTRAINT fk_two_factor_auths_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_two_factor_auths_user (user_id)
);

ALTER TABLE two_factor_auths CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Secret: Chiffré (ChaCha20 ou AES-256)
- ✅ Backup codes: 8 codes single-use
- ✅ TOTP: 30s window, 6-digit codes
- ✅ 1 par user: UNIQUE user_id

## 📊 Hooks

```javascript
TwoFactorAuth.beforeCreate(async (auth) => {
  // Générer secret (base32)
  const secret = speakeasy.generateSecret({
    name: `SPOFE (${auth.user.email})`,
    length: 32
  });
  
  auth.secretKey = await encrypt(secret.base32);
  
  // Générer 8 backup codes
  auth.backupCodes = Array.from({length: 8}, () => 
    generateCode(8)
  );
});
```

---

**Status**: ⏳ Model à créer (Phase 2) | **Last Updated**: 25 Janvier 2026
