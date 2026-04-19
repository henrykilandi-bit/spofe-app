export interface SubmitForValidationCommand {
  commandId: string;
  tenantId: string;
  actorId: string;

  documentId: string;
  currentStatus: 'DRAFT';
}
