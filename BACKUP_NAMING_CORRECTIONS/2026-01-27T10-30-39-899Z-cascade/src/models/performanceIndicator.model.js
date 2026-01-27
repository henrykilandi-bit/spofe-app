// ================================================================
// CASCADE - PerformanceIndicator Model
// ================================================================
// File: cascade/src/models/performanceIndicator.model.js
// ================================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

const PerformanceIndicator = sequelize.define(
  'PerformanceIndicator',
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

    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'Le nom doit contenir entre 3 et 100 caractères'
        }
      }
    },

    formule: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    sourceDonnee: {
      type: DataTypes.ENUM('comptable', 'crm', 'production', 'externe'),
      allowNull: false,
      field: 'source_donnee',
      defaultValue: 'comptable'
    },

    frequenceMesure: {
      type: DataTypes.ENUM('horaire', 'quotidien', 'hebdomadaire', 'mensuel'),
      allowNull: false,
      field: 'frequence_mesure',
      defaultValue: 'mensuel'
    },

    valeursHistoriques: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'valeurs_historiques',
      defaultValue: {}
    },

    tendance: {
      type: DataTypes.ENUM('hausse', 'baisse', 'stable'),
      allowNull: true
    },

    variationPercent: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: 'variation_percent'
    },

    seuilVert: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'seuil_vert'
    },

    seuilJaune: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'seuil_jaune'
    },

    seuilRouge: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'seuil_rouge'
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
    }
  },
  {
    sequelize,
    tableName: 'performance_indicators',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// ================================================================
// HOOKS
// ================================================================

/**
 * BEFORE CREATE: Validation formule et source
 */
PerformanceIndicator.addHook('beforeCreate', async (indicator) => {
  try {
    // ✅ Validation: L'objectif existe
    const StrategicObjective = sequelize.models.StrategicObjective;
    const objective = await StrategicObjective.findByPk(indicator.strategicObjectiveId);
    if (!objective) {
      throw new Error(`L'objectif ${indicator.strategicObjectiveId} n'existe pas`);
    }

    // ✅ Seuils: vert < jaune < rouge (si tous définis)
    if (indicator.seuilVert && indicator.seuilJaune && indicator.seuilRouge) {
      if (!(indicator.seuilVert <= indicator.seuilJaune && indicator.seuilJaune <= indicator.seuilRouge)) {
        throw new Error('Les seuils doivent être ordonnés: vert ≤ jaune ≤ rouge');
      }
    }

    logger.logInfo(`Indicateur créé: ${indicator.nom}`);
  } catch (error) {
    logger.logError('Erreur création indicateur', error);
    throw error;
  }
});

/**
 * BEFORE UPDATE: Recalcul tendance si historique change
 */
PerformanceIndicator.addHook('beforeUpdate', async (indicator) => {
  try {
    const previousHistorique = indicator._previousDataValues.valeursHistoriques;
    const newHistorique = indicator.valeursHistoriques;

    if (JSON.stringify(previousHistorique) !== JSON.stringify(newHistorique)) {
      // Calculer tendance
      const values = Object.values(newHistorique).map(v => parseFloat(v));
      if (values.length >= 2) {
        const lastValue = values[values.length - 1];
        const previousValue = values[values.length - 2];
        
        if (lastValue > previousValue) {
          indicator.tendance = 'hausse';
        } else if (lastValue < previousValue) {
          indicator.tendance = 'baisse';
        } else {
          indicator.tendance = 'stable';
        }

        // Variation en pourcent
        indicator.variationPercent = ((lastValue - previousValue) / previousValue) * 100;
      }
    }
  } catch (error) {
    logger.logError('Erreur recalcul tendance', error);
    throw error;
  }
});

// ================================================================
// INSTANCE METHODS
// ================================================================

/**
 * Ajouter une nouvelle valeur à l'historique
 */
PerformanceIndicator.prototype.recordValue = async function (date, value) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  
  this.valeursHistoriques[dateStr] = parseFloat(value);
  
  // Recalculer tendance
  await this.save();
  return this;
};

/**
 * Évaluer le statut (Vert/Jaune/Rouge)
 */
PerformanceIndicator.prototype.evaluateStatus = function () {
  const lastValue = Object.values(this.valeursHistoriques).pop();
  
  if (!lastValue) return 'UNKNOWN';

  if (this.seuilRouge && lastValue <= this.seuilRouge) return 'ROUGE';
  if (this.seuilJaune && lastValue <= this.seuilJaune) return 'JAUNE';
  if (this.seuilVert && lastValue <= this.seuilVert) return 'VERT';
  
  return 'VERT';
};

/**
 * Obtenir dernière valeur
 */
PerformanceIndicator.prototype.getLastValue = function () {
  const values = Object.entries(this.valeursHistoriques).sort();
  if (values.length === 0) return null;
  return {
    date: values[values.length - 1][0],
    value: values[values.length - 1][1]
  };
};

export default PerformanceIndicator;
