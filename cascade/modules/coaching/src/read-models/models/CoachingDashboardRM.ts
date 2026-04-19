export interface CoachingDashboardRM {
  tenantId: string;
  indicators: Record<string, unknown>; // références externes uniquement
  statusFlags: Record<string, 'GREEN' | 'ORANGE' | 'RED'>;
  lastUpdatedAt: string;
}
