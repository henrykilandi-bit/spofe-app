// src/application/events/CoachingExchangeAdded.ts

export interface CoachingExchangeAdded {
  type: 'CoachingExchangeAdded';
  payload: {
    tenantId: string;
    sessionId: string;
    exchangeId: string;
    type: 'TEXT' | 'AUDIO';
    contentReference: string;
    actorId: string;
    occurredAt: string;
  };
}
