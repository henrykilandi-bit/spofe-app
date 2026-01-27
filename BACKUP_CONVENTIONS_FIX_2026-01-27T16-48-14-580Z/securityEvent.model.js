/**
 * 🚨 Intrusion Detection & IP Tracking
 * Blocage d'IP après N tentatives échouées
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const SecurityEvent = sequelize.define('SecurityEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Null si user not identified'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: 'IPv4 or IPv6 address'
    },
    event_type: {
      type: DataTypes.ENUM(
        'LOGIN_ATTEMPT',
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'PASSWORD_RESET',
        'PASSWORD_CHANGED',
        '2FA_ENABLED',
        '2FA_DISABLED',
        '2FA_ATTEMPT',
        '2FA_FAILED',
        'SUSPICIOUS_ACTIVITY',
        'BRUTEFORCE_DETECTED',
        'IP_BLOCKED',
        'UNAUTHORIZED_ACCESS',
        'PERMISSION_DENIED',
        'API_KEY_USED',
        'SESSION_TIMEOUT'
      ),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      defaultValue: 'MEDIUM'
    },
    is_successful: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Event successful or failed'
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Sequential attempt number'
    },
    failure_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Why the attempt failed'
    },
    device_fingerprint: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Browser/device fingerprint hash'
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '{ country, city, latitude, longitude }'
    },
    response_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'API response time'
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'IP blocked after Nth attempts'
    },
    blocked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when block expires'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional context'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'security_events',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['ip_address'] },
      { fields: ['event_type'] },
      { fields: ['severity'] },
      { fields: ['is_blocked'] },
      { fields: ['created_at'] },
      { fields: ['ip_address', 'event_type', 'created_at'] }
    ],
    hooks: {
      beforeCreate: async (event, options) => {
        try {
          // 1️⃣ DEFAULT VALUES
          if (!event.attempts) {
            event.attempts = 1;
          }
          if (!event.is_successful) {
            event.is_successful = false;
          }
          if (!event.is_blocked) {
            event.is_blocked = false;
          }

          // 2️⃣ SEVERITY DEFAULT
          if (!event.severity) {
            // Auto-calculate severity based on event type
            const highSeverityEvents = ['BRUTEFORCE_DETECTED', 'IP_BLOCKED', 'SUSPICIOUS_ACTIVITY'];
            const criticalEvents = ['UNAUTHORIZED_ACCESS'];
            if (criticalEvents.includes(event.event_type)) {
              event.severity = 'CRITICAL';
            } else if (highSeverityEvents.includes(event.event_type)) {
              event.severity = 'HIGH';
            } else if (event.is_successful === false) {
              event.severity = 'MEDIUM';
            } else {
              event.severity = 'LOW';
            }
          }

          // 3️⃣ BLOCKING LOGIC
          // After 5 failed attempts, block the IP for 15 minutes
          const failedAttempts = await SecurityEvent.count({
            where: {
              ip_address: event.ip_address,
              event_type: 'LOGIN_FAILED',
              is_successful: false
            }
          });

          if (failedAttempts >= 5) {
            event.is_blocked = true;
            event.blocked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            event.attempts = failedAttempts + 1;
            logSecurity(`IP BLOCKED: ${event.ip_address} (${failedAttempts + 1} attempts)`);
          }

          // 4️⃣ AUDIT LOGGING
          logInfo(`SecurityEvent.beforeCreate: Event ${event.event_type} from ${event.ip_address}`);
          if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
            logSecurity(`SECURITY ALERT: ${event.event_type} - ${event.ip_address}`);
          }
        } catch (error) {
          logError(`SecurityEvent.beforeCreate error: ${error.message}`);
          throw error;
        }
      },

      beforeUpdate: async (event, options) => {
        try {
          // 1️⃣ BLOCK EXPIRY CHECK
          if (event.changed('is_blocked') && event.is_blocked === false) {
            event.blocked_until = null;
            logInfo(`SecurityEvent.beforeUpdate: IP unblocked: ${event.ip_address}`);
          }

          // 2️⃣ PREVENTED FIELDS
          if (event.changed('ip_address')) {
            throw new Error('Cannot modify IP address of security event');
          }
          if (event.changed('event_type')) {
            throw new Error('Cannot modify event type of security event');
          }

          logInfo(`SecurityEvent.beforeUpdate: Event prepared for update`);
        } catch (error) {
          logError(`SecurityEvent.beforeUpdate error: ${error.message}`);
          throw error;
        }
      }
    }
  });

export default SecurityEvent;
