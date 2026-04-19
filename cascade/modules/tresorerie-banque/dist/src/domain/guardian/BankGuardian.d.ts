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
export declare class BankGuardian {
    assertBankAccountExists(input: {
        exists: boolean;
    }): void;
    assertBankExists(input: {
        exists: boolean;
    }): void;
    assertTenantIsolation(input: {
        valid: boolean;
    }): void;
    assertBankDocumentValid(input: {
        valid: boolean;
    }): void;
    assertDocumentImmutable(input: {
        immutable: boolean;
    }): void;
    assertFactIsObserved(input: {
        observed: boolean;
    }): void;
    assertNoInterpretation(input: {
        interpretation: boolean;
    }): void;
    assertSingleBankAccount(input: {
        single: boolean;
    }): void;
    assertBankDateValid(input: {
        valid: boolean;
    }): void;
    assertBalanceIsFactual(input: {
        factual: boolean;
    }): void;
    assertNoInterModuleDependency(input: {
        hasDependency: boolean;
    }): void;
    assertAppendOnly(input: {
        appendOnly: boolean;
    }): void;
}
//# sourceMappingURL=BankGuardian.d.ts.map