export interface RecordCashMovementCommand {
  tenantId: string;
  actorId: string;
  cashRegisterId: string;
  movementType: "IN" | "OUT";
  amount: number;
  documentId: string;
}