import { CashMovementHistoryView } from "../views/CashMovementHistoryView";

export class CashMovementHistoryProjection {
  project(event: any): CashMovementHistoryView | null {
    if (event.type !== "CashMovementRecorded") return null;

    return {
      tenantId: event.tenantId,
      cashRegisterId: event.cashRegisterId,
      movementType: event.movementType,
      amount: event.amount,
      recordedAt: event.recordedAt,
      actorId: event.actorId,
      documentId: event.documentId
    };
  }
}