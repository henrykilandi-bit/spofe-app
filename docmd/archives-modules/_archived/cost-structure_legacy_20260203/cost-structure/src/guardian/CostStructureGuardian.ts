// src/guardian/CostStructureGuardian.ts

import { GuardianError } from './GuardianError';
import {
  GuardianContext,
  BuildCostStructureCommand,
} from './types';
import { CostStructureCalculator } from './CostStructureCalculator';

export class CostStructureGuardian {
  validate(
    ctx: GuardianContext,
    cmd: BuildCostStructureCommand
  ): void {
    this.assertTenantIsolation(ctx, cmd);        // CS-01
    this.assertActor(ctx);                       // CS-01 bis
    this.assertSources(cmd);                     // CS-02 / CS-03
    this.assertNoPriceDependency(cmd);           // CS-04
    this.assertCompleteStructure(cmd);           // CS-05
    this.assertAllocations(cmd);                 // CS-06 / CS-07
    this.assertNoForbiddenLogic(cmd);             // CS-08/09/10
    this.assertAppendOnly(cmd);                  // CS-11
    this.assertExplicitMethod(cmd);              // CS-12

    // Calcul analytique obligatoire
    this.compute(cmd);
  }

  // ---------------- Invariants ----------------

  private assertTenantIsolation(
    ctx: GuardianContext,
    cmd: BuildCostStructureCommand
  ) {
    if (ctx.tenantId !== cmd.tenantId) {
      throw new GuardianError('CS-01: Cross-tenant command rejected');
    }
  }

  private assertActor(ctx: GuardianContext) {
    if (!ctx.actorId) {
      throw new GuardianError('CS-01: actorId mandatory');
    }
  }

  private assertSources(cmd: BuildCostStructureCommand) {
    if (!cmd.sources || cmd.sources.length === 0) {
      throw new GuardianError('CS-02: At least one source required');
    }

    for (const s of cmd.sources) {
      if (!['STOCK', 'AMORTIZATION'].includes(s.sourceType)) {
        throw new GuardianError('CS-02: Invalid source type');
      }
    }
  }

  private assertNoPriceDependency(cmd: BuildCostStructureCommand) {
    const forbidden = ['price', 'salePrice', 'margin'];
    forbidden.forEach(f => {
      if ((cmd as any)[f] !== undefined) {
        throw new GuardianError('CS-04: Price dependency forbidden');
      }
    });
  }

  private assertCompleteStructure(cmd: BuildCostStructureCommand) {
    const invalid = cmd.sources.some(
      s =>
        s.amount === undefined &&
        (s.quantity === undefined || s.unitCost === undefined)
    );
    if (invalid) {
      throw new GuardianError('CS-05: Incomplete cost source');
    }
  }

  private assertAllocations(cmd: BuildCostStructureCommand) {
    const sum = cmd.allocations.reduce(
      (acc, a) => acc + a.ratio,
      0
    );

    if (sum !== 1) {
      throw new GuardianError('CS-07: Allocation ratios must sum to 1');
    }

    for (const a of cmd.allocations) {
      if (a.ratio < 0 || a.ratio > 1) {
        throw new GuardianError('CS-06: Invalid allocation ratio');
      }
    }
  }

  private assertNoForbiddenLogic(cmd: BuildCostStructureCommand) {
    const forbidden = [
      'decision',
      'recommendation',
      'taxImpact',
      'accountingEntry',
    ];

    forbidden.forEach(f => {
      if ((cmd as any)[f] !== undefined) {
        throw new GuardianError('CS-08/09/10: Forbidden logic detected');
      }
    });
  }

  private assertAppendOnly(cmd: BuildCostStructureCommand) {
    if (cmd.commandType === 'REVISE' && !cmd.commandId) {
      throw new GuardianError('CS-11: Revision must be historized');
    }
  }

  private assertExplicitMethod(cmd: BuildCostStructureCommand) {
    if (!cmd.level) {
      throw new GuardianError('CS-12: Cost level mandatory');
    }
  }

  private compute(cmd: BuildCostStructureCommand) {
    const result = CostStructureCalculator.compute(
      cmd.sources,
      cmd.allocations
    );

    if (result.totalCost < 0) {
      throw new GuardianError('CS-05: Total cost must be >= 0');
    }
  }
}
