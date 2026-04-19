export interface CashMovementHistoryView {
  tenantId: string;
  cashRegisterId: string;
  movementType: "IN" | "OUT";
  amount: number;
  recordedAt: Date;
  actorId: string;
  documentId: string;
}