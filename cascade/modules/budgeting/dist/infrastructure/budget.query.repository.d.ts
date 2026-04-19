/**
 * Budget Query Repository - Read-only SQL
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 * Principe: SQL only, aucune logique métier
 */
import { Pool } from 'pg';
import { BudgetProjectionDTO } from '../api/dto/budget-projection.dto';
import { BudgetExecutionDTO } from '../api/dto/budget-execution.dto';
import { BudgetVarianceDTO } from '../api/dto/budget-variance.dto';
import { BudgetCumulativeDTO } from '../api/dto/budget-cumulative.dto';
import { BudgetAlertDTO } from '../api/dto/budget-alert.dto';
export declare class BudgetQueryRepository {
    private readonly db;
    constructor(db: Pool);
    projection(tenantId: string): Promise<BudgetProjectionDTO[]>;
    execution(tenantId: string): Promise<BudgetExecutionDTO[]>;
    variance(tenantId: string): Promise<BudgetVarianceDTO[]>;
    cumulative(tenantId: string): Promise<BudgetCumulativeDTO[]>;
    alerts(tenantId: string): Promise<BudgetAlertDTO[]>;
}
//# sourceMappingURL=budget.query.repository.d.ts.map