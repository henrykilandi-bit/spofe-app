export interface UpdateTier {
  tenantId: string;
  actorId: string;
  tierId: string;
  payload: Record<string, unknown>;
}