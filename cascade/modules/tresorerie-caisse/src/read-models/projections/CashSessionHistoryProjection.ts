import { CashSessionHistoryView } from "../views/CashSessionHistoryView";

export class CashSessionHistoryProjection {
  project(event: any): CashSessionHistoryView | null {
    if (event.type === "CashRegisterOpened") {
      return {
        tenantId: event.tenantId,
        cashRegisterId: event.cashRegisterId,
        openedAt: event.openedAt,
        openingAmount: event.openingAmount,
        actorId: event.actorId,
        documentId: event.documentId
      };
    }

    if (event.type === "CashRegisterClosed") {
      return {
        tenantId: event.tenantId,
        cashRegisterId: event.cashRegisterId,
        openedAt: event.openedAt,
        closedAt: event.closedAt,
        openingAmount: event.openingAmount,
        theoreticalAmount: event.theoreticalAmount,
        realAmount: event.realAmount,
        actorId: event.actorId,
        documentId: event.documentId
      };
    }

    return null;
  }
}