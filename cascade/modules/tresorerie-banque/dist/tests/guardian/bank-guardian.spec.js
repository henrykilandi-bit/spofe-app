"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const BankGuardian_1 = require("../../src/domain/guardian/BankGuardian");
/**
 * 🧪 TESTS GUARDIAN — TRÉSORERIE BANQUE v1.0.0
 * SPOFE P0 — Guardian-first
 *
 * Règles :
 * ❌ aucun handler
 * ❌ aucun event store
 * ❌ aucun read-model
 * ✅ uniquement le Guardian
 * ✅ assertions métier pures
 * ✅ erreurs attendues sur rejet
 *
 * 👉 24 tests Guardian → couverture complète P0
 */
(0, vitest_1.describe)("Guardian Trésorerie Banque — SPOFE P0", () => {
    const guardian = new BankGuardian_1.BankGuardian();
    /* ---------------- G01 — Compte bancaire obligatoire ---------------- */
    (0, vitest_1.it)("G01 - accepte un fait avec compte bancaire valide", () => {
        (0, vitest_1.expect)(() => guardian.assertBankAccountExists({ exists: true })).not.toThrow();
    });
    (0, vitest_1.it)("G01 - rejette un fait sans compte bancaire", () => {
        (0, vitest_1.expect)(() => guardian.assertBankAccountExists({ exists: false })).toThrow();
    });
    /* ---------------- G02 — Banque obligatoire ---------------- */
    (0, vitest_1.it)("G02 - accepte un compte rattaché à une banque", () => {
        (0, vitest_1.expect)(() => guardian.assertBankExists({ exists: true })).not.toThrow();
    });
    (0, vitest_1.it)("G02 - rejette un compte sans banque", () => {
        (0, vitest_1.expect)(() => guardian.assertBankExists({ exists: false })).toThrow();
    });
    /* ---------------- G03 — Isolation par tenant ---------------- */
    (0, vitest_1.it)("G03 - accepte un tenant cohérent", () => {
        (0, vitest_1.expect)(() => guardian.assertTenantIsolation({ valid: true })).not.toThrow();
    });
    (0, vitest_1.it)("G03 - rejette un fait cross-tenant", () => {
        (0, vitest_1.expect)(() => guardian.assertTenantIsolation({ valid: false })).toThrow();
    });
    /* ---------------- G04 — Document bancaire obligatoire ---------------- */
    (0, vitest_1.it)("G04 - accepte un document bancaire valide", () => {
        (0, vitest_1.expect)(() => guardian.assertBankDocumentValid({ valid: true })).not.toThrow();
    });
    (0, vitest_1.it)("G04 - rejette un fait sans document bancaire", () => {
        (0, vitest_1.expect)(() => guardian.assertBankDocumentValid({ valid: false })).toThrow();
    });
    /* ---------------- G05 — Document bancaire immuable ---------------- */
    (0, vitest_1.it)("G05 - accepte un document immuable", () => {
        (0, vitest_1.expect)(() => guardian.assertDocumentImmutable({ immutable: true })).not.toThrow();
    });
    (0, vitest_1.it)("G05 - rejette une tentative de modification", () => {
        (0, vitest_1.expect)(() => guardian.assertDocumentImmutable({ immutable: false })).toThrow();
    });
    /* ---------------- G06 — Faits bancaires constatés uniquement ---------------- */
    (0, vitest_1.it)("G06 - accepte un fait bancaire constaté", () => {
        (0, vitest_1.expect)(() => guardian.assertFactIsObserved({ observed: true })).not.toThrow();
    });
    (0, vitest_1.it)("G06 - rejette un fait bancaire initié", () => {
        (0, vitest_1.expect)(() => guardian.assertFactIsObserved({ observed: false })).toThrow();
    });
    /* ---------------- G07 — Absence totale d'interprétation ---------------- */
    (0, vitest_1.it)("G07 - accepte un fait sans interprétation", () => {
        (0, vitest_1.expect)(() => guardian.assertNoInterpretation({ interpretation: false })).not.toThrow();
    });
    (0, vitest_1.it)("G07 - rejette toute tentative d'interprétation", () => {
        (0, vitest_1.expect)(() => guardian.assertNoInterpretation({ interpretation: true })).toThrow();
    });
    /* ---------------- G08 — Isolation par compte bancaire ---------------- */
    (0, vitest_1.it)("G08 - accepte un fait mono-compte", () => {
        (0, vitest_1.expect)(() => guardian.assertSingleBankAccount({ single: true })).not.toThrow();
    });
    (0, vitest_1.it)("G08 - rejette un fait multi-comptes", () => {
        (0, vitest_1.expect)(() => guardian.assertSingleBankAccount({ single: false })).toThrow();
    });
    /* ---------------- G09 — Temporalité bancaire respectée ---------------- */
    (0, vitest_1.it)("G09 - accepte une date bancaire officielle", () => {
        (0, vitest_1.expect)(() => guardian.assertBankDateValid({ valid: true })).not.toThrow();
    });
    (0, vitest_1.it)("G09 - rejette une date non bancaire", () => {
        (0, vitest_1.expect)(() => guardian.assertBankDateValid({ valid: false })).toThrow();
    });
    /* ---------------- G10 — Solde bancaire factuel uniquement ---------------- */
    (0, vitest_1.it)("G10 - accepte un solde factuel", () => {
        (0, vitest_1.expect)(() => guardian.assertBalanceIsFactual({ factual: true })).not.toThrow();
    });
    (0, vitest_1.it)("G10 - rejette un solde calculé", () => {
        (0, vitest_1.expect)(() => guardian.assertBalanceIsFactual({ factual: false })).toThrow();
    });
    /* ---------------- G11 — Aucune dépendance inter-module ---------------- */
    (0, vitest_1.it)("G11 - accepte une autonomie inter-modules", () => {
        (0, vitest_1.expect)(() => guardian.assertNoInterModuleDependency({ hasDependency: false })).not.toThrow();
    });
    (0, vitest_1.it)("G11 - rejette une dépendance inter-modules", () => {
        (0, vitest_1.expect)(() => guardian.assertNoInterModuleDependency({ hasDependency: true })).toThrow();
    });
    /* ---------------- G12 — Append-only & traçabilité totale ---------------- */
    (0, vitest_1.it)("G12 - accepte append-only", () => {
        (0, vitest_1.expect)(() => guardian.assertAppendOnly({ appendOnly: true })).not.toThrow();
    });
    (0, vitest_1.it)("G12 - rejette toute modification d'historique", () => {
        (0, vitest_1.expect)(() => guardian.assertAppendOnly({ appendOnly: false })).toThrow();
    });
});
//# sourceMappingURL=bank-guardian.spec.js.map