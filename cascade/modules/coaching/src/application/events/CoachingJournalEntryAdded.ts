// src/application/events/CoachingJournalEntryAdded.ts

export interface CoachingJournalEntryAdded {
  type: 'CoachingJournalEntryAdded';
  payload: {
    tenantId: string;
    entryId: string;
    moduleSource: string;
    subject: string;
    comment: string;
    actorId: string;
    occurredAt: string;
  };
}
