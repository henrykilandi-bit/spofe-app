/**
 * Modèle: OperationTemplate
 * 
 * Règles de mapping entre opérations métier et écritures comptables
 * 
 * Principe:
 * - Paramétré par le comptable (ADMIN)
 * - Un libellé = une règle claire
 * - Aucun fallback (pas de compte par défaut)
 * - Utilisé automatiquement lors de la validation
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OperationTemplate = sequelize.define('OperationTemplate', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },

  operationType: {
    type: DataTypes.ENUM('CAISSE', 'BANQUE', 'IMMO', 'STOCK', 'CREANCE', 'DETTE'),
    allowNull: false,
    field: 'operation_type',
    validate: {
      isIn: {
        args: [['CAISSE', 'BANQUE', 'IMMO', 'STOCK', 'CREANCE', 'DETTE']],
        msg: 'Type d\'opération invalide'
      }
    }
  },

  label: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le libellé est obligatoire'
      },
      len: {
        args: [3, 150],
        msg: 'Le libellé doit contenir entre 3 et 150 caractères'
      }
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  exampleUseCase: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'example_use_case'
  },

  debitAccountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'debit_account_id',
    references: {
      model: 'chart_of_accounts',
      key: 'id'
    }
  },

  creditAccountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'credit_account_id',
    references: {
      model: 'chart_of_accounts',
      key: 'id'
    }
  },

  requiresThirdParty: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'requires_third_party'
  },

  requiresAttachment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'requires_attachment'
  },

  editableByAccountant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'editable_by_accountant'
  },

  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },

  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  tableName: 'operation_templates',
  timestamps: true,
  underscored: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',

  indexes: [
    {
      unique: true,
      fields: ['operation_type', 'label'],
      name: 'uq_operation_template'
    }
  ],

  hooks: {
    /**
     * Avant validation: vérifications
     */
    beforeValidate: (template) => {
      // Normaliser le libellé
      if (template.label) {
        template.label = template.label.trim();
      }
    },

    /**
     * Avant sauvegarde: validations métier
     */
    beforeSave: (template) => {
      // Vérifier que les comptes débit et crédit sont différents
      if (template.debitAccountId === template.creditAccountId) {
        throw new Error('Les comptes débit et crédit doivent être différents');
      }
    },

    /**
     * Avant mise à jour: protections
     */
    beforeUpdate: async (template) => {
      // Vérifier si le template est utilisé par des opérations en attente
      if (template.changed('debitAccountId') || template.changed('creditAccountId')) {
        const BusinessOperation = sequelize.models.BusinessOperation;
        
        const pendingOps = await BusinessOperation.count({
          where: {
            operationType: template.operationType,
            label: template.label,
            status: 'PENDING_VALIDATION'
          }
        });

        if (pendingOps > 0) {
          throw new Error(
            `Impossible de modifier ce template: ${pendingOps} opération(s) en attente de validation l'utilisent`
          );
        }
      }
    }
  }
});

/**
 * Méthodes d'instance
 */
OperationTemplate.prototype.generateJournalEntry = function(businessOperation) {
  return {
    debitAccountId: this.debitAccountId,
    creditAccountId: this.creditAccountId,
    amount: businessOperation.amount,
    description: businessOperation.description || this.label,
    referenceDocument: businessOperation.attachmentUrl,
    entryDate: businessOperation.operationDate
  };
};

OperationTemplate.prototype.validateBusinessOperation = function(businessOperation) {
  const errors = [];

  // Vérifier le type
  if (businessOperation.operationType !== this.operationType) {
    errors.push('Type d\'opération incompatible avec le template');
  }

  // Vérifier le tiers si requis
  if (this.requiresThirdParty && !businessOperation.thirdPartyId) {
    errors.push('Un tiers est obligatoire pour ce type d\'opération');
  }

  // Vérifier la pièce jointe si requise
  if (this.requiresAttachment && !businessOperation.attachmentUrl) {
    errors.push('Une pièce justificative est obligatoire pour ce type d\'opération');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Méthodes statiques
 */
OperationTemplate.findByType = function(operationType, options = {}) {
  return this.findAll({
    where: { 
      operationType, 
      active: true 
    },
    order: [['label', 'ASC']],
    ...options
  });
};

OperationTemplate.findByTypeAndLabel = function(operationType, label, options = {}) {
  return this.findOne({
    where: { 
      operationType, 
      label,
      active: true 
    },
    ...options
  });
};

OperationTemplate.getActiveTemplates = function(options = {}) {
  return this.findAll({
    where: { active: true },
    order: [['operation_type', 'ASC'], ['label', 'ASC']],
    ...options
  });
};

/**
 * Scopes
 */
OperationTemplate.addScope('withAccounts', {
  include: [
    {
      association: 'debitAccount',
      attributes: ['id', 'accountNumber', 'accountName']
    },
    {
      association: 'creditAccount',
      attributes: ['id', 'accountNumber', 'accountName']
    }
  ]
});

OperationTemplate.addScope('activeOnly', {
  where: { active: true }
});

export default OperationTemplate;
