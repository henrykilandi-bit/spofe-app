import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  RegisterBankAccountHandler,
  RegisterBankDocumentHandler,
  RecordBankDebitHandler,
  RecordBankCreditHandler
} from "../../src/application/handlers";

import { BankGuardian } from "../../src/domain/guardian/BankGuardian";

import {
  BankAccountStateProjection,
  BankJournalProjection,
  BankMovementProjection
} from "../../src/read-models";

import {
  BankAccountStateController,
  BankJournalController,
  BankMovementsController
} from "../../src/api";

import { EventStorePort } from "../../src/application/ports/EventStorePort";
import { BankRepositoryPort } from "../../src/application/ports/BankRepositoryPort";

/**
 * 🧪 TESTS SYSTÈME — TRÉSORERIE BANQUE v1.0.0
 * SPOFE P0 — E2E inter-couches uniquement
 * 
 * Règles P0 :
 * ✅ traversent plusieurs couches
 * ❌ ne testent aucun invariant Guardian (déjà gelé)
 * ❌ ne testent aucune règle métier fine
 * ✅ valident la cohérence globale :
 *    Commande → Handler → Event → Projection → API
 * 
 * Périmètre testé :
 * - enchaînement Application → EventStore → Read-Models → API
 * - respect du document-first
 * - isolation tenant / banque / compte
 * - exposition read-only conforme
 */
describe("SYSTEM E2E — Trésorerie Banque (SPOFE P0)", () => {
  /**
   * S-TB-01 — Cycle bancaire minimal
   * 
   * 1. Création d'un compte bancaire
   * 2. Enregistrement d'un document bancaire
   * 3. Constat d'un débit bancaire
   * 4. Projection des read-models
   * 5. Lecture via API read-only
   * 
   * Résultat attendu :
   * Les vues exposées reflètent exactement les événements émis.
   */
  it("S-TB-01 — cycle bancaire minimal end-to-end", async () => {
    /* ---------------- Infra in-memory ---------------- */
    const events: any[] = [];

    const eventStore: EventStorePort = {
      append: async (event: unknown): Promise<void> => {
        events.push(event);
      }
    };

    const repo: BankRepositoryPort = {
      bankExists: async () => true,
      bankAccountExists: async () => true,
      documentExists: async () => true,
      movementExternalReferenceExists: async () => false
    };

    /* ---------------- Guardian ---------------- */
    const guardian = new BankGuardian();

    /* ---------------- Handlers ---------------- */
    const registerAccount = new RegisterBankAccountHandler(
      guardian,
      repo,
      eventStore
    );

    const registerDocument = new RegisterBankDocumentHandler(
      guardian,
      repo,
      eventStore
    );

    const recordDebit = new RecordBankDebitHandler(
      guardian,
      repo,
      eventStore
    );

    /* ---------------- Commands ---------------- */
    await registerAccount.execute({
      tenantId: "TENANT_1",
      bankId: "BANK_A",
      bankAccountId: "ACC_1",
      currency: "XOF",
      actorId: "SYS"
    });

    await registerDocument.execute({
      tenantId: "TENANT_1",
      bankId: "BANK_A",
      bankAccountId: "ACC_1",
      documentId: "DOC_1",
      documentType: "STATEMENT",
      documentDate: "2024-01-01",
      actorId: "SYS"
    });

    await recordDebit.execute({
      tenantId: "TENANT_1",
      bankId: "BANK_A",
      bankAccountId: "ACC_1",
      externalReference: "REF-T1-D1",
      documentId: "DOC_1",
      amount: 10000,
      bankDate: "2024-01-02",
      actorId: "SYS"
    });

    /* ---------------- Projections ---------------- */
    const stateProjection = new BankAccountStateProjection();
    const journalProjection = new BankJournalProjection();
    const movementProjection = new BankMovementProjection();

    let accountState: any = null;
    const journal: any[] = [];
    const movements: any[] = [];

    for (const event of events) {
      accountState = stateProjection.project(accountState, event);

      const journalEntry = journalProjection.project(event);
      if (journalEntry) journal.push(journalEntry);

      const movement = movementProjection.project(event);
      if (movement) movements.push(movement);
    }

    /* ---------------- Read repo ---------------- */
    const readRepo = {
      getAccounts: async () => [accountState],
      getAccountState: async () => accountState,
      getJournal: async () => journal,
      getMovements: async () => movements,
      getDocuments: async () => [],
      getBalances: async () => []
    };

    /* ---------------- API ---------------- */
    const stateApi = new BankAccountStateController(readRepo);
    const journalApi = new BankJournalController(readRepo);
    const movementsApi = new BankMovementsController(readRepo);

    const state = await stateApi.getState({
      tenantId: "TENANT_1",
      bankId: "BANK_A",
      bankAccountId: "ACC_1"
    });

    const journalResult = await journalApi.getJournal({
      tenantId: "TENANT_1",
      bankId: "BANK_A",
      bankAccountId: "ACC_1"
    });

    const movementsResult = await movementsApi.getMovements({
      tenantId: "TENANT_1",
      bankId: "BANK_A",
      bankAccountId: "ACC_1"
    });

    /* ---------------- Assertions système ---------------- */
    // S-01 : État du compte projeté
    expect(state).not.toBeNull();
    expect(state!.bankAccountId).toBe("ACC_1");
    expect(state!.currency).toBe("XOF");
    expect(state!.status).toBe("ACTIVE");

    // S-02 : Journal alimenté par événements
    expect(journalResult.length).toBeGreaterThan(0);

    // S-03 : Mouvements correctement projetés
    expect(movementsResult.length).toBe(1);
    expect(movementsResult[0].amount).toBe(10000);
    expect(movementsResult[0].type).toBe("DEBIT");
    expect(movementsResult[0].bankAccountId).toBe("ACC_1");

    // S-04 : Isolation tenant respectée
    expect(movementsResult[0].tenantId).toBe("TENANT_1");
    expect(movementsResult[0].bankId).toBe("BANK_A");
  });

  /**
   * S-TB-02 — Cycle crédit bancaire
   */
  it("S-TB-02 — cycle crédit bancaire end-to-end", async () => {
    const events: any[] = [];
    const eventStore: EventStorePort = {
      append: async (e: unknown): Promise<void> => { events.push(e); }
    };
    const repo: BankRepositoryPort = {
      bankExists: async () => true,
      bankAccountExists: async () => true,
      documentExists: async () => true,
      movementExternalReferenceExists: async () => false
    };

    const guardian = new BankGuardian();

    const registerAccount = new RegisterBankAccountHandler(guardian, repo, eventStore);
    const recordCredit = new RecordBankCreditHandler(guardian, repo, eventStore);

    await registerAccount.execute({
      tenantId: "TENANT_2",
      bankId: "BANK_B",
      bankAccountId: "ACC_2",
      currency: "EUR",
      actorId: "SYS"
    });

    await recordCredit.execute({
      tenantId: "TENANT_2",
      bankId: "BANK_B",
      bankAccountId: "ACC_2",
      externalReference: "REF-T2-C1",
      documentId: "DOC_CREDIT",
      amount: 50000,
      bankDate: "2024-02-15",
      actorId: "SYS"
    });

    const movementProjection = new BankMovementProjection();
    const movements: any[] = [];

    for (const event of events) {
      const movement = movementProjection.project(event);
      if (movement) movements.push(movement);
    }

    expect(movements.length).toBe(1);
    expect(movements[0].type).toBe("CREDIT");
    expect(movements[0].amount).toBe(50000);
  });

  /**
   * S-TB-03 — Multi-mouvements sur même compte
   */
  it("S-TB-03 — multi-mouvements sur même compte", async () => {
    const events: any[] = [];
    const eventStore: EventStorePort = {
      append: async (e: unknown): Promise<void> => { events.push(e); }
    };
    const repo: BankRepositoryPort = {
      bankExists: async () => true,
      bankAccountExists: async () => true,
      documentExists: async () => true,
      movementExternalReferenceExists: async () => false
    };

    const guardian = new BankGuardian();

    const registerAccount = new RegisterBankAccountHandler(guardian, repo, eventStore);
    const recordDebit = new RecordBankDebitHandler(guardian, repo, eventStore);
    const recordCredit = new RecordBankCreditHandler(guardian, repo, eventStore);

    await registerAccount.execute({
      tenantId: "TENANT_3",
      bankId: "BANK_C",
      bankAccountId: "ACC_3",
      currency: "XOF",
      actorId: "SYS"
    });

    await recordCredit.execute({
      tenantId: "TENANT_3",
      bankId: "BANK_C",
      bankAccountId: "ACC_3",
      externalReference: "REF-T3-C1",
      documentId: "DOC_C1",
      amount: 100000,
      bankDate: "2024-03-01",
      actorId: "SYS"
    });

    await recordDebit.execute({
      tenantId: "TENANT_3",
      bankId: "BANK_C",
      bankAccountId: "ACC_3",
      externalReference: "REF-T3-D1",
      documentId: "DOC_D1",
      amount: 25000,
      bankDate: "2024-03-02",
      actorId: "SYS"
    });

    await recordDebit.execute({
      tenantId: "TENANT_3",
      bankId: "BANK_C",
      bankAccountId: "ACC_3",
      externalReference: "REF-T3-D2",
      documentId: "DOC_D2",
      amount: 15000,
      bankDate: "2024-03-03",
      actorId: "SYS"
    });

    const movementProjection = new BankMovementProjection();
    const movements: any[] = [];

    for (const event of events) {
      const movement = movementProjection.project(event);
      if (movement) movements.push(movement);
    }

    expect(movements.length).toBe(3);

    const credits = movements.filter(m => m.type === "CREDIT");
    const debits = movements.filter(m => m.type === "DEBIT");

    expect(credits.length).toBe(1);
    expect(debits.length).toBe(2);
  });

  /**
   * S-TB-04 — Dedup external reference (import bank)
   */
  it("S-TB-04 — import R1 -> rejet R1 bis -> import R2", async () => {
    const events: any[] = [];
    const seenByAccount = new Map<string, Set<string>>();

    const eventStore: EventStorePort = {
      append: async (e: unknown): Promise<void> => {
        const event = e as { bankAccountId: string; externalReference?: string };
        if (event.externalReference) {
          const set = seenByAccount.get(event.bankAccountId) ?? new Set<string>();
          set.add(event.externalReference);
          seenByAccount.set(event.bankAccountId, set);
        }
        events.push(e);
      }
    };

    const repo: BankRepositoryPort = {
      bankExists: async () => true,
      bankAccountExists: async () => true,
      documentExists: async () => true,
      movementExternalReferenceExists: async (bankAccountId: string, externalReference: string) =>
        seenByAccount.get(bankAccountId)?.has(externalReference) ?? false
    };

    const guardian = new BankGuardian();
    const registerAccount = new RegisterBankAccountHandler(guardian, repo, eventStore);
    const recordCredit = new RecordBankCreditHandler(guardian, repo, eventStore);

    await registerAccount.execute({
      tenantId: "TENANT_4",
      bankId: "BANK_D",
      bankAccountId: "ACC_4",
      currency: "XOF",
      actorId: "SYS"
    });

    await recordCredit.execute({
      tenantId: "TENANT_4",
      bankId: "BANK_D",
      bankAccountId: "ACC_4",
      externalReference: "R1",
      documentId: "DOC-R1",
      amount: 1000,
      bankDate: "2024-04-01",
      actorId: "SYS"
    });

    await expect(
      recordCredit.execute({
        tenantId: "TENANT_4",
        bankId: "BANK_D",
        bankAccountId: "ACC_4",
        externalReference: "R1",
        documentId: "DOC-R1BIS",
        amount: 1000,
        bankDate: "2024-04-01",
        actorId: "SYS"
      })
    ).rejects.toThrow("G13_VIOLATION");

    await recordCredit.execute({
      tenantId: "TENANT_4",
      bankId: "BANK_D",
      bankAccountId: "ACC_4",
      externalReference: "R2",
      documentId: "DOC-R2",
      amount: 2000,
      bankDate: "2024-04-02",
      actorId: "SYS"
    });

    const movementProjection = new BankMovementProjection();
    const movements: any[] = [];

    for (const event of events) {
      const movement = movementProjection.project(event);
      if (movement) {
        movements.push(movement);
      }
    }

    expect(movements).toHaveLength(2);
    expect(movements.map(m => m.externalReference)).toEqual(["R1", "R2"]);
  });
});
