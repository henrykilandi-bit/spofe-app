export interface PreAccountingDocumentRM {
  tenantId: string;
  documentId: string;
  documentType: string;

  documentDate?: string;
  amount?: number;
  currency?: string;
  supplierName?: string;
  reference?: string;
  vatDeclared?: number;

  createdAt: string;
}
