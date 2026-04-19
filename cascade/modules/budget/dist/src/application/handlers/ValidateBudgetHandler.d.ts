import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { ValidateBudgetCommand } from '../commands/ValidateBudgetCommand';
import { BudgetValidated } from '../events/BudgetValidated';
export declare class ValidateBudgetHandler {
    private readonly guardian;
    constructor(guardian: BudgetGuardian);
    handle(cmd: ValidateBudgetCommand): BudgetValidated;
}
//# sourceMappingURL=ValidateBudgetHandler.d.ts.map