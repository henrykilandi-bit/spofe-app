/**
 * 📋 SECURITY EVENT DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité SecurityEvent
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 */

/**
 * Transform SecurityEvent Sequelize instance to standard API DTO
 * @param {Object} event - Sequelize SecurityEvent instance
 * @returns {Object|null} - SecurityEvent DTO or null if falsy
 */
export const securityEventDto = (event) => {
  if (!event) return null;

  return {
    // Identity
    id: event.id,
    userId: event.userId || event.user_id || null,

    // Event Details
    eventType: event.eventType || event.event_type || null,
    description: event.description || null,
    severity: event.severity || 'INFO',

    // Event Data
    eventData: event.eventData || event.event_data || null,

    // Network Info
    ipAddress: event.ipAddress || event.ip_address || null,
    userAgent: event.userAgent || event.user_agent || null,

    // Status
    isResolved: event.isResolved || event.is_resolved || false,
    resolvedAt: event.resolvedAt || event.resolved_at 
      ? new Date(event.resolvedAt || event.resolved_at).toISOString() 
      : null,

    // Timestamps (ISO-8601)
    createdAt: event.created_at ? event.created_at.toISOString() : null
  };
};

/**
 * Transform array of SecurityEvents to DTOs
 */
export const securityEventDtoArray = (events) => {
  return Array.isArray(events)
    ? events.map(securityEventDto).filter(Boolean)
    : [];
};

/**
 * Minimal SecurityEvent DTO
 */
export const securityEventDtoMinimal = (event) => {
  if (!event) return null;

  return {
    id: event.id,
    eventType: event.eventType || event.event_type,
    severity: event.severity || 'INFO',
    createdAt: event.created_at ? event.created_at.toISOString() : null
  };
};
