/**
 * Modèle: BusinessOperationAudit
 * 
 * Traçabilité complète des actions sur les opérations métier
 * 
 * Conformité OHADA Article 18:
 * - Toute modification est tracée
 * - Aucune suppression d'historique
 * - Identification de l'auteur obligatoire
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BusinessOperationAudit = sequelize.define('BusinessOperationAudit', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },

  businessOperationId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'business_operation_id',
    references: {
      model: 'business_operations',
      key: 'id'
    }
  },

  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'SUBMIT', 'VALIDATE', 'REJECT', 'DELETE'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['CREATE', 'UPDATE', 'SUBMIT', 'VALIDATE', 'REJECT', 'DELETE']],
        msg: 'Action invalide'
      }
    }
  },

  performedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'performed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  oldValues: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'old_values'
  },

  newValues: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'new_values'
  },

  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },

  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'user_agent'
  },

  performedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'performed_at'
  }
}, {
  tableName: 'business_operation_audits',
  timestamps: false, // On utilise performedAt au lieu de timestamps classiques
  underscored: true
});

/**
 * Méthodes statiques
 */
BusinessOperationAudit.logAction = async function(businessOperationId, action, performedBy, options = {}) {
  const { comment, oldValues, newValues, ipAddress, userAgent } = options;

  return this.create({
    businessOperationId,
    action,
    performedBy,
    comment,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    performedAt: new Date()
  });
};

BusinessOperationAudit.getHistory = function(businessOperationId, options = {}) {
  return this.findAll({
    where: { businessOperationId },
    include: [{
      association: 'performer',
      attributes: ['id', 'username', 'email', 'role']
    }],
    order: [['performed_at', 'DESC']],
    ...options
  });
};

BusinessOperationAudit.getUserActions = function(userId, options = {}) {
  return this.findAll({
    where: { performedBy: userId },
    order: [['performed_at', 'DESC']],
    limit: 100,
    ...options
  });
};

BusinessOperationAudit.getRecentActions = function(limit = 50) {
  return this.findAll({
    include: [
      {
        association: 'performer',
        attributes: ['id', 'username', 'email', 'role']
      },
      {
        association: 'businessOperation',
        attributes: ['id', 'label', 'status', 'amount']
      }
    ],
    order: [['performed_at', 'DESC']],
    limit
  });
};

export default BusinessOperationAudit;
