/**
 * 🔧 Shared - Audit
 * 
 * Types et utilitaires pour l'audit du module comptabilité.
 */

export interface AuditEvent {
  eventId: string;
  eventType: 'ENTRY_CREATED' | 'PERIOD_CLOSED' | 'PERIOD_LOCKED' | 'VALIDATION_FAILED';
  timestamp: Date;
  actor: string;
  description: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export interface AuditTrail {
  events: AuditEvent[];
  lastUpdated: Date;
}

export class AuditLogger {
  
  /**
   * Créer un événement d'audit
   */
  static createEvent(
    eventType: AuditEvent['eventType'],
    actor: string,
    description: string,
    targetId?: string,
    metadata?: Record<string, any>
  ): AuditEvent {
    return {
      eventId: `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      timestamp: new Date(),
      actor,
      description,
      targetId,
      metadata
    };
  }
  
  /**
   * Logger la création d'une écriture
   */
  static logEntryCreated(entryId: string, actor: string): AuditEvent {
    return this.createEvent(
      'ENTRY_CREATED',
      actor,
      `Création de l'écriture ${entryId}`,
      entryId
    );
  }
  
  /**
   * Logger la clôture d'une période
   */
  static logPeriodClosed(periodId: string, actor: string): AuditEvent {
    return this.createEvent(
      'PERIOD_CLOSED',
      actor,
      `Clôture de la période ${periodId}`,
      periodId
    );
  }
  
  /**
   * Logger le blocage d'une période
   */
  static logPeriodLocked(periodId: string, actor: string): AuditEvent {
    return this.createEvent(
      'PERIOD_LOCKED',
      actor,
      `Blocage de la période ${periodId}`,
      periodId
    );
  }
  
  /**
   * Logger un échec de validation
   */
  static logValidationFailed(
    entryId: string,
    actor: string,
    invariantCode: string,
    reason: string
  ): AuditEvent {
    return this.createEvent(
      'VALIDATION_FAILED',
      actor,
      `Échec validation ${entryId}: ${invariantCode} - ${reason}`,
      entryId,
      { invariantCode, reason }
    );
  }
}
