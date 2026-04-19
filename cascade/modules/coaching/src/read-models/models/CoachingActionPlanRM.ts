export interface CoachingActionPlanRM {
  tenantId: string;
  actionId: string;
  description: string;
  responsibleActorId: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
}
