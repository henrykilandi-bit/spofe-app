// src/application/events/CoachingSessionPlanned.ts

export interface CoachingSessionPlanned {
  type: 'CoachingSessionPlanned';
  payload: {
    tenantId: string;
    sessionId: string;
    plannedDate: string;
    relatedActionIds: string[];
    occurredAt: string;
  };
}
