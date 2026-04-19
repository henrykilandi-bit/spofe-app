import { describe, it, expect } from "vitest";

import {
  OpenCashRegisterHandler,
  RecordCashMovementHandler,
  CloseCashRegisterHandler
} from "../../src/application/handlers";

import {
  CashJournalController,
  CashRegisterStateController
} from "../../src/api";

import { CashRegisterGuardian } from "../../src/domain/guardian/CashRegisterGuardian";

/* ---------------- INFRA IN-MEMORY ---------------- */

const events: any[] = [];

const eventStore = {
  async append(event: any) {
    events.push(event);
  }
};

const cashRegisterRepo = {
  exists: async () => true,
  isOpen: async () => events.some(e => e.type === "CashRegisterOpened") &&
                     !events.some(e => e.type === "CashRegisterClosed"),
  hasActiveOpening: async () => events.some(e => e.type === "CashRegisterOpened"),
  isPeriodLocked: async () => false
};

const readRepo = {
  async getJournal() {
    return events.map(e => ({
      tenantId: e.tenantId,
      cashRegisterId: e.cashRegisterId,
      eventType: e.type,
      amount: e.amount,
      actorId: e.actorId,
      documentId: e.documentId,
      occurredAt: e.recordedAt || e.openedAt || e.closedAt
    }));
  },

  async getState() {
    const opened = events.find(e => e.type === "CashRegisterOpened");
    const closed = events.find(e => e.type === "CashRegisterClosed");

    let total = opened.openingAmount;
    events
      .filter(e => e.type === "CashMovementRecorded")
      .forEach(e => {
        total += e.movementType === "IN" ? e.amount : -e.amount;
      });

    return {
      tenantId: opened.tenantId,
      cashRegisterId: opened.cashRegisterId,
      status: closed ? "CLOSED" : "OPEN",
      openingAmount: opened.openingAmount,
      currentTheoreticalAmount: total
    };
  },

  async getSessions() { return []; },
  async getMovements() { return []; },
  async getDiscrepancies() { return []; }
};

/* ---------------- TEST ---------------- */

describe("SYSTEM E2E — Trésorerie Caisse", () => {
  const guardian = new CashRegisterGuardian();

  const openHandler = new OpenCashRegisterHandler(
    guardian,
    cashRegisterRepo,
    eventStore
  );

  const movementHandler = new RecordCashMovementHandler(
    guardian,
    cashRegisterRepo,
    eventStore
  );

  const closeHandler = new CloseCashRegisterHandler(
    guardian,
    cashRegisterRepo,
    eventStore
  );

  const journalApi = new CashJournalController(readRepo as any);
  const stateApi = new CashRegisterStateController(readRepo as any);

  it("flux nominal complet caisse", async () => {
    // Reset events pour ce test
    events.length = 0;

    await openHandler.execute({
      tenantId: "T1",
      actorId: "A1",
      cashRegisterId: "CR-1",
      openingAmount: 10000,
      documentId: "DOC-OPEN"
    });

    await movementHandler.execute({
      tenantId: "T1",
      actorId: "A1",
      cashRegisterId: "CR-1",
      movementType: "IN",
      amount: 2500,
      documentId: "DOC-IN"
    });

    await closeHandler.execute({
      tenantId: "T1",
      actorId: "A1",
      cashRegisterId: "CR-1",
      theoreticalAmount: 12500,
      realAmount: 12500,
      documentId: "DOC-CLOSE"
    });

    const journal = await journalApi.getJournal({});
    const state = await stateApi.getState("CR-1");

    expect(journal.length).toBe(3);
    expect(state?.status).toBe("CLOSED");
    expect(state?.currentTheoreticalAmount).toBe(12500);
  });

  it("rejette un mouvement sans ouverture (Guardian)", async () => {
    // Reset events pour ce test
    events.length = 0;

    await expect(
      movementHandler.execute({
        tenantId: "T1",
        actorId: "A1",
        cashRegisterId: "CR-2",
        movementType: "IN",
        amount: 1000,
        documentId: "DOC-FAIL"
      })
    ).rejects.toBeDefined();
  });

  it("rejette une double ouverture (Guardian)", async () => {
    // Reset events pour ce test
    events.length = 0;

    await openHandler.execute({
      tenantId: "T1",
      actorId: "A1",
      cashRegisterId: "CR-3",
      openingAmount: 5000,
      documentId: "DOC-OPEN-1"
    });

    await expect(
      openHandler.execute({
        tenantId: "T1",
        actorId: "A1",
        cashRegisterId: "CR-3",
        openingAmount: 3000,
        documentId: "DOC-OPEN-2"
      })
    ).rejects.toBeDefined();
  });

  it("rejette un mouvement négatif (Guardian)", async () => {
    // Reset events pour ce test
    events.length = 0;

    await openHandler.execute({
      tenantId: "T1",
      actorId: "A1",
      cashRegisterId: "CR-4",
      openingAmount: 1000,
      documentId: "DOC-OPEN"
    });

    await expect(
      movementHandler.execute({
        tenantId: "T1",
        actorId: "A1",
        cashRegisterId: "CR-4",
        movementType: "OUT",
        amount: -500,
        documentId: "DOC-INVALID"
      })
    ).rejects.toBeDefined();
  });
});