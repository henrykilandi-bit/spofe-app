import { BudgetReadRepository } from '../ports/BudgetReadRepository';
import { BudgetObjectiveRM, BudgetCashflowRM, BudgetVarianceRM, BudgetTimelineRM, BudgetAlertRM } from '../types';
export declare class InMemoryBudgetReadRepository implements BudgetReadRepository {
    private readonly objectives;
    private readonly cashflows;
    private readonly variances;
    private readonly timelines;
    private readonly alerts;
    constructor(objectives: BudgetObjectiveRM[], cashflows: BudgetCashflowRM[], variances: BudgetVarianceRM[], timelines: BudgetTimelineRM[], alerts: BudgetAlertRM[]);
    getObjectives(tenantId: string): Promise<BudgetObjectiveRM[]>;
    getCashflows(tenantId: string): Promise<BudgetCashflowRM[]>;
    getVariances(tenantId: string): Promise<BudgetVarianceRM[]>;
    getTimeline(tenantId: string): Promise<BudgetTimelineRM[]>;
    getAlerts(tenantId: string): Promise<BudgetAlertRM[]>;
}
//# sourceMappingURL=InMemoryBudgetReadRepository.d.ts.map