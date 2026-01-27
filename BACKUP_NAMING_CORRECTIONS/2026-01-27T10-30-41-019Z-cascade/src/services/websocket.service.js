/**
 * WebSocket Service - Notifications en temps réel
 * SPOFE v2.1 - Notifications comptables et validations
 */

import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import redis from '../config/redis.js';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
    this.rooms = new Map(); // room -> Set of userIds
    this.redisSubscriber = null;
  }

  /**
   * Initialiser le serveur WebSocket
   */
  initialize(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: process.env.WEBSOCKET_PATH || '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupRedisSubscriber();
    
    logger.info('WebSocket server initialized', {
      path: '/ws',
      port: server.address().port
    });
  }

  /**
   * Vérifier l'authentification du client WebSocket
   */
  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        logger.warn('WebSocket connection rejected: No token');
        return false;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      info.req.user = decoded;
      
      return true;
    } catch (error) {
      logger.warn('WebSocket connection rejected: Invalid token', { error: error.message });
      return false;
    }
  }

  /**
   * Gérer la connexion d'un client
   */
  handleConnection(ws, req) {
    const user = req.user;
    const userId = user.id;
    const userRole = user.role;
    const compagnieId = user.compagnieId;

    logger.info('WebSocket client connected', { userId, userRole, compagnieId });

    // Stocker la connexion
    this.clients.set(userId, ws);
    
    // Rejoindre les rooms par défaut
    this.joinRoom(userId, `user:${userId}`);
    this.joinRoom(userId, `role:${userRole}`);
    this.joinRoom(userId, `compagnie:${compagnieId}`);
    this.joinRoom(userId, 'accounting:validations');

    // Envoyer message de bienvenue
    this.sendToUser(userId, {
      type: 'connection',
      message: 'Connecté aux notifications en temps réel',
      timestamp: new Date().toISOString()
    });

    // Gérer les messages du client
    ws.on('message', (data) => this.handleMessage(userId, data));
    
    // Gérer la déconnexion
    ws.on('close', () => this.handleDisconnection(userId));
    
    // Gérer les erreurs
    ws.on('error', (error) => {
      logger.error('WebSocket error', { userId, error: error.message });
    });
  }

  /**
   * Gérer les messages reçus du client
   */
  handleMessage(userId, data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'join_room':
          this.joinRoom(userId, message.room);
          break;
        case 'leave_room':
          this.leaveRoom(userId, message.room);
          break;
        case 'ping':
          this.sendToUser(userId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        default:
          logger.warn('Unknown WebSocket message type', { userId, type: message.type });
      }
    } catch (error) {
      logger.error('Error parsing WebSocket message', { userId, error: error.message });
    }
  }

  /**
   * Gérer la déconnexion d'un client
   */
  handleDisconnection(userId) {
    logger.info('WebSocket client disconnected', { userId });
    
    // Quitter toutes les rooms
    for (const [room, members] of this.rooms) {
      members.delete(userId);
      if (members.size === 0) {
        this.rooms.delete(room);
      }
    }
    
    // Supprimer la connexion
    this.clients.delete(userId);
  }

  /**
   * Rejoindre une room
   */
  joinRoom(userId, room) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(userId);
    
    logger.debug('User joined room', { userId, room });
    
    // Notifier l'utilisateur
    this.sendToUser(userId, {
      type: 'room_joined',
      room,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Quitter une room
   */
  leaveRoom(userId, room) {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(userId);
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      }
    }
    
    logger.debug('User left room', { userId, room });
    
    // Notifier l'utilisateur
    this.sendToUser(userId, {
      type: 'room_left',
      room,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoyer un message à un utilisateur spécifique
   */
  sendToUser(userId, message) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Envoyer un message à tous les membres d'une room
   */
  sendToRoom(room, message, excludeUserId = null) {
    const members = this.rooms.get(room);
    if (!members) return 0;

    let sentCount = 0;
    for (const userId of members) {
      if (userId !== excludeUserId) {
        if (this.sendToUser(userId, message)) {
          sentCount++;
        }
      }
    }
    
    return sentCount;
  }

  /**
   * Notifier une validation comptable
   */
  notifyAccountingValidation(validationData) {
    const notification = {
      type: 'accounting_validation',
      data: {
        id: validationData.id,
        type: validationData.type, // 'ecriture', 'balance', 'rapport'
        status: validationData.status, // 'pending', 'approved', 'rejected'
        amount: validationData.amount,
        reference: validationData.reference,
        validatedBy: validationData.validatedBy,
        validatedAt: validationData.validatedAt,
        compagnieId: validationData.compagnieId,
        comments: validationData.comments
      },
      timestamp: new Date().toISOString()
    };

    // Envoyer à la room des validations comptables
    const sentCount = this.sendToRoom('accounting:validations', notification);
    
    // Envoyer spécifiquement à la compagnie
    this.sendToRoom(`compagnie:${validationData.compagnieId}`, notification);
    
    // Envier aux validateurs (rôles appropriés)
    this.sendToRoom('role:COMPTABLE', notification);
    this.sendToRoom('role:ADMIN', notification);

    logger.info('Accounting validation notification sent', {
      validationId: validationData.id,
      sentCount,
      type: validationData.type,
      status: validationData.status
    });

    return sentCount;
  }

  /**
   * Notifier un workflow d'approbation
   */
  notifyWorkflowUpdate(workflowData) {
    const notification = {
      type: 'workflow_update',
      data: {
        id: workflowData.id,
        entityType: workflowData.entityType, // 'ecriture', 'facture', 'paiement'
        entityId: workflowData.entityId,
        currentStep: workflowData.currentStep,
        totalSteps: workflowData.totalSteps,
        status: workflowData.status, // 'pending', 'approved', 'rejected'
        assignedTo: workflowData.assignedTo,
        assignedToRole: workflowData.assignedToRole,
        compagnieId: workflowData.compagnieId,
        deadline: workflowData.deadline,
        priority: workflowData.priority
      },
      timestamp: new Date().toISOString()
    };

    // Envoyer à l'utilisateur assigné
    if (workflowData.assignedTo) {
      this.sendToUser(workflowData.assignedTo, notification);
    }
    
    // Envoyer au rôle assigné
    if (workflowData.assignedToRole) {
      this.sendToRoom(`role:${workflowData.assignedToRole}`, notification);
    }
    
    // Envoyer à la compagnie
    this.sendToRoom(`compagnie:${workflowData.compagnieId}`, notification);

    logger.info('Workflow update notification sent', {
      workflowId: workflowData.id,
      entityType: workflowData.entityType,
      currentStep: workflowData.currentStep,
      status: workflowData.status
    });
  }

  /**
   * Notifier une activité bancaire
   */
  notifyBankingActivity(bankingData) {
    const notification = {
      type: 'banking_activity',
      data: {
        id: bankingData.id,
        type: bankingData.type, // 'reconciliation', 'transaction', 'sync'
        status: bankingData.status,
        bankAccount: bankingData.bankAccount,
        amount: bankingData.amount,
        reference: bankingData.reference,
        compagnieId: bankingData.compagnieId,
        processedAt: bankingData.processedAt,
        errors: bankingData.errors
      },
      timestamp: new Date().toISOString()
    };

    // Envoyer aux rôles financiers
    this.sendToRoom('role:COMPTABLE', notification);
    this.sendToRoom('role:ADMIN', notification);
    this.sendToRoom('role:FINANCIER', notification);
    
    // Envoyer à la compagnie
    this.sendToRoom(`compagnie:${bankingData.compagnieId}`, notification);

    logger.info('Banking activity notification sent', {
      bankingId: bankingData.id,
      type: bankingData.type,
      status: bankingData.status
    });
  }

  /**
   * Configurer le subscriber Redis pour les notifications cross-serveur
   */
  setupRedisSubscriber() {
    this.redisSubscriber = redis.duplicate();
    
    this.redisSubscriber.subscribe('notifications');
    
    this.redisSubscriber.on('message', (channel, message) => {
      try {
        const notification = JSON.parse(message);
        
        // Diffuser la notification aux clients WebSocket
        switch (notification.type) {
          case 'accounting_validation':
            this.notifyAccountingValidation(notification.data);
            break;
          case 'workflow_update':
            this.notifyWorkflowUpdate(notification.data);
            break;
          case 'banking_activity':
            this.notifyBankingActivity(notification.data);
            break;
        }
      } catch (error) {
        logger.error('Error processing Redis notification', { error: error.message });
      }
    });
  }

  /**
   * Publier une notification via Redis (pour cross-serveur)
   */
  async publishNotification(type, data) {
    try {
      const notification = { type, data };
      await redis.publish('notifications', JSON.stringify(notification));
      
      logger.debug('Notification published via Redis', { type });
    } catch (error) {
      logger.error('Error publishing notification', { type, error: error.message });
    }
  }

  /**
   * Obtenir les statistiques des connexions
   */
  getStats() {
    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      roomMembers: Object.fromEntries(
        Array.from(this.rooms.entries()).map(([room, members]) => [
          room,
          members.size
        ])
      )
    };
  }

  /**
   * Fermer toutes les connexions
   */
  close() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.redisSubscriber) {
      this.redisSubscriber.quit();
    }
    this.clients.clear();
    this.rooms.clear();
  }
}

export default new WebSocketService();
