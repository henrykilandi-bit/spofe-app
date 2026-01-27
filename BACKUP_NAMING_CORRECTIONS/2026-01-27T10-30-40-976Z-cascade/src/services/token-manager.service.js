/**
 * TokenManagerService - Gestion Centralisée des JWT
 * 
 * Wrapper intelligent autour de l'auth middleware existant
 * Ajoute: refresh token pair, audit trail, IP tracking
 * 
 * Architecture:
 * - Préserve auth.middleware.js pour backward compatibility
 * - Enrichit avec TokenManagerService pour nouvelles features
 * - Audit trail dans SecurityEvent via IntegratedMonitoring
 * 
 * @module services/token-manager
 * @requires jsonwebtoken
 * @requires crypto
 * @requires models
 * @requires redis
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, TokenBlacklist, SecurityEvent } from '../models/index.js';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export class TokenManagerService {
  constructor() {
    // Utiliser les env vars existants de SPOFE
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    
    // TTLs configurables
    this.accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '24h';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    
    // Validation
    if (!this.accessTokenSecret) {
      throw new Error('JWT_SECRET not configured in environment');
    }
    
    logger.info('TokenManagerService initialized', {
      accessTokenExpiry: this.accessTokenExpiry,
      refreshTokenExpiry: this.refreshTokenExpiry,
      timestamp: new Date()
    });
  }

  /**
   * Génère une paire de tokens (access + refresh)
   * ✅ Utilise jwt.sign existant de auth.middleware.js pattern
   * ✅ Ajoute refresh token pair pour expiration handling
   * 
   * @param {Object} user - User object avec id, email, role
   * @param {string} ipAddress - IP du client
   * @param {string} userAgent - User-Agent du client
   * @returns {Promise<Object>} { access_token, refresh_token, expires_in }
   */
  async generateTokenPair(user, ipAddress = 'unknown', userAgent = 'unknown') {
    try {
      // 1. Générer access token (JWT standard)
      const accessToken = jwt.sign(
        {
          id: user.id,           // ✅ Matcher auth.middleware pattern
          email: user.email,
          compagnie_id: user.compagnie_id,
          role: user.role?.nom || user.role,
          permissions: user.role?.permissions
        },
        this.accessTokenSecret,
        { expiresIn: this.accessTokenExpiry }
      );

      // 2. Générer refresh token (random hex string)
      const refreshToken = crypto.randomBytes(64).toString('hex');
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // 3. Stocker refresh token dans Redis (TTL = 7 jours)
      const refreshTokenData = {
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
        hash: refreshTokenHash
      };
      
      await redisClient.setex(
        `refresh_token:${user.id}:${refreshTokenHash}`,
        7 * 24 * 60 * 60, // 7 jours en secondes
        JSON.stringify(refreshTokenData)
      );

      // 4. Audit trail - Log la génération
      await SecurityEvent.create({
        user_id: user.id,
        event_type: 'TOKEN_GENERATED',
        description: 'Paire de tokens générée (access + refresh)',
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'success',
        metadata: {
          token_type: 'pair',
          access_token_expiry: this.accessTokenExpiry,
          refresh_token_expiry: this.refreshTokenExpiry
        }
      }).catch(err => {
        logger.warn('Failed to log TOKEN_GENERATED event', { error: err.message });
      });

      logger.info('Token pair generated', {
        user_id: user.id,
        access_token_prefix: accessToken.substring(0, 10) + '...',
        refresh_token_hash: refreshTokenHash.substring(0, 10) + '...',
        ip: ipAddress
      });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: this.parseExpiry(this.accessTokenExpiry) // secondes
      };
    } catch (error) {
      logger.error('Error generating token pair', { 
        error: error.message,
        user_id: user.id 
      });
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * Valide et rafraîchit un token expiré
   * 
   * @param {string} refreshToken - Refresh token du client
   * @returns {Promise<Object>} Nouvelle paire { access_token, refresh_token, expires_in }
   */
  async refreshAccessToken(refreshToken) {
    try {
      // 1. Valider le format du refresh token
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new Error('Invalid refresh token format');
      }

      // 2. Hash pour lookup sécurisé
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // 3. Récupérer du Redis
      const storedData = await redisClient.get(`refresh_token:*:${refreshTokenHash}`);
      
      if (!storedData) {
        throw new Error('Refresh token expired or not found');
      }

      const tokenData = JSON.parse(storedData);
      const { user_id, ip_address, user_agent } = tokenData;

      // 4. Vérifier si le token n'est pas dans la blacklist
      const isBlacklisted = await TokenBlacklist.findOne({
        where: { 
          token: refreshToken,
          expires_at: { [Op.gt]: new Date() }
        }
      });
      
      if (isBlacklisted) {
        logger.warn('Blacklisted refresh token used', { user_id, ip: ip_address });
        
        // Nettoyer Redis
        await redisClient.del(`refresh_token:${user_id}:${refreshTokenHash}`);
        
        throw new Error('Refresh token has been revoked');
      }

      // 5. Récupérer l'utilisateur (include role pour permissions)
      const user = await User.findByPk(user_id, {
        include: ['role'],
        attributes: { exclude: ['password'] }
      });

      if (!user || !user.is_active) {
        logger.warn('User not found or inactive during token refresh', { user_id });
        throw new Error('User not found or inactive');
      }

      // 6. Générer nouvelle paire (auto-génère nouvel audit log)
      const newTokens = await this.generateTokenPair(user, ip_address, user_agent);
      
      // 7. Nettoyer l'ancien refresh token de Redis
      await redisClient.del(`refresh_token:${user_id}:${refreshTokenHash}`);

      // 8. Log du refresh réussi
      logger.info('Token refreshed successfully', {
        user_id,
        ip: ip_address,
        old_hash: refreshTokenHash.substring(0, 10) + '...',
        new_hash: crypto.createHash('sha256').update(newTokens.refresh_token).digest('hex').substring(0, 10) + '...'
      });

      return newTokens;

    } catch (error) {
      logger.error('Token refresh failed', { 
        error: error.message,
        token_hash: refreshToken ? crypto.createHash('sha256').update(refreshToken).digest('hex').substring(0, 10) : 'unknown'
      });
      
      // Log de sécurité pour tentative de refresh invalide
      await SecurityEvent.create({
        event_type: 'TOKEN_REFRESH_FAILED',
        description: `Refresh token invalide ou expiré: ${error.message}`,
        status: 'failure',
        metadata: { error_code: 'INVALID_REFRESH' }
      }).catch(err => logger.warn('Failed to log TOKEN_REFRESH_FAILED', { error: err.message }));
      
      throw error;
    }
  }

  /**
   * Révoque les tokens lors du logout
   * 
   * @param {string} accessToken - Access token JWT
   * @param {string} refreshToken - Refresh token
   * @param {string} userId - ID de l'utilisateur
   * @param {string} ipAddress - IP du client
   */
  async revokeTokens(accessToken, refreshToken, userId, ipAddress = 'unknown') {
    try {
      const now = new Date();
      
      // 1. Ajouter access token à la blacklist (jusqu'à son expiration)
      if (accessToken) {
        try {
          const decoded = jwt.decode(accessToken);
          
          if (decoded && decoded.exp) {
            await TokenBlacklist.create({
              user_id: userId,
              token: accessToken.substring(0, 500), // Store truncated for security
              expires_at: new Date(decoded.exp * 1000),
              revoked_at: now,
              revocation_reason: 'USER_LOGOUT'
            });
          }
        } catch (decodeError) {
          logger.warn('Could not decode access token for blacklist', { error: decodeError.message });
        }
      }

      // 2. Supprimer refresh token de Redis
      if (refreshToken) {
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        
        // Supprimer tous les refresh tokens de cet utilisateur
        const keys = await redisClient.keys(`refresh_token:${userId}:*`);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }

      // 3. Nettoyer les tokens expirés de la BD (cleanup background)
      this.cleanupExpiredTokens().catch(err => 
        logger.warn('Background cleanup failed', { error: err.message })
      );

      // 4. Audit trail du logout
      await SecurityEvent.create({
        user_id: userId,
        event_type: 'LOGOUT',
        description: 'Utilisateur déconnecté, tokens révoqués',
        ip_address: ipAddress,
        status: 'success',
        metadata: {
          access_token_revoked: !!accessToken,
          refresh_token_revoked: !!refreshToken
        }
      }).catch(err => logger.warn('Failed to log LOGOUT event', { error: err.message }));

      logger.info('Tokens revoked on logout', {
        user_id: userId,
        ip: ipAddress,
        timestamp: now
      });

    } catch (error) {
      logger.error('Error revoking tokens', { 
        error: error.message,
        user_id: userId 
      });
      // Ne pas throw - le logout doit réussir même si la revocation échoue
    }
  }

  /**
   * Nettoyage des tokens expirés en background (Redis auto-expire)
   */
  async cleanupExpiredTokens() {
    try {
      // Redis auto-expire via TTL, donc rien à faire pour refresh tokens
      
      // Nettoyer la blacklist SQL des tokens expirés
      const result = await TokenBlacklist.destroy({
        where: {
          expires_at: {
            [Op.lt]: new Date()
          }
        }
      });

      if (result > 0) {
        logger.info('Cleaned up expired blacklist entries', { count: result });
      }
    } catch (error) {
      logger.warn('Error during token cleanup', { error: error.message });
    }
  }

  /**
   * Middleware de vérification de token
   * ✅ Compatible avec auth.middleware.js existant
   * ⚠️ À utiliser en addition à authenticateToken() existant
   * 
   * @returns {Function} Express middleware
   */
  verifyTokenMiddleware() {
    return async (req, res, next) => {
      const authHeader = req.headers['authorization'];
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'TOKEN_REQUIRED',
          message: "Token d'authentification manquant"
        });
      }

      // Supporter "Bearer <token>" ou juste "<token>"
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

      try {
        // 1. Vérifier blacklist d'abord (rapide avec Redis en priorité)
        const isBlacklisted = await TokenBlacklist.findOne({
          where: { 
            token: token.substring(0, 500),
            expires_at: { [Op.gt]: new Date() }
          }
        });

        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            error: 'TOKEN_REVOKED',
            message: 'Token a été révoqué'
          });
        }

        // 2. Vérifier la signature JWT
        const decoded = jwt.verify(token, this.accessTokenSecret);
        
        // 3. Récupérer l'utilisateur actuel (pour vérifier is_active)
        const user = await User.findByPk(decoded.id, {
          include: ['role'],
          attributes: { exclude: ['password'] }
        });

        if (!user || !user.is_active) {
          return res.status(401).json({
            success: false,
            error: 'USER_INACTIVE',
            message: 'Utilisateur non trouvé ou désactivé'
          });
        }

        // 4. Ajouter aux request context (matcher auth.middleware pattern)
        req.user = user;
        req.token = token;
        req.permissions = user.role?.permissions || [];

        next();
        
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'TOKEN_EXPIRED',
            message: 'Token expiré. Utilisez le refresh token.'
          });
        }

        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            error: 'TOKEN_INVALID',
            message: 'Token invalide'
          });
        }

        logger.error('Token verification error', { 
          error: error.message,
          token_prefix: token.substring(0, 10) + '...'
        });

        return res.status(401).json({
          success: false,
          error: 'AUTH_FAILED',
          message: 'Échec de la vérification du token'
        });
      }
    };
  }

  /**
   * Parse expiry string (e.g. "24h", "7d") to seconds
   */
  parseExpiry(expiryStr) {
    const match = expiryStr.match(/^(\d+)([hdw])$/);
    if (!match) return 86400; // default 24h
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      case 'w': return value * 7 * 86400;
      default: return 86400;
    }
  }

  /**
   * Générer un rapport d'activité des tokens
   */
  async generateTokenActivityReport(userId, hours = 24) {
    try {
      const since = new Date(Date.now() - hours * 3600000);

      const events = await SecurityEvent.findAll({
        where: {
          user_id: userId,
          event_type: {
            [Op.in]: ['TOKEN_GENERATED', 'TOKEN_REFRESHED', 'LOGOUT', 'TOKEN_REFRESH_FAILED']
          },
          created_at: { [Op.gte]: since }
        },
        order: [['created_at', 'DESC']]
      });

      return {
        user_id: userId,
        period: { since, until: new Date() },
        events: events.map(e => ({
          type: e.event_type,
          ip: e.ip_address,
          user_agent: e.user_agent,
          timestamp: e.created_at
        })),
        summary: {
          total: events.length,
          generated: events.filter(e => e.event_type === 'TOKEN_GENERATED').length,
          refreshed: events.filter(e => e.event_type === 'TOKEN_REFRESHED').length,
          logouts: events.filter(e => e.event_type === 'LOGOUT').length,
          failures: events.filter(e => e.event_type === 'TOKEN_REFRESH_FAILED').length
        }
      };
    } catch (error) {
      logger.error('Error generating token activity report', { error: error.message });
      throw error;
    }
  }
}

// Export singleton
export default new TokenManagerService();
