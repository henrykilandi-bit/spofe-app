// src/application/commands/ReviseCostStructureCommand.ts

import {
  CostLevel,
  CostSource,
  AllocationKey,
} from '../../guardian/types';

export interface ReviseCostStructureCommand {
  commandId: string;
  tenantId: string;
  actorId: string;
  level: CostLevel;
  period: string;
  sources: CostSource[];
  allocations: AllocationKey[];
}
