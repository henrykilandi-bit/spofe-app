/**
 * Budget Transaction Manager
 * Orchestration: Guardian + Repository + Atomicité
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 2
 */

import { Pool } from 'pg';
import { BudgetObjectifAggregate } from '../domain/budget.aggregate';
import { BudgetCommand } from '../domain/commands';
import { BudgetInvariants, GuardianResult } from '../guardian/budget.invariants';
import { BudgetRepository, PostgresBudgetRepository } from './budget.repository';

export interface TransactionResult {
  success: boolean;
  budgetId?: string;
  violations?: string[];
}

export class BudgetTransactionManager {
  private repository: BudgetRepository;

  constructor(private readonly pool: Pool) {
    this.repository = new PostgresBudgetRepository(pool);
  }

  async executeCommand(command: BudgetCommand): Promise<TransactionResult> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('SET app.tenant_id = $1', [command.tenantId]);

      let result: TransactionResult;

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
          throw new Error(`Unknown command type: ${(command as any).type}`);
      }

      if (result.success) {
        await client.query('COMMIT');
      } else {
        await client.query('ROLLBACK');
      }

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async handleCreate(command: any, client: any): Promise<TransactionResult> {
    const aggregate = BudgetObjectifAggregate.create({
      id: this.generateId(),
      tenantId: command.tenantId,
      period: command.period,
      objectives: command.objectives,
      createdBy: command.createdBy,
    });

    const existingBudgets = await this.repository.findByPeriod(
      command.period,
      command.tenantId,
      client
    );

    const guardianResult = BudgetInvariants.validateAll(aggregate.getState(), existingBudgets);

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

  private async handleUpdateObjectives(command: any, client: any): Promise<TransactionResult> {
    const budget = await this.repository.findById(command.budgetId, command.tenantId, client);

    if (!budget) {
      return {
        success: false,
        violations: ['Budget not found'],
      };
    }

    const aggregate = BudgetObjectifAggregate.fromState(budget);

    const immutabilityCheck = BudgetInvariants.invariantImmutableAfterValidation(budget);
    if (!immutabilityCheck.ok) {
      return {
        success: false,
        violations: immutabilityCheck.violations.map((v) => `${v.code}: ${v.message}`),
      };
    }

    aggregate.updateObjectives(command.objectives, command.updatedBy);

    const guardianResult = BudgetInvariants.validateAll(aggregate.getState());

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

  private async handleValidate(command: any, client: any): Promise<TransactionResult> {
    const budget = await this.repository.findById(command.budgetId, command.tenantId, client);

    if (!budget) {
      return {
        success: false,
        violations: ['Budget not found'],
      };
    }

    const aggregate = BudgetObjectifAggregate.fromState(budget);

    const transitionCheck = BudgetInvariants.invariantAllowedStateTransitions(
      budget.status,
      'VALIDATED'
    );
    if (!transitionCheck.ok) {
      return {
        success: false,
        violations: transitionCheck.violations.map((v) => `${v.code}: ${v.message}`),
      };
    }

    aggregate.validate(command.validatedBy);

    const guardianResult = BudgetInvariants.validateAll(aggregate.getState());

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

  private async handleAttachCostStructure(command: any, client: any): Promise<TransactionResult> {
    const budget = await this.repository.findById(command.budgetId, command.tenantId, client);

    if (!budget) {
      return {
        success: false,
        violations: ['Budget not found'],
      };
    }

    const aggregate = BudgetObjectifAggregate.fromState(budget);
    aggregate.attachCostStructure(command.costStructures, command.attachedBy);

    await this.repository.save(aggregate.getState(), client);

    return {
      success: true,
      budgetId: aggregate.getState().id,
    };
  }

  private async handleDefineSalesCapacity(command: any, client: any): Promise<TransactionResult> {
    const budget = await this.repository.findById(command.budgetId, command.tenantId, client);

    if (!budget) {
      return {
        success: false,
        violations: ['Budget not found'],
      };
    }

    const aggregate = BudgetObjectifAggregate.fromState(budget);
    aggregate.defineSalesCapacity(command.salesCapacities, command.definedBy);

    await this.repository.save(aggregate.getState(), client);

    return {
      success: true,
      budgetId: aggregate.getState().id,
    };
  }

  private async handleDefinePaymentTerms(command: any, client: any): Promise<TransactionResult> {
    const budget = await this.repository.findById(command.budgetId, command.tenantId, client);

    if (!budget) {
      return {
        success: false,
        violations: ['Budget not found'],
      };
    }

    const aggregate = BudgetObjectifAggregate.fromState(budget);
    aggregate.definePaymentTerms(command.paymentTerms, command.definedBy);

    await this.repository.save(aggregate.getState(), client);

    return {
      success: true,
      budgetId: aggregate.getState().id,
    };
  }

  private async handleClose(command: any, client: any): Promise<TransactionResult> {
    const budget = await this.repository.findById(command.budgetId, command.tenantId, client);

    if (!budget) {
      return {
        success: false,
        violations: ['Budget not found'],
      };
    }

    const aggregate = BudgetObjectifAggregate.fromState(budget);

    const transitionCheck = BudgetInvariants.invariantAllowedStateTransitions(
      budget.status,
      'CLOSED'
    );
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

  private generateId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
