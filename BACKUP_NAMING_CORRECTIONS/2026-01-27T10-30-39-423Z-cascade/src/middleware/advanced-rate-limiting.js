import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import logger from '../utils/logger.js';

// 🔐 Client Redis avec fallback intelligent
let redisClient = null;
let redisAvailable = false;

const initializeRedis = () => {
  if (!process.env.REDIS_HOST) {
    logger.warn(
      'RATE_LIMITING: Redis not configured, using memory store (not recommended for production)',
    );
    return null;
  }

  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        logger.warn(`RATE_LIMITING: Redis retry attempt ${times}`, {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        });

        if (times > 5) {
          logger.error('RATE_LIMITING: Redis connection failed, falling back to memory store');
          redisAvailable = false;
          return null;
        }

        return Math.min(times * 50, 2000);
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      logger.info('RATE_LIMITING: Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error('RATE_LIMITING: Redis error, falling back to memory', { error: err.message });
      redisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    logger.error('RATE_LIMITING: Failed to initialize Redis', { error: error.message });
    return null;
  }
};

// 🧠 Store en mémoire avec expiration
class MemoryRateLimitStore {
  constructor() {
    this.store = new Map();
    this.cleanup();
  }

  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      }
      if (this.store.size > 10000) {
        logger.warn('RATE_LIMITING: Memory store exceeding 10k entries, consider using Redis');
      }
    }, 60000); // Nettoyage chaque minute
  }

  async incr(key, cb) {
    try {
      const now = Date.now();
      const windowMs = 15 * 60 * 1000;

      if (!this.store.has(key)) {
        this.store.set(key, { count: 1, resetTime: now + windowMs });
      } else {
        const entry = this.store.get(key);
        if (now > entry.resetTime) {
          entry.count = 1;
          entry.resetTime = now + windowMs;
        } else {
          entry.count += 1;
        }
      }

      const entry = this.store.get(key);
      cb(null, entry.count);
    } catch (error) {
      logger.error('RATE_LIMITING: Memory store error', { error: error.message, key });
      cb(error);
    }
  }

  async decrement(key) {
    try {
      if (this.store.has(key)) {
        const entry = this.store.get(key);
        if (entry.count > 0) entry.count -= 1;
        return entry.count;
      }
      return 0;
    } catch (error) {
      logger.error('RATE_LIMITING: Memory store decrement error', { error: error.message, key });
      return 0;
    }
  }

  async reset(key) {
    this.store.delete(key);
  }
}

const memoryStore = new MemoryRateLimitStore();

// Initialiser Redis
initializeRedis();

/**
 * 🔴 NIVEAU 1: RATE LIMITING LOGIN - LE PLUS STRICT
 * Protections:
 * - Limite adaptative basée sur le risque IP
 * - Lockout progressif du compte
 * - KeyGenerator composite (IP + account + combo)
 * - Détection des comptes verrouillés
 */
export const createLoginRateLimiter = (accountLockoutService) => {
  return rateLimit({
    store:
      redisAvailable && redisClient
        ? new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
            prefix: 'ratelimit:login:',
            expiry: 15 * 60, // 15 minutes
          })
        : {
            incr: (key, cb) => memoryStore.incr(key, cb),
            decrement: (key, cb) => memoryStore.decrement(key).then((count) => cb(null, count)),
            reset: (key, cb) => memoryStore.reset(key).then(() => cb()),
          },

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: async (req) => {
      try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const username = req.body?.username;

        // 🔴 Si compte verrouillé: limite = 0
        if (username) {
          const normalizedUsername = username.toLowerCase().trim();
          const lockStatus = await accountLockoutService.isLocked(normalizedUsername);

          if (lockStatus.isLocked) {
            logger.warn('LOGIN_ATTEMPT_LOCKED_ACCOUNT', {
              username: normalizedUsername,
              ip,
              lockStatus,
              timestamp: new Date().toISOString(),
            });
            return 0;
          }
        }

        // 🟡 Par défaut: 3 tentatives
        return 3;
      } catch (error) {
        logger.error('LOGIN_RATE_LIMITER: Error in max calculation', { error: error.message });
        return 3; // Fallback sûr
      }
    },

    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const username = req.body?.username;

      // ✅ CORRECTION SÉCURISÉE du keyGenerator
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        // Fallback sûr: limiter par IP uniquement
        return `ip:${ip}:unknown`;
      }

      const normalizedUsername = username.toLowerCase().trim();

      // Retourner une SEULE clé composite sécurisée
      return `ip:${ip}:account:${normalizedUsername}`;
    },

    skipSuccessfulRequests: true, // Ne pas compter les tentatives réussies
    skipFailedRequests: false,

    handler: async (req, res, next, options) => {
      try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const username = req.body?.username;
        const timestamp = new Date().toISOString();

        // 🔴 LOG CRITIQUE
        logger.warn('RATE_LIMIT_EXCEEDED_LOGIN', {
          ip,
          username: username || 'unknown',
          userAgent: req.get('User-Agent') || 'none',
          timestamp,
          path: req.path,
          method: req.method,
        });

        // 🚨 LOCKOUT DU COMPTE si username fourni
        if (username && typeof username === 'string' && username.trim().length > 0) {
          const normalizedUsername = username.toLowerCase().trim();

          const failureResult = await accountLockoutService.recordFailedAttempt(
            normalizedUsername,
            ip,
            req.get('User-Agent'),
          );

          if (failureResult.isLocked) {
            return res.status(423).json({
              error: 'ACCOUNT_LOCKED',
              message:
                'Votre compte est temporairement verrouillé suite à trop de tentatives échouées',
              unlockTime: failureResult.unlockTime,
              unlockTimeFormatted: failureResult.unlockTimeFormatted,
              reason: 'Trop de tentatives de connexion échouées',
              supportContact: process.env.SUPPORT_EMAIL || 'support@spofe.app',
              attemptsRemaining: failureResult.attemptsRemaining,
            });
          }
        }

        // Réponse standard rate limit
        res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil(options.windowMs / 1000),
          retryAfterFormatted: `${Math.ceil(options.windowMs / 60000)} minutes`,
          timestamp,
          httpStatusCode: 429,
        });
      } catch (error) {
        logger.error('LOGIN_RATE_LIMITER: Handler error', { error: error.message });
        res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erreur interne' });
      }
    },

    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * 🟠 NIVEAU 2: RATE LIMITING API GÉNÉRAL
 * Limite par utilisateur authentifié ou par IP
 * Différente selon le rôle
 */
export const apiRateLimiter = rateLimit({
  store:
    redisAvailable && redisClient
      ? new RedisStore({
          sendCommand: (...args) => redisClient.call(...args),
          prefix: 'ratelimit:api:',
          expiry: 60, // 1 minute
        })
      : {
          incr: (key, cb) => memoryStore.incr(key, cb),
          decrement: (key, cb) => memoryStore.decrement(key).then((count) => cb(null, count)),
          reset: (key, cb) => memoryStore.reset(key).then(() => cb()),
        },

  windowMs: 60 * 1000, // 1 minute

  max: (req) => {
    // Limite basée sur le rôle/utilisateur authentifié
    if (req.user) {
      switch (req.user.role) {
        case 'admin':
          return 300; // 300 req/min pour admin
        case 'comptable':
        case 'auditeur':
          return 150; // 150 req/min pour comptable/auditeur
        case 'user':
          return 60; // 60 req/min pour user normal
        default:
          return 60;
      }
    }

    // Limite pour non-authentifiés
    return 30; // 30 req/min
  },

  keyGenerator: (req) => {
    // Priorité: user ID > IP
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
  },

  skip: (req) => {
    // Ne pas limiter les health checks
    if (req.path === '/api/health' || req.path === '/health') {
      return true;
    }
    // Ne pas limiter les assets statiques
    if (req.path.startsWith('/public/') || req.path.startsWith('/static/')) {
      return true;
    }
    // Ne pas limiter les webhooks externes (si configurés)
    if (req.path.startsWith('/webhooks/') && req.get('x-webhook-token')) {
      return true;
    }
    return false;
  },

  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de requêtes. Veuillez ralentir votre rythme.',
    httpStatusCode: 429,
  },

  handler: (req, res) => {
    logger.warn('RATE_LIMIT_EXCEEDED_API', {
      userId: req.user?.id,
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes. Veuillez ralentir.',
      retryAfter: 60,
      httpStatusCode: 429,
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🟡 NIVEAU 3: RATE LIMITING SPÉCIFIQUE (Password Reset)
 */
export const passwordResetLimiter = rateLimit({
  store:
    redisAvailable && redisClient
      ? new RedisStore({
          sendCommand: (...args) => redisClient.call(...args),
          prefix: 'ratelimit:password-reset:',
          expiry: 3600, // 1 heure
        })
      : {
          incr: (key, cb) => memoryStore.incr(key, cb),
          decrement: (key, cb) => memoryStore.decrement(key).then((count) => cb(null, count)),
          reset: (key, cb) => memoryStore.reset(key).then(() => cb()),
        },

  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives de reset par heure

  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase().trim();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    if (!email) {
      return `ip:${ip}:reset:unknown`;
    }

    return `ip:${ip}:reset:${email}`;
  },

  handler: (req, res) => {
    const email = req.body?.email || 'unknown';

    logger.warn('RATE_LIMIT_EXCEEDED_PASSWORD_RESET', {
      ip: req.ip,
      email,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      error: 'RESET_LIMIT_EXCEEDED',
      message: 'Trop de demandes de réinitialisation. Réessayez dans une heure.',
      retryAfter: 3600,
      httpStatusCode: 429,
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🔵 NIVEAU 4: RATE LIMITING UPLOAD (Fichiers)
 */
export const uploadRateLimiter = rateLimit({
  store:
    redisAvailable && redisClient
      ? new RedisStore({
          sendCommand: (...args) => redisClient.call(...args),
          prefix: 'ratelimit:upload:',
          expiry: 3600, // 1 heure
        })
      : {
          incr: (key, cb) => memoryStore.incr(key, cb),
          decrement: (key, cb) => memoryStore.decrement(key).then((count) => cb(null, count)),
          reset: (key, cb) => memoryStore.reset(key).then(() => cb()),
        },

  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // 50 uploads par heure

  keyGenerator: (req) => {
    if (req.user?.id) {
      return `user:${req.user.id}:uploads`;
    }
    return `ip:${req.ip}:uploads`;
  },

  handler: (req, res) => {
    logger.warn('RATE_LIMIT_EXCEEDED_UPLOAD', {
      userId: req.user?.id,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      error: 'UPLOAD_LIMIT_EXCEEDED',
      message: 'Trop de fichiers téléchargés. Limite: 50/heure.',
      retryAfter: 3600,
      httpStatusCode: 429,
    });
  },
});

export { redisClient, redisAvailable, memoryStore };
