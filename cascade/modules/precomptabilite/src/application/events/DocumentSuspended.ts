export interface DocumentSuspended {
  type: 'DocumentSuspended';
  payload: {
    tenantId: string;
    documentId: string;
    reason?: string;
    occurredAt: string;
  };
}
