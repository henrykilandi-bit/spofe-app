import { DocumentMetadata, AnalyticalAffectation } from '../../guardian/types';
export interface UpdateDocumentMetadataCommand {
    commandId: string;
    tenantId: string;
    actorId: string;
    documentId: string;
    metadata?: DocumentMetadata;
    analytics?: AnalyticalAffectation;
}
//# sourceMappingURL=UpdateDocumentMetadataCommand.d.ts.map