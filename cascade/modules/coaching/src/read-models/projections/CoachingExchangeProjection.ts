import { CoachingExchangeRM } from '../models/CoachingExchangeRM';
import { CoachingExchangeAdded } from '../../application/events/CoachingExchangeAdded';

export class CoachingExchangeProjection {
  apply(event: CoachingExchangeAdded): CoachingExchangeRM {
    return {
      tenantId: event.payload.tenantId,
      sessionId: event.payload.sessionId,
      exchangeId: event.payload.exchangeId,
      type: event.payload.type,
      contentReference: event.payload.contentReference,
      actorId: event.payload.actorId,
      createdAt: event.payload.occurredAt,
    };
  }
}
