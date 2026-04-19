import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { SuspendDocumentCommand } from '../commands/SuspendDocumentCommand';
import { DocumentSuspended } from '../events/DocumentSuspended';
export declare class SuspendDocumentHandler {
    private readonly guardian;
    constructor(guardian: PrecomptabiliteGuardian);
    handle(cmd: SuspendDocumentCommand): DocumentSuspended;
}
//# sourceMappingURL=SuspendDocumentHandler.d.ts.map