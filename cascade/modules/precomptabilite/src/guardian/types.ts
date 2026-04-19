// src/guardian/types.ts

export type DocumentType =
  | 'SUPPLIER_INVOICE'
  | 'RECEIPT'
  | 'EXPENSE_NOTE'
  | 'FINANCIAL_JUSTIFICATION';

export type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface DocumentMetadata {
  documentDate?: string;   // YYYY-MM-DD
  amount?: number;         // montant tel que présent sur le document
  currency?: string;
  supplierName?: string;
  reference?: string;
  vatDeclared?: number;    // TVA déclarée sur le document (pas recalculée)
}

export interface AnalyticalAffectation {
  projectId?: string;
  costCenterId?: string;
}

export interface PrecomptabiliteCommand {
  commandId: string;
  commandType:
    | 'CREATE_DOCUMENT'
    | 'UPDATE_METADATA'
    | 'SUBMIT_FOR_VALIDATION'
    | 'VALIDATE_DOCUMENT'
    | 'REJECT_DOCUMENT'
    | 'SUSPEND_DOCUMENT';

  tenantId: string;
  documentId: string;
  documentType?: DocumentType;
  status?: DocumentStatus;

  metadata?: DocumentMetadata;
  analytics?: AnalyticalAffectation;
}
