export interface SuspendDocumentCommand {
    commandId: string;
    tenantId: string;
    actorId: string;
    documentId: string;
    currentStatus: 'DRAFT' | 'SUBMITTED';
    reason?: string;
}
//# sourceMappingURL=SuspendDocumentCommand.d.ts.map