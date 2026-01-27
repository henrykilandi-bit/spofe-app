// ================================================================
// CASCADE - Performance Indicators Controller
// ================================================================
// File: cascade/src/controllers/indicators.controller.js
// Description: KPI management and monitoring
// ================================================================

import { success, error, notFound } from '../utils/response.js';
import logger from '../utils/logger.js';
import sequelize from '../config/database.js';
import { performanceIndicatorDto, performanceIndicatorDtoArray } from '../dto/index.js';

const { PerformanceIndicator, StrategicObjective } = sequelize.models;

/**
 * CREATE KPI
 * POST /api/objectives/:id/indicators
 */
export const createIndicator = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;
    const {
      code,
      titre,
      description,
      typeIndicateur,
      formulaCalcul,
      seuilVert,
      seuilJaune,
      seuilRouge,
      unite,
      frequenceMesure
    } = req.body;
    const user_id = req.user.id;

    // Verify objective exists
    const objective = await StrategicObjective.findByPk(objectiveId);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Create indicator
    const indicator = await PerformanceIndicator.create({
      code,
      titre,
      description,
      strategicObjectiveId: objectiveId,
      typeIndicateur,
      formulaCalcul,
      seuilVert,
      seuilJaune,
      seuilRouge,
      unite,
      frequenceMesure,
      valeursHistoriques: [],
      tendance: 'stable',
      variationPercent: 0
    });

    logger.logInfo(`Indicateur créé: ${indicator.id} pour objectif ${objectiveId} par ${user_id}`);

    return success(res, { indicator: performanceIndicatorDto(indicator) }, 201, 'Indicateur créé');
  } catch (err) {
    logger.logError('Erreur création indicateur', err);
    next(err);
  }
};

/**
 * LIST INDICATORS FOR OBJECTIVE
 * GET /api/objectives/:id/indicators
 */
export const listIndicators = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    const indicators = await PerformanceIndicator.findAll({
      where: {
        strategicObjectiveId: objectiveId,
        deletedAt: null
      },
      order: [['created_at', 'DESC']]
    });

    logger.logInfo(`${indicators.length} indicateurs listés pour objectif ${objectiveId}`);

    return success(res, {
      indicators: indicators.map(ind => ({
        ...performanceIndicatorDto(ind),
        status: ind.evaluateStatus()
      }))
    });
  } catch (err) {
    logger.logError('Erreur liste indicateurs', err);
    next(err);
  }
};

/**
 * GET INDICATOR DETAIL
 * GET /api/objectives/:objectiveId/indicators/:indicatorId
 */
export const getIndicatorDetail = async (req, res, next) => {
  try {
    const { indicatorId } = req.params;

    const indicator = await PerformanceIndicator.findByPk(indicatorId);
    if (!indicator || indicator.deletedAt) {
      return notFound(res, 'Indicateur introuvable');
    }

    const status = indicator.evaluateStatus();
    const lastValue = indicator.getLastValue();

    return success(res, {
      indicator: performanceIndicatorDto(indicator),
      currentStatus: status,
      lastRecordedValue: lastValue,
      historicalPeriods: indicator.getAvailablePeriods()
    });
  } catch (err) {
    logger.logError('Erreur détail indicateur', err);
    next(err);
  }
};

/**
 * RECORD KPI VALUE
 * POST /api/objectives/:objectiveId/indicators/:indicatorId/record
 */
export const recordKpiValue = async (req, res, next) => {
  try {
    const { indicatorId } = req.params;
    const { date, value } = req.body;
    const user_id = req.user.id;

    const indicator = await PerformanceIndicator.findByPk(indicatorId);
    if (!indicator || indicator.deletedAt) {
      return notFound(res, 'Indicateur introuvable');
    }

    // Record value
    await indicator.recordValue(date, value);

    logger.logInfo(`Valeur enregistrée pour indicateur ${indicatorId}: ${value} par ${user_id}`);

    const status = indicator.evaluateStatus();

    return success(res, {
      indicator: performanceIndicatorDto(indicator),
      recordedValue: { date, value },
      currentStatus: status,
      message: 'Valeur enregistrée'
    });
  } catch (err) {
    logger.logError('Erreur enregistrement valeur', err);
    next(err);
  }
};

/**
 * EVALUATE KPI STATUS
 * GET /api/objectives/:objectiveId/indicators/:indicatorId/status
 */
export const evaluateKpiStatus = async (req, res, next) => {
  try {
    const { indicatorId } = req.params;

    const indicator = await PerformanceIndicator.findByPk(indicatorId);
    if (!indicator || indicator.deletedAt) {
      return notFound(res, 'Indicateur introuvable');
    }

    const status = indicator.evaluateStatus();
    const lastValue = indicator.getLastValue();

    return success(res, {
      indicatorId,
      status, // VERT, JAUNE, ROUGE
      lastValue,
      seuils: {
        vert: indicator.seuilVert,
        jaune: indicator.seuilJaune,
        rouge: indicator.seuilRouge
      },
      interpretation: this.interpretStatus(status, indicator)
    });
  } catch (err) {
    logger.logError('Erreur évaluation statut', err);
    next(err);
  }
};

/**
 * GET HISTORICAL TREND
 * GET /api/objectives/:objectiveId/indicators/:indicatorId/history
 */
export const getHistoricalTrend = async (req, res, next) => {
  try {
    const { indicatorId } = req.params;
    const { periodMonths = 12 } = req.query;

    const indicator = await PerformanceIndicator.findByPk(indicatorId);
    if (!indicator || indicator.deletedAt) {
      return notFound(res, 'Indicateur introuvable');
    }

    // Get historical data
    const historicalData = indicator.valeursHistoriques || [];
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1);

    const filteredHistory = historicalData.filter(
      item => new Date(item.date) >= cutoffDate
    );

    // Calculate trend analysis
    const trendAnalysis = this.calculateTrendAnalysis(filteredHistory);

    return success(res, {
      indicatorId,
      indicator: performanceIndicatorDto(indicator),
      period: {
        months: periodMonths,
        from: cutoffDate,
        to: now
      },
      history: filteredHistory,
      trendAnalysis: {
        direction: trendAnalysis.direction, // UP, DOWN, STABLE
        percentChange: trendAnalysis.percentChange,
        average: trendAnalysis.average,
        minimum: trendAnalysis.minimum,
        maximum: trendAnalysis.maximum,
        volatility: trendAnalysis.volatility
      }
    });
  } catch (err) {
    logger.logError('Erreur historique indicateur', err);
    next(err);
  }
};

/**
 * UPDATE INDICATOR
 * PATCH /api/objectives/:objectiveId/indicators/:indicatorId
 */
export const updateIndicator = async (req, res, next) => {
  try {
    const { indicatorId } = req.params;
    const { titre, description, seuilVert, seuilJaune, seuilRouge, frequenceMesure } = req.body;
    const user_id = req.user.id;

    const indicator = await PerformanceIndicator.findByPk(indicatorId);
    if (!indicator || indicator.deletedAt) {
      return notFound(res, 'Indicateur introuvable');
    }

    // Update fields
    if (titre !== undefined) indicator.titre = titre;
    if (description !== undefined) indicator.description = description;
    if (seuilVert !== undefined) indicator.seuilVert = seuilVert;
    if (seuilJaune !== undefined) indicator.seuilJaune = seuilJaune;
    if (seuilRouge !== undefined) indicator.seuilRouge = seuilRouge;
    if (frequenceMesure !== undefined) indicator.frequenceMesure = frequenceMesure;

    await indicator.save();

    logger.logInfo(`Indicateur ${indicatorId} mis à jour par ${user_id}`);

    return success(res, {
      indicator: performanceIndicatorDto(indicator),
      message: 'Indicateur mis à jour'
    });
  } catch (err) {
    logger.logError('Erreur mise à jour indicateur', err);
    next(err);
  }
};

/**
 * DELETE (SOFT) INDICATOR
 * DELETE /api/objectives/:objectiveId/indicators/:indicatorId
 */
export const deleteIndicator = async (req, res, next) => {
  try {
    const { indicatorId } = req.params;
    const user_id = req.user.id;

    const indicator = await PerformanceIndicator.findByPk(indicatorId);
    if (!indicator || indicator.deletedAt) {
      return notFound(res, 'Indicateur introuvable');
    }

    indicator.deletedAt = new Date();
    await indicator.save();

    logger.logInfo(`Indicateur ${indicatorId} supprimé (soft-delete) par ${user_id}`);

    return success(res, { message: 'Indicateur archivé' });
  } catch (err) {
    logger.logError('Erreur suppression indicateur', err);
    next(err);
  }
};

/**
 * BULK RECORD KPI VALUES
 * POST /api/indicators/bulk-record
 */
export const bulkRecordValues = async (req, res, next) => {
  try {
    const { records } = req.body; // Array of {indicatorId, date, value}
    const user_id = req.user.id;

    const results = [];

    for (const record of records) {
      const indicator = await PerformanceIndicator.findByPk(record.indicatorId);
      if (indicator && !indicator.deletedAt) {
        await indicator.recordValue(record.date, record.value);
        results.push({
          indicatorId: record.indicatorId,
          success: true
        });
      } else {
        results.push({
          indicatorId: record.indicatorId,
          success: false,
          error: 'Indicateur non trouvé'
        });
      }
    }

    logger.logInfo(`${results.filter(r => r.success).length} valeurs enregistrées en bulk par ${user_id}`);

    return success(res, { results });
  } catch (err) {
    logger.logError('Erreur enregistrement bulk', err);
    next(err);
  }
};

// ================================================================
// HELPER METHODS
// ================================================================

function interpretStatus(status, indicator) {
  const interpretations = {
    VERT: `Performance excellente - Au-dessus du seuil cible (${indicator.seuilVert})`,
    JAUNE: `Performance acceptable - Entre seuil cible et alerte (${indicator.seuilJaune})`,
    ROUGE: `Performance dégradée - Dépassement alerte (${indicator.seuilRouge})`
  };

  return interpretations[status] || 'Statut indéfini';
}

function calculateTrendAnalysis(historicalData) {
  if (historicalData.length === 0) {
    return {
      direction: 'NO_DATA',
      percentChange: 0,
      average: null,
      minimum: null,
      maximum: null,
      volatility: 0
    };
  }

  const values = historicalData.map(h => h.value);
  const sorted = [...values].sort((a, b) => a - b);

  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const minimum = sorted[0];
  const maximum = sorted[sorted.length - 1];

  // Calculate percent change from first to last
  const percentChange = values.length > 1
    ? ((values[values.length - 1] - values[0]) / values[0]) * 100
    : 0;

  // Calculate volatility (standard deviation)
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const volatility = Math.sqrt(variance);

  // Determine direction
  let direction = 'STABLE';
  if (percentChange > 5) direction = 'UP';
  else if (percentChange < -5) direction = 'DOWN';

  return {
    direction,
    percentChange: Math.round(percentChange * 100) / 100,
    average: Math.round(average * 100) / 100,
    minimum,
    maximum,
    volatility: Math.round(volatility * 100) / 100
  };
}
