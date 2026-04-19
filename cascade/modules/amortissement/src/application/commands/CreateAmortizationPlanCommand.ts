// src/application/commands/CreateAmortizationPlanCommand.ts

import { AssetSource, AmortizationMethod } from '../../guardian/types';

export interface CreateAmortizationPlanCommand {
  commandId: string;
  tenantId: string;
  actorId: string;
  asset: AssetSource;
  method: AmortizationMethod;
  effectiveDate: string;
}
