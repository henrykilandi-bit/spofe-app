// src/guardian/BudgetGuardian.ts

import { GuardianError } from './GuardianError';
import {
  GuardianContext,
  BudgetCommand,
  BudgetHypothesis,
  BudgetLine,
} from './types';

export class BudgetGuardian {
  validate(ctx: GuardianContext, cmd: BudgetCommand): void {
    this.assertTenantIsolation(ctx, cmd);     // B-01
    this.assertActor(ctx);                    // B-02
    this.assertPeriods(cmd);                  // B-12
    this.assertCompleteness(cmd);             // B-03
    this.assertHypotheses(cmd);               // B-04
    this.assertAppendOnly(cmd);               // B-05
    this.assertStatusTransitions(cmd);        // B-06
    this.assertCertifiedSources(cmd);         // B-07
    this.assertNoForbiddenLogic(cmd);          // B-08..B-11
  }

  // ---------------- Invariants ----------------

  private assertTenantIsolation(
    ctx: GuardianContext,
    cmd: BudgetCommand
  ) {
    if (ctx.tenantId !== cmd.tenantId) {
      throw new GuardianError('B-01: Cross-tenant command rejected');
    }
  }

  private assertActor(ctx: GuardianContext) {
    if (!ctx.actorId) {
      throw new GuardianError('B-02: actorId is mandatory');
    }
  }

  private assertPeriods(cmd: BudgetCommand) {
    if (cmd.commandType === 'CREATE' || cmd.commandType === 'UPDATE') {
      if (!cmd.periodFrom || !cmd.periodTo) {
        throw new GuardianError('B-12: Budget period is mandatory');
      }
      if (cmd.periodFrom > cmd.periodTo) {
        throw new GuardianError('B-12: Invalid budget period range');
      }
    }
  }

  private assertCompleteness(cmd: BudgetCommand) {
    if (!cmd.budgetId) {
      throw new GuardianError('B-03: BudgetId is mandatory');
    }

    if (cmd.commandType === 'CREATE') {
      if (!cmd.budgetType || !cmd.periodFrom || !cmd.periodTo) {
        throw new GuardianError('B-03: BudgetType and periods are required on creation');
      }
      if (!cmd.hypotheses || cmd.hypotheses.length === 0) {
        throw new GuardianError('B-03: Hypotheses required on creation');
      }
      if (!cmd.lines || cmd.lines.length === 0) {
        throw new GuardianError('B-03: Budget lines required on creation');
      }
    }
  }

  private assertHypotheses(cmd: BudgetCommand) {
    if (!cmd.hypotheses) return;

    cmd.hypotheses.forEach((h: BudgetHypothesis) => {
      if (!h.key || h.value === undefined) {
        throw new GuardianError('B-04: Invalid hypothesis');
      }
    });
  }

  private assertAppendOnly(cmd: BudgetCommand) {
    if (
      (cmd.commandType === 'UPDATE' ||
        cmd.commandType === 'VALIDATE' ||
        cmd.commandType === 'CLOSE') &&
      !cmd.commandId
    ) {
      throw new GuardianError('B-05: Append-only commandId required');
    }
  }

  private assertStatusTransitions(cmd: BudgetCommand) {
    if (cmd.commandType === 'VALIDATE' && cmd.status !== 'DRAFT') {
      throw new GuardianError('B-06: Only DRAFT budget can be validated');
    }

    if (cmd.commandType === 'CLOSE' && cmd.status !== 'VALIDATED') {
      throw new GuardianError('B-06: Only VALIDATED budget can be closed');
    }
  }

  private assertCertifiedSources(cmd: BudgetCommand) {
    if (!cmd.hypotheses) return;

    cmd.hypotheses.forEach(h => {
      if (
        h.sourceModule &&
        !['COST_STRUCTURE', 'AMORTIZATION', 'STOCK', 'SALES'].includes(
          h.sourceModule
        )
      ) {
        throw new GuardianError(
          'B-07: Hypothesis source module not certified'
        );
      }
    });
  }

  private assertNoForbiddenLogic(cmd: BudgetCommand) {
    const forbidden = [
      'unitCost',
      'quantity',
      'accountingEntry',
      'taxImpact',
      'decision',
      'arbitration',
    ];

    forbidden.forEach(f => {
      if ((cmd as any)[f] !== undefined) {
        throw new GuardianError(
          'B-08..B-11: Forbidden logic detected in Budget'
        );
      }
    });

    if (cmd.lines) {
      cmd.lines.forEach((l: BudgetLine) => {
        if (l.amount < 0) {
          throw new GuardianError('B-03: Budget line amount must be >= 0');
        }
      });
    }
  }
}
