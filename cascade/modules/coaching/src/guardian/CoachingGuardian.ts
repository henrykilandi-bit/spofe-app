// src/guardian/CoachingGuardian.ts

import { GuardianViolationError } from './errors';
import { GuardianContext } from './invariants';

export class CoachingGuardian {

  // -------------------------
  // ENTRY POINT
  // -------------------------
  validate(ctx: GuardianContext): void {
    this.requireActor(ctx);
    this.requireTenant(ctx);
    this.forbidCalculations(ctx);
    this.forbidDecisions(ctx);

    if (this.isExchangeCommand(ctx)) {
      this.requirePlannedSession(ctx);
      this.requireActiveSession(ctx);
    }
  }

  // -------------------------
  // INVARIANTS
  // -------------------------

  private requireActor(ctx: GuardianContext) {
    if (!ctx.actorId) {
      throw new GuardianViolationError(
        'Actor SPOFE requis pour toute action de coaching'
      );
    }
  }

  private requireTenant(ctx: GuardianContext) {
    if (!ctx.tenantId) {
      throw new GuardianViolationError(
        'TenantId requis — isolation stricte par tenant'
      );
    }
  }

  private forbidCalculations(ctx: GuardianContext) {
    const forbiddenKeywords = [
      'calculate',
      'compute',
      'simulate',
      'whatIf',
      'whatIfScenario',
      'scenario',
      'forecast',
      'roi',
      'bfr',
      'threshold',
      'breakEven',
    ];

    forbiddenKeywords.forEach(keyword => {
      if (ctx.commandType.toLowerCase().includes(keyword)) {
        throw new GuardianViolationError(
          `Calcul économique interdit dans le module Coaching (${keyword})` 
        );
      }
    });
  }

  private forbidDecisions(ctx: GuardianContext) {
    const forbiddenKeywords = [
      'decide',
      'approve',
      'prioritize',
      'recommend',
      'Automatically',
    ];

    forbiddenKeywords.forEach(keyword => {
      if (ctx.commandType.toLowerCase().includes(keyword)) {
        throw new GuardianViolationError(
          `Décision automatique interdite dans le module Coaching (${keyword})` 
        );
      }
    });
  }

  private requirePlannedSession(ctx: GuardianContext) {
    if (!ctx.sessionPlanned) {
      throw new GuardianViolationError(
        'Aucun échange autorisé sans entretien planifié'
      );
    }
  }

  private requireActiveSession(ctx: GuardianContext) {
    if (!ctx.sessionActive) {
      throw new GuardianViolationError(
        'Aucun échange autorisé hors période active de l\'entretien'
      );
    }
  }

  // -------------------------
  // HELPERS
  // -------------------------

  private isExchangeCommand(ctx: GuardianContext): boolean {
    return (
      ctx.commandType === 'AddCoachingExchange'
    );
  }
}
