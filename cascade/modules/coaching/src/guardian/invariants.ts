// src/guardian/invariants.ts

export interface GuardianContext {
  tenantId: string;
  actorId?: string;
  now: string;

  // session context
  sessionPlanned?: boolean;
  sessionActive?: boolean;

  // command intent
  commandType: string;
}
