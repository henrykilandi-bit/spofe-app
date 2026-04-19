import { describe, it, expect } from "@jest/globals";
import { BankGuardian } from "../../src/domain/guardian/BankGuardian";

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
describe("Guardian Trésorerie Banque — SPOFE P0", () => {
  const guardian = new BankGuardian();

  /* ---------------- G01 — Compte bancaire obligatoire ---------------- */
  it("G01 - accepte un fait avec compte bancaire valide", () => {
    expect(() =>
      guardian.assertBankAccountExists({ exists: true })
    ).not.toThrow();
  });

  it("G01 - rejette un fait sans compte bancaire", () => {
    expect(() =>
      guardian.assertBankAccountExists({ exists: false })
    ).toThrow();
  });

  /* ---------------- G02 — Banque obligatoire ---------------- */
  it("G02 - accepte un compte rattaché à une banque", () => {
    expect(() =>
      guardian.assertBankExists({ exists: true })
    ).not.toThrow();
  });

  it("G02 - rejette un compte sans banque", () => {
    expect(() =>
      guardian.assertBankExists({ exists: false })
    ).toThrow();
  });

  /* ---------------- G03 — Isolation par tenant ---------------- */
  it("G03 - accepte un tenant cohérent", () => {
    expect(() =>
      guardian.assertTenantIsolation({ valid: true })
    ).not.toThrow();
  });

  it("G03 - rejette un fait cross-tenant", () => {
    expect(() =>
      guardian.assertTenantIsolation({ valid: false })
    ).toThrow();
  });

  /* ---------------- G04 — Document bancaire obligatoire ---------------- */
  it("G04 - accepte un document bancaire valide", () => {
    expect(() =>
      guardian.assertBankDocumentValid({ valid: true })
    ).not.toThrow();
  });

  it("G04 - rejette un fait sans document bancaire", () => {
    expect(() =>
      guardian.assertBankDocumentValid({ valid: false })
    ).toThrow();
  });

  /* ---------------- G05 — Document bancaire immuable ---------------- */
  it("G05 - accepte un document immuable", () => {
    expect(() =>
      guardian.assertDocumentImmutable({ immutable: true })
    ).not.toThrow();
  });

  it("G05 - rejette une tentative de modification", () => {
    expect(() =>
      guardian.assertDocumentImmutable({ immutable: false })
    ).toThrow();
  });

  /* ---------------- G06 — Faits bancaires constatés uniquement ---------------- */
  it("G06 - accepte un fait bancaire constaté", () => {
    expect(() =>
      guardian.assertFactIsObserved({ observed: true })
    ).not.toThrow();
  });

  it("G06 - rejette un fait bancaire initié", () => {
    expect(() =>
      guardian.assertFactIsObserved({ observed: false })
    ).toThrow();
  });

  /* ---------------- G07 — Absence totale d'interprétation ---------------- */
  it("G07 - accepte un fait sans interprétation", () => {
    expect(() =>
      guardian.assertNoInterpretation({ interpretation: false })
    ).not.toThrow();
  });

  it("G07 - rejette toute tentative d'interprétation", () => {
    expect(() =>
      guardian.assertNoInterpretation({ interpretation: true })
    ).toThrow();
  });

  /* ---------------- G08 — Isolation par compte bancaire ---------------- */
  it("G08 - accepte un fait mono-compte", () => {
    expect(() =>
      guardian.assertSingleBankAccount({ single: true })
    ).not.toThrow();
  });

  it("G08 - rejette un fait multi-comptes", () => {
    expect(() =>
      guardian.assertSingleBankAccount({ single: false })
    ).toThrow();
  });

  /* ---------------- G09 — Temporalité bancaire respectée ---------------- */
  it("G09 - accepte une date bancaire officielle", () => {
    expect(() =>
      guardian.assertBankDateValid({ valid: true })
    ).not.toThrow();
  });

  it("G09 - rejette une date non bancaire", () => {
    expect(() =>
      guardian.assertBankDateValid({ valid: false })
    ).toThrow();
  });

  /* ---------------- G10 — Solde bancaire factuel uniquement ---------------- */
  it("G10 - accepte un solde factuel", () => {
    expect(() =>
      guardian.assertBalanceIsFactual({ factual: true })
    ).not.toThrow();
  });

  it("G10 - rejette un solde calculé", () => {
    expect(() =>
      guardian.assertBalanceIsFactual({ factual: false })
    ).toThrow();
  });

  /* ---------------- G11 — Aucune dépendance inter-module ---------------- */
  it("G11 - accepte une autonomie inter-modules", () => {
    expect(() =>
      guardian.assertNoInterModuleDependency({ hasDependency: false })
    ).not.toThrow();
  });

  it("G11 - rejette une dépendance inter-modules", () => {
    expect(() =>
      guardian.assertNoInterModuleDependency({ hasDependency: true })
    ).toThrow();
  });

  /* ---------------- G12 — Append-only & traçabilité totale ---------------- */
  it("G12 - accepte append-only", () => {
    expect(() =>
      guardian.assertAppendOnly({ appendOnly: true })
    ).not.toThrow();
  });

  it("G12 - rejette toute modification d'historique", () => {
    expect(() =>
      guardian.assertAppendOnly({ appendOnly: false })
    ).toThrow();
  });

  /* ---------------- G13 — Dedup reference externe ---------------- */
  it("G13 - accepte une reference externe unique", () => {
    expect(() =>
      guardian.assertExternalReferenceUnique({ unique: true })
    ).not.toThrow();
  });

  it("G13 - rejette une reference externe deja vue", () => {
    expect(() =>
      guardian.assertExternalReferenceUnique({ unique: false })
    ).toThrow();
  });
});
