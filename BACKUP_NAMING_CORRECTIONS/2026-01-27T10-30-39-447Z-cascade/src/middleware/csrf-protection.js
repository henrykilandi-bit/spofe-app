/**
 * 🛡️ CSRF PROTECTION MIDDLEWARE - SPOFE v2.1
 *
 * Protection contre les attaques CSRF (Cross-Site Request Forgery)
 * Critique pour une application bancaire/comptable
 *
 * Double-Submit Cookie Pattern + Synchronizer Token Pattern
 * Utilise librairie moderne maintenue: csrf-csrf
 *
 * Status: ✅ Production-ready, non-destructif
 * Created: 2026-01-22
 */

import { doubleCsrf } from 'csrf-csrf';
import { randomBytes } from 'crypto';
import logger from '../utils/logger.js';

class CSRFProtection {
  constructor() {
    // Configuration robuste pour application bancaire/comptable
    this.config = {
      // 🔐 SECRETS CRYPTOGRAPHIQUES
      getSecret: () => {
        // Utiliser secret CSRF spécifique (différent du JWT)
        const secret = process.env.CSRF_SECRET;

        if (!secret) {
          logger.warn('⚠️  CSRF_SECRET non configuré dans .env');
          logger.warn('   Utilisation de fallback temporaire (NON SÉCURISÉ en production)');
          return this.generateCSRFSecret();
        }

        // Valider longueur secret (min 32 caractères)
        if (secret.length < 32) {
          logger.error('❌ CSRF_SECRET trop court (<32 chars)');
          throw new Error('CSRF_SECRET must be at least 32 characters');
        }

        return secret;
      },

      // 🍪 NOM DU COOKIE/TOKEN
      cookieName: process.env.CSRF_COOKIE_NAME || '__Host-csrf-token',
      headerName: 'x-csrf-token',

      // 🔒 CONFIGURATION COOKIE (Sécurité maximale)
      cookieOptions: {
        httpOnly: true, // Impossible d'accéder via JavaScript (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only en prod
        sameSite: 'strict', // Strict pour maximum sécurité (CSRF + Lax compatibility)
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 heures (1 jour)
        domain: this.getCookieDomain(),
        signed: true, // Signer le cookie pour détecter tampering
      },

      // HTTP METHODS À PROTÉGER
      methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE'],

      // ROUTES EXCLUES DE PROTECTION CSRF
      // Pour endpoints publics, webhooks, APIs stateless
      excludedRoutes: [
        '/health',
        '/health-check',
        '/api/health',
        '/api/status',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/refresh-token',
        '/webhooks/*', // Webhooks externes (Stripe, etc)
        '/public/*', // Fichiers statiques publics
        '/static/*',
        '/api/public/*',
      ],

      // TAILLE TOKEN
      size: 32, // 32 bytes = 256 bits (sécurité maximale)

      // ALGORITME HASH
      algorithm: 'sha256',
    };

    // Initialiser protection double CSRF
    try {
      this.csrfProtection = doubleCsrf(this.config);
      logger.info('✅ CSRF Protection initialisée avec succès');
    } catch (error) {
      logger.error('❌ Erreur initialisation CSRF:', error);
      throw error;
    }
  }

  /**
   * Générer un secret CSRF cryptographiquement fort
   * @returns {string} Secret 64 caractères (256 bits)
   */
  generateCSRFSecret() {
    const secret = randomBytes(32).toString('hex'); // 32 bytes = 64 hex chars
    logger.warn('⚠️  CSRF_SECRET auto-généré. Configuration requise.');
    logger.warn(`   Ajoutez ceci à .env: CSRF_SECRET=${secret}`);
    return secret;
  }

  /**
   * Déterminer le domaine du cookie en fonction de l'environnement
   * @returns {string|undefined} Domaine ou undefined
   */
  getCookieDomain() {
    if (process.env.NODE_ENV === 'production') {
      // En production, utiliser domaine configuré ou undefined (domaine courant)
      return process.env.CSRF_COOKIE_DOMAIN || undefined;
    }
    // En dev/test, ne pas spécifier de domaine
    return undefined;
  }

  /**
   * MIDDLEWARE PRINCIPAL - Appliquer protection CSRF
   * @returns {Function} Express middleware
   */
  middleware() {
    const { doubleCsrfProtection } = this.csrfProtection;

    return (req, res, next) => {
      // ✓ ÉTAPE 1: Vérifier si route exclue
      if (this.isExcludedRoute(req.path)) {
        logger.debug('CSRF: Route exclue', { path: req.path });
        return next();
      }

      // ✓ ÉTAPE 2: Vérifier si méthode nécessite protection
      if (!this.config.methodsToProtect.includes(req.method)) {
        // GET, HEAD, OPTIONS - pas de protection CSRF (safe methods)
        return next();
      }

      // ✓ ÉTAPE 3: Appliquer protection CSRF
      // Pour API avec JWT, vérifier si action sensible
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // JWT Authentication - vérifier si action sensible
        if (!this.isSensitiveAction(req)) {
          // Action non sensible avec JWT - pas de CSRF requis
          logger.debug('CSRF: Action non-sensible, JWT OK', {
            path: req.path,
            method: req.method,
          });
          return next();
        }
        // Action sensible - appliquer CSRF même avec JWT
        logger.debug('CSRF: Action sensible, vérification CSRF même avec JWT', {
          path: req.path,
          userId: req.user?.id,
        });
      }

      // ✓ ÉTAPE 4: Vérifier protection CSRF
      return doubleCsrfProtection(req, res, (err) => {
        if (err) {
          // Erreur CSRF - gérer dans error handler
          logger.warn('CSRF_PROTECTION_ERROR', {
            error: err.message,
            ip: req.ip,
            path: req.path,
            method: req.method,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
          });
          return next(err);
        }
        next();
      });
    };
  }

  /**
   * Vérifier si une route est exclue de protection CSRF
   * @param {string} path - Chemin de la requête
   * @returns {boolean}
   */
  isExcludedRoute(path) {
    return this.config.excludedRoutes.some((pattern) => {
      // Pattern avec wildcard (ex: /webhooks/*)
      if (pattern.includes('*')) {
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
        return regex.test(path);
      }
      // Correspondance exacte
      return path === pattern;
    });
  }

  /**
   * Vérifier si c'est une action sensible nécessitant CSRF même avec JWT
   * Actions bancaires/comptables critiques
   * @param {Object} req - Request object
   * @returns {boolean}
   */
  isSensitiveAction(req) {
    // Chemins sensibles
    const sensitivePaths = [
      '/api/transactions', // Transactions financières
      '/api/journal-entries', // Écritures comptables
      '/api/account/transfer', // Virements
      '/api/users/role', // Modification permissions
      '/api/compagnies/delete', // Suppression données
      '/api/settings/security', // Paramètres sécurité
      '/api/audit-logs', // Logs audit
      '/api/reconciliation', // Rapprochements
      '/api/accounts/delete', // Suppression comptes
      '/api/batches/approve', // Approbation lots
      '/api/reconciliation/approve', // Approbation rapprochements
    ];

    // Méthodes sensibles
    const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    // Vérifier si le chemin commence par un path sensible
    const isPathSensitive = sensitivePaths.some((path) => req.path.startsWith(path));

    // Vérifier si méthode sensible
    const isMethodSensitive = sensitiveMethods.includes(req.method);

    return isPathSensitive && isMethodSensitive;
  }

  /**
   * ROUTE PUBLIQUE - Obtenir token CSRF
   * Accessible à tous (authentifiés ou non)
   * @returns {Function} Express route handler
   */
  getTokenRoute() {
    return (req, res) => {
      try {
        // Générer un nouveau token CSRF
        const token = this.csrfProtection.generateToken(req, res);

        // Retourner token + métadonnées
        res.json({
          success: true,
          csrfToken: token,
          meta: {
            headerName: this.config.headerName,
            cookieName: this.config.cookieName,
            expiresIn: this.config.cookieOptions.maxAge / 1000, // en secondes
            timestamp: new Date().toISOString(),
            algorithm: this.config.algorithm,
          },
        });

        // Log pour audit (sans token pour sécurité)
        logger.debug('CSRF token généré', {
          userId: req.user?.id || 'anonymous',
          ip: req.ip,
          userAgent: req.get('User-Agent')?.substring(0, 50),
        });
      } catch (error) {
        logger.error('Erreur génération CSRF token', {
          error: error.message,
          stack: error.stack,
        });

        res.status(500).json({
          success: false,
          error: 'CSRF_TOKEN_GENERATION_FAILED',
          message: 'Impossible de générer le token de sécurité',
        });
      }
    };
  }

  /**
   * MIDDLEWARE - Injecter token dans réponse
   * Pour les vues/templates (si applicable)
   * @returns {Function} Express middleware
   */
  injectToken() {
    return (req, res, next) => {
      try {
        // Injecter token dans res.locals pour les templates
        res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';

        // Ajouter header pour les APIs (facilite accès côté client)
        if (req.xhr || req.path.startsWith('/api/')) {
          res.set('X-CSRF-Token', res.locals.csrfToken || '');
          res.set('X-CSRF-Cookie-Name', this.config.cookieName);
        }

        next();
      } catch (error) {
        logger.error('Erreur injection CSRF token', { error: error.message });
        next(error);
      }
    };
  }

  /**
   * Vérifier manuellement la validité d'un token CSRF
   * Utile pour validations custom
   * @param {Object} req - Request object
   * @param {string} token - Token à vérifier
   * @returns {boolean} Token valide?
   */
  verifyToken(req, token) {
    try {
      const isValid = this.csrfProtection.verifyToken(token, req);

      if (!isValid) {
        logger.warn('CSRF token invalide', {
          ip: req.ip,
          path: req.path,
          userId: req.user?.id,
        });
      }

      return isValid;
    } catch (error) {
      logger.warn('Erreur vérification CSRF token', {
        error: error.message,
        ip: req.ip,
        path: req.path,
      });
      return false;
    }
  }

  /**
   * Obtenir statut de la protection CSRF
   * @returns {Object} Informations de configuration
   */
  getStatus() {
    return {
      enabled: true,
      provider: 'csrf-csrf',
      version: '1.0.0',
      algorithm: this.config.algorithm,
      tokenSize: this.config.size,
      cookieOptions: {
        httpOnly: this.config.cookieOptions.httpOnly,
        secure: this.config.cookieOptions.secure,
        sameSite: this.config.cookieOptions.sameSite,
        maxAge: this.config.cookieOptions.maxAge,
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Configuration CSRF pour logs/audit
   * @returns {Object} Configuration safeToLog
   */
  getConfiguration() {
    return {
      cookieName: this.config.cookieName,
      headerName: this.config.headerName,
      methodsProtected: this.config.methodsToProtect,
      excludedRoutesCount: this.config.excludedRoutes.length,
      secureMode: process.env.NODE_ENV === 'production',
      tokenExpiry: '24 hours',
      algorithm: this.config.algorithm,
      environment: process.env.NODE_ENV,
    };
  }
}

// 🔐 SINGLETON - Une seule instance pour toute l'application
const csrfProtection = new CSRFProtection();

export default csrfProtection;
export { CSRFProtection };
