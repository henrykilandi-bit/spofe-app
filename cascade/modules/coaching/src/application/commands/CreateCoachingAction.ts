// src/application/commands/CreateCoachingAction.ts

export interface CreateCoachingAction {
  commandId: string;
  tenantId: string;
  actorId: string;
  actionId: string;
  description: string;
  responsibleActorId: string;
  dueDate: string;
}
