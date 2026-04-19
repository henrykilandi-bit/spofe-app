export interface DocumentSubmitted {
  type: 'DocumentSubmitted';
  payload: {
    tenantId: string;
    documentId: string;
    occurredAt: string;
  };
}
