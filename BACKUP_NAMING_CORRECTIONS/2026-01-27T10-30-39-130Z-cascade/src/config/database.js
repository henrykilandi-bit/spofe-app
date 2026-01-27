// src/config/database.js - Connexion Sequelize avec logging avancé
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

/**
 * Configuration de base de données Sequelize
 * Supporte MySQL/MariaDB avec pool de connexions
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'spofeapp',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    
    // Logging SQL
    logging: (msg) => {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug(`[SQL] ${msg}`);
      }
    },
    
    // Configuration du pool de connexions
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || 10),
      min: parseInt(process.env.DB_POOL_MIN || 0),
      acquire: 30000,
      idle: 10000,
    },
    
    // Configuration par défaut des modèles
    define: {
      freezeTableName: true,      // Pas de pluralisation des noms de tables
      underscored: true,          // Colonnes en snake_case
      timestamps: true,           // createdAt, updatedAt automatiques
      paranoid: false,            // Soft delete désactivé par défaut
    },
    
    // Gestion des fuseaux horaires
    timezone: process.env.DB_TIMEZONE || '+00:00',
    
    // Options de dialecte MySQL/MariaDB
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
  }
);

/**
 * Hook pour logger les requêtes lentes
 */
sequelize.addHook('afterQuery', (options) => {
  const duration = options.duration || 0;
  if (duration > 500) {
    logger.warn(`[SLOW QUERY] ${duration}ms`);
  }
});

/**
 * Connexion à la base de données avec gestion d'erreur
 */
export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connexion à la base de données établie');
    
    // Synchronisation des modèles
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Modèles synchronisés');
    }
    
    return true;
  } catch (error) {
    logger.error(`❌ Erreur de connexion BD: ${error.message}`);
    throw error;
  }
};

/**
 * Déconnexion de la base de données
 */
export const disconnectDatabase = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Connexion fermée');
  } catch (error) {
    logger.error(`❌ Erreur de fermeture: ${error.message}`);
  }
};

/**
 * Vérification de santé de la base de données
 */
export const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    return {
      status: 'healthy',
      message: 'Connexion à la base de données OK',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Erreur de connexion: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default sequelize;
