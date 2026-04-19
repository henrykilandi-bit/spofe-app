export interface OpenCashRegisterCommand {
  tenantId: string;
  actorId: string;
  cashRegisterId: string;
  openingAmount: number;
  documentId: string;
}