/**
 * Banking API Routes
 * SPOFE v2.1 - Routes pour l'intégration bancaire
 */

import express from 'express';
import logger from '../utils/logger.js';
import bankingApiService from '../services/banking-api.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * Obtenir les comptes bancaires
 */
router.get('/accounts/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;
    
    const accounts = await bankingApiService.getAccounts(bankId, req.user.compagnieId);

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Error getting bank accounts', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting bank accounts',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les transactions d'un compte
 */
router.get('/transactions/:bankId/:accountId', async (req, res) => {
  try {
    const { bankId, accountId } = req.params;
    const { fromDate, toDate, limit, offset } = req.query;

    const transactions = await bankingApiService.getTransactions(bankId, accountId, {
      fromDate,
      toDate,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    logger.error('Error getting bank transactions', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting bank transactions',
      httpStatusCode: 500
    });
  }
});

/**
 * Effectuer un rapprochement automatique
 */
router.post('/reconcile/:bankId/:accountId', async (req, res) => {
  try {
    const { bankId, accountId } = req.params;
    const { internalTransactions } = req.body;

    if (!internalTransactions || !Array.isArray(internalTransactions)) {
      return res.status(400).json({
        error: 'MISSING_TRANSACTIONS',
        message: 'Internal transactions array is required',
        httpStatusCode: 400
      });
    }

    const reconciliationResult = await bankingApiService.performReconciliation(
      bankId,
      accountId,
      internalTransactions
    );

    res.json({
      success: true,
      data: reconciliationResult
    });
  } catch (error) {
    logger.error('Error performing reconciliation', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error performing reconciliation',
      httpStatusCode: 500
    });
  }
});

/**
 * Synchroniser manuellement une banque
 */
router.post('/sync/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;

    const syncResult = await bankingApiService.syncBank(bankId, req.user.compagnieId);

    res.json({
      success: true,
      data: syncResult
    });
  } catch (error) {
    logger.error('Error syncing bank', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error syncing bank',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les statistiques des API bancaires
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = bankingApiService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting banking stats', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting banking stats',
      httpStatusCode: 500
    });
  }
});

/**
 * Gérer les webhooks entrants
 */
router.post('/webhooks/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;
    const signature = req.headers['x-signature'];
    
    if (!signature) {
      return res.status(400).json({
        error: 'MISSING_SIGNATURE',
        message: 'Webhook signature is required',
        httpStatusCode: 400
      });
    }

    const result = await bankingApiService.handleWebhook(bankId, req.body, signature);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error handling webhook', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error handling webhook',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir l'historique des synchronisations
 */
router.get('/sync-history/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;
    
    // Simuler l'historique des synchronisations
    const syncHistory = [
      {
        id: 'sync_1',
        bankId,
        syncedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        accountsCount: 5,
        transactionsCount: 156,
        errors: null
      },
      {
        id: 'sync_2',
        bankId,
        syncedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        accountsCount: 5,
        transactionsCount: 89,
        errors: null
      }
    ];

    res.json({
      success: true,
      data: syncHistory
    });
  } catch (error) {
    logger.error('Error getting sync history', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting sync history',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les rapprochements précédents
 */
router.get('/reconciliation-history/:bankId/:accountId', async (req, res) => {
  try {
    const { bankId, accountId } = req.params;
    
    // Simuler l'historique des rapprochements
    const reconciliationHistory = [
      {
        id: 'recon_1',
        bankId,
        accountId,
        performedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        matched: 142,
        unmatched: 14,
        accuracy: 91.0
      },
      {
        id: 'recon_2',
        bankId,
        accountId,
        performedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        matched: 98,
        unmatched: 23,
        accuracy: 81.0
      }
    ];

    res.json({
      success: true,
      data: reconciliationHistory
    });
  } catch (error) {
    logger.error('Error getting reconciliation history', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting reconciliation history',
      httpStatusCode: 500
    });
  }
});

/**
 * Configurer une nouvelle banque
 */
router.post('/banks', async (req, res) => {
  try {
    const bankConfig = {
      ...req.body,
      compagnieId: req.user.compagnieId,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    // Simuler la création de la configuration
    const createdBank = {
      id: `bank_${Date.now()}`,
      ...bankConfig,
      status: 'active',
      lastSync: null
    };

    res.status(201).json({
      success: true,
      data: createdBank
    });
  } catch (error) {
    logger.error('Error creating bank configuration', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error creating bank configuration',
      httpStatusCode: 500
    });
  }
});

/**
 * Mettre à jour la configuration d'une banque
 */
router.put('/banks/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;
    
    const updatedBank = {
      id: bankId,
      ...req.body,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };

    res.json({
      success: true,
      data: updatedBank
    });
  } catch (error) {
    logger.error('Error updating bank configuration', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating bank configuration',
      httpStatusCode: 500
    });
  }
});

/**
 * Supprimer une configuration bancaire
 */
router.delete('/banks/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;
    
    // Simuler la suppression
    logger.info('Bank configuration deleted', { bankId, deletedBy: req.user.id });

    res.json({
      success: true,
      message: 'Bank configuration deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting bank configuration', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting bank configuration',
      httpStatusCode: 500
    });
  }
});

/**
 * Tester la connexion à une banque
 */
router.post('/test-connection/:bankId', async (req, res) => {
  try {
    const { bankId } = req.params;
    
    // Simuler le test de connexion
    const testResult = {
      bankId,
      status: 'success',
      responseTime: 245,
      testedAt: new Date().toISOString(),
      features: ['accounts', 'transactions', 'reconciliation']
    };

    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    logger.error('Error testing bank connection', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error testing bank connection',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les banques configurées pour la compagnie
 */
router.get('/banks', async (req, res) => {
  try {
    // Simuler la récupération des banques configurées
    const banks = [
      {
        id: 'ecobank-senegal',
        name: 'Ecobank Sénégal',
        type: 'REST',
        status: 'active',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        features: ['accounts', 'transactions', 'payments', 'reconciliation'],
        accountsCount: 5
      },
      {
        id: 'uba-senegal',
        name: 'UBA Sénégal',
        type: 'REST',
        status: 'active',
        lastSync: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        features: ['accounts', 'transactions', 'reconciliation'],
        accountsCount: 3
      }
    ];

    res.json({
      success: true,
      data: banks
    });
  } catch (error) {
    logger.error('Error getting configured banks', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting configured banks',
      httpStatusCode: 500
    });
  }
});

export default router;
