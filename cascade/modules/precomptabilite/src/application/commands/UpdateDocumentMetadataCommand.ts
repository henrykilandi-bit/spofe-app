import {
  DocumentMetadata,
  AnalyticalAffectation,
} from '../../guardian/types';

export interface UpdateDocumentMetadataCommand {
  commandId: string;
  tenantId: string;
  actorId: string;

  documentId: string;
  currentStatus: 'DRAFT';
  metadata?: DocumentMetadata;
  analytics?: AnalyticalAffectation;
}
