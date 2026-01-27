import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration de dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  jwt: {
    secret: process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'votre_refresh_secret_tres_long_et_securise',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  db: {
    database: process.env.DB_NAME || 'SPOFEAPP',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'date_creation',
      updatedAt: 'date_modification'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  redis: {
    enabled: process.env.REDIS_ENABLED !== 'false',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0
  },
  backups: {
    enabled: process.env.BACKUPS_ENABLED !== 'false',
    intervalHours: parseInt(process.env.BACKUP_INTERVAL_HOURS || '24', 10)
  },
  rateLimit: {
    maxAttempts: process.env.RATE_LIMIT_MAX_ATTEMPTS || 5,
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 // 15 minutes en secondes
  },
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001'
};

export { config };
export default config;
