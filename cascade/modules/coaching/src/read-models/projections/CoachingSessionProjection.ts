import { CoachingSessionRM } from '../models/CoachingSessionRM';
import { CoachingSessionPlanned } from '../../application/events/CoachingSessionPlanned';

export class CoachingSessionProjection {
  apply(event: CoachingSessionPlanned): CoachingSessionRM {
    return {
      tenantId: event.payload.tenantId,
      sessionId: event.payload.sessionId,
      plannedDate: event.payload.plannedDate,
      relatedActionIds: event.payload.relatedActionIds,
      active: false, // activation gérée par l'infra temps, pas ici
    };
  }
}
