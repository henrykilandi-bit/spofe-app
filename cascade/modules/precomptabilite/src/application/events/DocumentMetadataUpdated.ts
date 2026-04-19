export interface DocumentMetadataUpdated {
  type: 'DocumentMetadataUpdated';
  payload: {
    tenantId: string;
    documentId: string;
    metadata?: {
      documentDate?: string;
      amount?: number;
      currency?: string;
      supplierName?: string;
      reference?: string;
      vatDeclared?: number;
    };
    analytics?: {
      projectId?: string;
      costCenterId?: string;
    };
    occurredAt: string;
  };
}
