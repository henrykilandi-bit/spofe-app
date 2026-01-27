// ================================================================
// CASCADE - Objective Accounting Integration Service
// ================================================================
// File: cascade/src/utils/objectiveAccountingIntegration.js
// Description: Integrates strategic objectives with accounting system
// ================================================================

import logger from './logger.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

/**
 * Objective Accounting Integration Service
 * Links objectives to chart of accounts and tracks financial impact
 */
class ObjectiveAccountingIntegration {
  /**
   * LINK OBJECTIVE TO ANALYTICAL ACCOUNT
   * Creates a dedicated analytical account for objective tracking
   */
  async linkObjectiveToAccounting(objective) {
    try {
      const { ChartOfAccount, Compagnie } = sequelize.models;

      // Vérifier compagnie existe
      const compagnie = await Compagnie.findByPk(objective.compagnieId);
      if (!compagnie) {
        throw new Error(`Compagnie ${objective.compagnieId} introuvable`);
      }

      // Générer numéro compte analytique unique
      // Format: 70 [objectif_id] (70xxx) - Charges analytiques
      const accountNumber = `70${objective.id.toString().padStart(4, '0')}`;

      // Vérifier compte n'existe pas déjà
      const existingAccount = await ChartOfAccount.findOne({
        where: {
          companyId: objective.compagnieId,
          numeroCompte: accountNumber
        }
      });

      if (existingAccount) {
        logger.logInfo(`Compte analytique existant: ${accountNumber}`);
        return existingAccount;
      }

      // Créer nouveau compte analytique
      const analyticalAccount = await ChartOfAccount.create({
        companyId: objective.compagnieId,
        numeroCompte: accountNumber,
        nom: `${objective.type.toUpperCase()} - ${objective.titre.substring(0, 40)}`,
        typeCompte: 'CHARGES',
        parentAccountId: null,
        // Account for analytical tracking
        estCompteAnalytique: true,
        explicationCompte: `Suivi objectif: ${objective.titre}`,
        dateOuverture: new Date()
      });

      logger.logInfo(
        `Compte analytique créé: ${accountNumber} pour objectif ${objective.id}`
      );

      // Lier objectif au compte dans métadonnées
      objective.analyticalAccountId = analyticalAccount.id;
      await objective.save();

      return analyticalAccount;
    } catch (error) {
      logger.logError('Erreur création compte analytique', error);
      throw error;
    }
  }

  /**
   * RECORD ACTUAL EXPENSE
   * Record actual spending against objective
   */
  async recordObjectiveExpense(objectiveId, journalEntryId, amount, description) {
    try {
      const { StrategicObjective, JournalEntry, JournalEntryLine, ChartOfAccount } = sequelize.models;

      // Récupérer objectif et entry
      const objective = await StrategicObjective.findByPk(objectiveId);
      const entry = await JournalEntry.findByPk(journalEntryId);

      if (!objective || !entry) {
        throw new Error('Objectif ou entry introuvable');
      }

      // Créer ou mettre à jour métadonnées de suivi
      const tracking = {
        journalEntryId,
        amount: parseFloat(amount),
        description,
        date: new Date(),
        user_id: entry.createdBy || null
      };

      if (!objective.costTracking) {
        objective.costTracking = [];
      }

      objective.costTracking.push(tracking);
      await objective.save();

      logger.logInfo(
        `Dépense enregistrée: ${amount} EUR pour objectif ${objectiveId}`
      );

      return tracking;
    } catch (error) {
      logger.logError('Erreur enregistrement dépense', error);
      throw error;
    }
  }

  /**
   * RECONCILE WITH ACTUALS
   * Compare estimated costs with actual expenses
   */
  async reconciliateWithActuals(objective) {
    try {
      const { ObjectiveAction } = sequelize.models;

      // Récupérer toutes les actions liées
      const actions = await ObjectiveAction.findAll({
        where: { strategicObjectiveId: objective.id }
      });

      let totalEstimated = 0;
      let totalActual = 0;

      // Sommer les estimations
      actions.forEach(action => {
        if (action.coutEstime) {
          totalEstimated += parseFloat(action.coutEstime);
        }
      });

      // Somner les réalités (costTracking)
      if (Array.isArray(objective.costTracking)) {
        totalActual = objective.costTracking.reduce(
          (sum, track) => sum + parseFloat(track.amount),
          0
        );
      }

      const variance = totalActual - totalEstimated;
      const variancePercent = totalEstimated > 0
        ? (variance / totalEstimated) * 100
        : 0;

      const reconciliation = {
        objectiveId: objective.id,
        totalEstimated: Math.round(totalEstimated * 100) / 100,
        totalActual: Math.round(totalActual * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        variancePercent: Math.round(variancePercent * 100) / 100,
        status: Math.abs(variancePercent) <= 10 ? 'ON_BUDGET' : 'OVER_BUDGET',
        recommendation: this.generateBudgetRecommendation(
          variancePercent,
          totalEstimated,
          totalActual
        )
      };

      logger.logInfo(
        `Réconciliation objectif ${objective.id}: ${reconciliation.variancePercent}% écart`
      );

      return reconciliation;
    } catch (error) {
      logger.logError('Erreur réconciliation', error);
      throw error;
    }
  }

  /**
   * ANALYZE FINANCIAL IMPACT
   * Determine financial implications of objectives
   */
  async analyzeFinancialImpact(objective) {
    try {
      const { ObjectiveAction } = sequelize.models;

      const actions = await ObjectiveAction.findAll({
        where: { strategicObjectiveId: objective.id }
      });

      // Calculate total cost
      const totalCost = actions.reduce(
        (sum, action) => sum + (parseFloat(action.coutEstime) || 0),
        0
      );

      // Estimate return (simplified)
      // ROI = (Valeur cible - Coût) / Coût * 100
      const estimatedReturn = this.estimateReturn(objective);
      const roi = totalCost > 0
        ? ((estimatedReturn - totalCost) / totalCost) * 100
        : 0;

      // Cash flow impact
      const cashFlowImpact = this.projectCashFlowImpact(objective, totalCost);

      // Payback period
      const paybackPeriod = totalCost > 0 && cashFlowImpact.monthly > 0
        ? totalCost / cashFlowImpact.monthly
        : Infinity;

      const impact = {
        objectiveId: objective.id,
        totalCost: Math.round(totalCost * 100) / 100,
        estimatedRevenue: Math.round(estimatedReturn * 100) / 100,
        roi: Math.round(roi * 100) / 100,
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        cashFlowImpact,
        financialRisk: this.assessFinancialRisk(roi, paybackPeriod),
        profitability: roi > 20 ? 'HIGH' : roi > 0 ? 'POSITIVE' : 'BREAK_EVEN'
      };

      logger.logInfo(
        `Impact financier objectif ${objective.id}: ROI ${impact.roi}%`
      );

      return impact;
    } catch (error) {
      logger.logError('Erreur analyse impact', error);
      throw error;
    }
  }

  /**
   * MONITOR BUDGET VARIANCES
   * Track real-time budget vs actual spending
   */
  async monitorBudgetVariances(objective) {
    try {
      const reconciliation = await this.reconciliateWithActuals(objective);

      // Générer alerte si écart > 20%
      const alerts = [];

      if (Math.abs(reconciliation.variancePercent) > 20) {
        alerts.push({
          severity: 'HIGH',
          message: `Budget variance ${reconciliation.variancePercent}% - Action corrective requise`,
          threshold: 20,
          actual: reconciliation.variancePercent
        });
      } else if (Math.abs(reconciliation.variancePercent) > 10) {
        alerts.push({
          severity: 'MEDIUM',
          message: `Budget variance ${reconciliation.variancePercent}% - À surveiller`,
          threshold: 10,
          actual: reconciliation.variancePercent
        });
      }

      // Vérifier si on approche du budget
      const percentSpent = reconciliation.totalEstimated > 0
        ? (reconciliation.totalActual / reconciliation.totalEstimated) * 100
        : 0;

      if (percentSpent > 80) {
        alerts.push({
          severity: 'MEDIUM',
          message: `${percentSpent.toFixed(0)}% du budget utilisé`,
          threshold: 80,
          actual: percentSpent
        });
      }

      return {
        reconciliation,
        alerts,
        status: alerts.length === 0 ? 'HEALTHY' : 'WARNING'
      };
    } catch (error) {
      logger.logError('Erreur suivi budget', error);
      throw error;
    }
  }

  /**
   * AUTO-RECONCILE AT PERIOD CLOSE
   * Automatically reconcile and lock objective accounts
   */
  async autoPeriodClose(objectiveId, fiscalPeriod) {
    try {
      const { StrategicObjective, AccountBalance } = sequelize.models;

      const objective = await StrategicObjective.findByPk(objectiveId);
      if (!objective) throw new Error('Objectif introuvable');

      // Récupérer tous les mouvements du mois
      const reconciliation = await this.reconciliateWithActuals(objective);

      // Créer AccountBalance entry pour verrouillage
      if (objective.analyticalAccountId) {
        const balance = await AccountBalance.create({
          accountId: objective.analyticalAccountId,
          companyId: objective.compagnieId,
          period: fiscalPeriod,
          openingBalance: 0,
          debits: objective.type === 'CHARGE' ? reconciliation.totalActual : 0,
          credits: 0,
          closingBalance: reconciliation.totalActual,
          isLocked: true
        });

        logger.logSecurity(
          `Période fermée pour objectif ${objectiveId} - montant verrouillé: ${reconciliation.totalActual}`
        );

        return balance;
      }
    } catch (error) {
      logger.logError('Erreur fermeture période', error);
      throw error;
    }
  }

  // ================================================================
  // PRIVATE HELPER METHODS
  // ================================================================

  generateBudgetRecommendation(variancePercent, estimated, actual) {
    if (variancePercent > 20) {
      return 'URGENT: Réajuster ressources ou réduire scope objectif';
    }
    if (variancePercent > 10) {
      return 'Suivre de près, ajustements mineurs recommandés';
    }
    if (variancePercent > 0) {
      return 'Léger surcoût, acceptable dans marge de 10%';
    }
    if (variancePercent > -10) {
      return 'Économies réalisées, bonne gestion budgétaire';
    }
    return 'Économies significatives, réallocuer surplus si possible';
  }

  estimateReturn(objective) {
    // Simplifié - en réalité intégrer données CRM/ventes
    switch (objective.type) {
      case 'vente':
        return parseFloat(objective.valeurCible) * 0.3; // 30% du target = revenu
      case 'production':
        return parseFloat(objective.valeurCible) * 100; // Assume 100 EUR par % efficiency
      case 'finance':
        return parseFloat(objective.valeurCible) * 50; // Savings multiplier
      default:
        return parseFloat(objective.valeurCible) * 0.5;
    }
  }

  projectCashFlowImpact(objective, totalCost) {
    const daysRemaining = Math.ceil(
      (new Date(objective.dateFin) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

    return {
      monthly: Math.round((totalCost / monthsRemaining) * 100) / 100,
      quarterly: Math.round((totalCost / (monthsRemaining / 3)) * 100) / 100,
      total: Math.round(totalCost * 100) / 100
    };
  }

  assessFinancialRisk(roi, paybackPeriod) {
    if (roi < 0) return 'VERY_HIGH';
    if (roi < 10) return 'HIGH';
    if (roi < 20) return 'MEDIUM';
    if (paybackPeriod > 12) return 'MEDIUM'; // Long payback
    return 'LOW';
  }
}

export default ObjectiveAccountingIntegration;
