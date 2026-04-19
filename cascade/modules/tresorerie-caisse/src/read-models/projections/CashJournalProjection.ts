import { CashJournalView } from "../views/CashJournalView";

export class CashJournalProjection {
  project(event: any): CashJournalView {
    return {
      tenantId: event.tenantId,
      cashRegisterId: event.cashRegisterId,
      eventType: event.type,
      movementType: event.movementType,
      amount: event.amount,
      actorId: event.actorId,
      documentId: event.documentId,
      occurredAt: event.recordedAt || event.openedAt || event.closedAt
    };
  }
}