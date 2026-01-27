import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: 'Hashed reset token'
    },
    token_plain: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Token en plaintext (pour comparaison, jamais stocker en prod)'
    },
    reset_type: {
      type: DataTypes.ENUM('EMAIL', 'SMS', 'SECURITY_QUESTION'),
      defaultValue: 'EMAIL',
      comment: 'Méthode de reset (email par défaut)'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Expiration du token (typiquement 10 min)'
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp du reset effectué'
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag si token déjà utilisé'
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Peut être invalidé manuellement'
    },
    verification_code: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: '6-digit OTP verification code'
    },
    verification_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Count of failed verification attempts'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address of request'
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'User agent of request'
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
  }, {
    tableName: 'password_reset_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token'] },
      { fields: ['expires_at'] },
      { fields: ['is_used'] },
      { fields: ['created_at'] }
    ]
  });

export default PasswordResetToken;
