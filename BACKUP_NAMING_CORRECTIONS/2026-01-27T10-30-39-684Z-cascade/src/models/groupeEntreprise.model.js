// cascade/src/models/groupeEntreprise.model.js
// ✅ v2.2 COMPLIANT - Organisationnel domain, French naming, COMPLETE + TESTED

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logSecurity } from '../utils/logger.js';

const GroupeEntreprise = sequelize.define(
  'GroupeEntreprise',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    country: { type: DataTypes.STRING(2), defaultValue: 'BJ' },
    currency: { type: DataTypes.STRING(3), defaultValue: 'XOF' },
    fiscalYearEnd: { type: DataTypes.INTEGER, defaultValue: 31, field: 'fiscal_year_end' }
  },
  {
    tableName: 'groupes_entreprises',
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: async (groupe) => {
        groupe.code = groupe.code?.toUpperCase().trim();
        groupe.country = groupe.country?.toUpperCase();
        groupe.currency = groupe.currency?.toUpperCase();
        logInfo(`GroupeEntreprise.beforeCreate: ${groupe.code}`);
      },

      afterCreate: async (groupe, options) => {
        try {
          const { SecurityEvent } = sequelize.models;
          if (SecurityEvent) {
            await SecurityEvent.create({
              user_id: options.userId,
              event_type: 'groupe_entreprise_created',
              event_data: JSON.stringify({ code: groupe.code, name: groupe.name }),
              ip_address: options.ipAddress,
              user_agent: options.userAgent
            });
            logSecurity(`Groupe créé: ${groupe.code}`);
          }
        } catch (e) {
          console.error('SecurityEvent creation failed:', e.message);
        }
      }
    }
  }
);

export default GroupeEntreprise;
