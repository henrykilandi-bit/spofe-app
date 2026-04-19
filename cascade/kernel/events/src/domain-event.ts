/**
 * SPOFE Kernel - Domain Event Standard
 * 
 * Interface canonique pour tous les événements métier.
 * OBLIGATOIRE pour tous les modules SPOFE.
 */

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;

  readonly metadata: {
    tenantId: string;
    actorId?: string;
    correlationId?: string;
    causationId?: string;
    version?: number;
  };

  readonly payload: TPayload;
}

/**
 * Type guard pour validation DomainEvent
 */
export function isDomainEvent(obj: any): obj is DomainEvent {
  return (
    obj &&
    typeof obj.eventId === 'string' &&
    typeof obj.eventType === 'string' &&
    typeof obj.aggregateId === 'string' &&
    obj.occurredAt instanceof Date &&
    obj.metadata &&
    typeof obj.metadata.tenantId === 'string' &&
    obj.payload !== undefined
  );
}