/**
 * Workflow Approval Routes
 * SPOFE v2.1 - Routes pour le workflow d'approbation
 */

import express from 'express';
import logger from '../utils/logger.js';
import workflowApprovalService from '../services/workflow-approval.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * Créer une configuration de workflow
 */
router.post('/configs', async (req, res) => {
  try {
    const configData = {
      ...req.body,
      compagnieId: req.user.compagnieId
    };

    const workflowConfig = await workflowApprovalService.createWorkflowConfig(configData);

    res.status(201).json({
      success: true,
      data: workflowConfig
    });
  } catch (error) {
    logger.error('Error creating workflow config', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error creating workflow config',
      httpStatusCode: 500
    });
  }
});

/**
 * Démarrer un workflow pour une entité
 */
router.post('/start', async (req, res) => {
  try {
    const { entityType, entityId, amount, priority, comments, metadata } = req.body;

    if (!entityType || !entityId) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Entity type and entity ID are required',
        httpStatusCode: 400
      });
    }

    const workflowInstance = await workflowApprovalService.startWorkflow(
      entityType,
      entityId,
      req.user.compagnieId,
      req.user.id,
      { amount, priority, comments, metadata }
    );

    res.status(201).json({
      success: true,
      data: workflowInstance
    });
  } catch (error) {
    logger.error('Error starting workflow', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error starting workflow',
      httpStatusCode: 500
    });
  }
});

/**
 * Approuver une étape de workflow
 */
router.post('/:workflowInstanceId/approve', async (req, res) => {
  try {
    const { workflowInstanceId } = req.params;
    const { comments } = req.body;

    const workflowInstance = await workflowApprovalService.approveStep(
      workflowInstanceId,
      req.user.id,
      comments
    );

    res.json({
      success: true,
      data: workflowInstance
    });
  } catch (error) {
    logger.error('Error approving workflow step', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error approving workflow step',
      httpStatusCode: 500
    });
  }
});

/**
 * Rejeter une étape de workflow
 */
router.post('/:workflowInstanceId/reject', async (req, res) => {
  try {
    const { workflowInstanceId } = req.params;
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({
        error: 'MISSING_COMMENTS',
        message: 'Comments are required for rejection',
        httpStatusCode: 400
      });
    }

    const workflowInstance = await workflowApprovalService.rejectStep(
      workflowInstanceId,
      req.user.id,
      comments
    );

    res.json({
      success: true,
      data: workflowInstance
    });
  } catch (error) {
    logger.error('Error rejecting workflow step', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error rejecting workflow step',
      httpStatusCode: 500
    });
  }
});

/**
 * Demander des modifications pour une étape
 */
router.post('/:workflowInstanceId/request-changes', async (req, res) => {
  try {
    const { workflowInstanceId } = req.params;
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({
        error: 'MISSING_COMMENTS',
        message: 'Comments are required for change requests',
        httpStatusCode: 400
      });
    }

    const workflowInstance = await workflowApprovalService.requestChanges(
      workflowInstanceId,
      req.user.id,
      comments
    );

    res.json({
      success: true,
      data: workflowInstance
    });
  } catch (error) {
    logger.error('Error requesting workflow changes', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error requesting workflow changes',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les workflows en attente pour l'utilisateur
 */
router.get('/pending', async (req, res) => {
  try {
    const pendingWorkflows = await workflowApprovalService.getPendingWorkflows(
      req.user.id,
      req.user.role,
      req.user.compagnieId
    );

    res.json({
      success: true,
      data: pendingWorkflows
    });
  } catch (error) {
    logger.error('Error getting pending workflows', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting pending workflows',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir l'historique des workflows pour une entité
 */
router.get('/history/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const workflowHistory = await workflowApprovalService.getWorkflowHistory(
      entityType,
      entityId,
      req.user.compagnieId
    );

    res.json({
      success: true,
      data: workflowHistory
    });
  } catch (error) {
    logger.error('Error getting workflow history', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting workflow history',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les détails d'une instance de workflow
 */
router.get('/:workflowInstanceId', async (req, res) => {
  try {
    const { workflowInstanceId } = req.params;

    const workflowInstance = await workflowApprovalService.models.WorkflowInstance.findByPk(
      workflowInstanceId,
      {
        where: {
          compagnieId: req.user.compagnieId
        },
        include: [{
          model: workflowApprovalService.models.WorkflowApproval,
          as: 'approvals',
          include: [{
            model: workflowApprovalService.models.WorkflowStep,
            as: 'workflowStep'
          }]
        }, {
          model: workflowApprovalService.models.WorkflowConfig,
          as: 'workflowConfig',
          include: [{
            model: workflowApprovalService.models.WorkflowStep,
            as: 'steps',
            order: [['stepOrder', 'ASC']]
          }]
        }]
      }
    );

    if (!workflowInstance) {
      return res.status(404).json({
        error: 'WORKFLOW_NOT_FOUND',
        message: 'Workflow instance not found',
        httpStatusCode: 404
      });
    }

    res.json({
      success: true,
      data: workflowInstance
    });
  } catch (error) {
    logger.error('Error getting workflow instance', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting workflow instance',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir toutes les configurations de workflow pour la compagnie
 */
router.get('/configs', async (req, res) => {
  try {
    const workflowConfigs = await workflowApprovalService.models.WorkflowConfig.findAll({
      where: {
        compagnieId: req.user.compagnieId
      },
      include: [{
        model: workflowApprovalService.models.WorkflowStep,
        as: 'steps',
        order: [['stepOrder', 'ASC']]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: workflowConfigs
    });
  } catch (error) {
    logger.error('Error getting workflow configs', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting workflow configs',
      httpStatusCode: 500
    });
  }
});

/**
 * Mettre à jour une configuration de workflow
 */
router.put('/configs/:configId', async (req, res) => {
  try {
    const { configId } = req.params;

    const workflowConfig = await workflowApprovalService.models.WorkflowConfig.findByPk(configId);

    if (!workflowConfig) {
      return res.status(404).json({
        error: 'CONFIG_NOT_FOUND',
        message: 'Workflow config not found',
        httpStatusCode: 404
      });
    }

    // Vérifier que la configuration appartient à la compagnie
    if (workflowConfig.compagnieId !== req.user.compagnieId) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Access denied',
        httpStatusCode: 403
      });
    }

    await workflowConfig.update(req.body);

    res.json({
      success: true,
      data: workflowConfig
    });
  } catch (error) {
    logger.error('Error updating workflow config', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating workflow config',
      httpStatusCode: 500
    });
  }
});

/**
 * Activer/Désactiver une configuration de workflow
 */
router.patch('/configs/:configId/toggle', async (req, res) => {
  try {
    const { configId } = req.params;

    const workflowConfig = await workflowApprovalService.models.WorkflowConfig.findByPk(configId);

    if (!workflowConfig) {
      return res.status(404).json({
        error: 'CONFIG_NOT_FOUND',
        message: 'Workflow config not found',
        httpStatusCode: 404
      });
    }

    // Vérifier que la configuration appartient à la compagnie
    if (workflowConfig.compagnieId !== req.user.compagnieId) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Access denied',
        httpStatusCode: 403
      });
    }

    await workflowConfig.update({
      isActive: !workflowConfig.isActive
    });

    res.json({
      success: true,
      data: {
        id: workflowConfig.id,
        isActive: workflowConfig.isActive,
        message: `Workflow config ${workflowConfig.isActive ? 'activated' : 'deactivated'}`
      }
    });
  } catch (error) {
    logger.error('Error toggling workflow config', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error toggling workflow config',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les statistiques des workflows
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const { WorkflowInstance } = workflowApprovalService.models;

    const stats = await WorkflowInstance.findAll({
      where: {
        compagnieId: req.user.compagnieId
      },
      attributes: [
        'status',
        [WorkflowInstance.sequelize.fn('COUNT', WorkflowInstance.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const totalWorkflows = await WorkflowInstance.count({
      where: {
        compagnieId: req.user.compagnieId
      }
    });

    const pendingWorkflows = await WorkflowInstance.count({
      where: {
        compagnieId: req.user.compagnieId,
        status: ['pending', 'in_progress']
      }
    });

    const approvedWorkflows = await WorkflowInstance.count({
      where: {
        compagnieId: req.user.compagnieId,
        status: 'approved'
      }
    });

    res.json({
      success: true,
      data: {
        totalWorkflows,
        pendingWorkflows,
        approvedWorkflows,
        rejectedWorkflows: totalWorkflows - approvedWorkflows - pendingWorkflows,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    logger.error('Error getting workflow stats', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting workflow stats',
      httpStatusCode: 500
    });
  }
});

export default router;
