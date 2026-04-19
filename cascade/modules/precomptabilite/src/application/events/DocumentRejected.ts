export interface DocumentRejected {
  type: 'DocumentRejected';
  payload: {
    tenantId: string;
    documentId: string;
    reason?: string;
    occurredAt: string;
  };
}
