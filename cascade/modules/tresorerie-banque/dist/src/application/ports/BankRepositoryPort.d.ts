export interface BankRepositoryPort {
    bankExists(bankId: string): Promise<boolean>;
    bankAccountExists(bankAccountId: string): Promise<boolean>;
    documentExists(documentId: string): Promise<boolean>;
}
//# sourceMappingURL=BankRepositoryPort.d.ts.map