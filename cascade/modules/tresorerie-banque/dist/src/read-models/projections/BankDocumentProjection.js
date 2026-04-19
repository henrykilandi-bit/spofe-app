"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankDocumentProjection = void 0;
class BankDocumentProjection {
    project(event) {
        if (event.type !== "BankDocumentRegistered")
            return null;
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
exports.BankDocumentProjection = BankDocumentProjection;
//# sourceMappingURL=BankDocumentProjection.js.map