// ================================================================
// CASCADE - Strategic Objectives Controller
// ================================================================
// File: cascade/src/controllers/objectives.controller.js
// Description: CRUD operations & objectives management
// ================================================================

import { success, error, unauthorized, notFound } from '../utils/response.js';
import logger from '../utils/logger.js';
import sequelize from '../config/database.js';
import StrategicAIEngine from '../utils/strategicAIEngine.js';
import ObjectiveAccountingIntegration from '../utils/objectiveAccountingIntegration.js';

const { StrategicObjective, PerformanceIndicator, ObjectiveAction, User, Compagnie } = sequelize.models;
const aiEngine = new StrategicAIEngine();
const accountingIntegration = new ObjectiveAccountingIntegration();

/**
 * CREATE NEW OBJECTIVE
 * POST /api/objectives
 */
export const createObjective = async (req, res, next) => {
  try {
    const { compagnieId, titre, description, type, valeurCible, unite, responsableId, dateDebut, dateFin, parentObjectiveId, coResponsablesIds } = req.body;
    const userId = req.user.id;

    // Verify compagnie access
    const compagnie = await Compagnie.findByPk(compagnieId);
    if (!compagnie) {
      return notFound(res, 'Compagnie introuvable');
    }

    // Verify responsable user exists
    const responsable = await User.findByPk(responsableId);
    if (!responsable) {
      return notFound(res, 'Utilisateur responsable introuvable');
    }

    // Create objective
    const objective = await StrategicObjective.create({
      titre,
      description,
      type,
      valeurCible,
      unite,
      compagnieId,
      responsableUserId: responsableId,
      parentObjectiveId,
      coResponsablesIds: coResponsablesIds || [],
      progression: 0,
      statut: 'en_cours',
      probabiliteAtteinte: 50,
      factorsRisques: [],
      recommendationsIa: {}
    });

    logger.logInfo(`Objectif créé: ${objective.id} par utilisateur ${userId}`);

    return success(
      res,
      {
        objectif: objective.toJSON(),
        message: 'Objectif créé avec succès'
      },
      201,
      'Objectif créé'
    );
  } catch (err) {
    logger.logError('Erreur création objectif', err);
    next(err);
  }
};

/**
 * LIST OBJECTIVES WITH FILTERS
 * GET /api/objectives
 */
export const listObjectives = async (req, res, next) => {
  try {
    const { compagnieId, type, statut, responsableId, search, limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    // Build where clause
    const where = { deletedAt: null };
    if (compagnieId) where.compagnieId = compagnieId;
    if (type) where.type = type;
    if (statut) where.statut = statut;
    if (responsableId) where.responsableUserId = responsableId;
    if (search) {
      where[sequelize.Op.or] = [
        { titre: { [sequelize.Op.like]: `%${search}%` } },
        { description: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Fetch objectives
    const objectives = await StrategicObjective.findAndCountAll({
      where,
      include: [
        { model: Compagnie },
        { model: User, as: 'responsable' },
        { model: PerformanceIndicator, as: 'indicators' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    logger.logInfo(`${objectives.count} objectifs listés pour utilisateur ${userId}`);

    return success(res, {
      objectives: objectives.rows.map(o => o.toJSON()),
      pagination: {
        total: objectives.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(objectives.count / parseInt(limit))
      }
    });
  } catch (err) {
    logger.logError('Erreur liste objectifs', err);
    next(err);
  }
};

/**
 * GET OBJECTIVE DETAIL
 * GET /api/objectives/:id
 */
export const getObjectiveDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const objective = await StrategicObjective.findByPk(id, {
      include: [
        { model: Compagnie },
        { model: User, as: 'responsable' },
        { model: PerformanceIndicator, as: 'indicators' },
        { model: ObjectiveAction, as: 'actions' },
        { model: StrategicObjective, as: 'childObjectives' }
      ]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Add AI predictions
    const aiPredictions = await aiEngine.predictGoalAchievement(objective, []);

    return success(res, {
      objective: objective.toJSON(),
      aiInsights: {
        predictions: aiPredictions,
        probabiliteAtteinte: objective.probabiliteAtteinte
      }
    });
  } catch (err) {
    logger.logError('Erreur récupération objectif', err);
    next(err);
  }
};

/**
 * UPDATE OBJECTIVE
 * PATCH /api/objectives/:id
 */
export const updateObjective = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titre, description, progression, statut, valeurCible, notes } = req.body;
    const userId = req.user.id;

    const objective = await StrategicObjective.findByPk(id);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Update fields if provided
    if (titre !== undefined) objective.titre = titre;
    if (description !== undefined) objective.description = description;
    if (progression !== undefined) await objective.updateProgression(progression, notes);
    if (statut !== undefined) objective.statut = statut;
    if (valeurCible !== undefined) objective.valeurCible = valeurCible;

    await objective.save();

    logger.logInfo(`Objectif ${id} mis à jour par utilisateur ${userId}`);

    return success(res, {
      objective: objective.toJSON(),
      message: 'Objectif mis à jour'
    });
  } catch (err) {
    logger.logError('Erreur mise à jour objectif', err);
    next(err);
  }
};

/**
 * DELETE (SOFT) OBJECTIVE
 * DELETE /api/objectives/:id
 */
export const deleteObjective = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const objective = await StrategicObjective.findByPk(id);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    await objective.softDelete();

    logger.logInfo(`Objectif ${id} supprimé (soft-delete) par utilisateur ${userId}`);

    return success(res, { message: 'Objectif archivé avec succès' });
  } catch (err) {
    logger.logError('Erreur suppression objectif', err);
    next(err);
  }
};

/**
 * GET OBJECTIVE PROGRESS
 * GET /api/objectives/:id/progress
 */
export const getObjectiveProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const objective = await StrategicObjective.findByPk(id, {
      include: [
        { model: PerformanceIndicator, as: 'indicators' },
        { model: ObjectiveAction, as: 'actions' }
      ]
    });

    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    // Calculate progress metrics
    const progressMetrics = {
      progression: objective.progression,
      statut: objective.statut,
      probabiliteAtteinte: objective.probabiliteAtteinte,
      indicatorsCount: objective.indicators?.length || 0,
      actionsCount: objective.actions?.length || 0,
      actionsCompletedCount: objective.actions?.filter(a => a.statut === 'completee').length || 0,
      completionPercentage: objective.actions?.length > 0
        ? Math.round((objective.actions.filter(a => a.statut === 'completee').length / objective.actions.length) * 100)
        : 0,
      healthScore: this.calculateHealthScore(objective)
    };

    return success(res, progressMetrics);
  } catch (err) {
    logger.logError('Erreur calcul progression', err);
    next(err);
  }
};

/**
 * RESTORE OBJECTIVE
 * POST /api/objectives/:id/restore
 */
export const restoreObjective = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const objective = await StrategicObjective.findByPk(id, { paranoid: false });
    if (!objective) {
      return notFound(res, 'Objectif introuvable');
    }

    await objective.restore();

    logger.logInfo(`Objectif ${id} restauré par utilisateur ${userId}`);

    return success(res, { message: 'Objectif restauré avec succès' });
  } catch (err) {
    logger.logError('Erreur restauration objectif', err);
    next(err);
  }
};

/**
 * CREATE OBJECTIVE ACTION
 * POST /api/objectives/:id/actions
 */
export const createObjectiveAction = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;
    const { titre, description, assigneeId, dateDebut, dateFin, priorite, budgetEstime, dependanciesIds } = req.body;

    const objective = await StrategicObjective.findByPk(objectiveId);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    const action = await ObjectiveAction.create({
      titre,
      description,
      strategicObjectiveId: objectiveId,
      assigneeUserId: assigneeId,
      dateDebut,
      dateFin,
      priorite,
      budgetEstime,
      dependanciesIds: dependanciesIds || [],
      statut: 'non_demarree'
    });

    logger.logInfo(`Action créée pour objectif ${objectiveId}`);

    return success(res, { action: action.toJSON() }, 201, 'Action créée');
  } catch (err) {
    logger.logError('Erreur création action', err);
    next(err);
  }
};

/**
 * LINK OBJECTIVE TO ACCOUNTING
 * POST /api/objectives/:id/accounting/link
 */
export const linkObjectiveToAccounting = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    const accountingLink = await accountingIntegration.linkObjectiveToAccounting(objective);

    logger.logInfo(`Objectif ${objectiveId} lié à la comptabilité: compte ${accountingLink.accountId}`);

    return success(res, {
      accountingLink,
      message: 'Objectif lié à la comptabilité'
    });
  } catch (err) {
    logger.logError('Erreur liaison comptabilité', err);
    next(err);
  }
};

/**
 * GET OBJECTIVE FINANCIAL IMPACT
 * GET /api/objectives/:id/accounting/impact
 */
export const getFinancialImpact = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    const impact = await accountingIntegration.analyzeFinancialImpact(objective);

    return success(res, impact);
  } catch (err) {
    logger.logError('Erreur analyse impact financier', err);
    next(err);
  }
};

/**
 * GET BUDGET VARIANCE
 * GET /api/objectives/:id/accounting/variance
 */
export const getBudgetVariance = async (req, res, next) => {
  try {
    const { id: objectiveId } = req.params;

    const objective = await StrategicObjective.findByPk(objectiveId);
    if (!objective || objective.deletedAt) {
      return notFound(res, 'Objectif introuvable');
    }

    const variance = await accountingIntegration.monitorBudgetVariances(objective);

    return success(res, variance);
  } catch (err) {
    logger.logError('Erreur variance budgétaire', err);
    next(err);
  }
};

/**
 * BATCH UPDATE PROGRESSION
 * POST /api/objectives/batch/progression
 */
export const batchUpdateProgression = async (req, res, next) => {
  try {
    const { updates } = req.body; // Array of {objectiveId, progression, notes}
    const userId = req.user.id;

    const results = [];

    for (const update of updates) {
      const objective = await StrategicObjective.findByPk(update.objectiveId);
      if (objective && !objective.deletedAt) {
        await objective.updateProgression(update.progression, update.notes);
        results.push({ objectiveId: update.objectiveId, success: true });
      } else {
        results.push({ objectiveId: update.objectiveId, success: false, error: 'Objectif non trouvé' });
      }
    }

    logger.logInfo(`${results.filter(r => r.success).length} objectifs mis à jour en batch par ${userId}`);

    return success(res, { updates: results });
  } catch (err) {
    logger.logError('Erreur batch update', err);
    next(err);
  }
};

// ================================================================
// HELPER METHODS
// ================================================================

function calculateHealthScore(objective) {
  let score = 50;

  if (objective.statut === 'atteint') score = 100;
  else if (objective.statut === 'en_cours') score = 70;
  else if (objective.statut === 'en_retard') score = 30;
  else if (objective.statut === 'abandonne') score = 0;

  // Adjust based on progression
  score = (score * 0.7) + (objective.progression * 0.3);

  return Math.round(score);
}
