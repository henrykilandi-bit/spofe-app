// src/application/commands/BuildCostStructureCommand.ts

import {
  CostLevel,
  CostSource,
  AllocationKey,
} from '../../guardian/types';

export interface BuildCostStructureCommand {
  commandId: string;
  tenantId: string;
  actorId: string;
  level: CostLevel;
  period: string; // YYYY-MM
  sources: CostSource[];
  allocations: AllocationKey[];
}
