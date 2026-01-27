/**
 * WebSocket Routes - API pour les notifications
 * SPOFE v2.1 - Routes WebSocket
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import webSocketService from '../services/websocket.service.js';

const router = express.Router();

/**
 * Générer un token WebSocket pour l'authentification
 */
router.post('/token', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'MISSING_USER_ID',
        message: 'User ID is required',
        httpStatusCode: 400
      });
    }

    // Générer un token WebSocket valide 24h
    const wsToken = jwt.sign(
      { 
        id: userId,
        type: 'websocket',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
      },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      data: {
        wsToken,
        wsUrl: `ws://localhost:3001/ws?token=${wsToken}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    logger.error('Error generating WebSocket token', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error generating WebSocket token',
      httpStatusCode: 500
    });
  }
});

/**
 * Envoyer une notification manuelle (pour tests/admin)
 */
router.post('/notify', async (req, res) => {
  try {
    const { type, data, target } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Type and data are required',
        httpStatusCode: 400
      });
    }

    let sentCount = 0;
    
    switch (type) {
      case 'accounting_validation':
        sentCount = webSocketService.notifyAccountingValidation(data);
        break;
      case 'workflow_update':
        webSocketService.notifyWorkflowUpdate(data);
        sentCount = 1;
        break;
      case 'banking_activity':
        webSocketService.notifyBankingActivity(data);
        sentCount = 1;
        break;
      default:
        return res.status(400).json({
          error: 'INVALID_TYPE',
          message: 'Invalid notification type',
          httpStatusCode: 400
        });
    }

    // Publier via Redis pour cross-serveur
    await webSocketService.publishNotification(type, data);

    res.json({
      success: true,
      data: {
        sentCount,
        type,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error sending notification', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error sending notification',
      httpStatusCode: 500
    });
  }
});

/**
 * Obtenir les statistiques des connexions WebSocket
 */
router.get('/stats', (req, res) => {
  try {
    const stats = webSocketService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting WebSocket stats', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting WebSocket stats',
      httpStatusCode: 500
    });
  }
});

/**
 * Envoyer une notification à un utilisateur spécifique
 */
router.post('/notify-user', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'User ID and message are required',
        httpStatusCode: 400
      });
    }

    const notification = {
      type: 'custom',
      message,
      timestamp: new Date().toISOString()
    };

    const sent = webSocketService.sendToUser(userId, notification);

    res.json({
      success: true,
      data: {
        sent,
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error sending user notification', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error sending user notification',
      httpStatusCode: 500
    });
  }
});

/**
 * Envoyer une notification à une room
 */
router.post('/notify-room', async (req, res) => {
  try {
    const { room, message, excludeUserId } = req.body;
    
    if (!room || !message) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Room and message are required',
        httpStatusCode: 400
      });
    }

    const notification = {
      type: 'room_broadcast',
      room,
      message,
      timestamp: new Date().toISOString()
    };

    const sentCount = webSocketService.sendToRoom(room, notification, excludeUserId);

    res.json({
      success: true,
      data: {
        sentCount,
        room,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error sending room notification', { error: error.message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error sending room notification',
      httpStatusCode: 500
    });
  }
});

export default router;
