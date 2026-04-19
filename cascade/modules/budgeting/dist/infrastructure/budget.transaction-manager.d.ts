/**
 * Budget Transaction Manager
 * Orchestration: Guardian + Repository + Atomicité
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 2
 */
import { Pool } from 'pg';
import { BudgetCommand } from '../domain/commands';
export interface TransactionResult {
    success: boolean;
    budgetId?: string;
    violations?: string[];
}
export declare class BudgetTransactionManager {
    private readonly pool;
    private repository;
    constructor(pool: Pool);
    executeCommand(command: BudgetCommand): Promise<TransactionResult>;
    private handleCreate;
    private handleUpdateObjectives;
    private handleValidate;
    private handleAttachCostStructure;
    private handleDefineSalesCapacity;
    private handleDefinePaymentTerms;
    private handleClose;
    private generateId;
}
//# sourceMappingURL=budget.transaction-manager.d.ts.map