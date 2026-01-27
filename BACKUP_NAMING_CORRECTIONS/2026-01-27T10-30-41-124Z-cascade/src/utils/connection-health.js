import sequelize from '../config/database.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

// ===============================================
// CONNECTION HEALTH UTILITIES
// ===============================================

/**
 * Utilitaires centralisés pour la surveillance de la santé de connexion
 * Regroupe toutes les fonctions de diagnostic et réparation
 */

class ConnectionHealthMonitor {
  constructor() {
    this.lastCheck = null;
    this.status = {
      backend: 'unknown',
      database: 'unknown',
      auth: 'unknown',
      overall: 'unknown'
    };
  }

  /**
   * Vérifier la santé du backend
   */
  async checkBackendHealth() {
    try {
      const startTime = Date.now();
      
      // Test de connexion à la base de données via Sequelize
      await sequelize.authenticate();
      
      const responseTime = Date.now() - startTime;
      
      // Vérifier qu'un utilisateur admin existe
      const adminUser = await User.findOne({
        where: { email: 'admin@spofe.local' }
      });

      this.status.backend = 'success';
      this.lastCheck = new Date().toISOString();

      return {
        status: 'success',
        responseTime: `${responseTime}ms`,
        database: 'connected',
        adminUserExists: !!adminUser,
        timestamp: this.lastCheck
      };
    } catch (error) {
      this.status.backend = 'error';
      this.lastCheck = new Date().toISOString();

      logger.logError('Backend health check failed', {
        error: error.message,
        timestamp: this.lastCheck
      });

      return {
        status: 'error',
        error: error.message,
        timestamp: this.lastCheck
      };
    }
  }

  /**
   * Vérifier la validité du token JWT
   */
  async checkTokenValidity(token) {
    if (!token) {
      this.status.auth = 'no_token';
      return {
        status: 'no_token',
        message: 'Aucun token fourni'
      };
    }

    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config/config.js');
      
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Vérifier que l'utilisateur existe toujours
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.isActive) {
        this.status.auth = 'invalid';
        return {
          status: 'invalid',
          message: 'Token invalide ou utilisateur inactif'
        };
      }

      this.status.auth = 'valid';
      return {
        status: 'valid',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      };
    } catch (error) {
      this.status.auth = 'invalid';
      return {
        status: 'invalid',
        error: error.message,
        message: 'Token expiré ou invalide'
      };
    }
  }

  /**
   * Vérifier la connexion à la base de données
   */
  async checkDatabaseConnection() {
    try {
      const startTime = Date.now();
      
      // Test d'authentification Sequelize
      await sequelize.authenticate();
      
      const connectionTime = Date.now() - startTime;
      
      // Obtenir des informations sur le pool de connexions
      const poolInfo = sequelize.connectionManager.pool;
      
      this.status.database = 'connected';

      return {
        status: 'connected',
        connectionTime: `${connectionTime}ms`,
        poolSize: poolInfo?.used || 'N/A',
        maxPoolSize: poolInfo?.max || 'N/A',
        dialect: sequelize.getDialect(),
        database: sequelize.config.database,
        host: sequelize.config.host
      };
    } catch (error) {
      this.status.database = 'disconnected';
      
      logger.logError('Database connection check failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return {
        status: 'disconnected',
        error: error.message,
        message: 'Base de données inaccessible'
      };
    }
  }

  /**
   * Test complet du flux de connexion
   */
  async runFullConnectionTest(token = null) {
    const timestamp = new Date().toISOString();
    const results = [];

    try {
      logger.logInfo('Starting full connection health test', { timestamp });

      // Test 1: Santé backend
      const backendResult = await this.checkBackendHealth();
      results.push({
        test: 'Backend Health',
        status: backendResult.status,
        details: backendResult,
        timestamp
      });

      // Test 2: Validité token (si fourni)
      if (token) {
        const tokenResult = await this.checkTokenValidity(token);
        results.push({
          test: 'Token Validity',
          status: tokenResult.status,
          details: tokenResult,
          timestamp
        });
      }

      // Test 3: Connexion base de données
      const dbResult = await this.checkDatabaseConnection();
      results.push({
        test: 'Database Connection',
        status: dbResult.status,
        details: dbResult,
        timestamp
      });

      // Calculer le statut global
      const successCount = results.filter(r => 
        r.status === 'success' || r.status === 'valid' || r.status === 'connected'
      ).length;
      
      this.status.overall = successCount === results.length ? 'healthy' : 'degraded';

      logger.logInfo('Full connection test completed', {
        overall: this.status.overall,
        tests: results.length,
        success: successCount,
        timestamp
      });

      return {
        status: this.status.overall,
        tests: results,
        summary: {
          total: results.length,
          success: successCount,
          failed: results.length - successCount,
          timestamp
        }
      };

    } catch (error) {
      logger.logError('Full connection test failed', {
        error: error.message,
        timestamp
      });

      return {
        status: 'error',
        error: error.message,
        timestamp
      };
    }
  }

  /**
   * Générer un rapport de santé
   */
  generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.status,
      lastCheck: this.lastCheck,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    };

    logger.logInfo('Health report generated', report);
    return report;
  }

  /**
   * Tenter de réparer les problèmes courants
   */
  async attemptAutoFix() {
    const fixes = [];

    try {
      // Réparation 1: Créer utilisateur admin si inexistant
      const adminUser = await User.findOne({
        where: { email: 'admin@spofe.local' }
      });

      if (!adminUser) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        
        await User.create({
          username: 'admin',
          email: 'admin@spofe.local',
          password: hashedPassword,
          role: 'admin',
          isActive: true
        });

        fixes.push({
          issue: 'Admin user missing',
          action: 'Created admin user',
          status: 'fixed'
        });

        logger.logInfo('Admin user created successfully');
      }

      // Réparation 2: Vérifier les variables d'environnement
      const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER'];
      const missingEnvVars = [];

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          missingEnvVars.push(envVar);
        }
      }

      if (missingEnvVars.length > 0) {
        fixes.push({
          issue: 'Missing environment variables',
          action: `Variables manquantes: ${missingEnvVars.join(', ')}`,
          status: 'requires_attention'
        });
      }

      // Réparation 3: Tester la connexion à la base de données
      try {
        await sequelize.authenticate();
        fixes.push({
          issue: 'Database connection',
          action: 'Connection successful',
          status: 'verified'
        });
      } catch (error) {
        fixes.push({
          issue: 'Database connection',
          action: `Connection failed: ${error.message}`,
          status: 'failed'
        });
      }

      return {
        status: 'completed',
        fixes,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.logError('Auto-fix attempt failed', {
        error: error.message
      });

      return {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtenir le statut actuel
   */
  getStatus() {
    return {
      ...this.status,
      lastCheck: this.lastCheck,
      timestamp: new Date().toISOString()
    };
  }
}

export default ConnectionHealthMonitor;
