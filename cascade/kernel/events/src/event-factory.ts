/**
 * SPOFE Kernel - Event Factory
 * 
 * Factory canonique pour créer des DomainEvents.
 * INTERDIT de créer des Events autrement.
 */

import { v4 as uuid } from 'uuid';
import { DomainEvent } from './domain-event';

export function createDomainEvent<TPayload>(params: {
  eventType: string;
  aggregateId: string;
  tenantId: string;
  actorId?: string;
  correlationId?: string;
  causationId?: string;
  payload: TPayload;
}): DomainEvent<TPayload> {
  if (!params.eventType || !params.aggregateId || !params.tenantId) {
    throw new Error('eventType, aggregateId et tenantId sont obligatoires');
  }

  if (!params.payload) {
    throw new Error('payload ne peut pas être vide');
  }

  return {
    eventId: uuid(),
    eventType: params.eventType,
    aggregateId: params.aggregateId,
    occurredAt: new Date(),
    metadata: {
      tenantId: params.tenantId,
      actorId: params.actorId,
      correlationId: params.correlationId,
      causationId: params.causationId,
      version: 1,
    },
    payload: params.payload,
  };
}

/**
 * Helper pour Events avec version
 */
export function createVersionedDomainEvent<TPayload>(params: {
  eventType: string;
  aggregateId: string;
  tenantId: string;
  actorId?: string;
  correlationId?: string;
  causationId?: string;
  version: number;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    ...createDomainEvent(params),
    metadata: {
      ...createDomainEvent(params).metadata,
      version: params.version,
    },
  };
}