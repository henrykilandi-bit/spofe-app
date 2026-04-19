import { describe, test, expect } from '@jest/globals';
import { VenteGuardian } from "../../src/guardian/VenteGuardian";
import { GuardianError } from "../../src/guardian/errors";

const actorOK = {
  actorId: "actor-1",
  tenantId: "tenant-1",
};

describe("Guardian Vente v1.0.0", () => {
  /* =========================
     ACTEUR & TENANT
     ========================= */

  test("reject creation without actor", () => {
    expect(() =>
      VenteGuardian.guardCreateQuote({
        tenantId: "tenant-1",
        source: "SPOFE_INTERNAL",
        actor: null as any,
      })
    ).toThrow("ACTOR_REQUIRED");
  });

  test("reject cross-tenant access", () => {
    expect(() =>
      VenteGuardian.guardCreateQuote({
        tenantId: "tenant-2",
        source: "SPOFE_INTERNAL",
        actor: actorOK,
      })
    ).toThrow("CROSS_TENANT_FORBIDDEN");
  });

  /* =========================
     DOCUMENT SOURCE
     ========================= */

  test("reject external document source", () => {
    expect(() =>
      VenteGuardian.guardCreateQuote({
        tenantId: "tenant-1",
        source: "PDF_IMPORT",
        actor: actorOK,
      })
    ).toThrow("EXTERNAL_DOCUMENT_FORBIDDEN");
  });

  test("accept SPOFE internal document source", () => {
    expect(() =>
      VenteGuardian.guardCreateQuote({
        tenantId: "tenant-1",
        source: "SPOFE_INTERNAL",
        actor: actorOK,
      })
    ).not.toThrow();
  });

  /* =========================
     QUOTE
     ========================= */

  test("reject quote validation if not in DRAFT", () => {
    expect(() =>
      VenteGuardian.guardValidateQuote({
        quoteStatus: "VALIDATED",
        actor: actorOK,
      })
    ).toThrow("INVALID_QUOTE_STATE_TRANSITION");
  });

  test("accept quote validation from DRAFT", () => {
    expect(() =>
      VenteGuardian.guardValidateQuote({
        quoteStatus: "DRAFT",
        actor: actorOK,
      })
    ).not.toThrow();
  });

  /* =========================
     ORDER
     ========================= */

  test("reject order creation without validated quote", () => {
    expect(() =>
      VenteGuardian.guardCreateOrder({
        tenantId: "tenant-1",
        quoteValidated: false,
        actor: actorOK,
      })
    ).toThrow("ORDER_REQUIRES_VALIDATED_QUOTE");
  });

  test("accept order creation with validated quote", () => {
    expect(() =>
      VenteGuardian.guardCreateOrder({
        tenantId: "tenant-1",
        quoteValidated: true,
        actor: actorOK,
      })
    ).not.toThrow();
  });

  /* =========================
     DELIVERY NOTE
     ========================= */

  test("reject delivery note without validated order", () => {
    expect(() =>
      VenteGuardian.guardCreateDeliveryNote({
        tenantId: "tenant-1",
        orderValidated: false,
        actor: actorOK,
      })
    ).toThrow("DELIVERY_REQUIRES_VALIDATED_ORDER");
  });

  test("accept delivery note with validated order", () => {
    expect(() =>
      VenteGuardian.guardCreateDeliveryNote({
        tenantId: "tenant-1",
        orderValidated: true,
        actor: actorOK,
      })
    ).not.toThrow();
  });

  /* =========================
     INVOICE
     ========================= */

  test("reject invoice without order or delivery", () => {
    expect(() =>
      VenteGuardian.guardCreateInvoice({
        tenantId: "tenant-1",
        hasDeliveryOrOrder: false,
        actor: actorOK,
      })
    ).toThrow("INVOICE_REQUIRES_ORDER_OR_DELIVERY");
  });

  test("accept invoice with order or delivery", () => {
    expect(() =>
      VenteGuardian.guardCreateInvoice({
        tenantId: "tenant-1",
        hasDeliveryOrOrder: true,
        actor: actorOK,
      })
    ).not.toThrow();
  });

  /* =========================
     ECONOMIC LOGIC FORBIDDEN
     ========================= */

  test("reject payload containing margin", () => {
    expect(() =>
      VenteGuardian.forbidEconomicLogic({ margin: 10 })
    ).toThrow("ECONOMIC_LOGIC_FORBIDDEN_IN_VENTE");
  });

  test("reject payload containing VAT", () => {
    expect(() =>
      VenteGuardian.forbidEconomicLogic({ vat: 20 })
    ).toThrow("ECONOMIC_LOGIC_FORBIDDEN_IN_VENTE");
  });

  test("accept payload without economic fields", () => {
    expect(() =>
      VenteGuardian.forbidEconomicLogic({ label: "OK" })
    ).not.toThrow();
  });

  /* =========================
     INTER-MODULE WRITE
     ========================= */

  test("reject cross-module write attempt", () => {
    expect(() =>
      VenteGuardian.forbidCrossModuleWrite("stock")
    ).toThrow("INTER_MODULE_WRITE_FORBIDDEN");
  });

  test("accept no cross-module write", () => {
    expect(() =>
      VenteGuardian.forbidCrossModuleWrite()
    ).not.toThrow();
  });
});
