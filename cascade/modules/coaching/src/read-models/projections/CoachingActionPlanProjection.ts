import { CoachingActionPlanRM } from '../models/CoachingActionPlanRM';
import { CoachingActionCreated } from '../../application/events/CoachingActionCreated';

export class CoachingActionPlanProjection {
  apply(event: CoachingActionCreated): CoachingActionPlanRM {
    return {
      tenantId: event.payload.tenantId,
      actionId: event.payload.actionId,
      description: event.payload.description,
      responsibleActorId: event.payload.responsibleActorId,
      dueDate: event.payload.dueDate,
      status: 'TODO',
    };
  }
}
