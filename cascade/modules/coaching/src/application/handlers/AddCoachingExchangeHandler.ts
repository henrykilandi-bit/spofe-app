// src/application/handlers/AddCoachingExchangeHandler.ts

import { CoachingGuardian } from '../../guardian/CoachingGuardian';
import { AddCoachingExchange } from '../commands/AddCoachingExchange';
import { CoachingExchangeAdded } from '../events/CoachingExchangeAdded';

export class AddCoachingExchangeHandler {
  constructor(private readonly guardian: CoachingGuardian) {}

  handle(cmd: AddCoachingExchange): CoachingExchangeAdded {
    this.guardian.validate({
      tenantId: cmd.tenantId,
      actorId: cmd.actorId,
      now: new Date().toISOString(),
      commandType: 'AddCoachingExchange',
      sessionPlanned: cmd.sessionPlanned,
      sessionActive: cmd.sessionActive,
    });

    return {
      type: 'CoachingExchangeAdded',
      payload: {
        tenantId: cmd.tenantId,
        sessionId: cmd.sessionId,
        exchangeId: cmd.exchangeId,
        type: cmd.type,
        contentReference: cmd.contentReference,
        actorId: cmd.actorId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
