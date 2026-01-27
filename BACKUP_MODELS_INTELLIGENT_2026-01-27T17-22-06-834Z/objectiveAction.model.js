// ================================================================
// CASCADE - ObjectiveAction Model
// ================================================================
// File: cascade/src/models/objectiveAction.model.js
// ================================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

const ObjectiveAction = sequelize.define(
  'ObjectiveAction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    strategicObjectiveId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'strategic_objective_id'
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [5, 5000],
          msg: 'La description doit contenir entre 5 et 5000 caractères'
        }
      }
    },

    statut: {
      type: DataTypes.ENUM('a_faire', 'en_cours', 'termine', 'bloque'),
      allowNull: false,
      defaultValue: 'a_faire'
    },

    priorite: {
      type: DataTypes.ENUM('critique', 'haute', 'moyenne', 'basse'),
      allowNull: false,
      defaultValue: 'moyenne'
    },

    dateEcheance: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_echeance',
      validate: {
        isFuture(value) {
          if (new Date(value) <= new Date()) {
            throw new Error('La date d\'échéance doit être dans le futur');
          }
        }
      }
    },

    dateDebutPlanifiee: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'date_debut_planifiee'
    },

    coutEstime: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'cout_estime',
      validate: {
        min: 0
      }
    },

    ressourcesRequises: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'ressources_requises',
      defaultValue: []
    },

    difficulteEstimee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'difficulte_estimee',
      validate: {
        min: 1,
        max: 5,
        isInt: true
      },
      defaultValue: 3
    },

    impactEstime: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'impact_estime',
      validate: {
        min: 0,
        max: 100
      }
    },

    dependancesIds: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'dependances_ids',
      defaultValue: []
    },

    assigneeUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assignee_user_id'
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'objective_actions',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at'
  }
);

// ================================================================
// HOOKS
// ================================================================

/**
 * BEFORE CREATE: Validation objectif et dépendances
 */
ObjectiveAction.addHook('beforeCreate', async (action) => {
  try {
    // ✅ Validation: L'objectif existe
    const StrategicObjective = sequelize.models.StrategicObjective;
    const objective = await StrategicObjective.findByPk(action.strategicObjectiveId);
    if (!objective) {
      throw new Error(`L'objectif ${action.strategicObjectiveId} n'existe pas`);
    }

    // ✅ Validation: date_echeance <= date_fin objectif
    if (new Date(action.dateEcheance) > new Date(objective.dateFin)) {
      throw new Error('La date d\'échéance ne peut pas dépasser celle de l\'objectif');
    }

    // ✅ Validation: Si dépendances, vérifier existence
    if (action.dependancesIds && action.dependancesIds.length > 0) {
      for (const depId of action.dependancesIds) {
        const dep = await ObjectiveAction.findByPk(depId);
        if (!dep) {
          throw new Error(`L'action dépendance ${depId} n'existe pas`);
        }
      }
    }

    // ✅ Validation: Si assignée, l'utilisateur existe
    if (action.assigneeUserId) {
      const User = sequelize.models.User;
      const assignee = await User.findByPk(action.assigneeUserId);
      if (!assignee) {
        throw new Error(`L'utilisateur ${action.assigneeUserId} n'existe pas`);
      }
    }

    logger.logInfo(`Action créée: ${action.description.substring(0, 50)}...`);
  } catch (error) {
    logger.logError('Erreur création action', error);
    throw error;
  }
});

/**
 * BEFORE UPDATE: État machine statut
 */
ObjectiveAction.addHook('beforeUpdate', async (action) => {
  try {
    const previousStatut = action._previousDataValues.statut;
    const newStatut = action.statut;

    // ✅ Validation état machine
    const validTransitions = {
      a_faire: ['en_cours', 'bloque'],
      en_cours: ['termine', 'bloque'],
      bloque: ['en_cours', 'a_faire'],
      termine: []
    };

    if (previousStatut !== newStatut) {
      if (!validTransitions[previousStatut].includes(newStatut)) {
        throw new Error(`Transition invalide: ${previousStatut} -> ${newStatut}`);
      }
    }

    logger.logInfo(`Action ${action.id}: ${previousStatut} -> ${newStatut}`);
  } catch (error) {
    logger.logError('Erreur validation statut action', error);
    throw error;
  }
});

/**
 * AFTER UPDATE: Log audit
 */
ObjectiveAction.addHook('afterUpdate', async (action) => {
  try {
    const AuditTrail = sequelize.models.AuditTrail;
    await AuditTrail.create({
      entityName: 'ObjectiveAction',
      entityId: action.id,
      action: 'UPDATE',
      oldValues: action._previousDataValues,
      newValues: action.toJSON(),
      user_id: action.assigneeUserId || null,
      ipAddress: '127.0.0.1'
    });
  } catch (error) {
    logger.logError('Erreur audit trail action', error);
  }
});

// ================================================================
// SCOPES
// ================================================================

ObjectiveAction.addScope('byObjective', (objectiveId) => ({
  where: { strategicObjectiveId: objectiveId }
}));

ObjectiveAction.addScope('byStatus', (statut) => ({
  where: { statut }
}));

ObjectiveAction.addScope('byPriority', (priorite) => ({
  where: { priorite }
}));

ObjectiveAction.addScope('overdue', {
  where: {
    dateEcheance: {
      [sequelize.Sequelize.Op.lt]: new Date()
    },
    statut: {
      [sequelize.Sequelize.Op.ne]: 'termine'
    }
  }
});

// ================================================================
// INSTANCE METHODS
// ================================================================

/**
 * Marquer comme terminée
 */
ObjectiveAction.prototype.complete = async function () {
  this.statut = 'termine';
  return this.save();
};

/**
 * Bloquer action (avec raison optionnelle)
 */
ObjectiveAction.prototype.block = async function (reason = null) {
  this.statut = 'bloque';
  if (reason) {
    this.description = `${this.description}\n\n[BLOQUÉE] ${reason}`;
  }
  return this.save();
};

/**
 * Vérifier si toutes les dépendances sont terminées
 */
ObjectiveAction.prototype.areDependenciesComplete = async function () {
  if (!this.dependancesIds || this.dependancesIds.length === 0) {
    return true;
  }

  for (const depId of this.dependancesIds) {
    const dep = await ObjectiveAction.findByPk(depId);
    if (!dep || dep.statut !== 'termine') {
      return false;
    }
  }

  return true;
};

/**
 * Calculer jours restants
 */
ObjectiveAction.prototype.getDaysRemaining = function () {
  const today = new Date();
  const dueDate = new Date(this.dateEcheance);
  const diff = dueDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Évaluer urgence
 */
ObjectiveAction.prototype.getUrgency = function () {
  const daysRemaining = this.getDaysRemaining();
  
  if (daysRemaining < 0) return 'OVERDUE';
  if (daysRemaining <= 3) return 'CRITICAL';
  if (daysRemaining <= 7) return 'HIGH';
  if (daysRemaining <= 14) return 'MEDIUM';
  return 'LOW';
};

export default ObjectiveAction;
