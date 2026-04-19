export interface RecordCashDiscrepancyCommand {
  tenantId: string;
  actorId: string;
  cashRegisterId: string;
  discrepancyAmount: number;
  documentId: string;
}