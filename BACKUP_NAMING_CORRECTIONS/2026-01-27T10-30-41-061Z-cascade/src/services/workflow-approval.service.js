/**
 * Workflow Approval Service
 * SPOFE v2.1 - Workflow d'approbation configurable par rôle
 */

import { DataTypes, Op } from 'sequelize';
import logger from '../utils/logger.js';
import webSocketService from './websocket.service.js';
import redis from '../config/redis.js';

class WorkflowApprovalService {
  constructor() {
    this.models = {};
    this.workflowConfigs = new Map(); // entityType -> workflow config
  }

  /**
   * Initialiser les modèles de données pour les workflows
   */
  async initializeModels(sequelize) {
    // Modèle de configuration des workflows
    this.models.WorkflowConfig = sequelize.define('WorkflowConfig', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      entityType: {
        type: DataTypes.ENUM('ecriture', 'facture', 'paiement', 'rapport', 'balance'),
        allowNull: false
      },
      compagnieId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      deadlineHours: {
        type: DataTypes.INTEGER,
        defaultValue: 48
      },
      autoApproveBelowAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
      },
      requireAllApprovers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      allowDelegation: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });

    // Modèle des étapes de workflow
    this.models.WorkflowStep = sequelize.define('WorkflowStep', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      workflowConfigId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: this.models.WorkflowConfig,
          key: 'id'
        }
      },
      stepOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      approverRole: {
        type: DataTypes.ENUM('COMPTABLE', 'SUPERVISEUR', 'DIRECTEUR', 'ADMIN', 'FINANCIER'),
        allowNull: false
      },
      approverUserId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      canReject: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      canRequestChanges: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      conditions: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    });

    // Modèle des instances de workflow
    this.models.WorkflowInstance = sequelize.define('WorkflowInstance', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      workflowConfigId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: this.models.WorkflowConfig,
          key: 'id'
        }
      },
      entityType: {
        type: DataTypes.ENUM('ecriture', 'facture', 'paiement', 'rapport', 'balance'),
        allowNull: false
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      compagnieId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending'
      },
      currentStep: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      totalSteps: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      initiatorId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      deadline: {
        type: DataTypes.DATE
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2)
      },
      comments: {
        type: DataTypes.TEXT
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    });

    // Modèle des approbations
    this.models.WorkflowApproval = sequelize.define('WorkflowApproval', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      workflowInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: this.models.WorkflowInstance,
          key: 'id'
        }
      },
      workflowStepId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: this.models.WorkflowStep,
          key: 'id'
        }
      },
      approverId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      approverRole: {
        type: DataTypes.ENUM('COMPTABLE', 'SUPERVISEUR', 'DIRECTEUR', 'ADMIN', 'FINANCIER'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'requested_changes'),
        defaultValue: 'pending'
      },
      comments: {
        type: DataTypes.TEXT
      },
      approvedAt: {
        type: DataTypes.DATE
      },
      delegatedTo: {
        type: DataTypes.UUID
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    });

    // Définir les associations
    this.models.WorkflowConfig.hasMany(this.models.WorkflowStep, {
      foreignKey: 'workflowConfigId',
      as: 'steps'
    });

    this.models.WorkflowStep.belongsTo(this.models.WorkflowConfig, {
      foreignKey: 'workflowConfigId',
      as: 'workflowConfig'
    });

    this.models.WorkflowConfig.hasMany(this.models.WorkflowInstance, {
      foreignKey: 'workflowConfigId',
      as: 'instances'
    });

    this.models.WorkflowInstance.belongsTo(this.models.WorkflowConfig, {
      foreignKey: 'workflowConfigId',
      as: 'workflowConfig'
    });

    this.models.WorkflowInstance.hasMany(this.models.WorkflowApproval, {
      foreignKey: 'workflowInstanceId',
      as: 'approvals'
    });

    this.models.WorkflowApproval.belongsTo(this.models.WorkflowInstance, {
      foreignKey: 'workflowInstanceId',
      as: 'workflowInstance'
    });

    this.models.WorkflowApproval.belongsTo(this.models.WorkflowStep, {
      foreignKey: 'workflowStepId',
      as: 'workflowStep'
    });

    await sequelize.sync();
    logger.info('Workflow models initialized successfully');
  }

  /**
   * Créer une configuration de workflow
   */
  async createWorkflowConfig(configData) {
    try {
      const workflowConfig = await this.models.WorkflowConfig.create(configData);
      
      // Créer les étapes si fournies
      if (configData.steps && configData.steps.length > 0) {
        for (const stepData of configData.steps) {
          await this.models.WorkflowStep.create({
            ...stepData,
            workflowConfigId: workflowConfig.id
          });
        }
      }

      logger.info('Workflow config created', {
        workflowConfigId: workflowConfig.id,
        entityType: configData.entityType,
        compagnieId: configData.compagnieId
      });

      return workflowConfig;
    } catch (error) {
      logger.error('Error creating workflow config', { error: error.message });
      throw error;
    }
  }

  /**
   * Démarrer une instance de workflow
   */
  async startWorkflow(entityType, entityId, compagnieId, initiatorId, options = {}) {
    try {
      // Récupérer la configuration active pour cette entité
      const workflowConfig = await this.models.WorkflowConfig.findOne({
        where: {
          entityType,
          compagnieId,
          isActive: true
        },
        include: [{
          model: this.models.WorkflowStep,
          as: 'steps',
          order: [['stepOrder', 'ASC']]
        }]
      });

      if (!workflowConfig) {
        throw new Error(`No active workflow config found for ${entityType}`);
      }

      // Vérifier si une instance existe déjà
      const existingInstance = await this.models.WorkflowInstance.findOne({
        where: {
          entityType,
          entityId,
          status: ['pending', 'in_progress']
        }
      });

      if (existingInstance) {
        return existingInstance;
      }

      // Vérifier l'approbation automatique pour les petits montants
      if (options.amount && workflowConfig.autoApproveBelowAmount > 0) {
        if (parseFloat(options.amount) <= parseFloat(workflowConfig.autoApproveBelowAmount)) {
          return await this.autoApprove(workflowConfig, entityType, entityId, compagnieId, initiatorId, options);
        }
      }

      // Créer l'instance de workflow
      const workflowInstance = await this.models.WorkflowInstance.create({
        workflowConfigId: workflowConfig.id,
        entityType,
        entityId,
        compagnieId,
        initiatorId,
        status: 'pending',
        currentStep: 0,
        totalSteps: workflowConfig.steps.length,
        priority: options.priority || workflowConfig.priority,
        deadline: new Date(Date.now() + workflowConfig.deadlineHours * 60 * 60 * 1000),
        amount: options.amount,
        comments: options.comments,
        metadata: options.metadata || {}
      });

      // Créer les approbations pour chaque étape
      for (const step of workflowConfig.steps) {
        await this.models.WorkflowApproval.create({
          workflowInstanceId: workflowInstance.id,
          workflowStepId: step.id,
          approverId: step.approverUserId,
          approverRole: step.approverRole,
          status: 'pending'
        });
      }

      // Passer à la première étape
      await this.moveToNextStep(workflowInstance);

      logger.info('Workflow started', {
        workflowInstanceId: workflowInstance.id,
        entityType,
        entityId,
        totalSteps: workflowConfig.steps.length
      });

      return workflowInstance;
    } catch (error) {
      logger.error('Error starting workflow', { error: error.message });
      throw error;
    }
  }

  /**
   * Passer à l'étape suivante du workflow
   */
  async moveToNextStep(workflowInstance) {
    try {
      const currentStepIndex = workflowInstance.currentStep;
      const workflowConfig = await this.models.WorkflowConfig.findByPk(workflowInstance.workflowConfigId, {
        include: [{
          model: this.models.WorkflowStep,
          as: 'steps',
          order: [['stepOrder', 'ASC']]
        }]
      });

      if (currentStepIndex >= workflowConfig.steps.length) {
        // Workflow terminé - approuvé
        await this.completeWorkflow(workflowInstance, 'approved');
        return;
      }

      const currentStep = workflowConfig.steps[currentStepIndex];
      
      // Mettre à jour le statut
      await workflowInstance.update({
        status: 'in_progress',
        currentStep: currentStepIndex + 1
      });

      // Notifier les approbateurs
      await this.notifyApprovers(workflowInstance, currentStep);

      logger.info('Workflow moved to next step', {
        workflowInstanceId: workflowInstance.id,
        currentStep: currentStepIndex + 1,
        stepName: currentStep.name
      });
    } catch (error) {
      logger.error('Error moving to next step', { error: error.message });
      throw error;
    }
  }

  /**
   * Approuver une étape de workflow
   */
  async approveStep(workflowInstanceId, approverId, comments = null) {
    try {
      const workflowInstance = await this.models.WorkflowInstance.findByPk(workflowInstanceId, {
        include: [{
          model: this.models.WorkflowApproval,
          as: 'approvals',
          where: {
            approverId,
            status: 'pending'
          }
        }]
      });

      if (!workflowInstance) {
        throw new Error('Workflow instance not found');
      }

      if (workflowInstance.approvals.length === 0) {
        throw new Error('No pending approval found for this user');
      }

      const approval = workflowInstance.approvals[0];

      // Mettre à jour l'approbation
      await approval.update({
        status: 'approved',
        comments,
        approvedAt: new Date()
      });

      // Vérifier si toutes les approbations requises sont obtenues
      const currentStepApprovals = await this.models.WorkflowApproval.findAll({
        where: {
          workflowInstanceId,
          status: 'pending'
        }
      });

      if (currentStepApprovals.length === 0) {
        // Passer à l'étape suivante
        await this.moveToNextStep(workflowInstance);
      }

      // Notifier du progrès
      await this.notifyWorkflowProgress(workflowInstance, 'approved', approverId);

      logger.info('Workflow step approved', {
        workflowInstanceId,
        approverId,
        currentStep: workflowInstance.currentStep
      });

      return workflowInstance;
    } catch (error) {
      logger.error('Error approving workflow step', { error: error.message });
      throw error;
    }
  }

  /**
   * Rejeter une étape de workflow
   */
  async rejectStep(workflowInstanceId, approverId, comments) {
    try {
      const workflowInstance = await this.models.WorkflowInstance.findByPk(workflowInstanceId, {
        include: [{
          model: this.models.WorkflowApproval,
          as: 'approvals',
          where: {
            approverId,
            status: 'pending'
          }
        }]
      });

      if (!workflowInstance) {
        throw new Error('Workflow instance not found');
      }

      if (workflowInstance.approvals.length === 0) {
        throw new Error('No pending approval found for this user');
      }

      const approval = workflowInstance.approvals[0];

      // Mettre à jour l'approbation
      await approval.update({
        status: 'rejected',
        comments,
        approvedAt: new Date()
      });

      // Rejeter le workflow entier
      await this.completeWorkflow(workflowInstance, 'rejected', comments);

      // Notifier du rejet
      await this.notifyWorkflowProgress(workflowInstance, 'rejected', approverId);

      logger.info('Workflow step rejected', {
        workflowInstanceId,
        approverId,
        comments
      });

      return workflowInstance;
    } catch (error) {
      logger.error('Error rejecting workflow step', { error: error.message });
      throw error;
    }
  }

  /**
   * Demander des modifications pour une étape
   */
  async requestChanges(workflowInstanceId, approverId, comments) {
    try {
      const workflowInstance = await this.models.WorkflowInstance.findByPk(workflowInstanceId, {
        include: [{
          model: this.models.WorkflowApproval,
          as: 'approvals',
          where: {
            approverId,
            status: 'pending'
          }
        }]
      });

      if (!workflowInstance) {
        throw new Error('Workflow instance not found');
      }

      if (workflowInstance.approvals.length === 0) {
        throw new Error('No pending approval found for this user');
      }

      const approval = workflowInstance.approvals[0];

      // Mettre à jour l'approbation
      await approval.update({
        status: 'requested_changes',
        comments,
        approvedAt: new Date()
      });

      // Remettre le workflow en attente
      await workflowInstance.update({
        status: 'pending',
        currentStep: 0
      });

      // Notifier de la demande de modifications
      await this.notifyWorkflowProgress(workflowInstance, 'requested_changes', approverId);

      logger.info('Workflow changes requested', {
        workflowInstanceId,
        approverId,
        comments
      });

      return workflowInstance;
    } catch (error) {
      logger.error('Error requesting workflow changes', { error: error.message });
      throw error;
    }
  }

  /**
   * Compléter un workflow
   */
  async completeWorkflow(workflowInstance, status, comments = null) {
    try {
      await workflowInstance.update({
        status,
        comments: comments || workflowInstance.comments
      });

      // Mettre à jour toutes les approbations restantes
      await this.models.WorkflowApproval.update(
        {
          status: status === 'approved' ? 'approved' : 'rejected',
          approvedAt: new Date()
        },
        {
          where: {
            workflowInstanceId: workflowInstance.id,
            status: 'pending'
          }
        }
      );

      // Notifier de la complétion
      await this.notifyWorkflowProgress(workflowInstance, status);

      logger.info('Workflow completed', {
        workflowInstanceId: workflowInstance.id,
        status,
        entityType: workflowInstance.entityType,
        entityId: workflowInstance.entityId
      });
    } catch (error) {
      logger.error('Error completing workflow', { error: error.message });
      throw error;
    }
  }

  /**
   * Approuver automatiquement un workflow
   */
  async autoApprove(workflowConfig, entityType, entityId, compagnieId, initiatorId, options) {
    try {
      const workflowInstance = await this.models.WorkflowInstance.create({
        workflowConfigId: workflowConfig.id,
        entityType,
        entityId,
        compagnieId,
        initiatorId,
        status: 'approved',
        currentStep: workflowConfig.steps.length,
        totalSteps: workflowConfig.steps.length,
        priority: options.priority || workflowConfig.priority,
        amount: options.amount,
        comments: 'Auto-approved: Amount below threshold',
        metadata: options.metadata || {}
      });

      logger.info('Workflow auto-approved', {
        workflowInstanceId: workflowInstance.id,
        entityType,
        entityId,
        amount: options.amount
      });

      return workflowInstance;
    } catch (error) {
      logger.error('Error auto-approving workflow', { error: error.message });
      throw error;
    }
  }

  /**
   * Notifier les approbateurs
   */
  async notifyApprovers(workflowInstance, step) {
    const notification = {
      type: 'workflow_update',
      data: {
        id: workflowInstance.id,
        entityType: workflowInstance.entityType,
        entityId: workflowInstance.entityId,
        currentStep: workflowInstance.currentStep,
        totalSteps: workflowInstance.totalSteps,
        status: workflowInstance.status,
        assignedTo: step.approverUserId,
        assignedToRole: step.approverRole,
        compagnieId: workflowInstance.compagnieId,
        deadline: workflowInstance.deadline,
        priority: workflowInstance.priority,
        stepName: step.name,
        stepDescription: step.description
      }
    };

    webSocketService.notifyWorkflowUpdate(notification.data);
  }

  /**
   * Notifier du progrès du workflow
   */
  async notifyWorkflowProgress(workflowInstance, action, approverId = null) {
    const notification = {
      type: 'workflow_progress',
      data: {
        workflowInstanceId: workflowInstance.id,
        entityType: workflowInstance.entityType,
        entityId: workflowInstance.entityId,
        status: workflowInstance.status,
        currentStep: workflowInstance.currentStep,
        totalSteps: workflowInstance.totalSteps,
        action,
        approverId,
        compagnieId: workflowInstance.compagnieId,
        timestamp: new Date().toISOString()
      }
    };

    webSocketService.notifyWorkflowUpdate(notification.data);
  }

  /**
   * Obtenir les workflows en attente pour un utilisateur
   */
  async getPendingWorkflows(userId, userRole, compagnieId) {
    try {
      const pendingApprovals = await this.models.WorkflowApproval.findAll({
        where: {
          approverId: userId,
          status: 'pending'
        },
        include: [{
          model: this.models.WorkflowInstance,
          as: 'workflowInstance',
          where: {
            compagnieId,
            status: ['pending', 'in_progress']
          },
          include: [{
            model: this.models.WorkflowConfig,
            as: 'workflowConfig'
          }]
        }]
      });

      return pendingApprovals.map(approval => ({
        id: approval.workflowInstance.id,
        entityType: approval.workflowInstance.entityType,
        entityId: approval.workflowInstance.entityId,
        currentStep: approval.workflowInstance.currentStep,
        totalSteps: approval.workflowInstance.totalSteps,
        priority: approval.workflowInstance.priority,
        deadline: approval.workflowInstance.deadline,
        amount: approval.workflowInstance.amount,
        workflowConfig: approval.workflowInstance.workflowConfig,
        approvalId: approval.id,
        stepName: approval.workflowStep?.name
      }));
    } catch (error) {
      logger.error('Error getting pending workflows', { error: error.message });
      throw error;
    }
  }

  /**
   * Obtenir l'historique des workflows pour une entité
   */
  async getWorkflowHistory(entityType, entityId, compagnieId) {
    try {
      const instances = await this.models.WorkflowInstance.findAll({
        where: {
          entityType,
          entityId,
          compagnieId
        },
        include: [{
          model: this.models.WorkflowApproval,
          as: 'approvals',
          include: [{
            model: this.models.WorkflowStep,
            as: 'workflowStep'
          }]
        }, {
          model: this.models.WorkflowConfig,
          as: 'workflowConfig'
        }],
        order: [['createdAt', 'DESC']]
      });

      return instances;
    } catch (error) {
      logger.error('Error getting workflow history', { error: error.message });
      throw error;
    }
  }
}

export default new WorkflowApprovalService();
