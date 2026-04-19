import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { UpdateBudgetCommand } from '../commands/UpdateBudgetCommand';
import { BudgetUpdated } from '../events/BudgetUpdated';
export declare class UpdateBudgetHandler {
    private readonly guardian;
    constructor(guardian: BudgetGuardian);
    handle(cmd: UpdateBudgetCommand): BudgetUpdated;
}
//# sourceMappingURL=UpdateBudgetHandler.d.ts.map