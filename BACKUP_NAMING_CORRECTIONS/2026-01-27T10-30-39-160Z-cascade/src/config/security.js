import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cors from 'cors';
import securityConfig from './security.config.js';
import { validateSecurityConfig } from './security.schema.js';
import logger from '../utils/logger.js';
import { User } from '../models/index.js';

// Valider la configuration au démarrage
try {
  validateSecurityConfig(securityConfig);
  logger.info('Configuration de sécurité validée avec succès');
} catch (error) {
  logger.error(error.message);
  process.exit(1);
}

/**
 * Initialise les middlewares de sécurité pour l'application Express
 * @param {import('express').Application} app - Instance d'application Express
 * @returns {void}
 */
function setupSecurity(app) {
  // 1. Headers de sécurité avec Helmet
  app.use(helmet(securityConfig.headers));
  
  // 2. Rate limiting pour les routes d'authentification
  const loginLimiter = rateLimit({
    ...securityConfig.rateLimiting.login,
    handler: (req, res) => {
      logger.warn(`Tentative de connexion bloquée par le rate limiting: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: securityConfig.rateLimiting.login.message
      });
    }
  });

  // 3. Ralentissement progressif pour les échecs de connexion
  const loginSlowDown = slowDown({
    windowMs: securityConfig.accountLocking.bruteForce.minWait,
    delayAfter: securityConfig.accountLocking.freeRetries,
    delayMs: (used) => used * 1000, // Augmentation progressive du délai
    skip: (req) => {
      // Ne pas ralentir les requêtes réussies
      return req.path.includes('health') || req.method !== 'POST';
    }
  });

  // 4. Configuration CORS
  app.use(cors(securityConfig.cors));

  // 5. Middleware pour les en-têtes de sécurité personnalisés
  app.use((req, res, next) => {
    // Protection contre le clickjacking
    res.header('X-Frame-Options', 'DENY');
    
    // Protection contre le MIME-sniffing
    res.header('X-Content-Type-Options', 'nosniff');
    
    // Politique de référent
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Politique de permissions
    res.header('Permissions-Policy', [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()'
    ].join(', '));
    
    next();
  });

  // 6. Middleware de journalisation des requêtes
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
      
      // Journalisation des erreurs
      if (res.statusCode >= 400) {
        logger.warn({
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          userId: req.user?.id || 'anonymous'
        }, 'Requête avec erreur');
      }
    });
    
    next();
  });

  return {
    // Exposer les middlewares pour une utilisation spécifique
    loginLimiter,
    loginSlowDown
  };
}

export { setupSecurity };
export default setupSecurity;
