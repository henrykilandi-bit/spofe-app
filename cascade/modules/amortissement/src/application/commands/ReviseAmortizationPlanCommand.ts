// src/application/commands/ReviseAmortizationPlanCommand.ts

export interface ReviseAmortizationPlanCommand {
  commandId: string;
  tenantId: string;
  actorId: string;
  assetId: string;
  revision: {
    usefulLifeMonths?: number;
    residualValue?: number;
  };
  effectiveDate: string;
}
