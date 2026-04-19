// src/guardian/ImmobilisationGuardian.ts
// IMMOBILISATION — Guardian (SPOFE P0)

import { GuardianError } from './GuardianError';
import { GuardianContext, ImmobilisationFact } from './types';

export class ImmobilisationGuardian {
  validateRegister(
    ctx: GuardianContext,
    fact: ImmobilisationFact
  ): void {
    this.assertTenant(ctx, fact);
    this.assertActor(ctx);
    this.assertCategory(fact);
    this.assertDocument(fact);
    this.assertPositiveAmount(fact);
    this.assertNoServiceDate(fact);
    this.assertNoDisposedDate(fact);
  }

  validatePutInService(
    ctx: GuardianContext,
    fact: ImmobilisationFact
  ): void {
    this.assertTenant(ctx, fact);
    this.assertActor(ctx);
    this.assertHasServiceDate(fact);
    this.assertServiceAfterAcquisition(fact);
    this.assertNotDisposed(fact);
  }

  validateDispose(
    ctx: GuardianContext,
    fact: ImmobilisationFact
  ): void {
    this.assertTenant(ctx, fact);
    this.assertActor(ctx);
    this.assertHasServiceDate(fact);
    this.assertHasDisposedDate(fact);
    this.assertDisposeAfterService(fact);
  }

  // ───────────── private invariants ─────────────

  private assertTenant(ctx: GuardianContext, fact: ImmobilisationFact) {
    if (ctx.tenantId !== fact.tenantId) {
      throw new GuardianError('Cross-tenant operation rejected');
    }
  }

  private assertActor(ctx: GuardianContext) {
    if (!ctx.actorId) {
      throw new GuardianError('ActorId is mandatory');
    }
  }

  private assertCategory(fact: ImmobilisationFact) {
    if (!fact.category) {
      throw new GuardianError('Immobilisation category is mandatory');
    }
  }

  private assertDocument(fact: ImmobilisationFact) {
    if (!fact.documentId) {
      throw new GuardianError('Document is mandatory');
    }
  }

  private assertPositiveAmount(fact: ImmobilisationFact) {
    if (fact.amount <= 0) {
      throw new GuardianError('Amount must be positive');
    }
  }

  private assertNoServiceDate(fact: ImmobilisationFact) {
    if (fact.inServiceDate) {
      throw new GuardianError('Service date not allowed at registration');
    }
  }

  private assertNoDisposedDate(fact: ImmobilisationFact) {
    if (fact.disposedDate) {
      throw new GuardianError('Disposed date not allowed at registration');
    }
  }

  private assertHasServiceDate(fact: ImmobilisationFact) {
    if (!fact.inServiceDate) {
      throw new GuardianError('Service date is mandatory');
    }
  }

  private assertServiceAfterAcquisition(fact: ImmobilisationFact) {
    if (
      new Date(fact.inServiceDate!).getTime() <
      new Date(fact.acquisitionDate).getTime()
    ) {
      throw new GuardianError(
        'Service date must be after acquisition date'
      );
    }
  }

  private assertNotDisposed(fact: ImmobilisationFact) {
    if (fact.disposedDate) {
      throw new GuardianError('Already disposed immobilisation');
    }
  }

  private assertHasDisposedDate(fact: ImmobilisationFact) {
    if (!fact.disposedDate) {
      throw new GuardianError('Disposed date is mandatory');
    }
  }

  private assertDisposeAfterService(fact: ImmobilisationFact) {
    if (
      new Date(fact.disposedDate!).getTime() <
      new Date(fact.inServiceDate!).getTime()
    ) {
      throw new GuardianError(
        'Disposed date must be after service date'
      );
    }
  }
}
