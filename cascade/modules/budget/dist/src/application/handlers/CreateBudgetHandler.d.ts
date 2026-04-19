import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { CreateBudgetCommand } from '../commands/CreateBudgetCommand';
import { BudgetCreated } from '../events/BudgetCreated';
export declare class CreateBudgetHandler {
    private readonly guardian;
    constructor(guardian: BudgetGuardian);
    handle(cmd: CreateBudgetCommand): BudgetCreated;
}
//# sourceMappingURL=CreateBudgetHandler.d.ts.map