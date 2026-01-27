// cascade/src/models/twoFactorAuth.model.js
// ✅ v2.2 COMPLIANT - Identité domain, TOTP 2FA (Time-based One-Time Password)

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logSecurity } from '../utils/logger.js';

const TwoFactorAuth = sequelize.define(
  'TwoFactorAuth',
  {
    id: { 
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true 
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    secret: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Base32 encoded secret for TOTP'
    },
    backup_codes: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of 8 one-time backup codes (hashed)'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag confirming TOTP was successfully tested'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    enabled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when 2FA was enabled'
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last successful TOTP verification'
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Count of failed TOTP verifications'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  },
  {
    tableName: 'two_factor_auth',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['is_active'] },
      { fields: ['created_at'] }
    ],
    hooks: {
      beforeCreate: async (auth) => {
        logInfo(`TwoFactorAuth.beforeCreate for user: ${auth.user_id}`);
      },

      afterCreate: async (auth, options) => {
        try {
          const { SecurityEvent } = sequelize.models;
          if (SecurityEvent) {
            await SecurityEvent.create({
              user_id: auth.user_id,
              event_type: '2fa_setup_initiated',
              event_data: JSON.stringify({ isEnabled: auth.is_verified }),
              ip_address: options.ipAddress,
              user_agent: options.userAgent
            });
            logSecurity(`2FA setup initiated for user ${auth.user_id}`);
          }
        } catch (e) {
          console.error('SecurityEvent creation failed:', e.message);
        }
      },

      afterUpdate: async (auth, options) => {
        if (auth.changed('is_active')) {
          try {
            const { SecurityEvent } = sequelize.models;
            if (SecurityEvent) {
              await SecurityEvent.create({
                user_id: auth.user_id,
                event_type: auth.is_active ? '2fa_enabled' : '2fa_disabled',
                event_data: JSON.stringify({ isActive: auth.is_active, enabledAt: auth.enabled_at }),
                ip_address: options.ipAddress,
                user_agent: options.userAgent
              });
              logSecurity(`2FA ${auth.is_active ? 'enabled' : 'disabled'} for user ${auth.user_id}`);
            }
          } catch (e) {
            console.error('SecurityEvent creation failed:', e.message);
          }
        }
      }
    }
  }
);

export default TwoFactorAuth;
