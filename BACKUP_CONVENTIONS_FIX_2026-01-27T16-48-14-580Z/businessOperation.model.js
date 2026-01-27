/**
 * Modèle: BusinessOperation
 * 
 * Représente une opération métier pré-comptable
 * 
 * Workflow:
 * 1. USER crée (DRAFT)
 * 2. USER soumet (PENDING_VALIDATION)
 * 3. ADMIN valide/rejette (VALIDATED/REJECTED)
 * 4. Si validé → création écriture comptable
 * 
 * Règles métier critiques:
 * - Modification interdite après soumission (sauf par ADMIN)
 * - Validation = création écriture comptable atomique
 * - Traçabilité complète via audits
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BusinessOperation = sequelize.define('BusinessOperation', {
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

  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Le montant doit être supérieur à 0'
      }
    }
  },

  currencyCode: {
    type: DataTypes.CHAR(3),
    allowNull: false,
    defaultValue: 'XOF',
    field: 'currency_code',
    validate: {
      len: {
        args: [3, 3],
        msg: 'Le code devise doit contenir 3 caractères'
      }
    }
  },

  exchangeRate: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
    defaultValue: 1.000000,
    field: 'exchange_rate',
    validate: {
      min: {
        args: [0.000001],
        msg: 'Le taux de change doit être positif'
      }
    }
  },

  operationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'operation_date',
    validate: {
      isDate: {
        msg: 'Date d\'opération invalide'
      }
    }
  },

  fiscalYearId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'fiscal_year_id',
    references: {
      model: 'fiscal_years',
      key: 'id'
    }
  },

  thirdPartyId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'third_party_id',
    references: {
      model: 'third_parties',
      key: 'id'
    }
  },

  attachmentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'attachment_url',
    validate: {
      isUrl: {
        msg: 'URL de pièce jointe invalide'
      }
    }
  },

  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'DRAFT',
    validate: {
      isIn: {
        args: [['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED']],
        msg: 'Statut invalide'
      }
    }
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

  validatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'validated_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  validatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'validated_at'
  },

  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },

  proposedJournalEntryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'proposed_journal_entry_id',
    references: {
      model: 'journal_entries',
      key: 'id'
    }
  },

  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  tableName: 'business_operations',
  timestamps: true,
  underscored: true,
  paranoid: true, // Active le soft delete
  created_at: 'created_at',
  updated_at: 'updated_at',
  deletedAt: 'deleted_at',

  hooks: {
    /**
     * Avant validation: vérifications métier
     */
    beforeValidate: (operation) => {
      // Normaliser le libellé
      if (operation.label) {
        operation.label = operation.label.trim();
      }

      // Validation de la date dans l'exercice
      // TODO: Implémenter la vérification que operation_date est dans fiscal_year
    },

    /**
     * Avant mise à jour: protections OHADA
     */
    beforeUpdate: (operation) => {
      // RÈGLE CRITIQUE: Interdiction de modifier une opération validée
      if (operation.changed('status') && 
          operation._previousDataValues.status === 'VALIDATED') {
        throw new Error(
          'Impossible de modifier une opération validée. ' +
          'Toute correction doit passer par une contre-passation.'
        );
      }

      // Validation du workflow
      if (operation.changed('status')) {
        const oldStatus = operation._previousDataValues.status;
        const newStatus = operation.status;

        // Transitions valides
        const validTransitions = {
          'DRAFT': ['PENDING_VALIDATION'],
          'PENDING_VALIDATION': ['VALIDATED', 'REJECTED', 'DRAFT'],
          'REJECTED': ['DRAFT'],
          'VALIDATED': [] // Aucune transition possible
        };

        if (!validTransitions[oldStatus].includes(newStatus)) {
          throw new Error(
            `Transition invalide: ${oldStatus} → ${newStatus}`
          );
        }
      }

      // Validation obligatoire: validated_by pour VALIDATED
      if (operation.status === 'VALIDATED' && !operation.validatedBy) {
        throw new Error('Le champ validated_by est obligatoire pour valider une opération');
      }

      // Rejet obligatoire: rejection_reason pour REJECTED
      if (operation.status === 'REJECTED' && !operation.rejectionReason) {
        throw new Error('Le motif de rejet est obligatoire');
      }

      // Horodatage automatique de la validation
      if (operation.changed('status') && operation.status === 'VALIDATED') {
        operation.validatedAt = new Date();
      }
    },

    /**
     * Avant suppression: log d'audit
     */
    beforeDestroy: async (operation) => {
      // Interdire la suppression physique des opérations validées
      if (operation.status === 'VALIDATED') {
        throw new Error(
          'Suppression interdite pour les opérations validées. ' +
          'Utilisez une contre-passation.'
        );
      }
    }
  }
});

/**
 * Méthodes d'instance
 */
BusinessOperation.prototype.canBeEditedBy = function(user) {
  // ADMIN peut tout modifier (sauf VALIDATED)
  if (user.role === 'admin' && this.status !== 'VALIDATED') {
    return true;
  }

  // USER peut modifier ses propres DRAFT
  if (user.id === this.createdBy && this.status === 'DRAFT') {
    return true;
  }

  return false;
};

BusinessOperation.prototype.canBeValidatedBy = function(user) {
  return ['admin', 'accountant'].includes(user.role) && 
         this.status === 'PENDING_VALIDATION';
};

BusinessOperation.prototype.canBeRejectedBy = function(user) {
  return ['admin', 'accountant'].includes(user.role) && 
         this.status === 'PENDING_VALIDATION';
};

/**
 * Méthodes statiques
 */
BusinessOperation.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status },
    order: [['operation_date', 'DESC']],
    ...options
  });
};

BusinessOperation.findPendingValidation = function(options = {}) {
  return this.findByStatus('PENDING_VALIDATION', options);
};

BusinessOperation.findByUser = function(user_id, options = {}) {
  return this.findAll({
    where: { createdBy: user_id },
    order: [['created_at', 'DESC']],
    ...options
  });
};

export default BusinessOperation;
