/**
 * 📋 AUDIT TRAIL DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité AuditTrail
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 */

/**
 * Transform AuditTrail Sequelize instance to standard API DTO
 * @param {Object} audit - Sequelize AuditTrail instance
 * @returns {Object|null} - AuditTrail DTO or null if falsy
 */
export const auditTrailDto = (audit) => {
  if (!audit) return null;

  return {
    // Identity
    id: audit.id,
    userId: audit.userId || audit.user_id || null,

    // Action
    action: audit.action || null,
    entity: audit.entity || null,
    entityId: audit.entityId || audit.entity_id || null,

    // Details
    oldValues: audit.oldValues || audit.old_values || null,
    newValues: audit.newValues || audit.new_values || null,
    changes: audit.changes || null,

    // Network Info
    ipAddress: audit.ipAddress || audit.ip_address || null,
    userAgent: audit.userAgent || audit.user_agent || null,

    // Timestamps (ISO-8601)
    createdAt: audit.created_at ? audit.created_at.toISOString() : null
  };
};

/**
 * Transform array of AuditTrails to DTOs
 */
export const auditTrailDtoArray = (audits) => {
  return Array.isArray(audits)
    ? audits.map(auditTrailDto).filter(Boolean)
    : [];
};

/**
 * Minimal AuditTrail DTO
 */
export const auditTrailDtoMinimal = (audit) => {
  if (!audit) return null;

  return {
    id: audit.id,
    action: audit.action,
    entity: audit.entity,
    createdAt: audit.created_at ? audit.created_at.toISOString() : null
  };
};
