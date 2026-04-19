export interface CashRegisterStateView {
  tenantId: string;
  cashRegisterId: string;
  status: "OPEN" | "CLOSED";
  openingAmount: number;
  currentTheoreticalAmount: number;
  openedAt?: Date;
  closedAt?: Date;
}