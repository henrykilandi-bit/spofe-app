"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankGuardian = void 0;
/**
 * BankGuardian
 * Module : Trésorerie Banque
 * Niveau : SPOFE P0
 *
 * Rôle :
 *  - Garantir l'intégrité factuelle des faits bancaires
 *  - Appliquer strictement les invariants G01 → G12
 *
 * Aucune dépendance externe
 * Aucun effet de bord
 * Aucun état interne
 */
class BankGuardian {
    /* ---------------- G01 ---------------- */
    assertBankAccountExists(input) {
        if (!input.exists) {
            throw new Error("G01_VIOLATION: Bank account does not exist");
        }
    }
    /* ---------------- G02 ---------------- */
    assertBankExists(input) {
        if (!input.exists) {
            throw new Error("G02_VIOLATION: Bank does not exist");
        }
    }
    /* ---------------- G03 ---------------- */
    assertTenantIsolation(input) {
        if (!input.valid) {
            throw new Error("G03_VIOLATION: Cross-tenant operation detected");
        }
    }
    /* ---------------- G04 ---------------- */
    assertBankDocumentValid(input) {
        if (!input.valid) {
            throw new Error("G04_VIOLATION: Invalid or missing bank document");
        }
    }
    /* ---------------- G05 ---------------- */
    assertDocumentImmutable(input) {
        if (!input.immutable) {
            throw new Error("G05_VIOLATION: Bank document is not immutable");
        }
    }
    /* ---------------- G06 ---------------- */
    assertFactIsObserved(input) {
        if (!input.observed) {
            throw new Error("G06_VIOLATION: Bank fact is not observed");
        }
    }
    /* ---------------- G07 ---------------- */
    assertNoInterpretation(input) {
        if (input.interpretation) {
            throw new Error("G07_VIOLATION: Interpretation is forbidden");
        }
    }
    /* ---------------- G08 ---------------- */
    assertSingleBankAccount(input) {
        if (!input.single) {
            throw new Error("G08_VIOLATION: Multi-account operation detected");
        }
    }
    /* ---------------- G09 ---------------- */
    assertBankDateValid(input) {
        if (!input.valid) {
            throw new Error("G09_VIOLATION: Invalid bank date");
        }
    }
    /* ---------------- G10 ---------------- */
    assertBalanceIsFactual(input) {
        if (!input.factual) {
            throw new Error("G10_VIOLATION: Balance is not factual");
        }
    }
    /* ---------------- G11 ---------------- */
    assertNoInterModuleDependency(input) {
        if (input.hasDependency) {
            throw new Error("G11_VIOLATION: Inter-module dependency detected");
        }
    }
    /* ---------------- G12 ---------------- */
    assertAppendOnly(input) {
        if (!input.appendOnly) {
            throw new Error("G12_VIOLATION: Append-only constraint violated");
        }
    }
}
exports.BankGuardian = BankGuardian;
//# sourceMappingURL=BankGuardian.js.map