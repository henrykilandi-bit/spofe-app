// Enhanced Winston logger with secrets sanitization
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Sanitize function - Redact sensitive information
 * @param {Object} info - Log info object
 * @returns {Object} Sanitized log info
 */
const sanitize = (info) => {
  const sensitive = ['password', 'token', 'secret', 'authorization', 'apikey', 'api_key'];
  let message = info.message;
  
  if (typeof message === 'string') {
    sensitive.forEach(key => {
      const regex = new RegExp(`(${key}[=:]\\s*)([^\\s&]+)`, 'gi');
      message = message.replace(regex, '$1***REDACTED***');
    });
  }
  
  return { ...info, message };
};

/**
 * Custom format for structured logging
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format(sanitize)(),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `${timestamp} [${level.toUpperCase()}] ${message} ${meta}`;
  })
);

/**
 * Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console output (colorized)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    
    // Daily rotate file - All logs
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info'
    }),
    
    // Daily rotate file - Error logs only
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'error'
    })
  ]
});

/**
 * Helper to log HTTP requests
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {number} duration - Request duration in ms
 */
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

// Export default logger
export default logger;

// Export utility functions for backward compatibility
export const logInfo = (msg, meta = {}) => logger.info(msg, meta);
export const logError = (msg, meta = {}) => logger.error(msg, meta);
export const logSecurity = (msg, meta = {}) => logger.warn(`SECURITY: ${msg}`, meta);
