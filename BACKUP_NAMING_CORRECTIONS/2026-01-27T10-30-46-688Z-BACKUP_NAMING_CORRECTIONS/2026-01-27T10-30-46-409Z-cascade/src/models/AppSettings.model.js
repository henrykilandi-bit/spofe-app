// src/models/appSettings.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const AppSettings = sequelize.define(
  'AppSettings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    valeur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scope: {
      type: DataTypes.ENUM('GLOBAL', 'ENTREPRISE'),
      allowNull: false,
      defaultValue: 'GLOBAL',
      validate: {
        isIn: [['GLOBAL', 'ENTREPRISE']]
      }
    },
    groupe_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'groupes_entreprises',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type_valeur: {
      type: DataTypes.ENUM('STRING', 'INTEGER', 'BOOLEAN', 'JSON'),
      defaultValue: 'STRING'
    },
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'app_settings',
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: async (setting, options) => {
        try {
          // 1️⃣ KEY NORMALIZATION
          setting.cle = setting.cle.trim().toUpperCase();
          if (setting.description) setting.description = setting.description.trim();

          // 2️⃣ VALUE TYPE VALIDATION & CONVERSION
          if (setting.valeur && setting.type_valeur) {
            try {
              if (setting.type_valeur === 'BOOLEAN') {
                setting.valeur = String(setting.valeur).toLowerCase() === 'true' ? 'true' : 'false';
              } else if (setting.type_valeur === 'INTEGER') {
                const intVal = parseInt(setting.valeur, 10);
                if (isNaN(intVal)) throw new Error('Invalid integer value');
                setting.valeur = String(intVal);
              } else if (setting.type_valeur === 'JSON') {
                JSON.parse(setting.valeur); // Validate JSON
              }
              // STRING: no conversion needed
            } catch (error) {
              throw new Error(`Invalid value for type ${setting.type_valeur}: ${error.message}`);
            }
          }

          // 3️⃣ SCOPE VALIDATION
          if (setting.scope === 'ENTREPRISE' && !setting.groupe_id) {
            throw new Error('groupe_id required for ENTREPRISE scope');
          }

          logInfo(`AppSettings.beforeCreate: Setting ${setting.cle} prepared`);
          if (setting.is_sensitive) {
            logSecurity(`Sensitive setting modified: ${setting.cle}`);
          }
        } catch (error) {
          logError(`AppSettings.beforeCreate error: ${error.message}`);
          throw error;
        }
      },

      beforeUpdate: async (setting, options) => {
        try {
          // 1️⃣ KEY IMMUTABILITY
          if (setting.changed('cle')) {
            throw new Error('Cannot change setting key');
          }

          // 2️⃣ VALUE TYPE VALIDATION (if changed)
          if (setting.changed('valeur') && setting.valeur && setting.type_valeur) {
            try {
              if (setting.type_valeur === 'BOOLEAN') {
                setting.valeur = String(setting.valeur).toLowerCase() === 'true' ? 'true' : 'false';
              } else if (setting.type_valeur === 'INTEGER') {
                const intVal = parseInt(setting.valeur, 10);
                if (isNaN(intVal)) throw new Error('Invalid integer value');
                setting.valeur = String(intVal);
              } else if (setting.type_valeur === 'JSON') {
                JSON.parse(setting.valeur);
              }
            } catch (error) {
              throw new Error(`Invalid value for type ${setting.type_valeur}`);
            }
          }

          // 3️⃣ SENSITIVE SETTING LOGGING
          if (setting.changed('valeur') && setting.is_sensitive) {
            logSecurity(`Sensitive setting updated: ${setting.cle}`);
          }

          logInfo(`AppSettings.beforeUpdate: Setting ${setting.cle} prepared for update`);
        } catch (error) {
          logError(`AppSettings.beforeUpdate error: ${error.message}`);
          throw error;
        }
      }
    }
  }
);

export default AppSettings;
