import { CashRegisterStateView } from "../views/CashRegisterStateView";

export class CashRegisterStateProjection {
  project(current: CashRegisterStateView | null, event: any): CashRegisterStateView {
    if (event.type === "CashRegisterOpened") {
      return {
        tenantId: event.tenantId,
        cashRegisterId: event.cashRegisterId,
        status: "OPEN",
        openingAmount: event.openingAmount,
        currentTheoreticalAmount: event.openingAmount,
        openedAt: event.openedAt
      };
    }

    if (!current) return current as any;

    if (event.type === "CashMovementRecorded") {
      const delta = event.movementType === "IN" ? event.amount : -event.amount;
      return {
        ...current,
        currentTheoreticalAmount: current.currentTheoreticalAmount + delta
      };
    }

    if (event.type === "CashRegisterClosed") {
      return {
        ...current,
        status: "CLOSED",
        closedAt: event.closedAt
      };
    }

    return current;
  }
}