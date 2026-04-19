// src/application/commands/AddCoachingExchange.ts

export interface AddCoachingExchange {
  commandId: string;
  tenantId: string;
  actorId: string;
  sessionId: string;
  exchangeId: string;
  type: 'TEXT' | 'AUDIO';
  contentReference: string;
  sessionPlanned: boolean;
  sessionActive: boolean;
}
