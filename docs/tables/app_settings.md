# Table: `app_settings` → `app_settings` (rename)

**Domaine**: 🇫🇷 Organisationnel | **Criticité**: 🟡 MOYEN

## 🎯 Rôle Métier
Paramètres de configuration de l'application (clé-valeur). Settingsglobaux et par groupe.

## 📋 Structure
```sql
CREATE TABLE app_settings (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  groupe_entreprise_id INT,
  setting_key         VARCHAR(255) NOT NULL,
  setting_value       TEXT,
  setting_type        ENUM('STRING','NUMBER','BOOLEAN','JSON') DEFAULT 'STRING',
  description         VARCHAR(255),
  is_system           BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP NULL,
  
  CONSTRAINT fk_app_settings_groupe 
    FOREIGN KEY (groupe_entreprise_id) REFERENCES groupes_entreprises(id),
  
  UNIQUE INDEX uq_app_settings_key_groupe (setting_key, groupe_entreprise_id, deleted_at),
  INDEX idx_app_settings_groupe (groupe_entreprise_id)
);

ALTER TABLE app_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Key unique par groupe (NULL groupe = global)
- ✅ Type: STRING, NUMBER, BOOLEAN, JSON
- ✅ System settings: Non-modifiables

## 📊 Hooks

```javascript
AppSettings.beforeUpdate(async (setting) => {
  if (setting.isSystem) {
    throw new Error('Cannot modify system settings');
  }
});
```

**Note**: Renommé de `appSetting` → `appSettings` (Phase 2)

---

**Status**: ⏳ À renommer | **Last Updated**: 25 Janvier 2026
