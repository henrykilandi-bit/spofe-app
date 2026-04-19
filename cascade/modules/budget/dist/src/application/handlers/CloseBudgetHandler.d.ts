import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { CloseBudgetCommand } from '../commands/CloseBudgetCommand';
import { BudgetClosed } from '../events/BudgetClosed';
export declare class CloseBudgetHandler {
    private readonly guardian;
    constructor(guardian: BudgetGuardian);
    handle(cmd: CloseBudgetCommand): BudgetClosed;
}
//# sourceMappingURL=CloseBudgetHandler.d.ts.map