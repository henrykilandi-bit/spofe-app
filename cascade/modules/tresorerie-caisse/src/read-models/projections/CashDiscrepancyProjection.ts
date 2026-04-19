import { CashDiscrepancyView } from "../views/CashDiscrepancyView";

export class CashDiscrepancyProjection {
  project(event: any): CashDiscrepancyView | null {
    if (event.type !== "CashDiscrepancyRecorded") return null;

    return {
      tenantId: event.tenantId,
      cashRegisterId: event.cashRegisterId,
      discrepancyAmount: event.discrepancyAmount,
      recordedAt: event.recordedAt,
      actorId: event.actorId,
      documentId: event.documentId
    };
  }
}