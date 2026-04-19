import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { UpdateDocumentMetadataCommand } from '../commands/UpdateDocumentMetadataCommand';
import { DocumentMetadataUpdated } from '../events/DocumentMetadataUpdated';
export declare class UpdateDocumentMetadataHandler {
    private readonly guardian;
    constructor(guardian: PrecomptabiliteGuardian);
    handle(cmd: UpdateDocumentMetadataCommand): DocumentMetadataUpdated;
}
//# sourceMappingURL=UpdateDocumentMetadataHandler.d.ts.map