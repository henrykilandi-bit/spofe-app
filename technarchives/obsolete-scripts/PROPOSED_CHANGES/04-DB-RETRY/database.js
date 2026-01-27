// Enhanced database configuration with retry logic
import { Sequelize } from 'sequelize';
import logger from '../utils/logger.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Connexion avec retry automatique et backoff exponentiel
 * @param {Sequelize} sequelize - Instance Sequelize
 * @param {number} maxRetries - Nombre maximal de tentatives
 */
const connectWithRetry = async (sequelize, maxRetries = 5) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info('✅ Connexion DB établie');
      return;
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
      logger.error(`❌ Tentative ${attempt}/${maxRetries} échouée. Retry dans ${delay}ms`, {
        error: error.message,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
      });
      
      if (attempt === maxRetries) {
        logger.error('🔥 Impossible de se connecter à la DB après plusieurs tentatives');
        logger.error('Vérifiez: DB_HOST, DB_USER, DB_PASSWORD, MySQL démarré');
        process.exit(1);
      }
      
      await sleep(delay);
    }
  }
};

/**
 * Instance Sequelize avec configuration production-ready
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    
    // Pool de connexions optimisé
    pool: {
      max: 10,                // Max 10 connexions simultanées
      min: 2,                 // Minimum 2 connexions ouvertes
      acquire: 30000,         // Timeout acquisition: 30s
      idle: 10000,            // Ferme connexion après 10s inactivité
      evict: 10000            // Vérifie connexions mortes toutes les 10s
    },
    
    // Logging
    logging: (msg) => logger.debug(msg),
    benchmark: true,
    
    // Timezone
    timezone: '+00:00',
    
    // Options MySQL spécifiques
    dialectOptions: {
      connectTimeout: 10000,  // Timeout connexion: 10s
      
      // Support MySQL 8+ authentication
      authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password
      }
    },
    
    // Retry automatique sur certaines erreurs
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /EHOSTUNREACH/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/
      ]
    }
  }
);

/**
 * Health check de la database pour monitoring
 * @returns {Promise<Object>} Status de santé de la DB
 */
export const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    return {
      status: 'healthy',
      timestamp: new Date(),
      message: 'Database connection OK'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    };
  }
};

// Initialisation avec retry au démarrage
await connectWithRetry(sequelize);

export { sequelize };
