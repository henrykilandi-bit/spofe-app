// src/application/commands/StopAmortizationCommand.ts

export interface StopAmortizationCommand {
  commandId: string;
  tenantId: string;
  actorId: string;
  assetId: string;
  effectiveDate: string;
}
