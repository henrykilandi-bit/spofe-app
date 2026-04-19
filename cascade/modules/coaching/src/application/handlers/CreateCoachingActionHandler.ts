// src/application/handlers/CreateCoachingActionHandler.ts

import { CoachingGuardian } from '../../guardian/CoachingGuardian';
import { CreateCoachingAction } from '../commands/CreateCoachingAction';
import { CoachingActionCreated } from '../events/CoachingActionCreated';

export class CreateCoachingActionHandler {
  constructor(private readonly guardian: CoachingGuardian) {}

  handle(cmd: CreateCoachingAction): CoachingActionCreated {
    this.guardian.validate({
      tenantId: cmd.tenantId,
      actorId: cmd.actorId,
      now: new Date().toISOString(),
      commandType: 'CreateCoachingAction',
    });

    return {
      type: 'CoachingActionCreated',
      payload: {
        tenantId: cmd.tenantId,
        actionId: cmd.actionId,
        description: cmd.description,
        responsibleActorId: cmd.responsibleActorId,
        dueDate: cmd.dueDate,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
