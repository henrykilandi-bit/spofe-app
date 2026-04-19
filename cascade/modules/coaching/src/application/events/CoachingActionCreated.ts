// src/application/events/CoachingActionCreated.ts

export interface CoachingActionCreated {
  type: 'CoachingActionCreated';
  payload: {
    tenantId: string;
    actionId: string;
    description: string;
    responsibleActorId: string;
    dueDate: string;
    occurredAt: string;
  };
}
