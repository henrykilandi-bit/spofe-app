/**
 * Budget Query Controller - GET endpoints only
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 * Principe: CQRS strict, Guardian non impliqué
 */
import { BudgetQueryRepository } from '../infrastructure/budget.query.repository';
import { BudgetProjectionDTO } from './dto/budget-projection.dto';
import { BudgetExecutionDTO } from './dto/budget-execution.dto';
import { BudgetVarianceDTO } from './dto/budget-variance.dto';
import { BudgetCumulativeDTO } from './dto/budget-cumulative.dto';
import { BudgetAlertDTO } from './dto/budget-alert.dto';
export declare class BudgetQueryController {
    private readonly repo;
    constructor(repo: BudgetQueryRepository);
    projection(req: any): Promise<BudgetProjectionDTO[]>;
    execution(req: any): Promise<BudgetExecutionDTO[]>;
    variance(req: any): Promise<BudgetVarianceDTO[]>;
    cumulative(req: any): Promise<BudgetCumulativeDTO[]>;
    alerts(req: any): Promise<BudgetAlertDTO[]>;
}
//# sourceMappingURL=budget.query.controller.d.ts.map