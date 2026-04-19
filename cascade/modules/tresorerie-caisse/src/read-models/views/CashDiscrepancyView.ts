export interface CashDiscrepancyView {
  tenantId: string;
  cashRegisterId: string;
  discrepancyAmount: number;
  recordedAt: Date;
  actorId: string;
  documentId: string;
}