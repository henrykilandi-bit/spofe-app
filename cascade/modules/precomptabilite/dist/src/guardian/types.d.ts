export type DocumentType = 'SUPPLIER_INVOICE' | 'RECEIPT' | 'EXPENSE_NOTE' | 'FINANCIAL_JUSTIFICATION';
export type DocumentStatus = 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'SUSPENDED';
export interface GuardianContext {
    tenantId: string;
    actorId: string;
}
export interface DocumentMetadata {
    documentDate?: string;
    amount?: number;
    currency?: string;
    supplierName?: string;
    reference?: string;
    vatDeclared?: number;
}
export interface AnalyticalAffectation {
    projectId?: string;
    costCenterId?: string;
}
export interface PrecomptabiliteCommand {
    commandId: string;
    commandType: 'CREATE_DOCUMENT' | 'UPDATE_METADATA' | 'SUBMIT_FOR_VALIDATION' | 'VALIDATE_DOCUMENT' | 'REJECT_DOCUMENT' | 'SUSPEND_DOCUMENT';
    tenantId: string;
    documentId: string;
    documentType?: DocumentType;
    status?: DocumentStatus;
    metadata?: DocumentMetadata;
    analytics?: AnalyticalAffectation;
}
//# sourceMappingURL=types.d.ts.map