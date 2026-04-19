export interface BankDocumentView {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    documentId: string;
    documentType: "STATEMENT" | "DEBIT_NOTICE" | "CREDIT_NOTICE";
    documentDate: string;
    registeredAt: string;
}
//# sourceMappingURL=BankDocumentView.d.ts.map