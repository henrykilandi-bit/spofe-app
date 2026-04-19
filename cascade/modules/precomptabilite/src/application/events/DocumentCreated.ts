export interface DocumentCreated {
  type: 'DocumentCreated';
  payload: {
    tenantId: string;
    documentId: string;
    documentType: string;
    occurredAt: string;
  };
}
