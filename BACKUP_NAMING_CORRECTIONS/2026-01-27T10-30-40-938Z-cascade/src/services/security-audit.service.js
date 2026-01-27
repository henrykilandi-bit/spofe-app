/**
 * Security Audit Service for SPOFE
 * Provides audit trail functionality
 */

import logger from '../utils/logger.js';

class SecurityAuditService {
  constructor() {
    this.auditLog = [];
  }

  /**
   * Log a security event
   */
  logEvent(event) {
    const auditEntry = {
      timestamp: new Date(),
      ...event
    };
    this.auditLog.push(auditEntry);
    logger.logSecurity(JSON.stringify(auditEntry));
    return auditEntry;
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filter = {}) {
    return this.auditLog.filter(entry => {
      if (filter.type && entry.type !== filter.type) return false;
      if (filter.userId && entry.userId !== filter.userId) return false;
      return true;
    });
  }

  /**
   * Clear audit logs (admin only)
   */
  clearAuditLogs() {
    const count = this.auditLog.length;
    this.auditLog = [];
    logger.logInfo(`Audit logs cleared. ${count} entries removed.`);
    return { cleared: count };
  }
}

export default new SecurityAuditService();
