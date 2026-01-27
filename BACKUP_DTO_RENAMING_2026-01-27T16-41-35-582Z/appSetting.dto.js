/**
 * 📋 APP_SETTING DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité AppSetting
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 * 
 * Spécification: SILC v1.0 - Mapping pur, pas de logique métier
 * Conforme: SPOFE v2.2 + conventions camelCase
 */

/**
 * Transform AppSetting Sequelize instance to standard API DTO
 * @param {Object} setting - Sequelize AppSetting instance
 * @returns {Object|null} - AppSetting DTO or null if falsy
 */
export const appSettingDto = (setting) => {
  if (!setting) return null;

  return {
    id: setting.id,
    settingKey: setting.setting_key || null,
    settingValue: setting.setting_value || null,
    settingType: setting.setting_type || 'STRING',
    description: setting.description || null,
    isActive: setting.is_active !== false,
    createdAt: setting.created_at ? setting.created_at.toISOString() : null,
    updatedAt: setting.updated_at ? setting.updated_at.toISOString() : null
  };
};

/**
 * Transform array of AppSettings to DTOs
 * @param {Array} settings - Array of Sequelize AppSetting instances
 * @returns {Array} - Array of AppSetting DTOs
 */
export const appSettingDtoArray = (settings) => {
  if (!Array.isArray(settings)) return [];
  return settings.map(appSettingDto);
};

/**
 * Minimal DTO with only essential fields
 * @param {Object} setting - Sequelize AppSetting instance
 * @returns {Object|null} - Minimal AppSetting DTO or null if falsy
 */
export const appSettingDtoMinimal = (setting) => {
  if (!setting) return null;

  return {
    id: setting.id,
    settingKey: setting.setting_key,
    settingValue: setting.setting_value
  };
};

export default appSettingDto;
