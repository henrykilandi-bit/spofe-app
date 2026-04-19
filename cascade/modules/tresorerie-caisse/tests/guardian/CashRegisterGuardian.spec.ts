import { describe, it, expect } from "vitest";
import {
  CashRegisterGuardian,
  GuardianError
} from "../../src/domain/guardian/CashRegisterGuardian";

describe("GUARDIAN — Trésorerie Caisse", () => {
  const guardian = new CashRegisterGuardian();

  const baseContext = {
    tenantId: "tenant-1",
    actorId: "actor-1",
    cashRegisterId: "CR-001",
    document: {
      id: "DOC-001",
      status: "SIGNED"
    }
  };

  // G01 — Caisse existante
  it("G01 — accepte une caisse existante", () => {
    expect(() =>
      guardian.assertCashRegisterExists({ exists: true })
    ).not.toThrow();
  });

  it("G01 — rejette une caisse inexistante", () => {
    expect(() =>
      guardian.assertCashRegisterExists({ exists: false })
    ).toThrow(GuardianError);
  });

  // G02 — Caisse ouverte
  it("G02 — accepte une caisse ouverte", () => {
    expect(() =>
      guardian.assertCashRegisterOpen({ isOpen: true })
    ).not.toThrow();
  });

  it("G02 — rejette une caisse fermée", () => {
    expect(() =>
      guardian.assertCashRegisterOpen({ isOpen: false })
    ).toThrow(GuardianError);
  });

  // G03 — Unicité ouverture
  it("G03 — accepte une ouverture unique", () => {
    expect(() =>
      guardian.assertNoActiveOpening({ hasActiveOpening: false })
    ).not.toThrow();
  });

  it("G03 — rejette une double ouverture", () => {
    expect(() =>
      guardian.assertNoActiveOpening({ hasActiveOpening: true })
    ).toThrow(GuardianError);
  });

  // G04 — Document signé
  it("G04 — accepte un document signé", () => {
    expect(() =>
      guardian.assertSignedDocument({ status: "SIGNED" })
    ).not.toThrow();
  });

  it("G04 — rejette un document non signé", () => {
    expect(() =>
      guardian.assertSignedDocument({ status: "DRAFT" })
    ).toThrow(GuardianError);
  });

  // G05 — Actor identifié
  it("G05 — accepte un actorId présent", () => {
    expect(() =>
      guardian.assertActorIdentified({ actorId: "actor-1" })
    ).not.toThrow();
  });

  it("G05 — rejette une opération sans actorId", () => {
    expect(() =>
      guardian.assertActorIdentified({ actorId: undefined })
    ).toThrow(GuardianError);
  });

  // G06 — Séquentialité
  it("G06 — accepte un mouvement avant clôture", () => {
    expect(() =>
      guardian.assertBeforeClosure({ isClosed: false })
    ).not.toThrow();
  });

  it("G06 — rejette un mouvement après clôture", () => {
    expect(() =>
      guardian.assertBeforeClosure({ isClosed: true })
    ).toThrow(GuardianError);
  });

  // G07 — Période verrouillée
  it("G07 — accepte une période non verrouillée", () => {
    expect(() =>
      guardian.assertPeriodNotLocked({ locked: false })
    ).not.toThrow();
  });

  it("G07 — rejette une période verrouillée", () => {
    expect(() =>
      guardian.assertPeriodNotLocked({ locked: true })
    ).toThrow(GuardianError);
  });

  // G08 — Mouvement valide
  it("G08 — accepte un mouvement valide", () => {
    expect(() =>
      guardian.assertValidMovement({ type: "IN", amount: 100 })
    ).not.toThrow();
  });

  it("G08 — rejette un montant négatif", () => {
    expect(() =>
      guardian.assertValidMovement({ type: "OUT", amount: -50 })
    ).toThrow(GuardianError);
  });

  // G09 — Écart uniquement à la clôture
  it("G09 — accepte un écart lors de la clôture", () => {
    expect(() =>
      guardian.assertDiscrepancyAtClosure({ atClosure: true })
    ).not.toThrow();
  });

  it("G09 — rejette un écart hors clôture", () => {
    expect(() =>
      guardian.assertDiscrepancyAtClosure({ atClosure: false })
    ).toThrow(GuardianError);
  });

  // G10 — Isolation tenant
  it("G10 — accepte même tenant", () => {
    expect(() =>
      guardian.assertSameTenant({
        tenantId: "tenant-1",
        documentTenantId: "tenant-1"
      })
    ).not.toThrow();
  });

  it("G10 — rejette cross-tenant", () => {
    expect(() =>
      guardian.assertSameTenant({
        tenantId: "tenant-1",
        documentTenantId: "tenant-2"
      })
    ).toThrow(GuardianError);
  });

  // G11 — Immutabilité
  it("G11 — rejette toute modification post-signature", () => {
    expect(() =>
      guardian.assertImmutable({ signed: true, mutationAttempt: true })
    ).toThrow(GuardianError);
  });

  // G12 — Aucune logique comptable
  it("G12 — rejette toute tentative comptable", () => {
    expect(() =>
      guardian.assertNoAccountingLogic({ hasAccountingData: true })
    ).toThrow(GuardianError);
  });
});
