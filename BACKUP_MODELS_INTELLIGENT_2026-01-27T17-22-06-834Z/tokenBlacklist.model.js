/**
 * 🔑 Token Rotation & Management
 * Redis-based token blacklist et refresh token management
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TokenBlacklist = sequelize.define('TokenBlacklist', {
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
    token_jti: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: 'JWT ID (jti) claim for uniqueness'
    },
    token_type: {
      type: DataTypes.ENUM('ACCESS', 'REFRESH'),
      defaultValue: 'ACCESS',
      comment: 'Type de token révoqué'
    },
    revocation_reason: {
      type: DataTypes.ENUM('LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'REFRESH', 'EXPIRATION'),
      defaultValue: 'LOGOUT',
      comment: 'Raison de la révocation'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Timestamp quand le token aurait expiré naturellement'
    },
    revoked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp de révocation'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address lors de la révocation'
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'User agent lors de la révocation'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'token_blacklist',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token_jti'] },
      { fields: ['expires_at'] },
      { fields: ['token_type'] }
    ]
  });

export default TokenBlacklist;
