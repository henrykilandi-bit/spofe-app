import { BudgetType, BudgetHypothesis, BudgetLine } from '../../guardian/types';
export interface CreateBudgetCommand {
    commandId: string;
    tenantId: string;
    actorId: string;
    budgetId: string;
    budgetType: BudgetType;
    periodFrom: string;
    periodTo: string;
    hypotheses: BudgetHypothesis[];
    lines: BudgetLine[];
}
//# sourceMappingURL=CreateBudgetCommand.d.ts.map