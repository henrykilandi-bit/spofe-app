"use strict";
/**
 * Budget Transaction Manager
 * Orchestration: Guardian + Repository + Atomicité
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetTransactionManager = void 0;
const budget_aggregate_1 = require("../domain/budget.aggregate");
const budget_invariants_1 = require("../guardian/budget.invariants");
const budget_repository_1 = require("./budget.repository");
class BudgetTransactionManager {
    constructor(pool) {
        this.pool = pool;
        this.repository = new budget_repository_1.PostgresBudgetRepository(pool);
    }
    async executeCommand(command) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SET app.tenant_id = $1', [command.tenantId]);
            let result;
            switch (command.type) {
                case 'CREATE_BUDGET_OBJECTIF':
                    result = await this.handleCreate(command, client);
                    break;
                case 'UPDATE_BUDGET_OBJECTIVES':
                    result = await this.handleUpdateObjectives(command, client);
                    break;
                case 'VALIDATE_BUDGET_OBJECTIF':
                    result = await this.handleValidate(command, client);
                    break;
                case 'ATTACH_COST_STRUCTURE':
                    result = await this.handleAttachCostStructure(command, client);
                    break;
                case 'DEFINE_SALES_CAPACITY':
                    result = await this.handleDefineSalesCapacity(command, client);
                    break;
                case 'DEFINE_PAYMENT_TERMS':
                    result = await this.handleDefinePaymentTerms(command, client);
                    break;
                case 'CLOSE_BUDGET_OBJECTIF':
                    result = await this.handleClose(command, client);
                    break;
                default:
                    throw new Error(`Unknown command type: ${command.type}`);
            }
            if (result.success) {
                await client.query('COMMIT');
            }
            else {
                await client.query('ROLLBACK');
            }
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async handleCreate(command, client) {
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.create({
            id: this.generateId(),
            tenantId: command.tenantId,
            period: command.period,
            objectives: command.objectives,
            createdBy: command.createdBy,
        });
        const existingBudgets = await this.repository.findByPeriod(command.period, command.tenantId, client);
        const guardianResult = budget_invariants_1.BudgetInvariants.validateAll(aggregate.getState(), existingBudgets);
        if (!guardianResult.ok) {
            return {
                success: false,
                violations: guardianResult.violations.map((v) => `${v.code}: ${v.message}`),
            };
        }
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    async handleUpdateObjectives(command, client) {
        const budget = await this.repository.findById(command.budgetId, command.tenantId, client);
        if (!budget) {
            return {
                success: false,
                violations: ['Budget not found'],
            };
        }
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.fromState(budget);
        const immutabilityCheck = budget_invariants_1.BudgetInvariants.invariantImmutableAfterValidation(budget);
        if (!immutabilityCheck.ok) {
            return {
                success: false,
                violations: immutabilityCheck.violations.map((v) => `${v.code}: ${v.message}`),
            };
        }
        aggregate.updateObjectives(command.objectives, command.updatedBy);
        const guardianResult = budget_invariants_1.BudgetInvariants.validateAll(aggregate.getState());
        if (!guardianResult.ok) {
            return {
                success: false,
                violations: guardianResult.violations.map((v) => `${v.code}: ${v.message}`),
            };
        }
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    async handleValidate(command, client) {
        const budget = await this.repository.findById(command.budgetId, command.tenantId, client);
        if (!budget) {
            return {
                success: false,
                violations: ['Budget not found'],
            };
        }
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.fromState(budget);
        const transitionCheck = budget_invariants_1.BudgetInvariants.invariantAllowedStateTransitions(budget.status, 'VALIDATED');
        if (!transitionCheck.ok) {
            return {
                success: false,
                violations: transitionCheck.violations.map((v) => `${v.code}: ${v.message}`),
            };
        }
        aggregate.validate(command.validatedBy);
        const guardianResult = budget_invariants_1.BudgetInvariants.validateAll(aggregate.getState());
        if (!guardianResult.ok) {
            return {
                success: false,
                violations: guardianResult.violations.map((v) => `${v.code}: ${v.message}`),
            };
        }
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    async handleAttachCostStructure(command, client) {
        const budget = await this.repository.findById(command.budgetId, command.tenantId, client);
        if (!budget) {
            return {
                success: false,
                violations: ['Budget not found'],
            };
        }
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.fromState(budget);
        aggregate.attachCostStructure(command.costStructures, command.attachedBy);
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    async handleDefineSalesCapacity(command, client) {
        const budget = await this.repository.findById(command.budgetId, command.tenantId, client);
        if (!budget) {
            return {
                success: false,
                violations: ['Budget not found'],
            };
        }
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.fromState(budget);
        aggregate.defineSalesCapacity(command.salesCapacities, command.definedBy);
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    async handleDefinePaymentTerms(command, client) {
        const budget = await this.repository.findById(command.budgetId, command.tenantId, client);
        if (!budget) {
            return {
                success: false,
                violations: ['Budget not found'],
            };
        }
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.fromState(budget);
        aggregate.definePaymentTerms(command.paymentTerms, command.definedBy);
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    async handleClose(command, client) {
        const budget = await this.repository.findById(command.budgetId, command.tenantId, client);
        if (!budget) {
            return {
                success: false,
                violations: ['Budget not found'],
            };
        }
        const aggregate = budget_aggregate_1.BudgetObjectifAggregate.fromState(budget);
        const transitionCheck = budget_invariants_1.BudgetInvariants.invariantAllowedStateTransitions(budget.status, 'CLOSED');
        if (!transitionCheck.ok) {
            return {
                success: false,
                violations: transitionCheck.violations.map((v) => `${v.code}: ${v.message}`),
            };
        }
        aggregate.close(command.closedBy);
        await this.repository.save(aggregate.getState(), client);
        return {
            success: true,
            budgetId: aggregate.getState().id,
        };
    }
    generateId() {
        return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.BudgetTransactionManager = BudgetTransactionManager;
//# sourceMappingURL=budget.transaction-manager.js.map