import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { RejectDocumentCommand } from '../commands/RejectDocumentCommand';
import { DocumentRejected } from '../events/DocumentRejected';
export declare class RejectDocumentHandler {
    private readonly guardian;
    constructor(guardian: PrecomptabiliteGuardian);
    handle(cmd: RejectDocumentCommand): DocumentRejected;
}
//# sourceMappingURL=RejectDocumentHandler.d.ts.map