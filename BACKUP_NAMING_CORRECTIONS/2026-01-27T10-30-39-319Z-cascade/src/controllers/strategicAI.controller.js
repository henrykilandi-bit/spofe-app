// ================================================================
// CASCADE - Strategic AI Controller
// ================================================================
// File: cascade/src/controllers/strategicAI.controller.js
// Description: Advanced AI features and predictions
// ================================================================

import { success, error, notFound } from '../utils/response.js';
import logger from '../utils/logger.js';
import sequelize from '../config/database.js';
import StrategicAIEngine from '../utils/strategicAIEngine.js';
import IntelligentReporting from '../utils/intelligentReporting.js';

const { StrategicObjective, PerformanceIndicator, Compagnie } = sequelize.models;
const aiEngine = new StrategicAIEngine();
const reportingService = new IntelligentReporting();

/**
 * PREDICT GOAL ACHIEVEMENT
 * POST /api/objectives/:id/ai/predict
 */
export const predictGoalAchievement = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId, {
      include: [
        { model: PerformanceIndicator, as: 'indicators' }
      ]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Get historical data if available
    const historiqueData = objective.indicators?.flatMap(ind => ind.valeursHistoriques || []) || [];

    // Run prediction
    const prediction = await aiEngine.predictGoalAchievement(objective, historiqueData);

    logger.logInfo(`Prédiction objectif ${objectiveId}: ${prediction.probability}% de chance d'atteinte`);

    return success(res, {
      objectiveId,
      prediction: {
        probability: prediction.probability,
        confidence: prediction.confidence,
        estimatedDate: prediction.estimatedDate,
        keyFactors: prediction.keyFactors,
        recommendations: prediction.recommendations
      }
    });
  } catch (err) {
    logger.logError('Erreur prédiction objectif', err);
    next(err);
  }
};

/**
 * GENERATE SMART GOALS
 * POST /api/objectives/ai/generate-smart
 */
export const generateSmartGoals = async (req, res, next) => {
  try {
    const { compagnieId, secteurActivite } = req.body;
    const userId = req.user.id;

    // Verify compagnie exists
    const compagnie = await Compagnie.findByPk(compagnieId);
    if (!compagnie) {
      return notFound(res, 'Compagnie introuvable');
    }

    // Get company historical data
    const objectives = await StrategicObjective.findAll({
      where: { compagnieId, deletedAt: null },
      include: [{ model: PerformanceIndicator, as: 'indicators' }]
    });

    const historiqueData = objectives.flatMap(
      obj => obj.indicators?.flatMap(ind => ind.valeursHistoriques || []) || []
    );

    // Generate smart goals
    const generatedGoals = await aiEngine.generateSmartGoals(
      { nom: compagnie.nom, ca: compagnie.ca },
      secteurActivite,
      historiqueData
    );

    logger.logInfo(`${generatedGoals.length} smart goals générés pour ${compagnie.nom} par ${userId}`);

    return success(res, {
      compagnieId,
      generatedGoals: generatedGoals.map(goal => ({
        titre: goal.titre,
        type: goal.type,
        valeurCible: goal.valeurCible,
        unite: goal.unite,
        reasoning: goal.reasoning,
        smartValidation: goal.smartValidation,
        feasibilityScore: goal.feasibilityScore
      }))
    });
  } catch (err) {
    logger.logError('Erreur génération smart goals', err);
    next(err);
  }
};

/**
 * ANALYZE KPI CORRELATIONS
 * GET /api/objectives/:id/ai/correlations
 */
export const analyzeKpiCorrelations = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId, {
      include: [{ model: PerformanceIndicator, as: 'indicators' }]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    if (!objective.indicators || objective.indicators.length < 2) {
      return success(res, {
        message: 'Besoin d\'au moins 2 indicateurs pour analyser les corrélations',
        correlations: []
      });
    }

    // Analyze correlations
    const correlations = await aiEngine.analyzeCorrelations(objective.indicators);

    logger.logInfo(`${correlations.length} corrélations trouvées pour objectif ${objectiveId}`);

    return success(res, {
      objectiveId,
      correlations: correlations.map(corr => ({
        indicator1: corr.indicator1,
        indicator2: corr.indicator2,
        correlationCoefficient: corr.coefficient,
        strength: corr.strength,
        type: corr.type,
        interpretation: corr.interpretation
      }))
    });
  } catch (err) {
    logger.logError('Erreur analyse corrélations', err);
    next(err);
  }
};

/**
 * DETECT ANOMALIES
 * GET /api/objectives/:id/ai/anomalies
 */
export const detectAnomalies = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;
    const { threshold = 2.5 } = req.query;

    const objective = await StrategicObjective.findByPk(objectiveId, {
      include: [{ model: PerformanceIndicator, as: 'indicators' }]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    const anomalies = [];

    for (const indicator of objective.indicators || []) {
      const indicatorAnomalies = await aiEngine.detectAnomalies(indicator, parseFloat(threshold));
      anomalies.push({
        indicator: indicator.titre,
        anomalies: indicatorAnomalies
      });
    }

    logger.logInfo(`${anomalies.reduce((sum, a) => sum + a.anomalies.length, 0)} anomalies détectées pour objectif ${objectiveId}`);

    return success(res, {
      objectiveId,
      threshold,
      anomalies: anomalies.filter(a => a.anomalies.length > 0)
    });
  } catch (err) {
    logger.logError('Erreur détection anomalies', err);
    next(err);
  }
};

/**
 * OPTIMIZE RESOURCE ALLOCATION
 * POST /api/objectives/:id/ai/optimize-resources
 */
export const optimizeResourceAllocation = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;
    const { availableResources, totalBudget } = req.body;

    const objective = await StrategicObjective.findByPk(objectiveId, {
      include: [
        { model: PerformanceIndicator, as: 'indicators' }
      ]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Optimize resource allocation
    const optimization = await aiEngine.optimizeResourceAllocation(objective, availableResources);

    // Prepare allocation with budget
    const allocatedResources = optimization.map(alloc => ({
      item: alloc.item,
      impact: alloc.impact,
      difficulty: alloc.difficulty,
      urgency: alloc.urgency,
      score: alloc.score,
      allocationPercentage: alloc.allocationPercentage,
      budgetRecommendation: totalBudget * (alloc.allocationPercentage / 100)
    }));

    logger.logInfo(`Optimisation ressources pour objectif ${objectiveId}`);

    return success(res, {
      objectiveId,
      totalBudget,
      allocation: allocatedResources,
      summary: {
        topPriority: allocatedResources[0]?.item || 'N/A',
        topBudget: allocatedResources[0]?.budgetRecommendation || 0
      }
    });
  } catch (err) {
    logger.logError('Erreur optimisation ressources', err);
    next(err);
  }
};

/**
 * GENERATE STRATEGIC REPORT
 * POST /api/objectives/ai/report-strategic
 */
export const generateStrategicReport = async (req, res, next) => {
  try {
    const { compagnieId, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Verify compagnie
    const compagnie = await Compagnie.findByPk(compagnieId);
    if (!compagnie) {
      return notFound(res, 'Compagnie introuvable');
    }

    // Generate report
    const report = await reportingService.generateStrategicReport(compagnieId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    logger.logInfo(`Rapport stratégique généré pour ${compagnie.nom} par ${userId}`);

    return success(res, {
      compagnieId,
      report
    });
  } catch (err) {
    logger.logError('Erreur rapport stratégique', err);
    next(err);
  }
};

/**
 * GENERATE SECTOR BENCHMARK REPORT
 * POST /api/objectives/ai/report-benchmark
 */
export const generateSectorBenchmarkReport = async (req, res, next) => {
  try {
    const { compagnieId, secteur } = req.body;
    const userId = req.user.id;

    // Verify compagnie
    const compagnie = await Compagnie.findByPk(compagnieId);
    if (!compagnie) {
      return notFound(res, 'Compagnie introuvable');
    }

    // Generate report
    const report = await reportingService.generateSectorBenchmarkReport(compagnieId, secteur);

    logger.logInfo(`Rapport benchmark généré pour ${compagnie.nom} vs ${secteur} par ${userId}`);

    return success(res, {
      compagnieId,
      secteur,
      report
    });
  } catch (err) {
    logger.logError('Erreur rapport benchmark', err);
    next(err);
  }
};

/**
 * GET AI INSIGHTS
 * GET /api/objectives/:id/ai/insights
 */
export const getAiInsights = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId, {
      include: [
        { model: PerformanceIndicator, as: 'indicators' }
      ]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Gather all insights
    const historiqueData = objective.indicators?.flatMap(ind => ind.valeursHistoriques || []) || [];

    const [prediction, correlations, anomalies] = await Promise.all([
      aiEngine.predictGoalAchievement(objective, historiqueData),
      objective.indicators?.length >= 2
        ? aiEngine.analyzeCorrelations(objective.indicators)
        : Promise.resolve([]),
      Promise.all((objective.indicators || []).map(ind => aiEngine.detectAnomalies(ind, 2.5)))
    ]);

    const insights = {
      prediction: {
        probability: prediction.probability,
        confidence: prediction.confidence,
        keyFactors: prediction.keyFactors
      },
      correlations: correlations.map(c => ({
        pair: `${c.indicator1} ↔ ${c.indicator2}`,
        coefficient: c.coefficient,
        interpretation: c.interpretation
      })),
      anomalies: anomalies.reduce((sum, arr) => sum + arr.length, 0),
      recommendations: prediction.recommendations
    };

    return success(res, {
      objectiveId,
      insights,
      generatedAt: new Date()
    });
  } catch (err) {
    logger.logError('Erreur insights IA', err);
    next(err);
  }
};

/**
 * BATCH AI ANALYSIS
 * POST /api/objectives/ai/batch-analysis
 */
export const batchAiAnalysis = async (req, res, next) => {
  try {
    const { objectiveIds } = req.body;
    const userId = req.user.id;

    const results = [];

    for (const objectiveId of objectiveIds) {
      try {
        const objective = await StrategicObjective.findByPk(objectiveId, {
          include: [{ model: PerformanceIndicator, as: 'indicators' }]
        });

        if (objective && !objective.deletedAt) {
          const historiqueData = objective.indicators?.flatMap(ind => ind.valeursHistoriques || []) || [];
          const prediction = await aiEngine.predictGoalAchievement(objective, historiqueData);

          results.push({
            objectiveId,
            success: true,
            prediction: {
              probability: prediction.probability,
              confidence: prediction.confidence
            }
          });
        } else {
          results.push({
            objectiveId,
            success: false,
            error: 'Objectif non trouvé'
          });
        }
      } catch (err) {
        results.push({
          objectiveId,
          success: false,
          error: err.message
        });
      }
    }

    logger.logInfo(`Analyse batch ${results.filter(r => r.success).length}/${objectiveIds.length} complétée par ${userId}`);

    return success(res, {
      results,
      summary: {
        total: objectiveIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (err) {
    logger.logError('Erreur analyse batch', err);
    next(err);
  }
};
