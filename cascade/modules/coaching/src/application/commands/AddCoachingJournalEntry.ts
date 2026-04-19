// src/application/commands/AddCoachingJournalEntry.ts

export interface AddCoachingJournalEntry {
  commandId: string;
  tenantId: string;
  actorId: string;
  entryId: string;
  moduleSource: string;
  subject: string;
  comment: string;
}
