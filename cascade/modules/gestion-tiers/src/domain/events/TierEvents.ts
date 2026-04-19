export interface TierCreated {
  type: 'TierCreated';
  tierId: string;
  tenantId: string;
  actorId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface TierUpdated {
  type: 'TierUpdated';
  tierId: string;
  tenantId: string;
  actorId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface TierSuspended {
  type: 'TierSuspended';
  tierId: string;
  tenantId: string;
  actorId: string;
  timestamp: string;
  reason: string;
}

export interface TierArchived {
  type: 'TierArchived';
  tierId: string;
  tenantId: string;
  actorId: string;
  timestamp: string;
  reason: string;
}

export type TierEvent =
  | TierCreated
  | TierUpdated
  | TierSuspended
  | TierArchived;