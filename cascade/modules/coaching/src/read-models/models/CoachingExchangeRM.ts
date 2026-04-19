export interface CoachingExchangeRM {
  tenantId: string;
  sessionId: string;
  exchangeId: string;
  type: 'TEXT' | 'AUDIO';
  contentReference: string;
  actorId: string;
  createdAt: string;
}
