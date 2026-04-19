// src/application/handlers/AddCoachingJournalEntryHandler.ts

import { CoachingGuardian } from '../../guardian/CoachingGuardian';
import { AddCoachingJournalEntry } from '../commands/AddCoachingJournalEntry';
import { CoachingJournalEntryAdded } from '../events/CoachingJournalEntryAdded';

export class AddCoachingJournalEntryHandler {
  constructor(private readonly guardian: CoachingGuardian) {}

  handle(cmd: AddCoachingJournalEntry): CoachingJournalEntryAdded {
    this.guardian.validate({
      tenantId: cmd.tenantId,
      actorId: cmd.actorId,
      now: new Date().toISOString(),
      commandType: 'AddCoachingJournalEntry',
    });

    return {
      type: 'CoachingJournalEntryAdded',
      payload: {
        tenantId: cmd.tenantId,
        entryId: cmd.entryId,
        moduleSource: cmd.moduleSource,
        subject: cmd.subject,
        comment: cmd.comment,
        actorId: cmd.actorId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
