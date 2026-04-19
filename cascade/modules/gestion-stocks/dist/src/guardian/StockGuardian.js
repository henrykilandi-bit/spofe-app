"use strict";
// src/guardian/StockGuardian.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockGuardian = void 0;
const GuardianError_1 = require("./GuardianError");
class StockGuardian {
    validate(ctx, fact) {
        this.assertTenantIsolation(ctx, fact); // GS-01
        this.assertDocumentValidated(fact); // GS-02
        this.assertActorPresent(ctx); // GS-03
        this.assertNonZeroQuantity(fact); // GS-04
        this.assertNoNegativeStock(fact); // GS-05
        this.assertProductPresent(fact); // GS-06
        this.assertDepotPresent(fact); // GS-07
        this.assertLotsIfRequired(fact); // GS-08
        this.assertTransferConsistency(fact); // GS-09
        this.assertNoFinancialFields(fact); // GS-11 / GS-12
    }
    // -------------------------
    // Invariants (1 méthode = 1 règle)
    // -------------------------
    assertTenantIsolation(ctx, fact) {
        if (ctx.tenantId !== fact.tenantId) {
            throw new GuardianError_1.GuardianError('GS-01: Cross-tenant movement rejected');
        }
    }
    assertDocumentValidated(fact) {
        if (fact.documentStatus !== 'VALIDATED') {
            throw new GuardianError_1.GuardianError('GS-02: Document must be validated');
        }
        if (!fact.documentId) {
            throw new GuardianError_1.GuardianError('GS-02: DocumentId is mandatory');
        }
    }
    assertActorPresent(ctx) {
        if (!ctx.actorId) {
            throw new GuardianError_1.GuardianError('GS-03: actorId is mandatory');
        }
    }
    assertNonZeroQuantity(fact) {
        if (fact.quantity === 0) {
            throw new GuardianError_1.GuardianError('GS-04: Quantity must be non-zero');
        }
    }
    assertNoNegativeStock(fact) {
        if (fact.resultingStock < 0) {
            throw new GuardianError_1.GuardianError('GS-05: Negative stock is forbidden');
        }
    }
    assertProductPresent(fact) {
        if (!fact.productId) {
            throw new GuardianError_1.GuardianError('GS-06: productId is mandatory');
        }
    }
    assertDepotPresent(fact) {
        if (!fact.depotId) {
            throw new GuardianError_1.GuardianError('GS-07: depotId is mandatory');
        }
    }
    assertLotsIfRequired(fact) {
        // lots optionnels par contrat — s'ils sont présents, ils doivent être non vides
        if (fact.lots && fact.lots.length === 0) {
            throw new GuardianError_1.GuardianError('GS-08: Lots provided but empty');
        }
    }
    assertTransferConsistency(fact) {
        if (fact.movementType === 'TRANSFER') {
            if (!fact.targetDepotId) {
                throw new GuardianError_1.GuardianError('GS-09: targetDepotId is required for transfer');
            }
            if (fact.targetDepotId === fact.depotId) {
                throw new GuardianError_1.GuardianError('GS-09: source and target depots must differ');
            }
        }
    }
    assertNoFinancialFields(fact) {
        const forbiddenKeys = [
            'unitCost',
            'totalCost',
            'valuation',
            'currency',
            'account',
        ];
        for (const key of forbiddenKeys) {
            if (fact[key] !== undefined) {
                throw new GuardianError_1.GuardianError(`GS-11/12: Financial field "${key}" is forbidden in Stock module`);
            }
        }
    }
}
exports.StockGuardian = StockGuardian;
//# sourceMappingURL=StockGuardian.js.map