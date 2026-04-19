export interface RecordCapitalOperationCommand {
  tenantId: string;
  actorId: string;
  actorRole: "ENTREPRENEUR" | "COACH" | "SYSTEM";

  operationType: "ISSUANCE" | "TRANSFER";
  reference: string;
}
