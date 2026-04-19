// src/application/handlers/PlanCoachingSessionHandler.ts

import { CoachingGuardian } from '../../guardian/CoachingGuardian';
import { PlanCoachingSession } from '../commands/PlanCoachingSession';
import { CoachingSessionPlanned } from '../events/CoachingSessionPlanned';

export class PlanCoachingSessionHandler {
  constructor(private readonly guardian: CoachingGuardian) {}

  handle(cmd: PlanCoachingSession): CoachingSessionPlanned {
    this.guardian.validate({
      tenantId: cmd.tenantId,
      actorId: cmd.actorId,
      now: new Date().toISOString(),
      commandType: 'PlanCoachingSession',
    });

    return {
      type: 'CoachingSessionPlanned',
      payload: {
        tenantId: cmd.tenantId,
        sessionId: cmd.sessionId,
        plannedDate: cmd.plannedDate,
        relatedActionIds: cmd.relatedActionIds,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
