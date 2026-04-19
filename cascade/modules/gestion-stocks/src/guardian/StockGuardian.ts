// src/guardian/StockGuardian.ts

import { GuardianError } from './GuardianError';
import {
  GuardianContext,
  StockMovementFact,
} from './types';

export class StockGuardian {
  validate(ctx: GuardianContext, fact: StockMovementFact): void {
    this.assertTenantIsolation(ctx, fact);              // GS-01
    this.assertDocumentValidated(fact);                 // GS-02
    this.assertActorPresent(ctx);                       // GS-03
    this.assertNonZeroQuantity(fact);                   // GS-04
    this.assertNoNegativeStock(fact);                   // GS-05
    this.assertProductPresent(fact);                    // GS-06
    this.assertDepotPresent(fact);                      // GS-07
    this.assertLotsIfRequired(fact);                    // GS-08
    this.assertTransferConsistency(fact);               // GS-09
    this.assertNoFinancialFields(fact);                 // GS-11 / GS-12
  }

  // -------------------------
  // Invariants (1 méthode = 1 règle)
  // -------------------------

  private assertTenantIsolation(
    ctx: GuardianContext,
    fact: StockMovementFact
  ): void {
    if (ctx.tenantId !== fact.tenantId) {
      throw new GuardianError('GS-01: Cross-tenant movement rejected');
    }
  }

  private assertDocumentValidated(fact: StockMovementFact): void {
    if (fact.documentStatus !== 'VALIDATED') {
      throw new GuardianError('GS-02: Document must be validated');
    }
    if (!fact.documentId) {
      throw new GuardianError('GS-02: DocumentId is mandatory');
    }
  }

  private assertActorPresent(ctx: GuardianContext): void {
    if (!ctx.actorId) {
      throw new GuardianError('GS-03: actorId is mandatory');
    }
  }

  private assertNonZeroQuantity(fact: StockMovementFact): void {
    if (fact.quantity === 0) {
      throw new GuardianError('GS-04: Quantity must be non-zero');
    }
  }

  private assertNoNegativeStock(fact: StockMovementFact): void {
    if (fact.resultingStock < 0) {
      throw new GuardianError('GS-05: Negative stock is forbidden');
    }
  }

  private assertProductPresent(fact: StockMovementFact): void {
    if (!fact.productId) {
      throw new GuardianError('GS-06: productId is mandatory');
    }
  }

  private assertDepotPresent(fact: StockMovementFact): void {
    if (!fact.depotId) {
      throw new GuardianError('GS-07: depotId is mandatory');
    }
  }

  private assertLotsIfRequired(fact: StockMovementFact): void {
    // lots optionnels par contrat — s'ils sont présents, ils doivent être non vides
    if (fact.lots && fact.lots.length === 0) {
      throw new GuardianError(
        'GS-08: Lots provided but empty'
      );
    }
  }

  private assertTransferConsistency(fact: StockMovementFact): void {
    if (fact.movementType === 'TRANSFER') {
      if (!fact.targetDepotId) {
        throw new GuardianError(
          'GS-09: targetDepotId is required for transfer'
        );
      }
      if (fact.targetDepotId === fact.depotId) {
        throw new GuardianError(
          'GS-09: source and target depots must differ'
        );
      }
    }
  }

  private assertNoFinancialFields(fact: StockMovementFact): void {
    const forbiddenKeys = [
      'unitCost',
      'totalCost',
      'valuation',
      'currency',
      'account',
    ];

    for (const key of forbiddenKeys) {
      if ((fact as any)[key] !== undefined) {
        throw new GuardianError(
          `GS-11/12: Financial field "${key}" is forbidden in Stock module`
        );
      }
    }
  }
}
