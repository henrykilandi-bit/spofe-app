export interface CloseCashRegisterCommand {
  tenantId: string;
  actorId: string;
  cashRegisterId: string;
  theoreticalAmount: number;
  realAmount: number;
  documentId: string;
}