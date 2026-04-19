export interface RejectDocumentCommand {
  commandId: string;
  tenantId: string;
  actorId: string;

  documentId: string;
  currentStatus: 'SUBMITTED';
  reason?: string;
}
