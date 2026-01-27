// Dynamic CORS configuration with environment-based whitelisting
import logger from '../utils/logger.js';

/**
 * Allowed origins by environment
 */
const allowedOrigins = {
  development: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  production: process.env.CORS_WHITELIST?.split(',') || ['https://spofe.com']
};

/**
 * CORS configuration object
 */
export default {
  /**
   * Dynamic origin validation
   * @param {string} origin - Request origin
   * @param {Function} callback - CORS callback
   */
  origin: (origin, callback) => {
    const env = process.env.NODE_ENV || 'development';
    const allowed = allowedOrigins[env];
    
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`🚫 CORS bloqué : ${origin}`, {
        env,
        allowedOrigins: allowed
      });
      callback(new Error(`Origin ${origin} non autorisée par CORS`));
    }
  },
  
  // Credentials (cookies, authorization headers)
  credentials: true,
  
  // Preflight cache duration (24h)
  maxAge: 86400,
  
  // Successful OPTIONS status
  optionsSuccessStatus: 200,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};
