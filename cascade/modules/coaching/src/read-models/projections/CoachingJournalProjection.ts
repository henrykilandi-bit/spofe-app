import { CoachingJournalRM } from '../models/CoachingJournalRM';
import { CoachingJournalEntryAdded } from '../../application/events/CoachingJournalEntryAdded';

export class CoachingJournalProjection {
  apply(event: CoachingJournalEntryAdded): CoachingJournalRM {
    return {
      tenantId: event.payload.tenantId,
      entryId: event.payload.entryId,
      moduleSource: event.payload.moduleSource,
      subject: event.payload.subject,
      comment: event.payload.comment,
      actorId: event.payload.actorId,
      createdAt: event.payload.occurredAt,
    };
  }
}
