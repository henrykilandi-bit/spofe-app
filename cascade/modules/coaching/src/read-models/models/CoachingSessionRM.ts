export interface CoachingSessionRM {
  tenantId: string;
  sessionId: string;
  plannedDate: string;
  relatedActionIds: string[];
  active: boolean;
}
