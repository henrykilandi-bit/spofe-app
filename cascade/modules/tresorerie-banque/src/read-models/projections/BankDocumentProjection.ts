import { BankDocumentView } from "../views/BankDocumentView";

export class BankDocumentProjection {
  project(event: any): BankDocumentView | null {
    if (event.type !== "BankDocumentRegistered") return null;

    return {
      tenantId: event.tenantId,
      bankId: event.bankId,
      bankAccountId: event.bankAccountId,
      documentId: event.documentId,
      documentType: event.documentType,
      documentDate: event.documentDate,
      registeredAt: event.registeredAt
    };
  }
}
