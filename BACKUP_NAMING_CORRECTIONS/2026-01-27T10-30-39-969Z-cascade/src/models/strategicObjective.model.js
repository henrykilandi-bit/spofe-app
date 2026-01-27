// ================================================================
// CASCADE - StrategicObjective Model
// ================================================================
// File: cascade/src/models/strategicObjective.model.js
// Description: Modèle pour objectifs stratégiques avec IA
// ================================================================

import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

const StrategicObjective = sequelize.define(
  'StrategicObjective',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    compagnieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'compagnie_id'
    },

    parentObjectiveId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_objective_id'
    },

    niveau: {
      type: DataTypes.ENUM('strategique', 'tactique', 'operationnel'),
      allowNull: false,
      defaultValue: 'operationnel'
    },

    type: {
      type: DataTypes.ENUM('vente', 'production', 'rh', 'finance', 'innovation', 'qualite', 'durabilite'),
      allowNull: false
    },

    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'Le titre doit contenir entre 3 et 255 caractères'
        }
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    valeurCible: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'valeur_cible',
      validate: {
        isDecimal: true,
        min: 0
      }
    },

    unite: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [['EUR', 'USD', 'XOF', 'CFA', 'KG', 'UNITE', '%', 'JOURS', 'HEURES']],
          msg: 'Unité non valide'
        }
      }
    },

    direction: {
      type: DataTypes.ENUM('maximiser', 'minimiser', 'atteindre'),
      allowNull: false,
      defaultValue: 'maximiser'
    },

    periodeType: {
      type: DataTypes.ENUM('quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel'),
      allowNull: false,
      field: 'periode_type',
      defaultValue: 'mensuel'
    },

    dateDebut: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_debut'
    },

    dateFin: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_fin'
    },

    responsableUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'responsable_user_id'
    },

    coResponsablesIds: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'co_responsables_ids',
      defaultValue: []
    },

    statut: {
      type: DataTypes.ENUM('nouveau', 'en_cours', 'atteint', 'en_retard', 'abandonne'),
      allowNull: false,
      defaultValue: 'nouveau'
    },

    progression: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 100
      }
    },

    probabiliteAtteinte: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'probabilite_atteinte',
      validate: {
        min: 0,
        max: 100
      }
    },

    facteursRisques: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'facteurs_risques',
      defaultValue: []
    },

    recommandationsIa: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'recommandations_ia',
      defaultValue: []
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  },
  {
    sequelize,
    tableName: 'strategic_objectives',
    timestamps: true,
    underscored: true,
    paranoid: false, // Manual soft-delete via deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// ================================================================
// HOOKS - Business Logic
// ================================================================

/**
 * BEFORE CREATE: Validation des dates et du responsable
 */
StrategicObjective.addHook('beforeCreate', async (objective) => {
  try {
    // ✅ Validation: date_fin > date_debut
    if (new Date(objective.dateFin) <= new Date(objective.dateDebut)) {
      throw new Error('La date de fin doit être après la date de début');
    }

    // ✅ Validation: responsable existe
    const User = sequelize.models.User;
    const responsable = await User.findByPk(objective.responsableUserId);
    if (!responsable) {
      throw new Error(`L'utilisateur ${objective.responsableUserId} n'existe pas`);
    }

    // ✅ Validation: co-responsables existent
    if (objective.coResponsablesIds && objective.coResponsablesIds.length > 0) {
      for (const userId of objective.coResponsablesIds) {
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error(`Le co-responsable ${userId} n'existe pas`);
        }
      }
    }

    // ✅ Log création
    logger.logInfo(`Objectif stratégique créé: ${objective.titre}`);
  } catch (error) {
    logger.logError('Erreur création objectif', error);
    throw error;
  }
});

/**
 * BEFORE UPDATE: État machine pour statut
 */
StrategicObjective.addHook('beforeUpdate', async (objective) => {
  try {
    const previousValues = objective._previousDataValues;

    // ✅ Validation état machine
    const validTransitions = {
      nouveau: ['en_cours', 'abandonne'],
      en_cours: ['atteint', 'en_retard', 'abandonne'],
      en_retard: ['en_cours', 'abandonne'],
      atteint: ['abandonne'],
      abandonne: []
    };

    const previousStatut = previousValues.statut;
    const newStatut = objective.statut;

    if (previousStatut !== newStatut) {
      if (!validTransitions[previousStatut].includes(newStatut)) {
        throw new Error(
          `Transition invalide: ${previousStatut} -> ${newStatut}`
        );
      }
    }

    // ✅ Auto-set statut 'atteint' si progression === 100
    if (objective.progression >= 100 && objective.statut !== 'atteint') {
      objective.statut = 'atteint';
    }

    // ✅ Log modification
    if (previousStatut !== newStatut) {
      logger.logInfo(`Objectif ${objective.id}: ${previousStatut} -> ${newStatut}`);
    }
  } catch (error) {
    logger.logError('Erreur validation statut', error);
    throw error;
  }
});

/**
 * AFTER CREATE: Audit trail
 */
StrategicObjective.addHook('afterCreate', async (objective) => {
  try {
    const AuditTrail = sequelize.models.AuditTrail;
    await AuditTrail.create({
      entityName: 'StrategicObjective',
      entityId: objective.id,
      action: 'CREATE',
      oldValues: {},
      newValues: objective.toJSON(),
      userId: objective.responsableUserId,
      ipAddress: '127.0.0.1'
    });

    logger.logSecurity(`Objectif créé: ${objective.titre}`);
  } catch (error) {
    logger.logError('Erreur audit trail création', error);
  }
});

/**
 * AFTER UPDATE: Audit trail
 */
StrategicObjective.addHook('afterUpdate', async (objective) => {
  try {
    const AuditTrail = sequelize.models.AuditTrail;
    await AuditTrail.create({
      entityName: 'StrategicObjective',
      entityId: objective.id,
      action: 'UPDATE',
      oldValues: objective._previousDataValues,
      newValues: objective.toJSON(),
      userId: objective.responsableUserId,
      ipAddress: '127.0.0.1'
    });
  } catch (error) {
    logger.logError('Erreur audit trail modification', error);
  }
});

// ================================================================
// SCOPES
// ================================================================

StrategicObjective.addScope('active', {
  where: { deletedAt: null }
});

StrategicObjective.addScope('byCompagnie', (compagnieId) => ({
  where: { compagnieId }
}));

StrategicObjective.addScope('byType', (type) => ({
  where: { type }
}));

StrategicObjective.addScope('byStatus', (statut) => ({
  where: { statut }
}));

StrategicObjective.addScope('urgent', {
  where: {
    statut: 'en_retard',
    [Op.or]: [
      { probabiliteAtteinte: { [Op.lt]: 50 } },
      { dateFin: { [Op.lt]: new Date() } }
    ]
  }
});

// ================================================================
// INSTANCE METHODS
// ================================================================

/**
 * Soft delete
 */
StrategicObjective.prototype.softDelete = async function () {
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Restore soft-deleted objective
 */
StrategicObjective.prototype.restore = async function () {
  this.deletedAt = null;
  return this.save();
};

/**
 * Calculate completion percentage
 */
StrategicObjective.prototype.updateProgression = async function (newProgress) {
  if (newProgress < 0 || newProgress > 100) {
    throw new Error('La progression doit être entre 0 et 100');
  }
  this.progression = newProgress;
  return this.save();
};

/**
 * Get hierarchical children
 */
StrategicObjective.prototype.getChildren = function () {
  return StrategicObjective.findAll({
    where: { parentObjectiveId: this.id }
  });
};

/**
 * Get full hierarchy path (parent -> ... -> child)
 */
StrategicObjective.prototype.getFullPath = async function () {
  const path = [this];
  let current = this;

  while (current.parentObjectiveId) {
    const parent = await StrategicObjective.findByPk(current.parentObjectiveId);
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }

  return path;
};

export default StrategicObjective;
