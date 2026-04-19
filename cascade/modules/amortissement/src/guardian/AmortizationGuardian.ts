// src/guardian/AmortizationGuardian.ts

import { GuardianError } from './GuardianError';
import {
  GuardianContext,
  AmortizationPlanCommand,
} from './types';
import { AmortizationCalculator } from './AmortizationCalculator';

export class AmortizationGuardian {
  validate(
    ctx: GuardianContext,
    cmd: AmortizationPlanCommand
  ): void {
    this.assertTenantIsolation(ctx, cmd);          // AM-01
    this.assertActorPresent(ctx);                  // AM-01 bis
    this.assertAssetSource(cmd);                   // AM-02
    this.assertMethodValid(cmd);                   // AM-03
    this.assertDurationPositive(cmd);              // AM-04
    this.assertAcquisitionValue(cmd);              // AM-05
    this.assertResidualValue(cmd);                 // AM-06
    this.assertNoFiscalOrDecisionFields(cmd);      // AM-10/11/12
    this.assertRevisionAppendOnly(cmd);            // AM-09

    // Calcul normatif (obligatoire)
    this.computeDotation(cmd);                     // AM-07/08
  }

  // -------------------------
  // Invariants
  // -------------------------

  private assertTenantIsolation(
    ctx: GuardianContext,
    cmd: AmortizationPlanCommand
  ): void {
    if (ctx.tenantId !== cmd.tenantId) {
      throw new GuardianError('AM-01: Cross-tenant command rejected');
    }
  }

  private assertActorPresent(ctx: GuardianContext): void {
    if (!ctx.actorId) {
      throw new GuardianError('AM-01: actorId is mandatory');
    }
  }

  private assertAssetSource(cmd: AmortizationPlanCommand): void {
    if (!cmd.asset || !cmd.asset.assetId) {
      throw new GuardianError('AM-02: Asset source is mandatory');
    }
  }

  private assertMethodValid(cmd: AmortizationPlanCommand): void {
    if (!cmd.method) {
      throw new GuardianError('AM-03: Amortization method is mandatory');
    }
  }

  private assertDurationPositive(cmd: AmortizationPlanCommand): void {
    const duration = this.getEffectiveUsefulLifeMonths(cmd);

    if (duration <= 0) {
      throw new GuardianError('AM-04: Useful life must be > 0');
    }
  }

  private assertAcquisitionValue(cmd: AmortizationPlanCommand): void {
    if (cmd.asset.acquisitionValue <= 0) {
      throw new GuardianError('AM-05: Acquisition value must be > 0');
    }
  }

  private assertResidualValue(cmd: AmortizationPlanCommand): void {
    if (this.getEffectiveResidualValue(cmd) < 0) {
      throw new GuardianError('AM-06: Residual value must be >= 0');
    }
  }

  private assertRevisionAppendOnly(cmd: AmortizationPlanCommand): void {
    if (
      cmd.commandType === 'REVISE_PLAN' &&
      !cmd.revision
    ) {
      throw new GuardianError(
        'AM-09: Revision must be explicit and historized'
      );
    }
  }

  private assertNoFiscalOrDecisionFields(
    cmd: AmortizationPlanCommand
  ): void {
    const forbidden = [
      'taxImpact',
      'fiscalOptimization',
      'decision',
      'recommendation',
      'plusValue',
      'minusValue',
    ];

    for (const key of forbidden) {
      if ((cmd as any)[key] !== undefined) {
        throw new GuardianError(
          `AM-10/11/12: Forbidden field "${key}"` 
        );
      }
    }
  }

  private computeDotation(cmd: AmortizationPlanCommand): void {
    const life = this.getEffectiveUsefulLifeMonths(cmd);
    const residualValue = this.getEffectiveResidualValue(cmd);
    const amortizableBase =
      cmd.asset.acquisitionValue - residualValue;

    if (amortizableBase < 0) {
      throw new GuardianError(
        'AM-07/08: Amortizable base must be >= 0'
      );
    }

    const result = AmortizationCalculator.compute(
      cmd.method,
      cmd.asset.acquisitionValue,
      residualValue,
      life
    );

    if (result.monthlyDotation < 0) {
      throw new GuardianError(
        'AM-07: Dotation must be >= 0'
      );
    }
  }

  private getEffectiveUsefulLifeMonths(
    cmd: AmortizationPlanCommand
  ): number {
    return (
      cmd.revision?.usefulLifeMonths ??
      cmd.asset.usefulLifeMonths
    );
  }

  private getEffectiveResidualValue(
    cmd: AmortizationPlanCommand
  ): number {
    return (
      cmd.revision?.residualValue ??
      cmd.asset.residualValue
    );
  }
}
