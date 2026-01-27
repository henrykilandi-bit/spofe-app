/**
 * Access Logging Service
 * Journalise tous les accès et événements de sécurité
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../../logs');

// Créer le répertoire logs s'il n'existe pas
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Modèle pour les logs d'accès
 */
const AccessLog = sequelize.define('AccessLog', {
  id: {
    type: sequelize.Sequelize.DataTypes.UUID,
    defaultValue: sequelize.Sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: sequelize.Sequelize.DataTypes.UUID,
    allowNull: true
  },
  email: {
    type: sequelize.Sequelize.DataTypes.STRING,
    allowNull: true
  },
  action: {
    type: sequelize.Sequelize.DataTypes.ENUM(
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'PASSWORD_CHANGED',
      'PASSWORD_RESET',
      'EMAIL_VERIFIED',
      'API_CALL',
      'PERMISSION_DENIED',
      'SUSPICIOUS_ACTIVITY'
    ),
    allowNull: false
  },
  ipAddress: {
    type: sequelize.Sequelize.DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: sequelize.Sequelize.DataTypes.TEXT,
    allowNull: true
  },
  details: {
    type: sequelize.Sequelize.DataTypes.JSON,
    allowNull: true
  },
  severity: {
    type: sequelize.Sequelize.DataTypes.ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL'),
    defaultValue: 'INFO'
  },
  timestamp: {
    type: sequelize.Sequelize.DataTypes.DATE,
    defaultValue: sequelize.Sequelize.DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'access_logs'
});

/**
 * Enregistre un événement d'accès
 */
export const logAccess = async (logData) => {
  try {
    const {
      userId = null,
      email = null,
      action,
      ipAddress = null,
      userAgent = null,
      details = null,
      severity = 'INFO'
    } = logData;

    // Enregistrer en base de données
    await AccessLog.create({
      userId,
      email,
      action,
      ipAddress,
      userAgent,
      details,
      severity
    });

    // Écrire aussi dans un fichier pour redondance
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      email,
      userId,
      ipAddress,
      severity,
      details
    };

    const logFile = path.join(logsDir, 'access.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    // Alerte si critique
    if (severity === 'CRITICAL') {
      const alertFile = path.join(logsDir, 'alerts.log');
      fs.appendFileSync(alertFile, JSON.stringify(logEntry) + '\n');
    }

  } catch (error) {
    console.error('Error logging access:', error);
  }
};

/**
 * Récupère les logs d'accès
 */
export const getAccessLogs = async (filters = {}) => {
  try {
    const {
      userId = null,
      email = null,
      action = null,
      severity = null,
      limit = 100,
      offset = 0
    } = filters;

    const where = {};
    if (userId) where.userId = userId;
    if (email) where.email = email;
    if (action) where.action = action;
    if (severity) where.severity = severity;

    return await AccessLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

  } catch (error) {
    console.error('Error retrieving access logs:', error);
    throw error;
  }
};

/**
 * Récupère les logs pour un utilisateur
 */
export const getUserAccessLogs = async (userId, limit = 50) => {
  try {
    return await AccessLog.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit
    });
  } catch (error) {
    console.error('Error retrieving user access logs:', error);
    throw error;
  }
};

/**
 * Détecte les activités suspectes
 */
export const detectSuspiciousActivity = async (email) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Compter les tentatives de connexion échouées
    const failedAttempts = await AccessLog.count({
      where: {
        email,
        action: 'LOGIN_FAILED',
        timestamp: {
          [sequelize.Sequelize.Op.gte]: oneHourAgo
        }
      }
    });

    // Compter les accès depuis différentes IPs
    const uniqueIps = await AccessLog.findAll({
      attributes: [[
        sequelize.Sequelize.fn('DISTINCT', sequelize.Sequelize.col('ipAddress')),
        'ipAddress'
      ]],
      where: {
        email,
        timestamp: {
          [sequelize.Sequelize.Op.gte]: oneHourAgo
        }
      }
    });

    const suspicious = [];

    if (failedAttempts > 5) {
      suspicious.push({
        type: 'MULTIPLE_FAILED_LOGINS',
        count: failedAttempts
      });
    }

    if (uniqueIps.length > 3) {
      suspicious.push({
        type: 'MULTIPLE_IP_ADDRESSES',
        count: uniqueIps.length
      });
    }

    return {
      email,
      isSuspicious: suspicious.length > 0,
      indicators: suspicious
    };

  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return { isSuspicious: false, indicators: [] };
  }
};

/**
 * Nettoie les logs anciens
 */
export const cleanOldLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await AccessLog.destroy({
      where: {
        timestamp: {
          [sequelize.Sequelize.Op.lt]: cutoffDate
        }
      }
    });

    console.log(`Cleaned ${result} old access logs`);
    return result;

  } catch (error) {
    console.error('Error cleaning old logs:', error);
    throw error;
  }
};

export default {
  logAccess,
  getAccessLogs,
  getUserAccessLogs,
  detectSuspiciousActivity,
  cleanOldLogs,
  AccessLog
};
