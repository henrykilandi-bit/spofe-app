import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { ValidateDocumentCommand } from '../commands/ValidateDocumentCommand';
import { DocumentValidated } from '../events/DocumentValidated';
export declare class ValidateDocumentHandler {
    private readonly guardian;
    constructor(guardian: PrecomptabiliteGuardian);
    handle(cmd: ValidateDocumentCommand): DocumentValidated;
}
//# sourceMappingURL=ValidateDocumentHandler.d.ts.map