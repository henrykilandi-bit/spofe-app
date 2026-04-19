// src/application/commands/PlanCoachingSession.ts

export interface PlanCoachingSession {
  commandId: string;
  tenantId: string;
  actorId: string;
  sessionId: string;
  plannedDate: string;
  relatedActionIds: string[];
}
