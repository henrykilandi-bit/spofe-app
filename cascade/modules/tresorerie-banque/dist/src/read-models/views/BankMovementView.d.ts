export interface BankMovementView {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    type: "DEBIT" | "CREDIT";
    amount: number;
    bankDate: string;
    documentId: string;
    recordedAt: string;
}
//# sourceMappingURL=BankMovementView.d.ts.map