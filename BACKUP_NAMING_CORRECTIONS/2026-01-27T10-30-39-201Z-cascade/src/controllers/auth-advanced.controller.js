// src/controllers/auth-advanced.controller.js
// Advanced authentication endpoints: refresh, logout, password reset, current user

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/config.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import redisClient from '../config/redis.js';
import { success, error, badRequest, unauthorized, forbidden, notFound } from '../utils/response.js';

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh-token
 */
export const refreshTokenEndpoint = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return badRequest(res, 'Refresh token is required', { refreshToken: 'Refresh token must be provided' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      logger.logSecurity('Invalid refresh token attempt', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        return unauthorized(res, 'Refresh token has expired');
      }

      return unauthorized(res, 'Invalid refresh token');
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist_${refreshToken}`);
    if (isBlacklisted) {
      logger.logSecurity('Attempt to use blacklisted refresh token', { userId: decoded.id });
      return unauthorized(res, 'Refresh token has been revoked');
    }

    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      logger.logSecurity('Refresh token for inactive/deleted user', { userId: decoded.id });
      return unauthorized(res, 'User not found or inactive');
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    logger.logInfo('Token refreshed successfully', { userId: user.id });

    success(res, {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: config.jwt.expiresIn
    }, 200, 'Token refreshed successfully');

  } catch (error) {
    logger.logError('Error refreshing token', { error: error.message });
    next(error);
  }
};

// ============================================
// LOGOUT
// ============================================

/**
 * Logout user and blacklist tokens
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ')[1];
    const { refreshToken } = req.body;

    if (!accessToken) {
      return unauthorized(res, 'No token provided');
    }

    try {
      const decoded = jwt.decode(accessToken);

      // Blacklist access token
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        const now = new Date();
        const ttl = Math.ceil((expiresAt - now) / 1000);

        if (ttl > 0) {
          await redisClient.set(`blacklist_token_${accessToken}`, 'true', 'EX', ttl);
        }
      }

      // Blacklist refresh token if provided
      if (refreshToken) {
        const refreshDecoded = jwt.decode(refreshToken);
        if (refreshDecoded && refreshDecoded.exp) {
          const expiresAt = new Date(refreshDecoded.exp * 1000);
          const now = new Date();
          const ttl = Math.ceil((expiresAt - now) / 1000);

          if (ttl > 0) {
            await redisClient.set(`blacklist_${refreshToken}`, 'true', 'EX', ttl);
          }
        }
      }

      logger.logInfo('User logged out successfully', { userId: decoded.id });

      success(res, null, 200, 'Logged out successfully');

    } catch (error) {
      logger.logError('Error processing logout', { error: error.message });
      next(error);
    }

  } catch (error) {
    logger.logError('Error during logout', { error: error.message });
    next(error);
  }
};

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Request password reset
 * POST /api/auth/request-password-reset
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return badRequest(res, 'Email is required', { email: 'Email must be provided' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return badRequest(res, 'Invalid email format', { email: 'Invalid email address' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // For security: don't reveal if email exists
      logger.logSecurity('Password reset requested for non-existent email', { email });
      return notFound(res, 'User with this email not found');
    }

    // Generate reset token (24 hours expiration)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store reset token in database
    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt
    });

    // Also store in Redis with expiration
    await redisClient.set(
      `password_reset_${user.id}`,
      resetToken,
      'EX',
      24 * 60 * 60 // 24 hours
    );

    // TODO: In production, send email with reset link
    // const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Password Reset Request', resetLink);

    logger.logInfo('Password reset requested', { userId: user.id, email });

    success(res, null, 200, 'Password reset instructions sent to email');

  } catch (error) {
    logger.logError('Error requesting password reset', { error: error.message });
    next(error);
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return badRequest(res, 'Token and new password are required', {
        token: !token ? 'Reset token is required' : undefined,
        newPassword: !newPassword ? 'New password is required' : undefined
      });
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return badRequest(res, 'Password does not meet complexity requirements', {
        newPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    }

    // Hash token to compare with stored
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching reset token that hasn't expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      logger.logSecurity('Invalid or expired password reset token used', { token: hashedToken.substring(0, 10) });
      return unauthorized(res, 'Invalid or expired reset token');
    }

    // Verify token also exists in Redis (not been revoked)
    const redisToken = await redisClient.get(`password_reset_${user.id}`);
    if (redisToken !== token) {
      logger.logSecurity('Reset token revoked', { userId: user.id });
      return unauthorized(res, 'Reset token has been revoked');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    // Revoke reset token
    await redisClient.del(`password_reset_${user.id}`);

    // Blacklist all existing tokens (force re-login)
    logger.logInfo('Password reset completed', { userId: user.id });

    success(res, null, 200, 'Password has been reset successfully. Please login with your new password.');

  } catch (error) {
    logger.logError('Error resetting password', { error: error.message });
    next(error);
  }
};

// ============================================
// CURRENT USER
// ============================================

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User is attached to request by auth middleware
    if (!req.user) {
      return unauthorized(res, 'No authenticated user found');
    }

    // Get fresh user data from database
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires']
      }
    });

    if (!user) {
      logger.logSecurity('Attempt to access deleted user', { userId: req.user.id });
      return unauthorized(res, 'User not found');
    }

    if (!user.isActive) {
      logger.logSecurity('Attempt to access inactive user', { userId: req.user.id });
      return forbidden(res, 'User account is inactive');
    }

    success(res, user.get({ plain: true }), 200);

  } catch (error) {
    logger.logError('Error getting current user', { error: error.message });
    next(error);
  }
};

// ============================================
// MIDDLEWARE AUTHENTICATION
// ============================================

/**
 * Verify JWT token middleware
 * Attaches user info to req.user
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return unauthorized(res, 'No authentication token provided');
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return unauthorized(res, 'Invalid authorization header format');
    }

    const token = parts[1];

    // Check if token is blacklisted
    const isBlacklisted = redisClient.get(`blacklist_token_${token}`);
    if (isBlacklisted) {
      logger.logSecurity('Attempt to use blacklisted token', { token: token.substring(0, 20) });
      return unauthorized(res, 'Token has been revoked');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorized(res, 'Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        return unauthorized(res, 'Invalid token signature');
      }

      logger.logError('Token verification error', { error: error.message });
      return unauthorized(res, 'Token verification failed');
    }

    // Verify required fields
    if (!decoded.id || !decoded.username) {
      return unauthorized(res, 'Token missing required fields');
    }

    // Attach user info to request
    req.user = decoded;
    req.token = token;

    next();

  } catch (error) {
    logger.logError('Error in token verification middleware', { error: error.message });
    return error(res, 'Authentication error', 500);
  }
};

/**
 * Verify user role middleware
 * Usage: app.use(verifyRole('ADMIN', 'ACCOUNTANT'))
 */
export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, 'No authenticated user');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.logSecurity('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });

      return forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Verify user is active middleware
 */
export const verifyUserActive = async (req, res, next) => {
  try {
    if (!req.user) {
      return unauthorized(res, 'No authenticated user');
    }

    const user = await User.findByPk(req.user.id);

    if (!user || !user.isActive) {
      logger.logSecurity('Access attempt by inactive user', { userId: req.user.id });
      return forbidden(res, 'User account is inactive');
    }

    next();

  } catch (error) {
    logger.logError('Error verifying user active status', { error: error.message });
    next(error);
  }
};

export default {
  refreshTokenEndpoint,
  logout,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  verifyToken,
  verifyRole,
  verifyUserActive
};
