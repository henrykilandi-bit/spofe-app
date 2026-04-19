import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { CreateDocumentCommand } from '../commands/CreateDocumentCommand';
import { DocumentCreated } from '../events/DocumentCreated';
export declare class CreateDocumentHandler {
    private readonly guardian;
    constructor(guardian: PrecomptabiliteGuardian);
    handle(cmd: CreateDocumentCommand): DocumentCreated;
}
//# sourceMappingURL=CreateDocumentHandler.d.ts.map