export interface CashSessionHistoryView {
  tenantId: string;
  cashRegisterId: string;
  openedAt: Date;
  closedAt?: Date;
  openingAmount: number;
  theoreticalAmount?: number;
  realAmount?: number;
  actorId: string;
  documentId: string;
}