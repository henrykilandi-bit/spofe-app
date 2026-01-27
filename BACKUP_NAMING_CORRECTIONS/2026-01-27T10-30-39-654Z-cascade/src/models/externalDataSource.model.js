// ================================================================
// CASCADE - ExternalDataSource Model
// ================================================================
// File: cascade/src/models/externalDataSource.model.js
// ================================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

const ExternalDataSource = sequelize.define(
  'ExternalDataSource',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    type: {
      type: DataTypes.ENUM('sectoriel', 'economique', 'meteo', 'marche', 'concurrence'),
      allowNull: false
    },

    source: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'La source doit contenir entre 3 et 100 caractères'
        }
      }
    },

    paysCode: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: 'pays_code',
      validate: {
        len: {
          args: [2, 2],
          msg: 'Le code pays doit être sur 2 caractères (ISO 3166-1 alpha-2)'
        }
      }
    },

    region: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    indicateur: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'L\'indicateur doit contenir entre 3 et 100 caractères'
        }
      }
    },

    valeur: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isJSON(value) {
          if (typeof value !== 'object' || value === null) {
            throw new Error('La valeur doit être un objet JSON valide');
          }
        }
      }
    },

    dateMaj: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_maj',
      defaultValue: DataTypes.NOW
    },

    fiabilite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'fiabilite',
      defaultValue: 3,
      validate: {
        min: 1,
        max: 5,
        isInt: true
      }
    },

    sourceUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'source_url',
      validate: {
        isUrl: true
      }
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
    tableName: 'external_data_sources',
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
 * BEFORE CREATE: Validation et normalisation
 */
ExternalDataSource.addHook('beforeCreate', async (source) => {
  try {
    // ✅ Validation: valeur est un objet JSON valide
    if (typeof source.valeur !== 'object' || source.valeur === null) {
      throw new Error('La valeur doit être un objet JSON valide');
    }

    // ✅ Validation: Si pays_code fourni, vérifier format ISO
    if (source.paysCode && !/^[A-Z]{2}$/.test(source.paysCode)) {
      throw new Error('Le code pays doit être au format ISO 3166-1 alpha-2 (ex: SN, CI, BJ)');
    }

    // ✅ Log création
    logger.logInfo(
      `Données externes intégrées: ${source.type}/${source.source}/${source.indicateur}`
    );
  } catch (error) {
    logger.logError('Erreur création source de données', error);
    throw error;
  }
});

/**
 * BEFORE UPDATE: Log changement fiabilite
 */
ExternalDataSource.addHook('beforeUpdate', async (source) => {
  try {
    const previousFiabilite = source._previousDataValues.fiabilite;
    const newFiabilite = source.fiabilite;

    if (previousFiabilite !== newFiabilite) {
      logger.logSecurity(
        `Fiabilité source ${source.source} modifiée: ${previousFiabilite} -> ${newFiabilite}`
      );
    }
  } catch (error) {
    logger.logError('Erreur validation mise à jour source', error);
    throw error;
  }
});

// ================================================================
// SCOPES
// ================================================================

ExternalDataSource.addScope('byType', (type) => ({
  where: { type }
}));

ExternalDataSource.addScope('bySource', (source) => ({
  where: { source }
}));

ExternalDataSource.addScope('byCountry', (paysCode) => ({
  where: { paysCode }
}));

ExternalDataSource.addScope('reliable', {
  where: {
    fiabilite: {
      [sequelize.Sequelize.Op.gte]: 3
    }
  }
});

ExternalDataSource.addScope('recent', {
  where: {
    dateMaj: {
      [sequelize.Sequelize.Op.gte]: sequelize.Sequelize.literal(
        "DATE_SUB(CURDATE(), INTERVAL 30 DAY)"
      )
    }
  }
});

// ================================================================
// INSTANCE METHODS
// ================================================================

/**
 * Obtenir valeur pour une période spécifique
 */
ExternalDataSource.prototype.getValueForPeriod = function (period) {
  if (typeof period === 'string') {
    return this.valeur[period] || null;
  }

  // Si c'est une date, chercher la période la plus proche
  const periodStr = period instanceof Date 
    ? period.getFullYear().toString()
    : period;

  return this.valeur[periodStr] || null;
};

/**
 * Obtenir toutes les périodes disponibles
 */
ExternalDataSource.prototype.getAvailablePeriods = function () {
  return Object.keys(this.valeur).sort().reverse();
};

/**
 * Vérifier si la donnée est fraîche (< 30 jours)
 */
ExternalDataSource.prototype.isFresh = function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return new Date(this.dateMaj) >= thirtyDaysAgo;
};

/**
 * Obtenir l'étiquette de fiabilité
 */
ExternalDataSource.prototype.getFiabilityLabel = function () {
  const labels = {
    1: 'Très faible',
    2: 'Faible',
    3: 'Moyenne',
    4: 'Bonne',
    5: 'Excellente'
  };
  return labels[this.fiabilite] || 'Inconnue';
};

/**
 * Comparer avec un objectif pour déterminer impact
 */
ExternalDataSource.prototype.analyzeImpactOnObjective = async function (objective) {
  // Cette méthode sera utilisée par l'IA pour évaluer l'impact
  // des données externes sur les objectifs
  
  return {
    sourceIndicateur: this.indicateur,
    objectifType: objective.type,
    pertinence: this.calculateRelevance(objective),
    Impact: this.calculateImpact(objective),
    recommendation: this.generateRecommendation(objective)
  };
};

/**
 * Calculer pertinence par rapport à type objectif
 */
ExternalDataSource.prototype.calculateRelevance = function (objective) {
  const relevanceMap = {
    'vente': ['marche', 'concurrence', 'economique'],
    'production': ['sectoriel', 'meteo', 'economique'],
    'finance': ['economique', 'marche'],
    'rh': ['economique'],
    'innovation': ['sectoriel', 'marche'],
    'qualite': ['sectoriel'],
    'durabilite': ['economique', 'meteo']
  };

  const relevantTypes = relevanceMap[objective.type] || [];
  return relevantTypes.includes(this.type) ? 'HAUTE' : 'BASSE';
};

/**
 * Calculer impact potentiel
 */
ExternalDataSource.prototype.calculateImpact = function (objective) {
  // Simplifié pour la démo, enrichir avec logic métier réelle
  if (this.fiabilite >= 4 && this.isFresh()) {
    return 'ÉLEVÉ';
  }
  if (this.fiabilite >= 3) {
    return 'MODÉRÉ';
  }
  return 'FAIBLE';
};

/**
 * Générer recommandation
 */
ExternalDataSource.prototype.generateRecommendation = function (objective) {
  const impact = this.calculateImpact(objective);
  const relevance = this.calculateRelevance(objective);

  if (impact === 'ÉLEVÉ' && relevance === 'HAUTE') {
    return `Intégrer ces données ${this.indicateur} dans la planification`;
  }
  if (impact === 'MODÉRÉ') {
    return `Considérer ces données comme contexte supplémentaire`;
  }
  return `Surveiller pour évolution future`;
};

export default ExternalDataSource;
