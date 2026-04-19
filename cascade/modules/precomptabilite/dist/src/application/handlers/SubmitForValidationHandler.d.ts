import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { SubmitForValidationCommand } from '../commands/SubmitForValidationCommand';
import { DocumentSubmitted } from '../events/DocumentSubmitted';
export declare class SubmitForValidationHandler {
    private readonly guardian;
    constructor(guardian: PrecomptabiliteGuardian);
    handle(cmd: SubmitForValidationCommand): DocumentSubmitted;
}
//# sourceMappingURL=SubmitForValidationHandler.d.ts.map