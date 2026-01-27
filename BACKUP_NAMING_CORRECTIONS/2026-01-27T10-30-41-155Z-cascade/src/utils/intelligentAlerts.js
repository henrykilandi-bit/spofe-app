// ================================================================
// CASCADE - Intelligent Alerts Service
// ================================================================
// File: cascade/src/utils/intelligentAlerts.js
// Description: Real-time monitoring and smart alerts for objectives
// ================================================================

import logger from './logger.js';
import sequelize from '../config/database.js';
import StrategicAIEngine from './strategicAIEngine.js';
import { Op } from 'sequelize';

/**
 * Intelligent Alert System
 * Monitors objectives in real-time and sends proactive alerts
 */
class IntelligentAlertSystem {
  constructor() {
    this.aiEngine = new StrategicAIEngine();
    this.monitoringActive = false;
  }

  /**
   * START MONITORING
   * Launches continuous monitoring of active objectives
   */
  async startMonitoring(interval = 60000) { // Default: every minute
    try {
      if (this.monitoringActive) {
        logger.logInfo('Monitoring déjà actif');
        return;
      }

      this.monitoringActive = true;
      logger.logInfo('Démarrage monitoring objectifs');

      // Lancer monitoring en arrière-plan
      this.monitoringInterval = setInterval(async () => {
        await this.monitorObjectives();
      }, interval);

      return { status: 'MONITORING_ACTIVE', interval };
    } catch (error) {
      logger.logError('Erreur démarrage monitoring', error);
      throw error;
    }
  }

  /**
   * STOP MONITORING
   * Stops the monitoring loop
   */
  async stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringActive = false;
      logger.logInfo('Monitoring stoppé');
      return { status: 'MONITORING_STOPPED' };
    }
  }

  /**
   * MONITOR OBJECTIVES
   * Check all active objectives for issues
   */
  async monitorObjectives() {
    try {
      const { StrategicObjective, User, ObjectiveAction } = sequelize.models;

      // Récupérer tous les objectifs actifs
      const objectives = await StrategicObjective.findAll({
        where: {
          statut: { [Op.in]: ['nouveau', 'en_cours', 'en_retard'] },
          deletedAt: null
        },
        include: [
          { model: User, as: 'responsable' },
          { model: ObjectiveAction, as: 'actions' }
        ]
      });

      for (const objective of objectives) {
        // 1. Vérifier progression vs prédiction
        await this.checkProgression Deviation(objective);

        // 2. Détecter anomalies
        await this.detectAnomaliesInData(objective);

        // 3. Vérifier ressources
        await this.checkResourceShortage(objective);

        // 4. Analyser facteurs externes
        await this.analyzeExternalRisks(objective);

        // 5. Vérifier échéances
        await this.checkActionDeadlines(objective);
      }

      return { status: 'MONITORING_COMPLETE', objectivesChecked: objectives.length };
    } catch (error) {
      logger.logError('Erreur monitoring objectifs', error);
    }
  }

  /**
   * CHECK PROGRESSION DEVIATION
   * Compares actual vs predicted progression
   */
  async checkProgression Deviation(objective) {
    try {
      // Récupérer dernières données KPI
      const indicators = objective.indicators || [];

      if (indicators.length === 0) return;

      // Prédire progression attendue
      const prediction = await this.aiEngine.predictGoalAchievement(objective);

      const deviation = Math.abs(objective.progression - prediction.probability);

      if (deviation > 15) { // Écart > 15%
        await this.createAlert({
          objectiveId: objective.id,
          type: 'PROGRESSION_DEVIATION',
          severity: deviation > 30 ? 'HIGH' : 'MEDIUM',
          message: `Écart de ${Math.round(deviation)}% entre progression réelle (${objective.progression}%) et attendue (${Math.round(prediction.probability)}%)`,
          details: {
            actualProgress: objective.progression,
            expectedProgress: Math.round(prediction.probability),
            deviation: Math.round(deviation),
            recommendedAction: prediction.recommendations[0] || 'Revoir ressources'
          },
          userId: objective.responsableUserId
        });
      }
    } catch (error) {
      logger.logError('Erreur vérification déviation', error);
    }
  }

  /**
   * DETECT ANOMALIES IN DATA
   * Identifies unusual KPI patterns
   */
  async detectAnomaliesInData(objective) {
    try {
      const { PerformanceIndicator } = sequelize.models;

      const indicators = await PerformanceIndicator.findAll({
        where: { strategicObjectiveId: objective.id }
      });

      for (const indicator of indicators) {
        const anomalies = await this.aiEngine.detectAnomalies(indicator);

        for (const anomaly of anomalies) {
          await this.createAlert({
            objectiveId: objective.id,
            type: 'ANOMALY_DETECTED',
            severity: anomaly.zScore > 3 ? 'HIGH' : 'MEDIUM',
            message: `Anomalie détectée dans KPI: ${indicator.nom}`,
            details: {
              indicatorName: indicator.nom,
              date: anomaly.date,
              value: anomaly.value,
              zScore: anomaly.zScore,
              type: anomaly.type,
              recommendation: anomaly.recommendation
            },
            userId: objective.responsableUserId
          });
        }
      }
    } catch (error) {
      logger.logError('Erreur détection anomalies', error);
    }
  }

  /**
   * CHECK RESOURCE SHORTAGE
   * Identifies potential resource constraints
   */
  async checkResourceShortage(objective) {
    try {
      const { ObjectiveAction, User } = sequelize.models;

      const actions = await ObjectiveAction.findAll({
        where: {
          strategicObjectiveId: objective.id,
          statut: { [Op.in]: ['a_faire', 'en_cours'] }
        },
        include: [{ model: User, as: 'assignee' }]
      });

      // Analyse simple: vérifier actions sans assignee ou critique sans ressources
      const unassignedCritical = actions.filter(
        a => !a.assigneeUserId && a.priorite === 'critique'
      );

      for (const action of unassignedCritical) {
        await this.createAlert({
          objectiveId: objective.id,
          type: 'RESOURCE_SHORTAGE',
          severity: 'HIGH',
          message: `Action critique non assignée: ${action.description.substring(0, 50)}...`,
          details: {
            actionId: action.id,
            description: action.description.substring(0, 100),
            priority: action.priorite,
            dueDate: action.dateEcheance,
            recommendation: 'Assigner urgente ment responsable'
          },
          userId: objective.responsableUserId
        });
      }

      // Vérifier actions manquant ressources
      const withoutResources = actions.filter(
        a => (!a.ressourcesRequises || a.ressourcesRequises.length === 0) && 
             a.priorite === 'haute'
      );

      if (withoutResources.length > 0) {
        await this.createAlert({
          objectiveId: objective.id,
          type: 'RESOURCE_SHORTAGE',
          severity: 'MEDIUM',
          message: `${withoutResources.length} actions sans ressources définies`,
          details: {
            actionCount: withoutResources.length,
            recommendation: 'Définir ressources requises pour chaque action'
          },
          userId: objective.responsableUserId
        });
      }
    } catch (error) {
      logger.logError('Erreur vérification ressources', error);
    }
  }

  /**
   * ANALYZE EXTERNAL RISKS
   * Monitors external data sources for potential impacts
   */
  async analyzeExternalRisks(objective) {
    try {
      const { ExternalDataSource } = sequelize.models;

      // Récupérer données externes pertinentes
      const externalData = await ExternalDataSource.scope('reliable', 'recent').findAll();

      for (const dataSource of externalData) {
        // Analyser impact sur objectif
        const impact = await dataSource.analyzeImpactOnObjective(objective);

        if (impact.Impact === 'ÉLEVÉ') {
          await this.createAlert({
            objectiveId: objective.id,
            type: 'EXTERNAL_RISK',
            severity: 'MEDIUM',
            message: `Facteur externe détecté: ${dataSource.indicateur}`,
            details: {
              source: dataSource.source,
              indicator: dataSource.indicateur,
              value: JSON.stringify(dataSource.valeur),
              relevance: impact.pertinence,
              impact: impact.Impact,
              recommendation: impact.recommendation
            },
            userId: objective.responsableUserId
          });
        }
      }
    } catch (error) {
      logger.logError('Erreur analyse risques externes', error);
    }
  }

  /**
   * CHECK ACTION DEADLINES
   * Monitors action deadlines and overdue items
   */
  async checkActionDeadlines(objective) {
    try {
      const { ObjectiveAction } = sequelize.models;

      const actions = await ObjectiveAction.findAll({
        where: {
          strategicObjectiveId: objective.id,
          statut: { [Op.in]: ['a_faire', 'en_cours'] }
        }
      });

      for (const action of actions) {
        const daysRemaining = action.getDaysRemaining();
        const urgency = action.getUrgency();

        // Alerte si overdue
        if (urgency === 'OVERDUE') {
          await this.createAlert({
            objectiveId: objective.id,
            type: 'DEADLINE_OVERDUE',
            severity: 'HIGH',
            message: `Action en retard: ${action.description.substring(0, 50)}...`,
            details: {
              actionId: action.id,
              dueDate: action.dateEcheance,
              daysOverdue: Math.abs(daysRemaining),
              status: action.statut,
              recommendation: 'Finaliser ou réassigner immédiatement'
            },
            userId: action.assigneeUserId || objective.responsableUserId
          });
        }

        // Alerte si très urgent (< 3 jours)
        if (urgency === 'CRITICAL') {
          await this.createAlert({
            objectiveId: objective.id,
            type: 'DEADLINE_CRITICAL',
            severity: 'HIGH',
            message: `Action critique - ${daysRemaining} jours restants`,
            details: {
              actionId: action.id,
              dueDate: action.dateEcheance,
              daysRemaining,
              priority: action.priorite,
              recommendation: 'Accélérer finalisation'
            },
            userId: action.assigneeUserId || objective.responsableUserId
          });
        }
      }
    } catch (error) {
      logger.logError('Erreur vérification échéances', error);
    }
  }

  /**
   * CREATE ALERT
   * Persists alert and sends notifications
   */
  async createAlert(alertData) {
    try {
      const { StrategicObjective, User, SecurityEvent } = sequelize.models;

      // Enregistrer dans SecurityEvent pour audit
      await SecurityEvent.create({
        eventType: alertData.type,
        severity: alertData.severity,
        ipAddress: '127.0.0.1',
        userId: alertData.userId,
        description: alertData.message,
        additionalData: JSON.stringify(alertData.details)
      });

      // Envoyer notifications selon sévérité et préférences utilisateur
      await this.sendSmartAlert(alertData);

      logger.logInfo(
        `Alerte créée: ${alertData.type} - ${alertData.message.substring(0, 50)}`
      );

      return alertData;
    } catch (error) {
      logger.logError('Erreur création alerte', error);
    }
  }

  /**
   * SEND SMART ALERT
   * Intelligently routes alerts through multiple channels
   */
  async sendSmartAlert(alert Data) {
    try {
      const channels = this.determineBestChannels(alertData);

      for (const channel of channels) {
        switch (channel) {
          case 'dashboard':
            await this.showDashboardAlert(alertData);
            break;
          case 'email':
            await this.sendEmailAlert(alertData);
            break;
          case 'sms':
            await this.sendSMSAlert(alertData);
            break;
          case 'whatsapp':
            await this.sendWhatsAppAlert(alertData);
            break;
          case 'push':
            await this.sendPushNotification(alertData);
            break;
          default:
            logger.logWarn(`Canal inconnu: ${channel}`);
        }
      }
    } catch (error) {
      logger.logError('Erreur envoi alertes', error);
    }
  }

  // ================================================================
  // PRIVATE HELPER METHODS
  // ================================================================

  determineBestChannels(alert Data) {
    const channels = ['dashboard']; // Always send to dashboard

    if (alertData.severity === 'HIGH') {
      channels.push('email');
      channels.push('push');
      // In Africa, WhatsApp and SMS are often more reliable
      channels.push('whatsapp');
    } else if (alertData.severity === 'MEDIUM') {
      channels.push('push');
      channels.push('email');
    }

    return [...new Set(channels)]; // Remove duplicates
  }

  async showDashboardAlert(alertData) {
    // Simplified - in production integrate with WebSocket
    logger.logInfo(`Dashboard Alert: ${alertData.message}`);
  }

  async sendEmailAlert(alertData) {
    // Simplified - in production integrate with email service
    logger.logInfo(`Email Alert sent: ${alertData.message}`);
  }

  async sendSMSAlert(alertData) {
    // Simplified - in production integrate with SMS provider
    if (alertData.severity === 'HIGH') {
      logger.logSecurity(`SMS Alert: ${alertData.message}`);
    }
  }

  async sendWhatsAppAlert(alertData) {
    // Simplified - in production integrate with WhatsApp Business API
    logger.logInfo(`WhatsApp Alert: ${alertData.message}`);
  }

  async sendPushNotification(alertData) {
    // Simplified - in production integrate with push service
    logger.logInfo(`Push Notification: ${alertData.message}`);
  }
}

export default IntelligentAlertSystem;
