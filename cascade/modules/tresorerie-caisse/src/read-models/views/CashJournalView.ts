export interface CashJournalView {
  tenantId: string;
  cashRegisterId: string;
  eventType: string;
  movementType?: "IN" | "OUT";
  amount?: number;
  actorId: string;
  documentId: string;
  occurredAt: Date;
}