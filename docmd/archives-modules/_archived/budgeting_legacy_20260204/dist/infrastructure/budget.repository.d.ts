/**
 * Budget Repository - PostgreSQL
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 2
 * Principe: Append-only, aucun UPDATE/DELETE
 */
import { Pool, PoolClient } from 'pg';
import { BudgetObjectif } from '../domain/budget.aggregate';
import { Period } from '../domain/value-objects';
export interface BudgetRepository {
    save(budget: BudgetObjectif, client?: PoolClient): Promise<void>;
    findById(id: string, tenantId: string, client?: PoolClient): Promise<BudgetObjectif | null>;
    findByPeriod(period: Period, tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]>;
    findAll(tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]>;
}
export declare class PostgresBudgetRepository implements BudgetRepository {
    private readonly pool;
    constructor(pool: Pool);
    save(budget: BudgetObjectif, client?: PoolClient): Promise<void>;
    findById(id: string, tenantId: string, client?: PoolClient): Promise<BudgetObjectif | null>;
    findByPeriod(period: Period, tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]>;
    findAll(tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]>;
    private mapRowToBudget;
}
//# sourceMappingURL=budget.repository.d.ts.map