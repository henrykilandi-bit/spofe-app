export interface DocumentValidated {
  type: 'DocumentValidated';
  payload: {
    tenantId: string;
    documentId: string;
    occurredAt: string;
  };
}
